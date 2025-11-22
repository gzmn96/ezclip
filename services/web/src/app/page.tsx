'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Target,
  TrendingUp,
  Play,
  Upload,
  Brain,
  Rocket,
  Eye,
  Scissors,
  MessageSquare,
  Mic,
  Clock,
  Check,
  Youtube,
  Linkedin,
  Instagram
} from 'lucide-react';
import Link from 'next/link';

// Custom Icons for platforms if Lucide doesn't have them all perfect
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6, ease: "easeInOut" } as const
  };

  return (
    <div className={`min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Stop Manually Editing Clips.
            <br />
            Let AI Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Viral Moments</span>.
          </motion.h1>

          <motion.p
            className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Upload one long video. Get dozens of platform-optimized clips in minutes.
            Our AI detects the best moments, crops to perfect framing, adds captions, and tells you which will go viral.
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-6 mb-12 text-sm font-medium text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span>AI finds viral moments automatically</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              <span>Smart cropping keeps subjects in frame</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <span>Optimized for TikTok, Shorts, Reels & LinkedIn</span>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <button className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform flex flex-col items-center justify-center leading-tight">
              Start Free Trial
              <span className="text-xs font-normal opacity-70">Process 3 videos free</span>
            </button>
            <button className="px-8 py-4 border border-gray-700 rounded-full font-bold text-lg hover:bg-gray-900 transition-colors flex items-center gap-2">
              <Play className="w-5 h-5" /> Watch Demo (2 min)
            </button>
          </motion.div>
        </div>

        {/* Demo Video Placeholder */}
        <motion.div
          className="mt-20 relative rounded-2xl overflow-hidden border border-gray-800 shadow-2xl shadow-purple-900/20 aspect-video max-w-5xl mx-auto bg-gray-900 flex items-center justify-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="text-center">
            <Play className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-gray-500">Demo Video Placeholder</p>
          </div>

          {/* Floating Stats */}
          <div className="absolute -right-4 top-10 bg-gray-900/90 backdrop-blur border border-gray-800 p-4 rounded-xl shadow-xl hidden md:block">
            <div className="text-3xl font-bold text-white">47</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">clips generated</div>
          </div>
          <div className="absolute -left-4 bottom-10 bg-gray-900/90 backdrop-blur border border-gray-800 p-4 rounded-xl shadow-xl hidden md:block">
            <div className="text-3xl font-bold text-green-400">92%</div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">viral score</div>
          </div>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-[#0f0f12]">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-center mb-16"
            {...fadeInUp}
          >
            From Long Video to Viral Clips in 3 Steps
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: Upload,
                title: "Upload Your Video",
                desc: "Drop any long-form content: podcasts, tutorials, streams, webinars. Supports up to 4K resolution."
              },
              {
                icon: Brain,
                title: "AI Analyzes Everything",
                desc: "Our computer vision detects faces, actions, and engagement peaks. Natural language AI finds viral hooks."
              },
              {
                icon: Rocket,
                title: "Get Platform-Ready Clips",
                desc: "Download or auto-publish to TikTok, YouTube Shorts, Instagram, LinkedIn. Optimized for each algorithm."
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                className="relative p-8 rounded-2xl bg-gray-900/50 border border-gray-800"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <div className="absolute -top-6 left-8 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center font-bold text-xl border-4 border-[#0f0f12]">
                  {i + 1}
                </div>
                <step.icon className="w-12 h-12 text-purple-400 mb-6 mt-4" />
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center text-gray-500 flex items-center justify-center gap-2">
            <Clock className="w-5 h-5" />
            <span>Average processing time: <strong className="text-white">5 minutes</strong> for a 60-minute video</span>
          </div>
        </div>
      </section>

      {/* AI FEATURES */}
      <section className="py-24 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.h2 className="text-4xl md:text-5xl font-bold mb-6" {...fadeInUp}>
            The AI Brain Behind Every Clip
          </motion.h2>
          <motion.p className="text-xl text-gray-400" {...fadeInUp}>
            We don't just cut your video. We understand it.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Eye,
              title: "Computer Vision",
              desc: "Scans every frame to detect faces, objects, actions, and scene changes. Knows when someone is speaking or pointing.",
              specs: ["Face tracking", "Object recognition", "Action detection"]
            },
            {
              icon: Scissors,
              title: "Smart Cropping",
              desc: "Automatically crops widescreen to 9:16. Keeps subjects centered and in-frame, even as they move.",
              specs: ["Subject-aware framing", "Multi-person tracking", "Smooth pan & zoom"]
            },
            {
              icon: MessageSquare,
              title: "Auto-Captions",
              desc: "AI transcribes your audio and generates animated captions. Increases watch time by 40%.",
              specs: ["95%+ accuracy", "Keyword highlighting", "30+ languages"]
            },
            {
              icon: TrendingUp,
              title: "Viral Prediction",
              desc: "Our AI analyzes each clip and predicts its viral potential on TikTok, Shorts, Instagram, and LinkedIn.",
              specs: ["Platform-specific scoring", "Engagement prediction", "Trend matching"],
              highlight: true
            },
            {
              icon: Mic,
              title: "Active Speaker Detection",
              desc: "AI listens to your audio and identifies when people are speaking. Prioritizes clips with clear dialogue.",
              specs: ["Voice activity detection", "Silence removal", "Audio quality scoring"]
            },
            {
              icon: Target,
              title: "Platform Intelligence",
              desc: "Optimizes specifically for TikTok vs. Shorts vs. LinkedIn. Adjusts pacing, duration, and tone.",
              specs: ["Tone analysis", "Optimal duration", "Hashtag recommendations"]
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              className={`p-8 rounded-2xl border ${feature.highlight ? 'bg-purple-900/10 border-purple-500/50' : 'bg-gray-900/30 border-gray-800'}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center mb-6">
                <feature.icon className={`w-6 h-6 ${feature.highlight ? 'text-purple-400' : 'text-gray-300'}`} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 mb-6 text-sm leading-relaxed">{feature.desc}</p>
              <ul className="space-y-2">
                {feature.specs.map((spec, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-gray-500">
                    <Check className="w-4 h-4 text-green-500" /> {spec}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* MID CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to 10x Your Content Output?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join 1,000+ creators who are using AI to dominate social media.
            Start with 3 free video processing credits.
          </p>
          <button className="px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform">
            Start Free Trial
          </button>
          <div className="mt-6 flex justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-1"><Check className="w-4 h-4" /> No credit card required</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4" /> 3 free videos</span>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-24 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 className="text-4xl md:text-5xl font-bold mb-4" {...fadeInUp}>
            Simple, transparent pricing.
          </motion.h2>
          <motion.p className="text-xl text-gray-400" {...fadeInUp}>
            Choose the plan that fits your growth.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { name: "Starter", price: "$0", period: "/mo", feats: ["3 videos/mo", "720p export", "Basic AI analysis"] },
            { name: "Creator", price: "$29", period: "/mo", feats: ["15 videos/mo", "1080p export", "Advanced AI + Viral Score", "No watermark"], highlight: true },
            { name: "Pro", price: "$79", period: "/mo", feats: ["Unlimited videos", "4K export", "Priority processing", "API Access"] }
          ].map((plan, i) => (
            <motion.div
              key={i}
              className={`relative p-8 rounded-2xl border backdrop-blur-xl ${plan.highlight ? 'border-purple-500 bg-gray-900/80 shadow-2xl shadow-purple-900/20' : 'border-gray-800 bg-gray-900/40'}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold mb-6">{plan.price}<span className="text-lg text-gray-500 font-normal">{plan.period}</span></div>
              <ul className="space-y-4 mb-8">
                {plan.feats.map((feat, j) => (
                  <li key={j} className="flex items-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-purple-500" /> {feat}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-lg font-bold transition-colors ${plan.highlight ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}>
                Get Started
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-[#0f0f12] px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-8">
            {[
              { q: "How accurate is the AI?", a: "Our computer vision has 95%+ accuracy. The viral prediction model is trained on 3.2M clips." },
              { q: "What video formats do you support?", a: "MP4, MOV, AVI, MKV, WebM. Up to 4K resolution." },
              { q: "Do you support YouTube Shorts?", a: "Yes! We optimize specifically for YouTube Shorts, including SEO-friendly captions and descriptions." },
              { q: "Can I edit the clips?", a: "Yes, you have full control to adjust timing, captions, and cropping." }
            ].map((item, i) => (
              <div key={i} className="border-b border-gray-800 pb-8">
                <h3 className="text-xl font-bold mb-2">{item.q}</h3>
                <p className="text-gray-400">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-gray-800 text-center text-gray-500">
        <div className="flex justify-center gap-6 mb-8">
          <Linkedin className="w-6 h-6 hover:text-white transition-colors cursor-pointer" />
          <TikTokIcon />
          <Instagram className="w-6 h-6 hover:text-white transition-colors cursor-pointer" />
          <Youtube className="w-6 h-6 hover:text-white transition-colors cursor-pointer" />
        </div>
        <p>© 2025 Ezclip. All rights reserved.</p>
      </footer>
    </div>
  );
}
