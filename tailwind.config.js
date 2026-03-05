/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        title: ['Bebas Neue', 'cursive'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        bg: '#0D0F14',
        surface: '#161A23',
        surface2: '#1E2330',
        border: '#2A3040',
        'accent-red': '#F4522A',
        'accent-gold': '#F9A825',
        'accent-green': '#2ECC71',
        'accent-blue': '#3498DB',
        text: '#E8ECF0',
        'text-muted': '#7A8499',
        'text-dim': '#4A5568',
      }
    },
  },
  plugins: [],
}
