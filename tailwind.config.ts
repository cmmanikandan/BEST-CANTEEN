import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFFDF9',
          100: '#FDFBF7',
          200: '#F7F3EA',
          300: '#EFEAE0',
          400: '#E2DBD0',
        },
        canteen: {
          orange: {
            DEFAULT: '#FF5722',
            hover: '#F4511E',
            light: '#FFF0EB',
            dark: '#D84315',
          },
          green: {
            DEFAULT: '#16A34A',
            hover: '#15803D',
            light: '#DCFCE7',
            dark: '#14532D',
          },
          dark: {
            DEFAULT: '#201611',
            muted: '#5C4E46',
            light: '#8C7E76',
          },
          sand: '#EFEBE4',
        },
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(32, 22, 17, 0.05)',
        'card-hover': '0 10px 30px -4px rgba(32, 22, 17, 0.12)',
        float: '0 12px 35px -5px rgba(255, 87, 34, 0.25)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
