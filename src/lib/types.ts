export type StuckTriggerReason =
  | "same-section-pause"
  | "repeated-scroll"
  | "text-selected"
  | "code-block-pause";

export type StuckContext = {
  url: string;
  title: string;
  selectedText?: string;
  nearbyText: string;
  nearestHeading?: string;
  hasCodeBlock: boolean;
  triggerReason: StuckTriggerReason;
  scrollY: number;
  timestamp: number;
};
