'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Clock, TrendingUp, Youtube, Plus, Upload } from 'lucide-react';
import { ingestVideo, connectYouTubeChannel } from './actions';
import { ProcessingStatus } from '@/components/ProcessingStatus';

export default function DashboardPage() {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [activeJobId, setActiveJobId] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    const stats = [
        { label: 'Time Saved', value: '12.5 hrs', icon: Clock, color: 'text-blue-400' },
        { label: 'Viral Score', value: '92.4', icon: TrendingUp, color: 'text-green-400' },
        { label: 'Clips Created', value: '128', icon: Play, color: 'text-purple-400' },
    ];

    const handleUpload = async (formData: FormData) => {
        const result = await ingestVideo(formData);
        if (result.success && result.videoId) {
            setActiveJobId(result.videoId);
            setIsUploadModalOpen(false);
        } else {
            alert(result.error);
        }
    };

    const handleConnectChannel = async () => {
        setIsConnecting(true);
        await connectYouTubeChannel();
        setIsConnecting(false);
        alert("Channel connected! (Mock)");
    };

    return (
        <div className="space-y-8">
            {/* Active Job Status */}
            {activeJobId && (
                <ProcessingStatus jobId={activeJobId} onComplete={() => setActiveJobId(null)} />
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 30 }}
                        className="p-6 rounded-2xl backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:bg-white/[0.06] transition-colors group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Last 30 Days</span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1 group-hover:scale-105 transition-transform origin-left">
                            {stat.value}
                        </div>
                        <div className="text-sm text-white/60">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Channel Connection & Upload Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Auto-Pilot Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-8 rounded-2xl backdrop-blur-2xl bg-gradient-to-br from-red-500/10 to-transparent border border-white/[0.08] relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-32 bg-red-500/20 blur-[100px] rounded-full pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-4 rounded-full bg-red-600/20 text-red-500">
                                <Youtube className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Auto-Pilot</h3>
                                <p className="text-white/60 text-sm">Connect your channel for automatic processing</p>
                            </div>
                        </div>

                        <button
                            onClick={handleConnectChannel}
                            disabled={isConnecting}
                            className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium transition-all flex items-center justify-center gap-2"
                        >
                            {isConnecting ? 'Connecting...' : 'Connect YouTube Channel'}
                        </button>
                    </div>
                </motion.div>

                {/* Manual Upload Card */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-8 rounded-2xl backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col justify-center items-center text-center group cursor-pointer hover:border-purple-500/30 transition-colors"
                    onClick={() => setIsUploadModalOpen(true)}
                >
                    <div className="p-6 rounded-full bg-white/5 mb-6 group-hover:scale-110 transition-transform duration-500">
                        <Plus className="w-8 h-8 text-white/80" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">New Project</h3>
                    <p className="text-white/60 text-sm max-w-xs">
                        Paste a YouTube URL to manually start the AI analysis pipeline.
                    </p>
                </motion.div>
            </div>

            {/* Recent Clips Grid */}
            <div>
                <h2 className="text-xl font-bold text-white mb-6">Recent Viral Clips</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {/* Mock Data for now */}
                    {[1, 2, 3, 4, 5].map((i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="aspect-[9/16] rounded-xl bg-white/[0.05] border border-white/[0.05] overflow-hidden relative group cursor-pointer"
                        >
                            {/* Placeholder for Video Thumbnail */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />

                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-1 rounded-md bg-green-500/20 text-green-400 text-[10px] font-bold border border-green-500/20">
                                        9{i} SCORE
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-white line-clamp-2">
                                    Why AI is changing everything...
                                </p>
                            </div>

                            {/* Hover Play Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                                <div className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                                    <Play className="w-6 h-6 text-white fill-white" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {isUploadModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsUploadModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative z-10 w-full max-w-lg p-8 rounded-3xl bg-[#0A0A0F] border border-white/10 shadow-2xl"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">Import Video</h2>
                            <form action={handleUpload} className="space-y-6">
                                <div className="relative">
                                    <input
                                        name="url"
                                        type="text"
                                        placeholder="Paste YouTube URL..."
                                        className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                        autoFocus
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/5">
                                        <Upload className="w-4 h-4 text-white/50" />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold tracking-wide hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20"
                                >
                                    Start Analysis
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
