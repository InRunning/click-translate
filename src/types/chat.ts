export interface Message {
  role: 'user' | 'assistant' | 'system',
  content: string,
  isError?: boolean
}
export interface OpenAIRecordItem {
  conversationId: string,
  messageList: Message[],
  lastMessageId?: string
}
export interface  Chat {
  messageList: Message[]
  sendMessage: (content?:string)=>void
  abort: ()=>void
  clearMessage: ()=>void
  refresh: ()=>void
  resume?: (params: OpenAIRecordItem) => void
}
/**
 * 聊天消息类型：role/content/时间戳等
 * - 兼容多家大模型消息结构
 */
