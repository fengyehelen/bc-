import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Generate a creative name for a new gambling platform (mock admin feature)
export const generatePlatformName = async (keywords: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a catchy, short, and lucky name for a gambling app in Southeast Asia based on these keywords: ${keywords}. Return only the name.`,
    });
    return response.text?.trim() || 'LuckyBet';
  } catch (error) {
    console.error("Gemini Name Error:", error);
    return 'LuckyStar Casino';
  }
};

// Generate a logo description or mock logo generation (since real image gen returns bytes)
// We will use gemini-2.5-flash-image for image generation as per requirements
export const generatePlatformLogo = async (prompt: string): Promise<string> => {
  try {
    // Check if API key is present
    if (!process.env.API_KEY) {
        console.warn("No API Key, returning placeholder");
        return 'https://picsum.photos/200/200?random=99';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A modern, sleek, high quality logo for a gambling app. Gold and red colors. Theme: ${prompt}` }]
      }
    });

    // Extract base64 image from response
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    // Fallback if no image part found but text exists (unlikely for image model but good safety)
    return 'https://picsum.photos/200/200?random=100';

  } catch (error) {
    console.error("Gemini Logo Error:", error);
    // Fallback image if API fails or quota exceeded
    return 'https://picsum.photos/200/200?random=101';
  }
};
