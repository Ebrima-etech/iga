/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fafbfc',
          100: '#eaeef2',
          200: '#d0d7e0',
          300: '#b5bcc7',
          400: '#738096',
          500: '#57606a',
          600: '#424a53',
          700: '#32383f',
          800: '#24292f',
          900: '#0d1117',
        },
        accent: {
          light: '#dbeafe',
          DEFAULT: '#0969da',
          dark: '#0860ca',
        },
        success: '#1a7f37',
        warning: '#d29922',
        error: '#da3633',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
      },
      boxShadow: {
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.08)',
        'md': '0 4px 12px 0 rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 25px 0 rgba(0, 0, 0, 0.12)',
        'xl': '0 20px 40px 0 rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': '0.625rem',
        'xl': '0.75rem',
      },
    },
  },
  plugins: [],
};
