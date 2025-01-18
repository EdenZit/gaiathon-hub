import { DeepseekMessage } from '@/types/deepseek';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';

export const WEEKLY_TOKEN_LIMIT = 100000;

export function getSystemPrompt(isCodeQuery: boolean): string {
  if (isCodeQuery) {
    return `You are a coding assistant. Provide clear, concise responses:
- Write clean, minimal code examples
- Use proper technical terms
- Include brief comments
- Focus on practical solutions
- Format code with proper syntax highlighting`;
  }

  return `You are an Earth Observation expert. Respond in this exact format:
"Earth Observation is [single clear definition]."

Rules:
1. Only ONE sentence
2. Start with "Earth Observation is"
3. No repeated words
4. Use proper technical terms
5. Maximum 20 words
6. Focus on the core concept`;
}

export async function callDeepseekAPI(
  messages: DeepseekMessage[],
  isCodeQuery: boolean,
  stream = true
): Promise<Response> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('Deepseek API key not configured');
  }

  const request = {
    model: isCodeQuery ? 'deepseek-coder-33b-instruct' : 'deepseek-chat',
    messages: [
      { role: 'system', content: getSystemPrompt(isCodeQuery) },
      ...messages
    ],
    temperature: 0.3, // Lower temperature for more focused responses
    top_p: 0.95,
    stream,
    max_tokens: 1000,
  };

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

export function parseStreamingResponse(chunk: string): {
  content?: string;
  error?: string;
  done?: boolean;
} {
  try {
    const cleanChunk = chunk.startsWith('data: ') ? chunk.slice(6) : chunk;
    
    if (cleanChunk.trim() === '[DONE]') {
      return { done: true };
    }

    try {
      const data = JSON.parse(cleanChunk);
      
      if (data.error) {
        return { error: data.error.message || 'Unknown error' };
      }

      if (data.choices?.[0]?.delta?.content) {
        const content = data.choices[0].delta.content;
        // Only clean complete words or sentences
        if (content.includes(' ') || content.includes('.')) {
          return { content: cleanResponse(content) };
        }
        return { content };
      }

      if (data.choices?.[0]?.finish_reason === 'stop') {
        return { done: true };
      }
    } catch (parseError) {
      return {};
    }

    return {};
  } catch (error) {
    console.error('Error parsing response:', error);
    return { error: 'Failed to parse response' };
  }
}

export function cleanResponse(content: string): string {
  if (!content) return '';

  // Handle streaming chunks better
  const cleaned = content
    // Remove any JSON artifacts
    .replace(/"[^"]*":\s*|[{}\[\]"]/g, '')
    .replace(/null|undefined/g, '')
    // Fix spacing between words
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-zA-Z])/g, '$1 $2')
    // Remove duplicate words
    .replace(/\b(\w+)(\s+\1)+\b/gi, '$1')
    // Fix technical terms
    .replace(/\b(earth observation)\b/gi, 'Earth Observation')
    .replace(/\b(remote sensing)\b/gi, 'Remote Sensing')
    // Clean up spacing
    .replace(/\s+/g, ' ')
    .trim();

  // If it's a complete sentence, ensure proper capitalization and punctuation
  if (/^[A-Z].*[^.!?]$/.test(cleaned)) {
    return cleaned + '.';
  }

  return cleaned;
}

export function formatResponse(content: string): string {
  if (!content.trim()) return '';

  // Clean the content first
  content = cleanResponse(content);

  // Handle code blocks first
  if (content.includes('```')) {
    return content
      .split('```')
      .map((part, i) => {
        if (i % 2 === 0) {
          // Text content
          return part.trim();
        } else {
          // Code block
          const [lang, ...code] = part.split('\n');
          return `\`\`\`${lang}\n${code.join('\n')}\`\`\``;
        }
      })
      .join('\n\n');
  }

  // Regular text formatting
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .join('\n');
}

export function formatChatExport(messages: Array<{ content: string; isUser: boolean; timestamp: Date }>): string {
  return messages
    .map(msg => {
      const role = msg.isUser ? 'User' : 'Assistant';
      const time = msg.timestamp.toLocaleTimeString();
      const content = formatResponse(msg.content);
      return `[${time}] ${role}:\n${content}\n`;
    })
    .join('\n');
}

export function isCodeRelatedQuery(message: string): boolean {
  const codeKeywords = [
    'code', 'function', 'class', 'method',
    'implementation', 'bug', 'error',
    'programming', 'syntax', 'compile',
    'debug', 'algorithm', 'api',
  ];
  
  return codeKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );
}

export function formatCodeResponse(content: string): string {
  // Use the new formatResponse function internally
  const formatted = formatResponse(content);

  // Add HTML styling for the UI
  if (formatted.includes('```')) {
    return formatted
      .split('```')
      .map((part, i) => {
        if (i % 2 === 0) {
          // Text content - wrap in prose div
          return part.trim() ? 
            `<div class="prose prose-lg prose-slate max-w-none leading-relaxed mb-4">${part.trim()}</div>` : 
            '';
        } else {
          // Code block - wrap in styled pre/code
          const [lang, ...code] = part.split('\n');
          return `
            <div class="relative my-6">
              <div class="absolute right-3 top-3 flex items-center space-x-2">
                <span class="text-xs font-mono text-gray-400">${lang || 'text'}</span>
              </div>
              <pre class="rounded-lg bg-gray-900 p-4 overflow-x-auto">
                <code class="language-${lang || 'text'} text-sm text-gray-100">${code.join('\n').trim()}</code>
              </pre>
            </div>`;
        }
      })
      .join('\n');
  }

  // Regular text - just wrap in prose div
  return `<div class="prose prose-lg prose-slate max-w-none leading-relaxed mb-4">${formatted}</div>`;
} 