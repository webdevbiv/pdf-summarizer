import { logError } from './logger';

interface ApiLogData {
  endpoint: string;
  method: string;
  status: number;
  duration: number;
  error?: string;
  timestamp: string;
}

export function logApiStatus(data: ApiLogData) {
  const { endpoint, method, status, duration, error, timestamp } = data;
  
  // Create a styled console group
  console.group('%cAPI Request', 'color: #0ea5e9; font-weight: bold');
  
  // Log basic request info
  console.log('%cEndpoint:', 'color: #64748b', endpoint);
  console.log('%cMethod:', 'color: #64748b', method);
  console.log('%cTimestamp:', 'color: #64748b', timestamp);
  
  // Log status with color based on success/failure
  const statusColor = status >= 200 && status < 300 ? '#22c55e' : '#ef4444';
  console.log('%cStatus:', 'color: #64748b', `%c${status}`, `color: ${statusColor}; font-weight: bold`);
  
  // Log duration
  console.log('%cDuration:', 'color: #64748b', `${duration}ms`);
  
  // Log error if present
  if (error) {
    console.error('%cError:', 'color: #ef4444', error);
  }
  
  console.groupEnd();
}

export async function fetchWithLogging(
  url: string,
  options: RequestInit
): Promise<Response> {
  const startTime = performance.now();
  const timestamp = new Date().toISOString();
  
  try {
    const response = await fetch(url, options);
    const duration = Math.round(performance.now() - startTime);
    
    logApiStatus({
      endpoint: url,
      method: options.method || 'GET',
      status: response.status,
      duration,
      timestamp,
    });
    
    return response;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    
    logApiStatus({
      endpoint: url,
      method: options.method || 'GET',
      status: 0,
      duration,
      timestamp,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    throw error;
  }
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

interface SummarizeResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function summarizeText(text: string, model: string): Promise<string> {
  console.group('API Call: Summarize Text');
  console.time('API Request Duration');
  console.log('Input text length:', text.length);
  console.log('Selected model:', model);

  try {
    if (!API_KEY) {
      throw new Error('OpenRouter API key is not configured');
    }

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'PDF Summarizer App'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates well-structured, detailed summaries. Format your summaries using markdown with proper hierarchy: use # for main title, ## for sections, ### for subsections, and - for bullet points. Use nested lists with proper indentation for sub-items. Use ** for bold text and ` for code/keyboard shortcuts. Include horizontal rules (---) between major sections. Always end the summary with a note about additional shortcuts and include a link to the official documentation. Ensure all information is properly organized in a clear, hierarchical structure.'
          },
          {
            role: 'user',
            content: `Please provide a comprehensive summary of the following document. Structure it with proper markdown formatting:
1. Use # for the main title
2. Use ## for major sections
3. Use ### for subsections
4. Use - for bullet points
5. Use nested lists with proper indentation for sub-items
6. Use ** for bold text
7. Use \` for code/keyboard shortcuts
8. Use --- between major sections
9. Ensure proper spacing and hierarchy
10. End with a note about additional shortcuts and include this link: [aka.ms/vscodekeybindings](https://aka.ms/vscodekeybindings)

Document to summarize:\n\n${text}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.5
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json() as SummarizeResponse;
    console.log('API Response:', data);

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No summary generated in API response');
    }

    const summary = data.choices[0]?.message?.content;
    if (!summary) {
      throw new Error('Empty summary in API response');
    }
    
    console.log('Summary length:', summary.length);
    console.log('Summary preview:', summary.substring(0, 100) + '...');
    console.timeEnd('API Request Duration');
    console.groupEnd();
    
    return summary;
  } catch (error) {
    console.error('API Call Failed:', error);
    console.timeEnd('API Request Duration');
    console.groupEnd();
    logError(error instanceof Error ? error.message : 'Unknown API error', 'API Call');
    throw error;
  }
} 