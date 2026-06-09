const OFFICIAL_DOCS = [
  {
    id: "claude-code",
    title: "Claude Code Official Docs",
    source: "Anthropic",
    url: "https://docs.anthropic.com/en/docs/claude-code/overview",
    keywords: ["claude code", "claude-code", "claude cli", "claude terminal", "agentic coding", "coding agent"]
  },
  {
    id: "claude-api",
    title: "Claude API Docs",
    source: "Anthropic",
    url: "https://platform.claude.com/docs/en/home",
    keywords: ["claude api", "anthropic api", "messages api", "model", "prompt caching", "tool use"]
  },
  {
    id: "chrome-extensions",
    title: "Chrome Extensions Documentation",
    source: "Chrome for Developers",
    url: "https://developer.chrome.com/docs/extensions",
    keywords: ["chrome extension", "manifest v3", "mv3", "content script", "background script", "service worker", "extension api"]
  },
  {
    id: "chrome-side-panel",
    title: "Chrome Side Panel API",
    source: "Chrome for Developers",
    url: "https://developer.chrome.com/docs/extensions/reference/api/sidePanel",
    keywords: ["side panel", "sidepanel", "chrome side panel", "side panel api"]
  },
  {
    id: "react",
    title: "React Docs",
    source: "React",
    url: "https://react.dev/learn",
    keywords: ["react", "component", "usestate", "useeffect", "props", "jsx", "tsx"]
  },
  {
    id: "typescript",
    title: "TypeScript Docs",
    source: "TypeScript",
    url: "https://www.typescriptlang.org/docs/",
    keywords: ["typescript", "type", "interface", "tsx", "generic", "enum"]
  },
  {
    id: "tailwind",
    title: "Tailwind CSS Docs",
    source: "Tailwind CSS",
    url: "https://tailwindcss.com/docs",
    keywords: ["tailwind", "tailwind css", "utility class", "classname", "responsive class"]
  },
  {
    id: "vite",
    title: "Vite Docs",
    source: "Vite",
    url: "https://vite.dev/guide/",
    keywords: ["vite", "dev server", "build tool", "vite config"]
  },
  {
    id: "git",
    title: "Git Documentation",
    source: "Git",
    url: "https://git-scm.com/doc",
    keywords: ["git", "commit", "branch", "merge", "pull request", "push", "clone"]
  },
  {
    id: "github",
    title: "GitHub Docs",
    source: "GitHub",
    url: "https://docs.github.com/",
    keywords: ["github", "repository", "repo", "pull request", "issue", "actions", "github actions"]
  },
  {
    id: "nodejs",
    title: "Node.js Docs",
    source: "Node.js",
    url: "https://nodejs.org/docs/latest/api/",
    keywords: ["node", "nodejs", "node.js", "npm", "package.json"]
  },
  {
    id: "supabase",
    title: "Supabase Docs",
    source: "Supabase",
    url: "https://supabase.com/docs",
    keywords: ["supabase", "auth", "database", "postgres", "rls"]
  }
];

const contentEl = document.getElementById("content");
const tabButtons = [...document.querySelectorAll(".tab")];
let activeTab = "Explain";
let context = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getContextText(currentContext) {
  return currentContext?.selectedText || currentContext?.nearbyText || "";
}

function findOfficialDocs(text) {
  const normalized = String(text ?? "").toLowerCase();
  const seen = new Set();

  return OFFICIAL_DOCS.map((doc) => {
    const matchedKeywords = [...new Set(doc.keywords.filter((keyword) => normalized.includes(keyword.toLowerCase())))];
    return { ...doc, matchedKeywords, score: matchedKeywords.length };
  })
    .filter((doc) => doc.score > 0 && !seen.has(doc.id) && seen.add(doc.id))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function getFallbackDocs() {
  return OFFICIAL_DOCS.filter((doc) => ["claude-code", "github", "nodejs"].includes(doc.id)).map((doc) => ({
    ...doc,
    matchedKeywords: ["recommended"],
    score: 1
  }));
}

function getMustReadDocs(text) {
  const docs = findOfficialDocs(text);
  return docs.length ? docs : getFallbackDocs();
}

function explainSection(currentContext) {
  const text = getContextText(currentContext);
  const heading = currentContext?.nearestHeading ? ` under "${currentContext.nearestHeading}"` : "";
  const basis = currentContext?.selectedText ? "the text you selected" : "the section you are reading";

  if (!text) {
    return "Kito needs a little more visible lesson text before it can explain this section.";
  }

  // Replace this mock explanation with a real AI/API call when Kito gets backend support.
  return `This looks like ${basis}${heading}. In simple terms, focus on the main tool or concept being introduced, what action it asks you to take, and what result you should expect. Break it into one small step: read the instruction, identify the command or code idea, then try it in a safe project area before moving on.`;
}

function explainPastedLine(line, currentContext) {
  const cleanLine = line.replace(/\s+/g, " ").trim();
  if (!cleanLine) return explainSection(currentContext);

  const heading = currentContext?.nearestHeading ? ` The nearby lesson heading is "${currentContext.nearestHeading}".` : "";
  const docs = getMustReadDocs(`${cleanLine} ${getContextText(currentContext)}`);
  const docsText = docs.slice(0, 2).map((doc) => `${doc.title} (${doc.source})`).join(" and ");

  return `Line-by-line explanation: "${cleanLine}" means you should identify the concept, understand the action it expects, and verify the result before moving forward.${heading} Read it slowly in this order: first find the tool or keyword, then ask what input it needs, then check what output or page change proves it worked. For official reference, start with ${docsText}.`;
}

function generateSafeClaudePrompt(currentContext) {
  const text = getContextText(currentContext) || "No section text was captured.";

  // Replace this mock prompt builder with a real AI/API call when project-aware assistance is available.
  if (currentContext?.hasCodeBlock) {
    return `Inspect this code or concept first.
Explain what it does.
Identify possible issues.
Suggest a safe debugging plan.
Do not modify files until I approve.

Section:
${text}`;
  }

  return `Read the following section and help me apply it to my current project.
First explain the concept in simple language.
Then create a small implementation plan.
Do not edit files until I approve.
Keep the changes small and explain every change.

Section:
${text}`;
}

function renderEmpty() {
  contentEl.innerHTML = `
    <section class="card">
      <div class="label">No context yet</div>
      <p class="empty">Open a BuildClub page, select lesson text, pause on a section, or click Kito after a stuck signal.</p>
    </section>
    ${renderFeedbackCard()}
  `;
  bindFeedbackForm();
}

function renderFeedbackCard() {
  return `
    <section class="card feedback-card">
      <div class="label">Tell us what happened</div>
      <div class="value">What problem did you face? We will try to resolve it.</div>
      <textarea id="feedback-input" class="feedback-input" rows="4" placeholder="Example: I did not understand where to run this command."></textarea>
      <button class="secondary" type="button" id="save-feedback">Send Feedback</button>
      <div class="feedback-status" id="feedback-status" aria-live="polite"></div>
    </section>
  `;
}

function bindFeedbackForm() {
  const input = document.getElementById("feedback-input");
  const button = document.getElementById("save-feedback");
  const status = document.getElementById("feedback-status");
  if (!input || !button || !status) return;

  button.addEventListener("click", async () => {
    const problem = input.value.replace(/\s+/g, " ").trim();
    if (!problem) {
      status.textContent = "Write a short note first.";
      return;
    }

    const stored = await chrome.storage.local.get(["kitoUserReviews"]);
    const review = {
      id: `review-${Date.now()}`,
      url: context?.url || "",
      title: context?.title || "",
      problem,
      context: context || undefined,
      timestamp: Date.now(),
      status: "new"
    };

    await chrome.storage.local.set({
      kitoUserReviews: [review, ...(stored.kitoUserReviews || [])].slice(0, 50)
    });

    input.value = "";
    status.textContent = "Saved. Kito will use this to improve help for this section.";
  });
}

function renderExplain() {
  if (!context) return renderEmpty();

  const pastedLine = sessionStorage.getItem("kitoPastedLine") || "";
  const explanation = pastedLine ? explainPastedLine(pastedLine, context) : explainSection(context);

  contentEl.innerHTML = `
    <section class="card">
      <div class="label">Trigger reason</div>
      <div class="value">${escapeHtml(context.triggerReason)}</div>
    </section>
    <section class="card">
      <div class="label">Nearest heading</div>
      <div class="value">${escapeHtml(context.nearestHeading || "No nearby heading detected")}</div>
    </section>
    <section class="card">
      <div class="label">Selected/current section</div>
      <div class="value section-text">${escapeHtml(getContextText(context))}</div>
    </section>
    <section class="card">
      <div class="label">Simple explanation</div>
      <div class="value">${escapeHtml(explanation)}</div>
    </section>
    <section class="card">
      <div class="label">Paste the line</div>
      <div class="value">Copy-paste the exact line you did not understand. Kito will explain that line with official docs.</div>
      <textarea id="line-input" class="feedback-input" rows="3" placeholder="Paste the confusing line here...">${escapeHtml(pastedLine)}</textarea>
      <button class="secondary" type="button" id="explain-line">Explain pasted line</button>
    </section>
    <button class="primary" type="button" id="generate-prompt">Generate Claude Prompt</button>
    ${renderFeedbackCard()}
  `;

  document.getElementById("generate-prompt")?.addEventListener("click", () => setActiveTab("Claude Prompt"));
  document.getElementById("explain-line")?.addEventListener("click", () => {
    const line = document.getElementById("line-input")?.value?.trim() || "";
    sessionStorage.setItem("kitoPastedLine", line);
    renderExplain();
  });
  bindFeedbackForm();
}

function renderDocs() {
  if (!context) return renderEmpty();

  const docs = getMustReadDocs(`${context.selectedText || ""} ${context.nearbyText || ""} ${context.nearestHeading || ""}`);

  contentEl.innerHTML = `
    <section class="card">
      <div class="label">Must read for this page</div>
      <div class="value">Start with these official docs before applying the lesson.</div>
    </section>
  ` + docs
    .map((doc) => `
      <section class="card doc-card">
        <div class="pill-row"><span class="pill official">Official</span></div>
        <div class="doc-title">${escapeHtml(doc.title)}</div>
        <div class="meta">${escapeHtml(doc.source)}</div>
        <div class="pill-row">${doc.matchedKeywords.map((keyword) => `<span class="pill">${escapeHtml(keyword)}</span>`).join("")}</div>
        <button class="secondary" type="button" data-open-doc="${escapeHtml(doc.url)}">Open Docs</button>
      </section>
    `)
    .join("") + renderFeedbackCard();

  contentEl.querySelectorAll("[data-open-doc]").forEach((button) => {
    button.addEventListener("click", () => chrome.tabs.create({ url: button.dataset.openDoc }));
  });
  bindFeedbackForm();
}

function renderPrompt() {
  if (!context) return renderEmpty();

  const prompt = generateSafeClaudePrompt(context);
  contentEl.innerHTML = `
    <section class="card">
      <div class="label">Safe Claude Code prompt</div>
      <pre class="prompt">${escapeHtml(prompt)}</pre>
    </section>
    <button class="primary" type="button" id="copy-prompt">Copy Prompt</button>
    <section class="card">
      <ul class="checklist">
        <li>Explains first</li>
        <li>Plans before editing</li>
        <li>Keeps changes small</li>
        <li>Asks before modifying files</li>
      </ul>
    </section>
    ${renderFeedbackCard()}
  `;

  document.getElementById("copy-prompt")?.addEventListener("click", async (event) => {
    await navigator.clipboard.writeText(prompt);
    event.currentTarget.textContent = "Copied";
  });
  bindFeedbackForm();
}

function render() {
  tabButtons.forEach((button) => button.classList.toggle("active", button.dataset.tab === activeTab));

  if (activeTab === "Official Docs") {
    renderDocs();
  } else if (activeTab === "Claude Prompt") {
    renderPrompt();
  } else {
    renderExplain();
  }
}

function setActiveTab(tab) {
  activeTab = tab || "Explain";
  chrome.storage.local.set({ latestRequestedSidePanelTab: activeTab });
  render();
}

async function loadState() {
  const stored = await chrome.storage.local.get(["latestStuckContext", "latestRequestedSidePanelTab"]);
  context = stored.latestStuckContext || null;
  activeTab = stored.latestRequestedSidePanelTab || "Explain";
  render();
}

tabButtons.forEach((button) => button.addEventListener("click", () => setActiveTab(button.dataset.tab)));
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;
  if (changes.latestStuckContext) context = changes.latestStuckContext.newValue || null;
  if (changes.latestRequestedSidePanelTab) activeTab = changes.latestRequestedSidePanelTab.newValue || "Explain";
  render();
});

loadState();
