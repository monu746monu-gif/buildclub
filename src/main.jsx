import React from "react";
import { createRoot } from "react-dom/client";
import { ArrowDownToLine, BookOpenCheck, FileText, GitBranch, Sparkles } from "lucide-react";
import "./styles.css";

const extensionHref = "/buildclub-kito-extension.zip";

function App() {
  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,rgba(244,255,224,0.92),rgba(255,255,255,0.98)_48%)] text-ink">
      <Header />
      <section className="mx-auto grid min-h-[calc(100vh-72px)] w-[min(1180px,calc(100%-32px))] grid-cols-[minmax(0,1fr)_minmax(300px,420px)] items-center gap-14 py-10 max-[860px]:grid-cols-1 max-[860px]:gap-5">
        <div>
          <div className="inline-flex rounded-full border border-moss/25 bg-leaf/50 px-3 py-2 text-xs font-black tracking-wide text-[#264a12]">
            BUILDCLUB COURSE ASSISTANT
          </div>
          <h1 className="mt-5 max-w-[780px] text-[clamp(40px,6.4vw,76px)] font-black leading-[0.96] tracking-normal">
            Install Kito and turn every lesson into notes, flowcharts, and build ideas.
          </h1>
          <p className="mt-6 max-w-[650px] text-lg leading-8 text-sage">
            Kito follows students through BuildClub courses, summarizes completed lessons,
            creates flowchart-style PDF notes, checks understanding, and nudges them toward a build.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-ink px-5 py-4 font-black text-leaf shadow-[0_18px_44px_rgba(16,32,20,0.22)] transition hover:-translate-y-0.5"
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
    <header className="sticky top-0 z-10 mx-auto flex w-[min(1180px,calc(100%-32px))] items-center justify-between py-5">
      <a className="inline-flex items-center gap-3 font-black text-ink no-underline" href="/">
        <img className="size-10 rounded-xl object-contain" src="/logo.webp" alt="Kito logo" />
        <span className="max-[520px]:hidden">Kito made for BuildClub</span>
      </a>
      <a
        className="rounded-full border border-moss/25 bg-white/70 px-4 py-2.5 text-sm font-black text-ink no-underline backdrop-blur transition hover:-translate-y-0.5"
        href={extensionHref}
        download
      >
        Add extension
      </a>
    </header>
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
    <section className="mt-9 max-w-[620px] rounded-lg border border-moss/15 bg-white/65 p-5 shadow-soft">
      <h2 className="text-xs font-black uppercase tracking-wide text-[#264a12]">Install in Chrome</h2>
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
    <aside className="relative min-h-[540px] max-[860px]:min-h-[360px]" aria-label="Kito extension preview">
      <div className="absolute right-20 top-14 z-[1] w-[260px] rounded-2xl border-2 border-moss/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.26),rgba(200,234,90,0.15))] p-4 shadow-glass backdrop-blur-2xl max-[860px]:right-24 max-[860px]:top-3 max-[860px]:w-[min(230px,calc(100vw-48px))]">
        <span className="block text-xs font-black uppercase tracking-wide text-[#4c6b24]">Lesson completed</span>
        <strong className="mt-2 block text-2xl font-black leading-tight">Your notes PDF is ready.</strong>
      </div>
      <img
        className="absolute bottom-0 right-0 w-[min(390px,100%)] drop-shadow-[0_34px_38px_rgba(35,53,27,0.24)] max-[860px]:w-[250px]"
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
      copy: "Kito extracts key points from the BuildClub lesson after the student completes reading."
    },
    {
      icon: FileText,
      title: "Makes PDF notes",
      copy: "Completed lessons become clean notes with a flowchart-style learning path."
    },
    {
      icon: GitBranch,
      title: "Starts the build",
      copy: "Kito checks understanding and suggests project ideas from the lesson content."
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
