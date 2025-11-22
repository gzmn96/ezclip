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
                primary: {
                    DEFAULT: "#000000", // Apple Black
                    foreground: "#FFFFFF",
                },
                secondary: {
                    DEFAULT: "#86868b", // Apple Gray
                    foreground: "#FFFFFF",
                },
                accent: {
                    DEFAULT: "#0071e3", // Apple Blue
                    foreground: "#FFFFFF",
                },
                surface: "#f5f5f7", // Apple Light Gray
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
        },
    },
    plugins: [],
};
export default config;
