import { useEffect, useState } from "react";
import * as Application from "expo-application";
import { AppState } from "react-native";

const VERSION_API = "https://anishie.vercel.app/api/kenshie/version";
const FALLBACK_URL = "https://github.com/codexstackdev/anishieweb/releases";

export type UpdateInfo = {
  current: string;
  latest: string;
  url: string;
};

export function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

export async function checkForUpdate(): Promise<UpdateInfo | null> {
  try {
    const current = Application.nativeApplicationVersion;
    if (!current) return null;

    const res = await fetch(VERSION_API, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();

    if (!data?.success || !data?.ver?.version) return null;

    const latest = String(data.ver.version);
    if (compareVersions(current, latest) >= 0) return null;

    return {
      current,
      latest,
      url: data.ver.url || FALLBACK_URL,
    };
  } catch (error) {
    console.log("version check failed:", error);
    return null;
  }
}

export function useUpdateCheck() {
  const [update, setUpdate] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    const run = async () => {
      const info = await checkForUpdate();
      setUpdate(info);
    };

    run();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") run();
    });

    return () => sub.remove();
  }, []);

  return { update };
}