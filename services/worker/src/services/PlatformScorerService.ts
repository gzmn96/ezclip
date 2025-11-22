import OpenAI from 'openai';
import { Scene } from '@ezclip/common';
import { retryWithBackoff } from '../utils/retry.js';

export interface PlatformScore {
    platform: 'linkedin' | 'tiktok' | 'instagram' | 'youtube_shorts';
    viralScore: number; // 0-100
    engagementScore: number; // 0-100
    relevanceScore: number; // 0-100
    reasoning: string;
    suggestedCaption: string;
    suggestedHashtags: string[];
    improvements: string[];
    matchesTrend?: {
        trendName: string;
        confidence: number;
    };
}

export class PlatformScorerService {
    private openai: OpenAI;

    constructor(apiKey: string) {
        this.openai = new OpenAI({ apiKey });
    }

    async scoreForLinkedIn(scene: Scene, transcript: string): Promise<PlatformScore> {
        const criteria = `
    - Professional tone (weight: 30%)
    - Educational/insightful content (weight: 25%)
    - B2B relevance (weight: 20%)
    - Thought leadership indicators (weight: 15%)
    - Duration: 30-90 seconds optimal (weight: 10%)
    `;
        return this.analyzeWithGPT(scene, transcript, 'linkedin', criteria);
    }

    async scoreForTikTok(scene: Scene, transcript: string): Promise<PlatformScore> {
        const criteria = `
    - Hook in first 3 seconds (weight: 40%)
    - Entertainment value (weight: 25%)
    - Trend alignment (weight: 20%)
    - Fast pacing (weight: 10%)
    - Duration: 15-30 seconds optimal (weight: 5%)
    `;
        return this.analyzeWithGPT(scene, transcript, 'tiktok', criteria);
    }

    async scoreForInstagram(scene: Scene, transcript: string): Promise<PlatformScore> {
        const criteria = `
    - Visual aesthetics (weight: 35%)
    - Aspirational/lifestyle content (weight: 25%)
    - Save-worthiness (weight: 20%)
    - Audio quality (weight: 10%)
    - Duration: 20-40 seconds optimal (weight: 10%)
    `;
        return this.analyzeWithGPT(scene, transcript, 'instagram', criteria);
    }

    async scoreForYouTubeShorts(scene: Scene, transcript: string): Promise<PlatformScore> {
        const criteria = `
    - High retention/loopability (weight: 35%)
    - Clear narrative arc (weight: 25%)
    - Searchability/SEO potential (weight: 20%)
    - Call to action (Subscribe) (weight: 10%)
    - Duration: up to 60 seconds (weight: 10%)
    `;
        return this.analyzeWithGPT(scene, transcript, 'youtube_shorts', criteria);
    }

    private async analyzeWithGPT(
        scene: Scene,
        transcript: string,
        platform: PlatformScore['platform'],
        platformCriteria: string
    ): Promise<PlatformScore> {
        const prompt = `
    You are a ${platform} content strategist analyzing a video clip for viral potential.

    CLIP DATA:
    - Duration: ${scene.end - scene.start}s
    - Transcript: "${transcript.substring(0, 1000)}..." (truncated)
    - Visual elements: ${scene.reason}
    
    SCORING CRITERIA FOR ${platform.toUpperCase()}:
    ${platformCriteria}

    TASK:
    Rate this clip's viral potential on ${platform} (0-100) across three dimensions:
    1. Viral Score: Will this spread?
    2. Engagement Score: Will people interact (like/comment/share)?
    3. Relevance Score: Does it match the platform's content norms?

    Return ONLY valid JSON with this exact structure:
    {
      "viralScore": number,
      "engagementScore": number,
      "relevanceScore": number,
      "reasoning": "2-3 sentence explanation",
      "suggestedCaption": "platform-optimized caption with hook",
      "suggestedHashtags": ["tag1", "tag2", "tag3"],
      "improvements": ["specific improvement 1", "specific improvement 2"]
    }
    `;

        return retryWithBackoff(async () => {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' },
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error('No content from GPT');

            const result = JSON.parse(content);
            return {
                platform,
                ...result,
            };
        });
    }
}
