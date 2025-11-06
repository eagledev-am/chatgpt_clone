
import { GoogleGenAI, Chat } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this environment, we assume the key is present.
  console.warn("API_KEY environment variable not set. App will not function correctly.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
        systemInstruction: 'You are Abdo AI, a helpful and creative assistant. Keep your responses concise and friendly.'
    }
  });
};

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/png;base64,${base64ImageBytes}`;
    } else {
      throw new Error("No image was generated. The response may have been blocked.");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error("Failed to generate image due to an unknown error.");
  }
};
