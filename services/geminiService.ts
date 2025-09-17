import { GoogleGenAI, Modality } from "@google/genai";
import { AspectRatio, GroundingSource } from "../types";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRandomPrompt = async (): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Generate a single, imaginative, and visually descriptive prompt for an AI image generator. The prompt should be detailed and inspiring. Do not use markdown or any other formatting. Respond with only the prompt text.",
             config: {
                // Disable thinking for low latency
                thinkingConfig: { thinkingBudget: 0 },
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating random prompt:", error);
        throw new Error("Failed to generate a random prompt.");
    }
};

export const enhancePrompt = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Enhance this prompt for an AI image generator. Make it more descriptive, evocative, and detailed. Focus on visual elements like lighting, style, and composition. Respond with ONLY the enhanced prompt. Original prompt: "${prompt}"`,
            config: {
                // Disable thinking for low latency
                thinkingConfig: { thinkingBudget: 0 },
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error enhancing prompt:", error);
        throw new Error("Failed to enhance prompt. Please check the console for details.");
    }
};


export const generateImage = async (prompt: string, aspectRatio: AspectRatio, negativePrompt?: string): Promise<string> => {
    try {
        const config: any = {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: aspectRatio,
        };

        if (negativePrompt) {
            config.negativePrompt = negativePrompt;
        }

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: config,
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image. Please check the console for details.");
    }
};

export const generateImageWithSearch = async (prompt: string): Promise<{ imageUrl: string; sources: GroundingSource[] }> => {
    try {
        // Step 1: Use Google Search to get a detailed description and sources
        const searchResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the latest information from Google Search, create a highly detailed, descriptive, and visually rich prompt for an AI image generator to create an image about: "${prompt}". The prompt should describe a complete scene, including subject, environment, lighting, and style. Do not generate the image, only the descriptive text prompt.`,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const detailedPrompt = searchResponse.text;
        if (!detailedPrompt) {
            throw new Error("Failed to generate a detailed prompt from search results.");
        }

        const groundingMetadata = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const sources: GroundingSource[] = groundingMetadata
            ? groundingMetadata.map((chunk: any) => ({
                  uri: chunk.web.uri,
                  title: chunk.web.title,
              }))
            : [];
        
        // Step 2: Use the detailed prompt to generate an image
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: detailedPrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '16:9', // Default to 16:9 for search results, often cinematic
            },
        });

        if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
            const imageUrl = imageResponse.generatedImages[0].image.imageBytes;
            return { imageUrl, sources };
        } else {
            throw new Error("No image was generated from the search-enhanced prompt.");
        }

    } catch (error) {
        console.error("Error generating image with search:", error);
        throw new Error("Failed to generate image with search. Please check the console for details.");
    }
};

export const editImage = async (prompt: string, base64ImageData: string, mimeType: string): Promise<{ imageUrl: string | null; text: string | null }> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        let imageUrl: string | null = null;
        let text: string | null = null;

        if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    imageUrl = part.inlineData.data;
                } else if (part.text) {
                    text = part.text;
                }
            }
        }
        
        if (!imageUrl) {
            throw new Error("The AI did not return an edited image.");
        }

        return { imageUrl, text };
    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit image. Please check the console for details.");
    }
};


export const generateVideo = async (prompt: string, image?: { base64ImageData: string; mimeType: string }): Promise<string> => {
    try {
        const payload: any = {
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
            },
        };

        if (image) {
            payload.image = {
                imageBytes: image.base64ImageData,
                mimeType: image.mimeType,
            };
        }

        let operation = await ai.models.generateVideos(payload);

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (!downloadLink) {
            throw new Error("Video generation completed, but no download link was found.");
        }

        return downloadLink;

    } catch (error) {
        console.error("Error generating video:", error);
        throw new Error("Failed to generate video. Please check the console for details.");
    }
};