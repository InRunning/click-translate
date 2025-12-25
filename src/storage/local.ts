import type { CommunityItemType, Sww } from "@/types/words";
import { Local } from "@/types";
import { isSameWord } from "@/utils";
import browser from "webextension-polyfill";
export const getLocal = async(): Promise<Local>=>{
  return await browser.storage.local.get();
}
export const setLocal = async(param: Partial<Local>)=>{
  return browser.storage.local.set(param);
}
export const clearLocal = async()=>{
  return browser.storage.local.clear();
}
// 迁移数据到新键名的函数
const migrateData = async () => {
  const localData = await getLocal();
  
  // 如果还没有迁移过，则进行数据迁移
  if (!localData.lingoLinkEnhanced_migrated) {
    const updatedData: Partial<Local> = { lingoLinkEnhanced_migrated: true };
    
    // 迁移单词列表
    if (localData.swwList && !localData.lingoLinkEnhanced_swwList) {
      updatedData.lingoLinkEnhanced_swwList = localData.swwList;
    }
    
    // 迁移备注列表
    if (localData.remarkList && !localData.lingoLinkEnhanced_remarkList) {
      updatedData.lingoLinkEnhanced_remarkList = localData.remarkList;
    }
    
    // 迁移模型列表
    if (localData.openAIModelList && !localData.lingoLinkEnhanced_openAIModelList) {
      updatedData.lingoLinkEnhanced_openAIModelList = localData.openAIModelList;
    }
    
    // 保存迁移后的数据
    await setLocal(updatedData);
  }
};

// 确保在模块加载时执行数据迁移
migrateData().catch(console.error);

export const addWord = async (sww: Sww) => {
  const localData = await getLocal();
  const swwList = localData.lingoLinkEnhanced_swwList ?? localData.swwList ?? [];
  setLocal({lingoLinkEnhanced_swwList: [...swwList, sww]})
};
export const updateWord = async(sww: Sww) => {
  const localData = await getLocal();
  const swwList = localData.lingoLinkEnhanced_swwList ?? localData.swwList ?? [];
  setLocal({lingoLinkEnhanced_swwList:(
    swwList.map((item) => {
      if (isSameWord(item.word, sww.word)) {
        return { ...item, ...sww  };
      } else {
        return item;
      }
    })
  )});
};
export const removeWord = async({ word }: { word: string; }) => {
  const localData = await getLocal();
  const swwList = localData.lingoLinkEnhanced_swwList ?? localData.swwList ?? [];

  setLocal({lingoLinkEnhanced_swwList: (swwList.filter((item) => !isSameWord(item.word, word)))});
};

export const getList = async () => {
  const localData = await getLocal();
  return localData.lingoLinkEnhanced_swwList ?? localData.swwList ?? []
}
export const getRemarkList = async () => {
  const localData = await getLocal();
  return localData.lingoLinkEnhanced_remarkList ?? localData.remarkList ?? []
}
export const addRemark = async (item: CommunityItemType) => {
  const localData = await getLocal();
  const remarkList = localData.lingoLinkEnhanced_remarkList ?? localData.remarkList ?? [];
  setLocal({lingoLinkEnhanced_remarkList: [...remarkList, item]})
};
export const updateRemark = async(item: CommunityItemType) => {
  const localData = await getLocal();
  const remarkList = localData.lingoLinkEnhanced_remarkList ?? localData.remarkList ?? [];
  setLocal({lingoLinkEnhanced_remarkList:(
    remarkList.map((im) => {
      if (item.id === im.id) {
        return { ...im, ...item  };
      } else {
        return im;
      }
    })
  )});
};
export const removeRemark = async({ id }: { id: string; }) => {
  const localData = await getLocal();
  const remarkList = localData.lingoLinkEnhanced_remarkList ?? localData.remarkList ?? [];

  setLocal({lingoLinkEnhanced_remarkList: (remarkList.filter((item) => item.id !== id))});
};
/**
 * 本地存储（browser.storage.local）
 * - 存放体积较大的词库/收藏等数据
 * - 不跨设备同步
 */
