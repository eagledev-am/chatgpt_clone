
import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import MessageComponent from './Message';
import { SendIcon } from './icons';

interface ChatViewProps {
  messages: Message[];
  onSendMessage: (prompt: string) => void;
  isLoading: boolean;
}

const ChatView: React.FC<ChatViewProps> = ({ messages, onSendMessage, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSendMessage(prompt);
      setPrompt('');
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
            <MessageComponent message={{ id: 'loading', role: 'model', parts: '' }} />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 md:p-6 bg-gray-900 border-t border-gray-700 sticky bottom-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center gap-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask Abdo AI anything..."
            rows={1}
            className="flex-grow bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0"
          >
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;
