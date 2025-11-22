import { v1 } from '@google-cloud/video-intelligence';

const { VideoIntelligenceServiceClient } = v1;

export interface CropCoordinates {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class VideoIntelligenceService {
    private client: v1.VideoIntelligenceServiceClient;

    constructor() {
        this.client = new VideoIntelligenceServiceClient();
    }

    async analyzeForCropping(gcsUri: string) {
        const request = {
            inputUri: gcsUri,
            features: ['PERSON_DETECTION'] as unknown as any[], // Type casting due to library quirks sometimes
            videoContext: {
                personDetectionConfig: {
                    includeBoundingBoxes: true,
                    includePoseLandmarks: false,
                    includeAttributes: false,
                },
            },
        };

        const [operation] = await this.client.annotateVideo(request);
        console.log('Waiting for Video Intelligence operation...');
        const [result] = await operation.promise();

        const personAnnotations = result.annotationResults?.[0].personDetectionAnnotations;
        return personAnnotations || [];
    }

    // Simple logic: Find the most prominent person at a given timestamp
    // In a real "Supreme" app, we'd use smoothing and tracking ID continuity
    calculateCrop(timestampSeconds: number, personAnnotations: any[]): CropCoordinates | null {
        // Convert seconds to microseconds (API uses microseconds)
        const timestampMicros = timestampSeconds * 1000000;

        let bestBox = null;
        let maxArea = 0;

        for (const person of personAnnotations) {
            for (const track of person.tracks) {
                const segmentStart = (track.segment.startTimeOffset.seconds || 0) * 1000000 + (track.segment.startTimeOffset.nanos || 0) / 1000;
                const segmentEnd = (track.segment.endTimeOffset.seconds || 0) * 1000000 + (track.segment.endTimeOffset.nanos || 0) / 1000;

                if (timestampMicros >= segmentStart && timestampMicros <= segmentEnd) {
                    // Find the bounding box for this specific timestamp (or closest)
                    const timestampedObject = track.timestampedObjects.find((obj: any) => {
                        const objTime = (obj.timeOffset.seconds || 0) * 1000000 + (obj.timeOffset.nanos || 0) / 1000;
                        // Simple proximity check, could be optimized
                        return Math.abs(objTime - timestampMicros) < 500000; // within 0.5s
                    });

                    if (timestampedObject && timestampedObject.normalizedBoundingBox) {
                        const box = timestampedObject.normalizedBoundingBox;
                        const width = box.right - box.left;
                        const height = box.bottom - box.top;
                        const area = width * height;

                        if (area > maxArea) {
                            maxArea = area;
                            bestBox = box;
                        }
                    }
                }
            }
        }

        if (bestBox) {
            // Convert normalized coordinates (0-1) to pixel logic later, or return normalized
            // Here we return normalized x, y (top-left) and width, height
            return {
                x: bestBox.left,
                y: bestBox.top,
                width: bestBox.right - bestBox.left,
                height: bestBox.bottom - bestBox.top
            };
        }

        return null;
    }
}
