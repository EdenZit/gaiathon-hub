import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { 
  messageSchema,
  TopicCategory,
  MessageAnalytics
} from '@/types/ai-assistant';
import {
  callOpenAI,
  parseStreamingResponse,
  cleanResponse
} from '@/lib/services/ai-assistant';
import {
  checkRateLimit,
  getRateLimitInfo,
  logAnalytics
} from '@/lib/services/redis';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check rate limit
    const userId = session.user.id as string;
    const withinLimit = await checkRateLimit(userId);
    
    if (!withinLimit) {
      const limitInfo = await getRateLimitInfo(userId);
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          details: limitInfo
        },
        { status: 429 }
      );
    }

    // Validate request body
    const body = await request.json();
    let validatedData;
    try {
      validatedData = messageSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Invalid request format',
            details: error.errors
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Start analytics timing
    const startTime = Date.now();

    // Determine message category
    const category = validatedData.context?.category || TopicCategory.SATELLITE_DATA;

    // Call OpenAI API
    const response = await callOpenAI(
      validatedData.content,
      category,
      validatedData.context
    );

    // Prepare streaming response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Process the streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response stream available');
    }

    // Handle the stream
    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            await writer.close();
            break;
          }

          const chunk = new TextDecoder().decode(value);
          const result = parseStreamingResponse(chunk);

          if (result.error) {
            const errorChunk = encoder.encode(
              `data: ${JSON.stringify({ error: result.error })}\n\n`
            );
            await writer.write(errorChunk);
            continue;
          }

          if (result.content) {
            const cleaned = cleanResponse(result.content);
            const dataChunk = encoder.encode(
              `data: ${JSON.stringify({ content: cleaned })}\n\n`
            );
            await writer.write(dataChunk);
          }
        }

        // Log analytics after successful completion
        await logAnalytics({
          userId,
          messageId: crypto.randomUUID(),
          timestamp: new Date(),
          category,
          responseTime: Date.now() - startTime,
          errorOccurred: false
        });
      } catch (error) {
        console.error('Error processing stream:', error);
        const errorChunk = encoder.encode(
          `data: ${JSON.stringify({ 
            error: 'Error processing response stream' 
          })}\n\n`
        );
        await writer.write(errorChunk);
        await writer.close();

        // Log error analytics
        await logAnalytics({
          userId,
          messageId: crypto.randomUUID(),
          timestamp: new Date(),
          category,
          responseTime: Date.now() - startTime,
          errorOccurred: true
        });
      }
    })();

    return new NextResponse(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 