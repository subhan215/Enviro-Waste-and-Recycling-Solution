import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Primary colors
        'custom-green': '#00ED64',
        'custom-green-dark': '#00b84c',
        'custom-green-light': '#e7f3ea',
        'custom-black': '#001E2B',
        // UI colors
        'surface': '#ffffff',
        'surface-secondary': '#f8fcf9',
        'border': '#e5e7eb',
        'border-dark': '#d1d5db',
        // Text colors
        'text-primary': '#001E2B',
        'text-secondary': '#6b7280',
        'text-muted': '#9ca3af',
        // Status colors
        'success': '#00ED64',
        'error': '#ef4444',
        'warning': '#f59e0b',
        'info': '#3b82f6',
      },
      animation: {
        wiggle: 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      fontSize: {
        'custom-sm': '15px',
        'custom-md': '17px',
        'custom-lg': '20px',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'button': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      },
    },
  },
  plugins: [],
};
export default config;
