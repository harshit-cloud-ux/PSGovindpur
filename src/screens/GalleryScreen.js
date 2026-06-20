import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Dimensions, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLORS } from '../theme/colors';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;
const CARD_H = CARD_W * 1.15;

const THUMB = url => {
  if (!url) return null;
  // Inject Cloudinary thumbnail transform
  return url.replace('/upload/', '/upload/w_400,h_400,c_fill,q_auto,f_auto/');
};

function EventCard({ item, onPress }) {
  const [imgErr, setImgErr] = useState(false);
  const thumb = item.photos?.[0] ? THUMB(item.photos[0]) : null;

  return (
    <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={s.card}>
      <View style={s.cardInner}>
        {thumb && !imgErr ? (
          <Image
            source={{ uri: thumb }}
            style={s.cardImg}
            resizeMode="cover"
            onError={() => setImgErr(true)}
          />
        ) : (
          <LinearGradient
            colors={['#1A3A6B', '#2D5AA0']}
            style={s.cardImg}
          >
            <Ionicons name="images-outline" size={36} color="rgba(255,255,255,0.4)" />
          </LinearGradient>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(8,20,42,0.82)']}
          style={s.cardOverlay}
        />
        <View style={s.cardMeta}>
          <Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
          {item.photos?.length > 0 && (
            <View style={s.countBadge}>
              <Ionicons name="images" size={10} color={COLORS.saffronLight} />
              <Text style={s.countText}>{item.photos.length} फ़ोटो</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function GalleryScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'galleryEvents'), orderBy('order', 'asc'));
    getDocs(q)
      .then(snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setEvents(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient
        colors={['#060F24', '#0F2347', '#1A3A6B']}
        style={s.header}
      >
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerText}>
          <Text style={s.headerTitle}>फोटो गैलरी</Text>
          <Text style={s.headerSub}>कार्यक्रम · उत्सव · दैनिक जीवन</Text>
        </View>
        <View style={s.headerIcon}>
          <Ionicons name="images" size={22} color={COLORS.gold} />
        </View>
      </LinearGradient>

      {/* Tricolor strip */}
      <View style={s.tricolor}>
        <View style={[s.stripe, { backgroundColor: '#FF9933' }]} />
        <View style={[s.stripe, { backgroundColor: '#fff' }]} />
        <View style={[s.stripe, { backgroundColor: '#138808' }]} />
      </View>

      {loading ? (
        <View style={s.loader}>
          <ActivityIndicator size="large" color={COLORS.navyPrimary} />
          <Text style={s.loadingText}>गैलरी लोड हो रही है...</Text>
        </View>
      ) : events.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="images-outline" size={56} color={COLORS.border} />
          <Text style={s.emptyText}>अभी कोई कार्यक्रम नहीं है</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={s.list}
          columnWrapperStyle={s.row}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <EventCard
              item={item}
              onPress={() => navigation.navigate('GalleryEvent', { event: item })}
            />
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: COLORS.cream },
  tricolor:    { flexDirection: 'row', height: 4 },
  stripe:      { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16, gap: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerText:  { flex: 1 },
  headerTitle: { color: '#fff', fontSize: 18, fontFamily: 'NotoSansDevanagari_700Bold' },
  headerSub:   { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2, fontFamily: 'NotoSansDevanagari_400Regular' },
  headerIcon: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },

  loader:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: COLORS.inkSoft, fontSize: 13, fontFamily: 'NotoSansDevanagari_400Regular' },
  empty:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  emptyText:   { color: COLORS.inkLight, fontSize: 14, fontFamily: 'NotoSansDevanagari_400Regular' },

  list:        { padding: 16, paddingBottom: 32 },
  row:         { gap: 16, marginBottom: 16 },

  card: {
    width: CARD_W,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  cardInner:   { width: '100%', height: CARD_H },
  cardImg: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardOverlay: { ...StyleSheet.absoluteFillObject },
  cardMeta: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 10, gap: 5,
  },
  cardTitle: {
    color: '#fff', fontSize: 13,
    fontFamily: 'NotoSansDevanagari_700Bold',
    lineHeight: 18,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  countBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8,
  },
  countText: {
    color: COLORS.saffronLight, fontSize: 10,
    fontFamily: 'NotoSansDevanagari_400Regular',
  },
});