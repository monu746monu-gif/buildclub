import type { Badge, BuildPlanType, BuildScore, BuilderCardData, Submission } from "./types";

export function badgeForScore(score: number): Badge {
  if (score >= 90) return "Gold Builder";
  if (score >= 75) return "Silver Builder";
  if (score >= 60) return "Bronze Builder";
  return "Builder Starter";
}

export function scoreSubmission(submission: Submission, buildPlan?: BuildPlanType): BuildScore {
  const ideaClarity = Math.min(20, 8 + Math.floor(submission.projectName.length / 4) + Math.floor(submission.builtDescription.length / 30));
  const relevance = Math.min(20, buildPlan ? 16 : 10 + Math.floor(submission.promptsUsed.length / 30));
  const workingDemo = (submission.githubLink ? 10 : 0) + (submission.demoLink ? 15 : 0);
  const presentation = Math.min(15, 5 + Math.floor((submission.githubLink.length + submission.builtDescription.length) / 45));
  const creativity = Math.min(10, 4 + Math.floor(submission.builtDescription.length / 80));
  const reflection = Math.min(10, submission.learned.length > 80 ? 10 : submission.learned.length > 20 ? 7 : 3);
  const total = ideaClarity + relevance + workingDemo + presentation + creativity + reflection;
  const badge = badgeForScore(total);

  return {
    total,
    badge,
    breakdown: { ideaClarity, relevance, workingDemo, presentation, creativity, reflection },
    good: [
      submission.githubLink ? "You included a GitHub link, which makes the build reviewable." : "Your project idea has a clear direction.",
      submission.demoLink ? "The demo link gives your work a stronger shipping signal." : "Your write-up explains what you built.",
      submission.promptsUsed ? "You documented Claude Code prompts, which makes the workflow reusable." : "You captured a learning reflection."
    ],
    improve: [
      submission.demoLink ? "Add screenshots or a short demo script for stronger presentation." : "Add a working demo link or screen recording.",
      submission.learned.length > 80 ? "Push one extra feature that shows the lesson concept in action." : "Expand the learning reflection with one specific mistake and fix."
    ],
    skills: Array.from(
      new Set([
        ...(buildPlan?.features ?? ["MVP scoping", "Claude Code prompting"]),
        "BuildClub Claude Code",
        "Demo shipping"
      ])
    ).slice(0, 6)
  };
}

export function createBuilderCard(submission: Submission, score: BuildScore): BuilderCardData {
  return {
    builderName: submission.builderName || "BuildClub Builder",
    projectName: submission.projectName || "Claude Code Quest",
    course: "Claude Code",
    score: score.total,
    badge: score.badge,
    githubLink: submission.githubLink,
    demoLink: submission.demoLink,
    skills: score.skills
  };
}
