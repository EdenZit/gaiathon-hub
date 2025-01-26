import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { createClient } from 'redis';

const saveCodeSchema = z.object({
  messageId: z.string(),
  content: z.string(),
});

let redisClient: ReturnType<typeof createClient> | null = null;

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL,
    });
    await redisClient.connect();
  }
  return redisClient;
}

function extractCodeSnippets(content: string): { language: string; code: string }[] {
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  const snippets = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    snippets.push({
      language: match[1] || 'text',
      code: match[2].trim(),
    });
  }

  return snippets;
}

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await req.json();
    const validatedData = saveCodeSchema.parse(body);

    // Extract code snippets
    const snippets = extractCodeSnippets(validatedData.content);
    if (snippets.length === 0) {
      return NextResponse.json(
        { error: 'No code snippets found in content' },
        { status: 400 }
      );
    }

    // Store code snippets in Redis
    const redis = await getRedisClient();
    const userSnippetsKey = `code_snippets:${session.user.id}`;
    
    // Get current snippets count
    const currentCount = await redis.lLen(userSnippetsKey);
    const maxSnippets = 100; // Limit to 100 saved snippets per user
    
    if (currentCount >= maxSnippets) {
      return NextResponse.json(
        { error: 'Maximum number of saved snippets reached' },
        { status: 400 }
      );
    }

    // Save each snippet
    for (const snippet of snippets) {
      const snippetData = {
        messageId: validatedData.messageId,
        language: snippet.language,
        code: snippet.code,
        savedAt: new Date().toISOString(),
      };

      await redis.lPush(userSnippetsKey, JSON.stringify(snippetData));
    }

    // Set expiration to 30 days from last save
    await redis.expire(userSnippetsKey, 30 * 24 * 60 * 60);

    return NextResponse.json({
      success: true,
      savedSnippets: snippets.length,
    });
  } catch (error) {
    console.error('Error saving code snippets:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 