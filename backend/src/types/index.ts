export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: string[];
  timestamp: number;
}

export interface ChatRequest {
  messages: Message[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
  thinking?: { type: "enabled" };
}

export interface ZhipuStreamResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
      reasoning_content?: string;
    };
    finish_reason: string | null;
  }>;
}
