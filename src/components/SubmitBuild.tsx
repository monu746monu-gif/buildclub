import { useState } from "react";
import type { Submission } from "../lib/types";

export function SubmitBuild({ initialProjectName, onSubmit }: { initialProjectName?: string; onSubmit: (submission: Submission) => void }) {
  const [form, setForm] = useState({
    builderName: "",
    projectName: initialProjectName ?? "",
    githubLink: "",
    demoLink: "",
    builtDescription: "",
    learned: "",
    promptsUsed: ""
  });

  function field(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <form
      className="panel space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ ...form, submittedAt: new Date().toISOString() });
      }}
    >
      <h2 className="text-xl font-black">Submit your BuildClub build</h2>
      <Input label="Builder name" value={form.builderName} onChange={(value) => field("builderName", value)} />
      <Input label="Project name" value={form.projectName} onChange={(value) => field("projectName", value)} required />
      <Input label="GitHub link" value={form.githubLink} onChange={(value) => field("githubLink", value)} />
      <Input label="Demo link" value={form.demoLink} onChange={(value) => field("demoLink", value)} />
      <TextArea label="What did you build?" value={form.builtDescription} onChange={(value) => field("builtDescription", value)} />
      <TextArea label="What did you learn?" value={form.learned} onChange={(value) => field("learned", value)} />
      <TextArea label="Which Claude Code prompts did you use?" value={form.promptsUsed} onChange={(value) => field("promptsUsed", value)} />
      <button className="btn-primary w-full justify-center" type="submit">Generate Build Score</button>
    </form>
  );
}

function Input({ label, value, onChange, required }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-slate-400">{label}</span>
      <input className="field mt-1" value={value} required={required} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase text-slate-400">{label}</span>
      <textarea className="field mt-1 min-h-24" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
