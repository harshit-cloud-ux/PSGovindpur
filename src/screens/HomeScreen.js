import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';

const { width } = Dimensions.get('window');

const QUICK_ACTIONS = [
  { icon: 'time',          label: 'समय-सारणी',   color: COLORS.navyPrimary, tab: 'Academic' },
  { icon: 'stats-chart',   label: 'परीक्षा अंक', color: COLORS.saffron,     tab: 'Academic' },
  { icon: 'people',        label: 'अनुपस्थित',   color: COLORS.green,       tab: 'Daily'    },
  { icon: 'pencil',        label: 'गृहकार्य',    color: '#8B5CF6',          tab: 'Daily'    },
  { icon: 'images',        label: 'गैलरी',       color: '#EC4899',          tab: 'Gallery'  },
  { icon: 'trophy',        label: 'हाउस',        color: '#F59E0B',          tab: 'Daily'    },
  { icon: 'videocam',      label: 'वीडियो',      color: '#0EA5E9',          tab: 'Academic' },
  { icon: 'document-text', label: 'ई-पुस्तकें', color: '#10B981',          tab: 'Academic' },
];

const SCHEMES = ['🇮🇳 निपुण भारत', '📚 समग्र शिक्षा', '🏫 NEP 2020'];

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const today  = new Date().toLocaleDateString('hi-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* Indian flag tricolor stripe at very top */}
      <View style={styles.tricolor}>
        <View style={[styles.stripe, { backgroundColor: COLORS.tricolorSaffron }]} />
        <View style={[styles.stripe, { backgroundColor: '#FFFFFF' }]} />
        <View style={[styles.stripe, { backgroundColor: COLORS.tricolorGreen }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Government navy gradient header */}
        <LinearGradient
          colors={[COLORS.navyDark, COLORS.navyPrimary, COLORS.navyLight]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerRow}>
            <View style={styles.emblem}>
              <Ionicons name="school" size={32} color={COLORS.gold} />
            </View>
            <View style={styles.titleBlock}>
              <Text style={styles.titleSmall}>प्राथमिक विद्यालय</Text>
              <Text style={styles.titleBig}>गोविंदपुर</Text>
              <Text style={styles.titleSub}>P.S. Govindpur · उत्तर प्रदेश</Text>
            </View>
            <View style={styles.upBadge}>
              <Text style={styles.upText}>UP</Text>
              <Text style={styles.upSub}>सरकार</Text>
            </View>
          </View>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={11} color={COLORS.saffronLight} />
            <Text style={styles.dateText}> {today}</Text>
          </View>
        </LinearGradient>

        {/* Scheme badges */}
        <View style={styles.badgeRow}>
          {SCHEMES.map((s, i) => (
            <View key={i} style={styles.badge}>
              <Text style={styles.badgeText}>{s}</Text>
            </View>
          ))}
        </View>

        {/* PM / CM row — replace icons with real photos in Phase 2 */}
        <View style={styles.leaderRow}>
          <View style={styles.leaderCard}>
            <View style={styles.leaderPhoto}>
              <Ionicons name="person" size={30} color={COLORS.navyLight} />
            </View>
            <Text style={styles.leaderName}>श्री नरेन्द्र मोदी</Text>
            <Text style={styles.leaderRole}>प्रधानमंत्री, भारत</Text>
          </View>
          <View style={styles.divider}>
            <View style={styles.ashokaCircle}>
              <Text style={{ fontSize: 20 }}>⚙️</Text>
            </View>
          </View>
          <View style={styles.leaderCard}>
            <View style={styles.leaderPhoto}>
              <Ionicons name="person" size={30} color={COLORS.navyLight} />
            </View>
            <Text style={styles.leaderName}>श्री योगी आदित्यनाथ</Text>
            <Text style={styles.leaderRole}>मुख्यमंत्री, उ.प्र.</Text>
          </View>
        </View>

        {/* Quick action cards */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View style={styles.accent} />
            <Text style={styles.sectionTitle}>त्वरित पहुँच</Text>
          </View>
          <View style={styles.grid}>
            {QUICK_ACTIONS.map((a, i) => (
              <TouchableOpacity
                key={i}
                style={styles.card}
                onPress={() => navigation.navigate(a.tab)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconBox, { backgroundColor: a.color + '18' }]}>
                  <Ionicons name={a.icon} size={22} color={a.color} />
                </View>
                <Text style={styles.cardLabel} numberOfLines={2}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Registration CTA button */}
        <View style={styles.section}>
          <TouchableOpacity
            onPress={() => navigation.navigate('More')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[COLORS.green, COLORS.greenDark]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.cta}
            >
              <Ionicons name="person-add" size={20} color="#fff" />
              <Text style={styles.ctaText}>  नए छात्र का पंजीकरण करें  →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>
    </View>
  );
}

const CARD_W = (width - 48) / 4;

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.cream },
  tricolor:     { flexDirection: 'row', height: 5 },
  stripe:       { flex: 1 },
  header:       { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12 },
  headerRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  emblem: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.gold, marginRight: 12,
  },
  titleBlock:   { flex: 1 },
  titleSmall:   { color: COLORS.saffronLight, fontSize: 11, fontFamily: 'NotoSansDevanagari_400Regular' },
  titleBig:     { color: '#fff', fontSize: 22, fontFamily: 'NotoSansDevanagari_700Bold', lineHeight: 28 },
  titleSub:     { color: '#A8C4E8', fontSize: 10, marginTop: 1 },
  upBadge: {
    width: 42, height: 42, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  upText:       { color: COLORS.gold, fontWeight: '800', fontSize: 14 },
  upSub:        { color: '#A8C4E8', fontSize: 7 },
  dateRow:      { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)', paddingTop: 8 },
  dateText:     { color: COLORS.saffronLight, fontSize: 10, fontFamily: 'NotoSansDevanagari_400Regular' },
  badgeRow:     { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, gap: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  badge:        { backgroundColor: '#FFF3E0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:    { fontSize: 10, color: COLORS.saffronDark, fontWeight: '600' },
  leaderRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16,
    borderRadius: 12, padding: 14, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  leaderCard:   { flex: 1, alignItems: 'center' },
  leaderPhoto: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: COLORS.cream, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.navyLight, marginBottom: 6,
  },
  leaderName:   { fontSize: 10, color: COLORS.ink, fontFamily: 'NotoSansDevanagari_700Bold', textAlign: 'center' },
  leaderRole:   { fontSize: 9, color: COLORS.inkSoft, fontFamily: 'NotoSansDevanagari_400Regular', textAlign: 'center', marginTop: 1 },
  divider:      { alignItems: 'center', paddingHorizontal: 8 },
  ashokaCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.navyPrimary, alignItems: 'center', justifyContent: 'center' },
  section:      { paddingHorizontal: 16, paddingTop: 20 },
  sectionHead:  { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  accent:       { width: 4, height: 20, backgroundColor: COLORS.saffron, borderRadius: 2, marginRight: 10 },
  sectionTitle: { fontSize: 15, fontFamily: 'NotoSansDevanagari_700Bold', color: COLORS.navyPrimary },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: CARD_W, backgroundColor: '#fff', borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 4, alignItems: 'center',
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
  },
  iconBox:      { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  cardLabel:    { fontSize: 10, color: COLORS.ink, textAlign: 'center', fontFamily: 'NotoSansDevanagari_400Regular', lineHeight: 13 },
  cta:          { borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15 },
  ctaText:      { color: '#fff', fontSize: 14, fontFamily: 'NotoSansDevanagari_700Bold' },
});