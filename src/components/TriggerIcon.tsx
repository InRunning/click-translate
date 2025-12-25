// 导入默认触发器图标
import triggerIcon from "@/assets/icon.png";

// 构建默认图标的完整URL路径
const defaultIconUrl = new URL(triggerIcon, import.meta.url).href;

/**
 * TriggerIcon 触发器图标组件
 * 用于在页面上显示可点击的触发器图标，通常用于启动翻译或其他功能
 *
 * @param x - 图标距离页面左侧的像素位置
 * @param y - 图标距离页面顶部的像素位置
 * @param show - 控制图标是否显示的布尔值
 * @param size - 图标的尺寸（正方形，长宽相等）
 * @param url - 可选的自定义图标URL，如果不提供则使用默认图标
 * @param onClick - 点击图标时执行的回调函数
 */
export default function TriggerIcon({
  x,
  y,
  show,
  size,
  url,
  onClick,
}: {
  x: number;           // X轴坐标（像素）
  y: number;           // Y轴坐标（像素）
  size: number;        // 图标尺寸（像素）
  url?: string;        // 自定义图标URL（可选）
  show: boolean;       // 是否显示图标
  onClick: (event: React.MouseEvent<HTMLElement>) => void;  // 点击事件处理函数
}) {
  
  /**
   * 处理图标点击事件
   * @param event - 鼠标点击事件对象
   */
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    // 阻止事件冒泡，避免触发其他元素的点击事件
    event.stopPropagation()
    // 调用父组件传递的onClick回调函数
    onClick(event)
  }

  return (
    // 外层容器div，定位到指定坐标
    <div
      onClick={handleClick}  // 绑定点击事件处理函数
      // 设置位置和尺寸：left和top控制位置，width和height控制大小
      style={{ left: `${x}px`, top: `${y}px`, width: size, height: size }}
      // 动态设置可见性类名，cursor-pointer使鼠标悬停时显示手型光标
      // absolute绝对定位，z-index设置最高层级确保图标在最上层
      // select-none防止用户选中文本
      className={`${
        show ? "visible" : "invisible"  // 根据show属性控制可见性
      } cursor-pointer fixed z-[2147483647] select-none`}
    >
      {/* 图标图片，填满整个容器，使用圆角样式 */}
      <img
        className="w-full h-full rounded-md chat-cat-icon"
        // 使用传入的url或默认图标URL
        src={url ?? defaultIconUrl}
        alt=""
      />
    </div>
  );
}
