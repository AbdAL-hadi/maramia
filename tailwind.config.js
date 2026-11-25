/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: 'var(--cream)',
        paper: 'var(--paper)',
        forest: 'var(--forest)',
        ink: 'var(--ink)',
        gold: 'var(--gold)',
      },
    },
  },
}
