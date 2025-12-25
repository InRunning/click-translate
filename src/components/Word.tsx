import YoudaoSpeaker from "./Speaker";
import Highlight from "./Highlight";
import useYoudao from "./useYoudao";
import { useTranslation } from "react-i18next";
import { defaultSetting } from "@/utils/const";
import CardFooter from "./CardFooter";
import { EngineValue } from "@/types";
import ContentMore from "./ContentMore";
import useOldYoudao from "./useOldYoudao";
import { useAtom } from "jotai";
import { settingAtom } from "@/store";
import WordChat from "./WordChat";
function RenderYoudaoWord({ searchText }: { searchText: string }) {
 const {t} = useTranslation();
  const [setting] = useAtom(settingAtom);
  const sourceLang =
    setting.sourceLanguage?.language ?? defaultSetting.sourceLanguage.language;
  const { loading, wordData } = useYoudao(searchText, sourceLang);

  const wordAutoPlay = setting.autoPronounce ?? defaultSetting.autoPronounce;

  return (
    <>
      {loading  && (
        <div className="flex flex-col gap-2 w-full">
          <div className="skeleton h-4 w-28"></div>
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-full"></div>
        </div>
      )}
      {wordData && (
        <>
          <div className="flex flex-wrap">
            {wordData.phonetic.map((item, index) => {
              return (
                <div
                  key={index}
                  className={`${
                    index === 0 ? "mr-2" : ""
                  } flex items-center space-x-1`}
                >
                  <span key={index}>
                    {/* {index === 0 ? "英" : "美"} */}
                    {item}
                  </span>
                  <div className="translate-y-[4px]">
                    <YoudaoSpeaker
                      lang={sourceLang}
                      autoPlay={(index === 1 && wordAutoPlay)}
                      text={searchText}
                      type={index + 1 + ""}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div>
            <ul className="flex flex-col gap-y-1">
              {wordData.explains.map((item, index) => {
                return (
                  <li key={index}>
                    {item.pos ? <span>{item.pos}</span> : null}
                    <span>{item.trans}</span>
                  </li>
                );
              })}
              {wordData.explains.length === 0 && !loading && (
                <>
                  <div className="text-xs flex items-center  justify-center space-x-1 text-center text-gray-500">
                    <span>{t("The word is not included")}</span>,
                    <span>{t("Check Language Set")}</span>
                  </div>
                </>
              )}
            </ul>
            <div className="mt-1">
              {wordData.examTags?.map((item, index) => (
                <span
                  className={`badge badge-ghost badge-sm  opacity-100`}
                  key={index}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
function RenderCollinsWord({ searchText }: { searchText: string }) {
  const [setting] = useAtom(settingAtom);

  const sourceLang =
    setting.sourceLanguage?.language ?? defaultSetting.sourceLanguage.language;
  const { loading, wordData } = useYoudao(searchText, sourceLang);
  const { loading: collinsLoading, wordData: collins } = useOldYoudao(
    searchText,
    sourceLang
  );

  const wordAutoPlay = setting.autoPronounce ?? defaultSetting.autoPronounce;

  return (
    <>
      {(loading || collinsLoading) && (
        <div className="flex flex-col gap-2 w-full">
          <div className="skeleton h-4 w-28"></div>
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-full"></div>
        </div>
      )}
      {wordData && (
        <>
          <div className="flex flex-wrap">
            {wordData.phonetic.map((item, index) => {
              return (
                <div
                  key={index}
                  className={`${
                    index === 0 ? "mr-2" : ""
                  } flex items-center space-x-1`}
                >
                  <span key={index}>
                    {/* {index === 0 ? "英" : "美"} */}
                    {item}
                  </span>
                  <div className="translate-y-[4px]">
                    <YoudaoSpeaker
                      lang={sourceLang}
                      autoPlay={
                        (index === 1 && wordAutoPlay)
                      }
                      text={searchText}
                      type={index + 1 + ""}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="my-1 -ml-1">
            {wordData.examTags?.map((item, index) => (
              <span
                className={`badge badge-ghost badge-sm opacity-100`}
                key={index}
              >
                {item}
              </span>
            ))}
          </div>
          {!collinsLoading &&
            collins.length === 0 &&
            wordData.explains.map((item, index) => {
              return (
                <div key={index}>
                  {item.pos ? <span>{item.pos}</span> : null}
                  <span>{item.trans}</span>
                </div>
              );
            })}
         
        </>
      )}
      {collins && (
        <div>
          <ContentMore lines={10}>
            {collins.map((item, idx) => (
              <ul key={idx} className="list-decimal list-inside space-y-2">
                {item.explanations.map((subItem, index) => (
                  <li key={index}>
                    <span>{subItem.explanation}</span>
                    <div className="mt-1 opacity-80">
                      {subItem.examples.slice(0, 2).map((_example) => (
                        <div key={_example}>
                          <Highlight
                            key={_example}
                            highlightClassName="font-bold"
                            context={_example ?? ""}
                            wordString={JSON.stringify([searchText])}
                          />
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            ))}
          </ContentMore>
        </div>
      )}
    </>
  );
}

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
  const wordSystemPrompt =
    setting.wordSystemPrompt ?? defaultSetting.wordSystemPrompt;
  const wordUserContent =
    setting.wordUserContent ?? defaultSetting.wordUserContent;
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
            {currentEngine !== "youdao" && currentEngine !== "collins" && (
              <YoudaoSpeaker
                className="ml-[7px] mt-[2px]"
                autoPlay={wordAutoPlay}
                text={searchText}
                lang={sourceLang}
                type={"2"}
              />
            )}
            <div className="ml-5 flex items-center space-x-1 mt-[2px]"></div>
          </div>
          {currentEngine === "collins" && (
            <RenderCollinsWord
              searchText={searchText}
            />
          )}
            {currentEngine === "youdao" && (
            <>
              <RenderYoudaoWord searchText={searchText} />
            </>
          )}
          {currentEngine !== "youdao" && currentEngine !== "collins" && (
            <div className="mt-2">
              <WordChat
                currentEngine={currentEngine}
                targetLang={targetLang}
                wordSystemPrompt={wordSystemPrompt}
                wordUserContent={wordUserContent}
              />
            </div>
          )}
          <CardFooter
            currentEngine={currentEngine}
            sourceLang={sourceLang}
            targetLang={targetLang}
            onRefresh={onRefresh}
            searchText={searchText}
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
