import mitt from 'mitt';

type Events = {
  showCard: {text:string, domRect:DOMRect};
  hideCard: void
};

export const emitter = mitt<Events>();
/**
 * 事件总线：用于跨组件/脚本的轻量发布-订阅
 * - 统一管理事件名，避免魔法字符串分散
 */
