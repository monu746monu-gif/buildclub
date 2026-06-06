export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type LessonSummary = {
  mainTopic: string;
  keyTakeaways: string[];
  concepts: string[];
  tools: string[];
  buildTakeaway: string;
};

export type ProjectIdea = {
  id: string;
  title: string;
  difficulty: Difficulty;
  estimatedTime: string;
  whatToBuild: string;
  skillsLearned: string[];
  prompts: string[];
};

export type BuildPlanType = {
  projectTitle: string;
  goal: string;
  features: string[];
  steps: string[];
  prompts: string[];
  checklist: string[];
};

export type Submission = {
  builderName: string;
  projectName: string;
  githubLink: string;
  demoLink: string;
  builtDescription: string;
  learned: string;
  promptsUsed: string;
  submittedAt: string;
};

export type ScoreBreakdown = {
  ideaClarity: number;
  relevance: number;
  workingDemo: number;
  presentation: number;
  creativity: number;
  reflection: number;
};

export type BuildScore = {
  total: number;
  badge: Badge;
  breakdown: ScoreBreakdown;
  good: string[];
  improve: string[];
  skills: string[];
};

export type Badge = "Gold Builder" | "Silver Builder" | "Bronze Builder" | "Builder Starter";

export type BuilderCardData = {
  builderName: string;
  projectName: string;
  course: "Claude Code";
  score: number;
  badge: Badge;
  githubLink: string;
  demoLink: string;
  skills: string[];
};

export type TranslationResult = {
  language: string;
  title: string;
  explanation: string;
  concepts: string[];
  commandNote: string;
};

export type LessonState = {
  url: string;
  title: string;
  pageText: string;
  readingProgress: number;
  completed: boolean;
  summary?: LessonSummary;
  ideas?: ProjectIdea[];
  selectedIdea?: ProjectIdea;
  buildPlan?: BuildPlanType;
  submission?: Submission;
  score?: BuildScore;
  card?: BuilderCardData;
  translation?: TranslationResult;
  updatedAt: string;
};
