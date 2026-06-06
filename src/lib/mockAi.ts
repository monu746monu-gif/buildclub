import type { BuilderCardData, BuildPlanType, LessonSummary, ProjectIdea, TranslationResult } from "./types";

const conceptWords = ["Claude Code", "prompting", "debugging", "refactor", "terminal", "README", "tests", "automation"];

function sentenceFrom(text: string, fallback: string): string {
  const sentence = text.split(/[.!?]/).map((item) => item.trim()).find((item) => item.length > 60);
  return sentence ? `${sentence.slice(0, 180)}.` : fallback;
}

function detectConcepts(text: string): string[] {
  const lower = text.toLowerCase();
  const found = conceptWords.filter((word) => lower.includes(word.toLowerCase()));
  return Array.from(new Set(["Claude Code workflow", ...found, "build iteration"])).slice(0, 5);
}

export function generateLessonSummary(pageText: string): LessonSummary {
  const concepts = detectConcepts(pageText);
  return {
    mainTopic: "Turning a BuildClub Claude Code lesson into a practical shipping workflow",
    keyTakeaways: [
      sentenceFrom(pageText, "Claude Code is useful when you give it a clear goal, tight context, and concrete verification steps."),
      "The best lesson outcome is a small working project, not just passive notes.",
      "Strong builders break the project into scoped tasks, inspect code, implement, verify, and iterate."
    ],
    concepts,
    tools: ["claude", "git", "npm run dev", "npm run build", "README.md"],
    buildTakeaway: "Pick one workflow from this lesson and ship a tiny tool that proves you can use it."
  };
}

export function generateProjectIdeas(pageText: string): ProjectIdea[] {
  const concepts = detectConcepts(pageText);
  return [
    {
      id: "beginner-readme",
      title: "AI README Generator",
      difficulty: "Beginner",
      estimatedTime: "45-60 min",
      whatToBuild: "A small app that asks for a project name and features, then drafts a clean README with setup and demo steps.",
      skillsLearned: ["prompt design", "structured output", "developer documentation"],
      prompts: [
        "Use Claude Code to scaffold a React form for README generation.",
        "Ask Claude Code to add validation and a copy-to-clipboard button."
      ]
    },
    {
      id: "intermediate-bugfix",
      title: "Bug Fix Assistant",
      difficulty: "Intermediate",
      estimatedTime: "90 min",
      whatToBuild: `A workflow helper that turns bug notes into reproduction steps, likely causes, and Claude Code prompts. Use lesson concepts like ${concepts.slice(0, 2).join(" and ")}.`,
      skillsLearned: ["debugging workflow", "context gathering", "test planning"],
      prompts: [
        "Inspect this bug report and propose a minimal fix plan before editing.",
        "Generate a regression test for the behavior described here."
      ]
    },
    {
      id: "advanced-review-bot",
      title: "Code Review Bot",
      difficulty: "Advanced",
      estimatedTime: "2-3 hr",
      whatToBuild: "A local tool that reviews a pull request diff and returns risks, missing tests, and suggested follow-up prompts.",
      skillsLearned: ["diff analysis", "quality gates", "automation"],
      prompts: [
        "Review this diff for behavioral regressions and missing tests.",
        "Convert the findings into actionable issues with file and line references."
      ]
    }
  ];
}

export function generateBuildPlan(projectIdea: ProjectIdea, pageText: string): BuildPlanType {
  return {
    projectTitle: projectIdea.title,
    goal: `Build a demo-ready ${projectIdea.title} that applies the lesson takeaway: ${generateLessonSummary(pageText).buildTakeaway}`,
    features: [
      "Focused input flow for the builder",
      "Generated output with clear sections",
      "Copyable Claude Code prompts",
      "Saved local project history",
      "Polished empty, loading, and result states"
    ],
    steps: [
      "Create a small React + TypeScript project and define the core data types.",
      "Build the main form for project or bug context.",
      "Add deterministic mock generation so the demo works without an API.",
      "Render the generated output in clean cards with copy buttons.",
      "Persist recent outputs in local storage.",
      "Run the app, test the main flow, and write a README."
    ],
    prompts: projectIdea.prompts,
    checklist: ["App runs locally", "Primary flow works", "README explains setup", "GitHub link is public", "Demo link or screen recording is ready"]
  };
}

export function generatePlanFromUserIdea(userIdea: string, pageText: string): BuildPlanType {
  const title = userIdea.trim().replace(/[.?!]$/, "") || "Claude Code Build Quest";
  return generateBuildPlan(
    {
      id: "custom",
      title,
      difficulty: "Intermediate",
      estimatedTime: "60-90 min",
      whatToBuild: userIdea,
      skillsLearned: detectConcepts(pageText),
      prompts: [
        `Help me turn this idea into a scoped MVP: ${title}`,
        "Create an implementation checklist with files, components, and verification steps.",
        "Review the finished MVP and suggest the smallest improvements for demo quality."
      ]
    },
    pageText
  );
}

export function generateTranslation(pageText: string, language: string): TranslationResult {
  const sample = sentenceFrom(pageText, "This lesson explains how to use Claude Code to move from reading to building.");
  return {
    language,
    title: `${language} explanation for this BuildClub Claude Code lesson`,
    explanation: `Mock ${language} explanation: ${sample} The technical names Claude Code, npm, git, TypeScript, React, and terminal commands stay in English so you can copy them safely.`,
    concepts: detectConcepts(pageText),
    commandNote: "Claude Code commands and technical names are intentionally kept in English."
  };
}

export function generateSharePost(card: BuilderCardData): string {
  return `I just completed a Claude Code build challenge on BuildClub.
I built: ${card.projectName}
Score: ${card.score}/100
Badge: ${card.badge}
#BuildClub #ClaudeCode #BuildInPublic`;
}
