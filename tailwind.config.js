/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: { 50:'#f2f2f2',100:'#b3b3b3',200:'#999999',300:'#7a7a7a',400:'#6b7280',500:'#4a4a4a',600:'#333333',700:'#262626',800:'#1a1a1a',900:'#111111',950:'#0a0a0a' },
        accent: { DEFAULT:'#c9a227', light:'#d4b23c', dark:'#9a7b1d' },
        danger: '#c8102e', success: '#2e9e4f', warning: '#f59e0b',
      },
      fontFamily: { sans:['Inter','sans-serif'], display:['Oswald','sans-serif'] },
    },
  },
  plugins: [],
}
