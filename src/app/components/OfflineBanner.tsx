import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { Ionicons } from "@expo/vector-icons";

type OfflineBannerProps = {
  requireWifi?: boolean;
};

type ConnectionSnapshot = {
  type: string;
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
};

const COLORS = {
  background: "#090A12",
  panel: "#141522",
  white: "#F8F7FF",
  muted: "#A1A1AA",
  mutedDark: "#737586",
  violet: "#7C5CFC",
  purple: "#A78BFA",
  cyan: "#83E7F4",
  border: "rgba(255,255,255,0.09)",
};

function toSnapshot(state: NetInfoState): ConnectionSnapshot {
  return {
    type: state.type,
    isConnected: state.isConnected,
    isInternetReachable: state.isInternetReachable,
  };
}

export default function OfflineBanner({
  requireWifi = true,
}: OfflineBannerProps) {
  const [connection, setConnection] = useState<ConnectionSnapshot | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [retrying, setRetrying] = useState<boolean>(false);
  const [settingsError, setSettingsError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!isMounted) return;
      setConnection(toSnapshot(state));
      setIsChecking(false);
      setRetrying(false);
    });

    NetInfo.fetch()
      .then((state) => {
        if (!isMounted) return;
        setConnection(toSnapshot(state));
        setIsChecking(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setConnection(null);
        setIsChecking(false);
      });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const hasInternet =
    connection?.isConnected === true &&
    connection.isInternetReachable !== false;
  const isWifi = connection?.type === "wifi";
  const canUseApp = hasInternet && (!requireWifi || isWifi);

  const retryConnection = useCallback(async () => {
    setRetrying(true);
    setIsChecking(true);
    setSettingsError(false);
    try {
      const state = await NetInfo.fetch();
      setConnection(toSnapshot(state));
    } catch {
      setConnection(null);
    } finally {
      setIsChecking(false);
      setRetrying(false);
    }
  }, []);

  const openNetworkSettings = useCallback(async () => {
    setSettingsError(false);
    try {
      if (Platform.OS === "android") {
        await Linking.sendIntent("android.settings.WIFI_SETTINGS");
      } else {
        await Linking.openSettings();
      }
    } catch {
      setSettingsError(true);
    }
  }, []);

  if (canUseApp) return null;

  const title = isChecking
    ? "Checking your connection"
    : !connection || connection.isConnected !== true
      ? "You’re offline"
      : requireWifi && !isWifi
        ? "Wi-Fi is required"
        : "Wi-Fi has no internet";

  const description = isChecking
    ? "Just a moment while Anishie checks your network."
    : !connection || connection.isConnected !== true
      ? "Connect to a Wi-Fi network with internet access to continue using Anishie."
      : requireWifi && !isWifi
        ? "Anishie is set to use Wi-Fi only. Connect to Wi-Fi, then we’ll bring you back automatically."
        : "You’re connected to Wi-Fi, but it doesn’t seem to have internet access. Check the network and try again.";

  return (
    <Modal
      visible={!canUseApp}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        // This gate intentionally cannot be dismissed while the connection is unavailable.
      }}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.topBrand}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>A</Text>
            </View>
            <Text style={styles.brandName}>anishie</Text>
            <View style={styles.plusBadge}>
              <Text style={styles.plusBadgeText}>PLUS</Text>
            </View>
          </View>

          <View style={styles.centerContent}>
            <View style={styles.signalArt}>
              <View style={styles.signalHaloOuter} />
              <View style={styles.signalHaloInner} />
              <View style={styles.signalIconBox}>
                {isChecking ? (
                  <ActivityIndicator size="large" color={COLORS.purple} />
                ) : (
                  <Ionicons
                    name={isWifi ? "wifi" : "wifi-outline"}
                    size={38}
                    color={COLORS.purple}
                  />
                )}
              </View>
              {!isChecking && (
                <View style={styles.offlineBadge}>
                  <Ionicons name="close" size={13} color="#FFFFFF" />
                </View>
              )}
              <View style={styles.signalSparkleTop} />
              <View style={styles.signalSparkleBottom} />
            </View>

            <View style={styles.headingBlock}>
              <View style={styles.statusPill}>
                <View
                  style={[
                    styles.statusDot,
                    isChecking && styles.statusDotChecking,
                  ]}
                />
                <Text style={styles.statusText}>
                  {isChecking
                    ? "NETWORK CHECK"
                    : requireWifi
                      ? "WI-FI ONLY"
                      : "NO INTERNET"}
                </Text>
              </View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>{description}</Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoIconBox}>
                <Ionicons
                  name="play-circle-outline"
                  size={17}
                  color={COLORS.cyan}
                />
              </View>
              <View style={styles.infoCopy}>
                <Text style={styles.infoTitle}>Anishie needs a connection</Text>
                <Text style={styles.infoBody}>
                  Anime discovery, episode details, and streaming need internet
                  access.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomActions}>
            {settingsError && (
              <Text style={styles.errorText}>
                Settings couldn’t be opened. Please open your device’s Wi-Fi
                settings manually.
              </Text>
            )}
            <Pressable
              onPress={retryConnection}
              disabled={isChecking || retrying}
              style={({ pressed }) => [
                styles.retryButton,
                (isChecking || retrying) && styles.buttonDisabled,
                pressed && !isChecking && styles.buttonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Check Wi-Fi connection again"
            >
              {retrying ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="refresh" size={16} color="#FFFFFF" />
              )}
              <Text style={styles.retryButtonText}>
                {retrying ? "Checking…" : "Try again"}
              </Text>
            </Pressable>

            <Pressable
              onPress={openNetworkSettings}
              style={({ pressed }) => [
                styles.settingsButton,
                pressed && styles.buttonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={
                Platform.OS === "android"
                  ? "Open Wi-Fi settings"
                  : "Open device settings"
              }
            >
              <Ionicons name="settings-outline" size={15} color="#E9E5F4" />
              <Text style={styles.settingsButtonText}>
                {Platform.OS === "android"
                  ? "Open Wi-Fi settings"
                  : "Open Settings"}
              </Text>
              <Ionicons name="open-outline" size={12} color={COLORS.muted} />
            </Pressable>

            <View style={styles.autoReturnRow}>
              <Ionicons name="sync-outline" size={12} color={COLORS.cyan} />
              <Text style={styles.autoReturnText}>
                We’ll reconnect automatically when Wi-Fi is back.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(9,10,18,0.98)",
  },
  safeArea: { flex: 1, paddingHorizontal: 23 },
  topBrand: { height: 60, flexDirection: "row", alignItems: "center" },
  brandMark: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderRadius: 10,
    backgroundColor: COLORS.violet,
  },
  brandMarkText: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    fontStyle: "italic",
  },
  brandName: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  plusBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: "rgba(167,139,250,0.15)",
  },
  plusBadgeText: {
    color: COLORS.purple,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 24,
  },
  signalArt: {
    width: 190,
    height: 190,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  signalHaloOuter: {
    position: "absolute",
    width: 182,
    height: 182,
    borderRadius: 91,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.12)",
    backgroundColor: "rgba(124,92,252,0.035)",
  },
  signalHaloInner: {
    position: "absolute",
    width: 137,
    height: 137,
    borderRadius: 69,
    borderWidth: 1,
    borderColor: "rgba(131,231,244,0.14)",
    backgroundColor: "rgba(131,231,244,0.025)",
  },
  signalIconBox: {
    width: 88,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 31,
    backgroundColor: "rgba(124,92,252,0.16)",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.28)",
    shadowColor: COLORS.violet,
    shadowOpacity: 0.24,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  offlineBadge: {
    position: "absolute",
    right: 42,
    bottom: 39,
    width: 25,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: "#F87171",
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  signalSparkleTop: {
    position: "absolute",
    top: 24,
    right: 31,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.cyan,
  },
  signalSparkleBottom: {
    position: "absolute",
    bottom: 29,
    left: 25,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.purple,
  },
  headingBlock: { alignItems: "center", paddingHorizontal: 7 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: "rgba(248,113,113,0.09)",
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.15)",
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 6,
    backgroundColor: "#F87171",
  },
  statusDotChecking: { backgroundColor: COLORS.cyan },
  statusText: {
    color: "#FCA5A5",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  title: {
    color: COLORS.white,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "900",
    letterSpacing: -0.8,
    textAlign: "center",
    marginTop: 15,
  },
  description: {
    maxWidth: 295,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 8,
  },
  infoCard: {
    width: "100%",
    maxWidth: 370,
    minHeight: 69,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginTop: 23,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoIconBox: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: "rgba(103,232,249,0.09)",
  },
  infoCopy: { flex: 1, marginLeft: 10 },
  infoTitle: { color: COLORS.white, fontSize: 9, fontWeight: "800" },
  infoBody: { color: COLORS.muted, fontSize: 7, lineHeight: 12, marginTop: 4 },
  bottomActions: { paddingBottom: Platform.OS === "ios" ? 12 : 20 },
  errorText: {
    color: "#FDA4AF",
    fontSize: 8,
    lineHeight: 12,
    textAlign: "center",
    marginBottom: 9,
  },
  retryButton: {
    height: 49,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: COLORS.violet,
    shadowColor: COLORS.violet,
    shadowOpacity: 0.28,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonPressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  settingsButton: {
    height: 45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 9,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingsButtonText: {
    color: "#E9E5F4",
    fontSize: 9,
    fontWeight: "700",
    marginHorizontal: 8,
  },
  autoReturnRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  autoReturnText: { color: COLORS.mutedDark, fontSize: 7, marginLeft: 6 },
});
