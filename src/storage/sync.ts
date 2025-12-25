// 导入 Setting 类型定义 (Setting Type Definition)
import { Setting } from "@/types";
// 导入浏览器扩展 API 多态填充库 (Browser Extension API Polyfill Library)
import Browser from "webextension-polyfill";

/**
 * 获取设置 (Get Setting)
 * 从浏览器同步存储中获取所有设置项
 * @returns {Promise<Setting>} 返回包含所有设置的对象
 */
export const getSetting = async(): Promise<Setting>=>{
  // 从浏览器同步存储中获取所有数据
  return await Browser.storage.sync.get();
}

/**
 * 设置设置 (Set Setting)
 * 将新的设置项保存到浏览器同步存储中
 * @param {Partial<Setting>} param - 部分设置对象，包含要更新的设置项
 * @returns {Promise<void>} 返回设置操作的结果
 */
export const setSetting = async(param: Partial<Setting>)=>{
  // 将设置项保存到浏览器同步存储中
  return Browser.storage.sync.set(param);
}

/**
 * 清除设置 (Clear Setting)
 * 清空浏览器同步存储中的所有设置数据
 * @returns {Promise<void>} 返回清除操作的结果
 */
export const clearSetting = async()=>{
  // 清空浏览器同步存储中的所有数据
  return Browser.storage.sync.clear();
}
/**
 * 同步存储（browser.storage.sync）
 * - 跨设备同步用户设置
 * - 注：受浏览器配额限制，注意数据体积
 */
