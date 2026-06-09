import { useRef, useState, type MouseEvent } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Award, Copy, Download, FileText } from "lucide-react";
import { toPng } from "html-to-image";

export type BuildClubCardProps = {
  shareText?: string;
  notesHref?: string;
  certificateHref?: string;
};

const defaultShareText = "I am officially a BuildClub member. Notes and certificate are ready.";

export function BuildClubCard({
  shareText = defaultShareText,
  notesHref = "#notes",
  certificateHref = "#certificate"
}: BuildClubCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 180, damping: 18, mass: 0.5 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 180, damping: 18, mass: 0.5 });
  const [status, setStatus] = useState("");

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateX.set((0.5 - py) * 10);
    rotateY.set((px - 0.5) * 12);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  async function downloadCard() {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, {
      cacheBust: true,
      pixelRatio: 3,
      backgroundColor: "transparent"
    });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "buildclub-membership-card.png";
    link.click();
    setStatus("Downloaded PNG");
  }

  async function copyShareText() {
    await navigator.clipboard.writeText(shareText);
    setStatus("Share text copied");
  }

  return (
    <div className="grid w-full place-items-center gap-3 px-3 py-4 [perspective:1100px]">
      <style>{`
        @keyframes bc-card-scan {
          0%, 38% { transform: translateX(-72%) rotate(12deg); }
          72%, 100% { transform: translateX(72%) rotate(12deg); }
        }
        @keyframes bc-card-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>

      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 18, rotateX: -8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative aspect-[2/3] w-full max-w-[330px] overflow-hidden rounded-[32px] bg-[#fff0c9] shadow-[0_22px_54px_rgba(48,39,27,.24)] [animation:bc-card-float_4s_ease-in-out_infinite]"
      >
        <img src="/card2.png" alt="BuildClub membership card" className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-[43%] w-[23%] bg-[linear-gradient(90deg,rgba(21,18,14,.88),rgba(21,18,14,.44)_54%,rgba(21,18,14,.12)_82%,transparent),linear-gradient(180deg,rgba(21,18,14,.52),transparent_68%)]" />
        <div className="pointer-events-none absolute -inset-16 z-20 translate-x-[-72%] rotate-12 animate-[bc-card-scan_3.2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </motion.div>

      <div className="flex w-full max-w-[330px] gap-3">
        <a className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#e9572b]/25 bg-white px-3 py-2.5 text-xs font-black text-[#e9572b] shadow-lg no-underline" href={notesHref}>
          <FileText size={15} />
          Notes
        </a>
        <a className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#e9572b]/25 bg-white px-3 py-2.5 text-xs font-black text-[#e9572b] shadow-lg no-underline" href={certificateHref}>
          <Award size={15} />
          Certificate
        </a>
      </div>

      <div className="flex w-full max-w-[330px] gap-3">
        <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#e9572b] px-3 py-2.5 text-xs font-black text-white shadow-lg" type="button" onClick={downloadCard}>
          <Download size={15} />
          Download
        </button>
        <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#e9572b]/25 bg-white px-3 py-2.5 text-xs font-black text-[#e9572b] shadow-lg" type="button" onClick={copyShareText}>
          <Copy size={15} />
          Copy
        </button>
      </div>
      <div className="min-h-5 text-xs font-black text-[#e9572b]" aria-live="polite">{status}</div>
    </div>
  );
}

export default BuildClubCard;
