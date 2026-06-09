import BuildClubCard from "./BuildClubCard";

export function BuildClubCardDemo() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_50%_12%,rgba(255,216,137,.36),transparent_34%),linear-gradient(180deg,#f9f8f5,#eeeae2)] px-4 py-8 text-white">
      <section className="mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-5xl place-items-center">
        <BuildClubCard
          notesHref="#notes"
          certificateHref="#certificate"
          shareText="I am officially part of BuildClub. My notes and certificate are ready."
        />
      </section>
    </main>
  );
}

export default BuildClubCardDemo;
