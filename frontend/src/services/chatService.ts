import type { Message, StreamResponse } from '../types';

export const sendStreamMessage = async (
  messages: Message[],
  onChunk: (chunk: string) => void,
  onError: (error: string) => void,
  onComplete: () => void,
  responseMode: 'quick' | 'deep' = 'quick',
  stream: boolean = true,
  thinking?: { type: "enabled" },
  onReasoningChunk?: (chunk: string) => void
) => {
  try {
    console.log('Sending messages to backend:', messages);
    // Adjust parameters based on response mode
    const params = responseMode === 'deep' 
      ? {
          messages,
          temperature: 0.8,        // Higher temperature for more creativity
          top_p: 0.9,              // Lower top_p for more focused responses
          max_tokens: 2048,        // More tokens for detailed responses
          stream,                  // Include stream parameter
          thinking                 // Include thinking parameter
        }
      : {
          messages,
          temperature: 0.5,        // Lower temperature for more consistent responses
          top_p: 0.95,             // Higher top_p for faster responses
          max_tokens: 1024,        // Standard token limit
          stream,                  // Include stream parameter
          thinking                 // Include thinking parameter
        };

    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No readable stream');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      console.log('Raw buffer:', buffer);
      
      // Process complete SSE events
      const events = buffer.split('\n\n');
      buffer = events.pop() || '';

      for (const event of events) {
        console.log('Processing event:', event);
        if (event.startsWith('data:')) {
          const dataStr = event.substring(5).trim();
          console.log('Data string:', dataStr);
          
          if (dataStr === '[DONE]') {
            console.log('Stream completed');
            onComplete();
            return;
          }

          try {
            const data: StreamResponse = JSON.parse(dataStr);
            console.log('Parsed data:', data);
            
            if (data.error) {
              onError(data.error);
              return;
            }
            
            if (data.content) {
              console.log('Calling onChunk with content:', data.content);
              onChunk(data.content);
            }
            
            if (data.reasoning_content && onReasoningChunk) {
              console.log('Calling onReasoningChunk with reasoning content:', data.reasoning_content);
              onReasoningChunk(data.reasoning_content);
            }
          } catch (parseError) {
            console.error('Error parsing stream data:', parseError);
          }
        }
      }
    }

    console.log('Stream finished naturally');
    onComplete();
  } catch (error) {
    console.error('Stream error:', error);
    onError(error instanceof Error ? error.message : 'An unknown error occurred');
  }
};

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  // In a real app, you would upload to a storage service
  // For now, we'll convert to base64 for demo purposes
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
