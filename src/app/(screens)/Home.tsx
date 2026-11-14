import { fetchHomeData } from "@/hooks/actions";
import {
  AnimeImageProps,
  FeaturedSlideProps,
  RecentAnime,
  TrendingAnime,
} from "@/hooks/types";
import { NavigationBar } from "expo-navigation-bar";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  LayoutChangeEvent,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
  ToastAndroid,
} from "react-native";

type TrendingCardProps = { item: TrendingAnime };
type RecentCardProps = { item: RecentAnime };
type SectionHeadingProps = { title: string; action?: string };

const COLORS = {
  background: "#090A12",
  white: "#F8F7FF",
  muted: "#9294A8",
  purple: "#A78BFA",
  violet: "#7C5CFC",
  cyan: "#83E7F4",
  line: "rgba(255,255,255,0.09)",
};

const initialSliderWidth = Dimensions.get("window").width - 36;

function AnimeImage({ source, style, label = "ADD IMAGE" }: AnimeImageProps) {
  return (
    <View style={[styles.imageFrame, style]}>
      {source ? (
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          fadeDuration={180}
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <View style={styles.placeholderIcon}>
            <Text style={styles.placeholderIconText}>＋</Text>
          </View>
          <Text style={styles.placeholderLabel}>{label}</Text>
        </View>
      )}
    </View>
  );
}

function FeaturedSlide({ item, width }: FeaturedSlideProps) {
  return (
    <View style={[styles.heroSlide, { width }]}>
      <AnimeImage
        source={item.image}
        label={item.imageLabel}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.heroScrim} />
      <View style={styles.heroTopRow}>
        <View style={styles.featuredPill}>
          <View style={styles.liveDot} />
          <Text style={styles.featuredText}>FEATURED ANIME</Text>
        </View>
        <Pressable
          style={styles.bookmarkButton}
          accessibilityRole="button"
          accessibilityLabel={`Add ${item.title} to watchlist`}
        >
          <Text style={styles.bookmarkGlyph}>＋</Text>
        </Pressable>
      </View>
      <View style={styles.heroCopy}>
        <Text style={styles.heroKicker}>{item.kicker}</Text>
        <Text style={styles.heroTitle} numberOfLines={2}>
          {item.title.toUpperCase()}
        </Text>
        <View style={styles.heroMetaRow}>
          <Text style={styles.heroMeta}>{item.year}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.heroMeta}>{item.genre}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.heroMeta}>⭐ {item.rating}</Text>
        </View>
        <View style={styles.heroButtonRow}>
          <Pressable
            onPress={() =>
              router.push({
                pathname: `/watch/${item.id}` as any,
              })
            }
            style={styles.watchButton}
            accessibilityRole="button"
          >
            <Text style={styles.watchPlay}>▶</Text>
            <Text style={styles.watchButtonText}>Watch now</Text>
          </Pressable>
          <Text style={styles.heroEpisodes}>{item.episodes}</Text>
        </View>
      </View>
    </View>
  );
}

function SectionHeading({ title, action = "See all" }: SectionHeadingProps) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable accessibilityRole="button" hitSlop={8}>
        {action !== "na" && <Text style={styles.sectionAction}>{action} ›</Text>}
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
      onPress={() => {
        router.push({
          pathname: `/watch/${item.id}` as any
        })
      }}
    >
      <View style={styles.trendPoster}>
        <AnimeImage source={item.image} />
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

function RecentCard({ item }: RecentCardProps) {
  return (
    <Pressable
      style={styles.recentCard}
      accessibilityRole="button"
      onPress={() => {
        router.push({
          pathname: `/watch/${item.id}` as any,
          params: {
            ep: item.episode.replace("Episode", "")
          }
        })
      }}
      accessibilityLabel={`${item.title}, ${item.episode}`}
    >
      <AnimeImage source={item.image} style={styles.recentImage} />
      <View style={styles.recentInfo}>
        <Text style={styles.recentRelease}>{item.release}</Text>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.cardSubtitle} numberOfLines={1}>
          {item.episode}
        </Text>
        <View style={styles.recentProgressTrack}>
          <View style={styles.recentProgressFill} />
        </View>
      </View>
      <Text style={styles.recentArrow}>›</Text>
    </Pressable>
  );
}

type SkeletonBlockProps = {
  style?: import("react-native").StyleProp<import("react-native").ViewStyle>;
};

function SkeletonBlock({ style }: SkeletonBlockProps) {
  return <View style={[styles.skeletonBlock, style]} />;
}

function FeaturedSkeleton({ width }: { width: number }) {
  return (
    <View
      style={[styles.heroSlide, styles.featuredSkeleton, { width }]}
      accessibilityLabel="Loading featured anime"
    >
      <View style={styles.skeletonHeroTop}>
        <SkeletonBlock style={styles.skeletonFeaturedPill} />
        <SkeletonBlock style={styles.skeletonBookmark} />
      </View>
      <View style={styles.skeletonHeroCopy}>
        <SkeletonBlock style={styles.skeletonKicker} />
        <SkeletonBlock style={styles.skeletonHeroTitle} />
        <View style={styles.skeletonMetaRow}>
          <SkeletonBlock style={styles.skeletonMeta} />
          <SkeletonBlock style={styles.skeletonMeta} />
          <SkeletonBlock style={styles.skeletonMetaShort} />
        </View>
        <SkeletonBlock style={styles.skeletonWatchButton} />
      </View>
      <View style={styles.skeletonHeroDots}>
        <SkeletonBlock style={styles.skeletonActiveDot} />
        <SkeletonBlock style={styles.skeletonDot} />
        <SkeletonBlock style={styles.skeletonDot} />
      </View>
    </View>
  );
}

function TrendingSkeletonCard() {
  return (
    <View style={styles.trendCard} accessibilityLabel="Loading trending anime">
      <SkeletonBlock style={styles.skeletonTrendPoster} />
      <SkeletonBlock style={styles.skeletonTrendingTitle} />
      <SkeletonBlock style={styles.skeletonTrendingSubtitle} />
    </View>
  );
}

function RecentSkeletonCard() {
  return (
    <View style={styles.recentCard} accessibilityLabel="Loading recent episode">
      <SkeletonBlock style={styles.skeletonRecentImage} />
      <View style={styles.skeletonRecentInfo}>
        <SkeletonBlock style={styles.skeletonRecentRelease} />
        <SkeletonBlock style={styles.skeletonRecentTitle} />
        <SkeletonBlock style={styles.skeletonRecentSubtitle} />
        <SkeletonBlock style={styles.skeletonRecentProgress} />
      </View>
      <SkeletonBlock style={styles.skeletonRecentArrow} />
    </View>
  );
}

export default function Index() {
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [sliderWidth, setSliderWidth] = useState<number>(initialSliderWidth);
  const [data, setData] = useState<Awaited<
    ReturnType<typeof fetchHomeData>
  > | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const searchSuggestions = ["Solo Leveling", "One Piece", "Demon Slayer", "Frieren"];

  useEffect(() => {
    const getData = async () => {
      const data = await fetchHomeData();
      if (data) {
        setData(data);
      } else {
        ToastAndroid.showWithGravity(
          "Something went wrong",
          ToastAndroid.SHORT,
          ToastAndroid.TOP,
        );
      }
    };
    getData();
  }, []);

  const handleHeroLayout = (event: LayoutChangeEvent): void => {
    const width = event.nativeEvent.layout.width;
    if (width > 0 && width !== sliderWidth) {
      setSliderWidth(width);
    }
  };

  const handleHeroScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ): void => {
    if (sliderWidth <= 0) return;
    const nextSlide = Math.round(
      event.nativeEvent.contentOffset.x / sliderWidth,
    );
    if (nextSlide !== activeSlide) {
      setActiveSlide(nextSlide);
    }
  };

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
                onPress={() => {
                  setSearchQuery("");
                  setIsSearchOpen(true);
                }}
                style={styles.iconButton}
                accessibilityRole="button"
                accessibilityLabel="Open search"
              >
                <Text style={styles.searchGlyph}>⌕</Text>
              </Pressable>
              <Pressable
                style={styles.avatar}
                accessibilityRole="button"
                accessibilityLabel="Profile"
              >
                <Text style={styles.avatarText}>K</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.welcomeRow}>
            <View>
              <Text style={styles.eyebrow}>YOUR ANIME, ALL IN ONE PLACE</Text>
              <Text style={styles.welcomeTitle}>Welcome back.</Text>
            </View>
            <View style={styles.streakPill}>
              <Text style={styles.streakIcon}>✦</Text>
              <Text style={styles.streakText}>7 day streak</Text>
            </View>
          </View>

          <View style={styles.heroCard}>
            {data ? (
              <>
                <ScrollView
                  horizontal
                  pagingEnabled
                  bounces={false}
                  showsHorizontalScrollIndicator={false}
                  onLayout={handleHeroLayout}
                  onMomentumScrollEnd={handleHeroScroll}
                  accessibilityLabel="Featured anime slider. Swipe to view more anime."
                >
                  {data.featured.map((item) => (
                    <FeaturedSlide
                      key={item.title}
                      item={item}
                      width={sliderWidth}
                    />
                  ))}
                </ScrollView>
                <View
                  style={styles.heroPagination}
                  accessibilityLabel={`Featured anime ${activeSlide + 1} of ${data.featured.length}`}
                >
                  {data.featured.map((item, index) => (
                    <View key={item.title} style={styles.paginationTapTarget}>
                      <View
                        style={[
                          styles.pageDot,
                          activeSlide === index && styles.pageDotActive,
                        ]}
                      />
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <FeaturedSkeleton width={sliderWidth} />
            )}
          </View>

          <View style={styles.sectionBlock}>
            <SectionHeading title="Trending this week" action="na" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {data
                ? data.trending.map((item) => (
                    <TrendingCard key={item.title} item={item} />
                  ))
                : Array.from({ length: 4 }, (_, index) => (
                    <TrendingSkeletonCard key={`trending-skeleton-${index}`} />
                  ))}
            </ScrollView>
          </View>

          <View style={styles.sectionBlock}>
            <SectionHeading title="Recent episodes" action="na" />
            <View style={styles.recentList}>
              {data
                ? data.recent.map((item) => (
                    <RecentCard key={item.title} item={item} />
                  ))
                : Array.from({ length: 3 }, (_, index) => (
                    <RecentSkeletonCard key={`recent-skeleton-${index}`} />
                  ))}
            </View>
          </View>
        </ScrollView>
        <Modal
          visible={isSearchOpen}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setIsSearchOpen(false)}
        >
          <SafeAreaView style={styles.searchScreen}>
            <View style={styles.searchHeader}>
              <Pressable
                onPress={() => setIsSearchOpen(false)}
                style={styles.searchBackButton}
                accessibilityRole="button"
                accessibilityLabel="Close search"
              >
                <Text style={styles.searchBackGlyph}>‹</Text>
              </Pressable>
              <Text style={styles.searchScreenTitle}>Search anime</Text>
              <View style={styles.searchHeaderSpacer} />
            </View>

            <View style={styles.searchInputShell}>
              <Text style={styles.searchInputGlyph}>⌕</Text>
              <TextInput
                autoFocus
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search Animes..."
                placeholderTextColor="#77798C"
                style={styles.searchScreenInput}
                onSubmitEditing={() => {
                  router.push({
                    pathname: "/Discover",
                    params: { searchQuery }
                  })
                }}
                returnKeyType="search"
                accessibilityLabel="Search anime titles"
              />
              {searchQuery.length > 0 && (
                <Pressable
                  onPress={() => setSearchQuery("")}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search text"
                >
                  <Text style={styles.searchClearGlyph}>×</Text>
                </Pressable>
              )}
            </View>

            <ScrollView
              style={styles.searchResultsScroll}
              contentContainerStyle={styles.searchResultsContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.searchSectionHeading}>
                <View>
                  <Text style={styles.searchEyebrow}>
                    {searchQuery.trim() ? "YOUR SEARCH" : "QUICK DISCOVERY"}
                  </Text>
                  <Text style={styles.searchSectionTitle}>
                    {searchQuery.trim() ? "Ready to search" : "Popular searches"}
                  </Text>
                </View>
                <View style={styles.searchSparkleBadge}>
                  <Text style={styles.searchSparkle}>✦</Text>
                </View>
              </View>

              {searchQuery.trim() ? (
                <View style={styles.searchQueryPreview}>
                  <View style={styles.searchQueryIcon}>
                    <Text style={styles.searchInputGlyph}>⌕</Text>
                  </View>
                  <View style={styles.searchQueryCopy}>
                    <Text style={styles.searchQueryLabel}>Search for</Text>
                    <Text style={styles.searchQueryValue} numberOfLines={1}>
                      “{searchQuery.trim()}”
                    </Text>
                  </View>
                  <Text style={styles.searchQueryArrow}>›</Text>
                </View>
              ) : (
                <View style={styles.searchSuggestionWrap}>
                  {searchSuggestions.map((suggestion, index) => (
                    <Pressable
                      key={suggestion}
                      onPress={() => setSearchQuery(suggestion)}
                      style={styles.searchSuggestionChip}
                      accessibilityRole="button"
                      accessibilityLabel={`Search ${suggestion}`}
                    >
                      <Text style={styles.searchSuggestionNumber}>
                        {String(index + 1).padStart(2, "0")}
                      </Text>
                      <Text style={styles.searchSuggestionText}>{suggestion}</Text>
                      <Text style={styles.searchSuggestionArrow}>↗</Text>
                    </Pressable>
                  ))}
                </View>
              )}

              <View style={styles.searchBrowseCard}>
                <View style={styles.searchBrowseGlow} />
                <View style={styles.searchBrowseIcon}>
                  <Text style={styles.searchBrowseIconText}>✧</Text>
                </View>
                <View style={styles.searchBrowseCopy}>
                  <Text style={styles.searchBrowseTitle}>Not sure what to watch?</Text>
                  <Text style={styles.searchBrowseCaption}>
                    Explore anime by mood, genre, or world.
                  </Text>
                </View>
                <Text style={styles.searchBrowseArrow}>›</Text>
              </View>

              <View style={styles.searchTipRow}>
                <View style={styles.searchTipLine} />
                <Text style={styles.searchTipText}>YOUR NEXT STORY IS OUT THERE</Text>
                <View style={styles.searchTipLine} />
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  screen: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 28 },
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
    fontSize: 27,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  streakPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: COLORS.line,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 1,
  },
  streakIcon: { color: "#FFD18A", fontSize: 12, marginRight: 5 },
  streakText: { color: "#D9D8E3", fontSize: 10, fontWeight: "600" },
  heroCard: {
    height: 350,
    marginHorizontal: 18,
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "#17182A",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  heroSlide: { height: "100%", overflow: "hidden", backgroundColor: "#17182A" },
  imageFrame: { flex: 1, overflow: "hidden", backgroundColor: "#191B2B" },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#191B2B",
  },
  placeholderIcon: {
    width: 36,
    height: 36,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },
  placeholderIconText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 22,
    fontWeight: "300",
    lineHeight: 25,
  },
  placeholderLabel: {
    color: "rgba(255,255,255,0.52)",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.3,
  },
  heroScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(8,8,16,0.38)",
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
    backgroundColor: "rgba(9,10,18,0.62)",
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
  heroCopy: { position: "absolute", left: 19, bottom: 38, right: 12 },
  heroKicker: {
    color: "#D5CBF7",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 31,
    fontWeight: "900",
    letterSpacing: -0.9,
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowRadius: 8,
  },
  heroMetaRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  heroMeta: { color: "#D0CDDC", fontSize: 10, fontWeight: "600" },
  metaDot: { color: "#AAA6BB", fontSize: 12, marginHorizontal: 7 },
  heroButtonRow: { flexDirection: "row", alignItems: "center", marginTop: 13 },
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
    color: "rgba(255,255,255,0.78)",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    marginLeft: 11,
  },
  heroPagination: {
    position: "absolute",
    bottom: 11,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: "rgba(8,8,16,0.25)",
  },
  paginationTapTarget: {
    minWidth: 20,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  pageDot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  pageDotActive: { width: 18, backgroundColor: "#D4C7FF" },
  sectionBlock: { marginTop: 26 },
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
    backgroundColor: "rgba(10,10,18,0.68)",
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
    backgroundColor: "rgba(9,10,18,0.76)",
  },
  ratingStar: { color: "#FFD27B", fontSize: 9, marginRight: 4 },
  ratingText: { color: "#FFFFFF", fontSize: 9, fontWeight: "800" },
  cardTitle: { color: COLORS.white, fontSize: 12, fontWeight: "700" },
  cardSubtitle: { color: COLORS.muted, fontSize: 9, marginTop: 4 },
  recentList: { paddingHorizontal: 19 },
  recentCard: {
    height: 91,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginBottom: 9,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  recentImage: { width: 70, height: 73, borderRadius: 11, flex: 0 },
  recentInfo: { flex: 1, marginLeft: 12 },
  recentRelease: {
    color: COLORS.cyan,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 5,
  },
  recentProgressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginTop: 8,
    overflow: "hidden",
  },
  recentProgressFill: {
    width: "35%",
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.purple,
  },
  recentArrow: {
    color: COLORS.muted,
    fontSize: 23,
    fontWeight: "300",
    marginHorizontal: 5,
  },

  // Loading placeholders match the existing cards and dark glass palette.
  skeletonBlock: {
    backgroundColor: "#252738",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.035)",
  },
  featuredSkeleton: {
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 13,
    backgroundColor: "#17182A",
  },
  skeletonHeroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skeletonFeaturedPill: { width: 122, height: 28, borderRadius: 18 },
  skeletonBookmark: { width: 31, height: 31, borderRadius: 12 },
  skeletonHeroCopy: { position: "absolute", left: 19, right: 24, bottom: 40 },
  skeletonKicker: {
    width: "66%",
    height: 9,
    borderRadius: 5,
    marginBottom: 10,
  },
  skeletonHeroTitle: {
    width: "83%",
    height: 31,
    borderRadius: 8,
    marginBottom: 10,
  },
  skeletonMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  skeletonMeta: { width: 42, height: 8, borderRadius: 4, marginRight: 10 },
  skeletonMetaShort: { width: 32, height: 8, borderRadius: 4 },
  skeletonWatchButton: { width: 116, height: 39, borderRadius: 13 },
  skeletonHeroDots: {
    position: "absolute",
    bottom: 14,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
  },
  skeletonActiveDot: {
    width: 18,
    height: 4,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  skeletonDot: { width: 5, height: 4, borderRadius: 3, marginHorizontal: 3 },
  skeletonTrendPoster: { height: 155, borderRadius: 16, marginBottom: 9 },
  skeletonTrendingTitle: {
    width: "78%",
    height: 10,
    borderRadius: 5,
    marginBottom: 6,
  },
  skeletonTrendingSubtitle: { width: "92%", height: 8, borderRadius: 4 },
  skeletonRecentImage: { width: 70, height: 73, borderRadius: 11, flex: 0 },
  skeletonRecentInfo: { flex: 1, marginLeft: 12 },
  skeletonRecentRelease: {
    width: 78,
    height: 7,
    borderRadius: 4,
    marginBottom: 7,
  },
  skeletonRecentTitle: {
    width: "72%",
    height: 10,
    borderRadius: 5,
    marginBottom: 6,
  },
  skeletonRecentSubtitle: { width: "88%", height: 8, borderRadius: 4 },
  skeletonRecentProgress: {
    width: "95%",
    height: 3,
    borderRadius: 2,
    marginTop: 9,
  },
  skeletonRecentArrow: {
    width: 10,
    height: 20,
    borderRadius: 5,
    marginHorizontal: 5,
  },

  searchScreen: { flex: 1, backgroundColor: COLORS.background },
  searchHeader: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  searchBackButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  searchBackGlyph: { color: COLORS.white, fontSize: 30, lineHeight: 33, fontWeight: "300", marginTop: -3 },
  searchScreenTitle: { color: COLORS.white, fontSize: 14, fontWeight: "800", letterSpacing: -0.2 },
  searchHeaderSpacer: { width: 36, height: 36 },
  searchInputShell: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#151622",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.42)",
    shadowColor: COLORS.violet,
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 3,
  },
  searchInputGlyph: { color: COLORS.purple, fontSize: 27, lineHeight: 30, transform: [{ rotate: "-20deg" }] },
  searchScreenInput: { flex: 1, color: COLORS.white, fontSize: 12, paddingVertical: 12, marginLeft: 10 },
  searchClearGlyph: { color: COLORS.muted, fontSize: 24, lineHeight: 27, paddingLeft: 8 },
  searchResultsScroll: { flex: 1, marginTop: 28 },
  searchResultsContent: { paddingHorizontal: 20, paddingBottom: 30 },
  searchSectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 15 },
  searchEyebrow: { color: COLORS.purple, fontSize: 8, fontWeight: "900", letterSpacing: 1.5, marginBottom: 5 },
  searchSectionTitle: { color: COLORS.white, fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
  searchSparkleBadge: { width: 37, height: 37, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(167,139,250,0.1)", borderWidth: 1, borderColor: "rgba(167,139,250,0.17)" },
  searchSparkle: { color: "#D8CEFF", fontSize: 18 },
  searchSuggestionWrap: { flexDirection: "row", flexWrap: "wrap", marginRight: -7 },
  searchSuggestionChip: {
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    marginRight: 7,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  searchSuggestionNumber: { color: "#74768A", fontSize: 7, fontWeight: "900", marginRight: 7 },
  searchSuggestionText: { color: "#E5E3EF", fontSize: 9, fontWeight: "700" },
  searchSuggestionArrow: { color: COLORS.purple, fontSize: 11, marginLeft: 8 },
  searchQueryPreview: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: "rgba(167,139,250,0.075)",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.19)",
  },
  searchQueryIcon: { width: 37, height: 37, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(167,139,250,0.12)" },
  searchQueryCopy: { flex: 1, marginLeft: 11 },
  searchQueryLabel: { color: COLORS.muted, fontSize: 8, fontWeight: "600" },
  searchQueryValue: { color: COLORS.white, fontSize: 12, fontWeight: "800", marginTop: 3 },
  searchQueryArrow: { color: "#D8CEFF", fontSize: 24, fontWeight: "300", marginLeft: 6 },
  searchBrowseCard: {
    minHeight: 90,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    paddingHorizontal: 13,
    marginTop: 26,
    borderRadius: 17,
    backgroundColor: "#151522",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.075)",
  },
  searchBrowseGlow: { position: "absolute", right: -28, top: -41, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(124,92,252,0.13)" },
  searchBrowseIcon: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(167,139,250,0.14)" },
  searchBrowseIconText: { color: "#D7CCFF", fontSize: 23 },
  searchBrowseCopy: { flex: 1, marginLeft: 11 },
  searchBrowseTitle: { color: COLORS.white, fontSize: 10, fontWeight: "800" },
  searchBrowseCaption: { color: COLORS.muted, fontSize: 8, marginTop: 5 },
  searchBrowseArrow: { color: COLORS.purple, fontSize: 22, marginLeft: 6 },
  searchTipRow: { flexDirection: "row", alignItems: "center", marginTop: 31 },
  searchTipLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: "rgba(255,255,255,0.1)" },
  searchTipText: { color: "#656779", fontSize: 6, fontWeight: "800", letterSpacing: 1.1, marginHorizontal: 10 },
});
