/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',      // 蓝色
        success: '#22C55E',      // 绿色
        error: '#EF4444',        // 红色
        secondary: '#6B7280',    // 灰色
      }
    },
  },
  plugins: [],
}