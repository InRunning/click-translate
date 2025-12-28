import YoudaoSpeaker from "./Speaker";
import { useTranslation } from "react-i18next";
import { defaultSetting } from "@/utils/const";
import CardFooter from "./CardFooter";
import { EngineValue } from "@/types";
import { useAtom } from "jotai";
import { settingAtom } from "@/store";
import WordChat from "./WordChat";

export default function RenderWord({
  searchText,
  currentEngine,
  onRefresh,
}: {
  searchText: string;
  currentEngine: EngineValue;
  onRefresh: () => void;
}) {
  const { t } = useTranslation();
  const [setting] = useAtom(settingAtom);
  const wordAutoPlay = setting.autoPronounce ?? defaultSetting.autoPronounce;
  const sourceLang =
    setting.sourceLanguage?.language ?? defaultSetting.sourceLanguage.language;
  // 直接使用 t() 函数获取当前语言的提示词
  const wordSystemPrompt =
    setting.wordSystemPrompt ?? t('Word System Prompt');
  const wordUserContent =
    setting.wordUserContent ?? t('Word User Content');
  const targetLang = setting.targetLanguage ?? defaultSetting.targetLanguage;
  
  // 已移除会话入口
  let result;
  try {
    if (!searchText) {
      result = null;
    } else {
      result = (
        <div className="relative py-1 px-2">
          <div className="flex items-center  mb-1">
            <div className="font-bold text-lg">{searchText}</div>
            <YoudaoSpeaker
              className="ml-[7px] mt-[2px]"
              autoPlay={wordAutoPlay}
              text={searchText}
              lang={sourceLang}
              type={"2"}
            />
            <div className="ml-5 flex items-center space-x-1 mt-[2px]"></div>
          </div>
          <div className="mt-2">
            <WordChat
              currentEngine={currentEngine}
              targetLang={targetLang}
              wordSystemPrompt={wordSystemPrompt}
              wordUserContent={wordUserContent}
            />
          </div>
          <CardFooter
            currentEngine={currentEngine}
            onRefresh={onRefresh}
          />
        </div>
      );
    }
  } catch (error) {
    console.log(error);
    
    result = (
      <div className="text-center py-[20px] text-[13px] text-red-600">
        {t("An error occurred")}
      </div>
    );
  }
  return <div>{result}</div>;
}
/**
 * 单词卡片：聚合音标、释义、例句与收藏操作
 * @param word - 当前查询单词
 * 设计备注：
 * - 当存在收藏状态时，渲染收藏按钮的已选态；
 * - 切换引擎时保留当前单词上下文，减少重复请求；
 * - 对空/罕见词返回时，显示推荐操作或外链引导。
 */
