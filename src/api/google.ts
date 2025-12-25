/**
 * Google翻译API封装 (Google Translate API Wrapper)
 *
 * 功能说明：
 * - 提供Google Translate API的统一封装
 * - 自动语言检测和翻译
 * - 处理翻译结果的格式化输出
 * - 实现错误处理和重试机制
 */

import { sendBackgroundFetch } from "@/utils";

// Google翻译结果的数据类型定义
type GoogleTranslateResult  = (string|unknown)[]

/**
 * Google翻译函数
 * @param text - 要翻译的文本
 * @param targetLang - 目标语言代码
 * @returns 翻译后的文本
 */
export default async function  googleTranslate({text,targetLang}:{text: string, targetLang:string}) {
  try {
    // 构建Google翻译API请求URL
    // client=gtx: 使用Google Translate的官方客户端
    // sl=auto: 自动检测源语言
    // tl=targetLang: 目标语言
    // dt=t: 返回翻译结果
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    
    // 发送API请求，获取JSON格式的响应
    const data:GoogleTranslateResult | {error:string} = await sendBackgroundFetch({
      url,
      responseType: 'json'
    });
    
    // 处理API错误响应
    if ('error' in data) {
      throw(data.error)
    }
    
    let result = '';
    // 解析Google翻译的嵌套JSON结构
    // Google翻译返回的是一个复杂的嵌套数组结构
    for(const  item0 of data) {
      if (item0 instanceof Array) {
        for (const item1 of item0) {
          if (item1 instanceof Array) {
            // 提取翻译文本（通常在嵌套数组的第二个位置）
            result += item1[0]
          }
        }
      }
      // 如果遇到null，表示翻译完成
      if (item0 === null) {
        return result
      }
    }
    return result
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      throw(error.message)
    } else {
      throw('failed fetch')
    }
  }
}
