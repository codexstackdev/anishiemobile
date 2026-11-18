import { File, Paths } from "expo-file-system";

export type User = {
  username: string;
  streak: number;
  lastOpenedDay: string;
  createdAt: number;
  termsVersion?: string;
  acceptedAt?: string;
};
let fileRef: File | null = null;

function getFile(): File {
  if (!fileRef) fileRef = new File(Paths.document, "user.json");
  return fileRef;
}

let cache: User | null | undefined;
let queue: Promise<unknown> = Promise.resolve();
const listeners = new Set<() => void>();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

export function subscribeUser(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const todayKey = (): string => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

const dayNumber = (key: string): number => {
  const [y, m, d] = key.split("-").map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
};

async function load(): Promise<User | null> {
  if (cache !== undefined) return cache;
  try {
    const file = getFile();
    if (!file.exists) {
      cache = null;
      return cache;
    }
    const parsed = JSON.parse(await file.text());
    if (parsed && typeof parsed.username === "string" && parsed.username) {
      cache = {
        username: parsed.username,
        streak: Math.max(1, Number(parsed.streak) || 1),
        lastOpenedDay: String(parsed.lastOpenedDay ?? todayKey()),
        createdAt: Number(parsed.createdAt) || Date.now(),
        termsVersion: parsed.termsVersion,
        acceptedAt: parsed.acceptedAt,
      };
    } else {
      cache = null;
    }
  } catch (error) {
    console.log("user load failed:", error);
    cache = null;
  }
  return cache;
}

function persist(user: User | null) {
  cache = user;
  try {
    const file = getFile();
    if (user) {
      if (!file.exists) file.create();
      file.write(JSON.stringify(user));
    } else if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.log("user save failed:", error);
  }
  listeners.forEach((listener) => listener());
}

export async function getUser(): Promise<User | null> {
  const user = await load();
  return user ? { ...user } : null;
}

export async function hasUser(): Promise<boolean> {
  return (await load()) !== null;
}

export function addUser(
  username: string,
  terms?: { termsVersion: string; acceptedAt: string },
): Promise<User | null> {
  return enqueue(async () => {
    const clean = username.trim();
    const existing = await load();
    if (existing) return existing;
    if (!clean) return null;
    const user: User = {
      username: clean,
      streak: 1,
      lastOpenedDay: todayKey(),
      createdAt: Date.now(),
      ...terms,
    };
    persist(user);
    return user;
  });
}

export function updateUsername(username: string): Promise<void> {
  return enqueue(async () => {
    const clean = username.trim();
    const user = await load();
    if (!user || !clean) return;
    persist({ ...user, username: clean });
  });
}

export function recordAppOpen(): Promise<User | null> {
  return enqueue(async () => {
    const user = await load();
    if (!user) return null;

    const today = todayKey();
    if (user.lastOpenedDay === today) return user;

    const gap = dayNumber(today) - dayNumber(user.lastOpenedDay);
    const next: User = {
      ...user,
      streak: gap === 1 ? user.streak + 1 : 1,
      lastOpenedDay: today,
    };
    persist(next);
    return next;
  });
}

export function removeUser(): Promise<void> {
  return enqueue(async () => {
    persist(null);
  });
}
