/**
 * Tailwind CSS 配置文件
 * 配置 CSS 框架的主题、插件和内容扫描范围
 */

/** @type {import('tailwindcss').Config} */
// 引入 DaisyUI 组件库插件
import daisyui from "daisyui"

// 导出 Tailwind CSS 配置
export default {
  // 内容扫描范围，指定哪些文件需要 Tailwind CSS 处理
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  // 主题配置，扩展默认主题
  theme: {
    extend: {
      // 自定义阴影效果
      boxShadow: {
        whole: "0 0 15px rgba(0,0,0,.1);",  // 整体阴影效果
      },
      // 自定义关键帧动画
      keyframes: {
        blink: {
          "0%, 100%": { opacity: 1 },       // 动画开始和结束时完全不透明
          "50%": { opacity: 0 },            // 动画中间时完全透明
        },
      },
      // 自定义动画
      animation: {
        blink: "blink 1s step-end infinite", // 闪烁动画，1秒间隔无限循环
      },
    },
  },
  // 启用的插件
  plugins: [daisyui]
};
