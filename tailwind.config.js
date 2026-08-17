/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: { 50:'#e6e8eb',100:'#c0c5cc',200:'#99a1ad',300:'#717c8e',400:'#536177',500:'#354660',600:'#2f3f59',700:'#27364f',800:'#202e46',900:'#141f35',950:'#0a0e14' },
        accent: { DEFAULT:'#c9a227', light:'#e2c259', dark:'#9a7b1d' },
        danger: '#ef4444', success: '#22c55e', warning: '#f59e0b',
      },
      fontFamily: { sans:['Inter','sans-serif'], display:['Oswald','sans-serif'] },
    },
  },
  plugins: [],
}
