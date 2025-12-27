/**
 * 词汇 AI 对话组件（用于单词释义）
 * - 使用聊天类（OpenAI / DeepSeek / Custom 等）生成单词解释
 * - 基于当前选中的单词与句子构造提示词
 * - 仅负责拉取和展示结果，不包含收藏/会话入口
 */
import { useEffect, useState } from "react";
import InputBlink from "./InputBlink";
import { currentSelectionInfo } from "@/utils";
import { EngineValue } from "@/types";
import { getChat } from "@/api/chat";
import type { Chat, Message } from "@/types/chat";
import type { ChatConstructor } from "@/api/openAI";
import { useErrorBoundary } from "react-error-boundary";

interface WordChatProps {
  currentEngine: EngineValue;
  targetLang: string;
  wordSystemPrompt: string;
  wordUserContent: string;
}

/**
 * 基于模板生成预置消息：
 * - {targetLanguage} 目标语言
 * - {word} 当前选中单词
 * - {sentence} 上下文句子
 */
const getPreMessages = ({
  wordSystemPrompt,
  wordUserContent,
  targetLang,
}: {
  wordSystemPrompt: string;
  wordUserContent: string;
  targetLang: string;
}): Message[] => {
  const rolePrompt = wordSystemPrompt
    // 兼容占位符两侧可能包含空格：{ targetLanguage }、{ word }、{ sentence }
    .replace(/\{\s*targetLanguage\s*\}/g, () => targetLang)
    .replace(/\{\s*word\s*\}/g, () => currentSelectionInfo.word)
    .replace(/\{\s*sentence\s*\}/g, () => currentSelectionInfo.context);

  const contentPrompt = wordUserContent
    .replace(/\{\s*targetLanguage\s*\}/g, () => targetLang)
    .replace(/\{\s*word\s*\}/g, () => currentSelectionInfo.word)
    .replace(/\{\s*sentence\s*\}/g, () => currentSelectionInfo.context);

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

export default function WordChat({
  currentEngine,
  targetLang,
  wordSystemPrompt,
  wordUserContent,
}: WordChatProps) {
  const { showBoundary } = useErrorBoundary();
  const [lines, setLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [translateResult, setTranslateResult] = useState("");
  const [chatInstance, setChatInstance] = useState<Chat | null>(null);

  useEffect(() => {
    setLines(translateResult.split("\n"));
  }, [translateResult]);

  useEffect(() => {
    const preMessages = getPreMessages({
      targetLang,
      wordSystemPrompt,
      wordUserContent,
    });

    const chatClass = getChat(currentEngine);
    if (!chatClass) {
      return;
    }

    const chatOptions: ChatConstructor = {
      preMessageList: preMessages,
      onBeforeRequest: () => {
        setLoading(true);
      },
      onComplete: () => {
        setGenerating(false);
        setLoading(false);
      },
      onGenerating(result) {
        setGenerating(true);
        setLoading(false);
        setTranslateResult(result);
      },
      onError(err) {
        setGenerating(false);
        setLoading(false);
        showBoundary(err);
      },
    };

    const instance = new chatClass(chatOptions);
    setChatInstance(instance);
  }, [currentEngine, targetLang, wordSystemPrompt, wordUserContent, showBoundary]);

  useEffect(() => {
    if (!chatInstance) {
      return;
    }
    chatInstance.sendMessage();
    // 不需要在依赖变更时重复触发
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatInstance]);

  if (loading) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="skeleton h-4 w-28"></div>
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-full"></div>
      </div>
    );
  }

  return (
    <div>
      {lines.map((line, index) => (
        <p className="flex items-center" key={index}>
          {line}
          {generating && index === lines.length - 1 && <InputBlink />}
        </p>
      ))}
    </div>
  );
}
