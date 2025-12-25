/**
 * OpenAI Chat Completions API封装
 * 
 * 提供与OpenAI API交互的功能，支持：
 * - 流式响应处理
 * - 对话上下文管理  
 * - 请求控制和取消
 * - 错误处理和重试机制
 * - 自定义配置支持（API地址、模型、密钥等）
 */

import { defaultSetting } from '@/utils/const'
import { getSetting } from '@/storage/sync'
import { toastManager } from '@/components/Toast'
import type { Chat, Message } from '@/types/chat'
import { handleStream } from '@/utils'
import { Setting } from '@/types'
//import { addOpenAIRecords } from '@/utils/storage'

/**
 * 聊天构造函数接口定义
 * 定义了聊天类的基本回调函数和可选参数
 */
export interface ChatConstructor {
  onError?: (err: string) => void           // 错误回调函数
  onGenerating?: (text: string) => void     // 流式生成回调，接收增量文本
  onBeforeRequest?: () => void              // 请求前回调，用于设置loading状态
  onComplete: (text: string) => void        // 完成回调，接收完整响应
  onClear?: () => void                      // 清空回调
  preMessageList?: Message[]                // 预置的消息列表
}

/**
 * OpenAI构造函数接口，扩展了基础聊天接口
 * 添加了OpenAI特有的配置参数
 */
export interface OpenAIConstructor extends ChatConstructor{
  settingConfig?:Pick<Setting, 'openAIAddress'|'openAIKey'|'openAIModel'>  // 可选的OpenAI配置
}

/**
 * OpenAI聊天类
 * 实现了Chat接口，提供OpenAI API的具体实现
 */
export default class OpenAIClass implements Chat {
  // 控制器用于管理请求的中止和取消
  controller: AbortController
  // 存储对话历史的消息列表
  messageList: Message[]
  // 回调函数定义
  onError?: (err: string) => void
  onBeforeRequest?: () => void
  onGenerating?: (text: string) => void
  onComplete: (text: string) => void
  onClear?: () => void
  // OpenAI特定配置
  settingConfig?:Pick<Setting, 'openAIAddress'|'openAIKey'|'openAIModel'>
  
  /**
   * 构造函数
   * @param options 配置选项，包含所有回调函数和可选参数
   */
  constructor({
    onError,
    onGenerating,
    onBeforeRequest,
    onComplete,
    onClear,
    preMessageList,
    settingConfig
  }: OpenAIConstructor) {
    // 为每个实例初始化一个可复用的 AbortController，用于控制请求取消
    this.controller = new AbortController()
    // 初始化消息列表，如果有预置消息则使用，否则为空数组
    this.messageList = preMessageList ? preMessageList : []
    // 设置回调函数
    this.onBeforeRequest = onBeforeRequest
    this.onError = onError
    this.onGenerating = onGenerating
    this.onComplete = onComplete
    this.onClear = onClear
    // 设置OpenAI配置
    this.settingConfig = settingConfig
  }
  
  /**
   * 发送消息到OpenAI API
   * @param content 要发送的用户消息内容，可选
   */
  async sendMessage(content?:string) {
    try {
      // 执行请求前回调：用于设置loading状态或清空旧结果
      this.onBeforeRequest && await this.onBeforeRequest()
      
      // 检查请求是否已被中止，如果是则重建控制器
      if (this.controller.signal.aborted) {
        this.controller = new AbortController()
      }
      
      // 获取用户设置，优先级：settingConfig > 用户设置 > 默认设置
      const setting = await getSetting()
      const url =  this.settingConfig?.openAIAddress ?? setting.openAIAddress ?? defaultSetting.openAIAddress
      const model = this.settingConfig?.openAIModel ?? setting.openAIModel?? defaultSetting.openAIModel
      const apiKey = this.settingConfig?.openAIKey ?? setting.openAIKey
      
      // 验证API密钥是否存在
      if (!apiKey) {
        this.onError && this.onError('API密钥为空，请检查配置')
        return
      }
      
      let result = '';  // 累积的响应文本
      
      // 追加用户消息到历史记录
      content && this.messageList.push({role: 'user', content});
      // 添加空的助手消息用于接收流式响应
      this.messageList.push({role: 'assistant', content: ''})
      
      // 构造请求参数
      const requestBody = {
        model,                    // 使用的模型
        messages: this.messageList.slice(0, -1), // 发送所有消息但排除最后的空assistant消息
        stream: true,             // 启用流式响应
      }
      
      // 发送POST请求到OpenAI API
      const res = await fetch(url, {
        method: 'POST',
        signal: this.controller.signal, // 使用AbortController进行请求控制
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`, // API密钥认证
        },
        body: JSON.stringify(requestBody),
      })
      
      // 检查响应状态
      if (!res.ok || !res.body) {
        // 请求失败，尝试解析错误信息
        const json = await res.json()
        if (json.error.message) {
          toastManager.add({ type: 'error', msg: json.error.message })
        }
        this.onError && this.onError(json.error)
        return
      }
      
      // 处理流式响应
      const reader = res.body.getReader();
      handleStream(reader, (data)=> {
        if (data !== '[DONE]') { // '[DONE]'表示流式响应结束
          const json = JSON.parse(data)
          
          // 处理API返回的错误
          if (json.error) {
            toastManager.add({ type: 'error', msg: json.error.message })
            this.onError && this.onError(json.error)
            return
          }            
          
          // 提取文本内容（流式响应中delta字段包含增量文本）
          const text = json.choices[0].delta.content || '';
          result += text; // 累积文本
          
          // 更新最后一条assistant消息，实现增量渲染
          this.messageList = this.messageList.map((message, index) => {
            if (index === this.messageList.length - 1) {
              return {...message, ...{content: message.content + text}}
            } else {
              return message
            }
          })
          
          // 调用流式生成回调，传递增量文本
          this.onGenerating && this.onGenerating(result)
        } else {
          // 收到结束标记，回调完整的响应内容
          this.onComplete(this.messageList[this.messageList.length-1].content)
        }
      })
    } catch (error) {
      // 捕获网络或其他异常
      console.log(error);
      this.onError && this.onError('请求失败，请检查网络连接')
    }
  }
  
  /**
   * 清空消息历史
   * 用户关闭卡片时中止当前请求并清空对话上下文
   */
  clearMessage() {
    // 中止当前请求
    this.controller.abort('卡片已隐藏')
    // 清空消息历史
    this.messageList = []
    // 执行清空回调
    this.onClear && this.onClear()
  }
  
  /**
   * 刷新/重试
   * 移除占位的最后一条assistant消息，保持上下文重新发送
   */
  refresh() {
    // 去掉占位的最后一条assistant消息
    this.messageList = this.messageList.slice(0, -1);
    // 重新发送请求以复用上下文
    this.sendMessage()
  }
  
  /**
   * 主动中止当前请求
   * 用于用户手动停止生成
   */
  abort(){
    this.controller.abort('卡片已隐藏')
  }
}

/**
 * OpenAI Chat Completions API封装类
 * 
 * 核心功能：
 * - 支持流式与非流式响应处理
 * - 自动处理请求中止和取消
 * - 通过messageList管理对话上下文
 * - 支持自定义配置参数覆盖用户设置
 * - 提供完整的错误处理和用户反馈
 * 
 * 使用流程：
 * 1. 构造函数传入回调函数和配置
 * 2. 调用sendMessage发送消息
 * 3. 通过回调函数接收增量响应和最终结果
 * 4. 完成后调用clearMessage清理状态
 */