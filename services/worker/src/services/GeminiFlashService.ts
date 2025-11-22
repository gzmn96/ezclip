import { VertexAI, GenerativeModel } from '@google-cloud/vertexai';
import { retryWithBackoff } from '../utils/retry.js';

export interface InterestRegion {
    start: number;
    end: number;
    reason: string;
    score: number;
}

export class GeminiFlashService {
    private model: GenerativeModel;

    constructor(projectId: string, location: string = 'us-central1') {
        const vertexAI = new VertexAI({ project: projectId, location });
        this.model = vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }

    async findHighInterestRegions(transcript: string): Promise<InterestRegion[]> {
        const prompt = `
        You are a viral content editor. Analyze the following video transcript and identify "High Interest Regions".
        Look for:
        - Viral topics or controversial statements
        - Laughter or high energy moments
        - Strong sentiment or emotional peaks
        - "Hook" beginnings

        TRANSCRIPT:
        ${transcript.substring(0, 30000)}... (truncated if too long)

        Return a JSON object with a list of regions. Each region should have:
        - start: number (start time in seconds)
        - end: number (end time in seconds)
        - reason: string (why this is interesting)
        - score: number (0-100 interest score)

        Output format:
        {
            "regions": [
                { "start": 10.5, "end": 25.0, "reason": "Funny joke", "score": 90 }
            ]
        }
        `;

        return retryWithBackoff(async () => {
            const result = await this.model.generateContent(prompt);
            const response = result.response;
            const text = response.candidates?.[0].content.parts[0].text;

            if (!text) {
                throw new Error('Empty response from Gemini Flash');
            }

            // Clean up code blocks if present
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

            try {
                const parsed = JSON.parse(cleanText);
                return parsed.regions || [];
            } catch (e) {
                console.error('Failed to parse Gemini Flash response:', text);
                throw new Error('Invalid JSON from Gemini Flash');
            }
        });
    }
}
