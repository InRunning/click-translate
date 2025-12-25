import Browser from "webextension-polyfill";
export type SessionStorageInterface = {
  showLogin?: boolean,
} 
export const getSession = async(): Promise<SessionStorageInterface>=>{
  return await Browser.storage.session.get();
}
export const setSession = async(param: Partial<SessionStorageInterface>)=>{  
  return await Browser.storage.session.set(param);
}

export const clearSession = async()=>{  
  return await Browser.storage.session.clear();
}
/**
 * 会话存储（browser.storage.session）
 * - 仅当前浏览器会话内有效
 * - 用于 UI 临时状态（如是否展示登录弹窗）
 */
