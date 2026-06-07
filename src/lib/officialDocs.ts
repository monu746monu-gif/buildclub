export type OfficialDoc = {
  id: string;
  title: string;
  source: string;
  url: string;
  keywords: string[];
};

const OFFICIAL_DOCS: OfficialDoc[] = [
  {
    id: "claude-code",
    title: "Claude Code Official Docs",
    source: "Anthropic",
    url: "https://docs.anthropic.com/en/docs/claude-code/overview",
    keywords: [
      "claude code",
      "claude-code",
      "claude cli",
      "claude terminal",
      "agentic coding",
      "coding agent"
    ]
  },
  {
    id: "claude-api",
    title: "Claude API Docs",
    source: "Anthropic",
    url: "https://platform.claude.com/docs/en/home",
    keywords: [
      "claude api",
      "anthropic api",
      "messages api",
      "model",
      "prompt caching",
      "tool use"
    ]
  },
  {
    id: "chrome-extensions",
    title: "Chrome Extensions Documentation",
    source: "Chrome for Developers",
    url: "https://developer.chrome.com/docs/extensions",
    keywords: [
      "chrome extension",
      "manifest v3",
      "mv3",
      "content script",
      "background script",
      "service worker",
      "extension api"
    ]
  },
  {
    id: "chrome-side-panel",
    title: "Chrome Side Panel API",
    source: "Chrome for Developers",
    url: "https://developer.chrome.com/docs/extensions/reference/api/sidePanel",
    keywords: [
      "side panel",
      "sidepanel",
      "chrome side panel",
      "side panel api"
    ]
  },
  {
    id: "react",
    title: "React Docs",
    source: "React",
    url: "https://react.dev/learn",
    keywords: [
      "react",
      "component",
      "usestate",
      "useeffect",
      "props",
      "jsx",
      "tsx"
    ]
  },
  {
    id: "typescript",
    title: "TypeScript Docs",
    source: "TypeScript",
    url: "https://www.typescriptlang.org/docs/",
    keywords: [
      "typescript",
      "type",
      "interface",
      "tsx",
      "generic",
      "enum"
    ]
  },
  {
    id: "tailwind",
    title: "Tailwind CSS Docs",
    source: "Tailwind CSS",
    url: "https://tailwindcss.com/docs",
    keywords: [
      "tailwind",
      "tailwind css",
      "utility class",
      "classname",
      "responsive class"
    ]
  },
  {
    id: "vite",
    title: "Vite Docs",
    source: "Vite",
    url: "https://vite.dev/guide/",
    keywords: [
      "vite",
      "dev server",
      "build tool",
      "vite config"
    ]
  },
  {
    id: "git",
    title: "Git Documentation",
    source: "Git",
    url: "https://git-scm.com/doc",
    keywords: [
      "git",
      "commit",
      "branch",
      "merge",
      "pull request",
      "push",
      "clone"
    ]
  },
  {
    id: "github",
    title: "GitHub Docs",
    source: "GitHub",
    url: "https://docs.github.com/",
    keywords: [
      "github",
      "repository",
      "repo",
      "pull request",
      "issue",
      "actions",
      "github actions"
    ]
  },
  {
    id: "nodejs",
    title: "Node.js Docs",
    source: "Node.js",
    url: "https://nodejs.org/docs/latest/api/",
    keywords: [
      "node",
      "nodejs",
      "node.js",
      "npm",
      "package.json"
    ]
  },
  {
    id: "supabase",
    title: "Supabase Docs",
    source: "Supabase",
    url: "https://supabase.com/docs",
    keywords: [
      "supabase",
      "auth",
      "database",
      "postgres",
      "rls"
    ]
  }
];

export function findOfficialDocs(text: string): Array<OfficialDoc & { matchedKeywords: string[]; score: number }> {
  const normalizedText = text.toLowerCase();
  const seen = new Set<string>();

  return OFFICIAL_DOCS.map((doc) => {
    const matchedKeywords = [...new Set(doc.keywords.filter((keyword) => normalizedText.includes(keyword.toLowerCase())))];
    return {
      ...doc,
      matchedKeywords,
      score: matchedKeywords.length
    };
  })
    .filter((doc) => doc.score > 0)
    .filter((doc) => {
      if (seen.has(doc.id)) return false;
      seen.add(doc.id);
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
