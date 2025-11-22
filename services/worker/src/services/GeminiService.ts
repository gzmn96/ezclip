import { VertexAI, GenerativeModel, Part } from '@google-cloud/vertexai';

export interface ViralMoment {
    start_time: string; // "MM:SS" or seconds
    end_time: string;
    viral_score: number;
    explanation: string;
}

export class GeminiService {
    private vertexAI: VertexAI;
    private model: GenerativeModel;

    constructor(projectId: string, location: string = 'us-central1') {
        this.vertexAI = new VertexAI({ project: projectId, location });
        this.model = this.vertexAI.getGenerativeModel({
            model: 'gemini-1.5-pro-preview-0409', // Using the latest preview for best video performance
            generationConfig: {
                maxOutputTokens: 2048,
                temperature: 0.4,
                topP: 0.95,
            },
        });
    }

    async analyzeVideo(gcsUri: string): Promise<ViralMoment[]> {
        const videoPart: Part = {
            fileData: {
                fileUri: gcsUri,
                mimeType: 'video/mp4',
            },
        };

        const prompt = `
        Act as an expert TikTok/Reels editor. I need you to watch this video and identify the 3 most viral moments that would perform well as short clips (under 60 seconds).
        
        For each moment, provide:
        1. start_time: The start time of the clip (in MM:SS format).
        2. end_time: The end time of the clip (in MM:SS format).
        3. viral_score: A score from 0-100 indicating potential virality.
        4. explanation: A detailed explanation of why this moment is viral (humor, shock value, relatable, insight, etc.).
        
        Return the result as a valid JSON array of objects. Do not include markdown formatting like \`\`\`json. Just the raw JSON.
        `;

        const result = await this.model.generateContent({
            contents: [{ role: 'user', parts: [videoPart, { text: prompt }] }],
        });

        const response = result.response;
        const text = response.candidates?.[0].content.parts[0].text;

        if (!text) {
            throw new Error('No response from Gemini');
        }

        // Clean up potential markdown code blocks if Gemini adds them despite instructions
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const moments: ViralMoment[] = JSON.parse(cleanText);
            return moments;
        } catch (e) {
            console.error('Failed to parse Gemini response:', text);
            throw new Error('Invalid JSON response from Gemini');
        }
    }
}
