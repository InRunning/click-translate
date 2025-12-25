/**
 * Lingo Link 扩展的核心内容脚本组件
 * 
 * 这是一个Chrome浏览器扩展的内容脚本，负责在网页上实现翻译功能
 * 主要功能包括：
 * - 文本选择检测与翻译触发
 * - 翻译卡片的显示、定位和交互
 * - 多种触发方式支持（选择文本、悬停、快捷键）
 * - 拖拽支持
 * - 国际化语言切换
 * - 错误边界处理
 */

// 导入浏览器扩展API的polyfill，确保在所有浏览器中都能使用
import browser from "webextension-polyfill";

// React核心Hook导入 - 用于管理组件状态和副作用
import { useCallback, useEffect, useRef, useState } from "react";

// 工具函数导入 - 用于检查用户选择和处理布局
import { isSelectionInEditElement, isWord, preventBeyondWindow } from "@/utils";

// UI组件导入
import TriggerIcon from "@/components/TriggerIcon"; // 触发按钮组件

// 常量导入 - 定义默认的卡片尺寸
import {
  defaultCardWidth,        // 默认单词卡片宽度
  defaultCardMinHeight,    // 默认单词卡片最小高度
  defaultTranslateWidth,   // 默认翻译卡片宽度
  defaultTranslateMinHeight, // 默认翻译卡片最小高度
  defaultSetting,          // 默认设置
} from "@/utils/const";

// 功能组件导入
import SearchResult from "@/components/SearchResult"; // 搜索结果显示组件
import { ToastContainer } from "@/components/Toast";   // 提示消息容器

// 选择文本处理工具
import { getSentenceFromSelection } from "@/utils/getSelection"; // 从选中区域获取完整句子
import { currentSelectionInfo } from "@/utils"; // 当前选择信息的全局状态

// 状态管理 - 使用Jotai进行全局状态管理
import { settingAtom } from "../store"; // 用户设置的状态原子

// 国际化支持
import { useTranslation } from "react-i18next"; // i18next的React Hook

// 拖拽包装器组件
import CardDragableWrapper from "@/components/CardDragableWrapper";

// 错误边界处理
import { ErrorBoundary } from "react-error-boundary"; // React错误边界组件
import FallbackComponent from "@/components/FallbackComponent"; // 错误降级组件

// 事件总线 - 用于组件间通信
// import { emitter } from "@/utils/mitt"; // 轻量级事件发布订阅库（已不再使用）

// 类型定义
import { ExtensionMessage } from "@/types"; // 扩展消息类型定义
// import onCaptureScreenResult from "@/utils/onCaptureScreenResult"; // 屏幕截图结果处理（已移除截图功能）

// 状态管理Hook
import { useAtom } from "jotai"; // Jotai状态管理Hook

// 自定义Hook
// import useTreeWalker from "@/hooks/useTreeWalker"; // 悬停查词相关（已移除）
// 已移除：与生词/备注同步相关的消息 Hook

// 快捷键处理库
import hotkeys from "hotkeys-js"; // 键盘快捷键管理库

/**
 * 主要的内容脚本组件
 * 这是整个翻译功能的入口组件，负责协调各种交互和状态管理
 */
export default function ContentScriptApp() {
  // 无需初始化已移除的消息 Hook
  
  // 使用useRef存储定时器ID，避免组件重新渲染时丢失
  // 移除悬停查词相关定时器
  
  // 使用Jotai的useAtom Hook读取全局设置状态
  const [setting] = useAtom(settingAtom);
  
  // 国际化Hook - 提供多语言支持
  const { i18n } = useTranslation();

  // 触发图标显示状态 - 控制选择文本时出现的触发按钮
  const [triggerIconShow, setTriggerIconShow] = useState(false);
  // 触发图标位置状态 - 使用对象存储x、y坐标
  const [triggerIconPosition, setTriggerIconPosition] = useState({
    x: 0,
    y: 0,
  });
  
  // 翻译卡片位置状态
  const [cardPosition, setCardPosition] = useState({
    x: 0,
    y: 0,
  });
  // 翻译卡片宽度（响应式）
  const [cardWidth, setCardWidth] = useState<number>(defaultTranslateWidth);
  
  // 翻译卡片显示状态 - 控制卡片是否可见
  const [cardShow, setCardShow] = useState(false);
  
  // 使用useRef存储选中的文本范围，用于后续精确定位
  const rangeRef = useRef<Range | undefined>(undefined);
  
  // 搜索文本状态 - 存储当前需要翻译的文本
  const [searchText, setSearchText] = useState("");

  /**
   * 移动端：划词后通过上下轻扫/滚动触发
   * - 在 selectionchange 捕获有效选区后“武装”一次手势窗口
   * - 在限定时间内，若垂直位移超阈值则触发弹卡
   */
  const isTouchDevice = typeof window !== "undefined" && (
    "ontouchstart" in window ||
    ((navigator as unknown as { maxTouchPoints?: number })?.maxTouchPoints ?? 0) > 0
  );
  const gestureArmedRef = useRef(false);
  const gestureArmedAtRef = useRef(0);
  const initialScrollYRef = useRef(0);
  const initialTouchYRef = useRef(0);
  const lastSelectionPagePosRef = useRef<{ x: number; y: number } | null>(null);
  const MOBILE_TRIGGER_DISTANCE = 22; // px，触发阈值（经验值）
  const MOBILE_ARM_WINDOW = 1500; // ms，划词后可触发的时间窗口

  /**
   * 显示翻译卡片并设置位置的回调函数
   * 使用useCallback优化性能，避免不必要的重新创建
   * @param text - 要翻译的文本
   * @param domRect - 可选的DOM元素矩形信息，用于自动定位
   * @param position - 可选的手动指定位置坐标
   */
  const showCardAndPosition = useCallback(
    ({
      text,
      position,
      domRect,
    }: {
      text: string;
      domRect?: DOMRect;
      position?: {
        x: number;
        y: number;
      };
    }) => {
      // 显示卡片并设置搜索文本
      setCardShow(true);
      setSearchText(text);
      setTriggerIconShow(false); // 隐藏触发按钮
      
      // 初始化位置坐标
      let x = -300;
      let y = -300;

      // 基于视口计算响应式宽度（92vw 上限不超过默认宽度）
      const isWordInput = isWord({
        input: text,
        lang: setting.sourceLanguage?.language,
      });
      const baseWidth = isWordInput ? defaultCardWidth : defaultTranslateWidth;
      const vw = typeof window !== 'undefined' ? window.innerWidth : baseWidth;
      const responsiveWidth = Math.min(baseWidth, Math.floor(vw * 0.92));
      setCardWidth(responsiveWidth);
      
      // 如果提供了DOM元素矩形，使用自动定位逻辑
      if (domRect) {
        const position = preventBeyondWindow({
          // 根据文本类型（单词 vs 句子）选择不同的卡片尺寸
          boxWidth: responsiveWidth,
          boxHeight: isWordInput
            ? defaultCardMinHeight
            : defaultTranslateMinHeight,
          domRect,    // 参考的DOM元素位置
          gap: 10,    // 与参考元素的间距
        });
        x = position.x;
        y = position.y;
        // 组件使用 fixed 定位，修正滚动偏移
        x = x - window.scrollX;
        y = y - window.scrollY;
      }
      
      // 如果手动指定了位置坐标，使用手动坐标
      if (position) {
        // 传入位置通常为页面坐标（pageX/pageY），fixed 定位需减去滚动量
        x = position.x - window.scrollX;
        y = position.y - window.scrollY;
        // 在视口内做一次边界钳制，避免超出小屏幕
        const pad = 8;
        const maxX = Math.max(0, window.innerWidth - responsiveWidth - pad);
        const maxY = Math.max(0, window.innerHeight - (isWordInput ? defaultCardMinHeight : defaultTranslateMinHeight) - pad);
        x = Math.min(Math.max(pad, x), maxX);
        y = Math.min(Math.max(pad, y), maxY);
      }
      
      // 更新卡片位置状态
      setCardPosition({
        x,
        y,
      });
    }, 
    // 依赖项数组 - 当这些值变化时，函数会重新创建
    [setting.sourceLanguage?.language]
  );

  // 移除悬停查词逻辑：仅保留划词触发

  /**
   * 快捷键监听Effect
   * 根据用户设置监听特定的键盘快捷键
   */
  useEffect(() => {
    const translate = () => {
      // 快捷键触发的翻译函数
      showCardAndPosition({
        text: currentSelectionInfo.word,
        domRect: rangeRef.current!.getBoundingClientRect(),
      });
    };

    // 如果用户设置了快捷键，则注册监听器
    if (setting.shoutcut) {
      hotkeys(setting.shoutcut, translate);
    }

    // 清理函数 - 组件卸载或依赖变化时执行
    return () => {
      if (setting.shoutcut) {
        hotkeys.unbind(); // 解除快捷键绑定
      }
    };
  }, [setting.shoutcut, showCardAndPosition]);

  /**
   * 鼠标事件监听Effect
   * 处理鼠标点击和选择事件
   */
 useEffect(() => {
   /**
    * 鼠标释放事件处理
    * 当用户释放鼠标按钮时，检查是否选中了文本
    */
   const handleMouseUp = async function (event: MouseEvent) {
     // 如果选区在可编辑元素内（如输入框），则不处理
     if (isSelectionInEditElement()) {
       return;
     }

     // 获取当前选中的文本并去除首尾空格
     const selection = window.getSelection()?.toString().trim();
     
     // 如果有选中的文本且设置了显示选择图标，则显示触发图标
     if (
       selection &&
       (setting.showSelectionIcon ?? defaultSetting.showSelectionIcon)
     ) {
       setTriggerIconShow(true);
       // TriggerIcon 采用 fixed 定位，使用 client 坐标
       setTriggerIconPosition({
         x: event.clientX,
         y: event.clientY + 10,
       });
     }
   };

   /**
    * 鼠标按下事件处理
    * 用于隐藏触发图标和卡片
    */
   const handleMouseDown = function (event: MouseEvent | TouchEvent) {
     const target = event.target as HTMLElement;
     // 如果点击的不是扩展相关的元素，则隐藏UI
     const inWidget = Boolean(target.closest('lingo-link, lingo-link-enhanced'));
     if (!inWidget) {
       setTriggerIconShow(false);
       setCardShow(false);
     }
   };

   /**
    * 鼠标滚轮事件处理
    * 当用户滚动鼠标滚轮时，隐藏触发图标
    */
   const handleWheel = function () {
     // 只有当触发图标显示时才处理滚轮事件
     if (triggerIconShow) {
       setTriggerIconShow(false);
     }
   };

   // 注册事件监听器
   document.body.addEventListener("mouseup", handleMouseUp);      // 鼠标释放
   document.body.addEventListener("mousedown", handleMouseDown);  // 鼠标按下
   document.body.addEventListener("wheel", handleWheel, { passive: true });  // 鼠标滚轮
   // 移动端补充：点击页面任意位置（非组件内）时隐藏卡片
   document.body.addEventListener("touchstart", handleMouseDown, { passive: true });

   // 清理事件监听器
   return () => {
     document.body.removeEventListener("mouseup", handleMouseUp);
     document.body.removeEventListener("mousedown", handleMouseDown);
     document.body.removeEventListener("wheel", handleWheel);
     document.body.removeEventListener("touchstart", handleMouseDown as EventListener);
   };
 }, [setting.showSelectionIcon, triggerIconShow]);

  /**
   * 选区变化监听Effect
   * 监听document的selectionchange事件，跟踪用户的选择
   */
  useEffect(() => {
    const handleSelectionChange = () => {
      // 如果选区在可编辑元素内，则不处理
      if (isSelectionInEditElement()) {
        return;
      }

      const selection = window.getSelection()?.toString().trim();
      // 说明：Shadow DOM 中的选区并非 document.body 的后代，
      // 使用 containsNode(document.body) 会错误地排除阴影根内的选择。
      // 这里仅依据选中文本是否非空以及 rangeCount>0 作为有效性判定。
      if (selection && window.getSelection()?.rangeCount) {
        // 更新全局的选择信息
        currentSelectionInfo.word = selection;
        currentSelectionInfo.context = getSentenceFromSelection(
          window.getSelection()
        );
        // 保存选中的Range对象，用于后续精确定位
        rangeRef.current = window.getSelection()?.getRangeAt(0);

        // 移动端：武装一次“轻扫触发”窗口，并记录锚点的页面坐标
        if (isTouchDevice && rangeRef.current) {
          try {
            const rect = rangeRef.current.getBoundingClientRect();
            lastSelectionPagePosRef.current = {
              x: rect.left + rect.width / 2 + window.scrollX,
              y: rect.bottom + window.scrollY + 10,
            };
            initialScrollYRef.current = window.scrollY;
            gestureArmedRef.current = true;
            gestureArmedAtRef.current = Date.now();
          } catch (_) {
            // 忽略偶发不可测量的 range
            lastSelectionPagePosRef.current = null;
            gestureArmedRef.current = true;
            gestureArmedAtRef.current = Date.now();
          }
        }
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  /**
   * 移动端：在滚动或触摸移动时检查是否触发弹卡
   */
  useEffect(() => {
    if (!isTouchDevice) return;

    const withinArmWindow = () => Date.now() - gestureArmedAtRef.current <= MOBILE_ARM_WINDOW;
    const disarm = () => {
      gestureArmedRef.current = false;
      gestureArmedAtRef.current = 0;
    };

    const tryTriggerFromDelta = (deltaY: number) => {
      if (!gestureArmedRef.current) return;
      if (!withinArmWindow()) {
        disarm();
        return;
      }
      if (Math.abs(deltaY) < MOBILE_TRIGGER_DISTANCE) return;

      // 有效触发：优先使用当前 range 定位，否则使用保存的页面坐标
      const text = currentSelectionInfo.word;
      if (!text) {
        disarm();
        return;
      }
      if (rangeRef.current) {
        showCardAndPosition({
          text,
          domRect: rangeRef.current.getBoundingClientRect(),
        });
      } else if (lastSelectionPagePosRef.current) {
        showCardAndPosition({
          text,
          position: {
            x: lastSelectionPagePosRef.current.x,
            y: lastSelectionPagePosRef.current.y,
          },
        });
      } else {
        // 兜底：使用当前视口中心点
        showCardAndPosition({
          text,
          position: { x: window.scrollX + window.innerWidth / 2, y: window.scrollY + 120 },
        });
      }
      disarm();
    };

    const onScroll = () => {
      if (!gestureArmedRef.current) return;
      const delta = window.scrollY - initialScrollYRef.current;
      tryTriggerFromDelta(delta);
    };

    const onTouchStart = (ev: TouchEvent) => {
      if (!gestureArmedRef.current) return;
      initialTouchYRef.current = ev.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (ev: TouchEvent) => {
      if (!gestureArmedRef.current) return;
      const curY = ev.touches[0]?.clientY ?? 0;
      const delta = initialTouchYRef.current - curY; // 手指上移为正，下移为负
      tryTriggerFromDelta(delta);
    };

    document.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      document.removeEventListener("scroll", onScroll);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
    };
  }, [showCardAndPosition, isTouchDevice]);

  /**
   * 隐藏卡片事件监听Effect
   * 通过事件总线监听其他组件发出的隐藏卡片请求
   */
  // 移除通过 mitt 总线的隐藏事件（无外部来源）

  /**
   * 显示卡片事件监听Effect
   * 通过事件总线监听其他组件发出的显示卡片请求
   */
  // 移除通过 mitt 总线的显示事件（去除站点注入依赖）

  /**
   * 触发图标点击事件处理
   * 当用户点击触发图标时显示翻译卡片
   */
  const handleTriggerClick = () => {
    const text = currentSelectionInfo.word;
    if (!text) {
      return;
    }

    // 优先使用选区 Range 定位，如果不可用则退化为使用触发图标自身的位置
    if (rangeRef.current) {
      showCardAndPosition({
        text,
        domRect: rangeRef.current.getBoundingClientRect(),
      });
    } else {
      showCardAndPosition({
        text,
        position: {
          x: triggerIconPosition.x,
          y: triggerIconPosition.y,
        },
      });
    }
  };

  /**
   * 隐藏卡片的回调函数
   * 使用useCallback优化性能
   */
  const hideCard = useCallback(() => {
    setCardShow(false);
  }, []);

  /**
   * 界面语言切换Effect
   * 根据用户设置自动切换界面语言
   */
  useEffect(() => {
    // 如果设置的语言与当前语言不同，则切换语言
    if (setting.interfaceLanguage !== i18n.language) {
      i18n.changeLanguage(
        setting.interfaceLanguage ?? defaultSetting.interfaceLanguage
      );
    }
  }, [setting.interfaceLanguage, i18n]);

  /**
   * 扩展消息处理Effect
   * 处理来自扩展background script或其他content script的消息
   */
  useEffect(() => {
    const handleMessage = async (message: ExtensionMessage) => {
      // 处理显示卡片的请求
      if (message.type === "showCardAndPosition") {
        // 检查是否有当前选择信息
        if (!currentSelectionInfo.word) {
          console.warn("don't support input element selection");
          return;
        }

        // 同 handleTriggerClick：优先使用 Range，缺失时退化为视口中部
        if (rangeRef.current) {
          showCardAndPosition({
            text: currentSelectionInfo.word,
            domRect: rangeRef.current.getBoundingClientRect(),
          });
        } else {
          showCardAndPosition({
            text: currentSelectionInfo.word,
            position: {
              x: window.scrollX + window.innerWidth / 2,
              y: window.scrollY + 120,
            },
          });
        }
      }

      // 移除屏幕截图结果处理

      // 处理获取当前窗口选择信息的请求
      if (message.type === "getCurWindowSelectionInfo") {
        const selection = window.getSelection()?.toString().trim();
        // 同上，为兼容 Shadow DOM/iframe，仅判断文本是否非空
        if (selection && window.getSelection()?.rangeCount) {
          // 返回选择信息
          return {
            word: selection,
            context: getSentenceFromSelection(window.getSelection()),
          };
        } else {
          return null;
        }
      }
    };

    // 注册消息监听器
    browser.runtime.onMessage.addListener(handleMessage);
    
    return () => {
      // 清理消息监听器
      browser.runtime.onMessage.removeListener(handleMessage);
    };
  }, [showCardAndPosition]);

  /**
   * 窗口尺寸变化时，若卡片展开则自适应宽度并校正位置
   */
  useEffect(() => {
    const onResize = () => {
      if (!cardShow) return;
      const text = searchText || currentSelectionInfo.word;
      if (!text) return;
      // 优先使用 range 重新定位，保证贴近锚点
      if (rangeRef.current) {
        showCardAndPosition({
          text,
          domRect: rangeRef.current.getBoundingClientRect(),
        });
      } else {
        // 否则仅按当前左上角进行一次边界钳制
        const isWordInput = isWord({
          input: text,
          lang: setting.sourceLanguage?.language,
        });
        const baseWidth = isWordInput ? defaultCardWidth : defaultTranslateWidth;
        const vw = typeof window !== 'undefined' ? window.innerWidth : baseWidth;
        const responsiveWidth = Math.min(baseWidth, Math.floor(vw * 0.92));
        setCardWidth(responsiveWidth);
        const pad = 8;
        const maxX = Math.max(0, window.innerWidth - responsiveWidth - pad);
        const maxY = Math.max(0, window.innerHeight - (isWordInput ? defaultCardMinHeight : defaultTranslateMinHeight) - pad);
        setCardPosition((prev) => ({
          x: Math.min(Math.max(pad, prev.x), maxX),
          y: Math.min(Math.max(pad, prev.y), maxY),
        }));
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [cardShow, searchText, showCardAndPosition, setting.sourceLanguage?.language]);

  // 返回JSX - 组件的UI渲染部分
  return (
    <div
      style={{ opacity: 0 }} 
      className="bg-inherit !opacity-100"
      id="orange-translator-container"
    >
      {/* 触发图标 - 当用户选择文本时显示 */}
      <TriggerIcon
        size={setting.triggerIconSize ?? defaultSetting.triggerIconSize}
        url={setting.triggerIcon}
        x={triggerIconPosition.x}
        y={triggerIconPosition.y}
        show={triggerIconShow}
        onClick={handleTriggerClick}
      />
      
      {/* 错误边界 - 包装翻译卡片，防止组件出错影响整个页面 */}
      <ErrorBoundary
        FallbackComponent={(fallbackProps) => (
          <FallbackComponent fallbackProps={fallbackProps} />
        )}
      >
        {/* 条件渲染翻译卡片 - 只有当cardShow为true时才显示 */}
        {cardShow && (
          <CardDragableWrapper
            x={cardPosition.x}
            y={cardPosition.y}
            width={cardWidth}
            maxWidth={cardWidth}
            onClose={hideCard}
            onmouseenter={() => {}}
          >
            {/* 搜索结果组件 - 实际的翻译结果显示 */}
            <SearchResult searchText={searchText} />
          </CardDragableWrapper>
        )}
      </ErrorBoundary>
      
      {/* 提示消息容器 - 显示各种状态提示和错误消息 */}
      <ToastContainer />
    </div>
  );
} // ContentScriptApp 组件定义结束
