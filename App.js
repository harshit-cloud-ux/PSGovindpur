import { AuthProvider } from './src/context/AuthContext';
import React, { useCallback } from 'react';
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

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    NotoSansDevanagari_400Regular,
    NotoSansDevanagari_700Bold,
    TiroDevanagariHindi_400Regular,
    TiroDevanagariHindi_400Regular_Italic,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <SafeAreaProvider>
          <StatusBar backgroundColor={COLORS.navyPrimary} barStyle="light-content" />
          <NavigationContainer ref={navigationRef}>
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}
