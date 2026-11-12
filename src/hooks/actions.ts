import { FeaturedAnime, RecentAnime, TrendingAnime } from "./types";

const ANILIST_URL = "https://graphql.anilist.co";

const MEDIA_FIELDS = `
  id
  title { romaji english }
  coverImage { extraLarge }
  bannerImage
  genres
  format
  status
  episodes
  averageScore
  seasonYear
  isAdult
  studios(isMain: true) { nodes { name } }
`;

const HOME_QUERY = `
query ($now: Int, $weekAgo: Int) {
  featured: Page(page: 1, perPage: 20) {
    media(type: ANIME, sort: TRENDING_DESC, isAdult: false) { ${MEDIA_FIELDS} }
  }
  trending: Page(page: 1, perPage: 12) {
    media(type: ANIME, sort: TRENDING_DESC, isAdult: false) { ${MEDIA_FIELDS} }
  }
  recent: Page(page: 1, perPage: 25) {
    airingSchedules(airingAt_lesser: $now, airingAt_greater: $weekAgo, sort: TIME_DESC) {
      episode
      airingAt
      media {
        id
        title { romaji english }
        coverImage { extraLarge }
        isAdult
      }
    }
  }
}`;

const getTitle = (t: { romaji: string; english: string | null }) =>
  t.english || t.romaji;

const formatScore = (score: number | null) =>
  score ? (score / 10).toFixed(1) : "N/A";

const timeAgo = (airingAt: number) => {
  const mins = Math.floor((Date.now() / 1000 - airingAt) / 60);
  if (mins < 60) return "JUST RELEASED";
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "HOUR" : "HOURS"} AGO`;
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? "DAY" : "DAYS"} AGO`;
};

export async function fetchHomeData(): Promise<{
  featured: FeaturedAnime[];
  trending: TrendingAnime[];
  recent: RecentAnime[];
}> {
  const now = Math.floor(Date.now() / 1000);
  const weekAgo = now - 7 * 24 * 60 * 60;

  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: HOME_QUERY, variables: { now, weekAgo } }),
  });

  if (!res.ok) throw new Error(`AniList request failed: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? "AniList error");

  const { featured, trending, recent } = json.data;

  const featuredList: FeaturedAnime[] = featured.media
    .filter((m: any) => m.coverImage.extraLarge)
    .slice(0, 5)
    .map((m: any) => ({
      id: m.id,
      title: getTitle(m.title),
      image: { uri: m.coverImage.extraLarge },
      kicker: (m.studios?.nodes?.[0]?.name ?? m.format ?? "ANIME").toUpperCase(),
      year: m.seasonYear ? String(m.seasonYear) : "TBA",
      genre: m.genres?.[0] ?? "Anime",
      rating: formatScore(m.averageScore),
      episodes: m.episodes
        ? `${m.episodes} EPISODES`
        : m.status === "RELEASING"
          ? "AIRING NOW"
          : "EPISODES TBA",
      imageLabel: `${getTitle(m.title).toUpperCase()} IMAGE`,
    }));

  const trendingList: TrendingAnime[] = trending.media.map((m: any, i: number) => ({
    id: m.id,
    title: getTitle(m.title),
    image: { uri: m.coverImage.extraLarge },
    subtitle: m.genres?.slice(0, 2).join(" · ") || m.format || "Anime",
    rating: formatScore(m.averageScore),
    tag:
      i === 0
        ? "#1 TRENDING"
        : (m.averageScore ?? 0) >= 85
          ? "MUST WATCH"
          : m.status === "RELEASING"
            ? "AIRING"
            : "TRENDING",
  }));

  const seen = new Set<number>();
  const recentList: RecentAnime[] = recent.airingSchedules
    .filter((s: any) => {
      if (s.media.isAdult || seen.has(s.media.id)) return false;
      seen.add(s.media.id);
      return true;
    })
    .slice(0, 8)
    .map((s: any) => ({
      title: getTitle(s.media.title),
      id: s.id,
      image: { uri: s.media.coverImage.extraLarge },
      episode: `Episode ${s.episode}`,
      release: timeAgo(s.airingAt),
    }));

  return { featured: featuredList, trending: trendingList, recent: recentList };
}