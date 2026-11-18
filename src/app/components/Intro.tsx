import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TERMS_VERSION = "2026-11-18";

export type IntroProfile = {
  displayName: string;
  termsVersion: string;
  acceptedAt: string;
};

type IntroProps = {
  onComplete: (profile: IntroProfile) => void | Promise<void>;
};

type InfoPoint = {
  icon: "phone-portrait-outline" | "person-outline" | "trash-outline";
  title: string;
  body: string;
  tint: string;
};

type LegalSection = {
  title: string;
  body: string;
};

const COLORS = {
  background: "#09090B",
  surface: "#111114",
  surfaceRaised: "#18181D",
  foreground: "#FAFAFA",
  muted: "#A1A1AA",
  mutedDark: "#71717A",
  border: "rgba(255,255,255,0.09)",
  violet: "#8B5CF6",
  purple: "#A78BFA",
  purpleLight: "#DDD6FE",
  cyan: "#67E8F9",
  amber: "#FCD34D",
};

const INFO_POINTS: InfoPoint[] = [
  {
    icon: "phone-portrait-outline",
    title: "Stored on this device",
    body: "Your display name, watchlist, progress and app preferences are kept locally on this device. There is no Anishie account or sign-up.",
    tint: COLORS.purple,
  },
  {
    icon: "person-outline",
    title: "No account needed",
    body: "Your display name is a local profile label. It is not an online account and does not sync to another device through Anishie.",
    tint: COLORS.cyan,
  },
  {
    icon: "trash-outline",
    title: "Uninstall means a fresh start",
    body: "Uninstalling Anishie or clearing its app storage removes locally saved profile and app data. If your device backs up app data, a backup may remain until you delete that backup too.",
    tint: COLORS.amber,
  },
];

const LEGAL_SECTIONS: LegalSection[] = [
  {
    title: "1. Agreement and eligibility",
    body: "By continuing, you confirm that you have read and agree to these Terms and the data disclosures in this introduction. If you are not legally able to agree where you live, ask a parent or guardian to review them with you. If you do not agree, do not use Anishie.",
  },
  {
    title: "2. What Anishie does",
    body: "Anishie is an anime discovery and viewing interface. Catalog information, images, playback, and availability may be provided by third-party services or sources and can change or become unavailable. Anishie does not promise that a title, language, subtitle, server, image, or stream will always be available or accurate. Before release, describe precisely whether your app hosts, embeds, links to, or only indexes each kind of content; do not claim that Anishie does not host content unless that is true.",
  },
  {
    title: "3. Use of content and your responsibilities",
    body: "Use Anishie only where permitted by the laws that apply to you and by the terms of the relevant content and service providers. Respect copyright, licensing, access controls, age ratings, and regional restrictions. Do not use the app to upload, copy, redistribute, record, sell, or publicly perform protected content without permission; do not bypass technical restrictions or interfere with the app, its services, or other users. You are responsible for deciding whether your use is lawful in your location.",
  },
  {
    title: "4. Local profile, storage, and deletion",
    body: "Anishie does not require you to create an account. The display name you enter and features such as watchlist entries, viewing progress, and preferences are intended to be stored locally on this device. Anishie does not provide account-based cloud sync or recovery in this starter design. Uninstalling the app or clearing its storage will normally remove its local data, including your profile, watchlist, and progress; you may not be able to recover it. Operating-system backups or device-transfer tools may retain or restore a copy. This local-storage description must be updated if your shipped app sends or stores any of these items elsewhere.",
  },
  {
    title: "5. Internet and third-party services",
    body: "Anime catalogs, artwork, playback, and other online features require an internet connection. When the app contacts a catalog API, media provider, hosting service, or other third party, that provider may receive technical request information such as your IP address, device/browser details, and the requested resource under its own privacy policy and terms. Local storage does not mean that all network activity is private or offline. Review and link the privacy policies of every provider you use, and disclose analytics, crash reporting, advertising, or other SDKs here before release.",
  },
  {
    title: "6. Copyright and DMCA notices",
    body: "If you believe material accessible through Anishie infringes a copyright you own or are authorized to represent, send a written notice to zyntaxinc@gmail.com with: (a) your physical or electronic signature; (b) identification of the copyrighted work; (c) identification of the allegedly infringing material and enough information for us to locate it, such as the exact Anishie page or URL; (d) your name and contact details; (e) a good-faith statement that the use is not authorized by the copyright owner, its agent, or law; and (f) a statement, under penalty of perjury, that the notice is accurate and that you are the owner or authorized to act for the owner. We may forward notices to relevant providers, remove or disable access to material where appropriate, and take action against repeat infringement. Knowingly submitting a materially false notice may have legal consequences.",
  },
  {
    title: "7. Counter-notices and repeat claims",
    body: "If material you provided or control was removed or disabled because of a copyright notice and you believe that was a mistake or misidentification, you may send a counter-notice to the same published copyright contact. A counter-notice generally needs your signature, identification of the removed material and its former location, a statement under penalty of perjury that you have a good-faith belief the material was removed by mistake or misidentification, your contact details, and the statements required by applicable law. A valid counter-notice may be shared with the original claimant. Access may be restored only as permitted by law and the applicable process. Do not submit a counter-notice unless you understand its legal effect.",
  },
  {
    title: "8. Copyright agent and contact details",
    body: "Before publishing this policy, provide a monitored copyright/DMCA email and any other required contact details. If you intend to rely on the U.S. DMCA safe-harbor process, consult counsel about eligibility and designate/register an agent as required; displaying an email in the app by itself does not establish safe-harbor eligibility. Copyright contact: zyntaxinc@gmail.com. Operator/legal name and mailing address: Zyntax",
  },
  {
    title: "9. Availability, disclaimers, and liability",
    body: "To the extent permitted by law, Anishie is provided on an “as available” basis without a promise of uninterrupted access, error-free metadata, or continued availability of third-party sources. Nothing in these Terms limits a right or remedy that cannot lawfully be excluded. Any liability limits, governing law, dispute process, and consumer-rights language must be completed for the countries where you distribute the app and reviewed by qualified counsel.",
  },
  {
    title: "10. Changes and contact",
    body: "We may update the app or these Terms. Material changes should be shown to users and accepted again where required by law. Add your operator name, support contact, effective date, and a way for users to access the latest Terms and Privacy Notice before release. Questions: zyntaxinc@gmail.com",
  },
];

export default function Intro({ onComplete }: IntroProps) {
  const [step, setStep] = useState<number>(0);
  const [displayName, setDisplayName] = useState<string>("");
  const [accepted, setAccepted] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>("");
  const stepOpacity = useRef(new Animated.Value(0)).current;
  const stepOffset = useRef(new Animated.Value(12)).current;
  const cleanName = displayName.trim();

  useEffect(() => {
    stepOpacity.setValue(0);
    stepOffset.setValue(12);
    Animated.parallel([
      Animated.timing(stepOpacity, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(stepOffset, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [step, stepOffset, stepOpacity]);

  const goBack = () => {
    setSaveError("");
    setStep((current) => Math.max(current - 1, 0));
  };

  const continueForward = () => {
    setSaveError("");
    setStep((current) => Math.min(current + 1, 2));
  };

  const finishIntro = async () => {
    if (!cleanName || !accepted || isSaving) return;
    setIsSaving(true);
    setSaveError("");
    const profile: IntroProfile = {
      displayName: cleanName,
      termsVersion: TERMS_VERSION,
      acceptedAt: new Date().toISOString(),
    };
    try {
      await onComplete(profile);
    } catch {
      setSaveError("We couldn't save your setup. Please try again.");
      setIsSaving(false);
    }
  };

  const progressWidth = `${((step + 1) / 3) * 100}%` as `${number}%`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.screen}>
          <View style={styles.ambientGlow} pointerEvents="none" />
          <View style={styles.topBar}>
            <View style={styles.brandLockup}>
              <View style={styles.brandMark}>
                <Text style={styles.brandMarkText}>A</Text>
              </View>
              <Text style={styles.brandName}>anishie</Text>
              <View style={styles.plusBadge}>
                <Text style={styles.plusBadgeText}>PLUS</Text>
              </View>
            </View>
            <Text style={styles.stepLabel}>STEP {step + 1} OF 3</Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: progressWidth }]} />
          </View>

          <Animated.View
            style={[
              styles.stepContent,
              { opacity: stepOpacity, transform: [{ translateY: stepOffset }] },
            ]}
          >
            {step === 0 && (
              <ScrollView
                contentContainerStyle={styles.welcomeContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.heroOrbWrap}>
                  <View style={styles.heroOrbOuter}>
                    <View style={styles.heroOrbInner}>
                      <Ionicons
                        name="sparkles"
                        size={31}
                        color={COLORS.purpleLight}
                      />
                    </View>
                  </View>
                  <View style={styles.heroOrbitDot} />
                </View>
                <View style={styles.welcomeHeading}>
                  <View style={styles.eyebrowPill}>
                    <View style={styles.eyebrowDot} />
                    <Text style={styles.eyebrowText}>
                      YOUR ANIME, YOUR SPACE
                    </Text>
                  </View>
                  <Text style={styles.welcomeTitle}>
                    Welcome to{"\n"}
                    <Text style={styles.welcomeTitleAccent}>Anishie.</Text>
                  </Text>
                  <Text style={styles.welcomeCopy}>
                    Discover your next favorite, keep track of every episode,
                    and build a collection that feels like yours.
                  </Text>
                </View>

                <View style={styles.nameCard}>
                  <View style={styles.nameCardHeader}>
                    <View style={styles.nameIcon}>
                      <Ionicons
                        name="person-outline"
                        size={16}
                        color={COLORS.purpleLight}
                      />
                    </View>
                    <View style={styles.nameCardHeading}>
                      <Text style={styles.nameCardTitle}>
                        What should we call you?
                      </Text>
                      <Text style={styles.nameCardHint}>
                        Choose a name for your local profile
                      </Text>
                    </View>
                  </View>
                  <TextInput
                    value={displayName}
                    onChangeText={(value) => {
                      setDisplayName(value.replace(/\s+/g, " ").slice(0, 24));
                      setSaveError("");
                    }}
                    placeholder="Your display name"
                    placeholderTextColor="#71717A"
                    style={styles.nameInput}
                    maxLength={15}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="done"
                    accessibilityLabel="Choose your display name"
                  />
                  <View style={styles.nameInputFooter}>
                    <View style={styles.localOnlyNote}>
                      <Ionicons
                        name="phone-portrait-outline"
                        size={12}
                        color={COLORS.cyan}
                      />
                      <Text style={styles.localOnlyText}>
                        Saved only on this device
                      </Text>
                    </View>
                    <Text style={styles.characterCount}>
                      {displayName.length}/24
                    </Text>
                  </View>
                </View>
                <View style={styles.noAccountNote}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={16}
                    color={COLORS.cyan}
                  />
                  <Text style={styles.noAccountText}>
                    No sign-up. No Anishie account. Just press play.
                  </Text>
                </View>
              </ScrollView>
            )}

            {step === 1 && (
              <ScrollView
                contentContainerStyle={styles.infoContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.sectionEyebrow}>
                  <Ionicons name="lock-closed" size={12} color={COLORS.cyan} />
                  <Text style={styles.sectionEyebrowText}>
                    PRIVATE BY DEFAULT
                  </Text>
                </View>
                <Text style={styles.pageTitle}>
                  Your data stays{"\n"}on your device.
                </Text>
                <Text style={styles.pageDescription}>
                  Anishie uses local app storage for your profile and personal
                  list. There is no account to create and no Anishie cloud sync
                  in this setup.
                </Text>

                <View style={styles.infoCardStack}>
                  {INFO_POINTS.map((point, index) => (
                    <View key={point.title} style={styles.infoCard}>
                      <View
                        style={[
                          styles.infoIcon,
                          { backgroundColor: `${point.tint}18` },
                        ]}
                      >
                        <Ionicons
                          name={point.icon}
                          size={18}
                          color={point.tint}
                        />
                      </View>
                      <View style={styles.infoCopy}>
                        <Text style={styles.infoTitle}>{point.title}</Text>
                        <Text style={styles.infoBody}>{point.body}</Text>
                      </View>
                      <Text style={styles.infoIndex}>0{index + 1}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.networkNotice}>
                  <Ionicons
                    name="globe-outline"
                    size={16}
                    color={COLORS.amber}
                  />
                  <View style={styles.networkCopy}>
                    <Text style={styles.networkTitle}>
                      Streaming still uses the internet
                    </Text>
                    <Text style={styles.networkBody}>
                      Catalog and playback providers may receive technical
                      request details, such as your IP address and requested
                      content. Their own privacy terms apply. Local profile data
                      is not an Anishie account.
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}

            {step === 2 && (
              <View style={styles.legalContent}>
                <View style={styles.legalHeading}>
                  <View style={styles.sectionEyebrow}>
                    <Ionicons
                      name="document-text-outline"
                      size={12}
                      color={COLORS.purple}
                    />
                    <Text
                      style={[
                        styles.sectionEyebrowText,
                        { color: COLORS.purple },
                      ]}
                    >
                      TERMS & COPYRIGHT
                    </Text>
                  </View>
                  <Text style={styles.pageTitle}>Before you press play.</Text>
                  <Text style={styles.pageDescription}>
                    Please review the key terms, data details, and copyright
                    reporting process below.
                  </Text>
                </View>

                <ScrollView
                  style={styles.termsScroll}
                  contentContainerStyle={styles.termsScrollContent}
                  showsVerticalScrollIndicator
                  nestedScrollEnabled
                >
                  {LEGAL_SECTIONS.map((section) => (
                    <View key={section.title} style={styles.legalSection}>
                      <Text style={styles.legalSectionTitle}>
                        {section.title}
                      </Text>
                      <Text style={styles.legalSectionBody}>
                        {section.body}
                      </Text>
                    </View>
                  ))}
                  <View style={styles.legalVersionRow}>
                    <Ionicons
                      name="time-outline"
                      size={12}
                      color={COLORS.mutedDark}
                    />
                    <Text style={styles.legalVersion}>
                      Terms version {TERMS_VERSION}
                    </Text>
                  </View>
                </ScrollView>

                <Pressable
                  onPress={() => {
                    setAccepted((value) => !value);
                    setSaveError("");
                  }}
                  style={styles.acceptRow}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: accepted }}
                  accessibilityLabel="I have read and agree to the Terms and data disclosures"
                >
                  <View
                    style={[
                      styles.checkbox,
                      accepted && styles.checkboxChecked,
                    ]}
                  >
                    {accepted && (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.acceptText}>
                    I have read and agree to the Terms and data disclosures.
                  </Text>
                </Pressable>
                <Text style={styles.legalFooterNote}>
                  By continuing, you confirm that the name and agreement are
                  saved locally on this device.
                </Text>
              </View>
            )}
          </Animated.View>

          <View style={styles.bottomActions}>
            {saveError.length > 0 && (
              <Text style={styles.saveError}>{saveError}</Text>
            )}
            <View style={styles.buttonRow}>
              {step > 0 && (
                <Pressable
                  onPress={goBack}
                  style={styles.backButton}
                  accessibilityRole="button"
                  accessibilityLabel="Go to previous introduction step"
                >
                  <Ionicons
                    name="arrow-back"
                    size={16}
                    color={COLORS.foreground}
                  />
                </Pressable>
              )}
              {step < 2 ? (
                <Pressable
                  onPress={continueForward}
                  disabled={step === 0 && cleanName.length === 0}
                  style={[
                    styles.primaryButton,
                    step > 0 && styles.primaryButtonWithBack,
                    step === 0 &&
                      cleanName.length === 0 &&
                      styles.primaryButtonDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={
                    step === 0
                      ? "Continue to local data information"
                      : "Continue to terms"
                  }
                >
                  <Text style={styles.primaryButtonText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </Pressable>
              ) : (
                <Pressable
                  onPress={finishIntro}
                  disabled={!accepted || isSaving}
                  style={[
                    styles.primaryButton,
                    step > 0 && styles.primaryButtonWithBack,
                    (!accepted || isSaving) && styles.primaryButtonDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Agree to terms and start using Anishie"
                >
                  <Text style={styles.primaryButtonText}>
                    {isSaving ? "Saving…" : "Agree & get started"}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </Pressable>
              )}
            </View>
            <Text style={styles.bottomMicrocopy}>
              {step === 2
                ? "Your agreement is stored locally for this installation."
                : "A quick setup, then you’re in."}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  keyboardArea: { flex: 1 },
  screen: { flex: 1, overflow: "hidden", backgroundColor: COLORS.background },
  ambientGlow: {
    position: "absolute",
    width: 310,
    height: 310,
    top: -145,
    right: -130,
    borderRadius: 160,
    backgroundColor: "rgba(139,92,246,0.11)",
  },
  topBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
  },
  brandLockup: { flexDirection: "row", alignItems: "center" },
  brandMark: {
    width: 29,
    height: 29,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderRadius: 10,
    backgroundColor: COLORS.violet,
  },
  brandMarkText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    fontStyle: "italic",
  },
  brandName: {
    color: COLORS.foreground,
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  plusBadge: {
    marginLeft: 7,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: "rgba(167,139,250,0.15)",
  },
  plusBadgeText: {
    color: COLORS.purple,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  stepLabel: {
    color: COLORS.mutedDark,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  progressTrack: {
    height: 2,
    marginHorizontal: 22,
    borderRadius: 2,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: COLORS.violet,
  },
  stepContent: { flex: 1 },
  welcomeContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 13,
    paddingBottom: 14,
  },
  heroOrbWrap: {
    height: 115,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  heroOrbOuter: {
    width: 94,
    height: 94,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 34,
    backgroundColor: "rgba(139,92,246,0.08)",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.14)",
    transform: [{ rotate: "-8deg" }],
  },
  heroOrbInner: {
    width: 67,
    height: 67,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: "rgba(124,92,252,0.2)",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.22)",
    transform: [{ rotate: "8deg" }],
  },
  heroOrbitDot: {
    position: "absolute",
    right: "31%",
    top: 13,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.cyan,
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  welcomeHeading: { marginTop: 2 },
  eyebrowPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: "rgba(167,139,250,0.1)",
  },
  eyebrowDot: {
    width: 5,
    height: 5,
    marginRight: 6,
    borderRadius: 3,
    backgroundColor: COLORS.purple,
  },
  eyebrowText: {
    color: COLORS.purpleLight,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
  },
  welcomeTitle: {
    color: COLORS.foreground,
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "900",
    letterSpacing: -1.5,
    marginTop: 12,
  },
  welcomeTitleAccent: { color: COLORS.purple },
  welcomeCopy: {
    maxWidth: 320,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 9,
  },
  nameCard: {
    marginTop: 21,
    padding: 13,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.045)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  nameCardHeader: { flexDirection: "row", alignItems: "center" },
  nameIcon: {
    width: 33,
    height: 33,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: "rgba(167,139,250,0.13)",
  },
  nameCardHeading: { flex: 1, marginLeft: 9 },
  nameCardTitle: { color: COLORS.foreground, fontSize: 10, fontWeight: "800" },
  nameCardHint: { color: COLORS.muted, fontSize: 8, marginTop: 3 },
  nameInput: {
    height: 43,
    marginTop: 12,
    paddingHorizontal: 12,
    borderRadius: 11,
    color: COLORS.foreground,
    fontSize: 11,
    backgroundColor: "rgba(9,9,11,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  nameInputFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 9,
  },
  localOnlyNote: { flexDirection: "row", alignItems: "center" },
  localOnlyText: {
    color: COLORS.cyan,
    fontSize: 7,
    fontWeight: "700",
    marginLeft: 5,
  },
  characterCount: { color: COLORS.mutedDark, fontSize: 7 },
  noAccountNote: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 15,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(103,232,249,0.055)",
  },
  noAccountText: {
    color: "#B6C6CC",
    fontSize: 8,
    fontWeight: "600",
    marginLeft: 7,
  },
  infoContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 25,
    paddingBottom: 15,
  },
  sectionEyebrow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionEyebrowText: {
    color: COLORS.cyan,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.3,
    marginLeft: 6,
  },
  pageTitle: {
    color: COLORS.foreground,
    fontSize: 26,
    lineHeight: 31,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  pageDescription: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 8,
  },
  infoCardStack: { marginTop: 18 },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 11,
    marginBottom: 8,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.065)",
  },
  infoIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginRight: 9,
  },
  infoCopy: { flex: 1 },
  infoTitle: {
    color: COLORS.foreground,
    fontSize: 9,
    fontWeight: "800",
    marginTop: 1,
  },
  infoBody: { color: COLORS.muted, fontSize: 8, lineHeight: 13, marginTop: 4 },
  infoIndex: {
    color: "#555564",
    fontSize: 7,
    fontWeight: "800",
    marginLeft: 5,
  },
  networkNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 11,
    marginTop: 4,
    borderRadius: 13,
    backgroundColor: "rgba(252,211,77,0.06)",
    borderWidth: 1,
    borderColor: "rgba(252,211,77,0.13)",
  },
  networkCopy: { flex: 1, marginLeft: 9 },
  networkTitle: { color: "#FDE68A", fontSize: 8, fontWeight: "800" },
  networkBody: { color: "#BDB7A0", fontSize: 7, lineHeight: 12, marginTop: 4 },
  legalContent: { flex: 1, paddingHorizontal: 22, paddingTop: 19 },
  legalHeading: { paddingBottom: 13 },
  termsScroll: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.025)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.065)",
  },
  termsScrollContent: {
    paddingHorizontal: 12,
    paddingTop: 5,
    paddingBottom: 13,
  },
  legalSection: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  legalSectionTitle: {
    color: COLORS.purpleLight,
    fontSize: 9,
    fontWeight: "800",
    marginBottom: 5,
  },
  legalSectionBody: { color: "#B4B4C0", fontSize: 8, lineHeight: 13 },
  legalVersionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  legalVersion: { color: COLORS.mutedDark, fontSize: 7, marginLeft: 5 },
  acceptRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
  },
  checkbox: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#696879",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  checkboxChecked: {
    backgroundColor: COLORS.violet,
    borderColor: COLORS.purple,
  },
  acceptText: {
    flex: 1,
    color: "#E4E4EB",
    fontSize: 8,
    lineHeight: 13,
    marginLeft: 9,
  },
  legalFooterNote: {
    color: COLORS.mutedDark,
    fontSize: 7,
    lineHeight: 11,
    marginBottom: 8,
  },
  bottomActions: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 8 : 13,
    backgroundColor: COLORS.background,
  },
  buttonRow: { flexDirection: "row", alignItems: "center" },
  backButton: {
    width: 47,
    height: 47,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  primaryButton: {
    flex: 1,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: COLORS.violet,
    shadowColor: COLORS.violet,
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  primaryButtonWithBack: { flex: 1 },
  primaryButtonDisabled: { opacity: 0.42 },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    marginRight: 9,
  },
  saveError: { color: "#FDA4AF", fontSize: 8, marginBottom: 8 },
  bottomMicrocopy: {
    color: COLORS.mutedDark,
    fontSize: 7,
    textAlign: "center",
    marginTop: 9,
  },
});
