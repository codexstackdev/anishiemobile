import { File, Paths } from "expo-file-system";
import { SearchEntry } from "./types";

const MAX_SEARCHES = 15;

let fileRef: File | null = null;
const getFile = () => {
  if (!fileRef) fileRef = new File(Paths.document, "searches.json");
  return fileRef;
};

let cache: SearchEntry[] | null = null;
let queue: Promise<unknown> = Promise.resolve();
const listeners = new Set<() => void>();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

export function subscribeSearches(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

async function load(): Promise<SearchEntry[]> {
  if (cache) return cache;
  try {
    const file = getFile();
    if (!file.exists) {
      cache = [];
      return cache;
    }
    const parsed = JSON.parse(await file.text());
    const list: any[] = Array.isArray(parsed) ? parsed : [];
    cache = list
      .filter((e) => e && typeof e.query === "string" && e.query.trim())
      .map((e) => ({
        query: e.query.trim(),
        searchedAt: Number(e.searchedAt) || 0,
      }));
  } catch (error) {
    console.log("searches load failed:", error);
    cache = [];
  }
  return cache;
}

function persist(list: SearchEntry[]) {
  cache = list;
  try {
    const file = getFile();
    if (!file.exists) file.create();
    file.write(JSON.stringify(list));
  } catch (error) {
    console.log("searches save failed:", error);
  }
  listeners.forEach((listener) => listener());
}

const sameQuery = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

export async function getSearches(): Promise<SearchEntry[]> {
  return [...(await load())].sort((a, b) => b.searchedAt - a.searchedAt);
}

export function addSearch(query: string): Promise<void> {
  return enqueue(async () => {
    const clean = query.trim();
    if (!clean) return;
    const list = await load();
    const rest = list.filter((e) => !sameQuery(e.query, clean));
    persist(
      [{ query: clean, searchedAt: Date.now() }, ...rest].slice(
        0,
        MAX_SEARCHES,
      ),
    );
  });
}

export function removeSearch(query: string): Promise<void> {
  return enqueue(async () => {
    const list = await load();
    persist(list.filter((e) => !sameQuery(e.query, query)));
  });
}

export function clearSearches(): Promise<void> {
  return enqueue(async () => {
    persist([]);
  });
}