import React, { useState, useEffect } from 'react';
import type { Chat } from '@google/genai';
import { createChatSession, generateImage, reminderTools } from './services/geminiService';
import type { Mode, Message, Part } from './types';
import Header from './components/Header';
import ChatView from './components/ChatView';
import ImageView from './components/ImageView';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const fileToText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const SYSTEM_INSTRUCTIONS = {
    chat: 'You are Abdo AI, a helpful and creative assistant. You can set reminders for users. When a user asks to be reminded of something, use the setReminder tool. Keep your responses concise and friendly.',
    code: 'You are Py-Pal, an expert Python programmer. Provide clean, efficient, and well-commented Python code. Explain your solutions clearly and concisely. Start your first message by introducing yourself.'
};

const INITIAL_MESSAGES: { [key in 'chat' | 'code']: Message } = {
    chat: { id: 'initial-message', role: 'model', parts: [{ text: 'Hello! I am Abdo AI. How can I help you today? You can ask me anything, set a reminder (e.g., "remind me to buy milk tomorrow at 10am"), attach an image, or upload a text file.' }] },
    code: { id: 'initial-message', role: 'model', parts: [{ text: "Hello! I'm Py-Pal, your expert Python assistant. Ask me any Python-related question, and I'll provide you with clean code and clear explanations." }] }
};


const App: React.FC = () => {
    const [mode, setMode] = useState<Mode>('chat');
    const [messages, setMessages] = useState<Message[]>([]);
    const [images, setImages] = useState<string[]>([]);
    const [chat, setChat] = useState<Chat | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (mode === 'chat' || mode === 'code') {
            const tools = mode === 'chat' ? reminderTools : undefined;
            setChat(createChatSession(SYSTEM_INSTRUCTIONS[mode], tools));
            setMessages([INITIAL_MESSAGES[mode]]);
        }
    }, [mode]);

    const handleSendMessage = async (prompt: string, file: File | null) => {
        if (!chat || (!prompt.trim() && !file) || isLoading) return;
    
        setIsLoading(true);
        setError(null);
    
        const userMessageParts: Part[] = [];
        const apiParts: ({ text: string } | { inlineData: { mimeType: string, data: string } })[] = [];
        
        const userMessageId = Date.now().toString();
        const modelMessageId = (Date.now() + 1).toString();
    
        try {
            if (file) {
                if (file.size > 10 * 1024 * 1024) { // 10MB limit
                    throw new Error("File size exceeds 10MB.");
                }

                if (file.type.startsWith('image/')) {
                    const data = await fileToBase64(file);
                    const mimeType = file.type;
                    userMessageParts.push({ inlineData: { mimeType, data } });
                    apiParts.push({ inlineData: { mimeType, data } });
                } else if (file.type.startsWith('text/')) {
                    const fileContent = await fileToText(file);
                    const ragPrompt = `CONTEXT:\n${fileContent}\n\nBased on the context above, answer the following question:\n${prompt || 'Summarize the document.'}`;
                    apiParts.push({ text: ragPrompt });
                    userMessageParts.push({ fileName: file.name });
                } else {
                    throw new Error(`Unsupported file type: ${file.type}. Please upload an image or a text file.`);
                }
            }
    
            if (prompt.trim()) {
                userMessageParts.push({ text: prompt });
                if (!file || !file.type.startsWith('text/')) {
                    apiParts.push({ text: prompt });
                }
            }
    
            const newUserMessage: Message = { id: userMessageId, role: 'user', parts: userMessageParts };
            const modelPlaceholder: Message = { id: modelMessageId, role: 'model', parts: [] };
            
            setMessages(prev => [...prev, newUserMessage, modelPlaceholder]);
            
            const result = await chat.sendMessageStream({ message: apiParts });

            let text = '';
            let collectedFunctionCalls: any[] | undefined;
            for await (const chunk of result) {
                if (chunk.functionCalls) {
                    collectedFunctionCalls = chunk.functionCalls;
                } else {
                    text += chunk.text;
                    setMessages(prev => prev.map(msg => 
                        msg.id === modelMessageId ? { ...msg, parts: [{ text }] } : msg
                    ));
                }
            }

            if (collectedFunctionCalls) {
                const call = collectedFunctionCalls[0];
                if (call.name === 'setReminder') {
                    const { task, datetime } = call.args;

                    // This is a frontend simulation. In a real app, you would schedule a task on a backend.
                    const userFriendlyDate = new Date(datetime).toLocaleString();
                    const confirmationText = `✅ Reminder set for "${task}" on ${userFriendlyDate}.\n(This is a demo, no email will be sent).`;
                    
                    setMessages(prev => prev.map(msg =>
                        msg.id === modelMessageId ? { ...msg, parts: [{ text: confirmationText }] } : msg
                    ));
                    
                    const functionResponsePart = {
                        functionResponse: {
                          name: 'setReminder',
                          response: { success: true, message: `Reminder set for ${task} at ${datetime}` },
                        },
                    };

                    const finalResultStream = await chat.sendMessageStream({ message: [functionResponsePart] });

                    let finalResponseText = '';
                    for await (const chunk of finalResultStream) {
                        finalResponseText += chunk.text;
                        setMessages(prev => prev.map(msg =>
                            msg.id === modelMessageId ? { ...msg, parts: [{ text: finalResponseText }] } : msg
                        ));
                    }
                }
            }

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMessage);
            setMessages(prev => prev.filter(msg => msg.id !== userMessageId && msg.id !== modelMessageId));
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
                <div className="bg-red-500 text-white p-3 text-center text-sm z-20 relative flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="font-bold text-lg leading-none">&times;</button>
                </div>
            )}
            <main className="flex-grow overflow-hidden">
                {mode === 'chat' || mode === 'code' ? (
                    <ChatView messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
                ) : (
                    <ImageView images={images} onGenerateImage={handleGenerateImage} isLoading={isLoading} />
                )}
            </main>
        </div>
    );
};

export default App;