import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import React, { useLayoutEffect } from 'react';
import { Colors } from '@/constants/theme';
import { ProgressProvider } from '@/lib/progress';

SplashScreen.preventAutoHideAsync();

const navTheme = {
  dark: true,
  colors: {
    primary: Colors.accent,
    background: Colors.background,
    card: Colors.background,
    text: Colors.text,
    border: Colors.border,
    notification: Colors.amber,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '800' as const },
  },
};

export default function RootLayout() {
  useLayoutEffect(() => {
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  return (
    <ProgressProvider>
      <ThemeProvider value={navTheme as unknown as typeof DarkTheme}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: Colors.background },
            headerTintColor: Colors.text,
            headerTitleStyle: { fontWeight: '700' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: Colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="module/[id]" options={{ title: 'Module', headerBackTitle: 'Retour' }} />
          <Stack.Screen name="quiz/[id]" options={{ title: 'Quiz', headerBackTitle: 'Retour' }} />
          <Stack.Screen name="lab/[id]" options={{ title: 'Atelier', headerBackTitle: 'Retour' }} />
        </Stack>
      </ThemeProvider>
    </ProgressProvider>
  );
}
