import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import { goHome } from './rootNavigation';

import HomeScreen    from '../screens/HomeScreen';
import AboutScreen   from '../screens/AboutScreen';
import SchoolScreen  from '../screens/SchoolScreen';
import StaffScreen   from '../screens/StaffScreen';
import CalendarScreen from '../screens/CalendarScreen';
import HolidayScreen from '../screens/HolidayScreen';
import EbooksVideosScreen from '../screens/EbooksVideosScreen';

const Stack = createNativeStackNavigator();

function HomeBar() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || 10 }]}>
      <View style={styles.tabCenter}>
        <TouchableOpacity style={styles.homeBtn} activeOpacity={0.85} onPress={goHome}>
          <Ionicons name="home" size={24} color={COLORS.saffron} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="Home"     component={HomeScreen} />
          <Stack.Screen name="About"    component={AboutScreen} />
          <Stack.Screen name="School"   component={SchoolScreen} />
          <Stack.Screen name="Staff"    component={StaffScreen} />
          <Stack.Screen name="Calendar" component={CalendarScreen} />
          <Stack.Screen name="Holiday"  component={HolidayScreen} />
          <Stack.Screen name="EbooksVideos" component={EbooksVideosScreen} />
        </Stack.Navigator>
      </View>
      <HomeBar />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar:   { backgroundColor: COLORS.navyPrimary, paddingTop: 8, alignItems: 'center', justifyContent: 'center' },
  tabCenter:{ alignItems: 'center', justifyContent: 'center' },
  homeBtn:  { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 6 },
});
