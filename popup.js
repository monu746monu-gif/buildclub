const showWidgetButton = document.getElementById("show-widget");
const statusText = document.getElementById("status");

function isBuildClubUrl(url) {
  try {
    return /(^|\.)buildclub\.ai$/i.test(new URL(url).hostname);
  } catch (_error) {
    return false;
  }
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function sendToPage(message) {
  const tab = await getActiveTab();
  if (!tab?.id) {
    throw new Error("No active tab found.");
  }

  if (!tab.url || tab.url.startsWith("chrome://") || tab.url.startsWith("edge://") || tab.url.startsWith("about:")) {
    throw new Error("Extensions cannot run on browser system pages.");
  }

  if (!isBuildClubUrl(tab.url)) {
    throw new Error("Kito only runs on BuildClub course pages.");
  }

  try {
    return await chrome.tabs.sendMessage(tab.id, message);
  } catch (error) {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });

    return chrome.tabs.sendMessage(tab.id, message);
  }
}

async function showWidget() {
  try {
    await sendToPage({ type: "SHOW_BUILDCLUB_WIDGET" });
    statusText.textContent = "BuildClub helper added to the page.";
  } catch (error) {
    statusText.textContent = "Open a BuildClub course page, then try again.";
  }
}

showWidget();

showWidgetButton.addEventListener("click", showWidget);
