
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ChatMessage, Product } from "../types";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

const getMimeType = (base64: string): string => {
    return base64.substring(base64.indexOf(":") + 1, base64.indexOf(";"));
}

export const generateStyledImage = async (base64Image: string, prompt: string): Promise<string> => {
    const model = 'gemini-2.5-flash-image';
    const imagePart = fileToGenerativePart(base64Image.split(',')[1], getMimeType(base64Image));

    const response = await ai.models.generateContent({
        model,
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    
    const firstPart = response.candidates?.[0]?.content?.parts[0];
    if (firstPart && firstPart.inlineData) {
        return `data:${firstPart.inlineData.mimeType};base64,${firstPart.inlineData.data}`;
    }
    throw new Error("No image was generated.");
};

export const refineImageWithText = async (base64Image: string, prompt: string): Promise<string> => {
    // This function is essentially the same as generateStyledImage but for refinement
    return generateStyledImage(base64Image, prompt);
};


export const getShoppableLinks = async (base64Image: string, prompt: string): Promise<Product[]> => {
    const model = 'gemini-2.5-flash';
    const imagePart = fileToGenerativePart(base64Image.split(',')[1], getMimeType(base64Image));

    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                imagePart,
                { text: `Based on the user's request "${prompt}" and the provided image, find similar furniture or decor items. Provide a list of items.` },
            ],
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    products: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                itemName: { type: Type.STRING },
                                url: { type: Type.STRING },
                                price: { type: Type.STRING },
                            },
                             required: ["itemName", "url", "price"],
                        },
                    },
                },
                required: ["products"],
            },
        },
    });

    const jsonText = response.text.trim();
    try {
        const parsed = JSON.parse(jsonText);
        return parsed.products || [];
    } catch (e) {
        console.error("Failed to parse JSON for shoppable links:", e);
        return [];
    }
};

export const getChatResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const chat = ai.chats.create({
        model,
        config: {
            systemInstruction: "You are an expert interior design assistant. Your role is to help users understand design styles and provide helpful suggestions based on the conversation and the images they are working with. Be concise and friendly.",
        },
    });
    
    // Simplified history for this call
    const prompt = `Previous conversation: ${history.map(m => `${m.sender}: ${m.text}`).join('\n')}\n\nNew user message: ${newMessage}`;

    const response = await chat.sendMessage({ message: prompt });
    return response.text;
};
