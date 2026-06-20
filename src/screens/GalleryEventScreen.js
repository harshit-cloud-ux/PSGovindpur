import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Dimensions, Linking, Modal, StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';

const { width, height } = Dimensions.get('window');
const PHOTO_W = (width - 52) / 3;

const THUMB = url =>
  url.replace('/upload/', '/upload/w_400,h_400,c_fill,q_auto,f_auto/');

const FULL = url =>
  url.replace('/upload/', '/upload/w_1200,q_auto,f_auto/');

// ── Full-screen photo viewer ─────────────────────────────────────────
function PhotoViewer({ photos, startIndex, visible, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const insets = useSafeAreaInsets();

  const prev = () => setCurrent(i => Math.max(0, i - 1));
  const next = () => setCurrent(i => Math.min(photos.length - 1, i + 1));

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <StatusBar hidden />
      <View style={v.root}>
        <Image
          source={{ uri: FULL(photos[current]) }}
          style={v.img}
          resizeMode="contain"
        />

        {/* Nav arrows */}
        {current > 0 && (
          <TouchableOpacity style={[v.arrow, v.arrowLeft]} onPress={prev}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
        )}
        {current < photos.length - 1 && (
          <TouchableOpacity style={[v.arrow, v.arrowRight]} onPress={next}>
            <Ionicons name="chevron-forward" size={28} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Close + counter */}
        <View style={[v.topBar, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={v.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={v.counter}>{current + 1} / {photos.length}</Text>
        </View>
      </View>
    </Modal>
  );
}

const v = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  img:        { width, height },
  topBar:     { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12 },
  closeBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  counter:    { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
  arrow: {
    position: 'absolute', top: '50%', marginTop: -24,
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  arrowLeft:  { left: 12 },
  arrowRight: { right: 12 },
});

// ── Video card ───────────────────────────────────────────────────────
function VideoCard({ video }) {
  const open = () => {
    Linking.openURL(video.url).catch(() =>
      Alert.alert('त्रुटि', 'वीडियो नहीं खुल सका।')
    );
  };
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={open} style={vc.card}>
      <View style={vc.iconWrap}>
        <Ionicons name="logo-youtube" size={24} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={vc.title} numberOfLines={2}>{video.title || 'वीडियो देखें'}</Text>
        <Text style={vc.sub}>YouTube पर देखें</Text>
      </View>
      <Ionicons name="open-outline" size={18} color={COLORS.inkLight} />
    </TouchableOpacity>
  );
}

const vc = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FF0000',
    alignItems: 'center', justifyContent: 'center',
  },
  title:  { fontSize: 13, fontFamily: 'NotoSansDevanagari_700Bold', color: COLORS.navyDark, lineHeight: 18 },
  sub:    { fontSize: 11, color: COLORS.inkLight, marginTop: 2 },
});

// ── Main screen ──────────────────────────────────────────────────────
export default function GalleryEventScreen({ route, navigation }) {
  const { event } = route.params;
  const insets = useSafeAreaInsets();
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerStart,   setViewerStart]   = useState(0);

  const photos = event.photos  || [];
  const videos = event.videos  || [];
  const albumUrl = event.photosAlbumUrl || null;

  const openPhoto = (index) => {
    setViewerStart(index);
    setViewerVisible(true);
  };

  // Combined data for FlatList: photos grid + videos section + album button
  // We render photos in a 3-col grid using a flat list with item types
  const PHOTO_ITEMS = photos.map((url, i) => ({ type: 'photo', url, index: i }));

  const ListHeader = () => (
    <View style={s.listHeader}>
      {/* Section: Photos */}
      {photos.length > 0 && (
        <View style={s.sectionHead}>
          <View style={s.secBar} />
          <Text style={s.sectionTitle}>फ़ोटो</Text>
          <Text style={s.sectionCount}>({photos.length})</Text>
        </View>
      )}
    </View>
  );

  const ListFooter = () => (
    <View style={s.footer}>
      {/* View all photos button */}
      {albumUrl && (
        <TouchableOpacity
          style={s.albumBtn}
          activeOpacity={0.85}
          onPress={() => Linking.openURL(albumUrl).catch(() => {})}
        >
          <Ionicons name="images" size={18} color="#fff" />
          <Text style={s.albumBtnText}>सभी फ़ोटो देखें</Text>
          <Ionicons name="open-outline" size={16} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      )}

      {/* Videos section */}
      {videos.length > 0 && (
        <View style={s.videosSection}>
          <View style={s.sectionHead}>
            <View style={s.secBar} />
            <Text style={s.sectionTitle}>वीडियो</Text>
            <Text style={s.sectionCount}>({videos.length})</Text>
          </View>
          {videos.map((v, i) => <VideoCard key={i} video={v} />)}
        </View>
      )}

      <View style={{ height: 24 }} />
    </View>
  );

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
        <Text style={s.headerTitle} numberOfLines={2}>{event.title}</Text>
      </LinearGradient>

      {/* Tricolor strip */}
      <View style={s.tricolor}>
        <View style={[s.stripe, { backgroundColor: '#FF9933' }]} />
        <View style={[s.stripe, { backgroundColor: '#fff' }]} />
        <View style={[s.stripe, { backgroundColor: '#138808' }]} />
      </View>

      {/* Photo grid */}
      {photos.length === 0 && videos.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="images-outline" size={56} color={COLORS.border} />
          <Text style={s.emptyText}>अभी कोई सामग्री नहीं है</Text>
        </View>
      ) : (
        <FlatList
          data={PHOTO_ITEMS}
          keyExtractor={item => String(item.index)}
          numColumns={3}
          contentContainerStyle={s.photoList}
          columnWrapperStyle={s.photoRow}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => openPhoto(item.index)}
              style={s.photoThumb}
            >
              <Image
                source={{ uri: THUMB(item.url) }}
                style={s.photoImg}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Full-screen viewer */}
      {viewerVisible && (
        <PhotoViewer
          photos={photos}
          startIndex={viewerStart}
          visible={viewerVisible}
          onClose={() => setViewerVisible(false)}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: COLORS.cream },
  tricolor:   { flexDirection: 'row', height: 4 },
  stripe:     { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16, gap: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  headerTitle: {
    flex: 1, color: '#fff', fontSize: 16,
    fontFamily: 'NotoSansDevanagari_700Bold', lineHeight: 22,
  },

  listHeader:   { paddingHorizontal: 16, paddingTop: 16 },
  sectionHead:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  secBar:       { width: 4, height: 20, backgroundColor: COLORS.saffron, borderRadius: 2 },
  sectionTitle: { fontSize: 16, fontFamily: 'NotoSansDevanagari_700Bold', color: COLORS.navyPrimary },
  sectionCount: { fontSize: 13, color: COLORS.inkLight, fontFamily: 'NotoSansDevanagari_400Regular' },

  photoList:    { paddingHorizontal: 16 },
  photoRow:     { gap: 4, marginBottom: 4 },
  photoThumb: {
    width: PHOTO_W, height: PHOTO_W,
    borderRadius: 8, overflow: 'hidden',
    backgroundColor: COLORS.border,
  },
  photoImg:     { width: '100%', height: '100%' },

  footer:        { paddingHorizontal: 16, paddingTop: 16 },
  albumBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.navyPrimary,
    borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20,
    marginBottom: 24,
    elevation: 4, shadowColor: COLORS.navyDark, shadowOpacity: 0.25, shadowRadius: 8,
  },
  albumBtnText: {
    color: '#fff', fontSize: 14,
    fontFamily: 'NotoSansDevanagari_700Bold',
  },
  videosSection: { marginBottom: 8 },

  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  emptyText:  { color: COLORS.inkLight, fontSize: 14, fontFamily: 'NotoSansDevanagari_400Regular' },
});