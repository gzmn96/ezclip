'use server';

import { auth } from "@/auth";
import { createQueue, QUEUES, IngestJob } from "@ezclip/common";
import { revalidatePath } from "next/cache";

// Initialize Queue
const ingestQueue = createQueue<IngestJob>(QUEUES.ingest);

export async function ingestVideo(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const url = formData.get("url") as string;
    if (!url) {
        return { error: "URL is required" };
    }

    // Extract video ID from URL
    const videoIdMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
        return { error: "Invalid YouTube URL" };
    }

    try {
        await ingestQueue.add("ingest", { videoId }, {
            jobId: videoId // Deduplication
        });

        revalidatePath("/dashboard");
        return { success: true, videoId };
    } catch (error) {
        console.error("Failed to queue job:", error);
        return { error: "Failed to process video" };
    }
}

export async function connectYouTubeChannel() {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    // In a real app, we would:
    // 1. Fetch the user's Google Access Token from the DB (Account table).
    // 2. Call YouTube API to get the Channel ID.
    // 3. Save Channel ID to user profile.
    // 4. Call PubSubHubbub to subscribe to push notifications.

    // Simulating the WebSub subscription call
    console.log(`[Mock] Subscribing to WebSub for user ${session.user.id}`);

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return { success: true };
}
