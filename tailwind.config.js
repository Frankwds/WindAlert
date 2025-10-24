/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
      },
      boxShadow: {
        custom: '0 2px 4px rgba(0, 0, 0, 0.1)',
        'custom-hover': '0 4px 8px rgba(0, 0, 0, 0.2)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        hover: 'var(--shadow-hover)',
        focus: 'var(--shadow-focus)',
      },
    },
  },
  plugins: [require('tailwind-scrollbar')],
};
