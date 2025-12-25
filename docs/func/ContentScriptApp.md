# 调用流程：ContentScriptApp

## 1. 在 [src/contentScript/lingoCard.tsx#38](../../src/contentScript/lingoCard.tsx#L38) 调用 `ContentScriptApp` [src/contentScript/lingoCard.tsx#38](src/contentScript/lingoCard.tsx#L38)
   1.1 在 [src/contentScript/lingoCard.tsx#39](src/contentScript/lingoCard.tsx#L39) 调用 `useContentScriptMessage` [src/hooks/useContentScriptMessage.tsx](src/hooks/useContentScriptMessage.tsx)
   1.2 在 [src/contentScript/lingoCard.tsx#42](src/contentScript/lingoCard.tsx#L42) 调用 `useAtom` [src/store.ts](src/store.ts)
   1.3 在 [src/contentScript/lingoCard.tsx#43](src/contentScript/lingoCard.tsx#L43) 调用 `useTranslation` [src/i18n.ts](src/i18n.ts)
   1.4 在 [src/contentScript/lingoCard.tsx#134](src/contentScript/lingoCard.tsx#L134) 调用 `useTreeWalker` [src/hooks/useTreeWalker.tsx](src/hooks/useTreeWalker.tsx)
      1.4.1 在 [src/contentScript/lingoCard.tsx#135](src/contentScript/lingoCard.tsx#L135) 传递 `mouseoverCallback` [src/contentScript/lingoCard.tsx#112](src/contentScript/lingoCard.tsx#L112)
      1.4.2 在 [src/contentScript/lingoCard.tsx#136](src/contentScript/lingoCard.tsx#L136) 传递 `mouseoutCallback` [src/contentScript/lingoCard.tsx#126](src/contentScript/lingoCard.tsx#L126)
   1.5 在 [src/contentScript/lingoCard.tsx#138](src/contentScript/lingoCard.tsx#L138) 调用 `useEffect` 设置快捷键
      1.5.1 在 [src/contentScript/lingoCard.tsx#145](src/contentScript/lingoCard.tsx#L145) 调用 `hotkeys` [src/contentScript/lingoCard.tsx#146](src/contentScript/lingoCard.tsx#L146)
      1.5.2 在 [src/contentScript/lingoCard.tsx#140](src/contentScript/lingoCard.tsx#L140) 调用 `showCardAndPosition` [src/contentScript/lingoCard.tsx#63](src/contentScript/lingoCard.tsx#L63)
   1.6 在 [src/contentScript/lingoCard.tsx#154](src/contentScript/lingoCard.tsx#L154) 调用 `useEffect` 监听全局鼠标事件
      1.6.1 在 [src/contentScript/lingoCard.tsx#156](src/contentScript/lingoCard.tsx#L156) 调用 `isSelectionInEditElement` [src/utils/index.ts](src/utils/index.ts)
      1.6.2 在 [src/contentScript/lingoCard.tsx#159](src/contentScript/lingoCard.tsx#L159) 调用 `window.getSelection` [src/contentScript/lingoCard.tsx#159](src/contentScript/lingoCard.tsx#L159)
      1.6.3 在 [src/contentScript/lingoCard.tsx#162](src/contentScript/lingoCard.tsx#L162) 检查 `setting.showSelectionIcon` [src/store.ts](src/store.ts)
   1.7 在 [src/contentScript/lingoCard.tsx#185](src/contentScript/lingoCard.tsx#L185) 调用 `useEffect` 监听选区变化
      1.7.1 在 [src/contentScript/lingoCard.tsx#187](src/contentScript/lingoCard.tsx#L187) 调用 `isSelectionInEditElement` [src/utils/index.ts](src/utils/index.ts)
      1.7.2 在 [src/contentScript/lingoCard.tsx#195](src/contentScript/lingoCard.tsx#L195) 更新 `currentSelectionInfo.word` [src/utils/index.ts](src/utils/index.ts)
      1.7.3 在 [src/contentScript/lingoCard.tsx#196](src/contentScript/lingoCard.tsx#L196) 调用 `getSentenceFromSelection` [src/utils/getSelection.ts](src/utils/getSelection.ts)
      1.7.4 在 [src/contentScript/lingoCard.tsx#199](src/contentScript/lingoCard.tsx#L199) 更新 `rangeRef.current` [src/contentScript/lingoCard.tsx#61](src/contentScript/lingoCard.tsx#L61)
   1.8 在 [src/contentScript/lingoCard.tsx#207](src/contentScript/lingoCard.tsx#L207) 调用 `useEffect` 监听隐藏卡片事件
      1.8.1 在 [src/contentScript/lingoCard.tsx#209](src/contentScript/lingoCard.tsx#L209) 调用 `emitter.on` [src/utils/mitt.ts](src/utils/mitt.ts)
   1.9 在 [src/contentScript/lingoCard.tsx#214](src/contentScript/lingoCard.tsx#L214) 调用 `useEffect` 监听展示卡片事件
      1.9.1 在 [src/contentScript/lingoCard.tsx#215](src/contentScript/lingoCard.tsx#L215) 调用 `emitter.on` [src/utils/mitt.ts](src/utils/mitt.ts)
   1.10 在 [src/contentScript/lingoCard.tsx#230](src/contentScript/lingoCard.tsx#L230) 调用 `useEffect` 同步界面语言
      1.10.1 在 [src/contentScript/lingoCard.tsx#232](src/contentScript/lingoCard.tsx#L232) 调用 `i18n.changeLanguage` [src/i18n.ts](src/i18n.ts)
   1.11 在 [src/contentScript/lingoCard.tsx#237](src/contentScript/lingoCard.tsx#L237) 调用 `useEffect` 处理扩展消息
      1.11.1 在 [src/contentScript/lingoCard.tsx#239](src/contentScript/lingoCard.tsx#L239) 处理 `showCardAndPosition` 消息
         1.11.1.1 在 [src/contentScript/lingoCard.tsx#244](src/contentScript/lingoCard.tsx#L244) 调用 `showCardAndPosition` [src/contentScript/lingoCard.tsx#63](src/contentScript/lingoCard.tsx#L63)
      1.11.2 在 [src/contentScript/lingoCard.tsx#249](src/contentScript/lingoCard.tsx#L249) 处理 `onScreenDataurl` 消息
         1.11.2.1 在 [src/contentScript/lingoCard.tsx#250](src/contentScript/lingoCard.tsx#L250) 调用 `onCaptureScreenResult` [src/utils/onCaptureScreenResult.ts](src/utils/onCaptureScreenResult.ts)
      1.11.3 在 [src/contentScript/lingoCard.tsx#259](src/contentScript/lingoCard.tsx#L259) 处理 `getCurWindowSelectionInfo` 消息
         1.11.3.1 在 [src/contentScript/lingoCard.tsx#267](src/contentScript/lingoCard.tsx#L267) 调用 `getSentenceFromSelection` [src/utils/getSelection.ts](src/utils/getSelection.ts)
      1.11.4 在 [src/contentScript/lingoCard.tsx#274](src/contentScript/lingoCard.tsx#L274) 调用 `browser.runtime.onMessage.addListener` [src/contentScript/lingoCard.tsx#274](src/contentScript/lingoCard.tsx#L274)

## 2. 在 [src/contentScript/lingoCard.tsx#63](src/contentScript/lingoCard.tsx#L63) 调用 `showCardAndPosition` [src/contentScript/lingoCard.tsx#63](src/contentScript/lingoCard.tsx#L63)
   2.1 在 [src/contentScript/lingoCard.tsx#76](src/contentScript/lingoCard.tsx#L76) 调用 `setCardShow` [src/contentScript/lingoCard.tsx#60](src/contentScript/lingoCard.tsx#L60)
   2.2 在 [src/contentScript/lingoCard.tsx#77](src/contentScript/lingoCard.tsx#L77) 调用 `setSearchText` [src/contentScript/lingoCard.tsx#62](src/contentScript/lingoCard.tsx#L62)
   2.3 在 [src/contentScript/lingoCard.tsx#78](src/contentScript/lingoCard.tsx#L78) 调用 `setTriggerIconShow` [src/contentScript/lingoCard.tsx#51](src/contentScript/lingoCard.tsx#L51)
   2.4 在 [src/contentScript/lingoCard.tsx#82](src/contentScript/lingoCard.tsx#L82) 调用 `preventBeyondWindow` [src/utils/index.ts](src/utils/index.ts)
      2.4.1 在 [src/contentScript/lingoCard.tsx#83](src/contentScript/lingoCard.tsx#L83) 调用 `isWord` [src/utils/index.ts](src/utils/index.ts)
      2.4.2 在 [src/contentScript/lingoCard.tsx#89](src/contentScript/lingoCard.tsx#L89) 调用 `isWord` [src/utils/index.ts](src/utils/index.ts)
   2.5 在 [src/contentScript/lingoCard.tsx#105](src/contentScript/lingoCard.tsx#L105) 调用 `setCardPosition` [src/contentScript/lingoCard.tsx#56](src/contentScript/lingoCard.tsx#L56)

## 3. 在 [src/contentScript/lingoCard.tsx#112](src/contentScript/lingoCard.tsx#L112) 调用 `mouseoverCollectCallback` [src/contentScript/lingoCard.tsx#112](src/contentScript/lingoCard.tsx#L112)
   3.1 在 [src/contentScript/lingoCard.tsx#117](src/contentScript/lingoCard.tsx#L117) 调用 `window.setTimeout` [src/contentScript/lingoCard.tsx#117](src/contentScript/lingoCard.tsx#L117)
   3.2 在 [src/contentScript/lingoCard.tsx#118](src/contentScript/lingoCard.tsx#L118) 调用 `showCardAndPosition` [src/contentScript/lingoCard.tsx#63](src/contentScript/lingoCard.tsx#L63)

## 4. 在 [src/contentScript/lingoCard.tsx#126](src/contentScript/lingoCard.tsx#L126) 调用 `mouseoutCollectCallback` [src/contentScript/lingoCard.tsx#126](src/contentScript/lingoCard.tsx#L126)
   4.1 在 [src/contentScript/lingoCard.tsx#128](src/contentScript/lingoCard.tsx#L128) 调用 `clearTimeout` [src/contentScript/lingoCard.tsx#128](src/contentScript/lingoCard.tsx#L128)

## 5. 在 [src/contentScript/lingoCard.tsx#131](src/contentScript/lingoCard.tsx#L131) 调用 `onmouseenterCard` [src/contentScript/lingoCard.tsx#131](src/contentScript/lingoCard.tsx#L131)
   5.1 在 [src/contentScript/lingoCard.tsx#132](src/contentScript/lingoCard.tsx#L132) 调用 `clearTimeout` [src/contentScript/lingoCard.tsx#132](src/contentScript/lingoCard.tsx#L132)

## 6. 在 [src/contentScript/lingoCard.tsx#220](src/contentScript/lingoCard.tsx#L220) 调用 `handleTriggerClick` [src/contentScript/lingoCard.tsx#220](src/contentScript/lingoCard.tsx#L220)
   6.1 在 [src/contentScript/lingoCard.tsx#221](src/contentScript/lingoCard.tsx#L221) 调用 `showCardAndPosition` [src/contentScript/lingoCard.tsx#63](src/contentScript/lingoCard.tsx#L63)

## 7. 在 [src/contentScript/lingoCard.tsx#226](src/contentScript/lingoCard.tsx#L226) 调用 `hideCard` [src/contentScript/lingoCard.tsx#226](src/contentScript/lingoCard.tsx#L226)
   7.1 在 [src/contentScript/lingoCard.tsx#227](src/contentScript/lingoCard.tsx#L227) 调用 `setCardShow` [src/contentScript/lingoCard.tsx#60](src/contentScript/lingoCard.tsx#L60)

## 8. 在 [src/contentScript/lingoCard.tsx#286](src/contentScript/lingoCard.tsx#L286) 调用 `TriggerIcon` [src/components/TriggerIcon.tsx](src/components/TriggerIcon.tsx)
   8.1 在 [src/contentScript/lingoCard.tsx#287](src/contentScript/lingoCard.tsx#L287) 传递 `size` [src/utils/const.ts](src/utils/const.ts)
   8.2 在 [src/contentScript/lingoCard.tsx#288](src/contentScript/lingoCard.tsx#L288) 传递 `url` [src/utils/const.ts](src/utils/const.ts)
   8.3 在 [src/contentScript/lingoCard.tsx#289](src/contentScript/lingoCard.tsx#L289) 传递 `x` [src/contentScript/lingoCard.tsx#52](src/contentScript/lingoCard.tsx#L52)
   8.4 在 [src/contentScript/lingoCard.tsx#290](src/contentScript/lingoCard.tsx#L290) 传递 `y` [src/contentScript/lingoCard.tsx#52](src/contentScript/lingoCard.tsx#L52)
   8.5 在 [src/contentScript/lingoCard.tsx#291](src/contentScript/lingoCard.tsx#L291) 传递 `show` [src/contentScript/lingoCard.tsx#51](src/contentScript/lingoCard.tsx#L51)
   8.6 在 [src/contentScript/lingoCard.tsx#292](src/contentScript/lingoCard.tsx#L292) 传递 `onClick` [src/contentScript/lingoCard.tsx#220](src/contentScript/lingoCard.tsx#L220)

## 9. 在 [src/contentScript/lingoCard.tsx#308](src/contentScript/lingoCard.tsx#L308) 调用 `CardDragableWrapper` [src/components/CardDragableWrapper.tsx](src/components/CardDragableWrapper.tsx)
   9.1 在 [src/contentScript/lingoCard.tsx#309](src/contentScript/lingoCard.tsx#L309) 传递 `x` [src/contentScript/lingoCard.tsx#56](src/contentScript/lingoCard.tsx#L56)
   9.2 在 [src/contentScript/lingoCard.tsx#310](src/contentScript/lingoCard.tsx#L310) 传递 `y` [src/contentScript/lingoCard.tsx#56](src/contentScript/lingoCard.tsx#L56)
   9.3 在 [src/contentScript/lingoCard.tsx#311](src/contentScript/lingoCard.tsx#L311) 传递 `onClose` [src/contentScript/lingoCard.tsx#226](src/contentScript/lingoCard.tsx#L226)
   9.4 在 [src/contentScript/lingoCard.tsx#312](src/contentScript/lingoCard.tsx#L312) 传递 `onmouseenter` [src/contentScript/lingoCard.tsx#131](src/contentScript/lingoCard.tsx#L131)
   9.5 在 [src/contentScript/lingoCard.tsx#314](src/contentScript/lingoCard.tsx#L314) 调用 `SearchResult` [src/components/SearchResult.tsx](src/components/SearchResult.tsx)
      9.5.1 在 [src/contentScript/lingoCard.tsx#314](src/contentScript/lingoCard.tsx#L314) 传递 `searchText` [src/contentScript/lingoCard.tsx#62](src/contentScript/lingoCard.tsx#L62)

## 10. 在 [src/contentScript/lingoCard.tsx#318](src/contentScript/lingoCard.tsx#L318) 调用 `ToastContainer` [src/components/Toast.tsx](src/components/Toast.tsx)