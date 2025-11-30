import { GoogleGenAI } from "@google/genai";

// Initialize the client with the API key from the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Edits an image based on a text prompt using Gemini 2.5 Flash Image.
 * 
 * @param imageBase64 The base64 string of the source image (without data:image/... prefix).
 * @param mimeType The MIME type of the source image (e.g., 'image/jpeg').
 * @param prompt The text instruction for editing.
 * @returns The base64 data URL of the generated image or null if failed.
 */
export const editImageWithGemini = async (
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: prompt,
          },
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
        ],
      },
      // Note: responseMimeType and responseSchema are not supported for nano banana models
    });

    // Iterate through parts to find the image part
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          // Construct the data URL
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    console.warn("No image data found in response parts.");
    return null;

  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    throw error;
  }
};