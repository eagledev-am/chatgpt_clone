
import React, { useState, useEffect } from 'react';
import type { Chat } from '@google/genai';
import { createChatSession, generateImage } from './services/geminiService';
import type { Mode, Message } from './types';
import Header from './components/Header';
import ChatView from './components/ChatView';
import ImageView from './components/ImageView';

const App: React.FC = () => {
    const [mode, setMode] = useState<Mode>('chat');
    const [messages, setMessages] = useState<Message[]>([]);
    const [images, setImages] = useState<string[]>([]);
    const [chat, setChat] = useState<Chat | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setChat(createChatSession());
        setMessages([
          { id: 'initial-message', role: 'model', parts: 'Hello! I am Abdo AI. How can I help you today? You can ask me anything or switch to image generation.' }
        ]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSendMessage = async (prompt: string) => {
        if (!chat || !prompt.trim() || isLoading) return;

        const newUserMessage: Message = { id: Date.now().toString(), role: 'user', parts: prompt };
        setMessages(prev => [...prev, newUserMessage]);
        setIsLoading(true);
        setError(null);
        
        const modelMessageId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: modelMessageId, role: 'model', parts: '' }]);

        try {
            const result = await chat.sendMessageStream({ message: prompt });
            let text = '';
            for await (const chunk of result) {
                text += chunk.text;
                setMessages(prev => prev.map(msg => 
                    msg.id === modelMessageId ? { ...msg, parts: text } : msg
                ));
            }
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Error: ${errorMessage}`);
            setMessages(prev => prev.map(msg => 
                msg.id === modelMessageId ? { ...msg, parts: `Sorry, I encountered an error. ${errorMessage}` } : msg
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateImage = async (prompt: string) => {
        if (!prompt.trim() || isLoading) return;
        setIsLoading(true);
        setError(null);

        try {
            const imageUrl = await generateImage(prompt);
            setImages(prev => [imageUrl, ...prev]);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 text-white h-screen w-screen flex flex-col font-sans">
            <Header mode={mode} setMode={setMode} />
            {error && (
                <div className="bg-red-500 text-white p-2 text-center">
                    <p>Error: {error}</p>
                </div>
            )}
            <main className="flex-grow overflow-hidden">
                {mode === 'chat' ? (
                    <ChatView messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
                ) : (
                    <ImageView images={images} onGenerateImage={handleGenerateImage} isLoading={isLoading} />
                )}
            </main>
        </div>
    );
};

export default App;
