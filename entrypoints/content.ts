import { extractReadableText, getScrollProgress } from "../src/lib/pageExtractor";
import { MESSAGE_TYPES, type PageContext } from "../src/lib/messages";

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    const bubbleId = "catnooish-quest-bubble";
    const translateId = "catnooish-translate-button";
    const modalId = "catnooish-translate-modal";
    let pageText = extractReadableText();
    let progress = getScrollProgress();
    let completedAnnounced = false;

    const context = (): PageContext => ({
      url: location.href,
      title: document.title || "BuildClub Claude Code lesson",
      pageText,
      readingProgress: progress
    });

    const send = (type: string, payload: PageContext & Record<string, unknown> = context()) => {
      chrome.runtime.sendMessage({ type, payload }).catch(() => undefined);
    };

    function styleElement(el: HTMLElement, styles: Record<string, string>) {
      Object.assign(el.style, styles);
    }

    function ensureBubble() {
      if (document.getElementById(bubbleId)) return;
      const bubble = document.createElement("div");
      bubble.id = bubbleId;
      styleElement(bubble, {
        position: "fixed",
        right: "18px",
        bottom: "18px",
        zIndex: "2147483647",
        width: "310px",
        maxWidth: "calc(100vw - 28px)",
        background: "#0f172a",
        color: "#f8fafc",
        border: "1px solid rgba(148, 163, 184, 0.35)",
        borderRadius: "22px",
        boxShadow: "0 24px 70px rgba(15, 23, 42, 0.34)",
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "14px"
      });
      bubble.innerHTML = `
        <div style="display:flex;gap:12px;align-items:flex-start">
          <div style="width:54px;height:54px;border-radius:18px;background:linear-gradient(135deg,#bbf7d0,#38bdf8);display:grid;place-items:center;font-size:30px;box-shadow:0 10px 30px rgba(34,197,94,.35)">😼</div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:800;font-size:14px;letter-spacing:.02em;color:#86efac">Catnooish Quest</div>
            <div id="catnooish-bubble-text" style="font-size:14px;line-height:1.35;margin-top:4px"></div>
            <div style="height:8px;background:#1e293b;border-radius:999px;margin:10px 0 12px;overflow:hidden">
              <div id="catnooish-progress-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#22c55e,#38bdf8);border-radius:999px"></div>
            </div>
            <div style="display:flex;gap:7px;flex-wrap:wrap">
              <button id="catnooish-start" style="border:0;border-radius:999px;background:#22c55e;color:#052e16;font-weight:800;padding:8px 11px;cursor:pointer">Start Building</button>
              <button id="catnooish-translate" style="border:1px solid #334155;border-radius:999px;background:#111827;color:#e2e8f0;font-weight:700;padding:8px 10px;cursor:pointer">Translate Page</button>
              <button id="catnooish-later" style="border:0;border-radius:999px;background:transparent;color:#94a3b8;font-weight:700;padding:8px;cursor:pointer">Later</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(bubble);
      bubble.querySelector("#catnooish-start")?.addEventListener("click", () => send(MESSAGE_TYPES.START_BUILDING_CLICKED));
      bubble.querySelector("#catnooish-translate")?.addEventListener("click", () => openTranslateModal());
      bubble.querySelector("#catnooish-later")?.addEventListener("click", () => bubble.remove());
      updateBubble();
    }

    function updateBubble() {
      const text = document.getElementById("catnooish-bubble-text");
      const bar = document.getElementById("catnooish-progress-bar");
      if (text) {
        text.textContent =
          progress >= 90
            ? "You studied so much today 😼 Why not build something from this lesson?"
            : `BuildClub Claude Code lesson progress: ${progress}%`;
      }
      if (bar) bar.style.width = `${progress}%`;
    }

    function ensureTranslateButton() {
      if (document.getElementById(translateId)) return;
      const button = document.createElement("button");
      button.id = translateId;
      button.textContent = "🌍 Translate";
      styleElement(button, {
        position: "fixed",
        left: "18px",
        bottom: "18px",
        zIndex: "2147483647",
        border: "0",
        borderRadius: "999px",
        background: "#ffffff",
        color: "#0f172a",
        boxShadow: "0 12px 40px rgba(15,23,42,.24)",
        padding: "10px 14px",
        fontWeight: "800",
        cursor: "pointer",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
      });
      button.addEventListener("click", () => openTranslateModal());
      document.body.appendChild(button);
    }

    function openTranslateModal() {
      document.getElementById(modalId)?.remove();
      const modal = document.createElement("div");
      modal.id = modalId;
      styleElement(modal, {
        position: "fixed",
        left: "18px",
        bottom: "66px",
        zIndex: "2147483647",
        background: "#ffffff",
        color: "#0f172a",
        borderRadius: "18px",
        boxShadow: "0 20px 60px rgba(15,23,42,.26)",
        padding: "14px",
        width: "260px",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
      });
      const languages = ["Hindi", "Spanish", "French", "Japanese", "Korean"];
      modal.innerHTML = `
        <div style="font-weight:900;margin-bottom:8px">Explain this lesson in</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${languages
          .map((language) => `<button data-language="${language}" style="border:1px solid #dbeafe;background:#eff6ff;border-radius:12px;padding:8px;font-weight:800;cursor:pointer">${language}</button>`)
          .join("")}</div>
        <input id="catnooish-custom-language" placeholder="Custom language" style="box-sizing:border-box;width:100%;margin-top:9px;border:1px solid #cbd5e1;border-radius:12px;padding:9px" />
        <button id="catnooish-custom-submit" style="margin-top:8px;width:100%;border:0;background:#0f172a;color:#fff;border-radius:12px;padding:9px;font-weight:900;cursor:pointer">Open Translation</button>
      `;
      const choose = (language: string) => send(MESSAGE_TYPES.TRANSLATE_CLICKED, { ...context(), language });
      modal.querySelectorAll<HTMLButtonElement>("[data-language]").forEach((button) => {
        button.addEventListener("click", () => choose(button.dataset.language ?? "Hindi"));
      });
      modal.querySelector("#catnooish-custom-submit")?.addEventListener("click", () => {
        const input = modal.querySelector<HTMLInputElement>("#catnooish-custom-language");
        choose(input?.value.trim() || "Hindi");
      });
      document.body.appendChild(modal);
    }

    function handleScroll() {
      progress = getScrollProgress();
      updateBubble();
      send(MESSAGE_TYPES.READING_PROGRESS_UPDATED);
      if (progress >= 90 && !completedAnnounced) {
        completedAnnounced = true;
        ensureBubble();
        send(MESSAGE_TYPES.LESSON_COMPLETED);
      }
    }

    ensureBubble();
    ensureTranslateButton();
    send(MESSAGE_TYPES.PAGE_TEXT_EXTRACTED);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.setInterval(() => {
      pageText = extractReadableText();
    }, 5000);

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message?.type === MESSAGE_TYPES.GET_PAGE_CONTEXT) {
        pageText = extractReadableText();
        progress = getScrollProgress();
        sendResponse({ type: MESSAGE_TYPES.PAGE_CONTEXT_RESPONSE, payload: context() });
      }
      return true;
    });
  }
});
