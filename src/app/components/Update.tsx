import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

type UpdateProps = {
  currentVersion: string;
  requiredVersion: string;
  downloadUrl: string;
};

export default function Update({
  currentVersion,
  requiredVersion,
  downloadUrl,
}: UpdateProps) {
  const [isOpeningLink, setIsOpeningLink] = useState<boolean>(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  const handleOpenDownloadPage = async (): Promise<void> => {
    const targetUrl = downloadUrl.trim();
    setLinkError(null);

    if (!/^https?:\/\//i.test(targetUrl)) {
      setLinkError("The download page link is missing or invalid. Please try again later.");
      return;
    }

    try {
      setIsOpeningLink(true);
      await Linking.openURL(targetUrl);
    } catch {
      setLinkError("Could not open the download page. Check your internet connection and try again.");
    } finally {
      setIsOpeningLink(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <Modal
        visible={true}
        transparent={false}
        animationType="none"
        presentationStyle="fullScreen"
        statusBarTranslucent={false}
        onRequestClose={() => undefined}
      >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.screen}>
          <View style={styles.ambientGlowTop} />
          <View style={styles.ambientGlowBottom} />

          <View style={styles.brandLockup}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>A</Text>
            </View>
            <Text style={styles.brandName}>anishie</Text>
            <View style={styles.plusBadge}>
              <Text style={styles.plusBadgeText}>PLUS</Text>
            </View>
          </View>

          <View style={styles.updateCard}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusBadgeText}>UPDATE REQUIRED</Text>
            </View>

            <View style={styles.updateIconWrap}>
              <View style={styles.updateIconHalo} />
              <Ionicons name="cloud-download-outline" size={35} color={COLORS.lavender} />
              <View style={styles.iconSparkle}>
                <Ionicons name="sparkles" size={12} color={COLORS.cyan} />
              </View>
            </View>

            <Text style={styles.title}>A new episode{ "\n" }of Anishie is ready.</Text>
            <Text style={styles.description}>
              This version is out of date. Update Anishie to continue watching and get the latest improvements.
            </Text>

            <View style={styles.versionPanel}>
              <View style={styles.versionColumn}>
                <Text style={styles.versionLabel}>INSTALLED</Text>
                <Text style={styles.versionValue}>v{currentVersion}</Text>
              </View>
              <View style={styles.versionArrow}>
                <Ionicons name="arrow-forward" size={16} color={COLORS.muted} />
              </View>
              <View style={[styles.versionColumn, styles.versionColumnLatest]}>
                <Text style={styles.versionLabelLatest}>REQUIRED</Text>
                <Text style={styles.versionValueLatest}>v{requiredVersion}</Text>
              </View>
            </View>

            <Pressable
              onPress={handleOpenDownloadPage}
              disabled={isOpeningLink}
              accessibilityRole="button"
              accessibilityLabel="Open the Anishie download page to update"
              accessibilityState={{ disabled: isOpeningLink, busy: isOpeningLink }}
              style={({ pressed }) => [
                styles.updateButton,
                pressed && !isOpeningLink && styles.updateButtonPressed,
                isOpeningLink && styles.updateButtonLoading,
              ]}
            >
              {isOpeningLink ? (
                <ActivityIndicator size="small" color={COLORS.background} />
              ) : (
                <Ionicons name="download-outline" size={19} color={COLORS.background} />
              )}
              <Text style={styles.updateButtonText}>
                {isOpeningLink ? "Opening download page…" : "Update Anishie"}
              </Text>
              {!isOpeningLink && (
                <Ionicons name="arrow-up-outline" size={17} color={COLORS.background} />
              )}
            </Pressable>

            {linkError ? (
              <View style={styles.errorBox} accessibilityRole="alert">
                <Ionicons name="alert-circle-outline" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{linkError}</Text>
              </View>
            ) : null}

            <View style={styles.requiredNote}>
              <Ionicons name="lock-closed-outline" size={13} color={COLORS.muted} />
              <Text style={styles.requiredNoteText}>
                Updating is required to continue using Anishie.
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerLine} />
            <Text style={styles.footerText}>Your anime is waiting on the other side.</Text>
            <Text style={styles.footerBrand}>ANISHIE PLUS</Text>
          </View>
        </View>
        </ScrollView>
      </SafeAreaView>
      </Modal>
    </>
  );
}

const COLORS = {
  background: "#09090B",
  card: "#121117",
  foreground: "#FAFAFC",
  muted: "#A1A1AA",
  mutedSoft: "#71717A",
  lavender: "#C4B5FD",
  purple: "#8B5CF6",
  cyan: "#67E8F9",
  error: "#FDA4AF",
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  screen: {
    flex: 1,
    minHeight: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 22,
    paddingTop: 0,
    paddingBottom: 22,
    backgroundColor: COLORS.background,
  },
  ambientGlowTop: {
    position: "absolute",
    top: -170,
    right: -150,
    width: 390,
    height: 390,
    borderRadius: 200,
    backgroundColor: "rgba(124, 58, 237, 0.13)",
  },
  ambientGlowBottom: {
    position: "absolute",
    bottom: -190,
    left: -160,
    width: 360,
    height: 360,
    borderRadius: 190,
    backgroundColor: "rgba(34, 211, 238, 0.055)",
  },
  brandLockup: {
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  brandMark: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderRadius: 11,
    backgroundColor: COLORS.purple,
    borderWidth: 1,
    borderColor: "rgba(221, 214, 254, 0.3)",
  },
  brandMarkText: {
    color: COLORS.foreground,
    fontSize: 20,
    fontWeight: "900",
    fontStyle: "italic",
  },
  brandName: {
    color: COLORS.foreground,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  plusBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 5,
    backgroundColor: "rgba(167, 139, 250, 0.13)",
    borderWidth: 1,
    borderColor: "rgba(167, 139, 250, 0.18)",
  },
  plusBadgeText: {
    color: COLORS.lavender,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  updateCard: {
    zIndex: 1,
    width: "100%",
    maxWidth: 440,
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 25,
    paddingBottom: 21,
    borderRadius: 27,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.09)",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 35,
    elevation: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(251, 191, 36, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.15)",
  },
  statusDot: {
    width: 6,
    height: 6,
    marginRight: 7,
    borderRadius: 3,
    backgroundColor: "#FBBF24",
  },
  statusBadgeText: {
    color: "#FCD34D",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.25,
  },
  updateIconWrap: {
    position: "relative",
    width: 78,
    height: 78,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    marginBottom: 18,
    borderRadius: 26,
    backgroundColor: "rgba(139, 92, 246, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(196, 181, 253, 0.18)",
  },
  updateIconHalo: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(139, 92, 246, 0.14)",
  },
  iconSparkle: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  title: {
    color: COLORS.foreground,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "900",
    letterSpacing: -0.75,
    textAlign: "center",
  },
  description: {
    maxWidth: 325,
    marginTop: 10,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
  },
  versionPanel: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 21,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.035)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
  },
  versionColumn: {
    flex: 1,
  },
  versionColumnLatest: {
    alignItems: "flex-end",
  },
  versionLabel: {
    color: COLORS.mutedSoft,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.15,
  },
  versionLabelLatest: {
    color: COLORS.lavender,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.15,
  },
  versionValue: {
    marginTop: 4,
    color: "#D4D4D8",
    fontSize: 13,
    fontWeight: "800",
  },
  versionValueLatest: {
    marginTop: 4,
    color: COLORS.foreground,
    fontSize: 13,
    fontWeight: "900",
  },
  versionArrow: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
    borderRadius: 9,
    backgroundColor: "rgba(167, 139, 250, 0.09)",
  },
  updateButton: {
    width: "100%",
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 17,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: COLORS.lavender,
  },
  updateButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  updateButtonLoading: {
    opacity: 0.75,
  },
  updateButtonText: {
    marginHorizontal: 9,
    color: COLORS.background,
    fontSize: 12,
    fontWeight: "900",
  },
  errorBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
    padding: 10,
    borderRadius: 11,
    backgroundColor: "rgba(244, 63, 94, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(251, 113, 133, 0.18)",
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    color: COLORS.error,
    fontSize: 9,
    lineHeight: 14,
  },
  requiredNote: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  requiredNoteText: {
    marginLeft: 6,
    color: COLORS.mutedSoft,
    fontSize: 9,
  },
  footer: {
    zIndex: 1,
    alignItems: "center",
    marginTop: 24,
  },
  footerLine: {
    width: 32,
    height: 2,
    marginBottom: 11,
    borderRadius: 2,
    backgroundColor: "rgba(167, 139, 250, 0.55)",
  },
  footerText: {
    color: COLORS.mutedSoft,
    fontSize: 9,
  },
  footerBrand: {
    marginTop: 8,
    color: "rgba(161, 161, 170, 0.55)",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.8,
  },
});