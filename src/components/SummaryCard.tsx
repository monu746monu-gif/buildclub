import type { LessonSummary } from "../lib/types";

export function SummaryCard({ summary, title }: { summary: LessonSummary; title: string }) {
  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="text-xs font-black uppercase tracking-wide text-emerald-300">Lesson Summary</div>
        <h2 className="mt-2 text-xl font-black leading-tight">{title || summary.mainTopic}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">{summary.mainTopic}</p>
      </div>
      <div className="panel">
        <h3 className="section-title">Key Takeaways</h3>
        <ul className="mt-3 space-y-2">
          {summary.keyTakeaways.map((item) => (
            <li key={item} className="rounded-xl bg-slate-900 p-3 text-sm leading-5 text-slate-200">{item}</li>
          ))}
        </ul>
      </div>
      <div className="grid gap-4">
        <InfoList title="Important Claude Code Concepts" items={summary.concepts} />
        <InfoList title="Tools and Commands to Try" items={summary.tools} />
      </div>
      <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm font-bold text-emerald-100">
        {summary.buildTakeaway}
      </div>
    </div>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="panel">
      <h3 className="section-title">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-200">{item}</span>
        ))}
      </div>
    </div>
  );
}
