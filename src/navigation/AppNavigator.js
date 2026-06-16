import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';

import HomeScreen from '../screens/HomeScreen';

const Stack = createNativeStackNavigator();

function HomeWithTab() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1 }}>
      <HomeScreen />
      <View style={[styles.tabBar, { paddingBottom: insets.bottom || 10 }]}>
        <View style={styles.tabCenter}>
          <TouchableOpacity style={styles.homeBtn} activeOpacity={0.85}>
            <Ionicons name="home" size={24} color={COLORS.saffron} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeWithTab} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
  backgroundColor: COLORS.navyPrimary,
  paddingTop: 8,
  alignItems: 'center',
  justifyContent: 'center',
},
  tabCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 6,
  },
});