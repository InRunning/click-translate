/**
 * 全局状态管理模块 - 使用 Jotai 轻量级状态管理
 *
 * 设计原则：
 * - 仅存放跨页面/脚本共享的最小状态与操作
 * - 避免状态臃肿，保持状态管理的简洁性
 * - 使用原子化设计，每个状态都是独立的
 */

// 导入类型定义
import { Setting } from "@/types";
// 导入 Jotai 核心函数，用于创建原子状态
import { atom } from "jotai";
// 导入单词相关类型定义
// 导入设置相关的存储操作函数
import { getSetting as getSettingStorage, setSetting as  setSettingStorage} from "./storage/sync";

// 用户设置原子：保存并同步扩展的 Setting
const _settingAtom = atom<Setting|Record<string,never>>({})
export const settingAtom = atom((get)=>{
  return get(_settingAtom)
},(get,set,update:Partial<Setting>) => {
  // 写入：合并并持久化部分设置更新
  const setting = get(
    _settingAtom);
  set(_settingAtom, {...setting, ...update});
  setSettingStorage(update)
})
settingAtom.onMount = (setAtom)=>{
  // 初始化：从同步存储载入用户设置
  getSettingStorage().then((res) => {
    setAtom(res)
  })
}
// 已移除：生词本、收藏与备注相关的 atom 与远端同步
