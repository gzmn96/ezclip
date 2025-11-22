import { auth } from "@/auth";
import Link from "next/link";
import { LandingHero } from "@/components/LandingHero";
import {
  Check,
  Scissors,
  MessageSquare,
  TrendingUp,
  Mic,
  Target,
  Linkedin,
  Instagram,
  Youtube,
  Play
} from "lucide-react";

// Custom TikTok Icon since it's not in Lucide (or sometimes named differently)
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 hover:text-white transition-colors cursor-pointer">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export default async function LandingPage() {
  const session = await auth();
  const dashboardUrl = session ? "/dashboard" : "/login";

  return (
    <div className="min-h-screen bg-[#05050A] text-white selection:bg-purple-500/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 backdrop-blur-md bg-[#05050A]/50 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Ezclip
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href={dashboardUrl}
              className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section (New Liquid Glass Hook) */}
      <LandingHero dashboardUrl={dashboardUrl} />

      {/* Features Grid (Restored Content + Liquid Glass Style) */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Everything you need to go <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">viral</span>.
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Stop guessing. Our AI analyzes, edits, and optimizes your content for maximum engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
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
              },
              {
                icon: Play,
                title: "Auto-B-Roll",
                desc: "Automatically inserts relevant B-roll footage to keep retention high during monologues.",
                specs: ["Stock library integration", "Context aware", "Seamless transitions"]
              }
            ].map((feature, i) => (
              <div
                key={i}
                className={`
                  p-8 rounded-3xl backdrop-blur-2xl border transition-all duration-300 group hover:-translate-y-1
                  ${feature.highlight
                    ? 'bg-purple-500/10 border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)]'
                    : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]'
                  }
                `}
              >
                <div className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors
                  ${feature.highlight ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-white/60 group-hover:text-white'}
                `}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-white/60 mb-6 text-sm leading-relaxed">{feature.desc}</p>
                <ul className="space-y-3">
                  {feature.specs.map((spec, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-white/40 group-hover:text-white/60 transition-colors">
                      <Check className={`w-4 h-4 ${feature.highlight ? 'text-purple-400' : 'text-white/20'}`} />
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to 10x Your Content Output?</h2>
          <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
            Join 1,000+ creators who are using AI to dominate social media.
            Start with 3 free video processing credits.
          </p>
          <Link
            href={dashboardUrl}
            className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            Start Free Trial
          </Link>
          <div className="mt-8 flex justify-center gap-8 text-sm text-white/40">
            <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> No credit card required</span>
            <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> 3 free videos</span>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, transparent pricing.</h2>
            <p className="text-xl text-white/60">Choose the plan that fits your growth.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Starter", price: "$0", period: "/mo", feats: ["3 videos/mo", "720p export", "Basic AI analysis"] },
              { name: "Creator", price: "$29", period: "/mo", feats: ["15 videos/mo", "1080p export", "Advanced AI + Viral Score", "No watermark"], highlight: true },
              { name: "Pro", price: "$79", period: "/mo", feats: ["Unlimited videos", "4K export", "Priority processing", "API Access"] }
            ].map((plan, i) => (
              <div
                key={i}
                className={`
                  relative p-8 rounded-3xl backdrop-blur-2xl border flex flex-col
                  ${plan.highlight
                    ? 'bg-white/[0.08] border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.15)] scale-105 z-10'
                    : 'bg-white/[0.03] border-white/[0.08]'
                  }
                `}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                <div className="text-4xl font-bold mb-6 text-white">
                  {plan.price}<span className="text-lg text-white/40 font-normal">{plan.period}</span>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.feats.map((feat, j) => (
                    <li key={j} className="flex items-center gap-3 text-white/70">
                      <Check className={`w-5 h-5 ${plan.highlight ? 'text-purple-400' : 'text-white/20'}`} />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href={dashboardUrl}
                  className={`
                    w-full py-4 rounded-xl font-bold transition-all text-center
                    ${plan.highlight
                      ? 'bg-white text-black hover:bg-white/90 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                    }
                  `}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 bg-[#020205] px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "How accurate is the AI?", a: "Our computer vision has 95%+ accuracy. The viral prediction model is trained on 3.2M clips." },
              { q: "What video formats do you support?", a: "MP4, MOV, AVI, MKV, WebM. Up to 4K resolution." },
              { q: "Do you support YouTube Shorts?", a: "Yes! We optimize specifically for YouTube Shorts, including SEO-friendly captions and descriptions." },
              { q: "Can I edit the clips?", a: "Yes, you have full control to adjust timing, captions, and cropping." }
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                <h3 className="text-lg font-bold mb-2 text-white">{item.q}</h3>
                <p className="text-white/60 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-white/40">
        <div className="flex justify-center gap-8 mb-8">
          <Linkedin className="w-5 h-5 hover:text-white transition-colors cursor-pointer" />
          <TikTokIcon />
          <Instagram className="w-5 h-5 hover:text-white transition-colors cursor-pointer" />
          <Youtube className="w-5 h-5 hover:text-white transition-colors cursor-pointer" />
        </div>
        <p>© 2025 Ezclip. All rights reserved.</p>
      </footer>
    </div>
  );
}
