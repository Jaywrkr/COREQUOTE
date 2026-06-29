/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        ibm: {
          blue:      '#0f62fe',
          'blue-70': '#0043ce',
          'blue-20': '#d0e2ff',
          'blue-10': '#edf5ff',
          gray10:    '#f4f4f4',
          gray20:    '#e0e0e0',
          gray30:    '#c6c6c6',
          gray50:    '#8d8d8d',
          gray60:    '#6f6f6f',
          gray70:    '#525252',
          gray80:    '#393939',
          gray90:    '#262626',
          gray100:   '#161616',
          red:       '#da1e28',
          green:     '#24a148',
          yellow:    '#f1c21b',
          teal:      '#009d9a',
          purple:    '#8a3ffc',
        },
      },
      borderRadius: {
        '4': '4px',
        '8': '8px',
      },
    },
  },
  plugins: [],
}

