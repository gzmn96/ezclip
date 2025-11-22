import OpenAI from 'openai';
import fs from 'fs';

export class WhisperService {
    private openai: OpenAI;

    constructor(apiKey: string) {
        this.openai = new OpenAI({ apiKey });
    }

    async transcribe(audioPath: string) {
        const transcription = await this.openai.audio.transcriptions.create({
            file: fs.createReadStream(audioPath),
            model: 'whisper-1',
            response_format: 'verbose_json',
            timestamp_granularities: ['word'],
        });

        return transcription;
    }
}
