/**
 * Lingo Link 浏览器扩展内容脚本入口文件
 *
 * 这个文件定义了自定义元素 LingoLink，用于在网页上注入翻译功能
 * 主要功能：
 * 1. 创建自定义元素 lingo-link-enhanced
 * 2. 在 Shadow DOM 中渲染 React 组件
 * 3. 处理全屏状态下的元素位置
 * 4. 注入高亮样式
 */

// 导入 Web Components polyfill
import "@/lib/webcomponents-bundle.js";
// 导入 React 相关依赖
import React from "react";
import ReactDOM from "react-dom/client";
// 导入样式文件（内联）
import shadowDomStyle from "@/assets/styles/tailwind.css?inline";
import speakerStyle from "@/assets/styles/sperkerMotion.css?inline";
// 导入 React hooks
import { useState, useEffect } from "react";

// 导入注入脚本和国际化配置
import "@/i18n.ts";
// 导入主要组件和样式生成器
import LingoCard from './lingoCard'
// import {genHighlightStyle} from "@/contentScript/highlightStyle.tsx";

/**
 * LingoLink 自定义元素类
 *
 * 这个类定义了 lingo-link-enhanced 自定义元素，用于在网页上创建翻译功能的容器
 * 使用 Shadow DOM 来隔离样式和功能，避免与页面样式冲突
 */
class LingoLink extends HTMLElement {
  constructor() {
    super();
    
    // 创建 Shadow DOM，模式为 "closed" 表示外部无法访问 Shadow DOM
    const shadowRoot = this.attachShadow({ mode: "closed" });
    
    // 创建 React 根容器
    const reactRoot = document.createElement("div");
    
    // 设置基础样式类
    reactRoot.classList.add(
      ...[
        "bg-base-100",        // 背景色
        "text-base-content",  // 文字颜色
        "!text-[14px]",       // 字体大小
        "text-left",          // 文本左对齐
        "leading-normal",     // 行高正常
        "select-text",        // 允许文本选择
        "visible",            // 可见
      ]
    );
    
    // 设置主题属性
    reactRoot.setAttribute("data-theme", "light");
    
    // 创建样式元素并注入样式
    const style = document.createElement("style");
    style.innerText = shadowDomStyle + speakerStyle;
    shadowRoot.appendChild(style);

    // 使用 React 18 的 createRoot API 渲染组件
    ReactDOM.createRoot(reactRoot).render(
      <React.StrictMode>
        <SupportFullScreen />
      </React.StrictMode>
    );
    
    // 将 React 根容器添加到 Shadow DOM 中
    shadowRoot?.appendChild(reactRoot);
  }
}

/**
 * 注册自定义元素
 *
 * 如果 lingo-link-enhanced 元素尚未注册，则注册它并在文档中创建一个实例
 */
if (!customElements.get("lingo-link-enhanced")) {
  customElements.define("lingo-link-enhanced", LingoLink);
  const host = document.body || document.documentElement;
  host.appendChild(document.createElement("lingo-link-enhanced"));
}

/**
 * 异步注入高亮样式
 *
 * 动态生成并注入文本高亮样式到文档头部
 */
// 保留：如需恢复全站高亮样式，可取消注释以下代码
// (async ()=>{
//   const style = document.createElement("style");
//   style.innerText = await genHighlightStyle();
//   document.head.appendChild(style);
// } )()

/**
 * 支持全屏模式的 React 组件
 *
 * 这个组件处理全屏状态变化，确保 lingo-link-enhanced 元素在全屏时仍然可见
 * 通过监听 fullscreenchange 事件来动态调整元素位置
 */
export function SupportFullScreen() {
  // 使用状态变量来触发重新渲染
  const [v, setV] = useState(0);
  
  useEffect(() => {
    /**
     * 处理全屏状态变化的回调函数
     *
     * 当进入全屏时，将 lingo-link-enhanced 元素移动到全屏元素内
     * 当退出全屏时，将 lingo-link-enhanced 元素移回文档根元素
     */
    const handleFullScreen = function () {
      if (document.fullscreenElement) {
        // 进入全屏：将元素移动到全屏元素内
        document.fullscreenElement.appendChild(
          document.querySelector("lingo-link-enhanced")!
        );
        setV((pre) => pre + 1);
      } else {
        // 退出全屏：将元素移回文档根元素
        (document.body || document.documentElement).appendChild(
          document.querySelector("lingo-link-enhanced")!
        );
        setV((pre) => pre + 1);
      }
    };
    
    // 添加全屏状态变化监听器
    document.addEventListener("fullscreenchange", handleFullScreen);
    
    // 清理函数：移除事件监听器
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreen);
    };
  }, []);
  
  // 渲染 LingoCard 组件，key 属性用于在状态变化时重新渲染
  return <LingoCard key={v} />;
}
/**
 * 内容脚本入口：挂载翻译卡片与消息分发
 * - 注入样式、监听选择/点击事件
 * - 处理与后台/弹窗的消息通信
 */
