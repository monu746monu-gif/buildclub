import { Clipboard, Send } from "lucide-react";
import type { BuildPlanType } from "../lib/types";

export function BuildPlan({ plan, onSubmit }: { plan: BuildPlanType; onSubmit: () => void }) {
  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="text-xs font-black uppercase text-emerald-300">Build Plan</div>
        <h2 className="mt-2 text-2xl font-black leading-tight">{plan.projectTitle}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">{plan.goal}</p>
      </div>
      <ListBlock title="Features" items={plan.features} />
      <ListBlock title="Step-by-step Implementation Plan" items={plan.steps} ordered />
      <div className="panel">
        <h3 className="section-title">Claude Code Prompts to Copy</h3>
        <div className="mt-3 space-y-2">
          {plan.prompts.map((prompt) => (
            <button key={prompt} onClick={() => copy(prompt)} className="flex w-full items-start gap-2 rounded-xl bg-slate-950 p-3 text-left text-xs leading-5 text-slate-200 hover:bg-slate-800">
              <Clipboard className="mt-0.5 shrink-0 text-emerald-300" size={15} />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </div>
      <ListBlock title="Submission Checklist" items={plan.checklist} />
      <button className="btn-primary w-full justify-center" onClick={onSubmit}>
        <Send size={16} />
        Submit Build
      </button>
    </div>
  );
}

function ListBlock({ title, items, ordered = false }: { title: string; items: string[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <div className="panel">
      <h3 className="section-title">{title}</h3>
      <Tag className="mt-3 space-y-2">
        {items.map((item, index) => (
          <li key={item} className="rounded-xl bg-slate-900 p-3 text-sm leading-5 text-slate-200">
            {ordered ? <span className="mr-2 font-black text-emerald-300">{index + 1}.</span> : null}
            {item}
          </li>
        ))}
      </Tag>
    </div>
  );
}
