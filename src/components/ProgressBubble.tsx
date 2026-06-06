import { CatMascot } from "./CatMascot";

export function ProgressBubble({ progress }: { progress: number }) {
  return (
    <div className="panel flex items-center gap-4">
      <CatMascot size="sm" />
      <div className="min-w-0 flex-1">
        <div className="font-black text-emerald-200">Catnooish is watching your quest</div>
        <p className="text-sm text-slate-300">{progress >= 90 ? "Time to build from this lesson." : "Keep reading to unlock your build challenge."}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
