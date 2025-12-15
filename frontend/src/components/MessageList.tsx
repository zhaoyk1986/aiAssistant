import React from 'react';
import { useChat } from '../context/ChatContext';
import MessageItem from './MessageItem';

const MessageList: React.FC = () => {
  const { messages } = useChat();

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-neutral-500 dark:text-neutral-400 px-4">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/20 dark:to-accent-900/20 flex items-center justify-center mb-6 animate-float">
          <svg className="w-12 h-12 text-primary-500 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold mb-2 gradient-text">欢迎使用 AI Assistant</h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-center max-w-md mb-8">
          我是您的智能助手，支持文本对话、图片理解和深度思考。开始对话，探索无限可能！
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors shadow-medium"
            onClick={() => {
              const inputElement = document.querySelector('textarea') as HTMLTextAreaElement;
              if (inputElement) {
                inputElement.focus();
                inputElement.value = "你好，请介绍一下你的功能";
                inputElement.dispatchEvent(new Event('input', { bubbles: true }));
              }
            }}
          >
            试试示例问题
          </button>
          <button
            className="px-4 py-2 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg transition-colors border border-neutral-300 dark:border-neutral-600"
            onClick={() => {
              const inputElement = document.querySelector('textarea') as HTMLTextAreaElement;
              if (inputElement) {
                inputElement.focus();
              }
            }}
          >
            开始对话
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {messages.map((message, index) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
};

export default MessageList;
