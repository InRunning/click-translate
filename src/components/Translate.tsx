import { useEffect, useState, useRef } from "react";
// 精简：移除收藏、备注、会话等与背单词/登录相关的交互
// import { CheckCheck, Heart, Undo2, MessageCircle, Pencil } from "lucide-react";
// import type { CommunityItemType, Sww } from "@/types/words";
import InputBlink from "./InputBlink";
import { Message } from "@/types/chat";
import { useErrorBoundary } from "react-error-boundary";
import { defaultSetting } from "@/utils/const";
import { useTranslation } from "react-i18next";
//import { useConversationContext } from "@/context/conversation";
import YoudaoSpeaker from "./Speaker";
import translate from "@/utils/translate";
import { EngineValue } from "@/types";
import CardFooter from "./CardFooter";
import { useAtom } from "jotai";
import { settingAtom } from "@/store";
// import RenderRemark from "./RenderRemark";
export default function Translate({
  searchText,
  currentEngine,
  onRefresh,
}: {
  searchText: string;
  currentEngine: EngineValue;
  onRefresh: () => void;
}) {
  const { t } = useTranslation();
  // const { setConversationShow, setMessageList, setConversationEngine } =
  //   useConversationContext();
  const [setting] = useAtom(settingAtom);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [translateResult, setTranslateResult] = useState("");
  const messageListRef = useRef<Message[]>([]);
  const { showBoundary } = useErrorBoundary();
  const sourceLang =
    setting.sourceLanguage?.language ?? defaultSetting.sourceLanguage.language;
  const targetLang = setting.targetLanguage ?? defaultSetting.targetLanguage;

  // 已移除会话入口
  useEffect(() => {
    let ignore = false;
    translate({
      originText: searchText,
      engine: currentEngine,
      beforeRequest() {
        setLoading(true);
      },
      onError(msg) {
        setLoading(false);
        setGenerating(false);
        showBoundary(msg);
      },
      onGenerating(result) {
        if (ignore) {
          return;
        }
        setLoading(false);
        setGenerating(true);
        setTranslateResult(result);
      },
      onSuccess(result, messageList) {
        if (ignore) {
          return;
        }
        setLoading(false);
        setGenerating(false);
        setTranslateResult(result);
        if (messageList) {
          messageListRef.current = messageList;
        }
      },
    });
    return () => {
      ignore = true;
    };
  }, [searchText, currentEngine, showBoundary]);
  let result;
  if (loading) {
    return (
      <div className="flex flex-col gap-2 w-full p-2">
        <div className="skeleton h-4 w-28"></div>
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-full"></div>
      </div>
    );
  }
  try {
    result = (
      <div className="relative space-y-2 text-[15px] px-2 pb-3 pt-3">
        <div>
          <span>{translateResult}</span>
          {generating && <InputBlink />}
          <span className="align-bottom inline-flex items-center ml-[6px] gap-1">
            <YoudaoSpeaker
              className="mt-[1px]"
              lang={sourceLang}
              autoPlay={false}
              text={searchText}
              type={"2"}
            />
          </span>
        </div>
        <CardFooter
          currentEngine={currentEngine}
          sourceLang={sourceLang}
          targetLang={targetLang}
          onRefresh={onRefresh}
          searchText={searchText}
        />
      </div>
    );
  } catch (error) {
    result = (
      <div className="text-center py-[20px] text-[13px] text-red-600">
        {t("An error occurred")}
      </div>
    );
  }
  return (
    <>
      <div>{result}</div>
    </>
  );
}
/**
 * 翻译结果展示：根据引擎与文本展示翻译内容
 * - 支持句子/段落，处理空结果/错误态
 * 关键流程：
 * 1) 触发查询 -> loading 态
 * 2) 拉取结果（可能为流式）-> 逐步更新显示
 * 3) 错误/超时 -> 兜底提示
 */
