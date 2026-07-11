/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Design tokens: Space Grotesk for UI/headlines, Space Mono for labels/numbers.
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          DEFAULT: '#e11d48', // rose
          dark: '#9f1239',
          soft: '#fdeef1',
        },
        ink: '#1c1917', // borders + strong text
        body: '#3d3730',
        muted: '#6f665c',
        faint: '#a99e8d',
        paper: '#fbf9f5', // page background
        canvas: '#efe9e0',
        hairline: '#ece6dc',
        outline: '#ddd4c7', // inactive pill border
      },
      boxShadow: {
        page: '0 14px 44px -20px rgba(0,0,0,.3)',
      },
    },
  },
  plugins: [],
}
