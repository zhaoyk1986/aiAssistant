import React, { useState } from 'react';
import type { Message } from '../types';

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fadeIn group`}>
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 mr-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-medium">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      )}
      
      {/* Message Bubble */}
      <div className={`max-w-[75%] ${isUser ? 'order-first' : ''}`}>
        <div 
          className={`message-bubble ${isUser ? 'message-bubble-user' : 'message-bubble-assistant'} ${isHovered ? 'shadow-medium' : ''} relative`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Message Content */}
          <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isUser ? 'text-white' : 'text-neutral-800 dark:text-neutral-200'}`}>
            {message.content || (
              <span className="text-neutral-400 dark:text-neutral-500 italic">This message is empty</span>
            )}
          </div>

          {/* Images */}
          {message.images && message.images.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Uploaded ${index + 1}`}
                    className="max-w-full h-auto rounded-lg shadow-medium transition-all duration-300 group-hover:shadow-hard cursor-pointer"
                    onClick={() => window.open(image, '_blank')}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Thinking Indicator */}
          {message.thinking && (
            <div className="flex items-center mt-3 text-sm text-neutral-500 dark:text-neutral-400">
              <div className="typing-indicator mr-2">
                <div className="typing-dot animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="typing-dot animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="typing-dot animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="font-medium">深度思考中...</span>
            </div>
          )}

          {/* Timestamp and Actions */}
          <div className={`flex items-center justify-between mt-2 ${isUser ? 'text-primary-100' : 'text-neutral-500 dark:text-neutral-400'}`}>
            <div className="text-xs">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            
            {/* Message Actions */}
            <div className={`flex gap-1 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              {/* Like Button */}
              <button
                type="button"
                className={`p-1.5 rounded-full transition-all duration-200 ${message.liked 
                  ? 'bg-red-500 text-white' 
                  : isUser 
                    ? 'bg-white/20 hover:bg-white/30 text-white' 
                    : 'bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300'
                }`}
                title={message.liked ? '取消点赞' : '点赞'}
              >
                <svg className="w-4 h-4" fill={message.liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              
              {/* Retry Button (only for user messages) */}
              {isUser && (
                <button
                  type="button"
                  className={`p-1.5 rounded-full transition-all duration-200 ${
                    'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                  title="重试"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
              
              {/* Delete Button */}
              <button
                type="button"
                className={`p-1.5 rounded-full transition-all duration-200 ${
                  isUser 
                    ? 'bg-white/20 hover:bg-white/30 text-white' 
                    : 'bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300'
                }`}
                title="删除"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
