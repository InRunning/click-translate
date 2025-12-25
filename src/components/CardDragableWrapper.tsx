import { X } from "lucide-react";
import Draggable from "react-draggable";
import {
  defaultTranslateWidth,
  defaultTranslateMinHeight,
  defaultTranslateMaxWidth,
} from "@/utils/const";
import { useEffect, useRef } from "react";
import { Settings } from "lucide-react";
import Browser from "webextension-polyfill";
import { ExtensionMessage } from "@/types";

export default function DragableWrapper({
  children,
  x,
  y,
  onmouseenter,
  onClose,
  width,
  maxWidth,
}: {
  children: React.ReactNode;
  x: number;
  y: number;
  onmouseenter: () => void;
  onClose: () => void;
  width?: number | string;
  maxWidth?: number | string;
}) {
  // 外层可拖拽节点引用（react-draggable 需要）
  const nodeRef = useRef<HTMLDivElement | null>(null);
  // 内容区引用（用于绑定 mouseenter：阻止卡片被误隐藏）
  const contentRef = useRef<HTMLDivElement | null>(null);
  const openOption = async () => {
    try {
      // 通过 runtime 向后台发送打开选项页的消息
      const message: ExtensionMessage = { type: "openOptions" };
      await Browser.runtime.sendMessage(message);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    // 检查是否存在 onmouseenter 回调函数
    if (onmouseenter) {
      // 获取内容区域的DOM元素引用
      const contentDom = contentRef.current;
      
      // 创建鼠标进入事件处理函数
      const handleMouseEnter = () => {
        // 当鼠标进入卡片内容时，通知上层取消隐藏定时器
        // 这可以防止用户与卡片交互时卡片被意外隐藏
        onmouseenter();
      };
      
      // 为内容区域添加鼠标进入事件监听器
      contentDom?.addEventListener("mouseenter", handleMouseEnter);
      
      // 返回清理函数，在组件卸载或依赖项变化时执行
      return () => {
        // 清理事件监听器，避免内存泄漏和重复绑定
        contentDom?.removeEventListener("mouseenter", handleMouseEnter);
      };
    }
  }, [onmouseenter]);
  return (
    <Draggable
      handle=".handle"
      nodeRef={nodeRef}
      defaultClassName="chat_cat_dragable"
      defaultClassNameDragging="chat_cat_dragable_dragging"
      defaultClassNameDragged="chat_cat_dragable_dragged"
    >
      <div
        ref={nodeRef}
        style={{
          left: x,
          top: y,
          width: width ?? defaultTranslateWidth,
          maxWidth: maxWidth ?? defaultTranslateMaxWidth,
          minHeight: defaultTranslateMinHeight,
          padding: 16,
        }}
        className={`group fixed bg-inherit max-h-[100vh] p-[5px] flex flex-col  rounded-xl shadow-[0_0_16px_0px_rgba(0,0,0,0.2)] text-[14px]  overflow-hidden z-[2147483647]`}
      >
        {/* <GripHorizontal
          className="handle opacity-0 group-hover:opacity-50 z-10"
          style={{
            position: "absolute",
            left: "50%",
            top: "-6px",
            transform: "translateX(-50%)",
            width: "38px",
            height: "38px",
            boxSizing: "border-box",
            cursor: "move",
            padding: "2px 10px",
          }}
        /> */}
        {/* 拖拽手柄：占位在卡片顶部，用于触发拖动 */}
        <div className="handle z-10 absolute left-0 top-0 bg-transparent w-full h-[30px]"></div>
        <div className="flex items-center absolute right-1 top-1 z-10">
          <Settings
            onClick={openOption}
            className="cursor-pointer  w-[24px] h-[24px] p-[4px]"
          />
          <X
            onClick={onClose}
            className="cursor-pointer  w-[24px] h-[24px] p-[4px]"
          />
        </div>
        {/* 内容区域：承载翻译结果与交互子组件 */}
        <div className="text" ref={contentRef}>
          {children}
        </div>
      </div>
    </Draggable>
  );
}
