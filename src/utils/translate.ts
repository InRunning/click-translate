import googleTranslate from "@/api/google";
import deepLXTranslate from "@/api/deeplx";
import { getSetting } from "@/storage/sync";
import { defaultSetting, getSentenceSystemPrompt, getSentenceUserContent } from "./const";
import { formateText } from ".";
import { EngineValue } from "@/types";
import { getChat } from "@/api/chat";
import type { ChatConstructor } from "@/api/openAI";
import type { Message } from "@/types/chat";
import type { Chat } from "@/types/chat";

const getPreMessages = ({
  text,
  targetLang,
  sentenceSystemPrompt,
  sentenceUserContent,
}: {
  text: string;
  sentenceSystemPrompt: string;
  sentenceUserContent: string;
  targetLang: string;
  engine: EngineValue;
}): Message[] => {
  const rolePrompt = sentenceSystemPrompt
    // 兼容占位符两侧可能包含空格的写法：{ targetLanguage } / {sentence}
    .replace(/\{\s*targetLanguage\s*\}/g, () => targetLang)
    .replace(/\{\s*sentence\s*\}/g, () => text);
  const contentPrompt = sentenceUserContent
    .replace(/\{\s*targetLanguage\s*\}/g, () => targetLang)
    .replace(/\{\s*sentence\s*\}/g, () => text);

  return [
    {
      role: "system",
      content: rolePrompt,
    },
    {
      role: "assistant",
      content: "OK.",
    },
    {
      role: "user",
      content: contentPrompt,
    },
  ];
};
export default async function ({
  beforeRequest,
  onGenerating,
  onSuccess,
  onError,
  originText,
  engine,
}: {
  beforeRequest: () => void;
  onGenerating?: (result: string) => void;
  onSuccess: (result: string, messageList?: Message[]) => void;
  onError: (msg: string) => void;
  originText: string;
  engine: EngineValue;
}) {  
  const text = formateText(originText);
  const setting = await getSetting();
  const targetLang = setting.targetLanguage ?? defaultSetting.targetLanguage;
  beforeRequest();

  try {
    switch (engine) {
      case "deeplx":
        {
          const result = await deepLXTranslate({
            text,
          });
          onSuccess(result!);
        }
        break;
      case "google":
        {
          const googleResult = await googleTranslate({
            text,
            targetLang,
          });
          onSuccess(googleResult);
        }
        break;
      default:
        {
          const chatClass = getChat(engine);
          if (!chatClass) {
            throw "engine doesn't exist";
          }
          const sentenceSystemPrompt =
            setting.sentenceSystemPrompt ?? getSentenceSystemPrompt();
          const sentenceUserContent =
            setting.sentenceUserContent ?? getSentenceUserContent();
          let chatInstance: Chat | null = null;

          const chatOptions: ChatConstructor = {
            preMessageList: getPreMessages({
              text,
              engine,
              targetLang,
              sentenceSystemPrompt,
              sentenceUserContent,
            }),
            onComplete(result) {
              onSuccess(result, chatInstance?.messageList);
            },
            onGenerating,
            onError,
          };
          chatInstance = new chatClass(chatOptions);
          chatInstance.sendMessage();
        }
        break;
    }
  } catch (error) {
    onError(error as string);
  }
}
/**
 * 翻译工具：封装与多引擎的统一交互入口
 * - 负责根据引擎路由到对应实现
 * - 处理目标/源语言与基础容错
 */
