import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BookOpen, Hammer, Languages, Send, Trophy } from "lucide-react";
import "../../src/styles.css";
import { CatMascot } from "../../src/components/CatMascot";
import { SummaryCard } from "../../src/components/SummaryCard";
import { BuildIdeaCard } from "../../src/components/BuildIdeaCard";
import { BuildPlan } from "../../src/components/BuildPlan";
import { SubmitBuild } from "../../src/components/SubmitBuild";
import { BuilderCard } from "../../src/components/BuilderCard";
import { TranslatePanel } from "../../src/components/TranslatePanel";
import { MESSAGE_TYPES, type PageContext } from "../../src/lib/messages";
import { generateBuildPlan, generateLessonSummary, generatePlanFromUserIdea, generateProjectIdeas, generateTranslation } from "../../src/lib/mockAi";
import { createBuilderCard, scoreSubmission } from "../../src/lib/scoring";
import { getActiveSidePanelTab, getActiveUrl, getLessonState, patchLessonState } from "../../src/lib/storage";
import type { BuildPlanType, LessonState, ProjectIdea, Submission } from "../../src/lib/types";

type Tab = "learn" | "build" | "submit" | "card" | "translate";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "learn", label: "Learn", icon: <BookOpen size={16} /> },
  { id: "build", label: "Build", icon: <Hammer size={16} /> },
  { id: "submit", label: "Submit", icon: <Send size={16} /> },
  { id: "card", label: "Card", icon: <Trophy size={16} /> },
  { id: "translate", label: "Translate", icon: <Languages size={16} /> }
];

const examples: ProjectIdea[] = [
  {
    id: "example-readme",
    title: "AI README Generator",
    difficulty: "Beginner",
    estimatedTime: "45 min",
    whatToBuild: "Generate polished README files from a few project details.",
    skillsLearned: ["structured prompts", "documentation"],
    prompts: ["Create a README generator UI and mock output."]
  },
  {
    id: "example-bug",
    title: "Bug Fix Assistant",
    difficulty: "Intermediate",
    estimatedTime: "90 min",
    whatToBuild: "Turn bug reports into reproduction steps and Claude Code prompts.",
    skillsLearned: ["debugging", "test planning"],
    prompts: ["Analyze this bug report and create a fix checklist."]
  },
  {
    id: "example-review",
    title: "Code Review Bot",
    difficulty: "Advanced",
    estimatedTime: "2 hr",
    whatToBuild: "Review code diffs for risks, missing tests, and next actions.",
    skillsLearned: ["diff review", "quality gates"],
    prompts: ["Review this diff and prioritize concrete issues."]
  },
  {
    id: "example-refactor",
    title: "Landing Page Refactor Tool",
    difficulty: "Intermediate",
    estimatedTime: "90 min",
    whatToBuild: "Suggest copy, layout, and component refactors for a landing page.",
    skillsLearned: ["frontend QA", "iteration"],
    prompts: ["Improve this landing page while preserving its product goal."]
  }
];

function App() {
  const [state, setState] = useState<LessonState>();
  const [tab, setTab] = useState<Tab>("learn");
  const [customIdea, setCustomIdea] = useState("");
  const [mode, setMode] = useState<"choice" | "plan" | "ideas" | "examples">("choice");
  const [language, setLanguage] = useState("Hindi");

  const summary = useMemo(() => state?.summary ?? generateLessonSummary(state?.pageText ?? ""), [state]);

  useEffect(() => {
    void initialize();
  }, []);

  async function initialize() {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let context: PageContext | undefined;
    if (activeTab?.id) {
      try {
        const response = await chrome.tabs.sendMessage(activeTab.id, { type: MESSAGE_TYPES.GET_PAGE_CONTEXT });
        context = response?.payload;
      } catch {
        context = undefined;
      }
    }

    const url = context?.url ?? activeTab?.url ?? (await getActiveUrl()) ?? "unknown-page";
    const existing = await getLessonState(url);
    const next = await patchLessonState(url, {
      title: context?.title ?? activeTab?.title ?? existing?.title ?? "BuildClub Claude Code lesson",
      pageText: context?.pageText ?? existing?.pageText ?? "",
      readingProgress: context?.readingProgress ?? existing?.readingProgress ?? 0,
      summary: existing?.summary ?? generateLessonSummary(context?.pageText ?? existing?.pageText ?? "")
    });
    setState(next);
    setTab(((await getActiveSidePanelTab()) as Tab | undefined) ?? "learn");
    if (next.buildPlan) setMode("plan");
  }

  async function update(patch: Partial<LessonState>) {
    if (!state) return;
    const next = await patchLessonState(state.url, patch);
    setState(next);
  }

  async function makeIdeas() {
    const ideas = state?.ideas ?? generateProjectIdeas(state?.pageText ?? "");
    await update({ ideas });
    setMode("ideas");
  }

  async function selectIdea(idea: ProjectIdea) {
    const buildPlan = generateBuildPlan(idea, state?.pageText ?? "");
    await update({ selectedIdea: idea, buildPlan });
    setMode("plan");
  }

  async function generateCustomPlan() {
    const buildPlan = generatePlanFromUserIdea(customIdea, state?.pageText ?? "");
    await update({ buildPlan });
    setMode("plan");
  }

  async function submitBuild(submission: Submission) {
    const score = scoreSubmission(submission, state?.buildPlan);
    const card = createBuilderCard(submission, score);
    await update({ submission, score, card });
    setTab("card");
  }

  async function translate(selectedLanguage = language) {
    setLanguage(selectedLanguage);
    await update({ translation: generateTranslation(state?.pageText ?? "", selectedLanguage) });
  }

  if (!state) {
    return <div className="min-h-screen bg-slate-950 p-5 text-white">Loading Catnooish Quest...</div>;
  }

  const progress = Math.max(state.readingProgress, state.completed ? 100 : 0);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/95 px-4 pb-3 pt-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <CatMascot size="sm" />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black">Catnooish Quest</h1>
            <p className="truncate text-xs text-slate-400">BuildClub Claude Code lesson</p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-2 text-xs font-bold text-emerald-300">{progress}% reading progress</div>
        <nav className="mt-4 grid grid-cols-5 gap-1">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-bold transition ${
                tab === item.id ? "bg-emerald-400 text-slate-950" : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </section>

      <section className="space-y-4 p-4">
        {state.completed && !state.card ? (
          <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-4 shadow-glow">
            <div className="text-sm font-black text-emerald-200">You studied so much today 😼</div>
            <p className="mt-1 text-sm text-slate-200">Why not build something from this lesson?</p>
          </div>
        ) : null}

        {state.card ? (
          <div className="rounded-2xl border border-sky-400/30 bg-sky-400/10 p-4">
            <div className="font-black text-sky-200">Welcome back builder 😼</div>
            <p className="mt-1 text-sm text-slate-300">You already studied this lesson. Want to continue your build?</p>
            <div className="mt-3 flex gap-2">
              <button className="btn-primary" onClick={() => setTab("build")}>Continue Build</button>
              <button className="btn-secondary" onClick={() => setTab("card")}>View Builder Card</button>
            </div>
          </div>
        ) : null}

        {tab === "learn" ? <SummaryCard summary={summary} title={state.title} /> : null}

        {tab === "build" ? (
          <div className="space-y-4">
            {mode === "choice" ? (
              <div className="panel">
                <h2 className="text-lg font-black">What do you want to build from this knowledge?</h2>
                <div className="mt-4 grid gap-2">
                  <button className="btn-primary" onClick={() => setMode("plan")}>I have a plan</button>
                  <button className="btn-secondary" onClick={makeIdeas}>Help me find an idea</button>
                  <button className="btn-secondary" onClick={() => setMode("examples")}>Show builder examples</button>
                </div>
              </div>
            ) : null}
            {mode === "plan" && !state.buildPlan ? (
              <div className="panel">
                <label className="text-sm font-black">Describe your project idea in one line</label>
                <textarea className="field mt-2 min-h-24" value={customIdea} onChange={(event) => setCustomIdea(event.target.value)} placeholder="Example: A tool that converts lesson notes into Claude Code prompts" />
                <button className="btn-primary mt-3" onClick={generateCustomPlan}>Generate Build Plan</button>
              </div>
            ) : null}
            {mode === "ideas" ? (
              <div className="grid gap-3">
                {(state.ideas ?? []).map((idea) => <BuildIdeaCard key={idea.id} idea={idea} onSelect={selectIdea} />)}
              </div>
            ) : null}
            {mode === "examples" ? (
              <div className="grid gap-3">
                {examples.map((idea) => <BuildIdeaCard key={idea.id} idea={idea} onSelect={selectIdea} />)}
              </div>
            ) : null}
            {state.buildPlan ? <BuildPlan plan={state.buildPlan as BuildPlanType} onSubmit={() => setTab("submit")} /> : null}
          </div>
        ) : null}

        {tab === "submit" ? <SubmitBuild initialProjectName={state.buildPlan?.projectTitle} onSubmit={submitBuild} /> : null}
        {tab === "card" ? <BuilderCard card={state.card} score={state.score} /> : null}
        {tab === "translate" ? <TranslatePanel language={language} translation={state.translation} onTranslate={translate} /> : null}
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
