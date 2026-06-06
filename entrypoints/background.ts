import { MESSAGE_TYPES, type ExtensionMessage } from "../src/lib/messages";
import { patchLessonState, setActiveSidePanelTab } from "../src/lib/storage";

export default defineBackground(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => undefined);

  chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender) => {
    const tabId = sender.tab?.id;

    if (
      message.type === MESSAGE_TYPES.PAGE_TEXT_EXTRACTED ||
      message.type === MESSAGE_TYPES.LESSON_COMPLETED ||
      message.type === MESSAGE_TYPES.START_BUILDING_CLICKED ||
      message.type === MESSAGE_TYPES.TRANSLATE_CLICKED
    ) {
      void patchLessonState(message.payload.url, {
        title: message.payload.title,
        pageText: message.payload.pageText,
        readingProgress: message.payload.readingProgress,
        completed: message.type === MESSAGE_TYPES.LESSON_COMPLETED ? true : undefined
      });
    }

    if (message.type === MESSAGE_TYPES.READING_PROGRESS_UPDATED) {
      void patchLessonState(message.payload.url, {
        title: message.payload.title,
        readingProgress: message.payload.readingProgress,
        completed: message.payload.readingProgress >= 90 ? true : undefined
      });
    }

    if (message.type === MESSAGE_TYPES.START_BUILDING_CLICKED && tabId) {
      void setActiveSidePanelTab("build");
      chrome.sidePanel.open({ tabId }).catch(() => undefined);
    }

    if (message.type === MESSAGE_TYPES.TRANSLATE_CLICKED && tabId) {
      void setActiveSidePanelTab("translate");
      chrome.sidePanel.open({ tabId }).catch(() => undefined);
    }
  });
});
