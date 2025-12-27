/**
 * 类型定义模块 (Type Definitions)
 *
 * 功能说明：
 * - 定义扩展中使用的所有接口和类型
 * - 包含消息传递、用户设置、数据结构等类型定义
 * - 为整个项目提供类型安全保障
 */

// 导入常量定义和类型
import { HighlightName, LangCode, defaultSetting } from "@/utils/const";
// 导入单词相关的类型定义
import type { CommunityItemType, Sww } from "./words";

// 注释掉的旧版本消息类型定义
// export interface ExtensionMessage {
//   type: "fetch" | "auth" | "openOptions" | "captureScreen";
// }
export interface BackgroundFetchParam {
  url: string;
  method?: "GET" | "POST";
  responseType: "text" | "json" | "dataURL";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headers?: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
}
export type ExtensionMessage =
  | {
      type: "fetch";
      payload: BackgroundFetchParam;
    }
  | {
      type: "auth";
    }
  | {
      type: "openOptions";
    }
  | {
      type: "captureScreen";
    }
  | {
      type: "showCardAndPosition";
    }
  | {
      type: "onScreenDataurl";
      payload: string;
    }
  | {
      type: "getCurWindowSelectionInfo"
    }
  | {
    type: never
  }
export type ExternalMessage = {
  type: 'getUser'
}
export interface User {
  picture?: string;
  name?: string;
  email: string;
  id: string;
  token: string;
  emailCode?: number;
  emailTime?: number;
}
export interface ExternalLink {
  id: string;
  name: string;
  link: string;
}
export type InterfaceLanguage = "en" | "zh";
export interface Setting {
  userInfo?: User | null;
  openAIKey?: string;
  openAIAddress?: string;
  openAIModel?: string;
  showSelectionIcon?: boolean;
  engine?: EngineValue;
  geminiKey?: string;
  targetLanguage?: LangCode;
  sourceLanguage?: Language;
  interfaceLanguage?: InterfaceLanguage;
  autoPronounce?: boolean;
  triggerIcon?: string;
  triggerIconSize?: number;
  highlightColor?: string;
  highlightStyle?: HighlightName;
  availableEngines?: EngineItem[]; // old
  wordEngineList?: EngineItem[];
  sentenceEngineList?: EngineItem[];
  wordSystemPrompt?: string;
  wordUserContent?: string;
  sentenceSystemPrompt?: string;
  sentenceUserContent?: string;
  externalLinks?: ExternalLink[];
  screenshotToken?: string;
  deepSeekApiKey?:string;
  deepSeekAddress?:string;
  geminiAddress?:string;
  deepLXAddress?:string;
  customAIAddress?:string;
  customAIModel?:string;
  customAIKey?:string;
  autoSaveWord?:boolean;
  shoutcut?:string
}
export interface Local {
  swwList?: Sww[];
  remarkList?:CommunityItemType[];
  openAIModelList?: { label: string; value: string }[];
  lingoLinkEnhanced_swwList?: Sww[];
  lingoLinkEnhanced_remarkList?: CommunityItemType[];
  lingoLinkEnhanced_openAIModelList?: { label: string; value: string }[];
  lingoLinkEnhanced_migrated?: boolean;
}
export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
}
export interface GoogleLoginError {
  error: string;
  error_description: string;
}
export interface Language {
  language: string;
  name: string;
  nameEn?: string;
}

export type AllEnginesArray = typeof defaultSetting.engineList;
export type EngineItem = AllEnginesArray[number];
export type EngineValue = (typeof defaultSetting.engineList)[number]["value"];
export type PostMessage =
  | {
      name: "swwListUpdate";
      payload: Sww[];
    }
  | {
      name: "userInfoUpdate";
      payload: User | undefined | null;
    }
  | {
      name: "showCard";
      payload: {
        mode: "practice" | "normal";
        text: string;
        context?: string;
        position?: {
          x: number;
          y: number;
        };
        domRect?: DOMRect;
      };
    }
  | {
      name: "hidePracticeCard";
    }
  | {
      name: "practiceWordNext";
    }
  | {
      name: "iframeOnload";
    }
  | {
      name: "fillCollectForm";
      payload: Partial<Pick<Sww, "id" | "context" | "word" | "remark">>;
    }
export interface CollectBasicInfo {
  word: string;
  context: string;
}
export type CollectRemarkInfo = CommunityItemType
/**
 * 公共类型定义：Setting、Language、引擎枚举等
 * - 字段语义明确，供全局复用
 */
