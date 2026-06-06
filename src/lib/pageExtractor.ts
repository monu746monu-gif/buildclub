const BLOCKED_SELECTORS = [
  "script",
  "style",
  "noscript",
  "nav",
  "footer",
  "header",
  "aside",
  "[aria-hidden='true']"
];

export function extractReadableText(doc: Document = document): string {
  const candidate = doc.querySelector("main") ?? doc.querySelector("article") ?? doc.body;
  if (!candidate) return "";

  const clone = candidate.cloneNode(true) as HTMLElement;
  BLOCKED_SELECTORS.forEach((selector) => {
    clone.querySelectorAll(selector).forEach((node) => node.remove());
  });

  return clone.textContent?.replace(/\s+/g, " ").trim().slice(0, 14000) ?? "";
}

export function getScrollProgress(win: Window = window, doc: Document = document): number {
  const element = doc.documentElement;
  const scrollTop = win.scrollY || element.scrollTop;
  const maxScroll = Math.max(1, element.scrollHeight - win.innerHeight);
  return Math.min(100, Math.max(0, Math.round((scrollTop / maxScroll) * 100)));
}
