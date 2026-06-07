const MESSAGE_TYPES = {
  OPEN_KITO_PANEL: "OPEN_KITO_PANEL",
  OPEN_SIDE_PANEL_TAB: "OPEN_SIDE_PANEL_TAB",
  SAVE_STUCK_CONTEXT: "SAVE_STUCK_CONTEXT"
};

async function storageSet(value) {
  return chrome.storage.local.set(value);
}

chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel?.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || typeof message.type !== "string") return false;

  if (message.type === MESSAGE_TYPES.SAVE_STUCK_CONTEXT) {
    storageSet({ latestStuckContext: message.context })
      .then(() => sendResponse({ saved: true }))
      .catch((error) => sendResponse({ saved: false, error: error?.message }));
    return true;
  }

  if (message.type === MESSAGE_TYPES.OPEN_KITO_PANEL || message.type === MESSAGE_TYPES.OPEN_SIDE_PANEL_TAB) {
    const tabId = sender.tab?.id;
    const requestedTab = message.tab || "Explain";
    storageSet({ latestRequestedSidePanelTab: requestedTab })
      .then(async () => {
        if (!chrome.sidePanel?.open || !tabId) {
          sendResponse({ opened: false, reason: "side-panel-unavailable" });
          return;
        }

        try {
          await chrome.sidePanel.open({ tabId });
          sendResponse({ opened: true });
        } catch (error) {
          sendResponse({ opened: false, reason: "open-failed", error: error?.message });
        }
      })
      .catch((error) => sendResponse({ opened: false, reason: "storage-failed", error: error?.message }));
    return true;
  }

  return false;
});
