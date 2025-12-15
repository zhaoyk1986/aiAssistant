import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Message, ChatState } from '../types';
import { sendStreamMessage } from '../services/chatService';

interface ChatContextType extends ChatState {
  sendMessage: (content: string, images?: string[]) => void;
  clearMessages: () => void;
  retryMessage: (message: Message) => void;
  deleteMessage: (messageId: string) => void;
  editMessage: (messageId: string, newContent: string) => void;
  toggleLike: (messageId: string) => void;
  setUploading: (isUploading: boolean) => void;
  toggleResponseMode: () => void;
}

type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; content: string } }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_UPLOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'DELETE_MESSAGE'; payload: string }
  | { type: 'TOGGLE_LIKE'; payload: string }
  | { type: 'TOGGLE_RESPONSE_MODE' };

const initialState: ChatState = {
  messages: [],
  isTyping: false,
  isUploading: false,
  error: null,
  responseMode: 'quick',
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, content: action.payload.content }
            : msg
        ),
      };
    case 'SET_TYPING':
      return {
        ...state,
        isTyping: action.payload,
      };
    case 'SET_UPLOADING':
      return {
        ...state,
        isUploading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isTyping: false,
      };
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: [],
      };
    case 'DELETE_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter(msg => msg.id !== action.payload),
      };
    case 'TOGGLE_LIKE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload
            ? { ...msg, liked: !msg.liked }
            : msg
        ),
      };
    case 'TOGGLE_RESPONSE_MODE':
      return {
        ...state,
        responseMode: state.responseMode === 'quick' ? 'deep' : 'quick',
      };
    default:
      return state;
  }
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Effect to handle streaming response when messages change and typing is true
  useEffect(() => {
    if (state.isTyping && state.messages.length > 0) {
      const lastMessage = state.messages[state.messages.length - 1];
      
      // Only process if last message is from user
      if (lastMessage.role === 'user') {
        // Create assistant message with thinking state
        const assistantMessage: Message = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          thinking: true,
        };
        
        dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
        
        // Keep track of the current content
        let currentContent = '';
        
        // Send stream message to backend
        sendStreamMessage(
          state.messages,
          (chunk: string) => {
            console.log('Received chunk:', chunk);
            // Update current content
            currentContent += chunk;
            // Update assistant message with new content
            dispatch({
              type: 'UPDATE_MESSAGE',
              payload: {
                id: assistantMessage.id,
                content: currentContent,
              },
            });
          },
          (error: string) => {
            console.error('Stream error:', error);
            dispatch({ type: 'SET_ERROR', payload: error });
          },
          () => {
            console.log('Stream completed. Final content:', currentContent);
            // Update assistant message to not thinking anymore
            dispatch({
              type: 'UPDATE_MESSAGE',
              payload: {
                id: assistantMessage.id,
                content: currentContent,
                thinking: false,
              },
            });
            dispatch({ type: 'SET_TYPING', payload: false });
          },
          state.responseMode
        );
      }
    }
  }, [state.isTyping]);

  const sendMessage = (content: string, images?: string[]) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      images,
      timestamp: Date.now(),
    };
    
    dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
    dispatch({ type: 'SET_TYPING', payload: true });
  };

  const clearMessages = () => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  };

  const retryMessage = (message: Message) => {
    if (message.role === 'user') {
      sendMessage(message.content, message.images);
    }
  };

  const deleteMessage = (messageId: string) => {
    dispatch({ type: 'DELETE_MESSAGE', payload: messageId });
  };

  const editMessage = (messageId: string, newContent: string) => {
    dispatch({ type: 'UPDATE_MESSAGE', payload: { id: messageId, content: newContent } });
  };

  const toggleLike = (messageId: string) => {
    dispatch({ type: 'TOGGLE_LIKE', payload: messageId });
  };

  const setUploading = (isUploading: boolean) => {
    dispatch({ type: 'SET_UPLOADING', payload: isUploading });
  };

  const toggleResponseMode = () => {
    dispatch({ type: 'TOGGLE_RESPONSE_MODE' });
  };

  return (
    <ChatContext.Provider
      value={{
        ...state,
        sendMessage,
        clearMessages,
        retryMessage,
        deleteMessage,
        editMessage,
        toggleLike,
        setUploading,
        toggleResponseMode,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
