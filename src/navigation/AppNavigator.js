import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

import HomeScreen     from '../screens/HomeScreen';
import AcademicScreen from '../screens/AcademicScreen';
import DailyScreen    from '../screens/DailyScreen';
import GalleryScreen  from '../screens/GalleryScreen';
import MoreScreen     from '../screens/MoreScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home',     label: 'होम',     icon: 'home',     component: HomeScreen     },
  { name: 'Academic', label: 'शैक्षिक', icon: 'book',     component: AcademicScreen },
  { name: 'Daily',    label: 'दैनिक',   icon: 'calendar', component: DailyScreen    },
  { name: 'Gallery',  label: 'गैलरी',   icon: 'images',   component: GalleryScreen  },
  { name: 'More',     label: 'अधिक',    icon: 'grid',     component: MoreScreen     },
];

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = TABS.find(t => t.name === route.name);
        return {
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? tab.icon : `${tab.icon}-outline`}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: ({ color }) => (
            <Text style={{
              fontSize:     10,
              color,
              fontFamily:   'NotoSansDevanagari_400Regular',
              marginBottom: 2,
            }}>
              {tab.label}
            </Text>
          ),
          tabBarActiveTintColor:   COLORS.saffron,
          tabBarInactiveTintColor: COLORS.inkLight,
          tabBarStyle: {
            backgroundColor: COLORS.white,
            borderTopColor:  COLORS.border,
            borderTopWidth:  1,
            height:          62,
            paddingTop:      6,
          },
          headerShown: false,
        };
      }}
    >
      {TABS.map(tab => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  );
}