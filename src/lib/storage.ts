import type { LessonState } from "./types";

const PREFIX = "catnooish:lesson:";
const ACTIVE_URL_KEY = "catnooish:activeUrl";
const ACTIVE_TAB_KEY = "catnooish:activeTab";

const storageArea = () => chrome.storage.local;

export function stateKey(url: string): string {
  return `${PREFIX}${encodeURIComponent(url)}`;
}

export async function getLessonState(url: string): Promise<LessonState | undefined> {
  const data = await storageArea().get(stateKey(url));
  return data[stateKey(url)] as LessonState | undefined;
}

export async function saveLessonState(state: LessonState): Promise<void> {
  await storageArea().set({
    [stateKey(state.url)]: {
      ...state,
      updatedAt: new Date().toISOString()
    },
    [ACTIVE_URL_KEY]: state.url
  });
}

export async function patchLessonState(url: string, patch: Partial<LessonState>): Promise<LessonState> {
  const existing = await getLessonState(url);
  const cleanPatch = Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined)) as Partial<LessonState>;
  const state: LessonState = {
    url,
    title: cleanPatch.title ?? existing?.title ?? "BuildClub Claude Code lesson",
    pageText: cleanPatch.pageText ?? existing?.pageText ?? "",
    readingProgress: cleanPatch.readingProgress ?? existing?.readingProgress ?? 0,
    completed: cleanPatch.completed ?? existing?.completed ?? false,
    ...existing,
    ...cleanPatch,
    updatedAt: new Date().toISOString()
  };
  await saveLessonState(state);
  return state;
}

export async function getActiveUrl(): Promise<string | undefined> {
  const data = await storageArea().get(ACTIVE_URL_KEY);
  return data[ACTIVE_URL_KEY] as string | undefined;
}

export async function setActiveSidePanelTab(tab: string): Promise<void> {
  await storageArea().set({ [ACTIVE_TAB_KEY]: tab });
}

export async function getActiveSidePanelTab(): Promise<string | undefined> {
  const data = await storageArea().get(ACTIVE_TAB_KEY);
  return data[ACTIVE_TAB_KEY] as string | undefined;
}
