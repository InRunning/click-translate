/**
 * PostCSS 配置文件
 * 配置 CSS 后处理插件链
 */

// 导出 PostCSS 配置
export default {
  // 启用的插件
  plugins: {
    tailwindcss: {},                        // Tailwind CSS 处理器
    '@thedutchcoder/postcss-rem-to-px': {}, // rem 单位转 px 单位插件
    autoprefixer: {},                       // 自动添加浏览器前缀
  },
}
