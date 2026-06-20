import { AuthProvider } from './src/context/AuthContext';
import React, { useCallback, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  NotoSansDevanagari_400Regular,
  NotoSansDevanagari_700Bold,
} from '@expo-google-fonts/noto-sans-devanagari';
import { TiroDevanagariHindi_400Regular, TiroDevanagariHindi_400Regular_Italic } from '@expo-google-fonts/tiro-devanagari-hindi';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';
import { navigationRef } from './src/navigation/rootNavigation';
import { COLORS } from './src/theme/colors';
import AnimatedSplash from './src/components/AnimatedSplash';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    NotoSansDevanagari_400Regular,
    NotoSansDevanagari_700Bold,
    TiroDevanagariHindi_400Regular,
    TiroDevanagariHindi_400Regular_Italic,
  });
  const [splashDone, setSplashDone] = useState(false);

  // Hide the native splash as soon as JS can paint, so the native screen hands
  // off seamlessly to the animated photo splash (both share the cream background).
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <SafeAreaProvider>
          <StatusBar backgroundColor={COLORS.navyPrimary} barStyle="light-content" />
          {splashDone ? (
            <NavigationContainer ref={navigationRef}>
              <AppNavigator />
            </NavigationContainer>
          ) : (
            <AnimatedSplash onFinish={() => setSplashDone(true)} />
          )}
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}