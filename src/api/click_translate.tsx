/**
 * Click-Translate 官方翻译引擎
 * 
 * 直接使用 API 提供翻译功能
 * 配置从 backend/local.yaml 读取，不暴露给用户
 */

import { toastManager } from '@/components/Toast'
import type { Chat, Message } from '@/types/chat'
import { handleStream } from '@/utils'

/**
 * 聊天构造函数接口定义
 */
export interface ChatConstructor {
  onError?: (err: string) => void
  onGenerating?: (text: string) => void
  onBeforeRequest?: () => void
  onComplete: (text: string) => void
  onClear?: () => void
  preMessageList?: Message[]
}

/**
 * Click-Translate 官方翻译类
 * 实现了 Chat 接口，通过 API 直接提供翻译功能
 */
export default class ClickTranslateClass implements Chat {
  controller: AbortController
  messageList: Message[]
  onError?: (err: string) => void
  onBeforeRequest?: () => void
  onGenerating?: (text: string) => void
  onComplete: (text: string) => void
  onClear?: () => void
  
  // API 配置 (来自 backend/local.yaml)
  private readonly relayUrl: string = 'https://api.modelarts-maas.com/v1/chat/completions'
  private readonly apiKey: string = 'woDy9QmLRyOeXZPW050wAWGYon-WsF7w94vUgKZ1K46796m3gf0Qme2asu16UXY3Fb_0ocBnHbX5WfJuYo5-AQ'
  private readonly model: string = 'DeepSeek-V3'
  private readonly temperature: number = 0
  
  constructor({
    onError,
    onGenerating,
    onBeforeRequest,
    onComplete,
    onClear,
    preMessageList,
  }: ChatConstructor) {
    this.controller = new AbortController()
    this.messageList = preMessageList ? preMessageList : []
    this.onBeforeRequest = onBeforeRequest
    this.onError = onError
    this.onGenerating = onGenerating
    this.onComplete = onComplete
    this.onClear = onClear
  }
  
  /**
   * 发送消息到 API
   * @param content 要发送的用户消息内容，可选
   */
  async sendMessage(content?: string) {
    try {
      this.onBeforeRequest && await this.onBeforeRequest()
      
      if (this.controller.signal.aborted) {
        this.controller = new AbortController()
      }
      
      let result = '';
      
      // 追加用户消息到历史记录
      content && this.messageList.push({role: 'user', content});
      // 添加空的助手消息用于接收流式响应
      this.messageList.push({role: 'assistant', content: ''})
      
      // 构造请求参数
      const requestBody = {
        messages: this.messageList.slice(0, -1),
        model: this.model,
        temperature: this.temperature,
        stream: true,
      }
      
      // 发送POST请求
      const res = await fetch(this.relayUrl, {
        method: 'POST',
        signal: this.controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      })
      
      // 检查响应状态
      if (!res.ok || !res.body) {
        const text = await res.text()
        try {
          const json = JSON.parse(text)
          if (json.detail) {
            toastManager.add({ type: 'error', msg: json.detail })
          }
          this.onError && this.onError(json)
        } catch {
          toastManager.add({ type: 'error', msg: text })
          this.onError && this.onError(text)
        }
        return
      }
      
      // 处理流式响应
      const reader = res.body.getReader();
      handleStream(reader, (data)=> {
        if (data !== '[DONE]') {
          const json = JSON.parse(data)
          
          // 处理API返回的错误
          if (json.error) {
            toastManager.add({ type: 'error', msg: json.error.message || json.error })
            this.onError && this.onError(json.error)
            return
          }            
          
          // 提取文本内容（流式响应中delta字段包含增量文本）
          const text = json.choices[0].delta.content || '';
          result += text;
          
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
      const errorMsg = '网络请求失败，请检查网络连接'
      toastManager.add({ type: 'error', msg: errorMsg })
      this.onError && this.onError(errorMsg)
    }
  }
  
  /**
   * 清空消息历史
   * 用户关闭卡片时中止当前请求并清空对话上下文
   */
  clearMessage() {
    this.controller.abort('卡片已隐藏')
    this.messageList = []
    this.onClear && this.onClear()
  }
  
  /**
   * 刷新/重试
   * 移除占位的最后一条assistant消息，保持上下文重新发送
   */
  refresh() {
    this.messageList = this.messageList.slice(0, -1);
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