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
        toefl: {
          header: '#1B6067',     // 深青色 — 导航栏背景
          accent:  '#1B6067',    // 深青色 — 选中高亮
          light:   '#E8F4F5',    // 浅青色 — 选中选项背景
          hover:   '#154D53',    // 深一档青色 — hover状态
        },
      }
    },
  },
  plugins: [],
}