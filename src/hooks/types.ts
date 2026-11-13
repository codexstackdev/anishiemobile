import { ImageSourcePropType, StyleProp, ViewStyle } from "react-native";

export type Anime = {
  title: string;
  image?: ImageSourcePropType;
};

export type FeaturedAnime = Anime & {
  id: string;
  kicker: string;
  year: string;
  genre: string;
  rating: string;
  episodes: string;
  imageLabel: string;
};

export type TrendingAnime = Anime & {
  subtitle: string;
  rating: string;
  tag: string;
  id: string;
};

export type RecentAnime = Anime & {
  episode: string;
  release: string;
};

export type AnimeImageProps = {
  source?: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
  label?: string;
};

export type FeaturedSlideProps = {
  item: FeaturedAnime;
  width: number;
};

export type Episode = {
  id: string;
  number: number;
  title: string;
  description: string;
  duration: string;
  image?: ImageSourcePropType;
};

export type AnimeSeason = {
  id: string;
  label: string;
  episodeCount: number;
  episodes: Episode[];
};

export type CastMember = {
  id: string;
  name: string;
  role: string;
  voiceActor: string;
  image?: ImageSourcePropType;
};

export type RelatedAnime = {
  id: string;
  title: string;
  detail: string;
  image?: ImageSourcePropType;
};

export type EpisodeRange = {
  start: number;
  end: number;
  label: string;
};