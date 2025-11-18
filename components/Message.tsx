import React, { useEffect, useRef } from 'react';
import type { Message, Part } from '../types';
import { UserIcon, SparkleIcon, FileTextIcon } from './icons';

interface MessageProps {
  message: Message;
}

// Declare globals for TypeScript to recognize libraries loaded via CDN
declare global {
    interface Window {
        marked: { parse: (markdown: string, options?: any) => string };
        hljs: { highlightElement: (element: HTMLElement) => void };
    }
}

const ModelPartRenderer: React.FC<{ part: Part }> = ({ part }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    if (!part.text) return null;

    // Use marked to parse markdown into HTML.
    // gfm: true enables GitHub-flavored markdown.
    // breaks: true makes line breaks in the source render as <br> tags.
    const parsedHtml = window.marked.parse(part.text, { gfm: true, breaks: true });

    useEffect(() => {
        // After the component renders and the HTML is in the DOM,
        // find all code blocks and apply syntax highlighting.
        if (contentRef.current) {
            const codeBlocks = contentRef.current.querySelectorAll('pre code');
            codeBlocks.forEach((block) => {
                window.hljs.highlightElement(block as HTMLElement);
            });
        }
    }, [part.text]); // This effect re-runs whenever the streamed text content changes.

    return (
        <div
            ref={contentRef}
            className="markdown-container"
            dangerouslySetInnerHTML={{ __html: parsedHtml }}
        />
    );
};

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
        <div className="text-white flex flex-col items-start gap-2">
            {message.parts.map((part, index) => {
                if (part.text) {
                    // For model responses, render markdown with syntax highlighting.
                    // For user messages, display plain text to preserve formatting.
                    return isModel 
                        ? <ModelPartRenderer key={index} part={part} /> 
                        : <p key={index} className="whitespace-pre-wrap">{part.text}</p>;
                }
                if (part.inlineData?.mimeType.startsWith('image/')) {
                    return (
                        <a href={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`} target="_blank" rel="noopener noreferrer" key={index}>
                            <img
                                src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`}
                                alt="User content"
                                className="max-w-xs md:max-w-sm rounded-lg border-2 border-gray-700 hover:border-blue-500 transition-all"
                            />
                        </a>
                    );
                }
                 if (part.fileName) {
                    return (
                        <div key={index} className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-center gap-3">
                            <FileTextIcon className="w-5 h-5 text-gray-300 flex-shrink-0" />
                            <span className="text-sm text-gray-300 font-mono">{part.fileName}</span>
                        </div>
                    );
                }
                return null;
            })}
             {message.parts.length === 0 && <span className="animate-pulse">...</span>}
        </div>
      </div>
    </div>
  );
};

export default MessageComponent;