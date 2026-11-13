import React, { useMemo, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type DiscoveryCategory = "For You" | "Trending" | "Top Rated" | "New";
type AnimeGenre =
  | "Action"
  | "Adventure"
  | "Fantasy"
  | "Romance"
  | "Sci-Fi"
  | "Drama"
  | "Comedy"
  | "Mystery";

type Anime = {
  id: string;
  title: string;
  japaneseTitle?: string;
  synopsis: string;
  year: number;
  rating: number;
  episodeCount: number;
  status: "Airing" | "Complete" | "Upcoming";
  genres: AnimeGenre[];
  accent: string;
  image?: ImageSourcePropType;
  featured?: boolean;
  trending?: boolean;
  topRated?: boolean;
  isNew?: boolean;
};

const COLORS = {
  background: "#09090B",
  foreground: "#FAFAFA",
  card: "#111114",
  muted: "#27272A",
  mutedForeground: "#A1A1AA",
  border: "rgba(255,255,255,0.09)",
  primary: "#A78BFA",
  primaryStrong: "#8B5CF6",
  cyan: "#67E8F9",
  gold: "#FBBF24",
};

const CATEGORIES: DiscoveryCategory[] = [
  "For You",
  "Trending",
  "Top Rated",
  "New",
];
const GENRES: Array<"All" | AnimeGenre> = [
  "All",
  "Action",
  "Adventure",
  "Fantasy",
  "Romance",
  "Sci-Fi",
  "Drama",
  "Comedy",
  "Mystery",
];

const ANIME: Anime[] = [
  {
    id: "solo-leveling",
    title: "Solo Leveling",
    japaneseTitle: "Ore dake Level Up na Ken",
    synopsis:
      "A low-ranked hunter discovers a mysterious system that lets him grow stronger without limits.",
    year: 2024,
    rating: 9.1,
    episodeCount: 12,
    status: "Complete",
    genres: ["Action", "Fantasy", "Adventure"],
    accent: "#57305F",
    featured: true,
    trending: true,
    topRated: true,
  },
  {
    id: "frieren",
    title: "Frieren: Beyond Journey's End",
    japaneseTitle: "Sousou no Frieren",
    synopsis:
      "An elf mage begins a quiet new journey after the defeat of the Demon King.",
    year: 2023,
    rating: 9.8,
    episodeCount: 28,
    status: "Complete",
    genres: ["Adventure", "Fantasy", "Drama"],
    accent: "#315B64",
    featured: true,
    topRated: true,
  },
  {
    id: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    japaneseTitle: "呪術廻戦",
    synopsis:
      "Yuji Itadori enters a hidden world of curses after swallowing a powerful cursed .",
    year: 2020,
    rating: 8.7,
    episodeCount: 47,
    status: "Complete",
    genres: ["Action", "Fantasy", "Drama"],
    accent: "#3D355F",
    trending: true,
    isNew: true,
  },
  {
    id: "one-piece",
    title: "One Piece",
    japaneseTitle: "ワンピース",
    synopsis:
      "Monkey D. Luffy and his crew sail the Grand Line in search of the world's greatest treasure.",
    year: 1999,
    rating: 9.0,
    episodeCount: 1100,
    status: "Airing",
    genres: ["Action", "Adventure", "Comedy"],
    accent: "#6A492D",
    trending: true,
    topRated: true,
  },
  {
    id: "apothecary-diaries",
    title: "The Apothecary Diaries",
    japaneseTitle: "Kusuriya no Hitorigoto",
    synopsis:
      "A sharp-witted young apothecary solves palace mysteries using her knowledge of medicine.",
    year: 2023,
    rating: 9.0,
    episodeCount: 24,
    status: "Complete",
    genres: ["Mystery", "Drama", "Romance"],
    accent: "#67404A",
    topRated: true,
    isNew: true,
  },
  {
    id: "spy-family",
    title: "SPY x FAMILY",
    japaneseTitle: "スパイファミリー",
    synopsis:
      "A spy, an assassin, and a telepath build an unusual family for a secret mission.",
    year: 2022,
    rating: 8.5,
    episodeCount: 37,
    status: "Airing",
    genres: ["Comedy", "Action", "Drama"],
    accent: "#526245",
    trending: true,
  },
  {
    id: "your-name",
    title: "Your Name.",
    japaneseTitle: "Kimi no Na wa",
    synopsis:
      "Two teenagers mysteriously begin switching bodies across time and distance.",
    year: 2016,
    rating: 8.8,
    episodeCount: 1,
    status: "Complete",
    genres: ["Romance", "Drama", "Fantasy"],
    accent: "#574367",
    topRated: true,
  },
  {
    id: "kaiju-no-8",
    title: "Kaiju No. 8",
    japaneseTitle: "怪獣8号",
    synopsis:
      "A cleanup worker gains the power to transform into the very monsters he has fought for years.",
    year: 2024,
    rating: 8.4,
    episodeCount: 12,
    status: "Complete",
    genres: ["Action", "Sci-Fi", "Adventure"],
    accent: "#34545A",
    isNew: true,
  },
  {
    id: "blue-lock",
    title: "Blue Lock",
    japaneseTitle: "ブルーロック",
    synopsis:
      "Strikers compete in an intense program designed to create the world's greatest egoist forward.",
    year: 2022,
    rating: 8.2,
    episodeCount: 24,
    status: "Complete",
    genres: ["Drama", "Action"],
    accent: "#315075",
    trending: true,
  },
  {
    id: "dandadan",
    title: "DAN DA DAN",
    japaneseTitle: "ダンダダン",
    synopsis:
      "A paranormal wager pulls two teenagers into a wild collision of aliens and spirits.",
    year: 2024,
    rating: 8.6,
    episodeCount: 12,
    status: "Complete",
    genres: ["Action", "Comedy", "Mystery"],
    accent: "#75414D",
    trending: true,
    isNew: true,
  },
];

function PosterArtwork({
  anime,
  compact = false,
}: {
  anime: Anime;
  compact?: boolean;
}) {
  return (
    <View
      style={[
        styles.posterArtwork,
        compact ? styles.posterArtworkCompact : styles.posterArtworkLarge,
        { backgroundColor: anime.accent },
      ]}
    >
      {anime.image ? (
        <Image
          source={anime.image}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : (
        <>
          <View style={[styles.artGlow, { backgroundColor: anime.accent }]} />
          <View style={styles.artOrbLarge} />
          <View style={styles.artOrbSmall} />
          <View style={styles.artSlash} />
          <View style={styles.posterPlaceholderContent}>
            <View style={styles.posterPlaceholderBadge}>
              <Text style={styles.posterPlaceholderBadgeText}>
                ANISHIE ORIGINAL
              </Text>
            </View>
            <Text
              style={[
                styles.posterPlaceholderTitle,
                compact && styles.posterPlaceholderTitleCompact,
              ]}
              numberOfLines={3}
            >
              {anime.title.toUpperCase()}
            </Text>
            {!compact && (
              <Text style={styles.posterPlaceholderJapanese} numberOfLines={1}>
                {anime.japaneseTitle ?? "ANIME SERIES"}
              </Text>
            )}
          </View>
        </>
      )}
      <View style={styles.posterVignette} />
    </View>
  );
}

function GenreChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.genreChip, selected && styles.genreChipSelected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text
        style={[styles.genreChipText, selected && styles.genreChipTextSelected]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function Discover() {
  const { width: windowWidth } = useWindowDimensions();
  const [query, setQuery] = useState<string>("");
  const [category, setCategory] = useState<DiscoveryCategory>("For You");
  const [selectedGenre, setSelectedGenre] = useState<"All" | AnimeGenre>("All");
  const [savedAnimeIds, setSavedAnimeIds] = useState<string[]>([]);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState<number>(0);

  const horizontalPadding = 20;
  const gridGap = 12;
  const cardWidth = (windowWidth - horizontalPadding * 2 - gridGap) / 2;
  const featuredAnime = useMemo(
    () => ANIME.filter((anime) => anime.featured),
    [],
  );

  const filteredAnime = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return ANIME.filter((anime) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        anime.title.toLowerCase().includes(normalizedQuery) ||
        anime.japaneseTitle?.toLowerCase().includes(normalizedQuery) ||
        anime.genres.some((genre) =>
          genre.toLowerCase().includes(normalizedQuery),
        );

      const matchesGenre =
        selectedGenre === "All" || anime.genres.includes(selectedGenre);

      const matchesCategory =
        category === "For You" ||
        (category === "Trending" && anime.trending) ||
        (category === "Top Rated" && anime.topRated) ||
        (category === "New" && anime.isNew);

      return matchesQuery && matchesGenre && matchesCategory;
    });
  }, [category, query, selectedGenre]);

  const toggleSaved = (animeId: string) => {
    setSavedAnimeIds((current) =>
      current.includes(animeId)
        ? current.filter((id) => id !== animeId)
        : [...current, animeId],
    );
  };

  const onFeaturedScroll = (event: {
    nativeEvent: { contentOffset: { x: number } };
  }) => {
    const pageWidth = windowWidth - horizontalPadding * 2 + 12;
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    setActiveFeatureIndex(
      Math.max(0, Math.min(nextIndex, featuredAnime.length - 1)),
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.brandLine}>
            <View style={styles.brandLockup}>
              <View style={styles.brandIcon}>
                <Text style={styles.brandIconText}>A</Text>
              </View>
              <Text style={styles.brandName}>anishie</Text>
              <View style={styles.premiumPill}>
                <Text style={styles.premiumText}>PLUS</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>A</Text>
              </View>
            </View>
          </View>

          <View style={styles.headingRow}>
            <View>
              <Text style={styles.eyebrow}>YOUR NEXT FAVORITE</Text>
              <Text style={styles.pageTitle}>Discover</Text>
            </View>
            <View style={styles.headerSparkle}>
              <Ionicons
                name="aperture-outline"
                size={23}
                color={COLORS.primary}
              />
            </View>
          </View>
          <Text style={styles.pageSubtitle}>
            Find a new world to get lost in.
          </Text>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={COLORS.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search anime, genres, or moods"
            placeholderTextColor="#71717A"
            style={styles.searchInput}
            returnKeyType="search"
            accessibilityLabel="Search anime"
          />
          {query.length > 0 ? (
            <Pressable
              onPress={() => setQuery("")}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={COLORS.mutedForeground}
              />
            </Pressable>
          ) : (
            <View style={styles.searchShortcut}>
              <Text style={styles.searchShortcutText}>⌘ K</Text>
            </View>
          )}
        </View>

        <View style={styles.categoryWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          >
            {CATEGORIES.map((item) => {
              const selected = category === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setCategory(item)}
                  style={[
                    styles.categoryPill,
                    selected && styles.categoryPillSelected,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selected && styles.categoryTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {category === "For You" &&
          query.length === 0 &&
          selectedGenre === "All" && (
            <View style={styles.featureSection}>
              <View style={styles.sectionHeading}>
                <View>
                  <Text style={styles.sectionEyebrow}>EDITOR'S PICK</Text>
                  <Text style={styles.sectionTitle}>Featured anime</Text>
                </View>
                <View style={styles.featureLabel}>
                  <Ionicons name="flash" size={11} color={COLORS.gold} />
                  <Text style={styles.featureLabelText}>THIS WEEK</Text>
                </View>
              </View>

              <ScrollView
                horizontal
                pagingEnabled
                snapToInterval={windowWidth - horizontalPadding * 2 + 12}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredScroll}
                onScroll={onFeaturedScroll}
                scrollEventThrottle={16}
              >
                {featuredAnime.map((anime, index) => (
                  <View
                    key={anime.id}
                    style={[
                      styles.featureCard,
                      { width: windowWidth - horizontalPadding * 2 },
                    ]}
                  >
                    <PosterArtwork anime={anime} />
                    <View style={styles.featureOverlay} />
                    <View style={styles.featureTopRow}>
                      <View style={styles.featureRank}>
                        <Text style={styles.featureRankText}>0{index + 1}</Text>
                      </View>
                      <Pressable
                        onPress={() => toggleSaved(anime.id)}
                        style={styles.featureSaveButton}
                        accessibilityRole="button"
                        accessibilityLabel={
                          savedAnimeIds.includes(anime.id)
                            ? "Remove from watchlist"
                            : "Add to watchlist"
                        }
                      >
                        <Ionicons
                          name={
                            savedAnimeIds.includes(anime.id)
                              ? "bookmark"
                              : "bookmark-outline"
                          }
                          size={17}
                          color={COLORS.foreground}
                        />
                      </Pressable>
                    </View>
                    <View style={styles.featureContent}>
                      <View style={styles.featureMetaRow}>
                        <View style={styles.featureMetaBadge}>
                          <Ionicons name="star" size={10} color={COLORS.gold} />
                          <Text style={styles.featureMetaRating}>
                            {anime.rating.toFixed(1)}
                          </Text>
                        </View>
                        <Text style={styles.featureMetaText}>{anime.year}</Text>
                        <View style={styles.metaDot} />
                        <Text style={styles.featureMetaText}>
                          {anime.episodeCount} EPISODES
                        </Text>
                      </View>
                      <Text style={styles.featureTitle} numberOfLines={2}>
                        {anime.title}
                      </Text>
                      <Text style={styles.featureSynopsis} numberOfLines={2}>
                        {anime.synopsis}
                      </Text>
                      <View style={styles.featureBottomRow}>
                        <View style={styles.featureTags}>
                          {anime.genres.slice(0, 2).map((genre) => (
                            <View key={genre} style={styles.featureGenreTag}>
                              <Text style={styles.featureGenreTagText}>
                                {genre}
                              </Text>
                            </View>
                          ))}
                        </View>
                        <Pressable
                          style={styles.featurePlayButton}
                          accessibilityRole="button"
                          accessibilityLabel={`View ${anime.title}`}
                        >
                          <Ionicons name="play" size={13} color="#09090B" />
                          <Text style={styles.featurePlayText}>Explore</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
              <View style={styles.featurePagination}>
                {featuredAnime.map((anime, index) => (
                  <View
                    key={anime.id}
                    style={[
                      styles.paginationDot,
                      index === activeFeatureIndex &&
                        styles.paginationDotActive,
                    ]}
                  />
                ))}
                <Text style={styles.paginationLabel}>
                  {String(activeFeatureIndex + 1).padStart(2, "0")} /{" "}
                  {String(featuredAnime.length).padStart(2, "0")}
                </Text>
              </View>
            </View>
          )}

        <View style={styles.genreSection}>
          <View style={styles.sectionHeading}>
            <View>
              <Text style={styles.sectionEyebrow}>BROWSE BY MOOD</Text>
              <Text style={styles.sectionTitle}>Explore genres</Text>
            </View>
            <Ionicons
              name="options-outline"
              size={19}
              color={COLORS.mutedForeground}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.genreList}
          >
            {GENRES.map((genre) => (
              <GenreChip
                key={genre}
                label={genre}
                selected={selectedGenre === genre}
                onPress={() => setSelectedGenre(genre)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.catalogSection}>
          <View style={styles.catalogHeading}>
            <View>
              <Text style={styles.sectionEyebrow}>
                {category === "For You"
                  ? "HANDPICKED FOR YOU"
                  : `THE ${category.toUpperCase()} LIST`}
              </Text>
              <Text style={styles.sectionTitle}>
                {selectedGenre === "All"
                  ? "Anime to explore"
                  : `${selectedGenre} anime`}
              </Text>
            </View>
            <View style={styles.resultCount}>
              <Text style={styles.resultCountText}>
                {filteredAnime.length} TITLES
              </Text>
            </View>
          </View>

          {filteredAnime.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="search-outline"
                  size={24}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>No anime found</Text>
              <Text style={styles.emptyCopy}>
                Try another title or genre to find your next watch.
              </Text>
              <Pressable
                onPress={() => {
                  setQuery("");
                  setSelectedGenre("All");
                  setCategory("For You");
                }}
                style={styles.resetButton}
                accessibilityRole="button"
              >
                <Text style={styles.resetButtonText}>Reset filters</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.animeGrid}>
              {filteredAnime.map((anime, index) => {
                const saved = savedAnimeIds.includes(anime.id);
                return (
                  <Pressable
                    key={anime.id}
                    onPress={() => {
                      /* Connect to your Watch route here, e.g. router.push({ pathname: "/Watch", params: { id: anime.id } }). */
                    }}
                    style={[
                      styles.animeCard,
                      { width: cardWidth },
                      index % 2 === 0 ? styles.cardLifted : undefined,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${anime.title}`}
                  >
                    <View style={styles.animePosterWrap}>
                      <PosterArtwork anime={anime} compact />
                      <View style={styles.posterTopBadges}>
                        {anime.status === "Airing" ? (
                          <View style={styles.airingBadge}>
                            <View style={styles.airingDot} />
                            <Text style={styles.airingBadgeText}>AIRING</Text>
                          </View>
                        ) : anime.isNew ? (
                          <View style={styles.newBadge}>
                            <Text style={styles.newBadgeText}>NEW</Text>
                          </View>
                        ) : null}
                        <Pressable
                          onPress={() => toggleSaved(anime.id)}
                          style={styles.saveButton}
                          accessibilityRole="button"
                          accessibilityLabel={
                            saved
                              ? `Remove ${anime.title} from watchlist`
                              : `Save ${anime.title}`
                          }
                          hitSlop={6}
                        >
                          <Ionicons
                            name={saved ? "heart" : "heart-outline"}
                            size={15}
                            color={saved ? "#FB7185" : COLORS.foreground}
                          />
                        </Pressable>
                      </View>
                      <View style={styles.posterBottomBadges}>
                        <View style={styles.ratingBadge}>
                          <Ionicons name="star" size={9} color={COLORS.gold} />
                          <Text style={styles.ratingBadgeText}>
                            {anime.rating.toFixed(1)}
                          </Text>
                        </View>
                        <View style={styles.episodeBadge}>
                          <Text style={styles.episodeBadgeText}>
                            {anime.episodeCount === 1
                              ? "MOVIE"
                              : `${anime.episodeCount} EPS`}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.animeCardInfo}>
                      <Text style={styles.animeCardTitle} numberOfLines={1}>
                        {anime.title}
                      </Text>
                      <Text style={styles.animeCardJapanese} numberOfLines={1}>
                        {anime.japaneseTitle ??
                          `${anime.year} · ${anime.status}`}
                      </Text>
                      <View style={styles.animeCardTags}>
                        {anime.genres.slice(0, 2).map((genre) => (
                          <Text
                            key={genre}
                            style={styles.animeCardTag}
                            numberOfLines={1}
                          >
                            {genre}
                          </Text>
                        ))}
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.bottomNote}>
          <Ionicons name="sparkles-outline" size={13} color={COLORS.primary} />
          <Text style={styles.bottomNoteText}>
            A new story is always waiting.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  screen: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 34 },
  header: { paddingHorizontal: 20, paddingTop: 12 },
  brandLine: {
    minHeight: 53,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandLockup: { flexDirection: "row", alignItems: "center" },
  brandIcon: {
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor: COLORS.primaryStrong,
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
    color: COLORS.foreground,
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
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  headerRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  avatar: {
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor: "#292132",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#E7DDFF", fontSize: 11, fontWeight: "900" },
  headingRow: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.8,
    marginBottom: 5,
  },
  pageTitle: {
    color: COLORS.foreground,
    fontSize: 31,
    lineHeight: 37,
    fontWeight: "900",
    letterSpacing: -1.1,
  },
  headerSparkle: {
    width: 43,
    height: 43,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(167,139,250,0.09)",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.16)",
  },
  pageSubtitle: { color: COLORS.mutedForeground, fontSize: 11, marginTop: 4 },
  searchWrap: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 21,
    paddingHorizontal: 13,
    borderRadius: 15,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    color: COLORS.foreground,
    fontSize: 11,
    paddingVertical: 0,
    marginLeft: 9,
  },
  searchShortcut: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.055)",
  },
  searchShortcutText: {
    color: COLORS.mutedForeground,
    fontSize: 8,
    fontWeight: "700",
  },
  categoryWrap: { marginTop: 17 },
  categoryList: { paddingHorizontal: 20, paddingRight: 12 },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 11,
    marginRight: 7,
    borderWidth: 1,
    borderColor: "transparent",
  },
  categoryPillSelected: {
    backgroundColor: "rgba(167,139,250,0.13)",
    borderColor: "rgba(167,139,250,0.2)",
  },
  categoryText: {
    color: COLORS.mutedForeground,
    fontSize: 9,
    fontWeight: "700",
  },
  categoryTextSelected: { color: "#E6DDFF" },
  featureSection: { marginTop: 25 },
  sectionHeading: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  sectionEyebrow: {
    color: COLORS.mutedForeground,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 5,
  },
  sectionTitle: {
    color: COLORS.foreground,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  featureLabel: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 1,
    borderRadius: 8,
    backgroundColor: "rgba(251,191,36,0.08)",
  },
  featureLabelText: {
    color: "#FCD34D",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  featuredScroll: { paddingHorizontal: 20, paddingRight: 32 },
  featureCard: {
    height: 242,
    overflow: "hidden",
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  posterArtwork: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  posterArtworkLarge: { ...StyleSheet.absoluteFill },
  posterArtworkCompact: { ...StyleSheet.absoluteFill },
  artGlow: {
    position: "absolute",
    top: -105,
    right: -45,
    width: 235,
    height: 235,
    borderRadius: 120,
    opacity: 0.82,
  },
  artOrbLarge: {
    position: "absolute",
    right: -39,
    bottom: -35,
    width: 175,
    height: 175,
    borderRadius: 95,
    backgroundColor: "rgba(8,8,12,0.32)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
  },
  artOrbSmall: {
    position: "absolute",
    right: 36,
    bottom: 41,
    width: 66,
    height: 66,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  artSlash: {
    position: "absolute",
    right: 74,
    top: -34,
    width: 22,
    height: 300,
    backgroundColor: "rgba(255,255,255,0.045)",
    transform: [{ rotate: "27deg" }],
  },
  posterPlaceholderContent: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 17,
    zIndex: 1,
  },
  posterPlaceholderBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 5,
    marginBottom: 8,
    backgroundColor: "rgba(9,9,11,0.45)",
  },
  posterPlaceholderBadgeText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 5,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  posterPlaceholderTitle: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: 1,
    lineHeight: 24,
  },
  posterPlaceholderTitleCompact: { fontSize: 15, lineHeight: 18 },
  posterPlaceholderJapanese: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 7,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginTop: 5,
  },
  posterVignette: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  featureOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(7,7,12,0.37)",
  },
  featureTopRow: {
    position: "absolute",
    top: 13,
    left: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  featureRank: {
    width: 30,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: "rgba(9,9,11,0.52)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  featureRankText: { color: COLORS.foreground, fontSize: 9, fontWeight: "900" },
  featureSaveButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: "rgba(9,9,11,0.5)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
  },
  featureContent: { position: "absolute", left: 15, right: 15, bottom: 14 },
  featureMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },
  featureMetaBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: "rgba(9,9,11,0.45)",
  },
  featureMetaRating: {
    color: COLORS.foreground,
    fontSize: 8,
    fontWeight: "800",
    marginLeft: 4,
  },
  featureMetaText: {
    color: "rgba(255,255,255,0.77)",
    fontSize: 7,
    fontWeight: "700",
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.64)",
    marginHorizontal: 7,
  },
  featureTitle: {
    color: COLORS.foreground,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  featureSynopsis: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 9,
    lineHeight: 14,
    marginTop: 5,
    maxWidth: "86%",
  },
  featureBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  featureTags: { flexDirection: "row", alignItems: "center" },
  featureGenreTag: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 5,
    backgroundColor: "rgba(255,255,255,0.13)",
  },
  featureGenreTagText: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 7,
    fontWeight: "700",
  },
  featurePlayButton: {
    height: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: COLORS.foreground,
  },
  featurePlayText: {
    color: COLORS.background,
    fontSize: 8,
    fontWeight: "900",
    marginLeft: 5,
  },
  featurePagination: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 12,
  },
  paginationDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
    backgroundColor: "#3F3F46",
  },
  paginationDotActive: { width: 17, backgroundColor: COLORS.primary },
  paginationLabel: {
    color: COLORS.mutedForeground,
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginLeft: 5,
  },
  genreSection: { marginTop: 27 },
  genreList: { paddingHorizontal: 20, paddingRight: 12 },
  genreChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 7,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  genreChipSelected: {
    backgroundColor: "rgba(167,139,250,0.13)",
    borderColor: "rgba(167,139,250,0.34)",
  },
  genreChipText: {
    color: COLORS.mutedForeground,
    fontSize: 8,
    fontWeight: "700",
  },
  genreChipTextSelected: { color: "#E6DDFF" },
  catalogSection: { marginTop: 29, paddingHorizontal: 20 },
  catalogHeading: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  resultCount: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.045)",
  },
  resultCountText: {
    color: COLORS.mutedForeground,
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  animeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  animeCard: { marginBottom: 18 },
  cardLifted: {},
  animePosterWrap: {
    height: 207,
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  posterTopBadges: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  airingBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: "rgba(9,9,11,0.72)",
  },
  airingDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 4,
    backgroundColor: "#4ADE80",
  },
  airingBadgeText: {
    color: COLORS.foreground,
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  newBadge: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: "rgba(139,92,246,0.88)",
  },
  newBadgeText: {
    color: COLORS.foreground,
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  saveButton: {
    width: 27,
    height: 27,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(9,9,11,0.69)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  posterBottomBadges: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(9,9,11,0.76)",
  },
  ratingBadgeText: {
    color: COLORS.foreground,
    fontSize: 7,
    fontWeight: "800",
    marginLeft: 3,
  },
  episodeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(9,9,11,0.76)",
  },
  episodeBadgeText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 6,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  animeCardInfo: { paddingHorizontal: 2, paddingTop: 8 },
  animeCardTitle: { color: COLORS.foreground, fontSize: 10, fontWeight: "800" },
  animeCardJapanese: {
    color: COLORS.mutedForeground,
    fontSize: 7,
    marginTop: 3,
  },
  animeCardTags: { flexDirection: "row", marginTop: 7 },
  animeCardTag: {
    color: "#C4B5FD",
    fontSize: 6,
    fontWeight: "700",
    marginRight: 8,
    maxWidth: "48%",
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 34,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(167,139,250,0.11)",
  },
  emptyTitle: {
    color: COLORS.foreground,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 13,
  },
  emptyCopy: {
    color: COLORS.mutedForeground,
    fontSize: 9,
    lineHeight: 14,
    textAlign: "center",
    marginTop: 6,
  },
  resetButton: {
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: "rgba(167,139,250,0.14)",
  },
  resetButtonText: { color: "#E6DDFF", fontSize: 8, fontWeight: "800" },
  bottomNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 3,
    paddingVertical: 16,
  },
  bottomNoteText: { color: COLORS.mutedForeground, fontSize: 8, marginLeft: 6 },
});
