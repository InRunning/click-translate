let pageClicked = false;
const handlePageClick = () => {
  pageClicked = true
};
document.documentElement.addEventListener("click", handlePageClick);

export {pageClicked}
/**
 * 页面点击处理：统一处理点击穿透/关闭卡片等行为
 * - 根据事件源判断是否应收起 UI 或触发动作
 */
