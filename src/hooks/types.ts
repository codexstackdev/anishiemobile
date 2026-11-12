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