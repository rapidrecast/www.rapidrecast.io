import path from 'path';

// When deploying to production, set the base directory to your Hugo project's root directory.
const baseDir = path.join(__dirname, '..');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    `${baseDir}/themes/**/layouts/**/*.html`,
    `${baseDir}/content/**/layouts/**/*.html`,
    `${baseDir}/layouts/**/*.html`,
    `${baseDir}/content/**/*.html`,
    `${baseDir}/content/**/*.md`,
    `${baseDir}/public/**/*.html`,
    // Custom added here - might not be picked up OR might be critical, who knows
    './layouts/**/*.html',
    './content/**/*.md',
    './assets/css/tailwind.css', // Point to your main CSS file
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['"Satoshi"', '-apple-system', 'BlinkMacSystemFont', 'avenir next', 'avenir', 'segoe ui', 'helvetica neue', 'helvetica', 'Cantarell', 'Ubuntu', 'roboto', 'noto', 'arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
  variants: ['group-hover'],
}

