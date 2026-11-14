import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import AnishieSplash from "./components/AnishieSplash";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [showIntro, setShowIntro] = useState<boolean>(true);

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#090A12" }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(screens)" />
      </Stack>
      {showIntro && (
        <AnishieSplash
          duration={2700}
          onFinish={() => setShowIntro(false)}
        />
      )}
    </View>
  );
}