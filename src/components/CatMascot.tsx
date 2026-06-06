export function CatMascot({ size = "lg" }: { size?: "sm" | "lg" }) {
  const classes = size === "sm" ? "h-12 w-12 text-2xl rounded-2xl" : "h-20 w-20 text-5xl rounded-[28px]";
  return (
    <div className={`${classes} grid shrink-0 place-items-center bg-gradient-to-br from-emerald-200 via-sky-300 to-emerald-400 shadow-glow`}>
      😼
    </div>
  );
}
