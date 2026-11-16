import { File, Paths } from "expo-file-system";
import { ImageSourcePropType } from "react-native";

export type WatchStatus = "Watching" | "Completed" | "Plan to watch";

export type WatchlistInput = {
  id: string | number;
  title: string;
  japaneseTitle?: string;
  subtitle?: string;
  image?: ImageSourcePropType | string;
  accent?: string;
  rating?: number | string;
  year?: number | string;
  episodeCount?: number;
  rawEpisode?: number;
};

export type WatchlistEntry = {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  accent: string;
  rating: number;
  year: number;
  episodeCount: number;
  currentEpisode: number;
  status: WatchStatus;
  addedAt: number;
  updatedAt: number;
};

const file = new File(Paths.document, "watchlist.json");

let cache: WatchlistEntry[] | null = null;
let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

const toImageUri = (image: WatchlistInput["image"]): string | undefined => {
  if (typeof image === "string") return image;
  if (image && typeof image === "object" && !Array.isArray(image) && "uri" in image) {
    return image.uri;
  }
  return undefined;
};

async function load(): Promise<WatchlistEntry[]> {
  if (cache) return cache;
  try {
    if (!file.exists) {
      cache = [];
      return cache;
    }
    const parsed = JSON.parse(await file.text());
    const list: any[] = Array.isArray(parsed) ? parsed : [];
    const seen = new Set<string>();
    cache = list
      .map(
        (e): WatchlistEntry => ({
          ...e,
          id: String(e.id),
          currentEpisode: Number(e.currentEpisode ?? e.watchedEpisodes ?? 0),
        }),
      )
      .filter((e) => {
        if (seen.has(e.id)) return false;
        seen.add(e.id);
        return true;
      });
  } catch (error) {
    console.log("watchlist load failed:", error);
    cache = [];
  }
  return cache;
}

const listeners = new Set<() => void>();

export function subscribeWatchlist(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function persist(list: WatchlistEntry[]) {
  cache = list;
  try {
    if (!file.exists) file.create();
    file.write(JSON.stringify(list));
  } catch (error) {
    console.log("watchlist save failed:", error);
  }
  listeners.forEach((listener) => listener());
}

const toEntry = (
  anime: WatchlistInput,
  status: WatchStatus,
): WatchlistEntry => ({
  id: String(anime.id),
  title: anime.title,
  subtitle: anime.subtitle ?? anime.japaneseTitle ?? String(anime.year ?? ""),
  image: toImageUri(anime.image),
  accent: anime.accent ?? "#3D355F",
  rating: Number(anime.rating) || 0,
  year: Number(anime.year) || 0,
  episodeCount: anime.episodeCount ?? 0,
  currentEpisode: 0,
  status,
  addedAt: Date.now(),
  updatedAt: Date.now(),
});

const resolveStatus = (e: WatchlistEntry): WatchStatus => {
  if (e.currentEpisode <= 0) return "Plan to watch";
  if (e.episodeCount > 0 && e.currentEpisode >= e.episodeCount) {
    return "Completed";
  }
  return "Watching";
};

export async function getWatchlist(): Promise<WatchlistEntry[]> {
  return [...(await load())].sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getWatchlistIds(): Promise<string[]> {
  return (await load()).map((e) => e.id);
}

export async function getWatchlistByStatus(
  status: WatchStatus,
): Promise<WatchlistEntry[]> {
  return (await getWatchlist()).filter((e) => e.status === status);
}

export async function getWatchlistEntry(
  id: string | number,
): Promise<WatchlistEntry | null> {
  const key = String(id);
  return (await load()).find((e) => e.id === key) ?? null;
}

export async function isInWatchlist(id: string | number): Promise<boolean> {
  return (await getWatchlistEntry(id)) !== null;
}

export async function getResumeEpisode(id: string | number): Promise<number> {
  return Math.max(1, (await getWatchlistEntry(id))?.currentEpisode ?? 1);
}

export function addToWatchlist(
  anime: WatchlistInput,
  status: WatchStatus = "Plan to watch",
): Promise<void> {
  return enqueue(async () => {
    const id = String(anime.id);
    const list = await load();
    if (list.some((e) => e.id === id)) return;
    persist([toEntry(anime, status), ...list]);
  });
}

export function removeFromWatchlist(id: string | number): Promise<void> {
  return enqueue(async () => {
    const key = String(id);
    const list = await load();
    persist(list.filter((e) => e.id !== key));
  });
}

export function toggleWatchlist(
  anime: WatchlistInput,
  status: WatchStatus = "Plan to watch",
): Promise<boolean> {
  return enqueue(async () => {
    const id = String(anime.id);
    const list = await load();
    const exists = list.some((e) => e.id === id);
    persist(
      exists
        ? list.filter((e) => e.id !== id)
        : [toEntry(anime, status), ...list],
    );
    return !exists;
  });
}

export function setWatchStatus(
  id: string | number,
  status: WatchStatus,
): Promise<void> {
  return enqueue(async () => {
    const key = String(id);
    const list = await load();
    persist(
      list.map((e) => {
        if (e.id !== key) return e;
        const next = { ...e, status, updatedAt: Date.now() };
        if (status === "Completed" && e.episodeCount > 0) {
          next.currentEpisode = e.episodeCount;
        }
        if (status === "Plan to watch") {
          next.currentEpisode = 0;
        }
        return next;
      }),
    );
  });
}

export function markEpisodeWatched(
  anime: WatchlistInput,
  episode: number,
): Promise<void> {
  return enqueue(async () => {
    const id = String(anime.id);
    const list = await load();
    const existing = list.find((e) => e.id === id);
    const base = existing ?? toEntry(anime, "Watching");

    const updated: WatchlistEntry = {
      ...base,
      episodeCount: anime.episodeCount || base.episodeCount,
      currentEpisode: episode,
      status: base.status === "Plan to watch" ? "Watching" : base.status,
      updatedAt: Date.now(),
    };
    updated.status = resolveStatus(updated);

    persist(
      existing
        ? list.map((e) => (e.id === id ? updated : e))
        : [updated, ...list],
    );
  });
}

export function setCurrentEpisode(
  id: string | number,
  currentEpisode: number,
): Promise<void> {
  return enqueue(async () => {
    const key = String(id);
    const list = await load();
    persist(
      list.map((e) => {
        if (e.id !== key) return e;
        const next = {
          ...e,
          currentEpisode: Math.max(0, currentEpisode),
          updatedAt: Date.now(),
        };
        next.status =
          next.currentEpisode === 0 ? "Plan to watch" : resolveStatus(next);
        return next;
      }),
    );
  });
}

export function clearWatchlist(): Promise<void> {
  return enqueue(async () => {
    persist([]);
  });
}