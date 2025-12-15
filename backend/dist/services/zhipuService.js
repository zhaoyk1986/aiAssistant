"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChatRequest = void 0;
const axios_1 = __importDefault(require("axios"));
const handleChatRequest = async (req, res) => {
    console.log('Received chat request:', req.body);
    const apiKey = process.env.ZHIPU_API_KEY;
    if (!apiKey) {
        console.error('Zhipu API key is not configured');
        res.status(500).json({ error: 'Zhipu API key is not configured' });
        return;
    }
    const chatRequest = req.body;
    console.log('chatRequest:', chatRequest);
    // Validate required fields
    if (!chatRequest.messages || !Array.isArray(chatRequest.messages)) {
        console.error('Invalid messages in request:', chatRequest);
        res.status(400).json({ error: 'Messages are required and must be an array' });
        return;
    }
    // Determine stream mode from request or use false as default
    const streamMode = chatRequest.stream ?? false;
    // Set appropriate headers based on stream mode
    if (streamMode) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
    }
    try {
        // Call Zhipu API with appropriate response type
        const response = await axios_1.default.post('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            model: 'glm-4.6v-flash',
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
            stream: streamMode,
            thinking: chatRequest.thinking
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            responseType: streamMode ? 'stream' : 'json'
        });
        // Handle response based on stream mode
        if (streamMode) {
            // Accumulator for incomplete data chunks
            let buffer = '';
            // Pipe the stream to the response
            response.data.on('data', (chunk) => {
                buffer += chunk.toString();
                // Process complete SSE events (split by \n\n)
                let eventEndIndex;
                while ((eventEndIndex = buffer.indexOf('\n\n')) !== -1) {
                    const event = buffer.slice(0, eventEndIndex).trim();
                    buffer = buffer.slice(eventEndIndex + 2); // Remove processed event and delimiter
                    if (event.startsWith('data:')) {
                        const jsonStr = event.substring(5).trim();
                        // Skip the final done event
                        if (jsonStr === '[DONE]') {
                            continue;
                        }
                        try {
                            const streamResponse = JSON.parse(jsonStr);
                            const content = streamResponse.choices[0]?.delta?.content;
                            const reasoningContent = streamResponse.choices[0]?.delta?.reasoning_content;
                            if (content) {
                                // Send the content as a Server-Sent Event
                                res.write(`data: ${JSON.stringify({ content })}\n\n`);
                            }
                            if (reasoningContent) {
                                // Send the reasoning content as a Server-Sent Event
                                res.write(`data: ${JSON.stringify({ reasoning_content: reasoningContent })}\n\n`);
                            }
                        }
                        catch (parseError) {
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
            response.data.on('error', (error) => {
                console.error('Stream error:', error);
                res.status(500).write(`data: ${JSON.stringify({ error: 'Stream error occurred' })}\n\n`);
                res.end();
            });
        }
        else {
            // Handle non-stream response
            try {
                // For non-stream mode, response.data contains the complete JSON
                const completeResponse = response.data;
                const content = completeResponse.choices[0]?.message?.content;
                const reasoningContent = completeResponse.choices[0]?.message?.reasoning_content;
                console.log('Complete response:', completeResponse);
                if (content || reasoningContent) {
                    // Send the complete content and reasoning content
                    const responseData = { content: content || '' };
                    if (reasoningContent) {
                        responseData.reasoning_content = reasoningContent;
                    }
                    res.status(200).json(responseData);
                }
                else {
                    res.status(200).json({ content: '' });
                }
            }
            catch (parseError) {
                console.error('Error parsing complete response:', parseError);
                res.status(500).json({ error: 'Error parsing API response' });
            }
        }
    }
    catch (error) {
        console.error('Zhipu API error:', error);
        if (streamMode) {
            res.status(500).write(`data: ${JSON.stringify({ error: error.message || 'Failed to call Zhipu API' })}

`);
            res.end();
        }
        else {
            res.status(500).json({ error: error.message || 'Failed to call Zhipu API' });
        }
    }
};
exports.handleChatRequest = handleChatRequest;
