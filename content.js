if (/(^|\.)buildclub\.ai$/i.test(window.location.hostname) && !window.buildClubAcademyHelperLoaded) {
  window.buildClubAcademyHelperLoaded = true;

const originalTextByNode = new Map();
const widgetId = "buildclub-academy-helper";
const courseMemoryKey = "buildclubCourseMemory";
const profileMemoryKey = "_profile";
const stuckHelpBubbleId = "kito-stuck-help-bubble";
const stuckZoneSize = 400;
const sameZonePauseMs = 60000;
const repeatedScrollWindowMs = 20000;
const repeatedScrollDirectionChanges = 4;
const kitoSnoozeMs = 10 * 60 * 1000;
const MESSAGE_TYPES = {
  STUCK_DETECTED: "STUCK_DETECTED",
  TEXT_SELECTED: "TEXT_SELECTED",
  OPEN_KITO_PANEL: "OPEN_KITO_PANEL",
  OPEN_SIDE_PANEL_TAB: "OPEN_SIDE_PANEL_TAB",
  SAVE_STUCK_CONTEXT: "SAVE_STUCK_CONTEXT"
};
let hasShownBuildPrompt = false;
let selectedProjectIdea = "";
let isVoiceEnabled = true;
let activeVoiceUtterance = null;
let currentScrollZone = Math.floor(window.scrollY / stuckZoneSize);
let currentZoneEnteredAt = Date.now();
let lastScrollY = window.scrollY;
let lastScrollDirection = 0;
let scrollDirectionChanges = [];
let lastSelectedText = "";
let latestStuckContext = null;
let latestRequestedSidePanelTab = "Explain";
let sameZoneTimer = null;
let codePauseTimer = null;

const blockedTags = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "IFRAME",
  "SVG",
  "CANVAS",
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "OPTION"
]);

const phraseDictionary = {
  Hindi: {
    "welcome": "स्वागत है",
    "hello": "नमस्ते",
    "about": "के बारे में",
    "contact": "संपर्क",
    "learn": "सीखें",
    "build": "बनाएं",
    "start": "शुरू करें",
    "home": "होम",
    "sign in": "साइन इन",
    "get started": "शुरू करें"
  },
  Spanish: {
    "welcome": "bienvenido",
    "hello": "hola",
    "about": "acerca de",
    "contact": "contacto",
    "learn": "aprender",
    "build": "construir",
    "start": "empezar",
    "home": "inicio",
    "sign in": "iniciar sesión",
    "get started": "comenzar"
  },
  French: {
    "welcome": "bienvenue",
    "hello": "bonjour",
    "about": "à propos",
    "contact": "contact",
    "learn": "apprendre",
    "build": "construire",
    "start": "commencer",
    "home": "accueil",
    "sign in": "se connecter",
    "get started": "commencer"
  },
  Japanese: {
    "welcome": "ようこそ",
    "hello": "こんにちは",
    "about": "概要",
    "contact": "連絡先",
    "learn": "学ぶ",
    "build": "作る",
    "start": "開始",
    "home": "ホーム",
    "sign in": "サインイン",
    "get started": "始める"
  },
  Korean: {
    "welcome": "환영합니다",
    "hello": "안녕하세요",
    "about": "소개",
    "contact": "연락처",
    "learn": "배우기",
    "build": "만들기",
    "start": "시작",
    "home": "홈",
    "sign in": "로그인",
    "get started": "시작하기"
  }
};

const languagePrefix = {
  Hindi: "हिंदी में:",
  Spanish: "En español:",
  French: "En français:",
  Japanese: "日本語:",
  Korean: "한국어:"
};

const supportedLanguages = Object.keys(languagePrefix);

if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

const ideaTemplates = [
  "Build a visual explainer that teaches {topic} with examples and quick checks.",
  "Create a mini tool that helps someone practice {topic} and tracks what they learned.",
  "Make a simple challenge generator where students apply {topic} to real situations."
];

const stopWords = new Set([
  "about",
  "after",
  "again",
  "also",
  "because",
  "before",
  "being",
  "build",
  "course",
  "could",
  "every",
  "from",
  "have",
  "into",
  "learn",
  "lesson",
  "like",
  "make",
  "more",
  "page",
  "project",
  "read",
  "some",
  "that",
  "their",
  "there",
  "these",
  "they",
  "this",
  "what",
  "when",
  "where",
  "which",
  "while",
  "with",
  "would",
  "your"
]);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getPageTextForIdeas() {
  return getVisibleTextNodes()
    .map((node) => node.nodeValue.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .slice(0, 12000);
}

function getLessonTopic() {
  const titleText = document.querySelector("h1, h2")?.textContent?.trim();
  if (titleText && titleText.length <= 90) {
    return titleText;
  }

  const pageTitle = document.title?.trim();
  if (pageTitle) {
    return pageTitle.split(/[|:-]/)[0].trim();
  }

  return "this lesson";
}

function extractKeywords(text) {
  const counts = new Map();
  const words = text
    .toLowerCase()
    .match(/\b[a-z][a-z0-9-]{3,}\b/g) ?? [];

  for (const word of words) {
    if (stopWords.has(word)) continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

function getImportantSentences(text, keywords) {
  const keywordSet = new Set(keywords);
  const seen = new Set();

  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 45 && sentence.length <= 220)
    .map((sentence) => {
      const normalized = sentence.toLowerCase();
      const score = (normalized.match(/\b[a-z][a-z0-9-]{3,}\b/g) ?? [])
        .filter((word) => keywordSet.has(word))
        .length;
      return { sentence, normalized, score };
    })
    .filter(({ normalized }) => {
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ sentence }) => sentence);
}

function getPageReview() {
  const pageText = getPageTextForIdeas();
  const topic = getLessonTopic();
  const keywords = extractKeywords(pageText);
  const sentences = getImportantSentences(pageText, keywords);
  const summary = sentences.slice(0, 3);
  const focusWords = keywords.slice(0, 4);
  const questionTopic = focusWords[0] || topic;
  const firstPoint = sentences[0] || summary[0] || `This page is about ${topic}.`;
  const secondPoint = sentences[1] || summary[1] || `It explains important ideas about ${questionTopic}.`;
  const thirdPoint = sentences[2] || summary[2] || "Use what you learned to make a small project.";

  const questions = [
    {
      prompt: `What is the best summary of "${topic}"?`,
      options: [
        firstPoint,
        "It is only a page to memorize word-for-word.",
        "It is unrelated to anything students can build."
      ],
      correctIndex: 0
    },
    {
      prompt: focusWords.length ? `Which terms were most connected to this lesson?` : "Which point best connects to this lesson?",
      options: [
        focusWords.length ? focusWords.slice(0, 3).join(", ") : secondPoint,
        "Random links, ads, and browser settings",
        "Only the page colors and layout"
      ],
      correctIndex: 0
    },
    {
      prompt: "Which detail should you remember from the page?",
      options: [
        secondPoint,
        "The exact scroll position where you stopped reading",
        "The browser tab count"
      ],
      correctIndex: 0
    },
    {
      prompt: "What is the best next step after learning this?",
      options: [
        thirdPoint,
        "Close the lesson and do nothing with it",
        "Ignore the main concept and pick an unrelated idea"
      ],
      correctIndex: 0
    }
  ];

  return {
    summary: summary.length ? summary : [`This page is about ${topic}.`, "Kito could not find long lesson paragraphs, so use the page title and visible text as your guide."],
    questions
  };
}

function getKeyPoints() {
  const pageText = getPageTextForIdeas();
  const keywords = extractKeywords(pageText);
  const points = getImportantSentences(pageText, keywords).slice(0, 5);

  return points.length ? points : getPageReview().summary;
}

function getProjectIdeas() {
  const pageText = getPageTextForIdeas();
  const topic = getLessonTopic();
  const keywords = extractKeywords(pageText);
  const focus = keywords.length ? `${topic} using ${keywords.slice(0, 3).join(", ")}` : topic;

  return ideaTemplates.map((template) => template.replace("{topic}", focus));
}

function createShareText(idea) {
  return `I just finished learning on BuildClub and I am building: ${idea}`;
}

function getDefaultProfile() {
  return {
    projects: [],
    awardedTier: "none"
  };
}

function getCompletedCourses(memory) {
  return Object.values(memory)
    .filter((record) => record && record.lessons)
    .filter((record) => record.completed || getSortedLessons(record).length >= 3);
}

function getLearningProgress(memory) {
  const courses = Object.values(memory).filter((record) => record && record.lessons);
  const completedCourses = getCompletedCourses(memory);
  const completedLessons = courses.reduce((total, course) => total + getSortedLessons(course).length, 0);
  const profile = memory[profileMemoryKey] ?? getDefaultProfile();
  const projectCount = profile.projects?.length ?? 0;
  const points = completedLessons + completedCourses.length * 5 + projectCount * 3;
  const goldTarget = 30;

  return {
    completedCourses: completedCourses.length,
    completedLessons,
    projectCount,
    points,
    goldTarget,
    goldPercent: Math.min(100, Math.round((points / goldTarget) * 100))
  };
}

function getCardTier(progress) {
  if (progress.points >= progress.goldTarget) return "gold";
  if (progress.points >= 16) return "silver";
  if (progress.completedCourses >= 1 || progress.completedLessons >= 3 || progress.projectCount >= 1) return "bronze";
  return "none";
}

function getTierLabel(tier) {
  return {
    bronze: "Bronze Builder Card",
    silver: "Silver Builder Card",
    gold: "Gold Builder Card"
  }[tier] ?? "Builder Progress Card";
}

function getShareProgressText(progress, tier) {
  return `I earned my ${getTierLabel(tier)} on BuildClub: ${progress.completedLessons} lessons, ${progress.completedCourses} courses, and ${progress.projectCount} projects. Gold progress: ${progress.goldPercent}%.`;
}

function shouldMarkCourseComplete(courseRecord) {
  const pageSignal = `${document.title} ${document.body?.innerText ?? ""}`.toLowerCase();
  return getSortedLessons(courseRecord).length >= 3 || /course complete|completed course|congratulations|certificate|finished the course/.test(pageSignal);
}

function getSpeakableText(container) {
  const message = container.querySelector(".kito-message");
  return message?.textContent?.replace(/\s+/g, " ").trim() ?? "";
}

function getKitoVoice() {
  if (!("speechSynthesis" in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  const preferredNames = [
    "Samantha",
    "Google UK English Female",
    "Google US English",
    "Microsoft Aria",
    "Microsoft Jenny",
    "Microsoft Zira",
    "Karen",
    "Moira",
    "Tessa"
  ];

  return preferredNames
    .map((name) => voices.find((voice) => voice.name.toLowerCase().includes(name.toLowerCase())))
    .find(Boolean) ?? voices.find((voice) => voice.lang?.toLowerCase().startsWith("en")) ?? null;
}

function speakKitoText(text) {
  if (!isVoiceEnabled || !text || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();
  activeVoiceUtterance = new SpeechSynthesisUtterance(text);
  const voice = getKitoVoice();
  if (voice) {
    activeVoiceUtterance.voice = voice;
    activeVoiceUtterance.lang = voice.lang;
  } else {
    activeVoiceUtterance.lang = "en-US";
  }
  activeVoiceUtterance.rate = 0.9;
  activeVoiceUtterance.pitch = 1.22;
  activeVoiceUtterance.volume = 1;
  window.speechSynthesis.speak(activeVoiceUtterance);
}

function setBubbleContent(widget, html, { speak = true } = {}) {
  const bubble = widget.querySelector(".kito-bubble");
  if (!bubble) return;

  widget.classList.remove("message-hidden");
  bubble.innerHTML = html;
  bubble.querySelector("[data-action='show-quiz']")?.addEventListener("click", () => {
    renderWidgetState(widget, "quiz");
  });
  if (speak) {
    speakKitoText(getSpeakableText(bubble));
  }
}

function updateVoiceButton(widget) {
  const button = widget.querySelector(".kito-voice");
  if (!button) return;

  button.textContent = isVoiceEnabled ? "🔊" : "🔇";
  button.setAttribute("aria-label", isVoiceEnabled ? "Mute Kito voice" : "Unmute Kito voice");
}

function cleanPdfText(text) {
  return String(text)
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapePdfText(text) {
  return cleanPdfText(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapPdfText(text, maxChars) {
  const words = cleanPdfText(text).split(" ");
  const lines = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function pdfText(lines, x, y, size = 11, color = "0.12 0.24 0.08") {
  const safeLines = Array.isArray(lines) ? lines : [lines];
  const lineHeight = size + 4;
  const commands = [`BT ${color} rg /F1 ${size} Tf ${x} ${y} Td`];

  safeLines.forEach((line, index) => {
    if (index > 0) commands.push(`0 -${lineHeight} Td`);
    commands.push(`(${escapePdfText(line)}) Tj`);
  });

  commands.push("ET");
  return commands.join("\n");
}

function pdfBox(x, y, width, height, fill = "0.93 0.98 0.78", stroke = "0.37 0.59 0.14", radius = 10) {
  return [
    `${fill} rg ${stroke} RG 1.8 w ${x + radius} ${y} m ${x + width - radius} ${y} l ${x + width} ${y + radius} l ${x + width} ${y + height - radius} l ${x + width - radius} ${y + height} l ${x + radius} ${y + height} l ${x} ${y + height - radius} l ${x} ${y + radius} l h B`,
    `1 1 1 rg ${stroke} RG 0.8 w ${x + 6} ${y + 6} ${width - 12} ${height - 12} re S`
  ].join("\n");
}

function pdfLine(x1, y1, x2, y2, color = "0.37 0.59 0.14") {
  return `${color} RG 1.4 w ${x1} ${y1} m ${x2} ${y2} l S`;
}

function pdfArrowDown(x, yTop, yBottom) {
  return [
    pdfLine(x, yTop, x, yBottom),
    `0.37 0.59 0.14 rg ${x - 5} ${yBottom + 7} m ${x + 5} ${yBottom + 7} l ${x} ${yBottom - 2} l f`
  ].join("\n");
}

function buildPdf(pages) {
  const objects = [];
  const addObject = (body) => {
    objects.push(body);
    return objects.length;
  };

  addObject("<< /Type /Catalog /Pages 2 0 R >>");
  addObject("");
  const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const pageIds = [];

  pages.forEach((content) => {
    const contentId = addObject(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    const pageId = addObject(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  });

  objects[1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return pdf;
}

function buildCurrentLessonRecord() {
  const review = getPageReview();
  return {
    title: getLessonTitle(),
    url: window.location.href,
    completedAt: new Date().toISOString(),
    summary: review.summary,
    questions: review.questions,
    ideas: getProjectIdeas()
  };
}

function createCourseNotesPdfData(courseRecord) {
  const course = courseRecord ?? {
    title: getCourseInfo().title,
    lessons: {
      [getLessonKey()]: buildCurrentLessonRecord()
    }
  };
  const lessons = getSortedLessons(course);
  const page = [];
  const detailPages = [];

  page.push("0.98 1 0.93 rg 0 0 612 792 re f");
  page.push(pdfText("BuildClub Course Notes", 48, 742, 22, "0.04 0.11 0.07"));
  page.push(pdfText(wrapPdfText(course.title, 58), 48, 714, 13, "0.18 0.36 0.09"));
  page.push(pdfText(`${lessons.length} completed ${lessons.length === 1 ? "lesson" : "lessons"}`, 48, 692, 10, "0.30 0.42 0.18"));
  page.push(pdfText("Learning flow", 48, 662, 13, "0.04 0.11 0.07"));

  const flowLessons = lessons.slice(0, 7);
  let y = 596;
  flowLessons.forEach((lesson, index) => {
    const lines = wrapPdfText(lesson.title, 48).slice(0, 2);
    const boxHeight = 54;

    page.push(pdfBox(84, y, 444, boxHeight, "0.93 0.98 0.78", "0.37 0.59 0.14"));
    page.push(pdfText(`${index + 1}`, 103, y + 32, 16, "0.04 0.11 0.07"));
    page.push(pdfText(lines, 132, y + 34, 12, "0.12 0.24 0.08"));
    page.push(pdfText(new Date(lesson.completedAt).toLocaleDateString(), 132, y + 13, 9, "0.30 0.42 0.18"));

    if (index < flowLessons.length - 1) {
      page.push(pdfArrowDown(306, y - 8, y - 28));
    }

    y -= boxHeight + 36;
  });

  if (lessons.length > flowLessons.length) {
    page.push(pdfText(`+ ${lessons.length - flowLessons.length} more lessons in detailed notes`, 210, 72, 10, "0.30 0.42 0.18"));
  }

  lessons.forEach((lesson, lessonIndex) => {
    const detail = [];
    detail.push("0.98 1 0.93 rg 0 0 612 792 re f");
    detail.push(pdfText(`Lesson ${lessonIndex + 1}`, 48, 742, 13, "0.30 0.42 0.18"));
    detail.push(pdfText(wrapPdfText(lesson.title, 58), 48, 718, 18, "0.04 0.11 0.07"));
    detail.push(pdfText("Key points", 48, 672, 12, "0.04 0.11 0.07"));

    let noteY = 608;
    (lesson.summary ?? []).slice(0, 5).forEach((point, pointIndex) => {
      const lines = wrapPdfText(point, 60).slice(0, 4);
      const boxHeight = Math.max(58, 24 + lines.length * 14);
      detail.push(pdfBox(54, noteY, 504, boxHeight, pointIndex % 2 ? "0.96 0.99 0.86" : "0.92 0.98 0.78", "0.37 0.59 0.14"));
      detail.push(pdfText(`Point ${pointIndex + 1}`, 74, noteY + boxHeight - 20, 10, "0.30 0.42 0.18"));
      detail.push(pdfText(lines, 74, noteY + boxHeight - 38, 11, "0.12 0.24 0.08"));
      noteY -= boxHeight + 18;
    });

    const idea = lesson.ideas?.[0];
    if (idea) {
      const ideaLines = wrapPdfText(`Next build: ${idea}`, 68).slice(0, 3);
      detail.push(pdfBox(54, 58, 504, 64, "0.90 0.96 0.76", "0.22 0.44 0.10"));
      detail.push(pdfText(ideaLines, 74, 94, 11, "0.12 0.24 0.08"));
    }

    detailPages.push(detail.join("\n"));
  });

  return buildPdf([page.join("\n"), ...detailPages]);
}

function triggerPdfDownload(pdf, filenameBase) {
  const filename = `${slugToTitle(filenameBase).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "buildclub-notes"}.pdf`;
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function downloadNotesPdf() {
  const courseRecord = hasShownBuildPrompt ? await saveCompletedLesson() : await getCurrentCourseRecord();
  const fallbackRecord = courseRecord ?? {
    title: getCourseInfo().title,
    lessons: {
      [getLessonKey()]: buildCurrentLessonRecord()
    }
  };
  triggerPdfDownload(createCourseNotesPdfData(fallbackRecord), `${fallbackRecord.title}-notes`);
}

function storageGet(key) {
  return new Promise((resolve) => {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      resolve({});
      return;
    }

    chrome.storage.local.get(key, resolve);
  });
}

function storageSet(value) {
  return new Promise((resolve) => {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      resolve();
      return;
    }

    chrome.storage.local.set(value, resolve);
  });
}

async function sendRuntimeMessage(message) {
  if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
    return null;
  }

  try {
    return await chrome.runtime.sendMessage(message);
  } catch (_error) {
    return null;
  }
}

function getStuckSectionKey(context) {
  const headingKey = context.nearestHeading || "no-heading";
  const zoneKey = Math.floor(context.scrollY / stuckZoneSize);
  return `${context.url}::${headingKey}::${zoneKey}`;
}

async function saveStuckContext(context) {
  latestStuckContext = context;
  const stored = await storageGet(["stuckHistory"]);
  const stuckHistory = stored.stuckHistory || {};
  const urlHistory = stuckHistory[context.url] || [];
  const nextHistory = {
    ...stuckHistory,
    [context.url]: [context, ...urlHistory].slice(0, 20)
  };

  await storageSet({
    latestStuckContext: context,
    stuckHistory: nextHistory
  });
  await sendRuntimeMessage({ type: MESSAGE_TYPES.SAVE_STUCK_CONTEXT, context });
}

async function isStuckInteractionAllowed(context) {
  const stored = await storageGet(["kitoSnoozeUntil", "dismissedSectionKeys"]);
  if ((stored.kitoSnoozeUntil || 0) > Date.now()) {
    return false;
  }

  const dismissedKeys = new Set(stored.dismissedSectionKeys || []);
  return !dismissedKeys.has(getStuckSectionKey(context));
}

function getVisibleElementNearViewportCenter() {
  const x = Math.max(12, Math.min(window.innerWidth - 12, Math.floor(window.innerWidth / 2)));
  const sampleYs = [
    Math.floor(window.innerHeight * 0.35),
    Math.floor(window.innerHeight * 0.5),
    Math.floor(window.innerHeight * 0.65)
  ];

  for (const y of sampleYs) {
    const element = document.elementFromPoint(x, y);
    if (element && !element.closest(`#${widgetId}, #${stuckHelpBubbleId}`)) {
      return element;
    }
  }

  return document.body;
}

function getNearestHeadingFromElement(element) {
  let current = element;
  while (current && current !== document.body) {
    const previousHeading = findPreviousHeading(current);
    if (previousHeading) return previousHeading.textContent.trim();
    current = current.parentElement;
  }

  const firstHeading = document.querySelector("h1, h2, h3");
  return firstHeading?.textContent?.trim() || "";
}

function findPreviousHeading(element) {
  let current = element;
  while (current) {
    let sibling = current.previousElementSibling;
    while (sibling) {
      if (/^H[1-6]$/.test(sibling.tagName) && sibling.textContent.trim()) {
        return sibling;
      }

      const nestedHeading = sibling.querySelector?.("h1, h2, h3, h4, h5, h6");
      if (nestedHeading?.textContent?.trim()) {
        return nestedHeading;
      }
      sibling = sibling.previousElementSibling;
    }
    current = current.parentElement;
  }

  return null;
}

function getNearbyTextFromElement(element) {
  const container = element?.closest?.("article, section, main, [data-mdx-content], [class*='content'], [class*='lesson'], [class*='course']") || element || document.body;
  return (container.textContent || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1400);
}

function hasVisibleCodeBlockNearViewport() {
  const codeSelectors = "pre, code, .code, [class*='code'], [class*='Code']";
  const viewportTop = window.scrollY;
  const viewportBottom = viewportTop + window.innerHeight;

  return [...document.querySelectorAll(codeSelectors)].some((element) => {
    if (element.closest(`#${widgetId}, #${stuckHelpBubbleId}`)) return false;
    const rect = element.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const bottom = rect.bottom + window.scrollY;
    return bottom >= viewportTop - 120 && top <= viewportBottom + 120 && rect.width > 0 && rect.height > 0;
  });
}

function buildStuckContext(triggerReason, selectedText = "") {
  const visibleElement = getVisibleElementNearViewportCenter();
  const hasCodeBlock = hasVisibleCodeBlockNearViewport();
  const nearbyText = getNearbyTextFromElement(visibleElement);
  const nearestHeading = getNearestHeadingFromElement(visibleElement);

  return {
    url: window.location.href,
    title: document.title || "",
    selectedText: selectedText || undefined,
    nearbyText,
    nearestHeading: nearestHeading || undefined,
    hasCodeBlock,
    triggerReason,
    scrollY: window.scrollY,
    timestamp: Date.now()
  };
}

function injectStuckHelpBubbleStyle() {
  if (document.getElementById(`${stuckHelpBubbleId}-style`)) return;

  const style = document.createElement("style");
  style.id = `${stuckHelpBubbleId}-style`;
  style.textContent = `
    #${stuckHelpBubbleId} {
      position: fixed;
      right: 24px;
      bottom: 140px;
      z-index: 2147483647;
      width: 260px;
      border: 1px solid rgba(95, 151, 35, 0.46);
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.94);
      color: #102014;
      box-shadow: 0 18px 44px rgba(16, 32, 20, 0.22);
      padding: 12px;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      pointer-events: auto;
      animation: kito-stuck-pop 180ms ease-out;
    }

    #${stuckHelpBubbleId} .kito-stuck-title {
      font-size: 15px;
      font-weight: 950;
      line-height: 1.2;
    }

    #${stuckHelpBubbleId} .kito-stuck-hint {
      margin-top: 4px;
      color: #536746;
      font-size: 11px;
      font-weight: 800;
      line-height: 1.35;
    }

    #${stuckHelpBubbleId} .kito-stuck-actions {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 7px;
      margin-top: 10px;
    }

    #${stuckHelpBubbleId} button {
      min-width: 0;
      border: 0;
      border-radius: 8px;
      background: #102014;
      color: #c8ea5a;
      padding: 8px 7px;
      font: inherit;
      font-size: 11px;
      font-weight: 950;
      line-height: 1.1;
      cursor: pointer;
    }

    #${stuckHelpBubbleId} button[data-action="kito-ignore"] {
      border: 1px solid rgba(95, 151, 35, 0.34);
      background: #f5f8ed;
      color: #28441e;
    }

    @media (max-width: 520px) {
      #${stuckHelpBubbleId} {
        right: 12px;
        bottom: 122px;
        width: min(232px, calc(100vw - 24px));
        padding: 10px;
      }
    }

    @keyframes kito-stuck-pop {
      from { opacity: 0; transform: translateY(8px) scale(.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `;
  document.head.appendChild(style);
}

function showOpenKitoFallbackBubble() {
  injectStuckHelpBubbleStyle();
  const bubble = document.getElementById(stuckHelpBubbleId) || document.createElement("div");
  bubble.id = stuckHelpBubbleId;
  bubble.innerHTML = `
    <div class="kito-stuck-title">Click Kito to open help.</div>
    <div class="kito-stuck-hint">Chrome wants a direct click before opening the side panel.</div>
  `;
  if (!bubble.parentElement) document.body.appendChild(bubble);
}

async function openKitoPanel(tab) {
  latestRequestedSidePanelTab = tab;
  await storageSet({ latestRequestedSidePanelTab: tab });
  const response = await sendRuntimeMessage({ type: MESSAGE_TYPES.OPEN_SIDE_PANEL_TAB, tab });
  if (!response?.opened) {
    showOpenKitoFallbackBubble();
  }
}

async function handleStuckBubbleAction(action) {
  if (!latestStuckContext) return;

  if (action === "kito-ignore") {
    const stored = await storageGet(["dismissedSectionKeys"]);
    const dismissedSectionKeys = new Set(stored.dismissedSectionKeys || []);
    dismissedSectionKeys.add(getStuckSectionKey(latestStuckContext));
    await storageSet({
      kitoSnoozeUntil: Date.now() + kitoSnoozeMs,
      dismissedSectionKeys: [...dismissedSectionKeys]
    });
    document.getElementById(stuckHelpBubbleId)?.remove();
    return;
  }

  const tabByAction = {
    "kito-explain": "Explain",
    "kito-docs": "Official Docs",
    "kito-prompt": "Claude Prompt"
  };
  const tab = tabByAction[action] || "Explain";
  await saveStuckContext(latestStuckContext);
  await openKitoPanel(tab);
}

function showStuckHelpBubble(context) {
  injectStuckHelpBubbleStyle();
  let bubble = document.getElementById(stuckHelpBubbleId);
  if (!bubble) {
    bubble = document.createElement("div");
    bubble.id = stuckHelpBubbleId;
    document.body.appendChild(bubble);
  }

  bubble.innerHTML = `
    <div class="kito-stuck-title">Need help here?</div>
    <div class="kito-stuck-hint">${escapeHtml(context.nearestHeading || "Kito noticed this section might need a closer look.")}</div>
    <div class="kito-stuck-actions">
      <button type="button" data-action="kito-explain">Explain</button>
      <button type="button" data-action="kito-docs">Official Docs</button>
      <button type="button" data-action="kito-prompt">Claude Prompt</button>
      <button type="button" data-action="kito-ignore">Ignore</button>
    </div>
  `;

  bubble.querySelectorAll("button[data-action]").forEach((button) => {
    button.addEventListener("click", () => handleStuckBubbleAction(button.dataset.action));
  });
}

async function triggerStuckDetected(triggerReason, selectedText = "") {
  const context = buildStuckContext(triggerReason, selectedText);
  const allowed = await isStuckInteractionAllowed(context);
  if (!allowed) return;

  await saveStuckContext(context);
  showStuckHelpBubble(context);
}

function resetSameZoneTimer() {
  if (sameZoneTimer) {
    window.clearTimeout(sameZoneTimer);
  }

  sameZoneTimer = window.setTimeout(() => {
    triggerStuckDetected("same-section-pause");
  }, sameZonePauseMs);
}

function resetCodePauseTimer() {
  if (codePauseTimer) {
    window.clearTimeout(codePauseTimer);
  }

  if (!hasVisibleCodeBlockNearViewport()) return;

  codePauseTimer = window.setTimeout(() => {
    if (hasVisibleCodeBlockNearViewport()) {
      triggerStuckDetected("code-block-pause");
    }
  }, sameZonePauseMs);
}

function slugToTitle(value) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getCourseInfo() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  const courseIndex = parts.findIndex((part) => /^(course|courses|academy|class|classes)$/i.test(part));
  const courseSlug = courseIndex >= 0 && parts[courseIndex + 1] ? parts[courseIndex + 1] : parts[0] || "buildclub-course";
  const titleCandidate = document.querySelector("[data-course-title], .course-title, h1")?.textContent?.trim();
  const title = titleCandidate && titleCandidate.length <= 90 ? titleCandidate : slugToTitle(courseSlug);

  return {
    key: `${window.location.hostname}/${courseSlug}`.toLowerCase(),
    title,
    slug: courseSlug
  };
}

function getLessonKey() {
  return `${window.location.hostname}${window.location.pathname}`.toLowerCase();
}

function getLessonTitle() {
  return getLessonTopic();
}

async function getCourseMemory() {
  const stored = await storageGet(courseMemoryKey);
  return stored[courseMemoryKey] ?? {};
}

async function saveCompletedLesson() {
  const memory = await getCourseMemory();
  const course = getCourseInfo();
  const review = getPageReview();
  const ideas = getProjectIdeas();
  const lessonKey = getLessonKey();
  const courseRecord = memory[course.key] ?? {
    title: course.title,
    slug: course.slug,
    lessons: {}
  };

  courseRecord.title = course.title || courseRecord.title;
  courseRecord.slug = course.slug;
  courseRecord.lessons[lessonKey] = {
    title: getLessonTitle(),
    url: window.location.href,
    completedAt: new Date().toISOString(),
    summary: review.summary,
    questions: review.questions,
    ideas
  };

  const lessonEntries = Object.entries(courseRecord.lessons)
    .sort((a, b) => new Date(a[1].completedAt) - new Date(b[1].completedAt))
    .slice(-30);

  courseRecord.lessons = Object.fromEntries(lessonEntries);
  courseRecord.completed = shouldMarkCourseComplete(courseRecord);
  courseRecord.lastStudiedAt = new Date().toISOString();
  memory[course.key] = courseRecord;
  await storageSet({ [courseMemoryKey]: memory });
  return courseRecord;
}

async function saveCompletedLessonAndCheckCard() {
  const memoryBefore = await getCourseMemory();
  const profileBefore = memoryBefore[profileMemoryKey] ?? getDefaultProfile();
  const previousTier = profileBefore.awardedTier ?? "none";
  const courseRecord = await saveCompletedLesson();
  const memoryAfter = await getCourseMemory();
  const profileAfter = memoryAfter[profileMemoryKey] ?? getDefaultProfile();
  const progress = getLearningProgress(memoryAfter);
  const tier = getCardTier(progress);

  if (tier !== "none" && tier !== previousTier) {
    profileAfter.awardedTier = tier;
    memoryAfter[profileMemoryKey] = profileAfter;
    await storageSet({ [courseMemoryKey]: memoryAfter });
    return { courseRecord, awardedTier: tier, progress };
  }

  return { courseRecord, awardedTier: null, progress };
}

async function saveProjectIdea(idea) {
  const memory = await getCourseMemory();
  const profile = memory[profileMemoryKey] ?? getDefaultProfile();
  const normalizedIdea = idea.trim();

  if (normalizedIdea && !profile.projects?.some((project) => project.idea === normalizedIdea)) {
    profile.projects = [
      ...(profile.projects ?? []),
      {
        idea: normalizedIdea,
        courseTitle: getCourseInfo().title,
        createdAt: new Date().toISOString()
      }
    ].slice(-50);
  }

  memory[profileMemoryKey] = profile;
  await storageSet({ [courseMemoryKey]: memory });
  return getLearningProgress(memory);
}

function removeProgressCardModal() {
  document.getElementById("buildclub-progress-card-modal")?.remove();
}

function showProgressCardModal({ tier, progress }) {
  removeProgressCardModal();
  const label = getTierLabel(tier);
  const shareText = getShareProgressText(progress, tier);
  const hasAward = tier !== "none";
  const tierTheme = {
    none: {
      className: "tier-none",
      code: "PROGRESS",
      emoji: "✦"
    },
    bronze: {
      className: "tier-bronze",
      code: "BRONZE",
      emoji: "◆"
    },
    silver: {
      className: "tier-silver",
      code: "SILVER",
      emoji: "◇"
    },
    gold: {
      className: "tier-gold",
      code: "GOLD",
      emoji: "★"
    }
  }[tier] ?? {
    className: "tier-none",
    code: "PROGRESS",
    emoji: "✦"
  };
  const modal = document.createElement("div");
  modal.id = "buildclub-progress-card-modal";
  modal.innerHTML = `
    <div class="bc-card-backdrop" data-card-close="true"></div>
    <section class="bc-earned-card ${tierTheme.className}" role="dialog" aria-modal="true" aria-label="${escapeHtml(label)}">
      <button class="bc-card-close" data-card-close="true" aria-label="Close card">×</button>
      <div class="bc-card-pattern"></div>
      <div class="bc-card-shine"></div>
      <div class="bc-card-topline">
        <div>
          <div class="bc-card-kicker">${hasAward ? "Congrats, you got card" : "Your progress card"}</div>
          <h2>${escapeHtml(label)}</h2>
        </div>
        <div class="bc-tier-badge">
          <span>${tierTheme.emoji}</span>
          <strong>${tierTheme.code}</strong>
        </div>
      </div>
      <p class="bc-card-copy">Kito analyzed your BuildClub progress. Keep completing courses and projects to move closer to the Gold Card.</p>
      <div class="bc-card-stats">
        <div><span>Lessons</span><strong>${progress.completedLessons}</strong></div>
        <div><span>Courses</span><strong>${progress.completedCourses}</strong></div>
        <div><span>Projects</span><strong>${progress.projectCount}</strong></div>
      </div>
      <div class="bc-progress-row">
        <span>Gold Card</span>
        <strong>${progress.goldPercent}%</strong>
      </div>
      <div class="bc-gold-progress" aria-label="Gold card progress">
        <span style="width: ${progress.goldPercent}%"></span>
      </div>
      <div class="bc-card-footer">
        <span>BuildClub Builder Pass</span>
        <span>#${String(progress.completedLessons + progress.projectCount + 1).padStart(4, "0")}</span>
      </div>
      <button class="bc-card-share" data-share-progress="${escapeHtml(shareText)}">Share progress</button>
      <div class="bc-card-status" aria-live="polite"></div>
    </section>
  `;

  const style = document.createElement("style");
  style.textContent = `
    #buildclub-progress-card-modal {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: grid;
      place-items: center;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #102014;
    }

    #buildclub-progress-card-modal .bc-card-backdrop {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 50% 30%, rgba(200, 234, 90, 0.22), transparent 34%),
        rgba(8, 18, 11, 0.58);
      backdrop-filter: blur(12px);
    }

    #buildclub-progress-card-modal .bc-earned-card {
      position: relative;
      width: min(460px, calc(100vw - 32px));
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.52);
      border-radius: 24px;
      background:
        linear-gradient(145deg, rgba(255, 255, 255, 0.92), rgba(227, 249, 151, 0.82)),
        #f8ffe8;
      padding: 26px;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.82),
        0 30px 90px rgba(0, 0, 0, 0.34);
    }

    #buildclub-progress-card-modal .bc-earned-card.tier-bronze {
      background:
        linear-gradient(145deg, rgba(255, 255, 255, 0.92), rgba(224, 171, 103, 0.36)),
        #fff6e9;
    }

    #buildclub-progress-card-modal .bc-earned-card.tier-silver {
      background:
        linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(179, 198, 202, 0.48)),
        #f5fbfc;
    }

    #buildclub-progress-card-modal .bc-earned-card.tier-gold {
      background:
        linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(249, 211, 88, 0.58)),
        #fff7cb;
    }

    #buildclub-progress-card-modal .bc-card-pattern {
      position: absolute;
      inset: 0;
      opacity: 0.42;
      background-image:
        radial-gradient(circle at 24px 24px, rgba(16, 32, 20, 0.12) 2px, transparent 2px),
        linear-gradient(135deg, transparent 0 42%, rgba(255, 255, 255, 0.34) 42% 58%, transparent 58%);
      background-size: 34px 34px, 100% 100%;
      pointer-events: none;
    }

    #buildclub-progress-card-modal .bc-card-shine {
      position: absolute;
      inset: -90px -70px auto auto;
      width: 240px;
      height: 260px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.58);
      filter: blur(4px);
    }

    #buildclub-progress-card-modal .bc-card-close {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 1;
      width: 30px;
      height: 30px;
      border: 0;
      border-radius: 999px;
      background: #102014;
      color: #c8ea5a;
      cursor: pointer;
      font-size: 20px;
    }

    #buildclub-progress-card-modal .bc-card-topline {
      position: relative;
      display: flex;
      gap: 18px;
      align-items: flex-start;
      justify-content: space-between;
    }

    #buildclub-progress-card-modal .bc-card-kicker {
      position: relative;
      color: #4c6b24;
      font-size: 12px;
      font-weight: 950;
      letter-spacing: 0.9px;
      text-transform: uppercase;
    }

    #buildclub-progress-card-modal h2 {
      position: relative;
      margin: 10px 0 0;
      max-width: 280px;
      color: #102014;
      font-size: 38px;
      line-height: 0.95;
    }

    #buildclub-progress-card-modal .bc-tier-badge {
      display: grid;
      place-items: center;
      min-width: 86px;
      border: 1px solid rgba(16, 32, 20, 0.18);
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.62);
      padding: 12px 10px;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
    }

    #buildclub-progress-card-modal .bc-tier-badge span {
      display: grid;
      place-items: center;
      width: 34px;
      height: 34px;
      border-radius: 999px;
      background: #102014;
      color: #c8ea5a;
      font-size: 18px;
    }

    #buildclub-progress-card-modal .bc-tier-badge strong {
      margin-top: 7px;
      font-size: 10px;
      letter-spacing: 0.9px;
    }

    #buildclub-progress-card-modal .bc-card-copy {
      position: relative;
      margin: 14px 0 0;
      color: #40513b;
      line-height: 1.45;
    }

    #buildclub-progress-card-modal .bc-card-stats {
      position: relative;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 22px;
    }

    #buildclub-progress-card-modal .bc-card-stats div {
      border: 1px solid rgba(95, 151, 35, 0.34);
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.58);
      padding: 12px;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
    }

    #buildclub-progress-card-modal .bc-card-stats strong {
      display: block;
      margin-top: 5px;
      font-size: 28px;
      line-height: 1;
    }

    #buildclub-progress-card-modal .bc-card-stats span,
    #buildclub-progress-card-modal .bc-progress-row,
    #buildclub-progress-card-modal .bc-card-footer,
    #buildclub-progress-card-modal .bc-card-status {
      color: #4c6b24;
      font-size: 12px;
      font-weight: 850;
    }

    #buildclub-progress-card-modal .bc-progress-row {
      position: relative;
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      color: #102014;
    }

    #buildclub-progress-card-modal .bc-gold-progress {
      position: relative;
      height: 14px;
      margin-top: 8px;
      overflow: hidden;
      border-radius: 999px;
      border: 1px solid rgba(16, 32, 20, 0.12);
      background: rgba(16, 32, 20, 0.1);
    }

    #buildclub-progress-card-modal .bc-gold-progress span {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, #c8ea5a, #f2ca44, #d8ad2f);
    }

    #buildclub-progress-card-modal .bc-card-footer {
      position: relative;
      display: flex;
      justify-content: space-between;
      margin-top: 18px;
      border-top: 1px solid rgba(16, 32, 20, 0.12);
      padding-top: 12px;
      color: #102014;
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }

    #buildclub-progress-card-modal .bc-card-share {
      position: relative;
      width: 100%;
      margin-top: 20px;
      border: 0;
      border-radius: 14px;
      background: #102014;
      color: #c8ea5a;
      padding: 14px;
      font-weight: 950;
      cursor: pointer;
      box-shadow: 0 14px 30px rgba(16, 32, 20, 0.18);
    }

    #buildclub-progress-card-modal .bc-card-share:hover {
      transform: translateY(-1px);
    }

    #buildclub-progress-card-modal .bc-card-status {
      min-height: 16px;
      margin-top: 10px;
      text-align: center;
    }
  `;

  modal.appendChild(style);
  modal.addEventListener("click", async (event) => {
    if (event.target.closest("[data-card-close]")) {
      removeProgressCardModal();
      return;
    }

    const shareButton = event.target.closest("[data-share-progress]");
    if (!shareButton) return;

    const status = modal.querySelector(".bc-card-status");
    const text = shareButton.dataset.shareProgress;
    try {
      await navigator.clipboard.writeText(text);
      if (status) status.textContent = "Progress copied. Share it with buddies.";
    } catch (_error) {
      if (status) status.textContent = text;
    }
  });

  document.body.appendChild(modal);
  speakKitoText(hasAward ? `Congrats, you got ${label}. You are ${progress.goldPercent} percent toward the Gold Card.` : `Here is your progress card. You are ${progress.goldPercent} percent toward the Gold Card.`);
}

async function getCurrentCourseRecord() {
  const memory = await getCourseMemory();
  return memory[getCourseInfo().key] ?? null;
}

function getSortedLessons(courseRecord) {
  return Object.values(courseRecord?.lessons ?? {})
    .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
}

function renderCourseNotes(widget, courseRecord) {
  const lessons = getSortedLessons(courseRecord);
  if (!courseRecord || lessons.length === 0) {
    setBubbleContent(widget, `
      <div class="kito-message">No saved notes yet. Finish a BuildClub lesson and I will turn it into course notes here.</div>
    `);
    return;
  }

  setBubbleContent(widget, `
    <div class="kito-message">Here are your quick notes and learning flow for ${escapeHtml(courseRecord.title)}.</div>
    <div class="course-notes">
      <div class="review-title">Learning Flow</div>
      <div class="flow-chart">
        ${lessons.map((lesson, index) => `
          <div class="flow-node">
            <div class="flow-step">${index + 1}</div>
            <div>
              <div class="flow-title">${escapeHtml(lesson.title)}</div>
              <div class="flow-date">${new Date(lesson.completedAt).toLocaleDateString()}</div>
            </div>
          </div>
        `).join("")}
      </div>
      <div class="review-title">Quick Notes</div>
      <div class="notes-list">
        ${lessons.map((lesson) => `
          <section class="note-card">
            <div class="note-title">${escapeHtml(lesson.title)}</div>
            <ul>
              ${(lesson.summary ?? []).slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </section>
        `).join("")}
      </div>
    </div>
    <button class="kito-primary" data-action="review-current">Review this lesson</button>
    <button class="kito-secondary" data-action="download-notes-pdf">Download completed notes PDF</button>
    <button class="kito-secondary" data-action="show-progress-card">Progress card</button>
  `);
}

async function hydrateCourseWelcome(widget) {
  const courseRecord = await getCurrentCourseRecord();
  const lessons = getSortedLessons(courseRecord);
  if (!courseRecord || lessons.length === 0 || hasShownBuildPrompt) return;

  setBubbleContent(widget, `
    <div class="kito-message">Welcome back. I saved ${lessons.length} completed ${lessons.length === 1 ? "lesson" : "lessons"} for ${escapeHtml(courseRecord.title)}. Want your quick notes and flow chart?</div>
    <button class="kito-primary" data-action="show-course-notes">Course notes</button>
  `);
}

function renderWidgetState(widget, state) {
  const ideas = getProjectIdeas();
  const review = getPageReview();
  const chosenIdea = selectedProjectIdea || ideas[0];
  const shareText = createShareText(chosenIdea);

  widget.classList.toggle("build-ready", state !== "hello");
  widget.classList.toggle("card-ready", state === "card");

  if (state === "hello") {
    setBubbleContent(widget, `
      <div class="kito-message">Hey, I am Kito. Open the course and read along. I will come back when you finish.</div>
      <button class="kito-primary" data-action="show-course-notes">Course notes</button>
      <button class="kito-secondary" data-action="show-progress-card">Progress card</button>
      <button class="kito-secondary" data-action="show-translate">Translate page</button>
    `);
    return;
  }

  if (state === "translate") {
    setBubbleContent(widget, `
      <div class="kito-message">Choose a language and I will convert the page for you.</div>
      <div class="kito-language-grid">
        ${supportedLanguages.map((language) => `<button class="kito-choice" data-action="translate-page" data-language="${escapeHtml(language)}">${escapeHtml(language)}</button>`).join("")}
      </div>
      <button class="kito-secondary" data-action="restore-page-text">Restore original</button>
    `);
    return;
  }

  if (state === "ready") {
    setBubbleContent(widget, `
      <div class="kito-message">You finished the lesson. I made a quick summary for you first.</div>
      <div class="kito-review">
        <div class="review-title">Page Summary</div>
        <ul class="review-list">
          ${review.summary.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </div>
      <button class="kito-primary" data-action="show-quiz">Take quick quiz</button>
      <button class="kito-secondary" data-action="download-notes-pdf">Download completed notes PDF</button>
      <button class="kito-secondary" data-action="show-translate">Translate page</button>
    `);
    return;
  }

  if (state === "quiz") {
    setBubbleContent(widget, `
      <div class="kito-message">Now try this quick quiz to check what you caught.</div>
      <div class="kito-review">
        <div class="review-title">Quick Quiz</div>
        <div class="review-questions">
          ${review.questions.map((question, questionIndex) => `
            <div class="quiz-card">
              <div class="quiz-question">${questionIndex + 1}. ${escapeHtml(question.prompt)}</div>
              <div class="quiz-options">
                ${question.options.map((option, optionIndex) => `
                  <button class="quiz-option" data-action="answer-quiz" data-correct="${optionIndex === question.correctIndex}" data-question="${questionIndex}">
                    ${escapeHtml(option)}
                  </button>
                `).join("")}
              </div>
              <div class="quiz-feedback" data-feedback="${questionIndex}" aria-live="polite"></div>
            </div>
          `).join("")}
        </div>
      </div>
      <button class="kito-primary" data-action="review-done">I caught up - start building</button>
      <button class="kito-secondary" data-action="review-current">Back to summary</button>
      <button class="kito-secondary" data-action="download-notes-pdf">Download completed notes PDF</button>
    `);
    return;
  }

  if (state === "build-intro") {
    setBubbleContent(widget, `
      <div class="kito-message">Nice. Other builders are making projects from this lesson. What's your take?</div>
      <button class="kito-primary" data-action="start-building">Start building</button>
    `);
    return;
  }

  if (state === "has-idea") {
    setBubbleContent(widget, `
      <div class="kito-message">Do you already have an idea?</div>
      <div class="kito-actions">
        <button class="kito-choice" data-action="idea-yes">Yes</button>
        <button class="kito-choice" data-action="idea-no">No</button>
      </div>
    `);
    return;
  }

  if (state === "enter-idea") {
    setBubbleContent(widget, `
      <div class="kito-message">Drop your idea here. Keep it short so it fits on your builder card.</div>
      <textarea class="kito-input" rows="3" placeholder="My project idea..."></textarea>
      <button class="kito-primary" data-action="submit-custom">Submit idea</button>
    `);
    return;
  }

  if (state === "suggestions") {
    setBubbleContent(widget, `
      <div class="kito-message">No problem. I read the page and made these project ideas. Pick one, build it, then come back and show me. I have a surprise for you.</div>
      <div class="kito-ideas">
        ${ideas.map((idea) => `<button class="kito-idea" data-action="pick-idea" data-idea="${escapeHtml(idea)}">${escapeHtml(idea)}</button>`).join("")}
      </div>
    `);
    return;
  }

  if (state === "card") {
    setBubbleContent(widget, `
      <div class="builder-card">
        <div class="card-kicker">BuildClub Builder Card</div>
        <div class="card-title">${escapeHtml(chosenIdea)}</div>
        <div class="card-meta">Built from: ${escapeHtml(getLessonTopic())}</div>
      </div>
      <div class="kito-message">Here is your card. Share it with buddies and ask who wants to build with you.</div>
      <button class="kito-primary" data-action="share-card" data-share="${escapeHtml(shareText)}">Share with buddies</button>
      <div class="kito-status" aria-live="polite"></div>
    `);
  }
}

function createBuildClubWidget({ toggle = true } = {}) {
  const existing = document.getElementById(widgetId);
  if (existing) {
    if (toggle) {
      existing.classList.remove("message-hidden");
      speakKitoText(getSpeakableText(existing));
    }
    return;
  }

  const kitoImage = chrome.runtime.getURL("public/2-cutout.png");
  const fallbackImage = chrome.runtime.getURL("public/2.png");
  const widget = document.createElement("div");
  widget.id = widgetId;
  widget.innerHTML = `
    <div class="kito-wrap">
      <img class="kito-img" src="${kitoImage}" alt="Kito BuildClub mascot" />
      <div class="kito-bubble">
        <div class="kito-message">Hey, I am Kito. Open the course and read along. I will come back when you finish.</div>
      </div>
      <button class="kito-voice" type="button" aria-label="Mute Kito voice">🔊</button>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    #${widgetId} {
      position: fixed;
      right: 18px;
      bottom: 18px;
      z-index: 2147483647;
      width: min(330px, calc(100vw - 36px));
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #1f3d16;
      animation: bc-slide-in 420ms cubic-bezier(.16, 1, .3, 1);
      pointer-events: none;
    }

    #${widgetId} .kito-wrap {
      position: relative;
      min-height: 206px;
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      pointer-events: none;
    }

    #${widgetId} .kito-img {
      display: block;
      width: 132px;
      height: auto;
      max-height: 176px;
      object-fit: contain;
      filter: drop-shadow(0 22px 28px rgba(11, 29, 18, 0.35));
      transform-origin: bottom left;
      animation: kito-bob 2.8s ease-in-out infinite;
      pointer-events: auto;
      user-select: none;
    }

    #${widgetId} .kito-bubble {
      position: absolute;
      right: 0;
      bottom: 150px;
      width: min(300px, calc(100vw - 36px));
      max-height: calc(100vh - 210px);
      overflow: visible;
      min-width: 210px;
      border: 2px solid rgba(95, 151, 35, 0.78);
      border-radius: 16px;
      background:
        linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(200, 234, 90, 0.14)),
        rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(30px) saturate(1.55) contrast(1.04);
      -webkit-backdrop-filter: blur(30px) saturate(1.55) contrast(1.04);
      color: #1f3d16;
      padding: 12px;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.7),
        inset 0 -1px 0 rgba(95, 151, 35, 0.18),
        0 0 0 1px rgba(255, 255, 255, 0.28),
        0 18px 46px rgba(11, 29, 18, 0.26);
      font-size: 13px;
      font-weight: 800;
      line-height: 1.25;
      pointer-events: auto;
    }

    #${widgetId}.message-hidden .kito-bubble {
      display: none;
    }

    #${widgetId} .kito-bubble::after {
      content: "";
      position: absolute;
      right: 48px;
      bottom: -10px;
      width: 16px;
      height: 16px;
      border-right: 2px solid rgba(95, 151, 35, 0.78);
      border-bottom: 2px solid rgba(95, 151, 35, 0.78);
      background: rgba(230, 248, 170, 0.18);
      backdrop-filter: blur(30px) saturate(1.55) contrast(1.04);
      -webkit-backdrop-filter: blur(30px) saturate(1.55) contrast(1.04);
      transform: rotate(45deg);
    }

    #${widgetId} .kito-message {
      max-width: 100%;
    }

    #${widgetId} .kito-primary,
    #${widgetId} .kito-secondary,
    #${widgetId} .kito-choice,
    #${widgetId} .kito-idea {
      margin-top: 9px;
      border: 0;
      border-radius: 10px;
      background: #0b1d12;
      color: #c8ea5a;
      padding: 8px 10px;
      font-size: 11px;
      font-weight: 900;
      cursor: pointer;
      box-shadow: 0 8px 20px rgba(11, 29, 18, 0.18);
    }

    #${widgetId} .kito-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    #${widgetId} .kito-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-left: 6px;
      border: 1px solid rgba(95, 151, 35, 0.62);
      background: rgba(255, 255, 255, 0.62);
      color: #1f3d16;
      box-shadow: none;
    }

    #${widgetId} .kito-actions {
      display: flex;
      gap: 8px;
    }

    #${widgetId} .kito-language-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      margin-top: 8px;
    }

    #${widgetId} .kito-choice {
      flex: 1;
    }

    #${widgetId} .kito-ideas {
      display: grid;
      gap: 7px;
      margin-top: 9px;
      max-height: 190px;
      overflow: auto;
    }

    #${widgetId} .kito-idea {
      width: 100%;
      margin-top: 0;
      text-align: left;
      line-height: 1.25;
      background: rgba(255, 255, 255, 0.82);
      color: #1f3d16;
      border: 1px solid rgba(146, 200, 62, 0.72);
      box-shadow: none;
    }

    #${widgetId} .kito-input {
      width: 100%;
      margin-top: 9px;
      border: 1px solid rgba(31, 61, 22, 0.2);
      border-radius: 10px;
      padding: 9px;
      resize: vertical;
      font: inherit;
      font-size: 12px;
      color: #1f3d16;
      background: rgba(255, 255, 255, 0.82);
    }

    #${widgetId} .kito-review {
      display: grid;
      gap: 8px;
      margin-top: 10px;
      max-height: min(360px, calc(100vh - 330px));
      overflow: auto;
      padding-right: 2px;
    }

    #${widgetId} .review-title {
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.8px;
      color: #315c16;
      text-transform: uppercase;
    }

    #${widgetId} .review-list {
      margin: 0;
      padding-left: 18px;
    }

    #${widgetId} .review-list li,
    #${widgetId} .review-questions li {
      margin: 0 0 7px;
    }

    #${widgetId} .review-questions,
    #${widgetId} .quiz-options {
      display: grid;
      gap: 8px;
    }

    #${widgetId} .quiz-card {
      border: 1px solid rgba(95, 151, 35, 0.44);
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.5);
      padding: 9px;
    }

    #${widgetId} .quiz-question {
      font-size: 12px;
      font-weight: 900;
      line-height: 1.3;
    }

    #${widgetId} .quiz-options {
      margin-top: 8px;
    }

    #${widgetId} .quiz-option {
      border: 1px solid rgba(95, 151, 35, 0.48);
      border-radius: 8px;
      padding: 8px;
      background: rgba(255, 255, 255, 0.68);
      color: #1f3d16;
      cursor: pointer;
      font: inherit;
      font-size: 12px;
      font-weight: 800;
      line-height: 1.25;
      text-align: left;
    }

    #${widgetId} .quiz-option.correct {
      border-color: #4f8f1f;
      background: rgba(200, 234, 90, 0.74);
    }

    #${widgetId} .quiz-option.incorrect {
      border-color: rgba(161, 68, 55, 0.72);
      background: rgba(255, 218, 212, 0.78);
    }

    #${widgetId} .quiz-feedback {
      min-height: 16px;
      margin-top: 6px;
      color: #315c16;
      font-size: 11px;
      font-weight: 900;
    }

    #${widgetId} .course-notes {
      display: grid;
      gap: 10px;
      margin-top: 10px;
      max-height: min(380px, calc(100vh - 330px));
      overflow: auto;
      padding-right: 2px;
    }

    #${widgetId} .flow-chart {
      display: grid;
      gap: 8px;
    }

    #${widgetId} .flow-node {
      position: relative;
      display: grid;
      grid-template-columns: 26px 1fr;
      gap: 8px;
      align-items: start;
      border: 1px solid rgba(95, 151, 35, 0.44);
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.5);
      padding: 8px;
    }

    #${widgetId} .flow-node:not(:last-child)::after {
      content: "";
      position: absolute;
      left: 20px;
      bottom: -9px;
      width: 2px;
      height: 9px;
      background: rgba(95, 151, 35, 0.78);
    }

    #${widgetId} .flow-step {
      display: grid;
      place-items: center;
      width: 24px;
      height: 24px;
      border-radius: 999px;
      background: #0b1d12;
      color: #c8ea5a;
      font-size: 11px;
      font-weight: 900;
    }

    #${widgetId} .flow-title,
    #${widgetId} .note-title {
      font-size: 12px;
      font-weight: 900;
      line-height: 1.2;
    }

    #${widgetId} .flow-date {
      margin-top: 3px;
      color: #4c6b24;
      font-size: 10px;
      font-weight: 800;
    }

    #${widgetId} .notes-list {
      display: grid;
      gap: 8px;
    }

    #${widgetId} .note-card {
      border: 1px solid rgba(95, 151, 35, 0.44);
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.5);
      padding: 9px;
    }

    #${widgetId} .note-card ul {
      margin: 6px 0 0;
      padding-left: 17px;
    }

    #${widgetId} .note-card li {
      margin-bottom: 5px;
    }

    #${widgetId} .builder-card {
      display: grid;
      gap: 6px;
      margin-bottom: 9px;
      border-radius: 8px;
      border: 1px solid rgba(146, 200, 62, 0.72);
      background: rgba(255, 255, 255, 0.82);
      color: #1f3d16;
      padding: 12px;
    }

    #${widgetId} .card-kicker {
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      color: #4c6b24;
    }

    #${widgetId} .card-title {
      font-size: 15px;
      font-weight: 900;
      line-height: 1.18;
    }

    #${widgetId} .card-meta,
    #${widgetId} .kito-status {
      font-size: 11px;
      font-weight: 800;
      color: #4c6b24;
    }

    #${widgetId}.build-ready .kito-bubble {
      text-transform: none;
    }

    #${widgetId}.card-ready .kito-bubble {
      width: min(310px, calc(100vw - 36px));
    }

    #${widgetId} .kito-voice {
      position: absolute;
      top: 0;
      display: grid;
      place-items: center;
      width: 24px;
      height: 24px;
      border: 0;
      border-radius: 999px;
      background: #0b1d12;
      color: #c8ea5a;
      font-size: 18px;
      line-height: 1;
      cursor: pointer;
      pointer-events: auto;
      box-shadow: 0 10px 24px rgba(11, 29, 18, 0.24);
    }

    #${widgetId} .kito-voice {
      right: 0;
      font-size: 13px;
    }

    #${widgetId} .kito-voice:hover {
      background: #1f3d16;
    }

    @keyframes bc-slide-in {
      from {
        opacity: 0;
        transform: translateX(22px) scale(.96);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }

    @keyframes kito-bob {
      0%, 100% {
        transform: translateY(0) rotate(-1deg);
      }
      50% {
        transform: translateY(-7px) rotate(1deg);
      }
    }
  `;

  widget.appendChild(style);
  widget.querySelector(".kito-img")?.addEventListener("error", (event) => {
    event.currentTarget.src = fallbackImage;
  });
  widget.querySelector(".kito-img")?.addEventListener("click", () => {
    if (latestStuckContext) {
      document.getElementById(stuckHelpBubbleId)?.remove();
      openKitoPanel(latestRequestedSidePanelTab);
      return;
    }

    const isHidden = widget.classList.toggle("message-hidden");
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (!isHidden) {
      speakKitoText(getSpeakableText(widget));
    }
  });
  updateVoiceButton(widget);
  widget.querySelector(".kito-voice")?.addEventListener("click", () => {
    isVoiceEnabled = !isVoiceEnabled;
    if (!isVoiceEnabled && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    updateVoiceButton(widget);
    if (isVoiceEnabled) {
      speakKitoText(getSpeakableText(widget));
    }
  });
  widget.addEventListener("click", async (event) => {
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    const button = target?.closest("button[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    if (action === "show-translate") {
      renderWidgetState(widget, "translate");
      return;
    }

    if (action === "translate-page") {
      const language = button.dataset.language;
      const changedCount = convertPageText(language);
      setBubbleContent(widget, `
          <div class="kito-message">Converted ${changedCount} text blocks to ${escapeHtml(language)}.</div>
          <button class="kito-secondary" data-action="restore-page-text">Restore original</button>
          <button class="kito-primary" data-action="show-translate">Choose another language</button>
        `);
      return;
    }

    if (action === "restore-page-text") {
      restorePageText();
      setBubbleContent(widget, `
          <div class="kito-message">Original page text restored.</div>
          <button class="kito-primary" data-action="show-translate">Translate again</button>
        `);
      return;
    }

    if (action === "answer-quiz") {
      const isCorrect = button.dataset.correct === "true";
      const card = button.closest(".quiz-card");
      const feedback = card?.querySelector(".quiz-feedback");
      const options = card?.querySelectorAll(".quiz-option") ?? [];

      options.forEach((option) => {
        option.classList.remove("correct", "incorrect");
        option.disabled = true;
        if (option.dataset.correct === "true") {
          option.classList.add("correct");
        }
      });

      if (!isCorrect) {
        button.classList.add("incorrect");
      }

      const message = isCorrect ? "Correct. Nice catch." : "Not quite. The highlighted option is the best answer.";
      if (feedback) feedback.textContent = message;
      speakKitoText(message);
      return;
    }

    if (action === "show-quiz") {
      renderWidgetState(widget, "quiz");
      return;
    }

    if (action === "review-done") {
      renderWidgetState(widget, "build-intro");
      return;
    }

    if (action === "show-course-notes") {
      const bubble = widget.querySelector(".kito-bubble");
      if (bubble) {
        setBubbleContent(widget, `<div class="kito-message">Loading your course notes...</div>`);
      }
      renderCourseNotes(widget, await getCurrentCourseRecord());
      return;
    }

    if (action === "show-progress-card") {
      const memory = await getCourseMemory();
      const progress = getLearningProgress(memory);
      showProgressCardModal({ tier: getCardTier(progress), progress });
      return;
    }

    if (action === "review-current") {
      renderWidgetState(widget, "ready");
      return;
    }

    if (action === "download-notes-pdf") {
      downloadNotesPdf();
      return;
    }

    if (action === "start-building") {
      renderWidgetState(widget, "has-idea");
      return;
    }

    if (action === "idea-yes") {
      renderWidgetState(widget, "enter-idea");
      return;
    }

    if (action === "idea-no") {
      renderWidgetState(widget, "suggestions");
      return;
    }

    if (action === "pick-idea") {
      selectedProjectIdea = button.dataset.idea || "";
      await saveProjectIdea(selectedProjectIdea);
      renderWidgetState(widget, "card");
      return;
    }

    if (action === "submit-custom") {
      const input = widget.querySelector(".kito-input");
      selectedProjectIdea = input?.value?.trim() || getProjectIdeas()[0];
      await saveProjectIdea(selectedProjectIdea);
      renderWidgetState(widget, "card");
      return;
    }

    if (action === "share-card") {
      const status = widget.querySelector(".kito-status");
      const shareText = button.dataset.share || createShareText(selectedProjectIdea);
      try {
        await navigator.clipboard.writeText(shareText);
        if (status) status.textContent = "Copied. Send it to your buddies.";
      } catch (_error) {
        if (status) status.textContent = shareText;
      }
    }
  });
  document.body.appendChild(widget);
  renderWidgetState(widget, "hello");
  hydrateCourseWelcome(widget).catch(() => {});
}

function getScrollPercent() {
  const page = document.documentElement;
  const maxScroll = Math.max(1, page.scrollHeight - window.innerHeight);
  return Math.round((window.scrollY / maxScroll) * 100);
}

function showBuildPrompt() {
  createBuildClubWidget({ toggle: false });
  const widget = document.getElementById(widgetId);
  if (!widget) return;

  widget.classList.add("build-ready");
  saveCompletedLessonAndCheckCard()
    .then(({ awardedTier, progress }) => {
      if (awardedTier) {
        showProgressCardModal({ tier: awardedTier, progress });
      }
    })
    .catch(() => {});
  renderWidgetState(widget, "ready");
}

function trackReadingProgress() {
  if (hasShownBuildPrompt) return;
  if (getScrollPercent() >= 95) {
    hasShownBuildPrompt = true;
    showBuildPrompt();
  }
}

function trackStuckScrollSignals() {
  const scrollY = window.scrollY;
  const nextZone = Math.floor(scrollY / stuckZoneSize);
  const delta = scrollY - lastScrollY;
  const nextDirection = delta === 0 ? lastScrollDirection : delta > 0 ? 1 : -1;
  const now = Date.now();

  if (nextZone !== currentScrollZone) {
    currentScrollZone = nextZone;
    currentZoneEnteredAt = now;
    scrollDirectionChanges = scrollDirectionChanges.filter((change) => now - change.timestamp <= repeatedScrollWindowMs);
    resetSameZoneTimer();
    resetCodePauseTimer();
  }

  if (nextDirection && lastScrollDirection && nextDirection !== lastScrollDirection) {
    scrollDirectionChanges.push({ timestamp: now, zone: currentScrollZone });
    scrollDirectionChanges = scrollDirectionChanges.filter((change) => now - change.timestamp <= repeatedScrollWindowMs);
    const nearbyChanges = scrollDirectionChanges.filter((change) => Math.abs(change.zone - currentScrollZone) <= 1);
    if (nearbyChanges.length >= repeatedScrollDirectionChanges) {
      scrollDirectionChanges = [];
      triggerStuckDetected("repeated-scroll");
    }
  }

  lastScrollY = scrollY;
  lastScrollDirection = nextDirection;
}

function trackSelectionSignal() {
  const selectedText = String(window.getSelection()?.toString() || "")
    .replace(/\s+/g, " ")
    .trim();

  if (selectedText.length <= 20 || selectedText === lastSelectedText) return;
  lastSelectedText = selectedText;
  triggerStuckDetected("text-selected", selectedText);
}

function shouldTranslateNode(node) {
  const parent = node.parentElement;
  if (!parent || blockedTags.has(parent.tagName)) return false;
  if (parent.closest(`#${widgetId}`)) return false;
  if (parent.closest("[contenteditable='true']")) return false;
  if (!node.nodeValue || !node.nodeValue.trim()) return false;

  const style = window.getComputedStyle(parent);
  if (style.display === "none" || style.visibility === "hidden") return false;

  return true;
}

function getVisibleTextNodes() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return shouldTranslateNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });

  const nodes = [];
  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }
  return nodes;
}

function preserveWhitespace(original, translatedCore) {
  const leading = original.match(/^\s*/)?.[0] ?? "";
  const trailing = original.match(/\s*$/)?.[0] ?? "";
  return `${leading}${translatedCore}${trailing}`;
}

function mockTranslateText(text, language) {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  const dictionary = phraseDictionary[language] ?? {};

  if (dictionary[lower]) {
    return preserveWhitespace(text, dictionary[lower]);
  }

  let translated = trimmed;
  for (const [english, replacement] of Object.entries(dictionary)) {
    translated = translated.replace(new RegExp(`\\b${english}\\b`, "gi"), replacement);
  }

  if (translated === trimmed) {
    translated = `${languagePrefix[language] ?? `${language}:`} ${trimmed}`;
  }

  return preserveWhitespace(text, translated);
}

function convertPageText(language) {
  const nodes = getVisibleTextNodes();
  let changedCount = 0;

  for (const node of nodes) {
    if (!originalTextByNode.has(node)) {
      originalTextByNode.set(node, node.nodeValue);
    }

    node.nodeValue = mockTranslateText(originalTextByNode.get(node), language);
    changedCount += 1;
  }

  return changedCount;
}

function restorePageText() {
  for (const [node, originalText] of originalTextByNode.entries()) {
    node.nodeValue = originalText;
  }
  originalTextByNode.clear();
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "SHOW_BUILDCLUB_WIDGET") {
    createBuildClubWidget({ toggle: false });
    sendResponse({ shown: true });
    return true;
  }

  if (message.type === "CONVERT_PAGE_TEXT") {
    const changedCount = convertPageText(message.language);
    sendResponse({ changedCount });
    return true;
  }

  if (message.type === "RESTORE_PAGE_TEXT") {
    restorePageText();
    sendResponse({ restored: true });
    return true;
  }

  if (message.type === MESSAGE_TYPES.OPEN_KITO_PANEL || message.type === MESSAGE_TYPES.OPEN_SIDE_PANEL_TAB) {
    openKitoPanel(message.tab || latestRequestedSidePanelTab);
    sendResponse({ requested: true });
    return true;
  }

  return false;
});

window.addEventListener("scroll", trackReadingProgress, { passive: true });
window.addEventListener("scroll", trackStuckScrollSignals, { passive: true });
document.addEventListener("selectionchange", trackSelectionSignal);
createBuildClubWidget({ toggle: false });
resetSameZoneTimer();
resetCodePauseTimer();
trackReadingProgress();
}
