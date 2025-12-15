import React, { useState, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { uploadImage } from '../services/chatService';

const InputArea: React.FC = () => {
  const [input, setInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, isUploading, isTyping, setUploading } = useChat();

  const handleSend = () => {
    if (input.trim() || images.length > 0) {
      sendMessage(input.trim(), images);
      setInput('');
      setImages([]);
    }
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;

    try {
      setUploading(true);
      const uploadedImages: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageUrl = await uploadImage(file);
        uploadedImages.push(imageUrl);
      }
      
      setImages(prev => [...prev, ...uploadedImages]);
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(e.target.files);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleImageUpload(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Uploaded Images Preview */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Preview ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg shadow-medium transition-all duration-300 group-hover:shadow-hard"
              />
              <button
                type="button"
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-medium"
                onClick={() => removeImage(index)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div 
        className={`relative rounded-2xl border-2 transition-all duration-300 ${
          isDragOver 
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
            : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800'
        } shadow-soft`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-end gap-3 p-3">
          {/* Image Upload Button */}
          <div className="relative">
            <button
              type="button"
              className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isTyping}
              title="上传图片"
            >
              <svg className="w-5 h-5 text-neutral-600 dark:text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            {isUploading && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full border-2 border-white dark:border-neutral-800 flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping"></div>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileInputChange}
          />

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息... (Shift+Enter 换行)"
              className="w-full p-3 bg-transparent resize-none focus:outline-none text-neutral-800 dark:text-neutral-200 placeholder-neutral-400 dark:placeholder-neutral-500 min-h-[60px] max-h-[200px]"
              disabled={isTyping}
              rows={1}
            />
            {isDragOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-primary-50 dark:bg-primary-900/20 rounded-xl pointer-events-none">
                <div className="text-center">
                  <svg className="w-10 h-10 mx-auto text-primary-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm font-medium text-primary-600 dark:text-primary-400">拖放图片到这里</p>
                </div>
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            type="button"
            className={`p-3 rounded-full transition-all duration-300 ${
              (!input.trim() && images.length === 0) || isTyping
                ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-medium hover:shadow-hard transform hover:scale-105'
            }`}
            onClick={handleSend}
            disabled={(!input.trim() && images.length === 0) || isTyping}
            title="发送消息"
          >
            {isTyping ? (
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              </div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-between items-center px-1">
        <div className="flex gap-2">
          <button
            type="button"
            className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            title="支持 Markdown 格式"
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            支持 Markdown
          </button>
        </div>
        <div className="text-xs text-neutral-400 dark:text-neutral-500">
          {input.length}/2000
        </div>
      </div>
    </div>
  );
};

export default InputArea;
