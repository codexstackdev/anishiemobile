import { useEffect, useRef, useState } from "react";
import { Animated, StatusBar, StyleSheet, View } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { NavigationBar } from "expo-navigation-bar";
import {
  addUser,
  getUser,
  recordAppOpen,
  subscribeUser,
  User,
} from "@/hooks/userActions";
import Intro, { IntroProfile } from "../components/Intro";
import { useOnline } from "@/hooks/useOnline";
import OfflineBanner from "../components/OfflineBanner";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

type AnimatedTabIconProps = {
  focused: boolean;
  color: string;
  size: number;
  activeName: IoniconName;
  inactiveName: IoniconName;
};

function AnimatedTabIcon({
  focused,
  color,
  size,
  activeName,
  inactiveName,
}: AnimatedTabIconProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const indicatorOpacity = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1.14 : 1,
        friction: 6,
        tension: 110,
        useNativeDriver: true,
      }),
      Animated.timing(indicatorOpacity, {
        toValue: focused ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, indicatorOpacity, scale]);

  return (
    <View style={styles.iconSlot}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons
          name={focused ? activeName : inactiveName}
          size={size}
          color={color}
        />
      </Animated.View>
      <Animated.View
        style={[styles.activeIndicator, { opacity: indicatorOpacity }]}
      />
    </View>
  );
}

export default function RootLayout() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const online = useOnline();
  useEffect(() => {
    const sync = () => {
      getUser().then(setUser);
    };
    recordAppOpen().then(sync);
    return subscribeUser(sync);
  }, []);

  const handleComplete = async (profile: IntroProfile) => {
    const created = await addUser(profile.displayName, {
      termsVersion: profile.termsVersion,
      acceptedAt: profile.acceptedAt,
    });
    if (!created) throw new Error("save failed");
    setUser(created);
  };

  if (user === undefined) return null;
  if(!online) return <OfflineBanner/>
  if (user === null) return <Intro onComplete={handleComplete} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#B9A2FF",
        tabBarInactiveTintColor: "#77798D",
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarStyle: styles.tabBar,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color, size }) => (
            <AnimatedTabIcon
              focused={focused}
              color={String(color)}
              size={size}
              activeName="home"
              inactiveName="home-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ focused, color, size }) => (
            <AnimatedTabIcon
              focused={focused}
              color={String(color)}
              size={size}
              activeName="compass"
              inactiveName="compass-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="Watchlist"
        options={{
          title: "My List",
          tabBarIcon: ({ focused, color, size }) => (
            <AnimatedTabIcon
              focused={focused}
              color={String(color)}
              size={size}
              activeName="bookmark"
              inactiveName="bookmark-outline"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 66,
    paddingTop: 7,
    paddingBottom: 5,
    backgroundColor: "rgba(15, 16, 27, 0.97)",
    borderTopColor: "rgba(255, 255, 255, 0.09)",
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 0,
  },
  tabItem: {
    paddingTop: 1,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.2,
    marginTop: 2,
  },
  iconSlot: {
    width: 38,
    height: 29,
    alignItems: "center",
    justifyContent: "center",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -3,
    width: 12,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#B9A2FF",
  },
});
