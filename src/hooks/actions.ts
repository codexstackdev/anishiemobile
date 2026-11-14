import {
  CastMember,
  Episode,
  FeaturedAnime,
  RecentAnime,
  RelatedAnime,
  TrendingAnime,
} from "./types";

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
      kicker: (
        m.studios?.nodes?.[0]?.name ??
        m.format ??
        "ANIME"
      ).toUpperCase(),
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

  const trendingList: TrendingAnime[] = trending.media.map(
    (m: any, i: number) => ({
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
    }),
  );

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
      id: String(s.media.id),
      image: { uri: s.media.coverImage.extraLarge },
      episode: `Episode ${s.episode}`,
      release: timeAgo(s.airingAt),
    }));

  return { featured: featuredList, trending: trendingList, recent: recentList };
}

const DETAILS_QUERY = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title { romaji english }
    description(asHtml: false)
    coverImage { extraLarge }
    bannerImage
    genres
    format
    status
    episodes
    duration
    averageScore
    seasonYear
    studios(isMain: true) { nodes { name } }
    nextAiringEpisode { episode airingAt }
    streamingEpisodes { title thumbnail }
    characters(sort: [ROLE, RELEVANCE], perPage: 12) {
      edges {
        role
        node { id name { full } image { large } }
        voiceActors(language: JAPANESE) { name { full } }
      }
    }
    relations {
      edges {
        relationType(version: 2)
        node {
          id
          type
          format
          seasonYear
          episodes
          title { romaji english }
          coverImage { large }
        }
      }
    }
    recommendations(sort: RATING_DESC, perPage: 10) {
      nodes {
        mediaRecommendation {
          id
          format
          seasonYear
          genres
          title { romaji english }
          coverImage { large }
        }
      }
    }
  }
}`;

const getDetail = (t: { romaji: string; english: string | null }) =>
  t.english || t.romaji;

const cleanDescription = (html: string | null) =>
  (html ?? "No synopsis available.")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();

export type AnimeDetails = {
  id: number;
  title: string;
  synopsis: string;
  image?: { uri: string };
  banner?: { uri: string };
  year: string;
  genres: string[];
  rating: string;
  status: string;
  episodeCount: number;
  duration: string;
  nextEpisode?: { episode: number; airingAt: number };
  episodes: Episode[];
  seasons: {
    id: number;
    label: string;
    current: boolean;
    episodeCount: number;
  }[];
  cast: CastMember[];
  related: RelatedAnime[];
};

export async function fetchAnimeDetails(id: number): Promise<AnimeDetails> {
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query: DETAILS_QUERY, variables: { id } }),
  });

  if (!res.ok) throw new Error(`AniList request failed: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? "AniList error");

  const m = json.data.Media;
  const duration = m.duration ? `${m.duration} min` : "24 min";

  const aired = m.nextAiringEpisode
    ? m.nextAiringEpisode.episode - 1
    : (m.episodes ?? 0);

  const streaming: { title: string; thumbnail: string }[] =
    m.streamingEpisodes ?? [];

  const episodes: Episode[] =
    streaming.length > 0
      ? streaming.map((e, i) => ({
          id: `ep-${i + 1}`,
          number: i + 1,
          title: e.title.replace(/^Episode\s*\d+\s*[-–:]\s*/i, ""),
          description: "",
          duration,
          image: e.thumbnail ? { uri: e.thumbnail } : undefined,
        }))
      : Array.from({ length: aired }, (_, i) => ({
          id: `ep-${i + 1}`,
          number: i + 1,
          title: `Episode ${i + 1}`,
          description: "",
          duration,
        }));

  const franchise = (m.relations?.edges ?? [])
    .filter(
      (e: any) =>
        e.node.type === "ANIME" &&
        ["PREQUEL", "SEQUEL"].includes(e.relationType) &&
        ["TV", "TV_SHORT", "ONA"].includes(e.node.format),
    )
    .map((e: any) => ({
      id: e.node.id,
      label: getDetail(e.node.title),
      year: e.node.seasonYear ?? 0,
      episodeCount: e.node.episodes ?? 0,
    }));

  const seasons = [
    ...franchise,
    {
      id: m.id,
      label: getTitle(m.title),
      year: m.seasonYear ?? 0,
      episodeCount: m.episodes ?? aired,
    },
  ]
    .sort((a, b) => a.year - b.year)
    .map((s, i) => ({
      id: s.id,
      label: `Season ${i + 1}`,
      current: s.id === m.id,
      episodeCount: s.episodeCount,
    }));

  const cast: CastMember[] = (m.characters?.edges ?? []).map((e: any) => ({
    id: String(e.node.id),
    name: e.node.name.full,
    role: e.role === "MAIN" ? "Main character" : "Supporting",
    voiceActor: e.voiceActors?.[0]?.name.full ?? "Unknown",
    image: e.node.image?.large ? { uri: e.node.image.large } : undefined,
  }));

  const related: RelatedAnime[] = (m.recommendations?.nodes ?? [])
    .map((n: any) => n.mediaRecommendation)
    .filter(Boolean)
    .map((r: any) => ({
      id: String(r.id),
      title: getDetail(r.title),
      detail: `${r.genres?.[0] ?? r.format ?? "Anime"} · ${r.seasonYear ?? "TBA"}`,
      image: r.coverImage?.large ? { uri: r.coverImage.large } : undefined,
    }));

  return {
    id: m.id,
    title: getDetail(m.title),
    synopsis: cleanDescription(m.description),
    image: m.coverImage?.extraLarge
      ? { uri: m.coverImage.extraLarge }
      : undefined,
    banner: m.bannerImage ? { uri: m.bannerImage } : undefined,
    year: m.seasonYear ? String(m.seasonYear) : "TBA",
    genres: m.genres ?? [],
    rating: m.averageScore ? (m.averageScore / 10).toFixed(1) : "N/A",
    status: m.status,
    episodeCount: m.episodes ?? aired,
    duration,
    nextEpisode: m.nextAiringEpisode ?? undefined,
    episodes,
    seasons,
    cast,
    related,
  };
}
