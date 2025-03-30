/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./index.html",                // Include the main HTML file
    "./src/**/*.{js,ts,jsx,tsx}", // Include all JS/TS(X) files in the src directory
  ],
  theme: {
    extend: {
      // You can add custom theme extensions here if needed
      // e.g., colors, fonts, etc.
    },
  },
  plugins: [],
};
