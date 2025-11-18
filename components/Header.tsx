import React from 'react';
import type { Mode } from '../types';
import { SparkleIcon } from './icons';

interface HeaderProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

const Header: React.FC<HeaderProps> = ({ mode, setMode }) => {
  const getButtonClasses = (buttonMode: Mode) => {
    const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors duration-200';
    if (mode === buttonMode) {
      return `${baseClasses} bg-blue-600 text-white`;
    }
    return `${baseClasses} bg-gray-700 text-gray-300 hover:bg-gray-600`;
  };

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <SparkleIcon className="w-8 h-8 text-blue-500" />
        <h1 className="text-2xl font-bold text-white">Abdo AI</h1>
      </div>
      <div className="flex items-center gap-2 p-1 bg-gray-800 rounded-lg">
        <button onClick={() => setMode('chat')} className={getButtonClasses('chat')}>
          Chat
        </button>
        <button onClick={() => setMode('image')} className={getButtonClasses('image')}>
          Image
        </button>
        <button onClick={() => setMode('code')} className={getButtonClasses('code')}>
          Code
        </button>
      </div>
    </header>
  );
};

export default Header;