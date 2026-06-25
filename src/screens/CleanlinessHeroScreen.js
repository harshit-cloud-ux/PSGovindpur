import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, setDoc, deleteField } from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

const DOC_REF = () => doc(db, 'features', 'cleanlinessHero');

export default function CleanlinessHeroScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isAdmin } = useAuth();

  const [hero, setHero] = useState(null);     // { name, photoUrl, updated_at }
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [nameOpen, setNameOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDoc(DOC_REF());
      setHero(snap.exists() ? snap.data() : null);
    } catch (e) {
      console.warn('hero load failed', e);
    }
    setLoading(false);
  };

  const pickAndUpload = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('अनुमति आवश्यक', 'फ़ोटो चुनने के लिए गैलरी की अनुमति दें।');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: false,
    });
    if (result.canceled) return;

    setBusy(true);
    try {
      // delete previous photo if any
      if (hero?.photoUrl) {
        try { await deleteFromCloudinary(hero.photoUrl); } catch (_) {}
      }
      const url = await uploadToCloudinary(result.assets[0].uri, 'cleanlinessHero');
      const next = { ...(hero || {}), photoUrl: url, updated_at: new Date().toISOString() };
      await setDoc(DOC_REF(), next, { merge: true });
      setHero(next);
    } catch (e) {
      Alert.alert('अपलोड में त्रुटि', e.message || 'पुनः प्रयास करें।');
    }
    setBusy(false);
  };

  const removePhoto = () => {
    Alert.alert(
      'फ़ोटो हटाएँ?',
      'क्या आप वाकई इस फ़ोटो को हटाना चाहते हैं?',
      [
        { text: 'रद्द करें', style: 'cancel' },
        {
          text: 'हटाएँ', style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              if (hero?.photoUrl) {
                try { await deleteFromCloudinary(hero.photoUrl); } catch (_) {}
              }
              await setDoc(DOC_REF(), { photoUrl: deleteField(), updated_at: new Date().toISOString() }, { merge: true });
              setHero(prev => prev ? { ...prev, photoUrl: null } : null);
            } catch (e) {
              Alert.alert('हटाने में त्रुटि', e.message || 'पुनः प्रयास करें।');
            }
            setBusy(false);
          },
        },
      ]
    );
  };

  const saveName = async () => {
    setBusy(true);
    try {
      await setDoc(DOC_REF(), { name: nameDraft.trim(), updated_at: new Date().toISOString() }, { merge: true });
      setHero(prev => ({ ...(prev || {}), name: nameDraft.trim() }));
      setNameOpen(false);
    } catch (e) {
      Alert.alert('सहेजने में त्रुटि', e.message || 'पुनः प्रयास करें।');
    }
    setBusy(false);
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top:10,bottom:10,left:10,right:10 }}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={s.topTitle}>स्वच्छता वीर</Text>
          <Text style={s.topSub}>Cleanliness Hero</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={COLORS.saffron} /></View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          <LinearGradient
            colors={['#0A6B0A', '#138808', '#1AA81A']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.banner}
          >
            <Ionicons name="sparkles" size={28} color="#fff" />
            <Text style={s.bannerTitle}>स्वच्छता ही सेवा है</Text>
            <Text style={s.bannerSub}>आज के स्वच्छता वीर</Text>
          </LinearGradient>

          {/* Hero card */}
          <View style={s.heroCard}>
            <View style={s.photoWrap}>
              {hero?.photoUrl ? (
                <Image source={{ uri: hero.photoUrl }} style={s.photo} resizeMode="cover" />
              ) : (
                <View style={s.photoEmpty}>
                  <Ionicons name="person" size={88} color={COLORS.inkLight} />
                  <Text style={s.photoEmptyText}>
                    {isAdmin ? 'फ़ोटो जोड़ने के लिए नीचे टैप करें' : 'अभी कोई स्वच्छता वीर नहीं चुना गया'}
                  </Text>
                </View>
              )}
              {/* gold medal badge */}
              {hero?.photoUrl && (
                <View style={s.medal}>
                  <Ionicons name="medal" size={28} color="#fff" />
                </View>
              )}
            </View>

            <View style={s.nameBlock}>
              {hero?.name ? (
                <Text style={s.heroName}>{hero.name}</Text>
              ) : (
                <Text style={s.heroNamePlaceholder}>
                  {isAdmin ? 'नाम जोड़ने के लिए टैप करें' : '—'}
                </Text>
              )}
              {isAdmin && (
                <TouchableOpacity
                  style={s.editNameBtn}
                  onPress={() => { setNameDraft(hero?.name || ''); setNameOpen(true); }}
                  activeOpacity={0.85}
                >
                  <Ionicons name="create-outline" size={16} color={COLORS.navyPrimary} />
                  <Text style={s.editNameTxt}>{hero?.name ? 'नाम संपादित करें' : 'नाम जोड़ें'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Admin controls */}
          {isAdmin && (
            <View style={s.adminBox}>
              <Text style={s.adminBoxTitle}>व्यवस्थापक नियंत्रण</Text>
              <View style={s.adminBtnRow}>
                <TouchableOpacity
                  style={[s.adminBtn, { backgroundColor: COLORS.navyPrimary }]}
                  onPress={pickAndUpload}
                  activeOpacity={0.85}
                >
                  <Ionicons name={hero?.photoUrl ? 'swap-horizontal' : 'cloud-upload'} size={20} color="#fff" />
                  <Text style={s.adminBtnTxt}>{hero?.photoUrl ? 'फ़ोटो बदलें' : 'फ़ोटो जोड़ें'}</Text>
                </TouchableOpacity>
                {hero?.photoUrl && (
                  <TouchableOpacity
                    style={[s.adminBtn, { backgroundColor: COLORS.error }]}
                    onPress={removePhoto}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="trash" size={20} color="#fff" />
                    <Text style={s.adminBtnTxt}>हटाएँ</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      )}

      {/* Name editor modal */}
      <Modal visible={nameOpen} transparent animationType="slide" onRequestClose={() => setNameOpen(false)}>
        <KeyboardAvoidingView
          style={s.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>छात्र का नाम</Text>
            <TextInput
              style={s.nameInput}
              value={nameDraft}
              onChangeText={setNameDraft}
              placeholder="पूरा नाम लिखें"
              placeholderTextColor={COLORS.inkLight}
              autoFocus
            />
            <View style={s.modalActions}>
              <TouchableOpacity style={[s.modalBtn, { backgroundColor: '#E7E5E4' }]} onPress={() => setNameOpen(false)}>
                <Text style={[s.modalBtnTxt, { color: COLORS.inkSoft }]}>रद्द करें</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalBtn, { backgroundColor: COLORS.green }]} onPress={saveName}>
                <Text style={s.modalBtnTxt}>सहेजें</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {busy && (
        <View style={s.busyOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: '#fff', marginTop: 12, fontFamily: 'NotoSansDevanagari_700Bold' }}>कृपया प्रतीक्षा करें...</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.cream },

  topBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.green, paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  topTitle: { color: '#fff', fontSize: 18, fontFamily: 'NotoSansDevanagari_700Bold' },
  topSub:   { color: '#E0F2D6', fontSize: 11, marginTop: 2 },

  scroll: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  banner: {
    borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 18,
    elevation: 4, shadowColor: COLORS.green, shadowOpacity: 0.3, shadowRadius: 8,
  },
  bannerTitle: { color: '#fff', fontSize: 18, fontFamily: 'NotoSansDevanagari_700Bold', marginTop: 8 },
  bannerSub:   { color: '#E0F2D6', fontSize: 12, marginTop: 4 },

  heroCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 22, alignItems: 'center',
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 3 },
  },
  photoWrap: { width: '100%', position: 'relative', marginBottom: 22 },
  photo: {
    width: '100%', aspectRatio: 3/4, borderRadius: 16,
    borderWidth: 4, borderColor: COLORS.gold,
    backgroundColor: '#F5F5F4',
  },
  photoEmpty: {
    width: '100%', aspectRatio: 3/4, borderRadius: 16,
    backgroundColor: '#F5F5F4',
    borderWidth: 3, borderColor: COLORS.border, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', padding: 18,
  },
  medal: {
    position: 'absolute', bottom: -16, right: -16,
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: COLORS.gold,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: '#fff',
    elevation: 8, shadowColor: COLORS.gold, shadowOpacity: 0.7, shadowRadius: 8,
  },

  nameBlock: { alignItems: 'center' },
  heroName: { color: COLORS.navyPrimary, fontSize: 24, fontFamily: 'NotoSansDevanagari_700Bold', textAlign: 'center' },
  heroNamePlaceholder: { color: COLORS.inkLight, fontSize: 15, fontFamily: 'NotoSansDevanagari_400Regular', fontStyle: 'italic' },
  editNameBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.saffronLight, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, marginTop: 12,
  },
  editNameTxt: { color: COLORS.navyPrimary, fontSize: 12, fontFamily: 'NotoSansDevanagari_700Bold' },

  adminBox: {
    marginTop: 20, backgroundColor: '#FFFEF7', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: COLORS.borderWarm,
  },
  adminBoxTitle: { color: COLORS.navyPrimary, fontSize: 13, fontFamily: 'NotoSansDevanagari_700Bold', marginBottom: 12, letterSpacing: 0.5 },
  adminBtnRow: { flexDirection: 'row', gap: 10 },
  adminBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 13, borderRadius: 12,
  },
  adminBtnTxt: { color: '#fff', fontSize: 13, fontFamily: 'NotoSansDevanagari_700Bold' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 22, paddingBottom: 28 },
  modalTitle: { fontSize: 18, fontFamily: 'NotoSansDevanagari_700Bold', color: COLORS.navyPrimary, marginBottom: 14 },
  nameInput: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 14,
    fontSize: 15, fontFamily: 'NotoSansDevanagari_400Regular', color: COLORS.ink,
    backgroundColor: COLORS.paper,
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 22 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalBtnTxt: { color: '#fff', fontSize: 15, fontFamily: 'NotoSansDevanagari_700Bold' },

  busyOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
});
