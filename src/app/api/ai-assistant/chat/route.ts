import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { chatMessageSchema } from '@/lib/validators/ai-assistant';
import { checkRateLimit, MAX_REQUESTS } from '@/lib/rate-limiter';
import { ZodError } from 'zod';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function POST(req: Request) {
  try {
    // 1. Get user session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Check rate limit
    const rateLimitResult = await checkRateLimit(session.user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          reset: rateLimitResult.reset,
          remaining: rateLimitResult.remaining,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          },
        }
      );
    }

    // 3. Validate request body
    const body = await req.json();
    const validatedData = await chatMessageSchema.parseAsync(body);

    // 4. Check API key
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'Deepseek API key not configured' },
        { status: 500 }
      );
    }

    // 5. Prepare response stream
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start streaming response
    const streamResponse = async () => {
      try {
        // TODO: Replace with actual Deepseek API call
        const mockResponse = `This is a mock response to your message: "${validatedData.message}"${
          validatedData.context ? ` regarding ${validatedData.context}` : ''
        }. The actual Deepseek API integration will be implemented once the API key is provided.`;

        // Simulate streaming by sending chunks
        const chunks = mockResponse.split(' ');
        for (const chunk of chunks) {
          await writer.write(
            encoder.encode(`data: ${JSON.stringify({ content: chunk + ' ' })}\n\n`)
          );
          await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
        }

        // Send final message with topic
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({
            content: '',
            topic: validatedData.context || 'General IoT',
            done: true,
          })}\n\n`)
        );
      } catch (error) {
        console.error('Streaming error:', error);
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({
            error: 'Error processing stream',
            done: true,
          })}\n\n`)
        );
      } finally {
        await writer.close();
      }
    };

    // Start streaming in the background
    streamResponse();

    // Return the stream
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in AI chat endpoint:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 