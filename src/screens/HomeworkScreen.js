import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Linking, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

const COLLECTION = 'homework';

const CLASSES = [
  { n: 1, hi: 'कक्षा 1', eng: 'Class 1', color: '#1A3A6B' },
  { n: 2, hi: 'कक्षा 2', eng: 'Class 2', color: '#C2410C' },
  { n: 3, hi: 'कक्षा 3', eng: 'Class 3', color: '#138808' },
  { n: 4, hi: 'कक्षा 4', eng: 'Class 4', color: '#7C3AED' },
  { n: 5, hi: 'कक्षा 5', eng: 'Class 5', color: '#BE185D' },
];

const isLikelyUrl = (s) => /^https?:\/\//i.test((s || '').trim());

function LinkBlock({ docId, title, accent }) {
  const { isAdmin }             = useAuth();
  const [entry,    setEntry]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [editor,   setEditor]   = useState(false);
  const [draft,    setDraft]    = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    getDoc(doc(db, COLLECTION, docId))
      .then(snap => { if (!active) return; if (snap.exists()) setEntry(snap.data()); setLoading(false); })
      .catch(() => setLoading(false));
    return () => { active = false; };
  }, [docId]);

  const saveLink = async () => {
    const url = draft.trim();
    if (!url) { Alert.alert('लिंक खाली है', 'कृपया Google Drive का लिंक पेस्ट करें।'); return; }
    if (!isLikelyUrl(url)) { Alert.alert('अमान्य लिंक', 'पूरा लिंक पेस्ट करें (https:// से शुरू)।'); return; }
    setSaving(true);
    try {
      const next = { url, updated_at: new Date().toISOString() };
      await setDoc(doc(db, COLLECTION, docId), next);
      setEntry(next);
      setEditor(false);
    } catch (e) {
      Alert.alert('त्रुटि', e.message || 'सहेजना असफल।');
    }
    setSaving(false);
  };

  const removeLink = () => {
    Alert.alert('हटाएं?', 'क्या आप यह लिंक हटाना चाहते हैं?', [
      { text: 'नहीं', style: 'cancel' },
      { text: 'हाँ, हटाएं', style: 'destructive', onPress: async () => {
        setSaving(true);
        try { await setDoc(doc(db, COLLECTION, docId), { url: '', updated_at: new Date().toISOString() }); setEntry({ url: '' }); }
        catch (e) { Alert.alert('त्रुटि', e.message); }
        setSaving(false);
      }},
    ]);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <View style={s.secHead}><View style={[s.secBar,{backgroundColor:accent}]} /><Text style={s.secTitle}>{title}</Text></View>
      <Text style={s.secTitleEng}>Homework</Text>

      {isAdmin && (
        <View style={s.adminBox}>
          <Text style={s.adminLabel}>व्यवस्थापक — Google Drive लिंक</Text>
          {saving ? (
            <View style={s.uploadingBox}><ActivityIndicator color={accent} size="large" /><Text style={s.uploadingTxt}>सहेजा जा रहा है...</Text></View>
          ) : (
            <View style={{ gap: 10 }}>
              <TouchableOpacity onPress={() => { setDraft(entry?.url || ''); setEditor(true); }} style={[s.linkBtn, { backgroundColor: accent }]} activeOpacity={0.85}>
                <Ionicons name={entry?.url ? 'create-outline' : 'link-outline'} size={20} color="#fff" />
                <Text style={s.linkBtnTxt}>{entry?.url ? 'लिंक बदलें' : 'लिंक जोड़ें'}</Text>
              </TouchableOpacity>
              {entry?.url ? (
                <TouchableOpacity onPress={removeLink} style={s.removeBtn}>
                  <Ionicons name="trash-outline" size={15} color="#DC2626" />
                  <Text style={s.removeBtnTxt}>हटाएं</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
        </View>
      )}

      {loading ? (
        <View style={s.loaderBox}><ActivityIndicator color={accent} /></View>
      ) : entry?.url ? (
        <TouchableOpacity activeOpacity={0.85} onPress={() => Linking.openURL(entry.url)} style={[s.linkCard, { borderLeftColor: accent }]}>
          <View style={[s.linkIcon,{backgroundColor:accent}]}><Ionicons name="logo-google" size={22} color="#fff" /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.linkTitle}>{title} गृहकार्य</Text>
            <Text style={s.linkSub}>टैप करें · Google Drive में खोलें</Text>
          </View>
          <Ionicons name="open-outline" size={22} color={accent} />
        </TouchableOpacity>
      ) : (
        <View style={s.emptyCard}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.inkLight} />
          <Text style={s.emptyTxt}>शीघ्र उपलब्ध होगा</Text>
        </View>
      )}

      <Modal visible={editor} transparent animationType="slide" onRequestClose={() => setEditor(false)}>
        <KeyboardAvoidingView style={s.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Google Drive लिंक</Text>
            <Text style={s.modalHint}>Drive पर "Anyone with the link · Viewer" साझा करें, फिर लिंक यहाँ पेस्ट करें।</Text>
            <TextInput
              style={s.urlInput}
              value={draft}
              onChangeText={setDraft}
              placeholder="https://drive.google.com/..."
              placeholderTextColor={COLORS.inkLight}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              multiline
            />
            <View style={s.modalActions}>
              <TouchableOpacity style={[s.modalBtn, { backgroundColor: '#E7E5E4' }]} onPress={() => setEditor(false)}>
                <Text style={[s.modalBtnTxt, { color: COLORS.inkSoft }]}>रद्द करें</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalBtn, { backgroundColor: COLORS.green }]} onPress={saveLink}>
                <Text style={s.modalBtnTxt}>सहेजें</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

export default function HomeworkScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selClass, setSelClass] = useState(null);

  let titleHi = 'गृहकार्य', titleEng = 'Homework';
  if (selClass !== null) { titleHi = CLASSES[selClass].hi; titleEng = CLASSES[selClass].eng; }

  const goBack = () => {
    if (selClass !== null) { setSelClass(null); return; }
    navigation.goBack();
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#060F24','#0F2347','#1A3A6B']} style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={goBack} hitSlop={{top:10,bottom:10,left:10,right:10}}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerTitle}>
          <Text style={s.headerHindi} numberOfLines={1}>{titleHi}</Text>
          <Text style={s.headerEng}>{titleEng}</Text>
        </View>
        <View style={{ width: 38 }} />
      </LinearGradient>
      <View style={s.tricolor}>
        <View style={[s.stripe,{backgroundColor:'#FF9933'}]} />
        <View style={[s.stripe,{backgroundColor:'#fff'}]} />
        <View style={[s.stripe,{backgroundColor:'#138808'}]} />
      </View>

      {selClass === null ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={s.section}>
            <LinearGradient colors={['#0F2347','#1A3A6B','#1E4D8C']} style={s.hero}>
              <View style={s.heroIcon}><Ionicons name="create" size={28} color={COLORS.gold} /></View>
              <Text style={s.heroTitle}>गृहकार्य विवरण</Text>
              <Text style={s.heroSub}>कक्षावार गृहकार्य · सत्र 2026-27</Text>
            </LinearGradient>
          </View>
          <View style={s.section}>
            <View style={s.secHead}><View style={s.secBar} /><Text style={s.secTitle}>कक्षा चुनें</Text></View>
            <Text style={s.secTitleEng}>Select Class</Text>
            {CLASSES.map((c, i) => (
              <TouchableOpacity key={c.n} activeOpacity={0.85} onPress={() => setSelClass(i)} style={s.classCard}>
                <View style={[s.classNum,{backgroundColor:c.color}]}><Text style={s.classNumTxt}>{c.n}</Text></View>
                <View style={{flex:1}}>
                  <Text style={s.classCardTitle}>{c.hi}</Text>
                  <Text style={s.classCardSub}>{c.eng}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.inkLight} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <LinkBlock docId={`class${CLASSES[selClass].n}`} title={CLASSES[selClass].hi} accent={CLASSES[selClass].color} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:         { flex:1, backgroundColor:'#FBF3E4' },
  tricolor:     { flexDirection:'row', height:4 },
  stripe:       { flex:1 },
  header:       { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:14 },
  backBtn:      { width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,255,255,0.12)', borderWidth:1, borderColor:'rgba(255,255,255,0.18)', alignItems:'center', justifyContent:'center' },
  headerTitle:  { alignItems:'center', flex:1, paddingHorizontal:6 },
  headerHindi:  { color:'#fff', fontSize:18, fontFamily:'NotoSansDevanagari_700Bold' },
  headerEng:    { color:COLORS.saffronLight, fontSize:10, marginTop:1 },
  hero:         { borderRadius:18, padding:22, alignItems:'center', elevation:4, shadowColor:'#000', shadowOpacity:0.2, shadowRadius:8 },
  heroIcon:     { width:56, height:56, borderRadius:28, backgroundColor:'rgba(201,168,76,0.15)', borderWidth:1.5, borderColor:COLORS.gold, alignItems:'center', justifyContent:'center', marginBottom:12 },
  heroTitle:    { color:'#fff', fontSize:20, fontFamily:'NotoSansDevanagari_700Bold', textAlign:'center' },
  heroSub:      { color:'#C9DCF0', fontSize:12, marginTop:5, textAlign:'center', fontFamily:'NotoSansDevanagari_400Regular' },
  section:      { paddingHorizontal:16, paddingTop:16 },
  secHead:      { flexDirection:'row', alignItems:'center', marginBottom:4 },
  secBar:       { width:4, height:22, borderRadius:2, marginRight:10, backgroundColor:COLORS.saffron },
  secTitle:     { fontSize:18, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyPrimary },
  secTitleEng:  { fontSize:11, color:COLORS.inkLight, marginLeft:14, marginBottom:14, letterSpacing:0.4 },
  classCard:    { flexDirection:'row', alignItems:'center', gap:14, backgroundColor:'#fff', borderRadius:14, padding:14, marginBottom:10, elevation:2, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:6 },
  classNum:     { width:48, height:48, borderRadius:14, alignItems:'center', justifyContent:'center' },
  classNumTxt:  { color:'#fff', fontSize:22, fontFamily:'NotoSansDevanagari_700Bold' },
  classCardTitle:{ fontSize:17, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },
  classCardSub: { fontSize:12, color:COLORS.inkLight, marginTop:2, fontFamily:'NotoSansDevanagari_400Regular' },
  adminBox:     { backgroundColor:'#fff', borderRadius:16, padding:16, elevation:2, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:6, borderLeftWidth:4, borderLeftColor:COLORS.saffron, marginBottom:14 },
  adminLabel:   { fontSize:13, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark, marginBottom:12 },
  linkBtn:      { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, borderRadius:14, paddingVertical:13, paddingHorizontal:16 },
  linkBtnTxt:   { color:'#fff', fontSize:14, fontFamily:'NotoSansDevanagari_700Bold' },
  uploadingBox: { alignItems:'center', padding:18, gap:10 },
  uploadingTxt: { fontSize:14, color:COLORS.inkSoft, fontFamily:'NotoSansDevanagari_400Regular' },
  removeBtn:    { flexDirection:'row', alignItems:'center', gap:6, marginTop:6, alignSelf:'flex-start' },
  removeBtnTxt: { fontSize:13, color:'#DC2626', fontFamily:'NotoSansDevanagari_400Regular' },
  loaderBox:    { padding:30, alignItems:'center' },
  linkCard:     { flexDirection:'row', alignItems:'center', gap:14, backgroundColor:'#fff', borderRadius:14, padding:18, elevation:2, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:6, borderLeftWidth:4 },
  linkIcon:     { width:50, height:50, borderRadius:14, alignItems:'center', justifyContent:'center' },
  linkTitle:    { fontSize:16, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },
  linkSub:      { fontSize:12, color:COLORS.inkLight, marginTop:3, fontFamily:'NotoSansDevanagari_400Regular' },
  emptyCard:    { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:'#F5F0E8', borderRadius:14, padding:18 },
  emptyTxt:     { fontSize:14, color:COLORS.inkLight, fontFamily:'NotoSansDevanagari_400Regular', fontStyle:'italic' },

  modalBackdrop: { flex:1, backgroundColor:'rgba(0,0,0,0.55)', justifyContent:'flex-end' },
  modalCard:     { backgroundColor:'#fff', borderTopLeftRadius:22, borderTopRightRadius:22, padding:22, paddingBottom:28 },
  modalTitle:    { fontSize:18, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyPrimary, marginBottom:6 },
  modalHint:     { fontSize:12, color:COLORS.inkSoft, fontFamily:'NotoSansDevanagari_400Regular', marginBottom:14 },
  urlInput:      { minHeight:80, maxHeight:140, borderWidth:1.5, borderColor:COLORS.border, borderRadius:12, padding:14, fontSize:14, color:COLORS.ink, backgroundColor:COLORS.paper, textAlignVertical:'top' },
  modalActions:  { flexDirection:'row', gap:10, marginTop:18 },
  modalBtn:      { flex:1, paddingVertical:14, borderRadius:12, alignItems:'center' },
  modalBtnTxt:   { color:'#fff', fontSize:15, fontFamily:'NotoSansDevanagari_700Bold' },
});
