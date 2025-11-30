import { GoogleGenAI } from "@google/genai";

/**
 * Generates a 4-panel comic based on an image and prompt using Gemini 3 Pro Image.
 * 
 * @param imageBase64 The base64 string of the source image.
 * @param mimeType The MIME type of the source image.
 * @param prompt The text instruction for the story/content.
 * @param style The artistic style of the comic.
 * @returns The base64 data URL of the generated image or null if failed.
 */
export const generateComicWithGemini = async (
  imageBase64: string,
  mimeType: string,
  prompt: string,
  style: string
): Promise<string | null> => {
  try {
    // Gemini 3 Pro requires a fresh instance with the current key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const finalPrompt = `
      Create a 4-panel comic strip (2x2 grid layout) based on the uploaded image.
      
      VISUAL STYLE: ${style}
      
      STORY INSTRUCTIONS: ${prompt}
      
      REQUIREMENTS:
      1. The character/subject from the source image should be the main protagonist.
      2. The output MUST be a single image containing exactly 4 panels arranged in a grid.
      3. Include speech bubbles or captions with legible text if appropriate for the story.
      4. Make it visually engaging and consistent in style across all panels.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: finalPrompt,
          },
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1", // Square aspect ratio works well for a 2x2 grid
          imageSize: "1K"     // High quality for text readability
        }
      }
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