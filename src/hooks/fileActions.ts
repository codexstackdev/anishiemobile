import { File, Paths } from "expo-file-system";
import { ImageSourcePropType } from "react-native";

export type FavoriteInput = {
  id: string | number;
  title: string;
  japaneseTitle?: string;
  image?: ImageSourcePropType | string;
  accent?: string;
  rating?: number | string;
  year?: number | string;
  episodeCount?: number;
  status?: string;
  genres?: string[];
};

export type FavoriteAnime = {
  id: string;
  title: string;
  japaneseTitle?: string;
  image?: string;
  accent: string;
  rating: number;
  year: number;
  episodeCount: number;
  status: string;
  genres: string[];
  addedAt: number;
};

let fileRef: File | null = null;
const getFile = () => {
  if (!fileRef) fileRef = new File(Paths.document, "favorites.json");
  return fileRef;
};

let cache: FavoriteAnime[] | null = null;
let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

const toImageUri = (image: FavoriteInput["image"]): string | undefined => {
  if (typeof image === "string") return image;
  if (image && typeof image === "object" && !Array.isArray(image) && "uri" in image) {
    return image.uri;
  }
  return undefined;
};

async function load(): Promise<FavoriteAnime[]> {
  if (cache) return cache;
  try {
    const file = getFile();
    if (!file.exists) {
      cache = [];
      return cache;
    }
    const parsed = JSON.parse(await file.text());
    const list: any[] = Array.isArray(parsed) ? parsed : [];
    const seen = new Set<string>();
    cache = list
      .map((f): FavoriteAnime => ({ ...f, id: String(f.id) }))
      .filter((f) => {
        if (seen.has(f.id)) return false;
        seen.add(f.id);
        return true;
      });
  } catch (error) {
    console.log("favorites load failed:", error);
    cache = [];
  }
  return cache;
}

function persist(list: FavoriteAnime[]) {
  cache = list;
  try {
    const file = getFile();
    if (!file.exists) file.create();
    file.write(JSON.stringify(list));
  } catch (error) {
    console.log("favorites save failed:", error);
  }
}

const toFavorite = (anime: FavoriteInput): FavoriteAnime => ({
  id: String(anime.id),
  title: anime.title,
  japaneseTitle: anime.japaneseTitle,
  image: toImageUri(anime.image),
  accent: anime.accent ?? "#3D355F",
  rating: Number(anime.rating) || 0,
  year: Number(anime.year) || 0,
  episodeCount: anime.episodeCount ?? 0,
  status: anime.status ?? "Complete",
  genres: anime.genres ?? [],
  addedAt: Date.now(),
});

export async function getFavorites(): Promise<FavoriteAnime[]> {
  return [...(await load())];
}

export async function getFavoriteIds(): Promise<string[]> {
  return (await load()).map((f) => f.id);
}

export async function isFavorite(id: string | number): Promise<boolean> {
  const key = String(id);
  return (await load()).some((f) => f.id === key);
}

export function addFavorite(anime: FavoriteInput): Promise<void> {
  return enqueue(async () => {
    const id = String(anime.id);
    const list = await load();
    if (list.some((f) => f.id === id)) return;
    persist([toFavorite(anime), ...list]);
  });
}

export function removeFavorite(id: string | number): Promise<void> {
  return enqueue(async () => {
    const key = String(id);
    const list = await load();
    persist(list.filter((f) => f.id !== key));
  });
}

export function toggleFavorite(anime: FavoriteInput): Promise<boolean> {
  return enqueue(async () => {
    const id = String(anime.id);
    const list = await load();
    const exists = list.some((f) => f.id === id);
    persist(
      exists
        ? list.filter((f) => f.id !== id)
        : [toFavorite(anime), ...list],
    );
    return !exists;
  });
}

export function clearFavorites(): Promise<void> {
  return enqueue(async () => {
    persist([]);
  });
}