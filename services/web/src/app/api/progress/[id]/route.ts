import { NextRequest, NextResponse } from 'next/server';
import { createRedisClient } from '@ezclip/common';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: jobId } = await params;
    const encoder = new TextEncoder();

    // Create a dedicated Redis client for subscription
    const redisSubscriber = createRedisClient();
    const channel = `job-progress:${jobId}`;

    const stream = new ReadableStream({
        async start(controller) {
            // Subscribe to the channel
            await redisSubscriber.subscribe(channel);

            // Handle incoming messages
            redisSubscriber.on('message', (chn, message) => {
                if (chn === channel) {
                    const data = `data: ${message}\n\n`;
                    controller.enqueue(encoder.encode(data));
                }
            });

            // Send initial connection message
            const initData = `data: ${JSON.stringify({ status: 'connected', progress: 0 })}\n\n`;
            controller.enqueue(encoder.encode(initData));

            // Keep connection alive with ping
            const interval = setInterval(() => {
                controller.enqueue(encoder.encode(': ping\n\n'));
            }, 15000);

            // Cleanup on close
            request.signal.addEventListener('abort', () => {
                clearInterval(interval);
                redisSubscriber.quit();
            });
        },
        cancel() {
            redisSubscriber.quit();
        }
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
