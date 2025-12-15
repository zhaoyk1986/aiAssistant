export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
  timestamp: number;
  thinking?: boolean;
  liked?: boolean;
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  isUploading: boolean;
  error: string | null;
  responseMode: 'quick' | 'deep';
}

export interface ChatRequest {
  messages: Message[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
}

export interface StreamResponse {
  content?: string;
  error?: string;
}
