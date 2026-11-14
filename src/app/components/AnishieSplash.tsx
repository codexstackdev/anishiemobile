import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

type AnishieSplashProps = {
  onFinish: () => void;
  duration?: number;
};

const COLORS = {
  background: "#090A12",
  white: "#F8F7FF",
  muted: "#9294A8",
  purple: "#A78BFA",
  violet: "#7C5CFC",
  cyan: "#83E7F4",
};

const PARTICLES = [
  { left: "13%", top: "22%", size: 3, delay: 0 },
  { left: "82%", top: "18%", size: 2, delay: 250 },
  { left: "88%", top: "66%", size: 3, delay: 520 },
  { left: "18%", top: "73%", size: 2, delay: 760 },
  { left: "74%", top: "84%", size: 2, delay: 380 },
  { left: "9%", top: "48%", size: 2, delay: 640 },
  { left: "91%", top: "42%", size: 2, delay: 120 },
];

export default function AnishieSplash({
  onFinish,
  duration = 2700,
}: AnishieSplashProps) {
  const safeDuration = Math.max(duration, 1500);
  const logoScale = useRef(new Animated.Value(0.72)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkY = useRef(new Animated.Value(12)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;
  const orbit = useRef(new Animated.Value(0)).current;
  const counterOrbit = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;
  const sparklePulse = useRef(new Animated.Value(0)).current;
  const finishCallback = useRef(onFinish);

  finishCallback.current = onFinish;

  useEffect(() => {
    const orbitLoop = Animated.loop(
      Animated.timing(orbit, {
        toValue: 1,
        duration: 7200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const counterOrbitLoop = Animated.loop(
      Animated.timing(counterOrbit, {
        toValue: 1,
        duration: 9800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1050,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 1050,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    const sparkleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sparklePulse, {
          toValue: 1,
          duration: 780,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sparklePulse, {
          toValue: 0,
          duration: 780,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    orbitLoop.start();
    counterOrbitLoop.start();
    glowLoop.start();
    sparkleLoop.start();

    const intro = Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          speed: 15,
          bounciness: 9,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(230),
          Animated.parallel([
            Animated.timing(wordmarkOpacity, {
              toValue: 1,
              duration: 520,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(wordmarkY, {
              toValue: 0,
              duration: 520,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.sequence([
          Animated.delay(470),
          Animated.timing(taglineOpacity, {
            toValue: 1,
            duration: 460,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(650),
          Animated.timing(footerOpacity, {
            toValue: 1,
            duration: 420,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(progress, {
          toValue: 1,
          duration: safeDuration - 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]),
      Animated.delay(90),
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    intro.start(({ finished }) => {
      if (finished) finishCallback.current();
    });

    return () => {
      intro.stop();
      orbitLoop.stop();
      counterOrbitLoop.stop();
      glowLoop.stop();
      sparkleLoop.stop();
    };
  }, [
    counterOrbit,
    exitOpacity,
    footerOpacity,
    glowPulse,
    logoOpacity,
    logoScale,
    orbit,
    progress,
    safeDuration,
    sparklePulse,
    taglineOpacity,
    wordmarkOpacity,
    wordmarkY,
  ]);

  const orbitRotation = orbit.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const counterRotation = counterOrbit.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-360deg"],
  });
  const glowScale = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1.08],
  });
  const glowOpacity = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.52],
  });
  const sparkleOpacity = sparklePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.22, 0.95],
  });
  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View style={[styles.root, { opacity: exitOpacity }]}>
      <StatusBar hidden />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.backgroundBloom} />
        <View style={styles.backgroundBloomLower} />

        <View style={styles.particleLayer} pointerEvents="none">
          {PARTICLES.map((particle, index) => (
            <Animated.View
              key={`particle-${index}`}
              style={[
                styles.particle,
                {
                  left: particle.left as `${number}%`,
                  top: particle.top as `${number}%`,
                  width: particle.size,
                  height: particle.size,
                  opacity: sparkleOpacity,
                  backgroundColor:
                    index % 2 === 0 ? COLORS.cyan : COLORS.purple,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.centerStage}>
          <View style={styles.orbitStage}>
            <Animated.View
              style={[
                styles.glowCore,
                { opacity: glowOpacity, transform: [{ scale: glowScale }] },
              ]}
            />
            <Animated.View
              style={[
                styles.orbitRingOuter,
                { transform: [{ rotate: orbitRotation }] },
              ]}
            >
              <View style={styles.orbitDotOuter} />
              <View style={styles.orbitDotOuterSecondary} />
            </Animated.View>
            <Animated.View
              style={[
                styles.orbitRingInner,
                { transform: [{ rotate: counterRotation }] },
              ]}
            >
              <View style={styles.orbitDotInner} />
            </Animated.View>
            <View style={styles.logoHalo} />
            <Animated.View
              style={[
                styles.logoTile,
                {
                  opacity: logoOpacity,
                  transform: [{ scale: logoScale }],
                },
              ]}
            >
              <View style={styles.logoTileHighlight} />
              <Text style={styles.logoLetter}>A</Text>
              <View style={styles.logoTileSparkle}>
                <Text style={styles.logoTileSparkleText}>✦</Text>
              </View>
            </Animated.View>
          </View>

          <Animated.View
            style={[
              styles.wordmarkRow,
              {
                opacity: wordmarkOpacity,
                transform: [{ translateY: wordmarkY }],
              },
            ]}
          >
            <Text style={styles.wordmark}>anishie</Text>
            <View style={styles.plusBadge}>
              <Text style={styles.plusText}>PLUS</Text>
            </View>
          </Animated.View>

          <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
            YOUR NEXT STORY BEGINS HERE
          </Animated.Text>
        </View>

        <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
          <View style={styles.footerLabelRow}>
            <Text style={styles.footerLabel}>ENTERING YOUR ANIME UNIVERSE</Text>
            <Text style={styles.footerSparkle}>✦</Text>
          </View>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[styles.progressFill, { width: progressWidth }]}
            />
          </View>
          <View style={styles.footerMetaRow}>
            <Text style={styles.footerMeta}>STREAM</Text>
            <View style={styles.footerMetaDot} />
            <Text style={styles.footerMeta}>DISCOVER</Text>
            <View style={styles.footerMetaDot} />
            <Text style={styles.footerMeta}>REPEAT</Text>
          </View>
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 999,
    elevation: 999,
    backgroundColor: COLORS.background,
  },
  safeArea: { flex: 1, alignItems: "center", justifyContent: "center" },
  backgroundBloom: {
    position: "absolute",
    width: 360,
    height: 360,
    top: "18%",
    left: "50%",
    marginLeft: -180,
    borderRadius: 180,
    backgroundColor: "rgba(91,61,177,0.12)",
  },
  backgroundBloomLower: {
    position: "absolute",
    width: 270,
    height: 270,
    bottom: "7%",
    left: "50%",
    marginLeft: -135,
    borderRadius: 135,
    backgroundColor: "rgba(48,116,139,0.055)",
  },
  particleLayer: { ...StyleSheet.absoluteFill },
  particle: {
    position: "absolute",
    borderRadius: 8,
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  centerStage: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -36,
  },
  orbitStage: {
    width: 244,
    height: 244,
    alignItems: "center",
    justifyContent: "center",
  },
  glowCore: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(124,92,252,0.28)",
  },
  orbitRingOuter: {
    position: "absolute",
    width: 224,
    height: 224,
    borderRadius: 112,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.2)",
  },
  orbitDotOuter: {
    position: "absolute",
    top: 22,
    left: 32,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.cyan,
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 5,
  },
  orbitDotOuterSecondary: {
    position: "absolute",
    right: 18,
    bottom: 45,
    width: 4,
    height: 4,
    borderRadius: 3,
    backgroundColor: COLORS.purple,
  },
  orbitRingInner: {
    position: "absolute",
    width: 183,
    height: 183,
    borderRadius: 92,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(131,231,244,0.2)",
  },
  orbitDotInner: {
    position: "absolute",
    right: 22,
    top: 25,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D9CFFF",
    shadowColor: COLORS.purple,
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  logoHalo: {
    position: "absolute",
    width: 112,
    height: 112,
    borderRadius: 36,
    backgroundColor: "rgba(167,139,250,0.13)",
    borderWidth: 1,
    borderColor: "rgba(196,181,253,0.23)",
    transform: [{ rotate: "12deg" }],
  },
  logoTile: {
    width: 88,
    height: 88,
    borderRadius: 28,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.violet,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.44)",
    shadowColor: COLORS.violet,
    shadowOpacity: 0.48,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 },
    elevation: 15,
  },
  logoTileHighlight: {
    position: "absolute",
    top: -26,
    left: -4,
    width: 105,
    height: 54,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.16)",
    transform: [{ rotate: "-20deg" }],
  },
  logoLetter: {
    color: "#FFFFFF",
    fontSize: 57,
    lineHeight: 66,
    fontWeight: "900",
    fontStyle: "italic",
    marginTop: -4,
    textShadowColor: "rgba(39,20,91,0.3)",
    textShadowRadius: 8,
  },
  logoTileSparkle: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 17,
    height: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  logoTileSparkleText: { color: "rgba(255,255,255,0.9)", fontSize: 12 },
  wordmarkRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  wordmark: {
    color: COLORS.white,
    fontSize: 37,
    fontWeight: "800",
    letterSpacing: -1.8,
  },
  plusBadge: {
    marginLeft: 9,
    marginTop: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(167,139,250,0.16)",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.2)",
  },
  plusText: {
    color: "#D8CEFF",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  tagline: {
    color: "rgba(220,216,239,0.62)",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 2.2,
    marginTop: 12,
  },
  footer: { position: "absolute", left: 34, right: 34, bottom: 42 },
  footerLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  footerLabel: {
    color: "rgba(230,225,248,0.66)",
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 1.35,
  },
  footerSparkle: { color: COLORS.purple, fontSize: 12 },
  progressTrack: {
    height: 3,
    overflow: "hidden",
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.11)",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: COLORS.purple,
    shadowColor: COLORS.purple,
    shadowOpacity: 0.85,
    shadowRadius: 7,
    elevation: 4,
  },
  footerMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  footerMeta: {
    color: "rgba(190,185,210,0.42)",
    fontSize: 6,
    fontWeight: "800",
    letterSpacing: 1.25,
  },
  footerMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    marginHorizontal: 9,
    backgroundColor: "rgba(167,139,250,0.58)",
  },
});
