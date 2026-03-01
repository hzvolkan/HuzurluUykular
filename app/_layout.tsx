import Colors from "@/constants/colors";
import { SleepProvider } from "@/providers/SleepProvider";
import "@/utils/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();
const ONBOARDING_KEY = '@sleep_app_onboarding_done';

function RootLayoutNav() {
  const router = useRouter();
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const done = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (!done) {
          router.replace('/onboarding');
        }
      } catch (e) {
        console.log('[Layout] Onboarding check failed:', e);
      } finally {
        setTimeout(() => {
          SplashScreen.hideAsync();
        }, 2000);
      }
    };
    checkOnboarding();
  }, [router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SleepProvider>
          <StatusBar style="light" />
          <RootLayoutNav />
        </SleepProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
