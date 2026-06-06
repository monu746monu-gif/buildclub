import type { LessonState } from "./types";

export const MESSAGE_TYPES = {
  PAGE_TEXT_EXTRACTED: "PAGE_TEXT_EXTRACTED",
  READING_PROGRESS_UPDATED: "READING_PROGRESS_UPDATED",
  LESSON_COMPLETED: "LESSON_COMPLETED",
  START_BUILDING_CLICKED: "START_BUILDING_CLICKED",
  TRANSLATE_CLICKED: "TRANSLATE_CLICKED",
  GET_PAGE_CONTEXT: "GET_PAGE_CONTEXT",
  PAGE_CONTEXT_RESPONSE: "PAGE_CONTEXT_RESPONSE",
  OPEN_SIDE_PANEL: "OPEN_SIDE_PANEL"
} as const;

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

export type PageContext = {
  url: string;
  title: string;
  pageText: string;
  readingProgress: number;
};

export type ExtensionMessage =
  | { type: typeof MESSAGE_TYPES.PAGE_TEXT_EXTRACTED; payload: PageContext }
  | { type: typeof MESSAGE_TYPES.READING_PROGRESS_UPDATED; payload: Pick<PageContext, "url" | "title" | "readingProgress"> }
  | { type: typeof MESSAGE_TYPES.LESSON_COMPLETED; payload: PageContext }
  | { type: typeof MESSAGE_TYPES.START_BUILDING_CLICKED; payload: PageContext }
  | { type: typeof MESSAGE_TYPES.TRANSLATE_CLICKED; payload: PageContext & { language?: string } }
  | { type: typeof MESSAGE_TYPES.GET_PAGE_CONTEXT }
  | { type: typeof MESSAGE_TYPES.PAGE_CONTEXT_RESPONSE; payload: PageContext }
  | { type: typeof MESSAGE_TYPES.OPEN_SIDE_PANEL; payload?: Partial<LessonState> & { tab?: string } };
