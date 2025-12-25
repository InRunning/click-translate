/**
 * 提示词模板生成器
 * 
 * 用于生成翻译和语言学习所需的提示词模板
 * 支持两种模式：
 * 1. 单词翻译模式 - 详细的单词分析，包含音标、词性、例句等
 * 2. 句子翻译模式 - 简洁的句子翻译，追求自然流畅
 */

import { codeBlock, oneLineTrim } from "common-tags"
import { isSameWord } from ".";

/**
 * 生成单词翻译的提示词模板
 * 
 * 根据单词和上下文生成相应的AI提示词
 * 支持两种场景：
 * - 仅单词：提供全面的单词分析（音标、词性、含义、例句等）
 * - 单词+句子：提供单词在特定句子中的含义和用法
 * 
 * @param word 要翻译的单词
 * @param context 可选的上下文句子，用于提供单词在具体语境中的含义
 * @param targetLanguage 目标语言（通常是中文）
 * @returns 包含rolePrompt、commandPrompt、contentPrompt的对象
 */
export const getWordPrompt = ({word,context,targetLanguage}:{word:string,context?:string,targetLanguage:string}) => {
  /**
   * 角色提示词 - 定义AI的角色和任务
   * 
   * 指定AI作为翻译引擎，并详细描述了输出格式要求：
   * - 单词原始形态和语种
   * - 音标或转写
   * - 所有含义（包含词性）
   * - 双语示例（至少三句）
   */
  const rolePrompt = codeBlock`
      ${oneLineTrim`
      你是一个专业的翻译引擎，翻译目标语言为${targetLanguage}，只需要翻译不需要额外解释。
      
      当只给出一个单词时，你需要提供：
      - 单词的原始形态（如果有变形）
      - 单词的语种信息
      - 对应的音标或转写
      - 所有含义（包含词性标注）
      - 双语示例，至少三条例句说明用法`}

      ${oneLineTrim`当给出句子和句子中的某个单词或词组时，你需要提供：
      - 单词的原始形态（如果有变形）
      - 单词的语种信息
      - 对应的音标或转写
      - 单词在给定句子中的具体含义（包含词性）
      - 使用该含义的三条双语例句
      
      请严格按照以下格式提供翻译结果：`}
          <单词>
          [<语种>]· / <音标> /
          [<词性缩写>] <中文含义>]（如果提供了句子，解释单词在句子中的含义）
          [<句子的含义>]（如果提供了句子）
          例句：
          <序号><例句>(例句翻译)
          词源：
          <词源信息>
      `
  
  /**
   * 命令确认词 - 用于确认理解了指令
   */
  const commandPrompt = '好的，我明白了，请给我这个单词。';
  
  /**
   * 内容提示词 - 具体的翻译任务描述
   * 
   * 根据是否有上下文来决定使用哪种格式：
   * - 仅单词：直接提供单词信息
   * - 单词+句子：同时提供单词和句子信息
   */
  let contentPrompt = '';
  
  // 判断是否提供了上下文，或者上下文是否与单词相同
  if (!context || isSameWord(word,context)) {
    contentPrompt = `单词是：${word}。`
  } else {
    contentPrompt = `单词是：${word}，句子是：${context}`
  }
 
  return {rolePrompt, commandPrompt, contentPrompt}
}

/**
 * 生成句子翻译的提示词模板
 * 
 * 用于翻译整个句子的场景，追求自然流畅的翻译效果
 * 
 * @param text 要翻译的文本
 * @param targetLanguage 目标语言
 * @returns 包含rolePrompt、commandPrompt、contentPrompt的对象
 */
export const getSentencePrompt = (text:string,targetLanguage:string) => {
  /**
   * 角色提示词 - 定义翻译风格要求
   * 
   * 特别强调：
   * - 口语化表达
   * - 专业且优雅
   * - 流畅自然
   * - 避免机器翻译的生硬感
   */
  const rolePrompt = `You are a professional translator. Please translate the text into ${targetLanguage} using colloquial, professional, elegant and fluent language, avoiding any machine translation style.`;
  
  /**
   * 命令确认词 - 简洁的确认回复
   */
  const commandPrompt = `OK, I'll translate this text for you.`;
  
  /**
   * 内容提示词 - 具体的翻译任务
   */
  const contentPrompt = `请将以下文本翻译为${targetLanguage}：${text}`;
  
  return {
    rolePrompt,
    commandPrompt,
    contentPrompt
  }
}

/**
 * 提示词模板系统
 * 
 * 功能特点：
 * - 统一管理翻译提示词格式
 * - 支持多场景提示词生成（单词翻译 vs 句子翻译）
 * - 便于在不同AI引擎间复用和调整
 * - 自动格式化输出，确保返回结果的一致性
 * 
 * 使用场景：
 * - OpenAI API调用
 * - 其他AI翻译服务调用
 * - 统一的翻译结果格式处理
 */