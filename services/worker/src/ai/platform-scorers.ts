import { Scene } from '@ezclip/common';

// Mock OpenAI for now, will integrate real client later
const openai = {
    chat: {
        completions: {
            create: async (params: any) => ({
                choices: [{ message: { content: '{}' } }]
            })
        }
    }
};

export interface PlatformScore {
    viralScore: number;
    relevanceScore?: number;
    engagementScore?: number;
    hookScore?: number;
    trendScore?: number;
    aestheticScore?: number;
    saveScore?: number;
    reasoning: string;
    suggestedCaption: string;
    suggestedHashtags: string[];
    improvements?: string[];
    suggestedSound?: string;
    filterSuggestion?: string;
}

export class PlatformScorer {

    // Mock trends for MVP
    private getLinkedInTrends() {
        return ['AI in workplace', 'Remote work tips', 'Career growth', 'Leadership'];
    }

    private getTikTokTrends() {
        return ['Productivity hacks', 'Day in the life', 'Behind the scenes'];
    }

    private getTrendingSounds() {
        return ['Trending Sound A', 'Trending Sound B'];
    }

    private getInstagramTrends() {
        return ['Aesthetic', 'Lifestyle', 'Travel', 'Food'];
    }

    async scoreForLinkedIn(scene: Scene): Promise<PlatformScore> {
        const prompt = `
You are a LinkedIn content strategist analyzing a video clip.

SCENE DETAILS:
- Duration: ${scene.end - scene.start}s
- Transcript: "${scene.reason}"
- Visual elements: ${JSON.stringify(scene)}

LINKEDIN CONTEXT:
- Audience: Professionals aged 25-55
- Best content: Insights, career tips, industry news, thought leadership
- Optimal length: 30-90 seconds
- Tone: Professional but approachable
- Avoid: Overly casual, memes, non-work content

CURRENT LINKEDIN TRENDS (this week):
${this.getLinkedInTrends().join('\n')}

TASK:
Rate this clip's potential on LinkedIn (0-100) and explain:
1. Viral Score (will it get shared/commented?)
2. Relevance Score (matches LinkedIn audience?)
3. Engagement Score (likes/comments prediction)

Return JSON:
{
  "viralScore": 0-100,
  "relevanceScore": 0-100,
  "engagementScore": 0-100,
  "reasoning": "Why this works/doesn't work for LinkedIn",
  "suggestedCaption": "Hook + value prop in first line",
  "suggestedHashtags": ["#CareerGrowth", "#Leadership"],
  "improvements": ["Make it more actionable", "Add data/stats"]
}
`;

        // Mock response for now
        return {
            viralScore: 85,
            relevanceScore: 90,
            engagementScore: 80,
            reasoning: "Good professional insight.",
            suggestedCaption: "Here's how to optimize your workflow.",
            suggestedHashtags: ["#Productivity", "#WorkLife"],
            improvements: ["Add more data"]
        };
    }

    async scoreForTikTok(scene: Scene): Promise<PlatformScore> {
        const prompt = `
You are a TikTok growth expert analyzing a video clip.

SCENE DETAILS:
- Duration: ${scene.end - scene.start}s
- Transcript: "${scene.reason}"

TIKTOK CONTEXT:
- Audience: Gen Z/Millennials (16-34)
- Best content: Entertainment, trends, hooks in first 3 seconds
- Optimal length: 15-30 seconds
- Tone: Casual, fun, authentic, fast-paced
- Critical: First 3 seconds determine success

CURRENT TIKTOK TRENDS:
${this.getTikTokTrends().join('\n')}

TRENDING SOUNDS THIS WEEK:
${this.getTrendingSounds().join('\n')}

TASK:
Rate this clip for TikTok (0-100):
1. Does it hook in first 3 seconds?
2. Is it entertaining/valuable?
3. Does it match current trends?
4. Will it get saved/shared?

Return JSON:
{
  "viralScore": 0-100,
  "hookScore": 0-100, // First 3 seconds
  "trendScore": 0-100, // Matches trends
  "reasoning": "Why this works for TikTok",
  "suggestedCaption": "Short, emoji-heavy, relatable",
  "suggestedHashtags": ["#ForYouPage", "#Viral"],
  "suggestedSound": "trending_sound_name",
  "improvements": ["Add text overlay", "Faster pacing"]
}
`;

        return {
            viralScore: 92,
            hookScore: 95,
            trendScore: 88,
            reasoning: "Strong hook and relatable content.",
            suggestedCaption: "You won't believe this! 🤯",
            suggestedHashtags: ["#FYP", "#Viral"],
            suggestedSound: "Trending Sound A",
            improvements: ["Add text overlay"]
        };
    }

    async scoreForInstagram(scene: Scene): Promise<PlatformScore> {
        const prompt = `
You are an Instagram Reels strategist.

SCENE DETAILS:
- Duration: ${scene.end - scene.start}s

INSTAGRAM CONTEXT:
- Audience: Visual-first, lifestyle-focused (18-44)
- Best content: Aesthetic, aspirational, relatable
- Optimal length: 20-40 seconds
- Tone: Polished but authentic
- Critical: Visual appeal is paramount

CURRENT INSTAGRAM TRENDS:
${this.getInstagramTrends().join('\n')}

TASK:
Rate for Instagram Reels (0-100):
1. Visual appeal (color, composition, lighting)
2. Relatability (lifestyle fit)
3. Save-worthiness (educational/inspirational)

Return JSON:
{
  "viralScore": 0-100,
  "aestheticScore": 0-100,
  "saveScore": 0-100, // Will users save it?
  "reasoning": "Why this works for IG",
  "suggestedCaption": "Inspirational + call-to-action",
  "suggestedHashtags": ["#ReelsInstagram", "#Aesthetic"],
  "filterSuggestion": "Warm tones",
  "improvements": ["Better lighting", "Add B-roll"]
}
`;

        return {
            viralScore: 88,
            aestheticScore: 90,
            saveScore: 85,
            reasoning: "Visually pleasing and aspirational.",
            suggestedCaption: "Dream big. ✨",
            suggestedHashtags: ["#Inspiration", "#Lifestyle"],
            filterSuggestion: "Warm tones",
            improvements: ["Better lighting"]
        };
    }
}
