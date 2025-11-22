"use client"

import React, { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion, useScroll, useTransform, useSpring, useInView, useMotionValueEvent } from "framer-motion"
import { ArrowRight, Check, Play, Activity, Zap, Type, Share2, Scan, Layers, Sliders } from "lucide-react"
import { cn } from "@/lib/utils"
import { MouseSpotlight } from "@/components/ui/mouse-spotlight"

// --- Components ---

const GlassCard = ({ className, children, delay = 0 }: { className?: string, children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.95 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: "-50px" }}
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    className={cn(
      "relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 transition-colors duration-500 hover:border-white/20 hover:bg-white/10",
      className
    )}
  >
    {children}
  </motion.div>
)

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
  >
    {children}
  </motion.div>
)

// --- Sections ---

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      {/* Background Mesh */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-violet-900/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto space-y-8">
        <motion.h1
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-7xl md:text-9xl font-bold tracking-tighter text-white leading-[0.9]"
        >
          Content. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
            Multiplied.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light tracking-wide"
        >
          The intelligence engine that turns one video into an omnichannel strategy.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-8"
        >
          <Link href="/api/auth/signin">
            <Button className="h-14 px-8 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md text-lg font-medium transition-all hover:scale-105">
              Start Logic Engine
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Floating Prism Element */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-20 right-20 w-32 h-32 border border-white/10 rounded-full backdrop-blur-3xl opacity-20"
      />
    </section>
  )
}

const StickyScroll = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const [activeStep, setActiveStep] = useState(0)

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const targetStep = latest < 0.25 ? 0 : latest < 0.5 ? 1 : latest < 0.75 ? 2 : 3
    setActiveStep(prev => prev === targetStep ? prev : targetStep)
  })

  const steps = [
    {
      title: "Ingest.",
      desc: "Raw footage enters the pipeline. High-fidelity processing preserves every pixel.",
      icon: Layers,
      color: "bg-blue-500"
    },
    {
      title: "Analyze.",
      desc: "Computer vision scans for faces, action, and context. The signal is separated from the noise.",
      icon: Scan,
      color: "bg-violet-500"
    },
    {
      title: "Refine.",
      desc: "Intelligent framing. Auto-captions. Native aspect ratios. Ready for deployment.",
      icon: Zap,
      color: "bg-emerald-500"
    },
    {
      title: "Tune.",
      desc: "Platform-native intelligence. LinkedIn insights, TikTok hooks, Instagram aesthetics. One video, three strategies.",
      icon: Sliders,
      color: "bg-pink-500"
    }
  ]

  return (
    <section ref={containerRef} className="relative h-[250vh] bg-navy">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto w-full px-6 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">

          {/* Left: Text */}
          <div className="space-y-20">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={false}
                animate={{
                  opacity: activeStep === index ? 1 : 0.2,
                  x: activeStep === index ? 0 : -20,
                  scale: activeStep === index ? 1 : 0.95
                }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", step.color)}>
                  <step.icon className="text-white h-6 w-6" />
                </div>
                <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">{step.title}</h2>
                <p className="text-xl text-gray-400 max-w-md leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Right: Phone Mockup */}
          <div className="relative h-[700px] w-[380px] mx-auto bg-black rounded-[3.5rem] border-8 border-gray-800 shadow-2xl overflow-hidden ring-1 ring-white/10">
            {/* Screen Content */}
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center overflow-hidden">
              {/* Step 0: Raw Video */}
              <motion.div
                animate={{ opacity: activeStep === 0 ? 1 : 0 }}
                className="absolute inset-0 flex items-center bg-black"
              >
                <div className="w-full aspect-video bg-gray-800 animate-pulse" />
                <div className="absolute bottom-10 left-6 right-6 space-y-2">
                  <div className="h-2 w-1/2 bg-gray-700 rounded" />
                  <div className="h-2 w-1/3 bg-gray-700 rounded" />
                </div>
              </motion.div>

              {/* Step 1: Scanning */}
              <motion.div
                animate={{ opacity: activeStep === 1 ? 1 : 0 }}
                className="absolute inset-0 bg-black"
              >
                <div className="absolute inset-0 grid grid-cols-4 gap-1 opacity-20">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="bg-green-500/20 border border-green-500/30" />
                  ))}
                </div>
                <motion.div
                  animate={{ top: ["0%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]"
                />
                <div className="absolute center inset-0 flex items-center justify-center">
                  <div className="border-2 border-green-500 w-32 h-32 rounded-lg relative">
                    <div className="absolute -top-6 left-0 text-green-500 text-xs font-mono">FACE_DETECTED</div>
                  </div>
                </div>
              </motion.div>

              {/* Step 2: Final Vertical */}
              <motion.div
                animate={{ opacity: activeStep === 2 ? 1 : 0 }}
                className="absolute inset-0 bg-gray-900"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
                <div className="absolute bottom-20 left-6 right-6 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: activeStep === 2 ? 1 : 0, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-black/50 backdrop-blur-md p-4 rounded-xl text-white text-lg font-medium"
                  >
                    "This is the viral moment."
                  </motion.div>
                </div>
              </motion.div>

              {/* Step 3: Tune (Platform Intelligence) */}
              <motion.div
                animate={{ opacity: activeStep === 3 ? 1 : 0 }}
                className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center p-6 space-y-6"
              >
                <div className="w-full space-y-4">
                  {/* LinkedIn Card */}
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: activeStep === 3 ? 0 : 50, opacity: activeStep === 3 ? 1 : 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-blue-600/20 border border-blue-500/30 p-4 rounded-xl flex items-center gap-4"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-xs font-bold">in</div>
                    <div className="h-2 w-24 bg-blue-400/30 rounded" />
                  </motion.div>

                  {/* TikTok Card */}
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: activeStep === 3 ? 0 : -50, opacity: activeStep === 3 ? 1 : 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-pink-600/20 border border-pink-500/30 p-4 rounded-xl flex items-center gap-4"
                  >
                    <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center text-xs font-bold">TT</div>
                    <div className="h-2 w-24 bg-pink-400/30 rounded" />
                  </motion.div>

                  {/* Instagram Card */}
                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: activeStep === 3 ? 0 : 50, opacity: activeStep === 3 ? 1 : 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-purple-600/20 border border-purple-500/30 p-4 rounded-xl flex items-center gap-4"
                  >
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-xs font-bold">IG</div>
                    <div className="h-2 w-24 bg-purple-400/30 rounded" />
                  </motion.div>
                </div>
                <p className="text-gray-400 text-sm text-center">Optimizing for 3 platforms...</p>
              </motion.div>
            </div>

            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-32 bg-black rounded-b-2xl z-20" />
          </div>

        </div>
      </div>
    </section>
  )
}

const BentoGrid = () => {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">

        {/* Card 1: Active Speaker */}
        <GlassCard delay={0.1} className="md:col-span-2 flex flex-col justify-between group">
          <div className="space-y-2">
            <h3 className="text-2xl font-medium text-white">Active Speaker Detection</h3>
            <p className="text-gray-400">Algorithms that listen, not just watch.</p>
          </div>
          <div className="h-32 w-full bg-white/5 rounded-xl overflow-hidden relative flex items-center justify-center">
            <div className="flex gap-1 items-end h-16">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [10, 40, 10] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.05 }}
                  className="w-2 bg-violet-500 rounded-full"
                />
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Card 2: Uptime */}
        <GlassCard delay={0.2} className="flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-medium text-white">99.9% Uptime</h3>
            <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
          </div>
          <div className="text-6xl font-bold text-white/10 tracking-tighter">
            24/7
          </div>
        </GlassCard>

        {/* Card 3: Auto Caption */}
        <GlassCard delay={0.3} className="flex flex-col justify-between">
          <Type className="h-8 w-8 text-white mb-4" />
          <div className="space-y-2">
            <h3 className="text-xl font-medium text-white">Auto-Captioning</h3>
            <p className="text-gray-400 text-sm">98% accuracy out of the box.</p>
          </div>
        </GlassCard>

        {/* Card 4: Platform Native */}
        <GlassCard delay={0.4} className="md:col-span-2 flex flex-col justify-center items-center text-center space-y-6">
          <h3 className="text-2xl font-medium text-white">Platform Native Export</h3>
          <div className="flex gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Simple text representations for logos to keep it clean */}
            <span className="text-2xl font-bold text-white">YouTube</span>
            <span className="text-2xl font-bold text-white">TikTok</span>
            <span className="text-2xl font-bold text-white">Instagram</span>
          </div>
        </GlassCard>

      </div>
    </section>
  )
}

const BrutalistStats = () => {
  return (
    <section className="py-32 bg-black border-y border-white/10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
        {[
          { label: "Reach Increase", value: "300%" },
          { label: "Production Time", value: "1/10th" },
          { label: "Latency", value: "0" }
        ].map((stat, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <div className="space-y-2">
              <div className="text-7xl md:text-9xl font-bold text-white tracking-tighter">
                {stat.value}
              </div>
              <div className="text-sm font-mono text-gray-500 uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}

const Pricing = () => {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-20 space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">Simple, transparent pricing.</h2>
        <p className="text-xl text-gray-400">Choose the plan that fits your growth.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-center">
        {[
          { name: "Starter", price: "$49", desc: "For experimentation.", features: ["50 Clips/mo", "1 Channel", "Standard Support"] },
          { name: "Creator", price: "$149", desc: "For serious growth.", features: ["200 Clips/mo", "3 Channels", "Platform Intelligence", "4K Export", "Priority Support"], highlight: true },
          { name: "Pro", price: "$399", desc: "For dominance.", features: ["Unlimited Clips", "Unlimited Channels", "API Access", "Custom Branding", "Dedicated Manager"] }
        ].map((plan, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "relative p-8 rounded-[2rem] border transition-all duration-300 flex flex-col h-full",
              plan.highlight
                ? "bg-white/5 border-violet-500/50 shadow-[0_0_50px_rgba(79,70,229,0.15)] scale-105 z-10"
                : "bg-transparent border-white/10 hover:border-white/20 hover:bg-white/5"
            )}
          >
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                Most Popular
              </div>
            )}

            <div className="space-y-4 mb-8">
              <h3 className="text-xl font-medium text-white">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold text-white tracking-tight">{plan.price}</span>
                <span className="text-lg text-gray-500 font-normal">/mo</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">{plan.desc}</p>
            </div>

            <div className="flex-grow">
              <ul className="space-y-5">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center text-gray-300 text-sm">
                    <div className={cn("mr-3 rounded-full p-1", plan.highlight ? "bg-violet-500/20 text-violet-400" : "bg-white/10 text-white")}>
                      <Check className="h-3 w-3" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <Button className={cn(
              "w-full mt-10 h-12 text-base rounded-full transition-all duration-300",
              plan.highlight
                ? "bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
            )}>
              {plan.highlight ? "Get Started" : "Choose Plan"}
            </Button>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <main className="bg-navy min-h-screen text-white selection:bg-violet-500/30">
      <nav className="fixed top-0 w-full z-50 bg-navy/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight text-white">EZCLIP</div>
          <Link href="/api/auth/signin">
            <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
              Log in
            </Button>
          </Link>
        </div>
      </nav>

      <Hero />
      <MouseSpotlight />
      <StickyScroll />
      <BentoGrid />
      <BrutalistStats />
      <Pricing />

      <footer className="py-12 px-6 border-t border-white/5 text-center text-gray-600 text-sm">
        <p>© 2025 EZCLIP Inc. Intelligence Engine.</p>
      </footer>
    </main>
  )
}
