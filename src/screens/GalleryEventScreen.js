import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Dimensions, Linking, Modal, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { uploadToCloudinary, deleteFromCloudinary, CLOUDINARY } from '../config/cloudinary';
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

// ── YouTube helpers ──────────────────────────────────────────────────
// Pull the 11-char video id out of any common YouTube URL shape.
function youtubeId(url = '') {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([A-Za-z0-9_-]{11})/
  );
  return m ? m[1] : null;
}
const ytThumb = id => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

// ── Video card (real YouTube thumbnail + play overlay) ───────────────
function VideoCard({ video }) {
  const [thumbErr, setThumbErr] = useState(false);
  const id = youtubeId(video.url);

  const open = () => {
    Linking.openURL(video.url).catch(() =>
      Alert.alert('त्रुटि', 'वीडियो नहीं खुल सका।')
    );
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={open} style={vc.card}>
      <View style={vc.thumbWrap}>
        {id && !thumbErr ? (
          <Image
            source={{ uri: ytThumb(id) }}
            style={vc.thumb}
            resizeMode="cover"
            onError={() => setThumbErr(true)}
          />
        ) : (
          <LinearGradient colors={['#1A3A6B', '#2D5AA0']} style={vc.thumb} />
        )}
        {/* dark gradient + play button */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={vc.playBtn}>
          <Ionicons name="play" size={24} color="#fff" style={{ marginLeft: 2 }} />
        </View>
        {/* title pinned bottom-left over the thumbnail */}
        {!!video.title && (
          <Text style={vc.thumbTitle} numberOfLines={2}>{video.title}</Text>
        )}
        {/* YouTube tag top-right */}
        <View style={vc.ytTag}>
          <Ionicons name="logo-youtube" size={12} color="#fff" />
          <Text style={vc.ytTagTxt}>YouTube</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const vc = StyleSheet.create({
  card: {
    borderRadius: 14, marginBottom: 12, overflow: 'hidden',
    backgroundColor: '#000',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8,
  },
  thumbWrap: { width: '100%', aspectRatio: 16 / 9, justifyContent: 'center', alignItems: 'center' },
  thumb:     { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  playBtn: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: 'rgba(255,0,0,0.92)',
    alignItems: 'center', justifyContent: 'center',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6,
  },
  thumbTitle: {
    position: 'absolute', bottom: 8, left: 10, right: 10,
    color: '#fff', fontSize: 12, fontFamily: 'NotoSansDevanagari_700Bold',
    lineHeight: 16,
    textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
  ytTag: {
    position: 'absolute', top: 8, right: 8,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6,
  },
  ytTagTxt: { color: '#fff', fontSize: 9, fontWeight: '700' },
});

// ── Main screen ──────────────────────────────────────────────────────
export default function GalleryEventScreen({ route, navigation }) {
  const { event } = route.params;
  const { isAdmin } = useAuth();
  const insets = useSafeAreaInsets();
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerStart,   setViewerStart]   = useState(0);

  const [photos, setPhotos] = useState(event.photos || []);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  const videos = event.videos  || [];
  const albumUrl = event.photosAlbumUrl || null;
  const eventRef = doc(db, 'galleryEvents', event.id);
  const uploadFolder = `gallery/${event.folder || event.id}`;

  const openPhoto = (index) => {
    setViewerStart(index);
    setViewerVisible(true);
  };

  // ── Admin: add a photo ─────────────────────────────────────────────
  const addPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('अनुमति आवश्यक', 'फ़ोटो जोड़ने के लिए गैलरी की अनुमति दें।');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (result.canceled) return;

    setBusy(true);
    try {
      const url = await uploadToCloudinary(result.assets[0].uri, uploadFolder);
      await updateDoc(eventRef, { photos: arrayUnion(url), updatedAt: Date.now() });
      setPhotos((p) => [...p, url]);
    } catch (e) {
      Alert.alert('त्रुटि', 'फ़ोटो अपलोड नहीं हुई। पुनः प्रयास करें।');
    }
    setBusy(false);
  };

  // ── Admin: delete a photo (Cloudinary + Firestore) ─────────────────
  const deletePhoto = (url) => {
    Alert.alert('फ़ोटो हटाएँ?', 'यह फ़ोटो स्थायी रूप से हट जाएगी।', [
      { text: 'रद्द करें', style: 'cancel' },
      {
        text: 'हटाएँ',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            if (CLOUDINARY.deleteEndpoint) {
              await deleteFromCloudinary(url);   // removes from Cloudinary too
            }
            await updateDoc(eventRef, { photos: arrayRemove(url), updatedAt: Date.now() });
            setPhotos((p) => p.filter((u) => u !== url));
          } catch (e) {
            Alert.alert('त्रुटि', 'फ़ोटो हटाई नहीं जा सकी। पुनः प्रयास करें।');
          }
          setBusy(false);
        },
      },
    ]);
  };

  // Combined data for FlatList: photos grid + videos section + album button
  // We render photos in a 3-col grid using a flat list with item types
  const PHOTO_ITEMS = photos.map((url, i) => ({ type: 'photo', url, index: i }));
  if (isAdmin && editing) PHOTO_ITEMS.push({ type: 'add', index: -1 });

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
        {isAdmin && (
          <TouchableOpacity
            style={s.adminToggle}
            onPress={() => setEditing(e => !e)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={editing ? 'checkmark' : 'create-outline'} size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Tricolor strip */}
      <View style={s.tricolor}>
        <View style={[s.stripe, { backgroundColor: '#FF9933' }]} />
        <View style={[s.stripe, { backgroundColor: '#fff' }]} />
        <View style={[s.stripe, { backgroundColor: '#138808' }]} />
      </View>

      {/* Photo grid */}
      {photos.length === 0 && videos.length === 0 && !isAdmin ? (
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
          renderItem={({ item }) => {
            if (item.type === 'add') {
              return (
                <TouchableOpacity activeOpacity={0.8} onPress={addPhoto} style={[s.photoThumb, s.addTile]}>
                  <Ionicons name="add" size={30} color={COLORS.navyPrimary} />
                  <Text style={s.addTileTxt}>फ़ोटो जोड़ें</Text>
                </TouchableOpacity>
              );
            }
            return (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => (editing ? null : openPhoto(item.index))}
                style={s.photoThumb}
              >
                <Image
                  source={{ uri: THUMB(item.url) }}
                  style={s.photoImg}
                  resizeMode="cover"
                />
                {isAdmin && editing && (
                  <TouchableOpacity
                    style={s.delBadge}
                    onPress={() => deletePhoto(item.url)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Busy overlay */}
      {busy && (
        <View style={s.busyOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
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

  adminToggle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  delBadge: {
    position: 'absolute', top: 4, right: 4,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(194,65,12,0.95)',
    alignItems: 'center', justifyContent: 'center',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 3,
  },
  addTile: {
    alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: '#EAF0F8',
    borderWidth: 1.5, borderColor: COLORS.navyPrimary, borderStyle: 'dashed',
  },
  addTileTxt: { fontSize: 10, color: COLORS.navyPrimary, fontFamily: 'NotoSansDevanagari_700Bold' },
  busyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8,20,42,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },

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