import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                glass: {
                    surface: "rgba(255, 255, 255, 0.03)",
                    border: "rgba(255, 255, 255, 0.08)",
                    highlight: "rgba(255, 255, 255, 0.1)",
                },
                neon: {
                    blue: "#00f0ff",
                    purple: "#bd00ff",
                },
                primary: {
                    DEFAULT: "#000000",
                    foreground: "#FFFFFF",
                },
                secondary: {
                    DEFAULT: "#86868b",
                    foreground: "#FFFFFF",
                },
                accent: {
                    DEFAULT: "#0071e3",
                    foreground: "#FFFFFF",
                },
                surface: "#f5f5f7",
                border: "#e5e5e5",
                navy: {
                    DEFAULT: "#020210",
                    light: "#1a1a2e",
                },
                violet: {
                    DEFAULT: "#4F46E5",
                    glow: "#818cf8",
                },
            },
            fontFamily: {
                sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
            },
            borderRadius: {
                lg: "18px",
                md: "12px",
                sm: "6px",
            },
            animation: {
                shimmer: "shimmer 2s linear infinite",
                spotlight: "spotlight 2s ease .75s 1 forwards",
            },
            keyframes: {
                shimmer: {
                    from: {
                        backgroundPosition: "0 0",
                    },
                    to: {
                        backgroundPosition: "-200% 0",
                    },
                },
                spotlight: {
                    "0%": {
                        opacity: "0",
                        transform: "translate(-72%, -62%) scale(0.5)",
                    },
                    "100%": {
                        opacity: "1",
                        transform: "translate(-50%,-40%) scale(1)",
                    },
                },
            },
        },
    },
    plugins: [],
};
export default config;
