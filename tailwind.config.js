/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        core: {
          blue: '#0052CC',
          dark: '#003380',
          light: '#E6F0FF',
          accent: '#FF6B00',
        },
      },
    },
  },
  plugins: [],
}

