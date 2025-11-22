'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ProcessingStatusProps {
    jobId: string;
    onComplete?: () => void;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ jobId, onComplete }) => {
    const [status, setStatus] = useState<string>('Initializing...');
    const [progress, setProgress] = useState<number>(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (!jobId) return;

        const eventSource = new EventSource(`/api/progress/${jobId}`);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.status) setStatus(data.status);
                if (typeof data.progress === 'number') setProgress(data.progress);

                if (data.progress === 100) {
                    setTimeout(() => {
                        setIsVisible(false);
                        if (onComplete) onComplete();
                        eventSource.close();
                    }, 2000); // Linger for a moment to show completion
                }
            } catch (e) {
                console.error('Failed to parse progress event', e);
            }
        };

        eventSource.onerror = () => {
            // eventSource.close(); // Keep trying to reconnect in case of transient network issues
        };

        return () => {
            eventSource.close();
        };
    }, [jobId, onComplete]);

    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className={cn(
                "fixed bottom-8 left-1/2 -translate-x-1/2 z-50",
                "flex items-center gap-6 px-6 py-4",
                "rounded-full",
                "backdrop-blur-3xl bg-white/5 border border-white/10",
                "shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
                "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]" // Inner glow ring
            )}
        >
            {/* Status Text with Shimmer */}
            <div className="min-w-[200px] relative h-6 overflow-hidden">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={status}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="absolute inset-0 flex items-center"
                    >
                        <span className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/50 animate-pulse">
                            {status}
                        </span>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Liquid Beam Progress Bar */}
            <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                >
                    {/* Glow Effect */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white blur-md opacity-50" />
                </motion.div>
            </div>

            {/* Percentage */}
            <div className="w-12 text-right font-mono text-xs text-white/50">
                {Math.round(progress)}%
            </div>
        </motion.div>
    );
};
