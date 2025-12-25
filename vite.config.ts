/**
 * Vite 构建配置文件
 * 用于配置多浏览器扩展的构建过程
 * 支持Chrome、Edge和Firefox三个目标平台
 */

// 引入 Vite 核心配置函数
import { defineConfig } from 'vite'
// React 插件，支持 JSX 和 Fast Refresh
import react from '@vitejs/plugin-react'
// Chrome 扩展构建插件
import { crx } from "@crxjs/vite-plugin";
// 扩展清单配置
import manifestConfig from "./manifest.config";
// 路径解析工具
import { resolve } from "path";

// 构建选项变量，根据目标浏览器设置不同输出目录
let buildOptions = {};
// 从环境变量获取目标浏览器类型
const browserTarget = process.env.BUILD_TARGET;

// Firefox 特定的构建配置
if (browserTarget === 'firefox') {
  buildOptions = {
    outDir: 'dist/firefox',                    // 输出到 firefox 目录
    rollupOptions: {                           // Rollup 构建选项
      input: {
        background: "background.html",          // Firefox 使用 background.html
      }
    }
  }
}
// Chrome 特定的构建配置
if (browserTarget === 'chrome') {
  buildOptions = {
    outDir: 'dist/chrome'                      // 输出到 chrome 目录
  }
}
// Edge 特定的构建配置
if (browserTarget === 'edge') {
  buildOptions = {
    outDir: 'dist/edge'                        // 输出到 edge 目录
  }
}

// 导出 Vite 配置
export default defineConfig({
  // 插件配置：React 插件 + Chrome 扩展插件
  plugins: [react(), crx({ manifest: manifestConfig })],
  // 开发服务器配置
  server: {
    port: 8899                                 // 开发服务器端口号
  },
  // 路径解析配置
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),        // 设置 @ 别名指向 src 目录
    },
  },
  // 构建配置
  build: buildOptions
})
