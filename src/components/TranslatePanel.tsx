import type { TranslationResult } from "../lib/types";

const languages = ["Hindi", "Spanish", "French", "Japanese", "Korean"];

export function TranslatePanel({
  language,
  translation,
  onTranslate
}: {
  language: string;
  translation?: TranslationResult;
  onTranslate: (language: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="panel">
        <h2 className="text-xl font-black">Translate and explain</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">Choose a language. Claude Code commands and technical names stay in English.</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {languages.map((item) => (
            <button key={item} className={item === language ? "btn-primary" : "btn-secondary"} onClick={() => onTranslate(item)}>{item}</button>
          ))}
        </div>
        <input className="field mt-3" placeholder="Custom language" onKeyDown={(event) => {
          if (event.key === "Enter" && event.currentTarget.value.trim()) onTranslate(event.currentTarget.value.trim());
        }} />
      </div>
      {translation ? (
        <div className="panel">
          <div className="text-xs font-black uppercase text-emerald-300">{translation.language}</div>
          <h3 className="mt-2 text-lg font-black">{translation.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">{translation.explanation}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {translation.concepts.map((concept) => <span key={concept} className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold">{concept}</span>)}
          </div>
          <p className="mt-4 rounded-xl bg-sky-400/10 p-3 text-xs font-bold text-sky-200">{translation.commandNote}</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-700 p-5 text-sm text-slate-400">Pick a language to generate a mock translation.</div>
      )}
    </div>
  );
}
