import { db } from '@ezclip/db';
import { apiCosts } from '@ezclip/db/schema';
import { eq, sql } from 'drizzle-orm';

export class CostTrackingService {
    // Costs per unit
    private readonly COSTS = {
        VIDEO_INTELLIGENCE_PER_MIN: 0.10,
        SPEECH_TO_TEXT_PER_15S: 0.006,
        GPT4O_INPUT_1K: 0.005, // $5/1M
        GPT4O_OUTPUT_1K: 0.015, // $15/1M
        GEMINI_INPUT_1K: 0.00125, // $1.25/1M
        GEMINI_OUTPUT_1K: 0.005, // $5/1M
    };

    async trackVideoIntelligenceCost(
        userId: string,
        videoId: string,
        durationMinutes: number
    ): Promise<void> {
        const cost = durationMinutes * this.COSTS.VIDEO_INTELLIGENCE_PER_MIN;
        await this.logCost(userId, videoId, 'video_intelligence', cost, { durationMinutes });
    }

    async trackGPTCost(
        userId: string,
        videoId: string,
        inputTokens: number,
        outputTokens: number,
        model: 'gpt-4o' | 'gpt-4o-mini' = 'gpt-4o'
    ): Promise<void> {
        const inputCost = (inputTokens / 1000) * this.COSTS.GPT4O_INPUT_1K;
        const outputCost = (outputTokens / 1000) * this.COSTS.GPT4O_OUTPUT_1K;
        const totalCost = inputCost + outputCost;

        await this.logCost(userId, videoId, model, totalCost, { inputTokens, outputTokens });
    }

    async trackGeminiCost(
        userId: string,
        videoId: string,
        inputTokens: number,
        outputTokens: number
    ): Promise<void> {
        const inputCost = (inputTokens / 1000) * this.COSTS.GEMINI_INPUT_1K;
        const outputCost = (outputTokens / 1000) * this.COSTS.GEMINI_OUTPUT_1K;
        const totalCost = inputCost + outputCost;

        await this.logCost(userId, videoId, 'gemini-1.5-pro', totalCost, { inputTokens, outputTokens });
    }

    private async logCost(
        userId: string,
        videoId: string,
        service: string,
        costUsd: number,
        details: any
    ): Promise<void> {
        try {
            // We need to cast costUsd to string because numeric type in Postgres/Drizzle expects string for precision
            await db.insert(apiCosts).values({
                userId,
                videoId,
                service,
                costUsd: costUsd.toFixed(6),
                details,
            });
        } catch (error) {
            console.error('Failed to log API cost', error);
            // Don't throw, we don't want to fail the job just because cost tracking failed
        }
    }

    async getTotalCostForUser(userId: string): Promise<number> {
        const result = await db
            .select({ total: sql<number>`sum(${apiCosts.costUsd})` })
            .from(apiCosts)
            .where(eq(apiCosts.userId, userId));

        return result[0]?.total || 0;
    }
}
