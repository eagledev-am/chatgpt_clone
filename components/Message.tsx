
import React from 'react';
import type { Message } from '../types';
import { UserIcon, SparkleIcon } from './icons';

interface MessageProps {
  message: Message;
}

const MessageComponent: React.FC<MessageProps> = ({ message }) => {
  const isModel = message.role === 'model';

  const containerClasses = `flex items-start gap-3 md:gap-4 my-4 p-4 rounded-lg ${
    isModel ? 'bg-gray-800' : ''
  }`;

  return (
    <div className={containerClasses}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isModel ? 'bg-blue-600' : 'bg-gray-600'}`}>
        {isModel ? <SparkleIcon className="w-5 h-5 text-white" /> : <UserIcon className="w-5 h-5 text-white" />}
      </div>
      <div className="flex-1 pt-1 overflow-x-auto">
        <p className="text-white whitespace-pre-wrap">{message.parts || <span className="animate-pulse">...</span>}</p>
      </div>
    </div>
  );
};

export default MessageComponent;
