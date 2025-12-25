/**
 * API 聚合模块 (API Aggregation Module)
 *
 * 功能说明：
 * - 统一管理所有与后端API的交互
 * - 处理用户登录、单词管理、社区功能等
 * - 提供统一的请求封装和错误处理
 * - 支持文件上传和Base64图片处理
 */

// 导入Toast消息管理器，用于显示API操作反馈
import { toastManager } from "@/components/Toast";
// 导入数据类型定义
import type { CommunityItemType, Sww } from "@/types/words";
// 导入设置存储操作函数
import { getSetting } from "@/storage/sync";
// 导入工具函数
import { base64ToBlob, sendBackgroundFetch } from "@/utils";
// 导入用户数据类型
import { User } from "@/types";

// 后端API基础URL
const baseUrl = "https://api.mywords.cc";

/**
 * 登录相关的类型定义
 * 支持邮箱验证码、密码、Google OAuth三种登录方式
 */
interface Login {
  params:
    | { email: string; code: number; loginWithGoogle: boolean }           // 邮箱验证码登录
    | { email: string; password: string; loginWithGoogle: boolean }       // 密码登录
    | {                                                                 // Google OAuth登录
        loginWithGoogle: boolean;
        email: string;
        picture: string;
        name: string;
      };
  res: User;  // 返回用户信息
}

const request = async (
  url: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    headers?: Record<string, string>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any;
  }
) => {
  const setting = await getSetting();
  options.method = options.method ?? 'GET'
  if (!url.endsWith("upload")) {
    options.headers = {
      "Content-Type": "application/json",
    };

    if (options.body) {      
      options.body = JSON.stringify(options.body);
    }
  } else {
    options.headers = {};
  }

  if (setting?.userInfo?.token) {
    options.headers.token = setting.userInfo.token;
  }
  
  const res = await fetch(`${baseUrl}${url}`, options);
  const json = await res.json();
  if (json.error) {
    toastManager.add({ msg: json.error, type: "error" });
    throw json.error;
  }
  return json;
};

export const addSwwApi = async (param: Sww) => {
  return request("/word/add", {
    method: "POST",
    body: param,
  });
};
export const updateWordApi = async (
  param: Pick<Sww, "id"> & Partial<Omit<Sww, "id">>
) => {
  return request("/word/update", {
    method: "POST",
    body: param,
  });
};
export const getSwwList = async (): Promise<{ list: Sww[] } | undefined> => {
  return request("/word/list", {
    method: "GET",
  });
};
export const removeWordApi = async (word: string) => {
  return request(`/word/delete/${encodeURIComponent(word)}`, {
    method: "DELETE",
  });
};
export const upload = async (blob: Blob) => {
  const formData = new FormData();
  formData.append('file', blob)
  return request(`/word/upload`, {
    method: "POST",
    body: formData,
  });
};
export const login = async (params: Login["params"]): Promise<Login["res"]> => {
  return request("/login", {
    method: "POST",
    body: params,
  });
};
export async function baiduDetectLang(text: string) {
  const urlSearchParam = new URLSearchParams({query: text});
  const json = await sendBackgroundFetch({
    url: `https://fanyi.baidu.com/langdetect?${urlSearchParam}`,
    method: 'POST',
    responseType: "json",
  });
  
    // return langMap[json.lan] || "en";
    return json.lan ?? 'en'
}
export async function uploadMultiBase64(arr: string[]) {  
  const urls:string[] = await Promise.all(
    arr.map(async (base64) => {
      if (base64.startsWith("http")) {
        return base64;
      } else {
        const blob = await base64ToBlob(base64);
        const key = (await upload(blob)).key;
        return "https://r2.mywords.cc/" + key
      }
    }),
  );
  return urls;
}
export const getMyAllRemarkList = async (): Promise<{ list: CommunityItemType[] } | undefined> => {
  return request(`/community/allRemarkList`, {
    method: "GET",
  });
};
export const addCommunity = async (param: CommunityItemType) => {
  return request("/community/add", {
    method: "POST",
    body: param,
  });
};
export const deleteCommunity = async (param:{id: string}) => {
  return request("/community/delete", {
    method: "POST",
    body: param,
  });
};
export const editItemContent = async (param: {id:string,content:string,imgs:string[], lastEditDate:number}) => {
  return request("/community/itemEditContent", {
    method: "POST",
    body: param,
  });
};
/**
 * API 聚合：统一导出各引擎与服务的请求方法
 * - 提供给上层按需选择引擎与能力
 */
