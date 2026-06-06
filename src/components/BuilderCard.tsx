import { Copy } from "lucide-react";
import { generateSharePost } from "../lib/mockAi";
import type { BuilderCardData, BuildScore } from "../lib/types";

export function BuilderCard({ card, score }: { card?: BuilderCardData; score?: BuildScore }) {
  if (!card || !score) {
    return (
      <div className="panel">
        <h2 className="text-xl font-black">No builder card yet</h2>
        <p className="mt-2 text-sm text-slate-300">Submit your project to unlock a score, badge, and shareable card.</p>
      </div>
    );
  }

  const sharePost = generateSharePost(card);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[28px] border border-emerald-300/30 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 p-5 shadow-glow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase text-emerald-300">BuildClub Claude Code</div>
            <h2 className="mt-2 text-2xl font-black">{card.projectName}</h2>
            <p className="mt-1 text-sm text-slate-300">by {card.builderName}</p>
          </div>
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-300 text-2xl font-black text-slate-950">{card.score}</div>
        </div>
        <div className="mt-5 rounded-2xl bg-white/10 p-4">
          <div className="text-sm font-black text-emerald-200">{card.badge}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {card.skills.map((skill) => (
              <span key={skill} className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-slate-200">{skill}</span>
            ))}
          </div>
        </div>
        <div className="mt-4 grid gap-2 text-xs text-slate-300">
          <a href={card.githubLink} target="_blank" className="truncate text-sky-300" rel="noreferrer">{card.githubLink || "GitHub link not added"}</a>
          <a href={card.demoLink} target="_blank" className="truncate text-sky-300" rel="noreferrer">{card.demoLink || "Demo link not added"}</a>
        </div>
      </div>
      <div className="panel">
        <h3 className="section-title">Score Feedback</h3>
        <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs font-black">
          {Object.entries(score.breakdown).map(([key, value]) => (
            <div key={key} className="rounded-xl bg-slate-900 p-3">
              <div className="capitalize text-slate-400">{key.replace(/[A-Z]/g, " $&")}</div>
              <div className="mt-1 text-lg text-emerald-300">{value}</div>
            </div>
          ))}
        </div>
        <h4 className="mt-4 text-sm font-black text-emerald-200">What is good</h4>
        <ul className="mt-2 space-y-2 text-sm text-slate-300">{score.good.map((item) => <li key={item}>{item}</li>)}</ul>
        <h4 className="mt-4 text-sm font-black text-sky-200">What can improve</h4>
        <ul className="mt-2 space-y-2 text-sm text-slate-300">{score.improve.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
      <button className="btn-primary w-full justify-center" onClick={() => navigator.clipboard.writeText(sharePost)}>
        <Copy size={16} />
        Copy Share Post
      </button>
    </div>
  );
}
