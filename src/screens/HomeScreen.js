import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Dimensions, Animated, Image, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';

const { width } = Dimensions.get('window');
const CARD_W    = (width - 44) / 2;

// ── Image assets ──
const IMG = {
  pm: require('../assets/images/pm.jpg'),
  cm: require('../assets/images/cm.jpg'),
  patriotic: [
    require('../assets/images/patriotic1.jpg'),
    require('../assets/images/patriotic2.jpg'),
    require('../assets/images/patriotic3.jpg'),
  ],
};

const QUICK_ACTIONS = [
  { icon: 'time',          label: 'समय-सारणी',   gradient: ['#1A3A6B','#2D5AA0'], tab: 'Academic' },
  { icon: 'stats-chart',   label: 'परीक्षा अंक', gradient: ['#C2410C','#E07B39'], tab: 'Academic' },
  { icon: 'people',        label: 'अनुपस्थित',   gradient: ['#138808','#1A9C0A'], tab: 'Daily'    },
  { icon: 'pencil',        label: 'गृहकार्य',    gradient: ['#6D28D9','#8B5CF6'], tab: 'Daily'    },
  { icon: 'images',        label: 'गैलरी',       gradient: ['#BE185D','#EC4899'], tab: 'Gallery'  },
  { icon: 'trophy',        label: 'हाउस',        gradient: ['#B45309','#F59E0B'], tab: 'Daily'    },
  { icon: 'videocam',      label: 'वीडियो',      gradient: ['#0369A1','#0EA5E9'], tab: 'Academic' },
  { icon: 'document-text', label: 'ई-पुस्तकें', gradient: ['#065F46','#059669'], tab: 'Academic' },
];

const TICKER = [
  { text: 'निपुण भारत मिशन',            img: require('../assets/images/ticker1.png') },
  { text: 'समग्र शिक्षा अभियान',        img: require('../assets/images/ticker2.png') },
  { text: 'राष्ट्रीय शिक्षा नीति 2020',  emoji: '📚' },
  { text: 'बेसिक शिक्षा परिषद, उ.प्र.',   emoji: '✏️' },
  { text: 'प्रेरणा पोर्टल',              img: require('../assets/images/ticker5.png') },
  { text: 'दीक्षा ऐप',                  img: require('../assets/images/ticker6.png') },
];

// ── Entrance animation ──
function FadeIn({ children, delay = 0, style, from = 30 }) {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(from)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 600, delay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, delay, damping: 14, stiffness: 90, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

// ── Ticker ──
function Ticker() {
  const x      = useRef(new Animated.Value(0)).current;
  const ITEM_W = 260;
  const total  = TICKER.length * ITEM_W;
  useEffect(() => {
    Animated.loop(
      Animated.timing(x, { toValue: -total, duration: TICKER.length * 3400, useNativeDriver: true })
    ).start();
  }, []);
  return (
    <View style={tk.wrap}>
      <Animated.View style={[tk.row, { transform: [{ translateX: x }] }]}>
        {[...TICKER, ...TICKER].map((item, i) => (
          <View key={i} style={[tk.item, { width: ITEM_W }]}>
            {item.img
              ? <Image source={item.img} style={tk.icon} resizeMode="contain" />
              : <Text style={tk.emoji}>{item.emoji}</Text>}
            <Text style={tk.text}>{item.text}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const tk = StyleSheet.create({
  wrap:  { backgroundColor: '#0A1628', paddingVertical: 11, overflow: 'hidden' },
  row:   { flexDirection: 'row' },
  item:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6 },
  icon:  { width: 26, height: 26, marginRight: 9, borderRadius: 4, backgroundColor: '#fff' },
  emoji: { fontSize: 22, marginRight: 9 },
  text:  { color: '#FFE8CC', fontSize: 15, fontFamily: 'NotoSansDevanagari_700Bold' },
});

// ── Pulsing ring ──
function PulsingRing({ delay = 0 }) {
  const scale   = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(scale, { toValue: 1.7, duration: 1600, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1,   duration: 0,    useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(opacity, { toValue: 0,   duration: 1600, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.5, duration: 0,    useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return <Animated.View style={[s.ring, { transform: [{ scale }], opacity }]} />;
}

// ── Rotating patriotic banner (smooth synced cycling) ──
function PatrioticBanner() {
  const [idx, setIdx] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const imgs = IMG.patriotic;
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fade, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => {
        setIdx(p => (p + 1) % imgs.length);
        Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);
  return (
    <View style={s.bannerWrap}>
      <Animated.Image
        source={imgs[idx]}
        style={[s.bannerImg, { opacity: fade }]}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(8,20,42,0.1)','rgba(8,20,42,0.55)']}
        style={StyleSheet.absoluteFill}
      />
      <View style={s.bannerCaption}>
        <Text style={s.bannerText}>🇮🇳  जय हिन्द  ·  जय भारत  ·  सत्यमेव जयते</Text>
      </View>
      <View style={s.dots}>
        {imgs.map((_, i) => (
          <View key={i} style={[s.dot, i === idx && s.dotActive]} />
        ))}
      </View>
    </View>
  );
}

// ── Action card with press spring ──
function ActionCard({ action, onPress, delay }) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn  = () => Animated.spring(scale, { toValue: 0.94, useNativeDriver: true }).start();
  const pressOut = () => Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  return (
    <FadeIn delay={delay}>
      <Pressable onPressIn={pressIn} onPressOut={pressOut} onPress={onPress}>
        <Animated.View style={[s.actionBtn, { transform: [{ scale }] }]}>
          <LinearGradient
            colors={action.gradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.actionGrad}
          >
            <View style={s.actionSheen} />
            <View style={s.actionIcon}>
              <Ionicons name={action.icon} size={30} color="#fff" />
            </View>
            <Text style={s.actionLbl}>{action.label}</Text>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </FadeIn>
  );
}

// ── Main ──
export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const today  = new Date().toLocaleDateString('hi-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>

      {/* Tricolor stripe */}
      <View style={s.tricolor}>
        <View style={[s.stripe, { backgroundColor: '#FF9933' }]} />
        <View style={[s.stripe, { backgroundColor: '#fff'    }]} />
        <View style={[s.stripe, { backgroundColor: '#138808' }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces>

        {/* HERO */}
        <LinearGradient
          colors={['#060F24','#0F2347','#1A3A6B','#1E4D8C']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <FadeIn from={0} style={s.emblemWrap}>
            <PulsingRing delay={0} />
            <PulsingRing delay={700} />
            <View style={s.emblem}>
              <Ionicons name="school" size={44} color={COLORS.gold} />
            </View>
          </FadeIn>

          <FadeIn delay={250}>
            <Text style={s.heroLabel}>प्राथमिक विद्यालय</Text>
            <Text style={s.heroName}>गोविंदपुर</Text>
            <Text style={s.heroSub}>P.S. Govindpur  ·  उत्तर प्रदेश  ·  स्थापना 1962</Text>
          </FadeIn>

          <FadeIn delay={430} style={s.pills}>
            {[['412','छात्र'],['14','शिक्षक'],['94%','उपस्थिति']].map(([n,l]) => (
              <View key={l} style={s.pill}>
                <Text style={s.pillNum}>{n}</Text>
                <Text style={s.pillLbl}>{l}</Text>
              </View>
            ))}
          </FadeIn>

          <FadeIn delay={580} style={s.datePill}>
            <Ionicons name="calendar-outline" size={12} color={COLORS.saffronLight} />
            <Text style={s.dateText}>  {today}</Text>
          </FadeIn>
        </LinearGradient>

        {/* Ticker */}
        <Ticker />

        {/* Patriotic banner */}
        <FadeIn delay={150} style={s.bannerOuter}>
          <PatrioticBanner />
        </FadeIn>

        {/* PM / CM card */}
        <FadeIn delay={250} style={s.leaderWrap}>
          <LinearGradient
            colors={['#060F24','#0F2347','#1A3A6B']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.leaderCard}
          >
            <Text style={s.leaderHeading}>🇮🇳  राष्ट्रीय नेतृत्व</Text>
            <View style={s.leaderRow}>
              <View style={s.leader}>
                <View style={s.photoFrame}>
                  <Image source={IMG.pm} style={[s.photoImg, { transform: [{ scale: 1.18 }, { translateY: 6 }] }]} />
                </View>
                <Text style={s.leaderName}>श्री नरेन्द्र मोदी</Text>
                <Text style={s.leaderRole}>प्रधानमंत्री, भारत</Text>
              </View>
              <View style={s.leaderSep}>
                <View style={s.sepLine} />
                <View style={s.sepBadge}><Text style={{ fontSize: 22 }}>🔱</Text></View>
                <View style={s.sepLine} />
              </View>
              <View style={s.leader}>
                <View style={s.photoFrame}>
                  <Image source={IMG.cm} style={s.photoImg} />
                </View>
                <Text style={s.leaderName}>श्री योगी आदित्यनाथ</Text>
                <Text style={s.leaderRole}>मुख्यमंत्री, उ.प्र.</Text>
              </View>
            </View>
          </LinearGradient>
        </FadeIn>

        {/* QUICK ACTIONS */}
        <View style={s.section}>
          <View style={s.secHead}>
            <View style={s.secBar} />
            <Text style={s.secTitle}>त्वरित पहुँच</Text>
          </View>
          <View style={s.grid}>
            {QUICK_ACTIONS.map((a, i) => (
              <ActionCard
                key={i}
                action={a}
                delay={80 + i * 70}
                onPress={() => navigation.navigate(a.tab)}
              />
            ))}
          </View>
        </View>

        {/* CTA */}
        <FadeIn delay={760} style={s.section}>
          <TouchableOpacity onPress={() => navigation.navigate('More')} activeOpacity={0.85}>
            <LinearGradient
              colors={['#0A6B0A','#138808','#1AA81A']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.cta}
            >
              <View style={s.ctaIcon}>
                <Ionicons name="person-add" size={24} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.ctaMain}>नए छात्र का पंजीकरण करें</Text>
                <Text style={s.ctaSub}>सत्र 2026-27  ·  प्रवेश अभी खुला है</Text>
              </View>
              <Ionicons name="arrow-forward-circle" size={28} color="rgba(255,255,255,0.85)" />
            </LinearGradient>
          </TouchableOpacity>
        </FadeIn>

        <View style={{ height: 36 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: '#FBF3E4' },
  tricolor:  { flexDirection: 'row', height: 5 },
  stripe:    { flex: 1 },

  // Hero
  hero:      { paddingHorizontal: 20, paddingTop: 36, paddingBottom: 28, alignItems: 'center', overflow: 'hidden' },
  emblemWrap:{ width: 96, height: 96, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  ring:      { position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: COLORS.gold },
  emblem: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.gold, elevation: 8,
  },
  heroLabel: { color: COLORS.saffronLight, fontSize: 14, fontFamily: 'NotoSansDevanagari_400Regular', textAlign: 'center', letterSpacing: 1 },
  heroName:  { color: '#fff', fontSize: 44, fontFamily: 'NotoSansDevanagari_700Bold', textAlign: 'center', lineHeight: 54, marginTop: 2 },
  heroSub:   { color: '#8EB4D8', fontSize: 11, textAlign: 'center', marginTop: 6 },

  pills:     { flexDirection: 'row', gap: 10, marginTop: 20 },
  pill: {
    alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  pillNum:   { color: COLORS.gold, fontSize: 17, fontWeight: '800' },
  pillLbl:   { color: '#8EB4D8', fontSize: 10, fontFamily: 'NotoSansDevanagari_400Regular', marginTop: 1 },

  datePill: {
    flexDirection: 'row', alignItems: 'center', marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  dateText:  { color: COLORS.saffronLight, fontSize: 11, fontFamily: 'NotoSansDevanagari_400Regular' },

  // Patriotic banner
  bannerOuter: { marginHorizontal: 16, marginTop: 18 },
  bannerWrap: {
    height: 150, borderRadius: 16, overflow: 'hidden',
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, shadowRadius: 8, backgroundColor: '#0A1628',
  },
  bannerImg:    { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  bannerCaption:{ position: 'absolute', bottom: 12, left: 14, right: 14 },
  bannerText: {
    color: '#fff', fontSize: 13, fontFamily: 'NotoSansDevanagari_700Bold',
    textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
  dots:      { position: 'absolute', top: 12, right: 12, flexDirection: 'row', gap: 5 },
  dot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: COLORS.gold, width: 16 },

  // Leaders
  leaderWrap: {
    marginHorizontal: 16, marginTop: 14, borderRadius: 18, overflow: 'hidden',
    elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, shadowRadius: 10,
  },
  leaderCard:    { padding: 20 },
  leaderHeading: { color: COLORS.saffronLight, fontSize: 13, fontFamily: 'NotoSansDevanagari_700Bold', textAlign: 'center', marginBottom: 18, letterSpacing: 1 },
  leaderRow:     { flexDirection: 'row', alignItems: 'center' },
  leader:        { flex: 1, alignItems: 'center' },
  photoFrame: {
    width: 90, height: 90, borderRadius: 45, marginBottom: 10,
    borderWidth: 3, borderColor: COLORS.gold, overflow: 'hidden',
    backgroundColor: '#0A1628',
    elevation: 6, shadowColor: COLORS.gold, shadowOpacity: 0.4, shadowRadius: 8,
  },
  photoImg:      { width: '100%', height: '100%', resizeMode: 'cover' },
  leaderName:    { color: '#fff', fontSize: 12, fontFamily: 'NotoSansDevanagari_700Bold', textAlign: 'center', lineHeight: 17 },
  leaderRole:    { color: '#C9DCF0', fontSize: 10, fontFamily: 'NotoSansDevanagari_400Regular', textAlign: 'center', marginTop: 3 },
  leaderSep:     { alignItems: 'center', paddingHorizontal: 6 },
  sepLine:       { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' },
  sepBadge: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', marginVertical: 8,
  },

  // Section
  section:   { paddingHorizontal: 16, paddingTop: 26 },
  secHead:   { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  secBar:    { width: 4, height: 24, backgroundColor: COLORS.saffron, borderRadius: 2, marginRight: 12 },
  secTitle:  { fontSize: 18, fontFamily: 'NotoSansDevanagari_700Bold', color: COLORS.navyPrimary },

  // Grid
  grid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionBtn: {
    width: CARD_W, borderRadius: 16, overflow: 'hidden',
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18, shadowRadius: 8,
  },
  actionGrad:  { padding: 18, minHeight: 118, justifyContent: 'flex-end', position: 'relative' },
  actionSheen: { position: 'absolute', top: 0, left: 0, right: 0, height: 48, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16 },
  actionIcon: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  actionLbl:  { color: '#fff', fontSize: 14, fontFamily: 'NotoSansDevanagari_700Bold', lineHeight: 20 },

  // CTA
  cta: {
    borderRadius: 16, flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14,
    elevation: 6, shadowColor: COLORS.green, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10,
  },
  ctaIcon: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  ctaMain: { color: '#fff', fontSize: 15, fontFamily: 'NotoSansDevanagari_700Bold' },
  ctaSub:  { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontFamily: 'NotoSansDevanagari_400Regular', marginTop: 2 },
});