import { 
  Message, 
  TopicCategory,
  AIAssistantError
} from '@/types/ai-assistant';
import {
  OpenAIMessage,
  OpenAIChatRequest,
  OpenAIChatResponse,
  OpenAIError
} from '@/types/openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4';
const DEFAULT_TEMPERATURE = 0.7;
const MAX_TOKENS = 4000;

// Domain-specific prompts
const SYSTEM_PROMPTS: Record<TopicCategory, string> = {
  satellite_data: `You are an expert in satellite data analysis for Earth Observation. Help students understand:
- Different satellite data sources (Sentinel, Landsat, etc.)
- Data formats and processing techniques
- Best practices for satellite data analysis
- Common challenges and solutions
Provide practical examples and reference reliable sources.`,
  
  remote_sensing: `You are a remote sensing specialist helping students understand:
- Remote sensing principles and techniques
- Spectral bands and their applications
- Image processing and analysis methods
- Data interpretation guidelines
Focus on practical applications and real-world examples.`,
  
  iot_sensors: `You are an IoT expert specializing in environmental monitoring. Help students with:
- Sensor types and selection
- Data collection and transmission
- Integration with satellite data
- Best practices for deployment
Emphasize practical implementation and common pitfalls.`,
  
  data_processing: `You are a data processing expert focusing on Earth Observation. Guide students through:
- Data preprocessing techniques
- Quality control methods
- Analysis workflows
- Tool selection and usage
Provide concrete examples and step-by-step guidance.`,
  
  visualization: `You are a geospatial visualization expert. Help students with:
- Choosing appropriate visualization methods
- Tool selection (GIS, web mapping, etc.)
- Best practices for data presentation
- Interactive visualization techniques
Include examples and practical tips.`,
  
  machine_learning: `You are an AI/ML expert in Earth Observation. Guide students through:
- ML applications in EO
- Model selection and training
- Data preparation techniques
- Validation methods
Focus on practical implementation and real-world examples.`
};

export async function callOpenAI(
  message: string,
  category: TopicCategory,
  context?: { topic?: string; resources?: string[]; userId?: string }
): Promise<Response> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = SYSTEM_PROMPTS[category];
  const messages: OpenAIMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: message }
  ];

  if (context?.topic) {
    messages.push({
      role: 'system',
      content: `Current topic: ${context.topic}`
    });
  }

  const requestBody: OpenAIChatRequest = {
    model: DEFAULT_MODEL,
    messages,
    temperature: DEFAULT_TEMPERATURE,
    max_tokens: MAX_TOKENS,
    stream: true,
    presence_penalty: 0.1,
    frequency_penalty: 0.1,
    user: context?.userId,
  };

  try {
    console.log('OpenAI API Request:', {
      url: OPENAI_API_URL,
      model: requestBody.model,
      messageCount: messages.length,
      systemPrompt: messages[0].content.slice(0, 100) + '...',
      userMessage: message.slice(0, 100) + '...'
    });

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Organization': process.env.OPENAI_ORG_ID || '',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('OpenAI API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorData: OpenAIError = await response.json();
      console.error('OpenAI API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData.error,
        type: errorData.error.type,
        code: errorData.error.code
      });
      throw new Error(errorData.error.message || `OpenAI API error: ${response.statusText}`);
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
  finish_reason?: string;
} {
  try {
    console.log('Processing chunk:', { 
      raw: chunk,
      length: chunk.length,
      isEmpty: !chunk || chunk.trim() === '',
      isDone: chunk.includes('[DONE]')
    });

    // Handle empty chunks
    if (!chunk || chunk.trim() === '') {
      return { done: false };
    }

    // Handle end of stream
    if (chunk.includes('[DONE]')) {
      return { done: true };
    }

    const lines = chunk
      .split('\n')
      .filter(line => line.trim() !== '');
    
    console.log('Processing lines:', {
      count: lines.length,
      lines: lines.map(l => l.slice(0, 50) + '...')
    });

    for (const line of lines) {
      if (!line.startsWith('data: ')) {
        console.log('Skipping non-data line:', line);
        continue;
      }

      const data = line.slice(6);
      
      if (data === '[DONE]') {
        console.log('Stream complete');
        return { done: true };
      }

      try {
        if (!data.trim()) {
          console.log('Empty data, skipping');
          continue;
        }

        console.log('Parsing data:', { raw: data });
        const parsed = JSON.parse(data);
        
        if ('error' in parsed) {
          console.log('Error in response:', parsed.error);
          const errorResponse = parsed as OpenAIError;
          return {
            error: errorResponse.error.message || 'Unknown error',
            done: false
          };
        }

        const chatResponse = parsed as OpenAIChatResponse;
        console.log('Parsed response:', {
          hasChoices: !!chatResponse.choices,
          firstChoice: chatResponse.choices?.[0],
          content: chatResponse.choices?.[0]?.delta?.content,
          finishReason: chatResponse.choices?.[0]?.finish_reason
        });

        if (chatResponse.choices?.[0]?.delta?.content) {
          return { 
            content: chatResponse.choices[0].delta.content,
            done: false,
            finish_reason: chatResponse.choices[0].finish_reason || undefined
          };
        }
      } catch (e) {
        console.error('Error parsing chunk:', {
          error: e,
          data: data,
          isValidJSON: (() => { try { JSON.parse(data); return true; } catch { return false; }})()
        });
        continue;
      }
    }
    
    return { done: false };
  } catch (error) {
    console.error('Stream processing error:', {
      error,
      chunk,
      type: error instanceof Error ? error.constructor.name : typeof error
    });
    return { 
      done: false, 
      error: error instanceof Error ? error.message : 'Unknown error in stream processing'
    };
  }
}

export function cleanResponse(text: string): string {
  if (!text) return '';
  
  let cleaned = text;

  // Fix common formatting issues
  cleaned = cleaned
    // Remove duplicate adjacent words (case insensitive)
    .replace(/\b(\w+)\s+\1\b/gi, '$1')
    // Fix concatenated words with camelCase
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Fix concatenated words with PascalCase
    .replace(/([A-Za-z])([A-Z][a-z])/g, '$1 $2')
    // Fix concatenated words with numbers
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-zA-Z])/g, '$1 $2')
    // Fix spacing around punctuation
    .replace(/\s*([.,!?:;])\s*/g, '$1 ')
    // Fix spacing around parentheses and brackets
    .replace(/\s*([\(\[\{])\s*/g, ' $1')
    .replace(/\s*([\)\]\}])\s*/g, '$1 ')
    // Fix multiple spaces
    .replace(/\s+/g, ' ')
    // Fix spaces before newlines
    .replace(/\s+\n/g, '\n')
    // Fix multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    // Ensure proper spacing after bullet points
    .replace(/^([-*•])\s*/gm, '$1 ')
    .trim();

  // Special handling for lists
  cleaned = cleaned
    .split('\n')
    .map(line => {
      // Add newline before bullet points if not at start
      if (line.match(/^[-*•]/)) {
        return '\n' + line;
      }
      return line;
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return cleaned;
}

export function formatCodeBlocks(content: string): string {
  if (!content) return '';

  interface CodeBlock {
    lang: string;
    code: string;
  }

  // First, protect code blocks from other formatting
  const codeBlocks: CodeBlock[] = [];
  const contentWithoutCode = content.replace(
    /```([\w-]*)\n([\s\S]*?)```/g,
    (match, lang, code) => {
      codeBlocks.push({ 
        lang: lang || '',
        code: code.trim() 
      });
      return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    }
  );

  // Apply text formatting
  let formatted = cleanResponse(contentWithoutCode);

  // Restore code blocks with proper formatting
  formatted = formatted.replace(
    /__CODE_BLOCK_(\d+)__/g,
    (_, index) => {
      const block = codeBlocks[parseInt(index)];
      const language = block.lang || 'plaintext';
      return `\n<pre><code class="language-${language}">${block.code}</code></pre>\n`;
    }
  );

  return formatted;
} 