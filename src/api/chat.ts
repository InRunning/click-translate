/**
 * 聊天引擎选择器 (Chat Engine Router)
 *
 * 功能说明：
 * - 根据传入的引擎类型返回对应的聊天实例
 * - 提供统一的引擎切换机制
 * - 支持多种AI聊天服务（OpenAI、Gemini、文心一言等）
 */

// 导入各种聊天引擎的类实现
import OpenAIClass from "@/api/openAI";
import DeepSeekClass from "@/api/deepSeek";
import GeminiClass from "@/api/gemini";
import WenxinClass from "@/api/wenxin";
// 导入引擎类型定义
import type { EngineValue } from "@/types";
// 导入月之暗面（月光宝盒）聊天引擎
import MoonShotClass from "./moonShot";
// 导入自定义AI聊天引擎
import CustomAIClass from "./customAI";

/**
 * 获取指定引擎的聊天实例
 * @param engine - 引擎类型（openai、gemini、wenxin等）
 * @returns 对应的聊天引擎类实例
 */
export const getChat = (engine:EngineValue) => {
  switch (engine) {
    case 'openai':      // OpenAI GPT系列
      return  OpenAIClass
    case "gemini":      // Google Gemini
      return  GeminiClass
    case "wenxin":      // 百度文心一言
      return  WenxinClass
    case "moonshot":    // 月之暗面（月光宝盒）
      return  MoonShotClass
    case "deepseek":    // DeepSeek AI
      return  DeepSeekClass
    case "custom":      // 自定义AI服务
      return  CustomAIClass
  }
}