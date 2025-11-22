'use client';

import React, { useState } from 'react';
import { Play, Pause, Share2, MessageSquare, BarChart2, Type } from 'lucide-react';

export function EditorClient({ id }: { id: string }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeTab, setActiveTab] = useState('score');

    return (
        <div className="h-[calc(100vh-120px)] flex gap-6">
            {/* Left: Video Player Cockpit */}
            <div className="flex-1 relative rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl flex items-center justify-center group">
                {/* Placeholder Video */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />

                {/* Controls Overlay */}
                <div className="absolute bottom-8 left-8 right-8 flex items-center gap-4 p-4 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform"
                    >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-1" />}
                    </button>

                    <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer">
                        <div className="w-1/3 h-full bg-white rounded-full" />
                    </div>

                    <div className="text-xs font-mono text-white/80">00:12 / 00:45</div>
                </div>
            </div>

            {/* Right: AI Brain Panel */}
            <div className="w-[400px] flex flex-col gap-6">
                {/* Tabs */}
                <div className="flex p-1 rounded-xl bg-white/5 border border-white/10">
                    {[
                        { id: 'score', icon: BarChart2, label: 'Score' },
                        { id: 'transcript', icon: Type, label: 'Transcript' },
                        { id: 'social', icon: MessageSquare, label: 'Social' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-white/10 text-white shadow-lg'
                                    : 'text-white/40 hover:text-white/60'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 rounded-3xl backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08] overflow-y-auto">
                    {activeTab === 'score' && (
                        <div className="space-y-8">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 border-green-500/20 relative">
                                    <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent rotate-45" />
                                    <div className="text-4xl font-bold text-white">92</div>
                                </div>
                                <h3 className="mt-4 text-lg font-bold text-white">Viral Potential</h3>
                                <p className="text-white/40 text-sm">Top 5% of your niche</p>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-white/60 uppercase tracking-wider">Key Insights</h4>
                                {[
                                    "Strong hook in first 3 seconds",
                                    "High emotional sentiment detected",
                                    "Fast pacing matches TikTok trends"
                                ].map((insight, i) => (
                                    <div key={i} className="flex gap-3 text-sm text-white/80">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
                                        {insight}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'transcript' && (
                        <div className="space-y-4">
                            <p className="text-white/80 leading-relaxed">
                                <span className="text-purple-400 font-bold">00:00</span> So, the thing about AI is that it's not just changing how we work, it's changing how we think.
                            </p>
                            <p className="text-white/60 leading-relaxed">
                                <span className="text-white/20 font-bold">00:05</span> And if you look at the history of technology...
                            </p>
                        </div>
                    )}

                    {activeTab === 'social' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm text-white/60 mb-2">Generated Caption</label>
                                <textarea
                                    className="w-full h-32 p-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50 resize-none"
                                    defaultValue="This AI tool is insane! 🤯 #AI #Tech #Future"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/60 mb-2">Hashtags</label>
                                <div className="flex flex-wrap gap-2">
                                    {['#AI', '#Tech', '#Innovation', '#FutureOfWork'].map(tag => (
                                        <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/80">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold tracking-wide shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <Share2 className="w-5 h-5" />
                    Export & Publish
                </button>
            </div>
        </div>
    );
}
