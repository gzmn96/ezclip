export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    options: {
        maxRetries?: number;
        initialDelayMs?: number;
        maxDelayMs?: number;
        backoffMultiplier?: number;
        retryableErrors?: string[];
    } = {}
): Promise<T> {
    const {
        maxRetries = 3,
        initialDelayMs = 1000,
        maxDelayMs = 30000,
        backoffMultiplier = 2,
        retryableErrors = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', '429', '503']
    } = options;

    let lastError: Error | unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            // Check if error is retryable
            const errorMessage = error.message || '';
            const errorCode = error.code || '';

            const isRetryable = retryableErrors.some(err =>
                errorMessage.includes(err) || errorCode.includes(err)
            );

            if (!isRetryable && attempt < maxRetries) {
                // If we don't know if it's retryable, we might want to fail fast OR retry cautiously.
                // For now, let's assume we only retry explicitly retryable errors to avoid wasting API credits on 400s.
                // However, network glitches often don't have standard codes.
                // Let's be slightly more permissive for this demo if it's a network error type.
            }

            if (attempt === maxRetries) {
                throw lastError;
            }

            // Calculate delay with exponential backoff
            const delay = Math.min(
                initialDelayMs * Math.pow(backoffMultiplier, attempt),
                maxDelayMs
            );

            console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
}
