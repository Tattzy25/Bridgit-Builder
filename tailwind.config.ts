import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Neumorphic theme colors
        neubg: "hsl(var(--neubg))",
        neushadow: "hsl(var(--neushadow))",
        neulight: "hsl(var(--neulight))",
        bridgit: {
          primary: "hsl(var(--bridgit-primary))",
          secondary: "hsl(var(--bridgit-secondary))",
          accent: "hsl(var(--bridgit-accent))",
        },
        // Original shadcn colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        neu: "24px",
        "neu-lg": "32px",
        "neu-xl": "40px",
      },
      boxShadow: {
        neu: "20px 20px 60px hsl(var(--neushadow)), -20px -20px 60px hsl(var(--neulight))",
        "neu-inset":
          "inset 20px 20px 60px hsl(var(--neushadow)), inset -20px -20px 60px hsl(var(--neulight))",
        "neu-sm":
          "10px 10px 30px hsl(var(--neushadow)), -10px -10px 30px hsl(var(--neulight))",
        "neu-sm-inset":
          "inset 10px 10px 30px hsl(var(--neushadow)), inset -10px -10px 30px hsl(var(--neulight))",
        "neu-xs":
          "5px 5px 15px hsl(var(--neushadow)), -5px -5px 15px hsl(var(--neulight))",
        "neu-xs-inset":
          "inset 5px 5px 15px hsl(var(--neushadow)), inset -5px -5px 15px hsl(var(--neulight))",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 30px -10px hsl(var(--bridgit-primary) / 0.3)",
          },
          "50%": {
            boxShadow: "0 0 60px -5px hsl(var(--bridgit-primary) / 0.6)",
          },
        },
        "cyber-drift": {
          "0%, 100%": {
            transform: "rotate(0deg) scale(1)",
          },
          "33%": {
            transform: "rotate(1deg) scale(1.02)",
          },
          "66%": {
            transform: "rotate(-1deg) scale(0.98)",
          },
        },
        "hologram-flicker": {
          "0%, 100%": {
            opacity: "1",
            filter: "hue-rotate(0deg)",
          },
          "50%": {
            opacity: "0.8",
            filter: "hue-rotate(10deg)",
          },
        },
        "neon-glow": {
          "0%, 100%": {
            textShadow: "0 0 10px hsl(var(--bridgit-primary))",
          },
          "50%": {
            textShadow:
              "0 0 20px hsl(var(--bridgit-primary)), 0 0 30px hsl(var(--bridgit-secondary))",
          },
        },
        "slide-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(40px) scale(0.95)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) scale(1)",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "cyber-drift": "cyber-drift 20s ease-in-out infinite",
        "hologram-flicker": "hologram-flicker 3s ease-in-out infinite",
        "neon-glow": "neon-glow 2s ease-in-out infinite",
        "slide-up": "slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
