import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
  ViewStyle,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AnimeFrame from "../components/AnimeFrame";
import { Episode, EpisodeRange } from "@/hooks/types";
import { AnimeDetails, fetchAnimeDetails } from "@/hooks/actions";

type EpisodeViewMode = "list" | "grid";
type AudioMode = "sub" | "dub";

type PlayerServer = {
  id: string;
  label: string;
  detail: string;
};

const PLAYER_SERVERS: PlayerServer[] = [
  { id: "s1", label: "Server 1", detail: "Fast · HD" },
  { id: "s2", label: "Server 2", detail: "Backup · HD" },
  { id: "s3", label: "Server 3", detail: "Alternate source" },
];

const COLORS = {
  background: "#090A12",
  surface: "#121421",
  surfaceRaised: "#191B2B",
  white: "#F8F7FF",
  muted: "#9294A8",
  purple: "#A78BFA",
  violet: "#7C5CFC",
  cyan: "#83E7F4",
  border: "rgba(255,255,255,0.09)",
};

const RANGE_SIZE = 10;

function createUnloadedEpisode(number: number): Episode {
  return {
    id: `unloaded-episode-${number}`,
    number,
    title: `Episode ${number}`,
    description:
      "Episode details have not been loaded from the data source yet.",
    duration: "--:--",
  };
}

function rangeLabel(start: number, end: number): string {
  return `${start}–${end}`;
}

function PosterPlaceholder({
  label,
  source,
  style,
}: {
  label: string;
  source?: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.posterPlaceholder, style]}>
      {source ? (
        <Image
          source={source}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : (
        <>
          <View style={styles.posterPlaceholderGlow} />
          <Text style={styles.posterPlaceholderMark}>✦</Text>
          <Text style={styles.posterPlaceholderLabel}>{label}</Text>
        </>
      )}
    </View>
  );
}

function EpisodeCard({
  episode,
  selected,
  onPress,
  viewMode,
}: {
  episode: Episode;
  selected: boolean;
  onPress: () => void;
  viewMode: EpisodeViewMode;
}) {
  const isGrid = viewMode === "grid";
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.episodeCard,
        isGrid && styles.episodeCardGrid,
        selected && styles.episodeCardSelected,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Play episode ${episode.number}: ${episode.title}`}
    >
      <View
        style={[styles.episodeImageWrap, isGrid && styles.episodeImageWrapGrid]}
      >
        <PosterPlaceholder
          label={`EP ${String(episode.number).padStart(2, "0")}`}
          source={episode.image}
        />
        <View style={styles.episodeImagePlay}>
          <Text style={styles.episodeImagePlayIcon}>▶</Text>
        </View>
        <Text style={styles.episodeDuration}>{episode.duration}</Text>
      </View>
      <View style={[styles.episodeInfo, isGrid && styles.episodeInfoGrid]}>
        <View style={styles.episodeTitleRow}>
          <View
            style={[
              styles.episodeNumberBadge,
              selected && styles.episodeNumberBadgeSelected,
            ]}
          >
            <Text
              style={[
                styles.episodeNumberText,
                selected && styles.episodeNumberTextSelected,
              ]}
            >
              {String(episode.number).padStart(2, "0")}
            </Text>
          </View>
          <Text style={styles.episodeTitle} numberOfLines={isGrid ? 2 : 1}>
            {episode.title}
          </Text>
        </View>
        <Text
          style={[
            styles.episodeDescription,
            episode.id.startsWith("unloaded-episode-") &&
              styles.unloadedEpisodeDescription,
          ]}
          numberOfLines={isGrid ? 3 : 2}
        >
          {episode.description}
        </Text>
      </View>
      {!isGrid && <Text style={styles.episodeMore}>•••</Text>}
    </Pressable>
  );
}

function SkeletonBlock({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.skeletonBlock, style]} />;
}

function EpisodeSkeletonCard({ viewMode }: { viewMode: EpisodeViewMode }) {
  const isGrid = viewMode === "grid";
  return (
    <View
      style={[
        styles.episodeCard,
        styles.skeletonEpisodeCard,
        isGrid && styles.episodeCardGrid,
      ]}
      accessibilityLabel="Loading episode"
    >
      <SkeletonBlock
        style={[
          styles.episodeImageWrap,
          styles.skeletonEpisodeImage,
          isGrid && styles.episodeImageWrapGrid,
        ]}
      />
      <View style={[styles.episodeInfo, isGrid && styles.episodeInfoGrid]}>
        <SkeletonBlock style={styles.skeletonEpisodeTitle} />
        <SkeletonBlock style={styles.skeletonEpisodeDescription} />
      </View>
    </View>
  );
}

type Season = AnimeDetails["seasons"][number];

export default function Watch() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("season-1");
  const [selectedEpisodeId, setSelectedEpisodeId] =
    useState<string>("unloaded-episode-1");
  const [selectedEpisodeNumber, setSelectedEpisodeNumber] = useState<number>(1);
  const [selectedRangeIndex, setSelectedRangeIndex] = useState<number>(0);
  const [audioMode, setAudioMode] = useState<AudioMode>("sub");
  const [selectedServerId, setSelectedServerId] = useState<string>("s1");
  const [isServerPickerVisible, setIsServerPickerVisible] =
    useState<boolean>(false);
  const [episodeView, setEpisodeView] = useState<EpisodeViewMode>("list");
  const [data, setData] = useState<AnimeDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState<boolean>(false);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setData(null);
    setIsSynopsisExpanded(false);
    setSelectedRangeIndex(0);
    setSelectedEpisodeNumber(1);
    setSelectedEpisodeId("unloaded-episode-1");
    const getData = async () => {
      try {
        const result = await fetchAnimeDetails(Number(id));
        if (!isActive) return;
        if (result) {
          setData(result);
          const firstEpisode = result.episodes.find(
            (episode) => Number(episode.number) === 1,
          );
          const initialEpisode = firstEpisode ?? createUnloadedEpisode(1);
          setSelectedEpisodeId(initialEpisode.id);
          setSelectedEpisodeNumber(1);
          setSelectedRangeIndex(0);
        } else {
          ToastAndroid.showWithGravity(
            "Something went wrong",
            ToastAndroid.TOP,
            ToastAndroid.SHORT,
          );
        }
      } catch (error) {
        console.log(error);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };
    getData();

    return () => {
      isActive = false;
    };
  }, [id]);

  const episodes = data?.episodes ?? [];
  const seasons = data?.seasons ?? [];
  const currentSeason = seasons.find((s) => s.current);
  const seasonLabel = currentSeason?.label ?? "Season 1";
  const highestLoadedEpisodeNumber = episodes.reduce(
    (highest, episode) => Math.max(highest, Number(episode.number) || 0),
    0,
  );
  const totalEpisodeCount = Math.max(
    Number(data?.episodeCount) || 0,
    highestLoadedEpisodeNumber,
    episodes.length,
  );

  const episodeRanges = useMemo<EpisodeRange[]>(() => {
    const ranges: EpisodeRange[] = [];
    for (let start = 1; start <= totalEpisodeCount; start += RANGE_SIZE) {
      const end = Math.min(start + RANGE_SIZE - 1, totalEpisodeCount);
      ranges.push({ start, end, label: rangeLabel(start, end) });
    }
    return ranges;
  }, [totalEpisodeCount]);

  const safeRangeIndex = Math.min(
    selectedRangeIndex,
    Math.max(episodeRanges.length - 1, 0),
  );
  const activeRange = episodeRanges[safeRangeIndex];
  const visibleEpisodes = activeRange
    ? Array.from(
        { length: activeRange.end - activeRange.start + 1 },
        (_, index) => {
          const episodeNumber = activeRange.start + index;
          return (
            episodes.find(
              (episode) => Number(episode.number) === episodeNumber,
            ) ?? createUnloadedEpisode(episodeNumber)
          );
        },
      )
    : [];
  const selectedEpisode: Episode =
    episodes.find((episode) => episode.id === selectedEpisodeId) ??
    episodes.find(
      (episode) => Number(episode.number) === selectedEpisodeNumber,
    ) ??
    createUnloadedEpisode(selectedEpisodeNumber);

  const selectedServer = PLAYER_SERVERS.find(
    (server) => server.id === selectedServerId,
  ) ?? { id: "s1", label: "Server 1", detail: "Recommended" };

  const synopsis = data?.synopsis ?? "";
  const synopsisNeedsToggle = synopsis.length > 170;
  const visibleSynopsis =
    synopsisNeedsToggle && !isSynopsisExpanded
      ? `${synopsis.slice(0, 170).trimEnd()}…`
      : synopsis;

  const selectSeason = (season: Season) => {
    if (season.current) return;
    router.setParams({ id: String(season.id) });
  };

  const openAnime = (animeId: string) => {
    router.setParams({ id: animeId });
  };

  const selectEpisode = (episode: Episode) => {
    setSelectedEpisodeId(episode.id);
    setSelectedEpisodeNumber(episode.number);
    const rangeIndex = episodeRanges.findIndex(
      (r) => episode.number >= r.start && episode.number <= r.end,
    );
    if (rangeIndex >= 0) setSelectedRangeIndex(rangeIndex);
  };

  const selectEpisodeRange = (range: EpisodeRange, index: number) => {
    setSelectedRangeIndex(index);
    const firstEpisode =
      episodes.find((episode) => Number(episode.number) === range.start) ??
      createUnloadedEpisode(range.start);
    setSelectedEpisodeId(firstEpisode.id);
    setSelectedEpisodeNumber(firstEpisode.number);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.stickyHeader}>
          <View style={styles.topBar}>
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text style={styles.backGlyph}>‹</Text>
            </Pressable>
            <View style={styles.topTitleWrap}>
              <Text style={styles.topEyebrow}>NOW WATCHING</Text>
              <Text style={styles.topTitle} numberOfLines={1}>
                {data?.title}
              </Text>
            </View>
          </View>

          <View style={styles.animeFrameContainer}>
            <AnimeFrame id={String(id)} audio={audioMode} episode={selectedEpisodeNumber} server={selectedServerId} />
          </View>

          <View style={styles.pinnedDetails}>
            <View style={styles.currentEpisodeRow}>
              <View style={styles.nowPlayingPill}>
                <View style={styles.nowPlayingDot} />
                <Text style={styles.nowPlayingText}>NOW PLAYING</Text>
              </View>
              {isLoading ? (
                <SkeletonBlock style={styles.skeletonCurrentEpisode} />
              ) : (
                <Text style={styles.currentEpisodeLabel}>
                  {seasonLabel} · Episode {selectedEpisode.number}
                </Text>
              )}
            </View>
            <View style={styles.titleBlock}>
              <View style={styles.titleAndRating}>
                {isLoading ? (
                  <SkeletonBlock style={styles.skeletonTitle} />
                ) : (
                  <Text style={styles.animeTitle} numberOfLines={1}>
                    {data?.title ?? "Anime"}
                  </Text>
                )}
                <View style={styles.ratingPill}>
                  <Text style={styles.ratingStar}>★</Text>
                  <Text style={styles.ratingText}>{data?.rating}</Text>
                </View>
              </View>
              {isLoading ? (
                <SkeletonBlock style={styles.skeletonEpisodeSubtitle} />
              ) : (
                <Text style={styles.episodeSubtitle} numberOfLines={1}>
                  {seasonLabel} · Episode{" "}
                  {String(selectedEpisode.number).padStart(2, "0")}:{" "}
                  {selectedEpisode.title}
                </Text>
              )}
              <View style={styles.metadataRow}>
                {isLoading ? (
                  <>
                    <SkeletonBlock style={styles.skeletonMetaTag} />
                    <SkeletonBlock style={styles.skeletonMetaTagWide} />
                    <SkeletonBlock style={styles.skeletonMetaTag} />
                  </>
                ) : (
                  <>
                    {data?.year != null && (
                      <View style={styles.metadataTag}>
                        <Text style={styles.metadataTagText}>{data.year}</Text>
                      </View>
                    )}
                    {(data?.genres ?? []).map((genre, index) => (
                      <View key={`${genre}-${index}`} style={styles.genreChip}>
                        <Text style={styles.genreChipText}>{genre}</Text>
                      </View>
                    ))}
                    <View style={styles.metadataQualityChip}>
                      <Text style={styles.metadataQualityText}>HD</Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentPadding}>
            <View style={styles.actionRow}>
              <Pressable
                style={styles.actionButton}
                accessibilityRole="button"
                accessibilityLabel="Add to watchlist"
              >
                <Text style={styles.actionIcon}>＋</Text>
                <Text style={styles.actionLabel}>My List</Text>
              </Pressable>
              <Pressable
                style={styles.actionButton}
                accessibilityRole="button"
                accessibilityLabel="Share anime"
              >
                <Text style={styles.actionIcon}>↗</Text>
                <Text style={styles.actionLabel}>Share</Text>
              </Pressable>
            </View>

            <View style={styles.playbackOptionsRow}>
              <View style={styles.audioControlGroup}>
                <Text style={styles.playbackOptionLabel}>AUDIO</Text>
                <View style={styles.audioToggle}>
                  {(["sub", "dub"] as const).map((mode) => (
                    <Pressable
                      key={mode}
                      onPress={() => setAudioMode(mode)}
                      style={[
                        styles.audioToggleButton,
                        audioMode === mode && styles.audioToggleButtonSelected,
                      ]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: audioMode === mode }}
                      accessibilityLabel={`${mode === "sub" ? "Subtitled" : "Dubbed"} audio`}
                    >
                      <Text
                        style={[
                          styles.audioToggleText,
                          audioMode === mode && styles.audioToggleTextSelected,
                        ]}
                      >
                        {mode}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <Pressable
                onPress={() => setIsServerPickerVisible(true)}
                style={styles.serverSelector}
                accessibilityRole="button"
                accessibilityLabel={`Choose video server. Current: ${selectedServer.label}`}
              >
                <View>
                  <Text style={styles.playbackOptionLabel}>SERVER</Text>
                  <Text style={styles.serverSelectedName}>
                    {selectedServer.label}
                  </Text>
                </View>
                <Text style={styles.serverChevron}>⌄</Text>
              </Pressable>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeading}>
                <Text style={styles.sectionTitle}>Synopsis</Text>
                <View style={styles.synopsisTag}>
                  <Text style={styles.synopsisTagText}>ANIME</Text>
                </View>
              </View>
              {isLoading ? (
                <View style={styles.synopsisSkeleton}>
                  <SkeletonBlock style={styles.skeletonSynopsisLine} />
                  <SkeletonBlock style={styles.skeletonSynopsisLine} />
                  <SkeletonBlock style={styles.skeletonSynopsisLineShort} />
                </View>
              ) : (
                <Text style={styles.synopsisText}>{visibleSynopsis}</Text>
              )}
              {!isLoading && synopsisNeedsToggle && (
                <Pressable
                  onPress={() => setIsSynopsisExpanded((expanded) => !expanded)}
                  style={styles.readMoreButton}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isSynopsisExpanded
                      ? "Show less synopsis"
                      : "Read full synopsis"
                  }
                  accessibilityState={{ expanded: isSynopsisExpanded }}
                >
                  <Text style={styles.readMoreText}>
                    {isSynopsisExpanded
                      ? "Show less  ˄"
                      : "Read full synopsis  ˅"}
                  </Text>
                </Pressable>
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeading}>
                <View>
                  <Text style={styles.sectionTitle}>
                    {isLoading
                      ? "Anime recommendations"
                      : `Because you watched ${data?.title ?? "this anime"}`}
                  </Text>
                  <Text style={styles.sectionCaption}>
                    Similar worlds, action and adventure
                  </Text>
                </View>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedList}
              >
                {isLoading
                  ? Array.from({ length: 4 }, (_, index) => (
                      <View
                        key={`related-skeleton-${index}`}
                        style={styles.relatedCard}
                      >
                        <SkeletonBlock
                          style={[
                            styles.relatedPoster,
                            styles.skeletonRelatedPoster,
                          ]}
                        />
                        <SkeletonBlock style={styles.skeletonRelatedTitle} />
                        <SkeletonBlock style={styles.skeletonRelatedDetail} />
                      </View>
                    ))
                  : (data?.related ?? []).map((anime) => (
                      <Pressable
                        key={anime.id}
                        onPress={() => openAnime(String(anime.id))}
                        style={styles.relatedCard}
                        accessibilityRole="button"
                        accessibilityLabel={anime.title}
                      >
                        <PosterPlaceholder
                          label={anime.title.slice(0, 2).toUpperCase()}
                          source={anime.image}
                          style={styles.relatedPoster}
                        />
                        <Text style={styles.relatedTitle} numberOfLines={1}>
                          {anime.title}
                        </Text>
                        <Text style={styles.relatedDetail} numberOfLines={1}>
                          {anime.detail}
                        </Text>
                      </Pressable>
                    ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeading}>
                <View>
                  <Text style={styles.sectionTitle}>Episodes</Text>
                  {isLoading ? (
                    <SkeletonBlock style={styles.skeletonEpisodeCount} />
                  ) : (
                    <Text style={styles.sectionCaption}>
                      {seasonLabel} · {totalEpisodeCount} episodes
                    </Text>
                  )}
                </View>
                <View style={styles.viewToggle}>
                  <Pressable
                    onPress={() => setEpisodeView("list")}
                    style={[
                      styles.viewToggleButton,
                      episodeView === "list" && styles.viewToggleButtonSelected,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="List view"
                    accessibilityState={{ selected: episodeView === "list" }}
                  >
                    <Text
                      style={[
                        styles.viewToggleGlyph,
                        episodeView === "list" &&
                          styles.viewToggleGlyphSelected,
                      ]}
                    >
                      ☷
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setEpisodeView("grid")}
                    style={[
                      styles.viewToggleButton,
                      episodeView === "grid" && styles.viewToggleButtonSelected,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Grid view"
                    accessibilityState={{ selected: episodeView === "grid" }}
                  >
                    <Text
                      style={[
                        styles.viewToggleGlyph,
                        episodeView === "grid" &&
                          styles.viewToggleGlyphSelected,
                      ]}
                    >
                      ▦
                    </Text>
                  </Pressable>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.seasonTabs}
              >
                {isLoading
                  ? Array.from({ length: 2 }, (_, index) => (
                      <SkeletonBlock
                        key={`season-skeleton-${index}`}
                        style={styles.skeletonSeasonTab}
                      />
                    ))
                  : seasons.map((season) => {
                      const selected = season.current;
                      return (
                        <Pressable
                          key={season.id}
                          onPress={() => selectSeason(season)}
                          style={[
                            styles.seasonTab,
                            selected && styles.seasonTabSelected,
                          ]}
                          accessibilityRole="button"
                          accessibilityState={{ selected }}
                          accessibilityLabel={`Select ${season.label}`}
                        >
                          <Text
                            style={[
                              styles.seasonTabText,
                              selected && styles.seasonTabTextSelected,
                            ]}
                          >
                            {season.label}
                          </Text>
                          <Text
                            style={[
                              styles.seasonTabCount,
                              selected && styles.seasonTabCountSelected,
                            ]}
                          >
                            {season.episodeCount} EP
                          </Text>
                        </Pressable>
                      );
                    })}
              </ScrollView>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.rangeList}
              >
                {isLoading
                  ? Array.from({ length: 3 }, (_, index) => (
                      <SkeletonBlock
                        key={`range-skeleton-${index}`}
                        style={styles.skeletonRangeChip}
                      />
                    ))
                  : episodeRanges.map((range, index) => {
                      const selected = index === safeRangeIndex;
                      return (
                        <Pressable
                          key={`${range.start}-${range.end}`}
                          onPress={() => selectEpisodeRange(range, index)}
                          style={[
                            styles.rangeChip,
                            selected && styles.rangeChipSelected,
                          ]}
                          accessibilityRole="button"
                          accessibilityState={{ selected }}
                          accessibilityLabel={`Episodes ${range.start} to ${range.end}`}
                        >
                          <Text
                            style={[
                              styles.rangeChipText,
                              selected && styles.rangeChipTextSelected,
                            ]}
                          >
                            Ep {range.label}
                          </Text>
                        </Pressable>
                      );
                    })}
              </ScrollView>

              <View
                style={[
                  styles.episodeList,
                  episodeView === "grid" && styles.episodeGrid,
                ]}
              >
                {isLoading
                  ? Array.from(
                      { length: episodeView === "grid" ? 4 : 3 },
                      (_, index) => (
                        <EpisodeSkeletonCard
                          key={`episode-skeleton-${index}`}
                          viewMode={episodeView}
                        />
                      ),
                    )
                  : visibleEpisodes.map((episode) => (
                      <EpisodeCard
                        key={episode.id}
                        episode={episode}
                        selected={episode.number === selectedEpisodeNumber}
                        onPress={() => selectEpisode(episode)}
                        viewMode={episodeView}
                      />
                    ))}
              </View>
            </View>

            <View style={[styles.section, styles.lastSection]}>
              <View style={styles.sectionHeading}>
                <View>
                  <Text style={styles.sectionTitle}>Voice cast</Text>
                  <Text style={styles.sectionCaption}>Meet the characters</Text>
                </View>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.castList}
              >
                {isLoading
                  ? Array.from({ length: 4 }, (_, index) => (
                      <View
                        key={`cast-skeleton-${index}`}
                        style={styles.castCard}
                      >
                        <SkeletonBlock
                          style={[
                            styles.castPortrait,
                            styles.skeletonCastPortrait,
                          ]}
                        />
                        <SkeletonBlock style={styles.skeletonCastName} />
                        <SkeletonBlock style={styles.skeletonCastRole} />
                      </View>
                    ))
                  : (data?.cast ?? []).map((member) => (
                      <View key={member.id} style={styles.castCard}>
                        <PosterPlaceholder
                          label={member.name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")}
                          source={member.image}
                          style={styles.castPortrait}
                        />
                        <Text style={styles.castName} numberOfLines={1}>
                          {member.name}
                        </Text>
                        <Text style={styles.castRole} numberOfLines={1}>
                          {member.role}
                        </Text>
                        <Text style={styles.castVoiceActor} numberOfLines={1}>
                          VA · {member.voiceActor}
                        </Text>
                      </View>
                    ))}
              </ScrollView>
            </View>
          </View>
        </ScrollView>
        <Modal
          transparent
          visible={isServerPickerVisible}
          animationType="fade"
          onRequestClose={() => setIsServerPickerVisible(false)}
        >
          <View style={styles.serverModalOverlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setIsServerPickerVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Close server selector"
            />
            <View style={styles.serverModalCard}>
              <View style={styles.serverModalHeader}>
                <View>
                  <Text style={styles.serverModalTitle}>Choose a server</Text>
                  <Text style={styles.serverModalCaption}>
                    Switch playback source
                  </Text>
                </View>
                <Pressable
                  onPress={() => setIsServerPickerVisible(false)}
                  style={styles.serverModalClose}
                >
                  <Text style={styles.serverModalCloseText}>×</Text>
                </Pressable>
              </View>
              {PLAYER_SERVERS.map((server) => {
                const selected = server.id === selectedServerId;
                return (
                  <Pressable
                    key={server.id}
                    onPress={() => {
                      if(server.id === "s3"){
                        ToastAndroid.showWithGravity("Server unavailable", ToastAndroid.TOP, ToastAndroid.SHORT);
                        return;
                      }
                      setSelectedServerId(server.id);
                      setIsServerPickerVisible(false);
                    }}
                    style={[
                      styles.serverOption,
                      selected && styles.serverOptionSelected,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <View>
                      <Text
                        style={[
                          styles.serverOptionName,
                          selected && styles.serverOptionNameSelected,
                        ]}
                      >
                        {server.label}
                      </Text>
                      <Text style={styles.serverOptionDetail}>
                        {server.detail}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.serverRadio,
                        selected && styles.serverRadioSelected,
                      ]}
                    >
                      {selected && <View style={styles.serverRadioDot} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  screen: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 36 },
  contentPadding: { paddingHorizontal: 20 },
  topBar: {
    height: 62,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 39,
    height: 39,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  backGlyph: {
    color: COLORS.white,
    fontSize: 34,
    lineHeight: 37,
    fontWeight: "300",
    marginTop: -3,
  },
  topTitleWrap: { flex: 1, alignItems: "center" },
  topEyebrow: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.6,
  },
  topTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 3,
  },
  moreButton: {
    width: 39,
    height: 39,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  moreGlyph: { color: COLORS.white, fontSize: 14, letterSpacing: 1 },
  playerGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 120,
    backgroundColor: "#29204E",
    opacity: 0.56,
  },
  playerTopControls: {
    position: "absolute",
    top: 13,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  playerBrandPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(8,9,16,0.65)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  playerLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: COLORS.cyan,
    marginRight: 6,
  },
  playerBrandText: {
    color: "#EAE8F5",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
  },
  playerQualityPill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "rgba(8,9,16,0.65)",
  },
  playerQualityText: {
    color: "#EAE8F5",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  playerCenter: { alignItems: "center", justifyContent: "center" },
  playerPlayButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(167,139,250,0.88)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.violet,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  playerPlayIcon: { color: "#FFFFFF", fontSize: 19, marginLeft: 4 },
  playerHint: {
    color: "rgba(255,255,255,0.48)",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginTop: 12,
  },
  playerBottomControls: {
    position: "absolute",
    left: 17,
    right: 17,
    bottom: 12,
  },
  playerProgressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
  },
  playerProgressFill: {
    width: "28%",
    height: 3,
    backgroundColor: COLORS.purple,
    borderRadius: 2,
  },
  playerBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 7,
  },
  playerNowPlaying: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  playerExpandIcon: { color: "rgba(255,255,255,0.72)", fontSize: 16 },
  currentEpisodeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
  },
  nowPlayingPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    backgroundColor: "rgba(131,231,244,0.1)",
  },
  nowPlayingDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.cyan,
    marginRight: 6,
  },
  nowPlayingText: {
    color: COLORS.cyan,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
  },
  currentEpisodeLabel: { color: COLORS.muted, fontSize: 9, fontWeight: "600" },
  titleBlock: { marginTop: 15 },
  titleAndRating: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  animeTitle: {
    color: COLORS.white,
    fontSize: 25,
    lineHeight: 30,
    letterSpacing: -0.7,
    fontWeight: "900",
    flex: 1,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(255,210,123,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,210,123,0.15)",
  },
  ratingStar: { color: "#FFD27B", fontSize: 10, marginRight: 5 },
  ratingText: { color: COLORS.white, fontSize: 10, fontWeight: "800" },
  episodeSubtitle: {
    color: "#D8D7E4",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 5,
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 10,
  },
  metaChip: { color: COLORS.muted, fontSize: 9, fontWeight: "600" },
  metaSeparator: { color: "#595B6E", fontSize: 10, marginHorizontal: 7 },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    paddingVertical: 13,
    backgroundColor: "rgba(255,255,255,0.035)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.055)",
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
  },
  actionIcon: { color: "#E7E4F2", fontSize: 19, lineHeight: 22 },
  actionLabel: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: "600",
    marginTop: 4,
  },
  section: { marginTop: 27 },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  sectionCaption: { color: COLORS.muted, fontSize: 9, marginTop: 4 },
  sectionLink: { color: COLORS.purple, fontSize: 10, fontWeight: "700" },
  synopsisTag: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(167,139,250,0.12)",
  },
  synopsisTagText: {
    color: COLORS.purple,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
  },
  synopsisText: { color: "#B7B7C7", fontSize: 11, lineHeight: 18 },
  readMoreButton: { alignSelf: "flex-start", marginTop: 9 },
  readMoreText: { color: COLORS.purple, fontSize: 9, fontWeight: "700" },
  seasonCount: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
  },
  posterPlaceholder: {
    flex: 1,
    backgroundColor: "#202236",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  posterPlaceholderGlow: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 55,
    backgroundColor: "#514181",
    opacity: 0.5,
    top: -30,
    right: -25,
  },
  posterPlaceholderMark: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 24,
    fontWeight: "800",
  },
  posterPlaceholderLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 3,
  },
  seasonCardOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(8,9,16,0.38)",
  },
  seasonCardMeta: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 8,
    marginTop: 3,
  },
  seasonSelectedMark: {
    position: "absolute",
    right: 8,
    top: 8,
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: COLORS.violet,
    alignItems: "center",
    justifyContent: "center",
  },
  rangeList: { paddingRight: 8, marginBottom: 13 },
  rangeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 7,
  },
  rangeChipSelected: {
    backgroundColor: "rgba(167,139,250,0.16)",
    borderColor: "rgba(167,139,250,0.42)",
  },
  rangeChipText: { color: "#A5A5B7", fontSize: 9, fontWeight: "700" },
  rangeChipTextSelected: { color: "#D8CEFF" },
  episodeList: {},
  episodeCard: {
    minHeight: 92,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginBottom: 8,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  episodeCardSelected: {
    backgroundColor: "rgba(167,139,250,0.08)",
    borderColor: "rgba(167,139,250,0.4)",
  },
  episodeImageWrap: {
    width: 108,
    height: 69,
    borderRadius: 10,
    overflow: "hidden",
  },
  episodeImagePlay: {
    position: "absolute",
    alignSelf: "center",
    top: 22,
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: "rgba(8,9,16,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  episodeImagePlayIcon: { color: "#FFFFFF", fontSize: 8, marginLeft: 2 },
  episodeDuration: {
    position: "absolute",
    right: 5,
    bottom: 5,
    color: "#FFFFFF",
    fontSize: 7,
    fontWeight: "800",
    backgroundColor: "rgba(8,9,16,0.75)",
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 4,
  },
  episodeInfo: { flex: 1, marginLeft: 10, marginRight: 5 },
  episodeTitleRow: { flexDirection: "row", alignItems: "center" },
  episodeNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },
  episodeNumberBadgeSelected: { backgroundColor: COLORS.violet },
  episodeNumberText: { color: "#B6B5C5", fontSize: 8, fontWeight: "800" },
  episodeNumberTextSelected: { color: "#FFFFFF" },
  episodeTitle: {
    flex: 1,
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "700",
  },
  episodeDescription: {
    color: COLORS.muted,
    fontSize: 8,
    lineHeight: 12,
    marginTop: 6,
  },
  episodeMore: {
    color: COLORS.muted,
    fontSize: 10,
    letterSpacing: 1,
    paddingHorizontal: 3,
  },
  castList: { paddingRight: 8 },
  castCard: { width: 82, marginRight: 13, alignItems: "center" },
  castPortrait: {
    width: 70,
    height: 70,
    flex: 0,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  castName: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "700",
    marginTop: 8,
    maxWidth: 82,
  },
  castRole: { color: COLORS.muted, fontSize: 7, marginTop: 3, maxWidth: 82 },
  castVoiceActor: { color: "#76798D", fontSize: 6, marginTop: 3, maxWidth: 82 },
  relatedList: { paddingRight: 8 },
  relatedCard: { width: 112, marginRight: 11 },
  relatedPoster: { height: 143, borderRadius: 14, marginBottom: 8 },
  relatedTitle: { color: COLORS.white, fontSize: 10, fontWeight: "700" },
  relatedDetail: { color: COLORS.muted, fontSize: 8, marginTop: 4 },
  lastSection: { marginBottom: 8 },

  animeFrameContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    overflow: "hidden",
    backgroundColor: "#000000",
  },
  stickyHeader: {
    flexShrink: 0,
    backgroundColor: COLORS.background,
    zIndex: 2,
    elevation: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  scrollArea: { flex: 1 },
  pinnedDetails: { paddingHorizontal: 20, paddingBottom: 12 },
  seasonTabs: { paddingRight: 8, paddingBottom: 10 },
  seasonTab: {
    minWidth: 102,
    paddingHorizontal: 11,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  seasonTabSelected: {
    backgroundColor: "rgba(167,139,250,0.14)",
    borderColor: "rgba(167,139,250,0.42)",
  },
  seasonTabText: { color: "#AAAABC", fontSize: 9, fontWeight: "700" },
  seasonTabTextSelected: { color: "#E1D8FF" },
  seasonTabCount: { color: COLORS.muted, fontSize: 7, marginTop: 4 },
  seasonTabCountSelected: { color: "#BEB0F6" },
  viewToggle: {
    flexDirection: "row",
    padding: 3,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  viewToggleButton: {
    width: 30,
    height: 27,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  viewToggleButtonSelected: { backgroundColor: "rgba(167,139,250,0.2)" },
  viewToggleGlyph: { color: COLORS.muted, fontSize: 17, lineHeight: 20 },
  viewToggleGlyphSelected: { color: "#D8CEFF" },
  episodeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  episodeCardGrid: {
    width: "48.5%",
    minHeight: 0,
    flexDirection: "column",
    alignItems: "stretch",
  },
  episodeImageWrapGrid: { width: "100%", height: 105 },
  episodeInfoGrid: { flex: 0, marginLeft: 0, marginRight: 0, marginTop: 9 },

  // Metadata chips, expandable synopsis, and loading skeletons.
  genreChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginRight: 6,
    marginBottom: 4,
    borderRadius: 9,
    backgroundColor: "rgba(167,139,250,0.12)",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.16)",
  },
  genreChipText: { color: "#D8CEFF", fontSize: 8, fontWeight: "700" },
  metadataTag: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginRight: 6,
    marginBottom: 4,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  metadataTagText: { color: "#C7C7D3", fontSize: 8, fontWeight: "700" },
  metadataQualityChip: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
    borderRadius: 7,
    backgroundColor: "rgba(131,231,244,0.1)",
  },
  metadataQualityText: {
    color: COLORS.cyan,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  skeletonBlock: {
    backgroundColor: "#252738",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.035)",
  },
  skeletonCurrentEpisode: { width: 88, height: 8, borderRadius: 4 },
  skeletonTitle: { width: "62%", height: 27, borderRadius: 8 },
  skeletonEpisodeCount: {
    width: 110,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  skeletonEpisodeSubtitle: {
    width: "78%",
    height: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  skeletonMetaTag: { width: 39, height: 20, borderRadius: 8, marginRight: 6 },
  skeletonMetaTagWide: {
    width: 67,
    height: 20,
    borderRadius: 8,
    marginRight: 6,
  },
  synopsisSkeleton: { marginTop: 1 },
  skeletonSynopsisLine: {
    width: "100%",
    height: 9,
    borderRadius: 5,
    marginBottom: 8,
  },
  skeletonSynopsisLineShort: { width: "64%", height: 9, borderRadius: 5 },
  skeletonRelatedPoster: { backgroundColor: "#202236" },
  skeletonRelatedTitle: {
    width: "78%",
    height: 9,
    borderRadius: 5,
    marginBottom: 6,
  },
  skeletonRelatedDetail: { width: "58%", height: 7, borderRadius: 4 },
  skeletonSeasonTab: {
    width: 102,
    height: 47,
    borderRadius: 11,
    marginRight: 8,
  },
  skeletonRangeChip: {
    width: 78,
    height: 32,
    borderRadius: 10,
    marginRight: 7,
  },
  skeletonEpisodeCard: { borderColor: "rgba(255,255,255,0.04)" },
  skeletonEpisodeImage: { backgroundColor: "#202236" },
  skeletonEpisodeTitle: {
    width: "76%",
    height: 9,
    borderRadius: 5,
    marginBottom: 9,
  },
  skeletonEpisodeDescription: { width: "92%", height: 8, borderRadius: 5 },
  skeletonCastPortrait: { backgroundColor: "#202236" },
  skeletonCastName: { width: 62, height: 8, borderRadius: 4, marginTop: 8 },
  skeletonCastRole: { width: 46, height: 6, borderRadius: 4, marginTop: 5 },

  playbackOptionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    padding: 10,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.035)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  audioControlGroup: { flexDirection: "row", alignItems: "center" },
  playbackOptionLabel: {
    color: COLORS.muted,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
    marginRight: 8,
  },
  audioToggle: {
    flexDirection: "row",
    padding: 3,
    borderRadius: 9,
    backgroundColor: "rgba(0,0,0,0.22)",
  },
  audioToggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 7,
  },
  audioToggleButtonSelected: { backgroundColor: "rgba(167,139,250,0.22)" },
  audioToggleText: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  audioToggleTextSelected: { color: "#E0D7FF" },
  serverSelector: {
    minWidth: 124,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  serverSelectedName: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "700",
    marginTop: 3,
  },
  serverChevron: { color: COLORS.muted, fontSize: 15, marginLeft: 8 },
  serverModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.68)",
    padding: 14,
  },
  serverModalCard: {
    padding: 16,
    paddingBottom: 22,
    borderRadius: 22,
    backgroundColor: "#151726",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  serverModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  serverModalTitle: { color: COLORS.white, fontSize: 16, fontWeight: "800" },
  serverModalCaption: { color: COLORS.muted, fontSize: 9, marginTop: 4 },
  serverModalClose: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  serverModalCloseText: { color: COLORS.white, fontSize: 21, lineHeight: 24 },
  serverOption: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 11,
    marginTop: 7,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(255,255,255,0.035)",
  },
  serverOptionSelected: {
    backgroundColor: "rgba(167,139,250,0.1)",
    borderColor: "rgba(167,139,250,0.42)",
  },
  serverOptionName: { color: "#E1E0EA", fontSize: 10, fontWeight: "700" },
  serverOptionNameSelected: { color: "#E1D8FF" },
  serverOptionDetail: { color: COLORS.muted, fontSize: 8, marginTop: 4 },
  serverRadio: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#66687A",
    alignItems: "center",
    justifyContent: "center",
  },
  serverRadioSelected: { borderColor: COLORS.purple },
  serverRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.purple,
  },
  unloadedEpisodeDescription: { color: "#8E91A5" },
});
