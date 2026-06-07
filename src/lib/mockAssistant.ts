import type { StuckContext } from "./types";

function getContextText(context: StuckContext): string {
  return context.selectedText?.trim() || context.nearbyText.trim();
}

export function explainSection(context: StuckContext): string {
  const contextText = getContextText(context);
  const location = context.nearestHeading ? ` under "${context.nearestHeading}"` : "";
  const source = context.selectedText ? "the selected text" : "the current section";

  // Replace this mock logic with a real AI/API explanation when Kito has backend support.
  if (!contextText) {
    return "Kito needs more section text before it can explain this part clearly.";
  }

  return `This part is about ${source}${location}. Read it as a small step-by-step instruction: identify the tool or concept, notice what action it asks you to take, and check what result you should expect before moving on.`;
}

export function generateSafeClaudePrompt(context: StuckContext): string {
  const contextText = getContextText(context) || "No section text was captured.";

  // Replace this mock prompt builder with project-aware AI/API logic later.
  if (context.hasCodeBlock) {
    return `Inspect this code or concept first.
Explain what it does.
Identify possible issues.
Suggest a safe debugging plan.
Do not modify files until I approve.

Section:
${contextText}`;
  }

  return `Read the following section and help me apply it to my current project.
First explain the concept in simple language.
Then create a small implementation plan.
Do not edit files until I approve.
Keep the changes small and explain every change.

Section:
${contextText}`;
}

export function summarizeStuckContext(context: StuckContext): string {
  const heading = context.nearestHeading ? ` near "${context.nearestHeading}"` : "";
  const selected = context.selectedText ? " after selecting text" : "";
  return `Learner may be stuck${heading}${selected}. Trigger: ${context.triggerReason}.`;
}
