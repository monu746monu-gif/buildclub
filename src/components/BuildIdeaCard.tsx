import type { ProjectIdea } from "../lib/types";

export function BuildIdeaCard({ idea, onSelect }: { idea: ProjectIdea; onSelect: (idea: ProjectIdea) => void }) {
  return (
    <article className="panel">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase text-sky-300">{idea.difficulty} • {idea.estimatedTime}</div>
          <h3 className="mt-1 text-lg font-black">{idea.title}</h3>
        </div>
        <button className="btn-primary shrink-0" onClick={() => onSelect(idea)}>Select</button>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{idea.whatToBuild}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {idea.skillsLearned.map((skill) => (
          <span key={skill} className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200">{skill}</span>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {idea.prompts.map((prompt) => (
          <code key={prompt} className="block rounded-xl bg-slate-950 p-3 text-xs leading-5 text-slate-200">{prompt}</code>
        ))}
      </div>
    </article>
  );
}
