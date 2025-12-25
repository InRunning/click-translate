/**
 * ESLint 代码检查配置文件
 * 定义了代码规范检查的规则和插件
 */

module.exports = {
  // 设置为根配置文件，避免向上层目录查找其他配置
  root: true,
  // 运行环境配置
  env: {
    browser: true,     // 浏览器环境
    es2020: true      // ES2020 语法支持
  },
  // 继承的预设配置
  extends: [
    'eslint:recommended',                    // ESLint 推荐基础配置
    'plugin:@typescript-eslint/recommended', // TypeScript 推荐规则
    'plugin:react-hooks/recommended',        // React Hooks 推荐规则
  ],
  // 忽略的文件模式
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  // TypeScript 解析器
  parser: '@typescript-eslint/parser',
  // 使用的插件
  plugins: ['react-refresh'],
  // 自定义规则配置
  rules: {
    // React 刷新相关规则
    'react-refresh/only-export-components': [
      'warn',  // 警告级别
      { allowConstantExport: true },         // 允许常量的导出
    ],
  },
}
