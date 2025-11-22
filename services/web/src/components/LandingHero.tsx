'use client';

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

export function LandingHero({ dashboardUrl }: { dashboardUrl: string }) {
    return (
        <section className="relative pt-48 pb-32 overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        y: [0, -50, 0],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        y: [0, 50, 0],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]"
                />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
                        Turn Long Videos into <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-pulse">
                            Viral Gold
                        </span>.
                    </h1>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
                        Stop editing manually. Our AI analyzes your content, finds the viral hooks,
                        and creates 9:16 clips ready for TikTok & Reels.
                    </p>

                    <div className="flex items-center justify-center gap-4">
                        <Link
                            href={dashboardUrl}
                            className="group relative px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                        >
                            Start Creating for Free
                            <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.div>

                {/* The Hook: Before/After Animation */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 1 }}
                    className="mt-24 relative max-w-5xl mx-auto"
                >
                    <div className="aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#0A0A0F] relative group">
                        {/* Mock UI of the Editor */}
                        <div className="absolute inset-0 flex">
                            {/* Left: Video Player */}
                            <div className="w-2/3 bg-black/50 flex items-center justify-center relative border-r border-white/5">
                                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform cursor-pointer">
                                    <Play className="w-6 h-6 text-white fill-white" />
                                </div>
                                <div className="absolute bottom-8 left-8 right-8">
                                    <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full w-1/3 bg-purple-500 rounded-full" />
                                    </div>
                                </div>
                            </div>

                            {/* Right: AI Analysis */}
                            <div className="w-1/3 bg-white/[0.02] p-6 flex flex-col gap-4">
                                <div className="h-8 w-3/4 bg-white/10 rounded-lg animate-pulse" />
                                <div className="h-4 w-full bg-white/5 rounded-lg" />
                                <div className="h-4 w-5/6 bg-white/5 rounded-lg" />

                                <div className="mt-auto p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                                    <div className="text-green-400 text-sm font-bold mb-1">VIRAL SCORE: 92</div>
                                    <div className="text-white/40 text-xs">High engagement predicted</div>
                                </div>
                            </div>
                        </div>

                        {/* Glass Reflection Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
