import { Language, InterfaceLanguage } from "@/types";
//import { codeBlock, oneLineTrim } from "common-tags";

/**
 * 当前是否为开发环境（Vite 提供）
 * - dev：`npm run dev` / `vite` 本地调试
 * - prod：打包后的浏览器扩展
 */
const isDev = import.meta.env.DEV;

/**
 * 格式化中文语言代码
 * 将各种中文变体统一为标准的中文简体代码
 * @param str - 输入的语言代码
 * @returns 格式化后的语言代码
 */
const formatZhCode = (str: string) => {
  if (/zh/.test(str) && str !== "zh-Hans" && str !== "zh-Hant") {
    return "zh-Hans";
  } else {
    return str;
  }
};

/**
 * 翻译卡片的默认宽度（像素）
 */
export const defaultCardWidth = 500;

/**
 * 翻译卡片的默认最小高度（像素）
 */
export const defaultCardMinHeight = 150;

/**
 * 翻译结果显示区域的最大宽度（像素）
 */
export const defaultTranslateMaxWidth = 500;

/**
 * 翻译结果显示区域的默认宽度（像素）
 */
export const defaultTranslateWidth = 500;

/**
 * 翻译结果显示区域的默认最小高度（像素）
 */
export const defaultTranslateMinHeight = 100;

/**
 * 单词列表网站的URL地址
 */
export const wordListUrl = "https://words.mywords.cc";
//export const wordListUrl = "https://words.mywords.cc/";

/**
 * 检查当前页面是否为单词列表页面
 */
export const isWordListPage = location.href === wordListUrl;

/**
 * 单词列表窗口的名称标识
 */
export const wordListWindowName = "wordList";

/**
 * 支持的翻译语言列表（基础版本，包含主要语言）
 */
export const supportLanguages: Language[] = [
  {
    language: "en",
    name: "English",
  },
  {
    language: "zh",
    name: "Chinese",
  },
  {
    language: "ja",
    name: "Japanese",
  },
  {
    language: "ko",
    name: "Korean",
  },
  {
    language: "fr",
    name: "French",
  },
];

/**
 * 动态获取单词翻译系统提示词
 * 根据当前界面语言返回对应的提示词
 */
export const getWordSystemPrompt = (): string => {
  try {
    const i18n = require('@/i18n').default;
    return i18n.t('Word System Prompt');
  } catch {
    return `I am learning English. I will provide you with a sentence and a word from that sentence. Please explain the meaning of the word in the context of the sentence, following the format of the Oxford English-Chinese Dictionary. Output format:
Definition: The definition of the word in the sentence, keep it concise
US Phonetic: [US Phonetic]
UK Phonetic: [UK Phonetic]`;
  }
};

/**
 * 动态获取单词翻译用户内容模板
 * 根据当前界面语言返回对应的模板
 */
export const getWordUserContent = (): string => {
  try {
    const i18n = require('@/i18n').default;
    return i18n.t('Word User Content');
  } catch {
    return '单词是：{word}，句子是{sentence}';
  }
};

/**
 * 动态获取句子翻译系统提示词
 * 根据当前界面语言返回对应的提示词
 */
export const getSentenceSystemPrompt = (): string => {
  try {
    const i18n = require('@/i18n').default;
    return i18n.t('Sentence System Prompt');
  } catch {
    return `You are a translation AI. You only need to provide the translation result without adding any irrelevant content.`;
  }
};

/**
 * 动态获取句子翻译用户内容模板
 * 根据当前界面语言返回对应的模板
 */
export const getSentenceUserContent = (): string => {
  try {
    const i18n = require('@/i18n').default;
    return i18n.t('Sentence User Content');
  } catch {
    return `Translate the following text to { targetLanguage }: { sentence } `;
  }
};

/**
 * 默认的插件设置配置
 * 包含翻译引擎、界面语言、触发方式等所有可配置选项
 */
export const defaultSetting = {
  // OpenAI相关配置
  openAIKey: "",
  openAIAddress: "https://api.openai.com/v1/chat/completions",
  openAIModel: "gpt-4o",

  // DeepSeek相关配置
  deepSeekApiKey: "",
  deepSeekAddress: "https://api.deepseek.com/chat/completions",

  // Gemini相关配置
  geminiKey: "",
  geminiAddress: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent",

  // 自定义 AI（Custom AI）相关配置
  // 在开发环境下预填为 ModelArts DeepSeek-V3 接口，方便本地调试
  customAIAddress: isDev
    ? "https://api.modelarts-maas.com/v1/chat/completions"
    : "",
  customAIModel: isDev ? "DeepSeek-V3" : "",
  customAIKey: isDev
    ? "qFvDurGfHbm1rEtmqhBQKmV2DJ8cof2ThSxPRCgoUHSc1hcPFAV18nuPAqrb_82pv5ZY3PZAFM6Fp4TNHPk7mQ"
    : "",

  // 翻译引擎配置
  engine: "openai",

  // 语言配置
  targetLanguage: formatZhCode(navigator.language), // 目标翻译语言，基于浏览器语言设置
  sourceLanguage: {
    // 源语言配置，默认英语
    language: "en",
    name: "English",
  },

  // 界面显示配置
  showSelectionIcon: true, // 是否显示选中文字的触发图标
  interfaceLanguage: (() => {
    const lang = navigator.language.toLowerCase();
    // 支持的语言映射
    const languageMap: Record<string, InterfaceLanguage> = {
      'en': 'en',
      'ja': 'ja',
      'ko': 'ko',
      'fr': 'fr',
      'de': 'de',
      'es': 'es',
      'it': 'it',
      'ru': 'ru',
      'pt': 'pt',
      'th': 'th',
      'vi': 'vi',
      'hi': 'hi',
      'ar': 'ar',
      'tr': 'tr',
      'id': 'id',
      'nl': 'nl',
      'pl': 'pl',
      'sv': 'sv',
      'uk': 'uk',
      'zh': 'zh', // 中文
      'zh-cn': 'zh', // 简体中文
      'zh-tw': 'zh', // 繁体中文
    };
    // 尝试精确匹配
    if (languageMap[lang]) {
      return languageMap[lang];
    }
    // 尝试主语言匹配（如 en-US -> en）
    const mainLang = lang.split('-')[0];
    if (languageMap[mainLang]) {
      return languageMap[mainLang];
    }
    // 默认返回英文
    return 'en';
  })(), // 界面语言
  autoPronounce: false, // 是否自动发音
  triggerIconSize: 25, // 触发图标的尺寸（像素）
  highlightColor: "black", // 高亮显示颜色
  highlightStyle: "dashed" as HighlightName, // 高亮显示样式

  // 功能配置
  autoSaveWord: false, // 是否自动保存单词

  // 已注释的配置选项（可能是历史遗留或实验性功能）
  // availableEngines: [
  //   {
  //     name: "Youdao",
  //     value: "youdao",
  //   },
  //   {
  //     name: "Google",
  //     value: "google",
  //   },
  // ] as EngineItem[],

  // 已注释的系统提示词模板（可能是早期版本的翻译提示）
  // wordSystemPrompt: codeBlock`
  //   ${oneLineTrim`
  //   你是一个翻译引擎，翻译的目标语言为{targetLanguage}，只需要翻译不需要解释。
  //   当给出一个单词时，
  //   请给出单词原始形态（如果有）、
  //   单词的语种、
  //   对应的音标或转写、
  //   所有含义（含词性）、
  //   双语示例，三条例句。
  //   请严格按照下面格式给到翻译结果：`}
  //       <单词>
  //       [<语种>]· / <Pinyin> /
  //       [<词性缩写>] <中文含义>]（如果同时给出了句子，解释单词在句子中的含义）
  //       [<句子的含义>]（如果同时给出了句子）
  //       例句：
  //       <序号><例句>(例句翻译)
  //       词源：
  //       <词源>
  // `,

  /**
   * 单词翻译的系统提示词
   * 用于指导AI如何解释单词含义，遵循牛津英汉词典格式
   */
  wordSystemPrompt: `I am learning English. I will provide you with a sentence and a word from that sentence. Please explain the meaning of the word in the context of the sentence, following the format of the Oxford English-Chinese Dictionary. Output format:
Definition: The definition of the word in the sentence, keep it concise
US Phonetic: [US Phonetic]
UK Phonetic: [UK Phonetic]`,

  // 已注释的用户内容模板
  //wordUserContent: `单词是：{ word } `,

  /**
   * 单词翻译的用户内容模板
   * 包含需要翻译的单词和上下文句子
   */
  wordUserContent: '单词是：{word}，句子是{sentence}',

  /**
   * 句子翻译的系统提示词
   * 要求AI只提供翻译结果，不添加无关内容
   */
  sentenceSystemPrompt: `You are a translation AI.You only need to provide the translation result without adding any irrelevant content.`,

  /**
   * 句子翻译的用户内容模板
   * 指定翻译目标和要翻译的句子
   */
  sentenceUserContent: getSentenceUserContent(),

  /**
   * 翻译引擎列表配置
   * 定义所有可用的翻译服务和其属性
   * isChat: 是否为聊天式AI引擎
   * compatible: 兼容性（word=单词，sentence=句子，both=都支持）
   * checked: 默认是否启用
   */
  engineList: (() => {
    const base = [
      {
        name: "Click-Translate",
        value: "click-translate",
        isChat: true,
        checked: true,
        compatible: "both",
      },
      {
        name: "OpenAI",
        value: "openai",
        isChat: true,
        checked: false,
        compatible: "both",
      },
      {
        name: "Gemini",
        value: "gemini",
        isChat: true,
        checked: false,
        compatible: "both",
      },
      {
        name: "DeepSeek",
        value: "deepseek",
        isChat: true,
        checked: false,
        compatible: "both",
      },
      {
        name: "DeepLX",
        value: "deeplx",
        isChat: false,
        checked: false,
        compatible: "sentence",
      },
      {
        name: "Custom",
        value: "custom",
        isChat: true,
        checked: false,
        compatible: "both",
      },
    ];

    // 开发环境：将 Custom AI 提到列表最前面，并默认勾选
    if (isDev) {
      const list = [...base];
      const idx = list.findIndex((item) => item.value === "custom");
      if (idx !== -1) {
        const [customItem] = list.splice(idx, 1);
        list.unshift({ ...customItem, checked: true });
      }
      return list;
    }

    // 生产环境：保持原有顺序与默认勾选状态
    return base;
  })(),
};

/**
 * 所有支持单词翻译的引擎列表
 * 通过过滤engineList得到，兼容性不是sentence的引擎
 */
export const allWordEngineList = defaultSetting.engineList.filter(item => item.compatible !== 'sentence');

/**
 * 所有支持句子翻译的引擎列表
 * 通过过滤engineList得到，兼容性不是word的引擎
 */
export const allSentenceEngineList = defaultSetting.engineList.filter(item => item.compatible !== 'word');

/**
 * 源语言选项列表
 * 包含详细的语言名称和代码，供用户选择翻译的源语言
 */
export const SourceLanguage: Language[] = [
  { name: "English", nameEn: "English", language: "en" },
  { name: "简体中文", nameEn: "Simplified Chinese", language: "zh" },
  { name: "日本語", nameEn: "Japanese", language: "ja" },
  { name: "한국어", nameEn: "Korean", language: "ko" },
  { name: "한국어 반말", nameEn: "Korean", language: "ko-banmal" },
  { name: "Français", nameEn: "French", language: "fr" },
  { name: "Deutsch", nameEn: "German", language: "de" },
  { name: "Español", nameEn: "Spanish", language: "es" },
  { name: "Italiano", nameEn: "Italian", language: "it" },
  { name: "Русский", nameEn: "Russian", language: "ru" },
  { name: "Português", nameEn: "Portuguese", language: "pt" },
  { name: "Nederlands", nameEn: "Dutch", language: "nl" },
  { name: "Polski", nameEn: "Polish", language: "pl" },
  { name: "العربية", nameEn: "Arabic", language: "ar" },
  { name: "Afrikaans", nameEn: "Afrikaans", language: "af" },
  { name: "አማርኛ", nameEn: "Amharic", language: "am" },
  { name: "Azərbaycan", nameEn: "Azerbaijani", language: "az" },
  { name: "Беларуская", nameEn: "Belarusian", language: "be" },
  { name: "Български", nameEn: "Bulgarian", language: "bg" },
  { name: "বাংলা", nameEn: "Bengali", language: "bn" },
  { name: "Bosanski", nameEn: "Bosnian", language: "bs" },
  { name: "Català", nameEn: "Catalan", language: "ca" },
  { name: "Cebuano", nameEn: "Cebuano", language: "ceb" },
  { name: "Corsu", nameEn: "Corsican", language: "co" },
  { name: "Čeština", nameEn: "Czech", language: "cs" },
  { name: "Cymraeg", nameEn: "Welsh", language: "cy" },
  { name: "Dansk", nameEn: "Danish", language: "da" },
  { name: "Ελληνικά", nameEn: "Greek", language: "el" },
  { name: "Esperanto", nameEn: "Esperanto", language: "eo" },
  { name: "Eesti", nameEn: "Estonian", language: "et" },
  { name: "Euskara", nameEn: "Basque", language: "eu" },
  { name: "فارسی", nameEn: "Persian", language: "fa" },
  { name: "Suomi", nameEn: "Finnish", language: "fi" },
  { name: "Fijian", nameEn: "Fijian", language: "fj" },
  { name: "Frysk", nameEn: "Frisian", language: "fy" },
  { name: "Gaeilge", nameEn: "Irish", language: "ga" },
  { name: "Gàidhlig", nameEn: "Scottish Gaelic", language: "gd" },
  { name: "Galego", nameEn: "Galician", language: "gl" },
  { name: "ગુજરાતી", nameEn: "Gujarati", language: "gu" },
  { name: "Hausa", nameEn: "Hausa", language: "ha" },
  { name: "Hawaiʻi", nameEn: "Hawaiian", language: "haw" },
  { name: "עברית", nameEn: "Hebrew", language: "he" },
  { name: "हिन्दी", nameEn: "Hindi", language: "hi" },
  { name: "Hmong", nameEn: "Hmong", language: "hmn" },
  { name: "Hrvatski", nameEn: "Croatian", language: "hr" },
  { name: "Kreyòl Ayisyen", nameEn: "Haitian Creole", language: "ht" },
  { name: "Magyar", nameEn: "Hungarian", language: "hu" },
  { name: "Հայերեն", nameEn: "Armenian", language: "hy" },
  { name: "Bahasa Indonesia", nameEn: "Indonesian", language: "id" },
  { name: "Igbo", nameEn: "Igbo", language: "ig" },
  { name: "Íslenska", nameEn: "Icelandic", language: "is" },
  { name: "Jawa", nameEn: "Javanese", language: "jw" },
  { name: "ქართული", nameEn: "Georgian", language: "ka" },
  { name: "Қазақ", nameEn: "Kazakh", language: "kk" },
  { name: "Монгол хэл", nameEn: "Mongolian", language: "mn" },
  { name: "Türkçe", nameEn: "Turkish", language: "tr" },
  { name: "ئۇيغۇر تىلى", nameEn: "Uyghur", language: "ug" },
  { name: "Українська", nameEn: "Ukrainian", language: "uk" },
  { name: "اردو", nameEn: "Urdu", language: "ur" },
  { name: "Tiếng Việt", nameEn: "Vietnamese", language: "vi" },
  { name: "Svenska", nameEn: "Swedish", language: "sv" },
  { name: "ไทย", nameEn: "Thai", language: "th" },
] as const;

/**
 * 所有支持的语言列表
 * 包含更详细的语言变体和方言选项
 * 比SourceLanguage更全面，支持语言变体选择
 */
export const AllLanguage: Language[] = [
  { name: "--Please Select--", language: "" },
  { name: "English", nameEn: "English", language: "en" },
  { name: "American English", nameEn: "English (US)", language: "en-US" },
  { name: "British English", nameEn: "English (UK)", language: "en-GB" },
  { name: "Canadian English", nameEn: "English (Canada)", language: "en-CA" },
  {
    name: "Australian English",
    nameEn: "English (Australia)",
    language: "en-AU",
  },
  { name: "简体中文", nameEn: "Simplified Chinese", language: "zh-Hans" },
  { name: "繁體中文", nameEn: "Traditional Chinese", language: "zh-Hant" },
  { name: "粤语", nameEn: "Cantonese", language: "yue" },
  { name: "古文", nameEn: "Classical Chinese", language: "lzh" },
  { name: "近代白话文", nameEn: "Modern Standard Chinese", language: "jdbhw" },
  { name: "现代白话文", nameEn: "Contemporary Chinese", language: "xdbhw" },
  { name: "日本語", nameEn: "Japanese", language: "ja" },
  { name: "한국어", nameEn: "Korean", language: "ko" },
  { name: "한국어 반말", nameEn: "Korean", language: "ko-banmal" },
  { name: "Français", nameEn: "French", language: "fr" },
  { name: "Deutsch", nameEn: "German", language: "de" },
  { name: "Español", nameEn: "Spanish", language: "es" },
  { name: "Italiano", nameEn: "Italian", language: "it" },
  { name: "Русский", nameEn: "Russian", language: "ru" },
  { name: "Português", nameEn: "Portuguese", language: "pt" },
  { name: "Nederlands", nameEn: "Dutch", language: "nl" },
  { name: "Polski", nameEn: "Polish", language: "pl" },
  { name: "العربية", nameEn: "Arabic", language: "ar" },
  { name: "Afrikaans", nameEn: "Afrikaans", language: "af" },
  { name: "አማርኛ", nameEn: "Amharic", language: "am" },
  { name: "Azərbaycan", nameEn: "Azerbaijani", language: "az" },
  { name: "Беларуская", nameEn: "Belarusian", language: "be" },
  { name: "Български", nameEn: "Bulgarian", language: "bg" },
  { name: "বাংলা", nameEn: "Bengali", language: "bn" },
  { name: "Bosanski", nameEn: "Bosnian", language: "bs" },
  { name: "Català", nameEn: "Catalan", language: "ca" },
  { name: "Cebuano", nameEn: "Cebuano", language: "ceb" },
  { name: "Corsu", nameEn: "Corsican", language: "co" },
  { name: "Čeština", nameEn: "Czech", language: "cs" },
  { name: "Cymraeg", nameEn: "Welsh", language: "cy" },
  { name: "Dansk", nameEn: "Danish", language: "da" },
  { name: "Ελληνικά", nameEn: "Greek", language: "el" },
  { name: "Esperanto", nameEn: "Esperanto", language: "eo" },
  { name: "Eesti", nameEn: "Estonian", language: "et" },
  { name: "Euskara", nameEn: "Basque", language: "eu" },
  { name: "فارسی", nameEn: "Persian", language: "fa" },
  { name: "Suomi", nameEn: "Finnish", language: "fi" },
  { name: "Fijian", nameEn: "Fijian", language: "fj" },
  { name: "Frysk", nameEn: "Frisian", language: "fy" },
  { name: "Gaeilge", nameEn: "Irish", language: "ga" },
  { name: "Gàidhlig", nameEn: "Scottish Gaelic", language: "gd" },
  { name: "Galego", nameEn: "Galician", language: "gl" },
  { name: "ગુજરાતી", nameEn: "Gujarati", language: "gu" },
  { name: "Hausa", nameEn: "Hausa", language: "ha" },
  { name: "Hawaiʻi", nameEn: "Hawaiian", language: "haw" },
  { name: "עברית", nameEn: "Hebrew", language: "he" },
  { name: "हिन्दी", nameEn: "Hindi", language: "hi" },
  { name: "Hmong", nameEn: "Hmong", language: "hmn" },
  { name: "Hrvatski", nameEn: "Croatian", language: "hr" },
  { name: "Kreyòl Ayisyen", nameEn: "Haitian Creole", language: "ht" },
  { name: "Magyar", nameEn: "Hungarian", language: "hu" },
  { name: "Հայերեն", nameEn: "Armenian", language: "hy" },
  { name: "Bahasa Indonesia", nameEn: "Indonesian", language: "id" },
  { name: "Igbo", nameEn: "Igbo", language: "ig" },
  { name: "Íslenska", nameEn: "Icelandic", language: "is" },
  { name: "Jawa", nameEn: "Javanese", language: "jw" },
  { name: "ქართული", nameEn: "Georgian", language: "ka" },
  { name: "Қазақ", nameEn: "Kazakh", language: "kk" },
  { name: "Монгол хэл", nameEn: "Mongolian", language: "mn" },
  { name: "Türkçe", nameEn: "Turkish", language: "tr" },
  { name: "ئۇيغۇر تىلى", nameEn: "Uyghur", language: "ug" },
  { name: "Українська", nameEn: "Ukrainian", language: "uk" },
  { name: "اردو", nameEn: "Urdu", language: "ur" },
  { name: "Tiếng Việt", nameEn: "Vietnamese", language: "vi" },
  { name: "Svenska", nameEn: "Swedish", language: "sv" },
  { name: "ไทย", nameEn: "Thai", language: "th" },
] as const;

/**
 * 语言代码类型定义
 * 基于AllLanguage数组提取所有语言代码
 */
export type LangCode = (typeof AllLanguage)[number]["language"];

/**
 * 浏览器扩展的唯一标识符
 * 用于Chrome扩展市场的识别和区分
 */
export const extensionId = "ahhlnchdiglcghegemaclpikmdclonmo";

/**
 * 各翻译引擎的图标URL映射
 * 用于在UI中显示对应的引擎图标
 */
export const enginePicArr = {
  google:
    "https://qph.cf2.poecdn.net/main-thumb-pb-3655359-200-eomiajapmpmpgnwktjnxhcfbdlueukgq.jpeg",
  openai:
    "https://qph.cf2.poecdn.net/main-thumb-pb-3004-200-jougqzjtwfqfyqprxbdwofvnwattmtrg.jpeg",
  gemini:
    "https://qph.cf2.poecdn.net/main-thumb-pb-3669463-200-hqyxuiygtmnetolnimubmwhakbsueapd.jpeg",
};

/**
 * 支持的高亮显示样式列表
 * 定义了不同类型的高亮视觉效果
 */
export const highlightStyles = [
  'none',           // 无高亮
  'background',     // 背景色高亮
  'text',           // 文字颜色高亮
  'underline',      // 下划线
  'double-underline', // 双下划线
  'wavy',           // 波浪线
  'dotted',         // 点线
  'dashed'          // 虚线
] as const

/**
 * 高亮样式名称的类型定义
 * 基于highlightStyles数组提取的联合类型
 */
export type HighlightName = (typeof highlightStyles)[number]
