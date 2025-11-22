"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Check, ArrowRight, Linkedin, Instagram, Video } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock icons since lucide doesn't have TikTok
const TikTokIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
)

const platforms = [
    {
        id: "linkedin",
        name: "LinkedIn",
        icon: Linkedin,
        desc: "Professional insights & thought leadership.",
        color: "bg-blue-600",
    },
    {
        id: "tiktok",
        name: "TikTok",
        icon: TikTokIcon,
        desc: "Viral hooks & trending sounds.",
        color: "bg-pink-500",
    },
    {
        id: "instagram",
        name: "Instagram",
        icon: Instagram,
        desc: "Aesthetic Reels & lifestyle content.",
        color: "bg-purple-600",
    },
    {
        id: "youtube",
        name: "YouTube Shorts",
        icon: Video,
        desc: "Searchable, evergreen short content.",
        color: "bg-red-600",
    },
]

import { savePlatformPreferences } from "../actions"

export default function Onboarding() {
    const [selected, setSelected] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const togglePlatform = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
        )
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            await savePlatformPreferences(selected)
            console.log("Selected platforms:", selected) // Keep this for debugging
            router.push("/dashboard")
        } catch (error) {
            console.error("Failed to save platform preferences:", error)
            // Optionally, show an error message to the user
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-navy flex flex-col items-center justify-center p-6 text-white selection:bg-violet-500/30">
            <div className="max-w-2xl w-full space-y-12">

                <div className="text-center space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold tracking-tighter"
                    >
                        Where do you want to <span className="text-violet-500">dominate?</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 text-lg"
                    >
                        Select your target platforms. Our AI will tune your content for each one.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {platforms.map((platform, i) => {
                        const isSelected = selected.includes(platform.id)
                        return (
                            <motion.div
                                key={platform.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => togglePlatform(platform.id)}
                                className={cn(
                                    "relative cursor-pointer group overflow-hidden rounded-2xl border p-6 transition-all duration-300",
                                    isSelected
                                        ? "bg-white/10 border-violet-500/50 shadow-[0_0_30px_rgba(79,70,229,0.15)]"
                                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                )}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={cn("p-3 rounded-xl text-white", platform.color)}>
                                        <platform.icon className="h-6 w-6" />
                                    </div>
                                    {isSelected && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="bg-violet-500 rounded-full p-1"
                                        >
                                            <Check className="h-3 w-3 text-white" />
                                        </motion.div>
                                    )}
                                </div>
                                <h3 className="text-xl font-medium mb-1">{platform.name}</h3>
                                <p className="text-sm text-gray-400">{platform.desc}</p>
                            </motion.div>
                        )
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex justify-end"
                >
                    <Button
                        size="lg"
                        onClick={handleSubmit}
                        disabled={selected.length === 0}
                        className="rounded-full bg-white text-black hover:bg-gray-200 px-8 text-lg h-12"
                    >
                        Continue <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </motion.div>

            </div>
        </div>
    )
}
