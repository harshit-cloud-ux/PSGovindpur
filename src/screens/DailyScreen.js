import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';
export default function DailyScreen() {
  return (
    <View style={s.c}>
      <Text style={s.t}>दैनिक अपडेट</Text>
      <Text style={s.sub}>अनुपस्थिति · गृहकार्य · हाउस गतिविधि</Text>
    </View>
  );
}
const s = StyleSheet.create({
  c:   { flex: 1, backgroundColor: COLORS.cream, alignItems: 'center', justifyContent: 'center', padding: 24 },
  t:   { fontSize: 22, color: COLORS.navyPrimary, fontFamily: 'NotoSansDevanagari_700Bold', marginBottom: 8 },
  sub: { fontSize: 13, color: COLORS.inkSoft, fontFamily: 'NotoSansDevanagari_400Regular', textAlign: 'center' },
});