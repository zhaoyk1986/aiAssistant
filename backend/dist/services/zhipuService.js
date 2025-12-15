"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChatRequest = void 0;
const axios_1 = __importDefault(require("axios"));
const handleChatRequest = async (req, res) => {
    const apiKey = process.env.ZHIPU_API_KEY;
    if (!apiKey) {
        res.status(500).json({ error: 'Zhipu API key is not configured' });
        return;
    }
    const chatRequest = req.body;
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    try {
        // Call Zhipu API with streaming
        const response = await axios_1.default.post('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
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
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            responseType: 'stream'
        });
        // Pipe the stream to the response
        response.data.on('data', (chunk) => {
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
                        const streamResponse = JSON.parse(jsonStr);
                        const content = streamResponse.choices[0]?.delta?.content;
                        if (content) {
                            // Send the content as a Server-Sent Event
                            res.write(`data: ${JSON.stringify({ content })}\n\n`);
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
    catch (error) {
        console.error('Zhipu API error:', error);
        res.status(500).write(`data: ${JSON.stringify({ error: error.message || 'Failed to call Zhipu API' })}\n\n`);
        res.end();
    }
};
exports.handleChatRequest = handleChatRequest;
