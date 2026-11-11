import { NavigationBar } from "expo-navigation-bar";
import React, { Component } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";

type ArtworkPalette = [string, string];

type TrendingAnime = {
  title: string;
  subtitle: string;
  episode: string;
  rating: string;
  palette: ArtworkPalette;
  mark: string;
  tag: string;
};

type ContinueAnime = {
  title: string;
  detail: string;
  progress: `${number}%`;
  palette: ArtworkPalette;
  mark: string;
};

type ArtworkProps = {
  palette: ArtworkPalette;
  mark: string;
  large?: boolean;
};

type SectionHeadingProps = {
  title: string;
  action?: string;
};

type TrendingCardProps = { item: TrendingAnime };
type ContinueCardProps = { item: ContinueAnime };
type ScreenProps = Record<string, never>;
type ScreenState = Record<string, never>;

const COLORS = {
  background: "#090A12",
  surface: "#121421",
  surfaceLight: "#191B2B",
  white: "#F8F7FF",
  muted: "#9294A8",
  purple: "#A78BFA",
  violet: "#7C5CFC",
  cyan: "#83E7F4",
  line: "rgba(255,255,255,0.09)",
};

const trending: TrendingAnime[] = [
  {
    title: "Demon Slayer",
    subtitle: "Hashira Training Arc",
    episode: "EP 08",
    rating: "9.2",
    palette: ["#39192D", "#9F4256"],
    mark: "鬼",
    tag: "TRENDING",
  },
  {
    title: "Chainsaw Man",
    subtitle: "The Chaos Begins",
    episode: "EP 12",
    rating: "8.8",
    palette: ["#422417", "#B76A38"],
    mark: "斬",
    tag: "HOT",
  },
  {
    title: "Frieren",
    subtitle: "Beyond Journey’s End",
    episode: "EP 21",
    rating: "9.5",
    palette: ["#172A3A", "#587E9B"],
    mark: "旅",
    tag: "MUST WATCH",
  },
  {
    title: "Blue Lock",
    subtitle: "Episode Nagi",
    episode: "EP 06",
    rating: "8.6",
    palette: ["#14234B", "#3566B5"],
    mark: "青",
    tag: "NEW EP",
  },
];

const continueWatching: ContinueAnime[] = [
  {
    title: "Jujutsu Kaisen",
    detail: "Season 2 · Episode 18",
    progress: "72%",
    palette: ["#241D42", "#7960B8"],
    mark: "呪",
  },
  {
    title: "Spy x Family",
    detail: "Season 2 · Episode 07",
    progress: "38%",
    palette: ["#183534", "#4C8F7A"],
    mark: "ス",
  },
  {
    title: "Haikyu!!",
    detail: "Season 4 · Episode 11",
    progress: "54%",
    palette: ["#4A2B1D", "#C67A3B"],
    mark: "飛",
  },
];

function Artwork({ palette, mark, large = false }: ArtworkProps) {
  return (
    <View
      style={[
        styles.artwork,
        { backgroundColor: palette[0] },
        large && styles.largeArtwork,
      ]}
    >
      <View style={[styles.artGlow, { backgroundColor: palette[1] }]} />
      <View style={styles.artRing} />
      <View style={styles.artSlash} />
      <Text style={[styles.artMark, large && styles.largeArtMark]}>{mark}</Text>
      <View style={styles.artBottomShade} />
    </View>
  );
}

function SectionHeading({ title, action = "See all" }: SectionHeadingProps) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable accessibilityRole="button" hitSlop={8}>
        <Text style={styles.sectionAction}>{action} ›</Text>
      </Pressable>
    </View>
  );
}

function TrendingCard({ item }: TrendingCardProps) {
  return (
    <Pressable
      style={styles.trendCard}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, rating ${item.rating}`}
    >
      <View style={styles.trendPoster}>
        <Artwork palette={item.palette} mark={item.mark} />
        <View style={styles.posterTag}>
          <Text style={styles.posterTagText}>{item.tag}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingStar}>★</Text>
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.cardSubtitle} numberOfLines={1}>
        {item.subtitle}
      </Text>
    </Pressable>
  );
}

function ContinueCard({ item }: ContinueCardProps) {
  return (
    <Pressable
      style={styles.continueCard}
      accessibilityRole="button"
      accessibilityLabel={`Continue watching ${item.title}`}
    >
      <View style={styles.continueArtWrap}>
        <Artwork palette={item.palette} mark={item.mark} />
        <View style={styles.playButton}>
          <Text style={styles.playGlyph}>▶</Text>
        </View>
      </View>
      <View style={styles.continueInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.cardSubtitle}>{item.detail}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: item.progress }]} />
        </View>
      </View>
    </Pressable>
  );
}

export default class Index extends Component<ScreenProps, ScreenState> {
  render() {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.screen}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <StatusBar hidden={true} />
            <NavigationBar hidden={true} />
            <View style={styles.topBar}>
              <View style={styles.brandLockup}>
                <View style={styles.brandIcon}>
                  <Text style={styles.brandIconText}>A</Text>
                </View>
                <Text style={styles.brandName}>anishie</Text>
                <View style={styles.premiumPill}>
                  <Text style={styles.premiumText}>PLUS</Text>
                </View>
              </View>
              <View style={styles.topActions}>
                <Pressable
                  style={styles.iconButton}
                  accessibilityRole="button"
                  accessibilityLabel="Search"
                >
                  <Text style={styles.searchGlyph}>⌕</Text>
                </Pressable>
                <Pressable
                  style={styles.avatar}
                  accessibilityRole="button"
                  accessibilityLabel="Profile"
                >
                  <Text style={styles.avatarText}>Y</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.welcomeRow}>
              <View>
                <Text style={styles.eyebrow}>WEDNESDAY, NOVEMBER 11</Text>
                <Text style={styles.welcomeTitle}>
                  Your next{"\n"}
                  <Text style={styles.welcomeAccent}>world awaits.</Text>
                </Text>
              </View>
              <View style={styles.streakPill}>
                <Text style={styles.streakIcon}>✦</Text>
                <Text style={styles.streakText}>7 day streak</Text>
              </View>
            </View>

            <Pressable
              style={styles.heroCard}
              accessibilityRole="button"
              accessibilityLabel="Featured anime: Solo Leveling, watch now"
            >
              <View style={styles.heroBackdrop} />
              <View style={styles.heroOrb} />
              <View style={styles.heroHalo} />
              <View style={styles.heroFigure}>
                <Text style={styles.heroFigureMark}>影</Text>
              </View>
              <View style={styles.heroTopRow}>
                <View style={styles.featuredPill}>
                  <View style={styles.liveDot} />
                  <Text style={styles.featuredText}>ANISHIE ORIGINAL</Text>
                </View>
                <Pressable
                  style={styles.bookmarkButton}
                  accessibilityRole="button"
                  accessibilityLabel="Add to watchlist"
                >
                  <Text style={styles.bookmarkGlyph}>＋</Text>
                </Pressable>
              </View>
              <View style={styles.heroCopy}>
                <Text style={styles.heroKicker}>
                  THE WORLD’S WEAKEST{"\n"}HUNTER RISES
                </Text>
                <Text style={styles.heroTitle}>SOLO{"\n"}LEVELING</Text>
                <View style={styles.heroMetaRow}>
                  <Text style={styles.heroMeta}>2024</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.heroMeta}>Action</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.heroMeta}>⭐ 9.3</Text>
                </View>
                <View style={styles.heroButtonRow}>
                  <Pressable
                    style={styles.watchButton}
                    accessibilityRole="button"
                  >
                    <Text style={styles.watchPlay}>▶</Text>
                    <Text style={styles.watchButtonText}>Watch now</Text>
                  </Pressable>
                  <Text style={styles.heroEpisodes}>S1 · 12 EPISODES</Text>
                </View>
              </View>
              <View style={styles.heroPagination}>
                <View style={styles.pageActive} />
                <View style={styles.pageInactive} />
                <View style={styles.pageInactive} />
                <View style={styles.pageInactive} />
              </View>
              <Text style={styles.heroVerticalLabel}>LEVEL UP</Text>
            </Pressable>

            <View style={styles.genreRow}>
              <Pressable style={[styles.genreChip, styles.genreChipActive]}>
                <Text style={styles.genreActiveText}>✦ For you</Text>
              </Pressable>
              <Pressable style={styles.genreChip}>
                <Text style={styles.genreText}>Action</Text>
              </Pressable>
              <Pressable style={styles.genreChip}>
                <Text style={styles.genreText}>Fantasy</Text>
              </Pressable>
              <Pressable style={styles.genreChip}>
                <Text style={styles.genreText}>Romance</Text>
              </Pressable>
            </View>

            <View style={styles.sectionBlock}>
              <SectionHeading title="Continue watching" action="View history" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              >
                {continueWatching.map((item) => (
                  <ContinueCard key={item.title} item={item} />
                ))}
              </ScrollView>
            </View>

            <View style={styles.sectionBlock}>
              <SectionHeading title="Trending this week" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              >
                {trending.map((item) => (
                  <TrendingCard key={item.title} item={item} />
                ))}
              </ScrollView>
            </View>

            <View style={styles.newEpisodeBanner}>
              <View style={styles.newEpisodeIcon}>
                <Text style={styles.newEpisodeIconText}>✦</Text>
              </View>
              <View style={styles.newEpisodeCopy}>
                <Text style={styles.newEpisodeTitle}>
                  New episodes, right on time
                </Text>
                <Text style={styles.newEpisodeSub}>
                  Your watchlist has 3 fresh drops
                </Text>
              </View>
              <Text style={styles.bannerArrow}>›</Text>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  screen: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 24 },
  topBar: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandLockup: { flexDirection: "row", alignItems: "center" },
  brandIcon: {
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor: COLORS.violet,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  brandIconText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    fontStyle: "italic",
  },
  brandName: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  premiumPill: {
    marginLeft: 8,
    borderRadius: 5,
    backgroundColor: "rgba(167,139,250,0.15)",
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  premiumText: {
    color: COLORS.purple,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  topActions: { flexDirection: "row", alignItems: "center" },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  searchGlyph: {
    color: COLORS.white,
    fontSize: 29,
    lineHeight: 31,
    transform: [{ rotate: "-20deg" }],
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#2C3046",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#D7CEFF", fontSize: 15, fontWeight: "800" },
  welcomeRow: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  eyebrow: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  welcomeTitle: {
    color: COLORS.white,
    fontSize: 29,
    fontWeight: "800",
    lineHeight: 33,
    letterSpacing: -0.9,
  },
  welcomeAccent: { color: COLORS.purple },
  streakPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: COLORS.line,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 5,
  },
  streakIcon: { color: "#FFD18A", fontSize: 12, marginRight: 5 },
  streakText: { color: "#D9D8E3", fontSize: 10, fontWeight: "600" },
  heroCard: {
    marginHorizontal: 18,
    height: 370,
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "#17182A",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  heroBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#17182A",
  },
  heroOrb: {
    position: "absolute",
    width: 245,
    height: 245,
    borderRadius: 130,
    backgroundColor: "#3A276B",
    top: 34,
    right: -43,
    opacity: 0.76,
  },
  heroHalo: {
    position: "absolute",
    width: 174,
    height: 174,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(201,185,255,0.43)",
    top: 69,
    right: -2,
  },
  heroFigure: {
    position: "absolute",
    width: 126,
    height: 255,
    right: 27,
    top: 77,
    borderTopLeftRadius: 68,
    borderTopRightRadius: 68,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    backgroundColor: "#27243D",
    borderWidth: 1,
    borderColor: "rgba(224,216,255,0.22)",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 21,
    transform: [{ rotate: "5deg" }],
    overflow: "hidden",
  },
  heroFigureMark: {
    color: "#B9A6FF",
    opacity: 0.8,
    fontSize: 64,
    fontWeight: "900",
  },
  heroTopRow: {
    position: "absolute",
    top: 16,
    left: 17,
    right: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  featuredPill: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "rgba(9,10,18,0.56)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
    flexDirection: "row",
    alignItems: "center",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.cyan,
    marginRight: 6,
  },
  featuredText: {
    color: "#F4F1FF",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
  },
  bookmarkButton: {
    width: 31,
    height: 31,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  bookmarkGlyph: {
    color: COLORS.white,
    fontSize: 23,
    lineHeight: 25,
    fontWeight: "300",
  },
  heroCopy: { position: "absolute", left: 19, bottom: 40, right: 12 },
  heroKicker: {
    color: "#C5B8F8",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.6,
    lineHeight: 13,
    marginBottom: 6,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 35,
    fontWeight: "900",
    letterSpacing: -1.2,
    lineHeight: 34,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowRadius: 8,
  },
  heroMetaRow: { flexDirection: "row", alignItems: "center", marginTop: 9 },
  heroMeta: { color: "#D0CDDC", fontSize: 10, fontWeight: "600" },
  metaDot: { color: "#77758A", fontSize: 12, marginHorizontal: 7 },
  heroButtonRow: { flexDirection: "row", alignItems: "center", marginTop: 15 },
  watchButton: {
    backgroundColor: "#F5F1FF",
    height: 39,
    borderRadius: 13,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  watchPlay: { color: "#171223", fontSize: 11, marginRight: 8 },
  watchButtonText: { color: "#171223", fontWeight: "800", fontSize: 11 },
  heroEpisodes: {
    color: "rgba(255,255,255,0.67)",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    marginLeft: 11,
  },
  heroPagination: {
    position: "absolute",
    right: 18,
    bottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  pageActive: {
    width: 18,
    height: 4,
    borderRadius: 3,
    backgroundColor: "#D4C7FF",
    marginLeft: 4,
  },
  pageInactive: {
    width: 5,
    height: 4,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.36)",
    marginLeft: 4,
  },
  heroVerticalLabel: {
    position: "absolute",
    right: 13,
    top: 153,
    color: "rgba(255,255,255,0.47)",
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 2,
    transform: [{ rotate: "90deg" }],
  },
  genreRow: {
    flexDirection: "row",
    paddingLeft: 18,
    paddingRight: 8,
    paddingTop: 17,
    paddingBottom: 3,
    alignItems: "center",
  },
  genreChip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 17,
    marginRight: 8,
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  genreChipActive: {
    backgroundColor: "rgba(167,139,250,0.15)",
    borderColor: "rgba(167,139,250,0.34)",
  },
  genreText: { color: "#B1B2C1", fontSize: 10, fontWeight: "600" },
  genreActiveText: { color: "#D6CAFF", fontSize: 10, fontWeight: "700" },
  sectionBlock: { marginTop: 25 },
  sectionHeading: {
    paddingHorizontal: 21,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  sectionAction: { color: COLORS.purple, fontSize: 10, fontWeight: "700" },
  horizontalList: { paddingLeft: 19, paddingRight: 10 },
  continueCard: {
    width: 258,
    height: 83,
    padding: 9,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: COLORS.line,
    marginRight: 10,
  },
  continueArtWrap: {
    width: 64,
    height: 63,
    borderRadius: 11,
    overflow: "hidden",
  },
  artwork: {
    flex: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  artGlow: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 40,
    top: -14,
    right: -13,
    opacity: 0.8,
  },
  artRing: {
    position: "absolute",
    width: 54,
    height: 54,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    top: 10,
    left: 5,
  },
  artSlash: {
    position: "absolute",
    width: 4,
    height: 120,
    backgroundColor: "rgba(255,255,255,0.16)",
    transform: [{ rotate: "35deg" }],
  },
  artMark: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 34,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.26)",
    textShadowRadius: 6,
  },
  largeArtwork: { minHeight: 150 },
  largeArtMark: { fontSize: 58 },
  artBottomShade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 28,
    backgroundColor: "rgba(0,0,0,0.14)",
  },
  playButton: {
    position: "absolute",
    alignSelf: "center",
    top: 18,
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "rgba(9,10,18,0.56)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  playGlyph: { color: "#FFFFFF", fontSize: 9, marginLeft: 2 },
  continueInfo: { flex: 1, marginLeft: 11, justifyContent: "center" },
  cardTitle: { color: COLORS.white, fontSize: 12, fontWeight: "700" },
  cardSubtitle: { color: COLORS.muted, fontSize: 9, marginTop: 4 },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.14)",
    marginTop: 10,
    overflow: "hidden",
  },
  progressFill: { height: 3, borderRadius: 2, backgroundColor: COLORS.purple },
  trendCard: { width: 126, marginRight: 11 },
  trendPoster: {
    height: 155,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: 9,
  },
  posterTag: {
    position: "absolute",
    left: 7,
    top: 7,
    backgroundColor: "rgba(10,10,18,0.58)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  posterTagText: {
    color: "#F4F1FF",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  ratingBadge: {
    position: "absolute",
    right: 7,
    bottom: 7,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "rgba(9,10,18,0.72)",
  },
  ratingStar: { color: "#FFD27B", fontSize: 9, marginRight: 4 },
  ratingText: { color: "#FFFFFF", fontSize: 9, fontWeight: "800" },
  newEpisodeBanner: {
    marginHorizontal: 19,
    marginTop: 24,
    marginBottom: 6,
    paddingHorizontal: 13,
    paddingVertical: 13,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(131,231,244,0.07)",
    borderWidth: 1,
    borderColor: "rgba(131,231,244,0.15)",
  },
  newEpisodeIcon: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: "rgba(131,231,244,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  newEpisodeIconText: { color: COLORS.cyan, fontSize: 17 },
  newEpisodeCopy: { flex: 1 },
  newEpisodeTitle: { color: COLORS.white, fontSize: 11, fontWeight: "700" },
  newEpisodeSub: { color: COLORS.muted, fontSize: 9, marginTop: 4 },
  bannerArrow: {
    color: COLORS.cyan,
    fontSize: 24,
    fontWeight: "300",
    marginLeft: 8,
  },
});
