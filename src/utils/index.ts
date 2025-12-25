import type {
  BackgroundFetchParam,
  EngineValue,
  ExtensionMessage,
} from "@/types/index";
import type { Sww } from "@/types/words";
import { Message } from "@/types/chat";
import { createParser } from "eventsource-parser";
import type { CollinsWord } from "@/types/index";
/**
 * 文本压缩：移除多余换行与空白
 */
export const formateText = (str: string) => {
  return str.replace(/\r\n/g, " ").replace(/\s+/g, " ");
};
/**
 * 根据锚点 DOMRect 计算卡片坐标，并限制不超出视口
 */
export const preventBeyondWindow = ({
  boxWidth,
  boxHeight,
  domRect,
  gap,
}: {
  boxWidth: number;
  boxHeight: number;
  domRect: DOMRect;
  gap: number;
}) => {
  let x = domRect.right - domRect.width / 2 - boxWidth / 2 + window.scrollX;
  let y = domRect.top + domRect.height + window.scrollY + gap;

  if (x < 0) {
    x = 0;
  }
  if (x + boxWidth > window.innerWidth + window.scrollX) {
    x = window.innerWidth + window.scrollX - boxWidth;
  }
  if (y + boxHeight > window.innerHeight + window.scrollY) {
    y = window.scrollY + domRect.top - boxHeight - 20;
  }
  return { x, y };
};
/** 比较两个单词是否相同（去空白 + 忽略大小写） */
export const isSameWord = (word1: string, word2: string) => {
  if (!word1 || !word2) {
    return false;
  }
  return word1.trim().toLocaleLowerCase() === word2.trim().toLocaleLowerCase();
};
/** 在收藏列表中查找匹配单词 */
export const getCollectWord = ({
  word,
  swwList,
}: {
  word: string;
  swwList: Sww[];
}) => {
  return swwList.find((item) => {
    return isSameWord(item.word, word);
  });
};
/** 判断收藏列表中是否已存在该单词 */
export const hasWord = ({
  word,
  swwList,
}: {
  word: string;
  swwList: Sww[];
}) => {
  return Boolean(
    swwList.find((item) => {
      return isSameWord(item.word, word);
    })
  );
};
/**
 * 后台拉取封装：统一 fetch 调用与返回格式
 */
export const backgroundFetch = async (param: BackgroundFetchParam) => {
  const { url, method, responseType } = param;
  const options: Record<string, any> = {
    method: method ?? "GET",
  };
  if (param.body) {
    options.body = param.body;
  }
  if (param.headers) {
    options.headers = param.headers;
  }
  return fetch(url, options).then(async (res) => {
    if (!res.ok) {
      return {
        error: "fetch failed",
      };
    }
    if (responseType === "dataURL") {
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function () {
          resolve(this.result);
        };
        reader.readAsDataURL(blob);
      });
    } else if (responseType === "text") {
      return await res.text();
    } else if (responseType === "json") {
      return await res.json();
    }
  });
};

/** 向后台页发送 fetch 请求，解决 CORS/权限问题 */
export const sendBackgroundFetch = async (option: BackgroundFetchParam) => {
    const browser = (await import("webextension-polyfill")).default;
    const message: ExtensionMessage = {
      type: "fetch",
      payload: option,
    };
    return browser.runtime.sendMessage(message);
  
};
/**
 * 粒度识别：判断输入在对应语言下是否为“一个词”
 * 优先使用 Intl.Segmenter，不可用时针对英文退化判断
 */
export function isWord({
  input,
  lang,
}: {
  input: string;
  lang: string | undefined;
}) {
  if (!input) {
    throw new Error("input is empty");
  }
  const text = input.trim();
  const sourceLanguage = lang ?? navigator.language;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { Segmenter } = Intl as any;
  if (!Segmenter && sourceLanguage.indexOf("en") !== -1) {
    if (input.split(" ").length === 1) {
      return true;
    } else {
      return false;
    }
  }
  if (!Segmenter) {
    return false;
  }
  const segmenter = new Segmenter(sourceLanguage, { granularity: "word" });
  const iterator = segmenter.segment(text)[Symbol.iterator]();
  return iterator.next().value?.segment === text;
}
/** 针对不同 AI 引擎做消息兼容适配（如文心角色映射） */
export const formateMessage = (engine: EngineValue, messages: Message[]) => {
  if (engine === "wenxin") {
    return messages.map((item) => ({
      role: item.role === "system" ? "user" : item.role,
      content: item.content,
    }));
  }
  return messages;
};
/**
 * SSE 流处理：逐块喂给 eventsource-parser 并回调数据
 */
export async function handleStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onData: (data: string) => void
) {
  const parser = createParser((event) => {
    if (event.type === "event") {
      onData(event.data);
    }
  });
  // eslint-disable-next-line
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    const text = new TextDecoder().decode(value);
    parser.feed(text);
  }
}
// 递归压缩长边不超过 500 的比例
function compressRatio({ width, height }: { width: number; height: number }) {
  const maxLimit = 500;
  if (width > maxLimit || height > maxLimit) {
    width = Math.floor(width * 0.8);
    height = Math.floor(height * 0.8);
    return compressRatio({ width, height });
  } else {
    return { width, height };
  }
}
/** 将图片压缩为 webp Blob，降低上传开销 */
export function compressImg(img: File) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const reader = new FileReader();
    reader.addEventListener("load", function (e) {
      const newImg = new Image();
      newImg.onload = function () {
        // let width = newImg.width;
        // let height = newImg.height;
        // if (newImg.width > 1000 || newImg.height > 1000) {
        //   width = width / 2;
        //   height = height / 2;
        // }
        const { width, height } = compressRatio({
          width: newImg.width,
          height: newImg.height,
        });
        canvas.width = width;
        canvas.height = height;
        ctx!.drawImage(newImg, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          function (blob) {
            resolve(blob);
          },
          "image/webp",
          0.8
        );
      };
      newImg.src = e.target!.result as string;
    });
    reader.readAsDataURL(img);
  });
}
/** 当前焦点是否在可编辑输入（避免误触） */
export const isSelectionInEditElement = () =>
  document.activeElement instanceof HTMLTextAreaElement ||
  document.activeElement instanceof HTMLInputElement;
// iframe window 管理器：存取内容脚本建立的通信窗口
const iframeWindowManager = () => {
  let iframeWindow: MessageEventSource | undefined = undefined;
  return {
    getIframeWindow() {
      return iframeWindow;
    },
    setIframeWindow(param: MessageEventSource) {
      iframeWindow = param;
    },
  };
};
export const { getIframeWindow, setIframeWindow } = iframeWindowManager();
/** 当前页面最近一次取词的词与上下文 */
export const currentSelectionInfo: {
  word: string;
  context: string;
} = {
  word: "",
  context: "",
};
/** 调用浏览器 API 截图，并广播 DataURL 给当前页内容脚本 */
export const screenshot = async () => {
  const browser = (await import("webextension-polyfill")).default;
  const res = await browser.tabs.captureVisibleTab();
  const tabs = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  const message: ExtensionMessage = {
    type: "onScreenDataurl",
    payload: res,
  };
  browser.tabs.sendMessage(tabs[0].id!, message);
};
/** 让内容脚本返回当前窗口的选区信息 */
export const getWindowSelectionInfo = async () => {
  const browser = (await import("webextension-polyfill")).default;
  const tabs = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });
  const message: ExtensionMessage = {
    type: "getCurWindowSelectionInfo",
  };
  return await browser.tabs.sendMessage(tabs[0].id!, message);
};
/** 解析柯林斯词典 HTML，提取音标、词义与例句 */
export const parseCollins = (html: string) => {
  const result: CollinsWord = {
    phonetic: null,
    explains: [],
  };
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  
  const cobuildItms = Array.from(
    doc.querySelectorAll(".definitions.cobuild .hom")
  );
  (result.phonetic = doc.querySelector(".dictionary .pron")?.textContent),
    cobuildItms.forEach((item) => {
      result.explains.push({
        pos: item.querySelector(".gramGrp")?.textContent,
        def: item.querySelector(".def")?.textContent,
        examples: Array.from(item.querySelectorAll(".type-example"))?.map(
          (quote) => quote.textContent
        ),
      });
    });
  return result;
};
/** 是否运行于扩展弹窗页面环境 */
export const isInPopup = /extension/.test(location.protocol);
/** 将 base64 图片转换为 webp Blob */
export function base64ToBlob(base64: string): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx!.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        function (blob) {
          resolve(blob!);
        },
        "image/webp",
        0.5
      );
    };
  });
}
