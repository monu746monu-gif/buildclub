import type { StuckContext } from "./types";

export type KitoStorage = {
  latestStuckContext?: StuckContext;
  stuckHistory?: Record<string, StuckContext[]>;
  kitoSnoozeUntil?: number;
  dismissedSectionKeys?: string[];
  latestRequestedSidePanelTab?: "Explain" | "Official Docs" | "Claude Prompt";
  kitoUserReviews?: Array<{
    id: string;
    url: string;
    title: string;
    problem: string;
    context?: StuckContext;
    timestamp: number;
    status: "new";
  }>;
};

type ChromeStorageArea = {
  get(keys?: string | string[] | Record<string, unknown> | null): Promise<Partial<KitoStorage>>;
  set(items: Partial<KitoStorage>): Promise<void>;
};

declare const chrome:
  | {
      storage?: {
        local?: ChromeStorageArea;
      };
    }
  | undefined;

async function getLocalStorage(keys?: keyof KitoStorage | Array<keyof KitoStorage>): Promise<Partial<KitoStorage>> {
  if (typeof chrome === "undefined" || !chrome.storage?.local) return {};
  return chrome.storage.local.get(keys as string | string[] | undefined);
}

async function setLocalStorage(value: Partial<KitoStorage>): Promise<void> {
  if (typeof chrome === "undefined" || !chrome.storage?.local) return;
  await chrome.storage.local.set(value);
}

export async function saveLatestStuckContext(context: StuckContext): Promise<void> {
  const stored = await getLocalStorage("stuckHistory");
  const history = stored.stuckHistory ?? {};
  const urlHistory = history[context.url] ?? [];

  await setLocalStorage({
    latestStuckContext: context,
    stuckHistory: {
      ...history,
      [context.url]: [context, ...urlHistory].slice(0, 20)
    }
  });
}

export async function snoozeKito(minutes = 10): Promise<void> {
  await setLocalStorage({ kitoSnoozeUntil: Date.now() + minutes * 60 * 1000 });
}

export async function saveDismissedSectionKey(sectionKey: string): Promise<void> {
  const stored = await getLocalStorage("dismissedSectionKeys");
  const keys = new Set(stored.dismissedSectionKeys ?? []);
  keys.add(sectionKey);
  await setLocalStorage({ dismissedSectionKeys: [...keys] });
}

export async function getKitoSnoozeState(): Promise<Pick<KitoStorage, "kitoSnoozeUntil" | "dismissedSectionKeys">> {
  const stored = await getLocalStorage(["kitoSnoozeUntil", "dismissedSectionKeys"]);
  return {
    kitoSnoozeUntil: stored.kitoSnoozeUntil,
    dismissedSectionKeys: stored.dismissedSectionKeys
  };
}
