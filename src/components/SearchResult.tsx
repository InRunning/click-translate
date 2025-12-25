/**
 * 搜索结果面板（精简版）
 * - 仅保留“划词翻译 + 引擎切换 + 展示结果”
 * - 已移除：收藏/备注/登录/生词同步等
 */
import { useEffect, useRef, useState } from "react";
import type { EngineValue } from "@/types";
import { isWord } from "@/utils";
import { allSentenceEngineList, allWordEngineList } from "@/utils/const";
import EngineDropdown from "./EngineDropdown";
import { ErrorBoundary } from "react-error-boundary";
import FallbackComponent from "./FallbackComponent";
import { useAtom } from "jotai";
import { settingAtom } from "@/store";
import Translate from "./Translate";
import Word from "./Word";

export default function TranslateContent({ searchText }: { searchText: string }) {
  const [setting] = useAtom(settingAtom);
  const [currentEngine, setCurrentEngine] = useState<EngineValue | null>(null);
  const [translateV, setTranslateV] = useState(0);
  const [wordV, setWordV] = useState(0);
  const divRef = useRef<HTMLDivElement | null>(null);
  const fallbackComRef = useRef<React.ComponentRef<typeof FallbackComponent>>(null);

  useEffect(() => {
    const isWordResult = isWord({
      input: searchText,
      lang: setting.sourceLanguage?.language,
    });
    if (isWordResult) {
      const list = setting.wordEngineList ?? allWordEngineList;
      if (list && list instanceof Array && list.length) {
        setCurrentEngine(list.filter((item) => item.checked)[0].value);
      } else {
        setCurrentEngine(allWordEngineList[0].value);
      }
    } else {
      const list = setting.sentenceEngineList ?? allSentenceEngineList;
      if (list && list instanceof Array && list.length) {
        setCurrentEngine(list.filter((item) => item.checked)[0].value);
      } else {
        setCurrentEngine(allSentenceEngineList[0].value);
      }
    }
  }, [
    searchText,
    setting.wordEngineList,
    setting.sentenceEngineList,
    setting.sourceLanguage?.language,
  ]);

  useEffect(() => {
    fallbackComRef.current?.hideError();
  }, [currentEngine]);

  const onRefresh = (type: "translate" | "word") => {
    if (type === "translate") {
      setTranslateV((pre) => ++pre);
    } else {
      setWordV((pre) => ++pre);
    }
  };

  const isWordResult = isWord({
    input: searchText,
    lang: setting.sourceLanguage?.language,
  });
  if (!currentEngine) return null;

  return (
    <div ref={divRef} className="max-h-[70vh] overflow-scroll">
      <EngineDropdown
        isWord={isWordResult}
        currentEngine={currentEngine}
        onChange={(engine) => setCurrentEngine(engine)}
        className={`absolute right-16 text-[13px] top-[5px] z-10`}
      />

      <ErrorBoundary
        FallbackComponent={(fallbackProps) => (
          <FallbackComponent ref={fallbackComRef} fallbackProps={fallbackProps} />
        )}
      >
        {isWordResult ? (
          <Word
            searchText={searchText}
            currentEngine={currentEngine}
            onRefresh={() => onRefresh("word")}
            key={wordV}
          />
        ) : (
          <Translate
            currentEngine={currentEngine}
            searchText={searchText}
            onRefresh={() => onRefresh("translate")}
            key={translateV}
          />
        )}
      </ErrorBoundary>
    </div>
  );
}
