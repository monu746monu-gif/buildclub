import React from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowDownToLine,
  BookOpenCheck,
  Bot,
  BrainCircuit,
  FileText,
  GitBranch,
  MessageCircle,
  Sparkles,
  Target
} from "lucide-react";
import "./styles.css";

const extensionHref = "/buildclub-kito-extension.zip";

function App() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8fbef] text-ink">
      <Header />
      <section className="relative mx-auto grid min-h-[calc(100vh-76px)] w-[min(1180px,calc(100%-32px))] grid-cols-[minmax(0,1fr)_minmax(320px,440px)] items-center gap-14 py-10 max-[900px]:grid-cols-1 max-[900px]:gap-6">
        <div className="relative z-[1]">
          <div className="inline-flex items-center gap-2 rounded-full border border-moss/20 bg-white/80 px-3 py-2 text-xs font-black text-[#264a12] shadow-soft">
            <Sparkles size={14} strokeWidth={3} />
            Study companion for BuildClub learners
          </div>
          <h1 className="hero-headline mt-6 max-w-[720px] text-[clamp(38px,5vw,66px)] font-bold leading-[1.02] text-ink">
            Install <span className="headline-kito">Kito</span> and increase your studying efficiency by 100%.
          </h1>
          <p className="mt-6 max-w-[660px] text-lg font-semibold leading-8 text-sage">
            You learn. Kito quietly makes notes, spots where you are stuck, helps you build projects from each lesson, and talks to you like a focused study companion.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              className="extension-cta inline-flex items-center justify-center gap-3 rounded-full bg-ink px-6 py-4 font-black text-leaf shadow-[0_18px_44px_rgba(16,32,20,0.22)]"
              href={extensionHref}
              download
            >
              <span className="grid size-6 place-items-center rounded-full bg-leaf text-ink">
                <ArrowDownToLine size={15} strokeWidth={3} />
              </span>
              Add extension
            </a>
            <p className="max-w-[280px] text-sm font-bold leading-5 text-sage">
              Chrome extension zip included. Unzip and load unpacked.
            </p>
          </div>

          <HeroProof />
          <InstallSteps />
        </div>

        <KitoPreview />
      </section>

      <Features />
    </main>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-[#f8fbef]/78 backdrop-blur-xl">
      <div className="mx-auto flex w-[min(1180px,calc(100%-32px))] items-center justify-between py-4">
      <a className="brand-lockup group inline-flex items-center gap-3 no-underline" href="/">
        <span className="brand-mark relative grid size-14 place-items-center rounded-2xl bg-white shadow-soft">
          <img className="size-12 object-contain" src="/2-cutout.png" alt="Kito logo" />
        </span>
        <span className="grid leading-none">
          <span className="brand-name text-3xl font-black">Kito</span>
          <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-light text-ink">
            made for
            <span>BuildClub</span>
            <img className="size-8 rounded object-contain" src="/logo.webp" alt="BuildClub logo" />
          </span>
        </span>
      </a>
      <a
        className="nav-cta inline-flex items-center justify-center gap-2 rounded-full border border-moss/25 bg-white/80 px-5 py-3 text-sm font-medium text-ink no-underline shadow-soft"
        href={extensionHref}
        download
      >
        <ArrowDownToLine size={16} strokeWidth={2.4} />
        Add extension
      </a>
      </div>
    </header>
  );
}

function HeroProof() {
  const proof = [
    { icon: FileText, label: "Makes notes for you" },
    { icon: Target, label: "Finds stuck moments" },
    { icon: GitBranch, label: "Turns learning into projects" },
    { icon: MessageCircle, label: "Talks while you study" }
  ];

  return (
    <div className="mt-8 grid max-w-[690px] grid-cols-2 gap-3 max-[620px]:grid-cols-1">
      {proof.map(({ icon: Icon, label }) => (
        <div key={label} className="proof-chip flex items-center gap-3 rounded-lg border border-moss/15 bg-white/72 px-4 py-3 shadow-soft">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-leaf/80 text-ink">
            <Icon size={18} strokeWidth={2.8} />
          </span>
          <span className="text-sm font-black text-[#29451d]">{label}</span>
        </div>
      ))}
    </div>
  );
}

function InstallSteps() {
  const steps = [
    "Click Add extension to download the zip.",
    "Unzip it on your computer.",
    "Open chrome://extensions.",
    "Turn on Developer mode.",
    "Click Load unpacked and select the unzipped folder."
  ];

  return (
    <section className="mt-9 max-w-[620px] rounded-lg border border-moss/15 bg-white/78 p-5 shadow-soft">
      <h2 className="text-xs font-black uppercase text-[#264a12]">Install in Chrome</h2>
      <ol className="mt-3 grid list-decimal gap-2 pl-5 leading-6 text-[#2d3f2a]">
        {steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  );
}

function KitoPreview() {
  return (
    <aside className="relative min-h-[560px] -translate-y-8 max-[900px]:min-h-[420px] max-[900px]:-translate-y-4" aria-label="Kito extension preview">
      <div className="hero-ring absolute left-2 top-2 size-[360px] rounded-full border border-moss/15 bg-white/55 max-[900px]:left-auto max-[900px]:right-6 max-[900px]:size-[290px]" />
      <div className="preview-card preview-card-one absolute right-24 top-2 z-[2] w-[260px] rounded-lg border border-moss/20 bg-white/88 p-4 shadow-glass backdrop-blur-xl max-[900px]:right-16 max-[900px]:top-2 max-[900px]:w-[230px]">
        <span className="flex items-center gap-2 text-xs font-black uppercase text-[#4c6b24]">
          <BrainCircuit size={14} strokeWidth={3} />
          Stuck detected
        </span>
        <strong className="mt-2 block text-2xl font-black leading-tight">Need help here?</strong>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-black text-[#29451d]">
          <span className="rounded-md bg-leaf/65 px-2 py-2 text-center">Explain</span>
          <span className="rounded-md bg-[#eef7d1] px-2 py-2 text-center">Docs</span>
        </div>
      </div>
      <div className="preview-card preview-card-two absolute bottom-20 left-0 z-[2] w-[245px] rounded-lg border border-moss/20 bg-white/88 p-4 shadow-glass backdrop-blur-xl max-[900px]:left-2 max-[900px]:bottom-8">
        <span className="flex items-center gap-2 text-xs font-black uppercase text-[#4c6b24]">
          <Bot size={14} strokeWidth={3} />
          Study companion
        </span>
        <strong className="mt-2 block text-xl font-black leading-tight">Start building while learning.</strong>
      </div>
      <img
        className="kito-hero-img absolute bottom-12 right-0 z-[3] w-[min(410px,100%)] drop-shadow-[0_34px_38px_rgba(35,53,27,0.24)] max-[900px]:bottom-16 max-[900px]:w-[270px]"
        src="/2-cutout.png"
        alt="Kito BuildClub assistant"
      />
    </aside>
  );
}

function Features() {
  const features = [
    {
      icon: BookOpenCheck,
      title: "Reads the lesson",
      copy: "Kito turns course reading into simple notes without interrupting your flow."
    },
    {
      icon: FileText,
      title: "Finds stuck spots",
      copy: "Pauses, repeated scrolling, text selection, and code blocks can trigger helpful support."
    },
    {
      icon: GitBranch,
      title: "Starts building",
      copy: "Each lesson can become a safe Claude prompt and a small project plan."
    }
  ];

  return (
    <section className="mx-auto grid w-[min(1180px,calc(100%-32px))] grid-cols-3 gap-4 pb-20 max-[860px]:grid-cols-1">
      {features.map(({ icon: Icon, title, copy }, index) => (
        <article key={title} className="rounded-lg border border-moss/15 bg-white p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-leaf/70 text-ink">
              <Icon size={18} strokeWidth={2.8} />
            </span>
            <span className="text-xs font-black text-[#709f27]">0{index + 1}</span>
          </div>
          <h2 className="mt-4 text-xl font-black">{title}</h2>
          <p className="mt-3 leading-6 text-sage">{copy}</p>
        </article>
      ))}
      <article className="rounded-lg border border-moss/15 bg-ink p-6 text-white shadow-soft">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-leaf text-ink">
            <Sparkles size={18} strokeWidth={2.8} />
          </span>
          <span className="text-xs font-black text-leaf">READY</span>
        </div>
        <h2 className="mt-4 text-xl font-black">Extension included</h2>
        <p className="mt-3 leading-6 text-[#dbe8d4]">
          The download button points directly to the packaged BuildClub Kito extension zip.
        </p>
      </article>
    </section>
  );
}

createRoot(document.getElementById("root")).render(<App />);
