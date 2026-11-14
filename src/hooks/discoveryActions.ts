import { AnimeDisc, AnimeGenre } from "./types";
import { useCallback, useEffect, useRef, useState } from "react";

const ANILIST_URL = "https://graphql.anilist.co";

export type DiscoveryCategory = "For You" | "Trending" | "Top Rated" | "New";

export type Anime = {
  id: string;
  title: string;
  japaneseTitle?: string;
  synopsis: string;
  year: number;
  rating: number;
  episodeCount: number;
  status: "Airing" | "Complete" | "Upcoming";
  genres: string[];
  accent: string;
  image?: { uri: string };
  featured?: boolean;
  trending?: boolean;
  topRated?: boolean;
  isNew?: boolean;
};

const MEDIA_FIELDS = `
  id
  title { romaji english native }
  description(asHtml: false)
  coverImage { large extraLarge color }
  bannerImage
  genres
  status
  episodes
  averageScore
  seasonYear
  startDate { year month day }
  nextAiringEpisode { episode }
`;

const DISCOVER_QUERY = `
query (
  $page: Int, $perPage: Int, $search: String, $genre: String,
  $sort: [MediaSort], $status: MediaStatus, $popularityGreater: Int
) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { hasNextPage currentPage }
    media(
      type: ANIME, isAdult: false, search: $search, genre: $genre,
      sort: $sort, status: $status, popularity_greater: $popularityGreater
    ) { ${MEDIA_FIELDS} }
  }
}`;

const getTitle = (t: { romaji: string; english: string | null }) =>
  t.english || t.romaji;

const cleanDescription = (html: string | null) =>
  (html ?? "No synopsis available.")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .trim();

const mapStatus = (s: string): Anime["status"] =>
  s === "RELEASING" ? "Airing" : s === "NOT_YET_RELEASED" ? "Upcoming" : "Complete";

const isRecent = (d?: { year?: number; month?: number; day?: number }) => {
  if (!d?.year) return false;
  const started = new Date(d.year, (d.month ?? 1) - 1, d.day ?? 1).getTime();
  return Date.now() - started < 1000 * 60 * 60 * 24 * 120; // started in last ~4 months
};

function mapMedia(m: any, extra: Partial<Anime> = {}, useBanner = false): Anime {
  const cover = m.coverImage?.large;
  const uri = useBanner ? (m.bannerImage ?? m.coverImage?.extraLarge) : cover;
  return {
    id: String(m.id),
    title: getTitle(m.title),
    japaneseTitle: m.title.native ?? undefined,
    synopsis: cleanDescription(m.description),
    year: m.seasonYear ?? m.startDate?.year ?? 0,
    rating: m.averageScore ? m.averageScore / 10 : 0,
    episodeCount:
      m.episodes ?? (m.nextAiringEpisode ? m.nextAiringEpisode.episode - 1 : 0),
    status: mapStatus(m.status),
    genres: m.genres ?? [],
    accent: m.coverImage?.color ?? "#3D355F",
    image: uri ? { uri } : undefined,
    isNew: m.status === "NOT_YET_RELEASED" || isRecent(m.startDate),
    ...extra,
  };
}

async function anilist(query: string, variables: Record<string, unknown>) {
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`AniList request failed: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? "AniList error");
  return json.data;
}

export type DiscoverParams = {
  query?: String;
  category?: DiscoveryCategory;
  genre?: AnimeGenre;
  page?: number;
  perPage?: number;
};

export async function fetchDiscover({
  query = "",
  category = "For You",
  genre,
  page = 1,
  perPage = 100,
}: DiscoverParams): Promise<{ items: AnimeDisc[]; hasNextPage: boolean; page: number }> {
  const search = query.trim();
  const variables: Record<string, unknown> = {
    page,
    perPage,
    genre: genre && genre !== "All" ? genre : undefined,
  };

  if (search) {
    variables.search = search;
    variables.sort = ["SEARCH_MATCH"];
  } else {
    switch (category) {
      case "Trending":
        variables.sort = ["TRENDING_DESC"];
        break;
      case "Top Rated":
        variables.sort = ["SCORE_DESC"];
        variables.popularityGreater = 20000;
        break;
      case "New":
        variables.sort = ["START_DATE_DESC"];
        variables.status = "RELEASING";
        break;
      default:
        variables.sort = ["POPULARITY_DESC"];
    }
  }

  const data = await anilist(DISCOVER_QUERY, variables);
  const { media, pageInfo } = data.Page;

  const flags: Partial<Anime> = search
    ? {}
    : {
        trending: category === "Trending",
        topRated: category === "Top Rated",
      };

  return {
    items: media.map((m: any) => mapMedia(m, flags)),
    hasNextPage: pageInfo.hasNextPage,
    page: pageInfo.currentPage,
  };
}

export async function fetchFeatured(limit = 5): Promise<AnimeDisc[]> {
  const data = await anilist(DISCOVER_QUERY, {
    page: 1,
    perPage: 20,
    sort: ["TRENDING_DESC"],
  });

  return data.Page.media
    .filter((m: any) => m.bannerImage)
    .slice(0, limit)
    .map((m: any) => mapMedia(m, { featured: true }, true));
}

export function useDebounced<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function useDiscoverList(query: string, category: DiscoveryCategory, genre: AnimeGenre) {
  const [items, setItems] = useState<AnimeDisc[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const requestId = useRef(0);

  const load = useCallback(
    async (nextPage: number, reset: boolean) => {
      const id = ++requestId.current;
      reset ? setLoading(true) : setLoadingMore(true);
      try {
        const data = await fetchDiscover({
          query,
          category,
          genre,
          page: nextPage,
          perPage: 24,
        });
        if (id !== requestId.current) return;
        setItems((prev) => {
          const base = reset ? [] : prev;
          const seen = new Set(base.map((a) => a.id));
          return [...base, ...data.items.filter((a) => !seen.has(a.id))];
        });
        setPage(data.page);
        setHasNext(data.hasNextPage);
      } catch (e) {
        console.log(e);
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [query, category, genre],
  );

  useEffect(() => {
    load(1, true);
  }, [load]);

  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && hasNext) load(page + 1, false);
  }, [loading, loadingMore, hasNext, page, load]);

  return { items, loading, loadingMore, hasNext, loadMore };
}