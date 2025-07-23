module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          400: '#38b2ac',
          500: '#319795',
        },
        blue: {
          200: '#bee3f8',
          300: '#90cdf4',
          500: '#3b82f6',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          500: '#6b7280',
          800: '#1f2937',
        },
      },
    },
  },
  plugins: [],
};
