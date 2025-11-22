'use client';

import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Chrome } from "lucide-react";

export default function LoginPage() {
    return (
        <div className="min-h-screen w-full bg-[#05050A] relative flex items-center justify-center overflow-hidden">
            {/* Deep Field Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-purple-900/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2,
                    }}
                    className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] bg-blue-900/20 rounded-full blur-[120px]"
                />
            </div>

            {/* Glass Card */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative z-10 w-full max-w-md p-8 rounded-2xl backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.24)]"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
                    <p className="text-white/60">Sign in to access your creative dashboard</p>
                </div>

                <button
                    onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                    className="w-full group relative flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                    <Chrome className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                    <span className="text-white font-medium">Continue with Google</span>

                    {/* Inner Glow */}
                    <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5 group-hover:ring-white/10 pointer-events-none" />
                </button>

                <div className="mt-8 text-center">
                    <p className="text-xs text-white/40">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
