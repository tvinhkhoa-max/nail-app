/** @type {import('tailwindcss').Config} */


export default {
  content: [
    "./resources/**/*.edge",
    "./resources/**/*.js",
    "./resources/**/*.ts",
    "./resources/**/*.jsx",
    "./resources/**/*.tsx",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3758F1",
        dark: "#111928",
      },
    },
  },
  plugins: [
    // Sau khi bạn npm install tailgrids, hãy mở dòng này
    require("tailgrids/plugin")
  ],
}