import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdminBanner() {
  return (
    <LinearGradient
      colors={['#C2410C', '#E07B39']}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      style={s.bar}
    >
      <Ionicons name="shield-checkmark" size={14} color="#fff" />
      <Text style={s.text}>व्यवस्थापक मोड  ·  Admin Mode</Text>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 6, paddingHorizontal: 12,
  },
  text: {
    color: '#fff', fontSize: 11,
    fontFamily: 'NotoSansDevanagari_700Bold', letterSpacing: 0.5,
  },
});