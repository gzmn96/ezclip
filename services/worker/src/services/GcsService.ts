import { Storage } from '@google-cloud/storage';
import path from 'path';

export class GcsService {
    private storage: Storage;
    private bucketName: string;

    constructor(bucketName: string) {
        this.storage = new Storage();
        this.bucketName = bucketName;
    }

    async uploadFile(filePath: string, destination: string): Promise<string> {
        const bucket = this.storage.bucket(this.bucketName);
        const [file] = await bucket.upload(filePath, {
            destination,
            metadata: {
                cacheControl: 'public, max-age=31536000',
            },
        });

        // Return the gs:// URI for internal use with other Google Cloud services
        return `gs://${this.bucketName}/${destination}`;
    }

    async getPublicUrl(destination: string): Promise<string> {
        const bucket = this.storage.bucket(this.bucketName);
        const file = bucket.file(destination);
        // Assuming the bucket is public or we are generating signed URLs. 
        // For now, let's return the public URL format.
        return `https://storage.googleapis.com/${this.bucketName}/${destination}`;
    }

    async downloadFile(fileName: string, destinationPath: string): Promise<void> {
        const bucket = this.storage.bucket(this.bucketName);
        const file = bucket.file(fileName);
        await file.download({ destination: destinationPath });
    }
}
