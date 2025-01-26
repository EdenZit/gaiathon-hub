import { OpenAIMessage, OpenAIChatRequest } from '@/types/openai';

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const OPENAI_API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
export const WEEKLY_TOKEN_LIMIT = 100000;

const CODE_KEYWORDS = [
  'code',
  'function',
  'programming',
  'debug',
  'error',
  'typescript',
  'javascript',
  'python',
  'java',
  'c++',
  'ruby',
  'php',
  'sql',
  'html',
  'css',
  'api',
  'database',
  'algorithm',
  'bug',
  'compiler',
  'runtime',
  'syntax',
  'framework',
  'library',
  'package',
  'module',
  'class',
  'object',
  'method',
  'variable',
  'git',
];

export function isCodeRelatedQuery(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return CODE_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
}

export function getSystemPrompt(isCodeQuery: boolean): string {
  if (isCodeQuery) {
    return `You are a knowledgeable software development assistant. Provide clear, concise explanations and practical code examples. Focus on best practices, maintainability, and performance. When showing code, include necessary imports and context. Format code blocks with appropriate language tags.`;
  }
  return `You are a helpful Earth Observation assistant. Provide clear, concise explanations about satellite data, remote sensing, and geospatial analysis. Focus on practical applications and real-world examples. When relevant, suggest tools and resources for further exploration.`;
}

export async function callOpenAIAPI(
  messages: OpenAIMessage[],
  isCodeQuery: boolean,
  stream = true
): Promise<Response> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('Calling OpenAI API:', {
    url: OPENAI_API_URL,
    model: isCodeQuery ? 'gpt-4' : 'gpt-3.5-turbo',
    messageCount: messages.length,
  });

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: isCodeQuery ? 'gpt-4' : 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        stream,
      } as OpenAIChatRequest),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

export function parseStreamingResponse(chunk: string): {
  content?: string;
  done: boolean;
  error?: string;
} {
  try {
    if (chunk.includes('[DONE]')) {
      return { done: true };
    }

    const lines = chunk.split('\n').filter(line => line.trim() !== '');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          return { done: true };
        }
        
        try {
          const parsed = JSON.parse(data);
          if (parsed.choices?.[0]?.delta?.content) {
            // Return the raw content - we'll clean it in the UI
            return { 
              content: parsed.choices[0].delta.content,
              done: false 
            };
          }
        } catch (e) {
          console.error('Error parsing streaming response:', e);
        }
      }
    }
    
    return { done: false };
  } catch (error) {
    console.error('Error in parseStreamingResponse:', error);
    return { done: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Move cleaning logic to a separate export
export function cleanFullResponse(text: string): string {
  // First, normalize whitespace and fix basic formatting
  let cleaned = text
    .replace(/\s+/g, ' ')
    .trim();
    
  // Fix concatenated words by adding spaces between them
  cleaned = cleaned.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  // Remove duplicate adjacent words
  cleaned = cleaned.replace(/\b(\w+)\s+\1\b/gi, '$1');
  
  // Fix spacing around punctuation
  cleaned = cleaned
    .replace(/\s*([.,!?])\s*/g, '$1 ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleaned;
}

export function formatCodeResponse(content: string): string {
  // Clean up any duplicate words that might appear
  content = content.replace(/\b(\w+)\s+\1\b/gi, '$1');
  
  // Handle code blocks with language specification
  content = content.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    (_, lang, code) => {
      const language = lang || 'plaintext';
      return `<pre><code class="language-${language}">${code.trim()}</code></pre>`;
    }
  );
  
  // Handle inline code
  content = content.replace(
    /`([^`]+)`/g,
    '<code>$1</code>'
  );
  
  return content;
}

export function exportChatMessages(messages: OpenAIMessage[]): string {
  return messages
    .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join('\n\n---\n\n');
} 