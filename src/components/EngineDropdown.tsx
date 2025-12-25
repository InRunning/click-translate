// 引擎下拉组件：用于在“单词/句子”的不同引擎间切换
// 交互要点：
// - 鼠标移入打开、延迟关闭（离开后设置定时器）
// - 仅展示被用户勾选(enabled/checked)的引擎条目
// - 文案显示当前引擎名称，点击条目后触发 onChange 回调
import { EngineValue, EngineItem } from "@/types";
import { allSentenceEngineList, allWordEngineList } from "@/utils/const";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useAtom } from "jotai";
import { settingAtom } from "@/store";
export default function EngineDropdown({
  onChange,
  currentEngine,
  className,
  isWord,
}: {
  currentEngine: EngineValue;
  onChange: (engine: EngineValue) => void;
  className?: string;
  isWord: boolean;
}) {
  // 全局设置（包含用户可用的引擎清单）
  const [setting] = useAtom(settingAtom);
  // 下拉框开关状态
  const [dropdownState, setDropdownState] = useState<"open" | "close">("close");
  // 当前引擎的显示名称（由 currentEngine 映射）
  const [curEngineName, setCurEngineName] = useState("");
  // 延迟关闭的定时器 id（鼠标移出时使用）
  const timer = useRef<number | null>(null);
  const handleChange = (item: EngineItem) => {
    // 选择新引擎：调用父组件回调并关闭下拉
    onChange(item.value);
    setDropdownState("close");
  };
  const handleLabelMouseleave = () => {
    // 鼠标离开标签区域：设置延迟关闭，避免用户快速移向弹层时抖动
    timer.current = window.setTimeout(() => {
      setDropdownState("close");
    }, 400);
  };
  const handleMouseenter = () => {
    // 鼠标移入：如存在关闭定时器则取消；并打开下拉
    timer.current && clearTimeout(timer.current);
    setDropdownState("open");
  };
  const handleContentMouseleave = () => {
    // 鼠标离开弹层：快速关闭，减小误触悬浮层的时间
    timer.current = window.setTimeout(() => {
      setDropdownState("close");
    }, 50);
  };
  // 引擎集合：根据 isWord 选择“词引擎”或“句引擎”列表
  // 仅展示被勾选的引擎（checked=true）
  const engines = isWord  ? (setting.wordEngineList ?? allWordEngineList).filter(
    (item) => item.checked
  ) : (setting.sentenceEngineList ?? allSentenceEngineList).filter(
    (item) => item.checked
  );

  useEffect(() => {
    // 由当前引擎值映射显示名称
    const findItem = engines.find((item) => item.value === currentEngine);
    setCurEngineName(findItem?.name ?? "");
  }, [engines, currentEngine]);

  // return (
  //   <div className={`${className}`}>
  //     <ul className={`flex items-center space-x-1 text-[12px]`}>
  //       {engines.map((item) => (
  //         <li
  //           className={`cursor-pointer  px-1 py-[1px] rounded-md   ${
  //             currentEngine === item.value
  //               ? "bg-gray-300 text-black"
  //               : "hover:bg-gray-200"
  //           }`}
  //           onClick={() => handleChange(item)}
  //           // className={`btn btn-xs btn-ghost ${currentEngine === item.value ? 'border-b-2' : ''}`}
  //           key={item.value}
  //         >
  //           {item.name}
  //         </li>
  //       ))}
  //     </ul>
  //   </div>
  // );
  return (
    <div className={`${className}`}>
      <div
        onMouseEnter={handleMouseenter}
        onMouseLeave={handleLabelMouseleave}
        className="cursor-pointer flex items-center"
      >
        {/* 当前选中引擎名称 + 下拉箭头 */}
        <span>{curEngineName}</span>
        <ChevronDown className="stroke-2 w-[15px] h-[15px]" />
      </div>
      <ul
        onMouseEnter={handleMouseenter}
        onMouseLeave={handleContentMouseleave}
        className={`${dropdownState === "open" ? "visible" : "hidden"} ${
          engines.length > 2 && !isWord 
            ? "min-w-[220px] -right-[50px]"
            : "left-1/2 -translate-x-[50%]"
        } absolute  top-[100%] z-[1] p-1 shadow-xl bg-base-300 rounded-lg overflow-scroll`}
      >
        {/* 引擎选项：使用单选按钮样式的按钮组 */}
        {engines.map((item) => (
          <li className={`inline-block  m-[1px]`} key={item.value}>
            <input
              // 选中后触发 handleChange
              onChange={() => handleChange(item)}
              type="radio"
              className="btn btn-xs btn-ghost"
              value={item.value}
              checked={item.value === currentEngine}
              aria-label={item.name}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
/**
 * 引擎下拉选择：切换当前使用的词/句引擎
 * - 同步到设置并通知相关组件刷新
 */
