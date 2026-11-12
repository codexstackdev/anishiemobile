import React, { useMemo, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AnimeFrame from "../components/AnimeFrame";

type Episode = {
  id: string;
  number: number;
  title: string;
  description: string;
  duration: string;
  image?: ImageSourcePropType;
};

type AnimeSeason = {
  id: string;
  label: string;
  episodeCount: number;
  episodes: Episode[];
};

type CastMember = {
  id: string;
  name: string;
  role: string;
  voiceActor: string;
  image?: ImageSourcePropType;
};

type RelatedAnime = {
  id: string;
  title: string;
  detail: string;
  image?: ImageSourcePropType;
};

type EpisodeRange = {
  start: number;
  end: number;
  label: string;
};

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

const soloLevelingSeason1Episodes: Episode[] = [
  {
    id: "s1-e1",
    number: 1,
    title: "I'm Used to It",
    description:
      "A low-ranked hunter enters a dangerous dungeon with his party.",
    duration: "24 min",
  },
  {
    id: "s1-e2",
    number: 2,
    title: "If I Had One More Chance",
    description:
      "The survivors discover the terrifying rules of the double dungeon.",
    duration: "24 min",
  },
  {
    id: "s1-e3",
    number: 3,
    title: "It's Like a Game",
    description: "Jinwoo wakes up with a mysterious system only he can see.",
    duration: "24 min",
  },
  {
    id: "s1-e4",
    number: 4,
    title: "I've Gotta Get Stronger",
    description: "A new quest pushes Jinwoo to test his limits.",
    duration: "24 min",
  },
  {
    id: "s1-e5",
    number: 5,
    title: "A Pretty Good Deal",
    description: "Jinwoo returns to a dungeon with a plan and a new resolve.",
    duration: "24 min",
  },
  {
    id: "s1-e6",
    number: 6,
    title: "The Real Hunt Begins",
    description: "A dangerous raid takes a turn no one expected.",
    duration: "24 min",
  },
  {
    id: "s1-e7",
    number: 7,
    title: "Let's See How Far I Can Go",
    description: "Jinwoo faces a powerful opponent in a brutal fight.",
    duration: "24 min",
  },
  {
    id: "s1-e8",
    number: 8,
    title: "This Is Frustrating",
    description: "The hunters prepare for a high-risk job in a red gate.",
    duration: "24 min",
  },
  {
    id: "s1-e9",
    number: 9,
    title: "You've Been Hiding Your Skills",
    description:
      "Jinwoo's abilities draw attention from the hunter association.",
    duration: "24 min",
  },
  {
    id: "s1-e10",
    number: 10,
    title: "What Is This, a Picnic?",
    description: "A routine-looking mission becomes a fight for survival.",
    duration: "24 min",
  },
  {
    id: "s1-e11",
    number: 11,
    title: "A Knight Who Defends an Empty Throne",
    description: "Jinwoo enters a new dungeon and meets its guardian.",
    duration: "24 min",
  },
  {
    id: "s1-e12",
    number: 12,
    title: "Arise",
    description:
      "Jinwoo faces his greatest challenge yet and discovers a new power.",
    duration: "24 min",
  },
];

const soloLevelingSeason2Episodes: Episode[] = [
  {
    id: "s2-e1",
    number: 1,
    title: "You Aren't E-Rank, Are You?",
    description:
      "Jinwoo's return from the Red Gate leaves the hunters questioning his rank.",
    duration: "24 min",
  },
  {
    id: "s2-e2",
    number: 2,
    title: "I Suppose You Aren't Aware",
    description:
      "The next stage of Jinwoo's journey brings new allies and new threats.",
    duration: "24 min",
  },
  {
    id: "s2-e3",
    number: 3,
    title: "Still a Long Way to Go",
    description: "Jinwoo takes on a difficult challenge as the world watches.",
    duration: "24 min",
  },
  {
    id: "s2-e4",
    number: 4,
    title: "I Need to Stop Faking",
    description: "A dangerous mission tests Jinwoo's growing strength.",
    duration: "24 min",
  },
  {
    id: "s2-e5",
    number: 5,
    title: "This Is What We're Trained to Do",
    description: "Hunters gather for a raid that could change everything.",
    duration: "24 min",
  },
  {
    id: "s2-e6",
    number: 6,
    title: "Don't Look Down on My Guys",
    description: "The raid party faces a threat stronger than expected.",
    duration: "24 min",
  },
  {
    id: "s2-e7",
    number: 7,
    title: "The 10th S-Rank Hunter",
    description: "A powerful hunter arrives as the stakes continue to rise.",
    duration: "24 min",
  },
  {
    id: "s2-e8",
    number: 8,
    title: "Looking Up Was Tiring Me Out",
    description: "Jinwoo prepares to face a formidable enemy.",
    duration: "24 min",
  },
  {
    id: "s2-e9",
    number: 9,
    title: "It Was All Worth It",
    description: "A hard-fought battle brings unexpected consequences.",
    duration: "24 min",
  },
  {
    id: "s2-e10",
    number: 10,
    title: "We Need a Hero",
    description: "The hunters make a last stand against an overwhelming force.",
    duration: "24 min",
  },
  {
    id: "s2-e11",
    number: 11,
    title: "It's Going to Get Even More Intense",
    description: "Jinwoo's next challenge is closer than anyone expects.",
    duration: "24 min",
  },
  {
    id: "s2-e12",
    number: 12,
    title: "Are You the King of Humans?",
    description:
      "The battle reaches a turning point as Jinwoo reveals his strength.",
    duration: "24 min",
  },
  {
    id: "s2-e13",
    number: 13,
    title: "On to the Next Target",
    description: "A new chapter begins after the dust settles.",
    duration: "24 min",
  },
  {
    id: "s2-e14",
    number: 14,
    title: "The Gate Opens",
    description: "A mysterious gate appears and changes the hunters' plans.",
    duration: "24 min",
  },
  {
    id: "s2-e15",
    number: 15,
    title: "A Hunter's Resolve",
    description: "Jinwoo and his allies prepare for another dangerous mission.",
    duration: "24 min",
  },
  {
    id: "s2-e16",
    number: 16,
    title: "Into the Dungeon",
    description: "The team ventures deeper into an unknown dungeon.",
    duration: "24 min",
  },
  {
    id: "s2-e17",
    number: 17,
    title: "A New Power",
    description: "Jinwoo discovers another way to use his growing abilities.",
    duration: "24 min",
  },
  {
    id: "s2-e18",
    number: 18,
    title: "The Shadow Army",
    description: "The shadows gather as a new enemy makes its move.",
    duration: "24 min",
  },
  {
    id: "s2-e19",
    number: 19,
    title: "The Strongest Hunter",
    description: "A clash between powerful hunters becomes unavoidable.",
    duration: "24 min",
  },
  {
    id: "s2-e20",
    number: 20,
    title: "The Long Night",
    description: "The hunters face a night that will test every one of them.",
    duration: "24 min",
  },
  {
    id: "s2-e21",
    number: 21,
    title: "A Promise to Keep",
    description: "Jinwoo follows a lead that could change his next move.",
    duration: "24 min",
  },
  {
    id: "s2-e22",
    number: 22,
    title: "The Final Trial",
    description: "One final challenge stands between Jinwoo and his goal.",
    duration: "24 min",
  },
  {
    id: "s2-e23",
    number: 23,
    title: "The King Returns",
    description: "An old threat returns with a powerful new form.",
    duration: "24 min",
  },
  {
    id: "s2-e24",
    number: 24,
    title: "Arise Again",
    description: "The season's story reaches a dramatic conclusion.",
    duration: "24 min",
  },
];

const seasons: AnimeSeason[] = [
  {
    id: "season-1",
    label: "Season 1",
    episodeCount: soloLevelingSeason1Episodes.length,
    episodes: soloLevelingSeason1Episodes,
  },
  {
    id: "season-2",
    label: "Season 2",
    episodeCount: soloLevelingSeason2Episodes.length,
    episodes: soloLevelingSeason2Episodes,
  },
];

const cast: CastMember[] = [
  {
    id: "jinwoo",
    name: "Sung Jinwoo",
    role: "Main character",
    voiceActor: "Taito Ban",
  },
  {
    id: "chae",
    name: "Cha Hae-in",
    role: "S-Rank hunter",
    voiceActor: "Reina Ueda",
  },
  {
    id: "jinho",
    name: "Yoo Jinho",
    role: "Jinwoo's partner",
    voiceActor: "Genta Nakamura",
  },
  {
    id: "go",
    name: "Go Gunhee",
    role: "Hunter Association",
    voiceActor: "Banjou Ginga",
  },
];

const relatedAnime: RelatedAnime[] = [
  { id: "kaiju", title: "Kaiju No. 8", detail: "Action · 2024" },
  { id: "eminence", title: "The Eminence in Shadow", detail: "Fantasy · 2022" },
  { id: "demon-slayer", title: "Demon Slayer", detail: "Action · 2019" },
  { id: "tower", title: "Tower of God", detail: "Adventure · 2020" },
];

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
}: {
  episode: Episode;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.episodeCard, selected && styles.episodeCardSelected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Play episode ${episode.number}: ${episode.title}`}
    >
      <View style={styles.episodeImageWrap}>
        <PosterPlaceholder
          label={`EP ${String(episode.number).padStart(2, "0")}`}
          source={episode.image}
        />
        <View style={styles.episodeImagePlay}>
          <Text style={styles.episodeImagePlayIcon}>▶</Text>
        </View>
        <Text style={styles.episodeDuration}>{episode.duration}</Text>
      </View>
      <View style={styles.episodeInfo}>
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
          <Text style={styles.episodeTitle} numberOfLines={1}>
            {episode.title}
          </Text>
        </View>
        <Text style={styles.episodeDescription} numberOfLines={2}>
          {episode.description}
        </Text>
      </View>
      <Text style={styles.episodeMore}>•••</Text>
    </Pressable>
  );
}

export default function Watch() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("season-2");
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>("s2-e1");
  const [selectedRangeIndex, setSelectedRangeIndex] = useState<number>(0);

  const selectedSeason =
    seasons.find((season) => season.id === selectedSeasonId) ?? seasons[0];
  const episodeRanges = useMemo<EpisodeRange[]>(() => {
    const ranges: EpisodeRange[] = [];
    for (
      let start = 1;
      start <= selectedSeason.episodes.length;
      start += RANGE_SIZE
    ) {
      const end = Math.min(
        start + RANGE_SIZE - 1,
        selectedSeason.episodes.length,
      );
      ranges.push({ start, end, label: rangeLabel(start, end) });
    }
    return ranges;
  }, [selectedSeason]);
  const safeRangeIndex = Math.min(
    selectedRangeIndex,
    Math.max(episodeRanges.length - 1, 0),
  );
  const activeRange = episodeRanges[safeRangeIndex];
  const visibleEpisodes = activeRange
    ? selectedSeason.episodes.filter(
        (episode) =>
          episode.number >= activeRange.start &&
          episode.number <= activeRange.end,
      )
    : [];
  const selectedEpisode = selectedSeason.episodes.find(
    (episode) => episode.id === selectedEpisodeId,
  ) ??
    selectedSeason.episodes[0] ?? {
      id: "episode-placeholder",
      number: 1,
      title: "Episode 1",
      description: "Episode details will appear here.",
      duration: "24 min",
    };

  const selectSeason = (season: AnimeSeason) => {
    setSelectedSeasonId(season.id);
    setSelectedRangeIndex(0);
    setSelectedEpisodeId(season.episodes[0]?.id ?? "");
  };

  const selectEpisode = (episode: Episode) => {
    setSelectedEpisodeId(episode.id);
    const rangeIndex = episodeRanges.findIndex(
      (range) => episode.number >= range.start && episode.number <= range.end,
    );
    if (rangeIndex >= 0) setSelectedRangeIndex(rangeIndex);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
            <Text style={styles.topTitle}>{id}</Text>
          </View>
          <Pressable
            style={styles.moreButton}
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <Text style={styles.moreGlyph}>•••</Text>
          </Pressable>
        </View>

        <AnimeFrame id={String(id)} />

        <View style={styles.contentPadding}>
          <View style={styles.currentEpisodeRow}>
            <View style={styles.nowPlayingPill}>
              <View style={styles.nowPlayingDot} />
              <Text style={styles.nowPlayingText}>NOW PLAYING</Text>
            </View>
            <Text style={styles.currentEpisodeLabel}>
              {selectedSeason.label} · Episode {selectedEpisode.number}
            </Text>
          </View>

          <View style={styles.titleBlock}>
            <View style={styles.titleAndRating}>
              <Text style={styles.animeTitle}>Solo Leveling</Text>
              <View style={styles.ratingPill}>
                <Text style={styles.ratingStar}>★</Text>
                <Text style={styles.ratingText}>9.3</Text>
              </View>
            </View>
            <Text style={styles.episodeSubtitle}>
              {selectedSeason.label} · Episode{" "}
              {String(selectedEpisode.number).padStart(2, "0")}:{" "}
              {selectedEpisode.title}
            </Text>
            <View style={styles.metadataRow}>
              <Text style={styles.metaChip}>2024</Text>
              <Text style={styles.metaSeparator}>•</Text>
              <Text style={styles.metaChip}>Action</Text>
              <Text style={styles.metaSeparator}>•</Text>
              <Text style={styles.metaChip}>Fantasy</Text>
              <Text style={styles.metaSeparator}>•</Text>
              <Text style={styles.metaChip}>HD</Text>
            </View>
          </View>

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
            <Pressable
              style={styles.actionButton}
              accessibilityRole="button"
              accessibilityLabel="Download episode"
            >
              <Text style={styles.actionIcon}>⇩</Text>
              <Text style={styles.actionLabel}>Download</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Synopsis</Text>
              <View style={styles.synopsisTag}>
                <Text style={styles.synopsisTagText}>ANIME</Text>
              </View>
            </View>
            <Text style={styles.synopsisText}>
              They say whatever doesn’t kill you makes you stronger, but that’s
              not the case for the world’s weakest hunter, Sung Jinwoo. After
              being brutally slaughtered by monsters in a high-ranking dungeon,
              Jinwoo returns with a mysterious System that only he can see. Now
              he’s on a quest to level up and uncover the secrets behind his new
              power.
            </Text>
            <Pressable style={styles.readMoreButton} accessibilityRole="button">
              <Text style={styles.readMoreText}>Read full synopsis ˅</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <View>
                <Text style={styles.sectionTitle}>Choose a season</Text>
                <Text style={styles.sectionCaption}>Continue the story</Text>
              </View>
              <Text style={styles.seasonCount}>{seasons.length} SEASONS</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.seasonList}
            >
              {seasons.map((season, index) => {
                const selected = season.id === selectedSeasonId;
                return (
                  <Pressable
                    key={season.id}
                    onPress={() => selectSeason(season)}
                    style={[
                      styles.seasonCard,
                      selected && styles.seasonCardSelected,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`Select ${season.label}`}
                  >
                    <PosterPlaceholder label={`S${index + 1}`} />
                    <View style={styles.seasonCardOverlay} />
                    <View style={styles.seasonCardCopy}>
                      <Text style={styles.seasonCardLabel}>{season.label}</Text>
                      <Text style={styles.seasonCardMeta}>
                        {season.episodeCount} episodes
                      </Text>
                    </View>
                    {selected && (
                      <View style={styles.seasonSelectedMark}>
                        <Text style={styles.seasonSelectedCheck}>✓</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <View>
                <Text style={styles.sectionTitle}>Episodes</Text>
                <Text style={styles.sectionCaption}>
                  {selectedSeason.label} · {selectedSeason.episodeCount}{" "}
                  episodes
                </Text>
              </View>
              <Pressable style={styles.sortButton} accessibilityRole="button">
                <Text style={styles.sortButtonText}>Oldest first ⌄</Text>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rangeList}
            >
              {episodeRanges.map((range, index) => {
                const selected = index === safeRangeIndex;
                return (
                  <Pressable
                    key={`${range.start}-${range.end}`}
                    onPress={() => setSelectedRangeIndex(index)}
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

            <View style={styles.episodeList}>
              {visibleEpisodes.map((episode) => (
                <EpisodeCard
                  key={episode.id}
                  episode={episode}
                  selected={episode.id === selectedEpisodeId}
                  onPress={() => selectEpisode(episode)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <View>
                <Text style={styles.sectionTitle}>Voice cast</Text>
                <Text style={styles.sectionCaption}>Meet the characters</Text>
              </View>
              <Pressable accessibilityRole="button">
                <Text style={styles.sectionLink}>See all ›</Text>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.castList}
            >
              {cast.map((member) => (
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

          <View style={[styles.section, styles.lastSection]}>
            <View style={styles.sectionHeading}>
              <View>
                <Text style={styles.sectionTitle}>You might also like</Text>
                <Text style={styles.sectionCaption}>
                  More worlds to explore
                </Text>
              </View>
              <Pressable accessibilityRole="button">
                <Text style={styles.sectionLink}>See all ›</Text>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedList}
            >
              {relatedAnime.map((anime) => (
                <Pressable
                  key={anime.id}
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
        </View>
      </ScrollView>
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
  metadataRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
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
  seasonList: { paddingRight: 8 },
  seasonCard: {
    width: 145,
    height: 78,
    marginRight: 10,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceRaised,
  },
  seasonCardSelected: { borderColor: "rgba(167,139,250,0.7)" },
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
  seasonCardCopy: { position: "absolute", left: 10, bottom: 9 },
  seasonCardLabel: { color: COLORS.white, fontSize: 11, fontWeight: "800" },
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
  seasonSelectedCheck: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  sortButton: {
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sortButtonText: { color: "#C3C2D0", fontSize: 8, fontWeight: "600" },
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
});
