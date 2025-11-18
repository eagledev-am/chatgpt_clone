import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import MessageComponent from './Message';
import { SendIcon, PaperclipIcon, XIcon, FileTextIcon } from './icons';

interface ChatViewProps {
  messages: Message[];
  onSendMessage: (prompt: string, file: File | null) => void;
  isLoading: boolean;
}

const ChatView: React.FC<ChatViewProps> = ({ messages, onSendMessage, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!attachment) {
      setPreviewUrl(null);
      return;
    }

    if (attachment.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(attachment);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl('file'); // Special value for non-image files
    }
  }, [attachment]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((prompt.trim() || attachment) && !isLoading) {
      onSendMessage(prompt, attachment);
      setPrompt('');
      setAttachment(null);
      if(fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg) => (
            <MessageComponent key={msg.id} message={msg} />
          ))}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <MessageComponent message={{ id: 'loading', role: 'model', parts: [] }} />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 md:p-6 bg-gray-900 border-t border-gray-700 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          {attachment && (
            <div className="mb-2 p-2 bg-gray-700 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                {previewUrl && previewUrl !== 'file' ? (
                  <img src={previewUrl} alt="Preview" className="w-12 h-12 rounded-md object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-gray-600 rounded-md flex items-center justify-center">
                    <FileTextIcon className="w-6 h-6 text-white"/>
                  </div>
                )}
                <div className="text-sm text-gray-300">
                  <p className="font-medium">{attachment.name}</p>
                  <p>{(attachment.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <button onClick={handleRemoveAttachment} className="p-1 rounded-full hover:bg-gray-600">
                <XIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
             <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,text/plain,text/markdown"
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-700 text-white p-3 rounded-full hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0"
                disabled={isLoading}
            >
              <PaperclipIcon className="w-6 h-6" />
            </button>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={attachment ? "Ask about the file..." : "Ask Abdo AI anything..."}
              rows={1}
              className="flex-grow bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || (!prompt.trim() && !attachment)}
              className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0"
            >
              <SendIcon className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
