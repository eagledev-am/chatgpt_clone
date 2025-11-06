
import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { SparkleIcon } from './icons';

interface ImageViewProps {
  images: string[];
  onGenerateImage: (prompt: string) => void;
  isLoading: boolean;
}

const ImageView: React.FC<ImageViewProps> = ({ images, onGenerateImage, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onGenerateImage(prompt);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 md:p-6 bg-gray-900 border-b border-gray-700 sticky top-[73px] z-10">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center gap-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to create..."
            className="flex-grow bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2 font-semibold"
          >
            {isLoading ? <LoadingSpinner size="h-5 w-5" /> : <SparkleIcon className="w-5 h-5" />}
            <span>Generate</span>
          </button>
        </form>
      </div>
      <div className="flex-grow overflow-y-auto p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {isLoading && images.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-gray-400">
               <LoadingSpinner />
               <p className="mt-4">Generating your image...</p>
             </div>
          )}
          {images.length === 0 && !isLoading && (
            <div className="text-center text-gray-500 py-16">
              <h2 className="text-2xl font-semibold">Welcome to Image Generation</h2>
              <p className="mt-2">Your generated images will appear here.</p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {isLoading && (
              <div className="w-full aspect-square bg-gray-800 rounded-lg flex items-center justify-center animate-pulse">
                <LoadingSpinner size="h-12 w-12" />
              </div>
            )}
            {images.map((imgSrc, index) => (
              <div key={index} className="w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-700 hover:border-blue-500 transition-all">
                <img src={imgSrc} alt={`Generated image ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageView;
