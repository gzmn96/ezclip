"use client";
import { useMotionValue, useSpring, motion } from "framer-motion";
import { useEffect } from "react";

export function MouseSpotlight() {
    const mouseX = useMotionValue(-100); // Start off-screen
    const mouseY = useMotionValue(-100);

    // Smooth spring animation for the "following" effect
    const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
    const x = useSpring(mouseX, springConfig);
    const y = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Center the spotlight (w=300, h=300 -> offset=150)
            mouseX.set(e.clientX - 150);
            mouseY.set(e.clientY - 150);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <>
            {/* Primary White Glow (The "Light") */}
            <motion.div
                className="pointer-events-none fixed top-0 left-0 z-30 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.3),transparent_70%)] blur-[80px] mix-blend-screen"
                style={{ x, y }}
            />

            {/* Secondary "Diamond" Prism Effect */}
            <motion.div
                className="pointer-events-none fixed top-0 left-0 z-30 h-[300px] w-[300px] rounded-full bg-gradient-to-tr from-cyan-400/30 to-violet-400/30 blur-[60px] mix-blend-screen"
                style={{ x, y: y }}
            />
        </>
    );
}
