import { Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import { ZhipuStreamResponse, ChatRequest } from '../types';

export const handleChatRequest = async (req: Request, res: Response) => {
  console.log('Received chat request:', req.body);
  
  const apiKey = process.env.ZHIPU_API_KEY;
  
  if (!apiKey) {
    console.error('Zhipu API key is not configured');
    res.status(500).json({ error: 'Zhipu API key is not configured' });
    return;
  }

  const chatRequest: ChatRequest = req.body;
  
  // Validate required fields
  if (!chatRequest.messages || !Array.isArray(chatRequest.messages)) {
    console.error('Invalid messages in request:', chatRequest);
    res.status(400).json({ error: 'Messages are required and must be an array' });
    return;
  }
  
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // Call Zhipu API with streaming
    const response: AxiosResponse = await axios.post(
      'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      {
        model: 'glm-4-flash',
        messages: chatRequest.messages.map(msg => ({
          role: msg.role,
          content: msg.images && msg.images.length > 0 
            ? [
                { type: 'text', text: msg.content },
                ...msg.images.map(img => ({ type: 'image_url', image_url: { url: img } }))
              ]
            : msg.content
        })),
        temperature: chatRequest.temperature || 0.7,
        top_p: chatRequest.top_p || 0.95,
        max_tokens: chatRequest.max_tokens || 1024,
        stream: true
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'stream'
      }
    );

    // Pipe the stream to the response
    response.data.on('data', (chunk: Buffer) => {
      const data = chunk.toString();
      
      // Process SSE events
      const events = data.split('\n\n').filter(event => event.trim());
      
      for (const event of events) {
        if (event.startsWith('data:')) {
          const jsonStr = event.substring(5).trim();
          
          // Skip the final done event
          if (jsonStr === '[DONE]') {
            continue;
          }
          
          try {
            const streamResponse: ZhipuStreamResponse = JSON.parse(jsonStr);
            const content = streamResponse.choices[0]?.delta?.content;
            
            if (content) {
              // Send the content as a Server-Sent Event
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch (parseError) {
            console.error('Error parsing stream response:', parseError);
          }
        }
      }
    });

    response.data.on('end', () => {
      // End the SSE stream
      res.write('data: [DONE]\n\n');
      res.end();
    });

    response.data.on('error', (error: Error) => {
      console.error('Stream error:', error);
      res.status(500).write(`data: ${JSON.stringify({ error: 'Stream error occurred' })}\n\n`);
      res.end();
    });

  } catch (error: any) {
    console.error('Zhipu API error:', error);
    res.status(500).write(`data: ${JSON.stringify({ error: error.message || 'Failed to call Zhipu API' })}\n\n`);
    res.end();
  }
};
