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

type WatchStatus = "Watching" | "Completed" | "Plan to watch";
type ViewMode = "grid" | "list";
type WatchFilter = "All" | WatchStatus;

type WatchlistAnime = {
  id: string;
  title: string;
  subtitle: string;
  rating: number;
  year: number;
  episodeCount: number;
  watchedEpisodes: number;
  status: WatchStatus;
  accent: string;
  image?: ImageSourcePropType;
};

const COLORS = {
  background: "#09090B",
  foreground: "#FAFAFA",
  surface: "#111114",
  surfaceRaised: "#18181D",
  muted: "#27272A",
  mutedForeground: "#A1A1AA",
  border: "rgba(255,255,255,0.09)",
  primary: "#A78BFA",
  primaryStrong: "#8B5CF6",
  cyan: "#67E8F9",
  gold: "#FBBF24",
  rose: "#FB7185",
};

const WATCHLIST_DATA: WatchlistAnime[] = [
  {
    id: "solo-leveling",
    title: "Solo Leveling",
    subtitle: "Ore dake Level Up na Ken",
    rating: 9.1,
    year: 2024,
    episodeCount: 12,
    watchedEpisodes: 8,
    status: "Watching",
    accent: "#57305F",
  },
  {
    id: "frieren",
    title: "Frieren: Beyond Journey's End",
    subtitle: "Sousou no Frieren",
    rating: 9.8,
    year: 2023,
    episodeCount: 28,
    watchedEpisodes: 28,
    status: "Completed",
    accent: "#315B64",
  },
  {
    id: "jujutsu-kaisen",
    title: "Jujutsu Kaisen",
    subtitle: "Jujutsu Kaisen Season 2",
    rating: 8.7,
    year: 2023,
    episodeCount: 23,
    watchedEpisodes: 12,
    status: "Watching",
    accent: "#3D355F",
  },
  {
    id: "one-piece",
    title: "One Piece",
    subtitle: "East Blue Saga",
    rating: 9.0,
    year: 1999,
    episodeCount: 1100,
    watchedEpisodes: 64,
    status: "Watching",
    accent: "#6A492D",
  },
  {
    id: "apothecary-diaries",
    title: "The Apothecary Diaries",
    subtitle: "Kusuriya no Hitorigoto",
    rating: 9.0,
    year: 2023,
    episodeCount: 24,
    watchedEpisodes: 0,
    status: "Plan to watch",
    accent: "#67404A",
  },
  {
    id: "dandadan",
    title: "DAN DA DAN",
    subtitle: "First Season",
    rating: 8.6,
    year: 2024,
    episodeCount: 12,
    watchedEpisodes: 12,
    status: "Completed",
    accent: "#75414D",
  },
];

const FILTERS: WatchFilter[] = [
  "All",
  "Watching",
  "Completed",
  "Plan to watch",
];

function PosterArt({
  anime,
  compact = false,
}: {
  anime: WatchlistAnime;
  compact?: boolean;
}) {
  return (
    <View
      style={[
        styles.poster,
        compact ? styles.posterCompact : styles.posterLarge,
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
          <View
            style={[styles.posterGlow, { backgroundColor: anime.accent }]}
          />
          <View style={styles.posterOrb} />
          <View style={styles.posterSlash} />
          <View style={styles.posterCopy}>
            <View style={styles.posterBrandTag}>
              <Text style={styles.posterBrandTagText}>ANISHIE PICK</Text>
            </View>
            <Text style={styles.posterTitle} numberOfLines={3}>
              {anime.title.toUpperCase()}
            </Text>
          </View>
        </>
      )}
      <View style={styles.posterShade} />
    </View>
  );
}

function StatusPill({ status }: { status: WatchStatus }) {
  const iconName =
    status === "Watching"
      ? "play-circle"
      : status === "Completed"
        ? "checkmark-circle"
        : "time";
  return (
    <View
      style={[
        styles.statusPill,
        status === "Watching" && styles.statusWatching,
        status === "Completed" && styles.statusCompleted,
        status === "Plan to watch" && styles.statusPlanned,
      ]}
    >
      <Ionicons
        name={iconName}
        size={11}
        color={
          status === "Watching"
            ? COLORS.cyan
            : status === "Completed"
              ? "#86EFAC"
              : "#FCD34D"
        }
      />
      <Text
        style={[
          styles.statusText,
          status === "Watching" && styles.statusTextWatching,
          status === "Completed" && styles.statusTextCompleted,
          status === "Plan to watch" && styles.statusTextPlanned,
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

export default function Watchlist() {
  const { width: windowWidth } = useWindowDimensions();
  const [filter, setFilter] = useState<WatchFilter>("All");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>("");
  const [animeItems, setAnimeItems] =
    useState<WatchlistAnime[]>(WATCHLIST_DATA);

  const horizontalPadding = 20;
  const gap = 12;
  const cardWidth = (windowWidth - horizontalPadding * 2 - gap) / 2;

  const filteredAnime = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return animeItems.filter((anime) => {
      const matchesFilter = filter === "All" || anime.status === filter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        anime.title.toLowerCase().includes(normalizedQuery) ||
        anime.subtitle.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [animeItems, filter, query]);

  const counts = useMemo(
    () => ({
      All: animeItems.length,
      Watching: animeItems.filter((anime) => anime.status === "Watching")
        .length,
      Completed: animeItems.filter((anime) => anime.status === "Completed")
        .length,
      "Plan to watch": animeItems.filter(
        (anime) => anime.status === "Plan to watch",
      ).length,
    }),
    [animeItems],
  );

  const removeFromList = (animeId: string) => {
    setAnimeItems((current) => current.filter((anime) => anime.id !== animeId));
  };

  const renderGridCard = (anime: WatchlistAnime, index: number) => {
    const progress =
      anime.episodeCount > 0
        ? Math.min((anime.watchedEpisodes / anime.episodeCount) * 100, 100)
        : 0;
    return (
      <Pressable
        key={anime.id}
        onPress={() => {
          /* Connect this card to your anime/watch route. */
        }}
        style={[
          styles.gridCard,
          { width: cardWidth },
          index % 2 === 0 ? styles.gridCardLifted : undefined,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Open ${anime.title}, ${anime.status}`}
      >
        <View style={styles.gridPosterWrap}>
          <PosterArt anime={anime} compact />
          <View style={styles.posterTopRow}>
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={9} color={COLORS.gold} />
              <Text style={styles.ratingText}>{anime.rating.toFixed(1)}</Text>
            </View>
            <Pressable
              onPress={() => removeFromList(anime.id)}
              style={styles.removeButton}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${anime.title} from watchlist`}
            >
              <Ionicons name="heart" size={15} color={COLORS.rose} />
            </Pressable>
          </View>
          <View style={styles.gridStatusWrap}>
            <StatusPill status={anime.status} />
          </View>
        </View>
        <View style={styles.gridCardInfo}>
          <Text style={styles.animeTitle} numberOfLines={1}>
            {anime.title}
          </Text>
          <Text style={styles.animeSubtitle} numberOfLines={1}>
            {anime.subtitle}
          </Text>
          <View style={styles.progressMetaRow}>
            <Text style={styles.progressCaption}>
              {anime.status === "Plan to watch"
                ? `${anime.episodeCount} episodes`
                : `${anime.watchedEpisodes} / ${anime.episodeCount} eps`}
            </Text>
            {anime.status !== "Plan to watch" && (
              <Text style={styles.progressPercent}>
                {Math.round(progress)}%
              </Text>
            )}
          </View>
          {anime.status !== "Plan to watch" && (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  const renderListCard = (anime: WatchlistAnime) => {
    const progress =
      anime.episodeCount > 0
        ? Math.min((anime.watchedEpisodes / anime.episodeCount) * 100, 100)
        : 0;
    return (
      <Pressable
        key={anime.id}
        onPress={() => {
          /* Connect this card to your anime/watch route. */
        }}
        style={styles.listCard}
        accessibilityRole="button"
        accessibilityLabel={`Open ${anime.title}, ${anime.status}`}
      >
        <View style={styles.listPosterWrap}>
          <PosterArt anime={anime} compact />
        </View>
        <View style={styles.listCardInfo}>
          <View style={styles.listTitleRow}>
            <Text style={styles.listAnimeTitle} numberOfLines={1}>
              {anime.title}
            </Text>
            <View style={styles.listRating}>
              <Ionicons name="star" size={9} color={COLORS.gold} />
              <Text style={styles.ratingText}>{anime.rating.toFixed(1)}</Text>
            </View>
          </View>
          <Text style={styles.animeSubtitle} numberOfLines={1}>
            {anime.subtitle}
          </Text>
          <View style={styles.listStatusRow}>
            <StatusPill status={anime.status} />
            <Text style={styles.listEpisodeCount}>
              {anime.status === "Plan to watch"
                ? `${anime.episodeCount} episodes`
                : `Ep ${anime.watchedEpisodes} of ${anime.episodeCount}`}
            </Text>
          </View>
          {anime.status !== "Plan to watch" && (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          )}
        </View>
        <Pressable
          onPress={() => removeFromList(anime.id)}
          style={styles.listRemoveButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${anime.title} from watchlist`}
        >
          <Ionicons name="heart" size={17} color={COLORS.rose} />
        </Pressable>
      </Pressable>
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
          <Pressable
            onPress={() => {
              setSearchOpen((open) => !open);
              setQuery("");
            }}
            style={styles.headerSearchButton}
            accessibilityRole="button"
            accessibilityLabel={
              searchOpen ? "Close watchlist search" : "Search watchlist"
            }
          >
            <Ionicons
              name={searchOpen ? "close" : "search"}
              size={18}
              color={COLORS.foreground}
            />
          </Pressable>
        </View>

        <View style={styles.titleBlock}>
          <View style={styles.titleEyebrowRow}>
            <View style={styles.titleEyebrowDot} />
            <Text style={styles.eyebrow}>YOUR PERSONAL COLLECTION</Text>
          </View>
          <View style={styles.titleLine}>
            <Text style={styles.pageTitle}>My List</Text>
            <View style={styles.totalCountPill}>
              <Text style={styles.totalCountText}>
                {animeItems.length} TITLES
              </Text>
            </View>
          </View>
          <Text style={styles.pageSubtitle}>
            All your favorite stories, saved in one place.
          </Text>
        </View>

        {searchOpen && (
          <View style={styles.searchField}>
            <Ionicons name="search" size={17} color={COLORS.mutedForeground} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Find something in your list"
              placeholderTextColor="#777985"
              style={styles.searchInput}
              returnKeyType="search"
              accessibilityLabel="Search saved anime"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")} hitSlop={8}>
                <Ionicons
                  name="close-circle"
                  size={17}
                  color={COLORS.mutedForeground}
                />
              </Pressable>
            )}
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Ionicons name="play" size={13} color={COLORS.cyan} />
            </View>
            <View>
              <Text style={styles.statValue}>{counts.Watching}</Text>
              <Text style={styles.statLabel}>Watching</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, styles.statIconBoxComplete]}>
              <Ionicons name="checkmark" size={14} color="#86EFAC" />
            </View>
            <View>
              <Text style={styles.statValue}>{counts.Completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, styles.statIconBoxPlanned]}>
              <Ionicons name="bookmark" size={12} color="#FCD34D" />
            </View>
            <View>
              <Text style={styles.statValue}>{counts["Plan to watch"]}</Text>
              <Text style={styles.statLabel}>Up next</Text>
            </View>
          </View>
        </View>

        <View style={styles.filterHeader}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          >
            {FILTERS.map((item) => {
              const selected = filter === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => setFilter(item)}
                  style={[
                    styles.filterChip,
                    selected && styles.filterChipSelected,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selected && styles.filterTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  <Text
                    style={[
                      styles.filterCount,
                      selected && styles.filterCountSelected,
                    ]}
                  >
                    {counts[item]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.collectionHeader}>
          <View>
            <Text style={styles.collectionTitle}>
              {filter === "All" ? "Saved anime" : filter}
            </Text>
            <Text style={styles.collectionSubtitle}>
              {filteredAnime.length}{" "}
              {filteredAnime.length === 1 ? "title" : "titles"}
              {query.trim() ? " found" : " in your collection"}
            </Text>
          </View>
          <View style={styles.viewToggle}>
            <Pressable
              onPress={() => setViewMode("grid")}
              style={[
                styles.viewButton,
                viewMode === "grid" && styles.viewButtonSelected,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Grid view"
              accessibilityState={{ selected: viewMode === "grid" }}
            >
              <Ionicons
                name="grid-outline"
                size={15}
                color={
                  viewMode === "grid"
                    ? COLORS.foreground
                    : COLORS.mutedForeground
                }
              />
            </Pressable>
            <Pressable
              onPress={() => setViewMode("list")}
              style={[
                styles.viewButton,
                viewMode === "list" && styles.viewButtonSelected,
              ]}
              accessibilityRole="button"
              accessibilityLabel="List view"
              accessibilityState={{ selected: viewMode === "list" }}
            >
              <Ionicons
                name="list-outline"
                size={17}
                color={
                  viewMode === "list"
                    ? COLORS.foreground
                    : COLORS.mutedForeground
                }
              />
            </Pressable>
          </View>
        </View>

        {filteredAnime.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconOuter}>
              <View style={styles.emptyIconInner}>
                <Ionicons
                  name="bookmark-outline"
                  size={25}
                  color={COLORS.primary}
                />
              </View>
            </View>
            <Text style={styles.emptyTitle}>
              {query.trim() ? "No titles found" : "Your list is waiting"}
            </Text>
            <Text style={styles.emptyCopy}>
              {query.trim()
                ? "Try another title or clear your search."
                : "Save anime you love and they’ll show up here."}
            </Text>
            {query.trim() ? (
              <Pressable
                onPress={() => setQuery("")}
                style={styles.emptyButton}
              >
                <Text style={styles.emptyButtonText}>Clear search</Text>
              </Pressable>
            ) : (
              <View style={styles.emptyHint}>
                <Ionicons
                  name="sparkles-outline"
                  size={13}
                  color={COLORS.primary}
                />
                <Text style={styles.emptyHintText}>
                  Find your next favorite in Discover
                </Text>
              </View>
            )}
          </View>
        ) : viewMode === "grid" ? (
          <View style={styles.grid}>
            {filteredAnime.map((anime, index) => renderGridCard(anime, index))}
          </View>
        ) : (
          <View style={styles.list}>
            {filteredAnime.map((anime) => renderListCard(anime))}
          </View>
        )}

        <View style={styles.bottomNote}>
          <Ionicons name="sparkles-outline" size={13} color={COLORS.primary} />
          <Text style={styles.bottomNoteText}>
            A good story is worth keeping.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  screen: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 30 },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
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
  headerSearchButton: {
    width: 37,
    height: 37,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  titleBlock: { paddingHorizontal: 20, paddingTop: 27, paddingBottom: 17 },
  titleEyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },
  titleEyebrowDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginRight: 7,
  },
  eyebrow: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.6,
  },
  titleLine: { flexDirection: "row", alignItems: "center" },
  pageTitle: {
    color: COLORS.foreground,
    fontSize: 31,
    lineHeight: 37,
    fontWeight: "900",
    letterSpacing: -1,
  },
  totalCountPill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginLeft: 10,
    borderRadius: 7,
    backgroundColor: "rgba(167,139,250,0.12)",
  },
  totalCountText: {
    color: "#D8CEFF",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  pageSubtitle: { color: COLORS.mutedForeground, fontSize: 10, marginTop: 5 },
  searchField: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 15,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.32)",
  },
  searchInput: {
    flex: 1,
    color: COLORS.foreground,
    fontSize: 10,
    marginLeft: 9,
    paddingVertical: 0,
  },
  statsRow: {
    minHeight: 73,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginHorizontal: 20,
    paddingHorizontal: 5,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.035)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.065)",
  },
  statCard: { flexDirection: "row", alignItems: "center" },
  statIconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(103,232,249,0.09)",
    marginRight: 8,
  },
  statIconBoxComplete: { backgroundColor: "rgba(134,239,172,0.09)" },
  statIconBoxPlanned: { backgroundColor: "rgba(252,211,77,0.09)" },
  statValue: { color: COLORS.foreground, fontSize: 13, fontWeight: "900" },
  statLabel: { color: COLORS.mutedForeground, fontSize: 7, marginTop: 2 },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  filterHeader: { marginTop: 19 },
  filterList: { paddingHorizontal: 20, paddingRight: 12 },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 9,
    marginRight: 7,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.035)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.055)",
  },
  filterChipSelected: {
    backgroundColor: "rgba(167,139,250,0.14)",
    borderColor: "rgba(167,139,250,0.28)",
  },
  filterText: { color: COLORS.mutedForeground, fontSize: 8, fontWeight: "700" },
  filterTextSelected: { color: "#E8E0FF" },
  filterCount: {
    color: "#777985",
    fontSize: 7,
    fontWeight: "800",
    marginLeft: 6,
  },
  filterCountSelected: { color: COLORS.primary },
  collectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 13,
  },
  collectionTitle: {
    color: COLORS.foreground,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  collectionSubtitle: {
    color: COLORS.mutedForeground,
    fontSize: 8,
    marginTop: 4,
  },
  viewToggle: {
    flexDirection: "row",
    padding: 3,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  viewButton: {
    width: 31,
    height: 28,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  viewButtonSelected: { backgroundColor: "rgba(167,139,250,0.2)" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  gridCard: { marginBottom: 16 },
  gridCardLifted: { transform: [{ translateY: 0 }] },
  gridPosterWrap: {
    aspectRatio: 0.78,
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  poster: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  posterLarge: { ...StyleSheet.absoluteFill },
  posterCompact: { ...StyleSheet.absoluteFill },
  posterGlow: {
    position: "absolute",
    top: -70,
    right: -45,
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.8,
  },
  posterOrb: {
    position: "absolute",
    right: -25,
    bottom: -28,
    width: 115,
    height: 115,
    borderRadius: 60,
    backgroundColor: "rgba(8,8,12,0.38)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  posterSlash: {
    position: "absolute",
    right: 42,
    top: -24,
    width: 14,
    height: 240,
    backgroundColor: "rgba(255,255,255,0.05)",
    transform: [{ rotate: "27deg" }],
  },
  posterCopy: {
    position: "absolute",
    left: 11,
    right: 9,
    bottom: 12,
    zIndex: 1,
  },
  posterBrandTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 5,
    paddingVertical: 3,
    marginBottom: 6,
    borderRadius: 4,
    backgroundColor: "rgba(9,9,11,0.45)",
  },
  posterBrandTagText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 5,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  posterTitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 17,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  posterShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  posterTopRow: {
    position: "absolute",
    top: 9,
    left: 9,
    right: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: "rgba(9,9,11,0.7)",
  },
  ratingText: {
    color: COLORS.foreground,
    fontSize: 8,
    fontWeight: "800",
    marginLeft: 4,
  },
  removeButton: {
    width: 29,
    height: 29,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(9,9,11,0.68)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  gridStatusWrap: { position: "absolute", left: 8, bottom: 8 },
  statusPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: "rgba(9,9,11,0.78)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  statusWatching: { backgroundColor: "rgba(9,9,11,0.78)" },
  statusCompleted: { backgroundColor: "rgba(9,9,11,0.78)" },
  statusPlanned: { backgroundColor: "rgba(9,9,11,0.78)" },
  statusText: { fontSize: 6, fontWeight: "800", marginLeft: 4 },
  statusTextWatching: { color: COLORS.cyan },
  statusTextCompleted: { color: "#86EFAC" },
  statusTextPlanned: { color: "#FCD34D" },
  gridCardInfo: { paddingTop: 8, paddingHorizontal: 2 },
  animeTitle: { color: COLORS.foreground, fontSize: 10, fontWeight: "800" },
  animeSubtitle: { color: COLORS.mutedForeground, fontSize: 7, marginTop: 4 },
  progressMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 5,
  },
  progressCaption: { color: "#9A9BA7", fontSize: 7, fontWeight: "600" },
  progressPercent: { color: COLORS.primary, fontSize: 7, fontWeight: "800" },
  progressTrack: {
    height: 3,
    overflow: "hidden",
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  list: { paddingHorizontal: 20 },
  listCard: {
    minHeight: 98,
    flexDirection: "row",
    alignItems: "center",
    padding: 9,
    marginBottom: 9,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  listPosterWrap: {
    width: 61,
    height: 78,
    overflow: "hidden",
    borderRadius: 10,
    backgroundColor: COLORS.surfaceRaised,
  },
  listCardInfo: { flex: 1, marginLeft: 11, marginRight: 8 },
  listTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listAnimeTitle: {
    flex: 1,
    color: COLORS.foreground,
    fontSize: 10,
    fontWeight: "800",
    marginRight: 5,
  },
  listRating: { flexDirection: "row", alignItems: "center" },
  listStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 7,
  },
  listEpisodeCount: {
    color: COLORS.mutedForeground,
    fontSize: 7,
    marginLeft: 5,
  },
  listRemoveButton: {
    width: 31,
    height: 31,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(251,113,133,0.08)",
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 34,
    paddingBottom: 36,
    marginHorizontal: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.025)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  emptyIconOuter: {
    width: 76,
    height: 76,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(167,139,250,0.07)",
    transform: [{ rotate: "-7deg" }],
  },
  emptyIconInner: {
    width: 53,
    height: 53,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(167,139,250,0.14)",
    transform: [{ rotate: "7deg" }],
  },
  emptyTitle: {
    color: COLORS.foreground,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 17,
  },
  emptyCopy: {
    color: COLORS.mutedForeground,
    fontSize: 9,
    lineHeight: 15,
    textAlign: "center",
    marginTop: 7,
    maxWidth: 230,
  },
  emptyButton: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginTop: 15,
    borderRadius: 9,
    backgroundColor: "rgba(167,139,250,0.15)",
  },
  emptyButtonText: { color: "#E2D9FF", fontSize: 8, fontWeight: "800" },
  emptyHint: { flexDirection: "row", alignItems: "center", marginTop: 17 },
  emptyHintText: { color: "#BEB5D8", fontSize: 8, marginLeft: 6 },
  bottomNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 23,
  },
  bottomNoteText: { color: COLORS.mutedForeground, fontSize: 8, marginLeft: 6 },
});
