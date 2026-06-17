import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

const CLASSES = [
  {
    cls: 'कक्षा 1', clsEng: 'Class 1', color: '#1A3A6B',
    subjects: [
      { name: 'हिन्दी',   eng: 'Hindi',   key: 'class1-hindi'   },
      { name: 'अंग्रेज़ी', eng: 'English', key: 'class1-english' },
      { name: 'गणित',     eng: 'Maths',   key: 'class1-maths'   },
    ],
  },
  {
    cls: 'कक्षा 2', clsEng: 'Class 2', color: '#C2410C',
    subjects: [
      { name: 'हिन्दी',   eng: 'Hindi',   key: 'class2-hindi'   },
      { name: 'अंग्रेज़ी', eng: 'English', key: 'class2-english' },
      { name: 'गणित',     eng: 'Maths',   key: 'class2-maths'   },
    ],
  },
  {
    cls: 'कक्षा 3', clsEng: 'Class 3', color: '#138808',
    subjects: [
      { name: 'हिन्दी',   eng: 'Hindi',    key: 'class3-hindi'    },
      { name: 'अंग्रेज़ी', eng: 'English',  key: 'class3-english'  },
      { name: 'गणित',     eng: 'Maths',    key: 'class3-maths'    },
      { name: 'पर्यावरण',  eng: 'EVS',      key: 'class3-evs'      },
      { name: 'संस्कृत',   eng: 'Sanskrit', key: 'class3-sanskrit' },
    ],
  },
  {
    cls: 'कक्षा 4', clsEng: 'Class 4', color: '#7C3AED',
    subjects: [
      { name: 'हिन्दी',   eng: 'Hindi',    key: 'class4-hindi'    },
      { name: 'अंग्रेज़ी', eng: 'English',  key: 'class4-english'  },
      { name: 'गणित',     eng: 'Maths',    key: 'class4-maths'    },
      { name: 'पर्यावरण',  eng: 'EVS',      key: 'class4-evs'      },
      { name: 'संस्कृत',   eng: 'Sanskrit', key: 'class4-sanskrit' },
    ],
  },
  {
    cls: 'कक्षा 5', clsEng: 'Class 5', color: '#BE185D',
    subjects: [
      { name: 'हिन्दी',   eng: 'Hindi',    key: 'class5-hindi'    },
      { name: 'अंग्रेज़ी', eng: 'English',  key: 'class5-english'  },
      { name: 'गणित',     eng: 'Maths',    key: 'class5-maths'    },
      { name: 'पर्यावरण',  eng: 'EVS',      key: 'class5-evs'      },
      { name: 'संस्कृत',   eng: 'Sanskrit', key: 'class5-sanskrit' },
    ],
  },
];

// ── Content level component ──────────────────────────────────────────
function ContentLevel({ subject, accent }) {
  const { isAdmin } = useAuth();
  const [data,       setData]       = useState({ pdf: '', videos: [] });
  const [loading,    setLoading]    = useState(true);
  const [editing,    setEditing]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [draftPdf,   setDraftPdf]   = useState('');
  const [draftVids,  setDraftVids]  = useState([{ title: '', url: '' }]);

  // Load from Firestore
  useEffect(() => {
    let active = true;
    setLoading(true);
    getDoc(doc(db, 'ebooks', subject.key))
      .then(snap => {
        if (!active) return;
        if (snap.exists()) {
          const d = snap.data();
          setData({ pdf: d.pdf || '', videos: d.videos || [] });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => { active = false; };
  }, [subject.key]);

  const openEdit = () => {
    setDraftPdf(data.pdf);
    setDraftVids(data.videos.length > 0 ? data.videos.map(v=>({...v})) : [{ title:'', url:'' }]);
    setEditing(true);
  };

  const addVideoRow = () => setDraftVids(v => [...v, { title:'', url:'' }]);
  const removeVideoRow = (i) => setDraftVids(v => v.filter((_,idx)=>idx!==i));
  const updateVidTitle = (i,val) => setDraftVids(v => v.map((x,idx)=>idx===i?{...x,title:val}:x));
  const updateVidUrl   = (i,val) => setDraftVids(v => v.map((x,idx)=>idx===i?{...x,url:val}:x));

  const save = async () => {
    setSaving(true);
    try {
      const cleanVids = draftVids.filter(v => v.url.trim() !== '');
      await setDoc(doc(db, 'ebooks', subject.key), { pdf: draftPdf.trim(), videos: cleanVids });
      setData({ pdf: draftPdf.trim(), videos: cleanVids });
      setEditing(false);
    } catch (e) {
      Alert.alert('Error', 'सेव नहीं हुआ। कृपया पुनः प्रयास करें।');
    }
    setSaving(false);
  };

  if (loading) return (
    <View style={s.loader}><ActivityIndicator color={COLORS.navyPrimary} size="large" /></View>
  );

  // ── Edit form ──
  if (editing) return (
    <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined}>
      <ScrollView contentContainerStyle={{ padding:16, paddingBottom:40 }}>
        <View style={s.editHeader}>
          <Text style={s.editTitle}>सामग्री अपडेट करें</Text>
          <Text style={s.editSub}>Update Content  ·  {subject.eng}</Text>
        </View>

        {/* PDF */}
        <Text style={s.fieldLabel}>📄 पुस्तक लिंक (NCERT या अन्य URL)</Text>
        <TextInput
          style={s.input}
          placeholder="https://ncert.nic.in/..."
          placeholderTextColor={COLORS.inkLight}
          value={draftPdf}
          onChangeText={setDraftPdf}
          autoCapitalize="none"
          autoCorrect={false}
          multiline
        />

        {/* Videos */}
        <Text style={[s.fieldLabel,{marginTop:20}]}>🎬 वीडियो लिंक</Text>
        {draftVids.map((v,i) => (
          <View key={i} style={s.videoRow}>
            <View style={{flex:1}}>
              <TextInput
                style={[s.input,{marginBottom:6}]}
                placeholder={`वीडियो ${i+1} का नाम`}
                placeholderTextColor={COLORS.inkLight}
                value={v.title}
                onChangeText={val => updateVidTitle(i,val)}
              />
              <TextInput
                style={s.input}
                placeholder="YouTube / Video URL"
                placeholderTextColor={COLORS.inkLight}
                value={v.url}
                onChangeText={val => updateVidUrl(i,val)}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {draftVids.length > 1 && (
              <TouchableOpacity onPress={()=>removeVideoRow(i)} style={s.removeBtn}>
                <Ionicons name="trash-outline" size={18} color="#C2410C" />
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity onPress={addVideoRow} style={s.addVideoBtn}>
          <Ionicons name="add-circle-outline" size={18} color={COLORS.navyPrimary} />
          <Text style={s.addVideoBtnTxt}>वीडियो जोड़ें</Text>
        </TouchableOpacity>

        <View style={s.editActions}>
          <TouchableOpacity onPress={()=>setEditing(false)} style={s.cancelBtn}>
            <Text style={s.cancelBtnTxt}>रद्द करें</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={save} style={s.saveBtn} disabled={saving}>
            {saving
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={s.saveBtnTxt}>सेव करें  ✓</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ── View mode ──
  return (
    <ScrollView contentContainerStyle={{ padding:16, paddingBottom:40 }}>
      {/* Admin edit button */}
      {isAdmin && (
        <TouchableOpacity onPress={openEdit} style={s.adminEditBtn}>
          <Ionicons name="pencil" size={16} color="#fff" />
          <Text style={s.adminEditTxt}>सामग्री अपडेट करें (Admin)</Text>
        </TouchableOpacity>
      )}

      {/* E-Book */}
      <View style={s.secHead}><View style={s.secBar} /><Text style={s.secTitle}>ई-पुस्तक</Text></View>
      <Text style={s.secTitleEng}>E-Book (PDF)</Text>

      {data.pdf ? (
        <TouchableOpacity activeOpacity={0.85} onPress={()=>Linking.openURL(data.pdf)} style={s.pdfCard}>
          <View style={[s.pdfIcon,{backgroundColor:'#C2410C'}]}>
            <Ionicons name="document-text" size={24} color="#fff" />
          </View>
          <View style={{flex:1}}>
            <Text style={s.pdfTitle}>{subject.name} — पाठ्यपुस्तक</Text>
            <Text style={s.pdfSub}>टैप करें · पुस्तक खोलें</Text>
          </View>
          <Ionicons name="open-outline" size={20} color="#C2410C" />
        </TouchableOpacity>
      ) : (
        <View style={s.emptyCard}>
          <Ionicons name="document-outline" size={18} color={COLORS.inkLight} />
          <Text style={s.emptyTxt}>पुस्तक शीघ्र उपलब्ध होगी</Text>
        </View>
      )}

      {/* Videos */}
      <View style={[s.secHead,{marginTop:24}]}><View style={s.secBar} /><Text style={s.secTitle}>वीडियो सामग्री</Text></View>
      <Text style={s.secTitleEng}>Video Lessons</Text>

      {data.videos && data.videos.length > 0 ? (
        data.videos.map((v,i) => (
          <TouchableOpacity key={i} activeOpacity={0.85} onPress={()=>Linking.openURL(v.url)} style={s.videoCard}>
            <View style={s.videoIcon}>
              <Ionicons name="play" size={20} color="#fff" />
            </View>
            <Text style={s.videoTitle}>{v.title || `वीडियो ${i+1}`}</Text>
            <Ionicons name="open-outline" size={18} color="#0369A1" />
          </TouchableOpacity>
        ))
      ) : (
        <View style={s.emptyCard}>
          <Ionicons name="videocam-outline" size={18} color={COLORS.inkLight} />
          <Text style={s.emptyTxt}>वीडियो शीघ्र उपलब्ध होंगे</Text>
        </View>
      )}
    </ScrollView>
  );
}

// ── Main screen ──────────────────────────────────────────────────────
export default function EbooksVideosScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selClass, setSelClass] = useState(null);
  const [selSub,   setSelSub]   = useState(null);

  let titleHi = 'ई-पुस्तकें व वीडियो', titleEng = 'E-Books & Videos';
  if (selClass !== null && selSub === null) { titleHi = CLASSES[selClass].cls;                        titleEng = CLASSES[selClass].clsEng; }
  if (selClass !== null && selSub !== null) { titleHi = CLASSES[selClass].subjects[selSub].name;      titleEng = CLASSES[selClass].subjects[selSub].eng; }

  const goBack = () => {
    if (selSub   !== null) { setSelSub(null);   return; }
    if (selClass !== null) { setSelClass(null);  return; }
    navigation.goBack();
  };

  return (
    <View style={[s.root,{paddingTop:insets.top}]}>
      <LinearGradient colors={['#060F24','#0F2347','#1A3A6B']} style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={goBack} hitSlop={{top:10,bottom:10,left:10,right:10}}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerTitle}>
          <Text style={s.headerHindi}>{titleHi}</Text>
          <Text style={s.headerEng}>{titleEng}</Text>
        </View>
        <View style={{width:38}} />
      </LinearGradient>
      <View style={s.tricolor}>
        <View style={[s.stripe,{backgroundColor:'#FF9933'}]} />
        <View style={[s.stripe,{backgroundColor:'#fff'}]} />
        <View style={[s.stripe,{backgroundColor:'#138808'}]} />
      </View>

      {/* Level 1 — class list */}
      {selClass === null && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:40}}>
          <View style={s.section}>
            <LinearGradient colors={['#0F2347','#1A3A6B','#1E4D8C']} style={s.hero}>
              <View style={s.heroIcon}><Ionicons name="library" size={28} color={COLORS.gold} /></View>
              <Text style={s.heroTitle}>डिजिटल पुस्तकालय</Text>
              <Text style={s.heroSub}>कक्षावार ई-पुस्तकें व वीडियो सामग्री</Text>
            </LinearGradient>
            <View style={{height:8}} />
            {CLASSES.map((c,i) => (
              <TouchableOpacity key={i} activeOpacity={0.85} onPress={()=>setSelClass(i)} style={s.classCard}>
                <View style={[s.classNum,{backgroundColor:c.color}]}>
                  <Text style={s.classNumTxt}>{i+1}</Text>
                </View>
                <View style={{flex:1}}>
                  <Text style={s.classCardTitle}>{c.cls}</Text>
                  <Text style={s.classCardSub}>{c.subjects.length} विषय  ·  {c.clsEng}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.inkLight} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Level 2 — subject list */}
      {selClass !== null && selSub === null && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:40}}>
          <View style={s.section}>
            <View style={s.secHead}><View style={s.secBar} /><Text style={s.secTitle}>विषय चुनें</Text></View>
            <Text style={s.secTitleEng}>Select Subject  ·  {CLASSES[selClass].clsEng}</Text>
            {CLASSES[selClass].subjects.map((sub,i) => (
              <TouchableOpacity key={i} activeOpacity={0.85} onPress={()=>setSelSub(i)} style={s.subCard}>
                <View style={[s.subIcon,{backgroundColor:CLASSES[selClass].color}]}>
                  <Ionicons name="book" size={20} color="#fff" />
                </View>
                <View style={{flex:1}}>
                  <Text style={s.subTitle}>{sub.name}</Text>
                  <Text style={s.subSub}>{sub.eng}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.inkLight} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Level 3 — Firestore-backed content */}
      {selClass !== null && selSub !== null && (
        <ContentLevel
          subject={CLASSES[selClass].subjects[selSub]}
          accent={CLASSES[selClass].color}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:          { flex:1, backgroundColor:'#FBF3E4' },
  tricolor:      { flexDirection:'row', height:4 },
  stripe:        { flex:1 },
  header:        { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:14 },
  backBtn:       { width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,255,255,0.12)', borderWidth:1, borderColor:'rgba(255,255,255,0.18)', alignItems:'center', justifyContent:'center' },
  headerTitle:   { alignItems:'center', flex:1 },
  headerHindi:   { color:'#fff', fontSize:18, fontFamily:'NotoSansDevanagari_700Bold' },
  headerEng:     { color:COLORS.saffronLight, fontSize:10, marginTop:1 },

  hero:          { borderRadius:18, padding:22, alignItems:'center', elevation:4, shadowColor:'#000', shadowOpacity:0.2, shadowRadius:8 },
  heroIcon:      { width:56, height:56, borderRadius:28, backgroundColor:'rgba(201,168,76,0.15)', borderWidth:1.5, borderColor:COLORS.gold, alignItems:'center', justifyContent:'center', marginBottom:12 },
  heroTitle:     { color:'#fff', fontSize:20, fontFamily:'NotoSansDevanagari_700Bold', textAlign:'center' },
  heroSub:       { color:'#C9DCF0', fontSize:12, marginTop:5, textAlign:'center', fontFamily:'NotoSansDevanagari_400Regular' },

  section:       { paddingHorizontal:16, paddingTop:16 },
  secHead:       { flexDirection:'row', alignItems:'center', marginBottom:4 },
  secBar:        { width:4, height:22, backgroundColor:COLORS.saffron, borderRadius:2, marginRight:10 },
  secTitle:      { fontSize:18, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyPrimary },
  secTitleEng:   { fontSize:11, color:COLORS.inkLight, marginLeft:14, marginBottom:14, letterSpacing:0.4 },

  loader:        { flex:1, justifyContent:'center', alignItems:'center' },

  classCard:     { flexDirection:'row', alignItems:'center', gap:14, backgroundColor:'#fff', borderRadius:14, padding:14, marginBottom:10, elevation:2, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:6 },
  classNum:      { width:48, height:48, borderRadius:14, alignItems:'center', justifyContent:'center' },
  classNumTxt:   { color:'#fff', fontSize:22, fontFamily:'NotoSansDevanagari_700Bold' },
  classCardTitle:{ fontSize:17, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },
  classCardSub:  { fontSize:12, color:COLORS.inkLight, marginTop:2, fontFamily:'NotoSansDevanagari_400Regular' },

  subCard:       { flexDirection:'row', alignItems:'center', gap:14, backgroundColor:'#fff', borderRadius:14, padding:14, marginBottom:10, elevation:2, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:6 },
  subIcon:       { width:44, height:44, borderRadius:12, alignItems:'center', justifyContent:'center' },
  subTitle:      { fontSize:16, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },
  subSub:        { fontSize:12, color:COLORS.inkLight, marginTop:2, fontFamily:'NotoSansDevanagari_400Regular' },

  pdfCard:       { flexDirection:'row', alignItems:'center', gap:14, backgroundColor:'#fff', borderRadius:14, padding:16, elevation:2, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:6, borderLeftWidth:4, borderLeftColor:'#C2410C' },
  pdfIcon:       { width:48, height:48, borderRadius:12, alignItems:'center', justifyContent:'center' },
  pdfTitle:      { fontSize:15, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },
  pdfSub:        { fontSize:12, color:COLORS.inkLight, marginTop:2, fontFamily:'NotoSansDevanagari_400Regular' },

  videoCard:     { flexDirection:'row', alignItems:'center', gap:14, backgroundColor:'#fff', borderRadius:14, padding:14, marginBottom:10, elevation:2, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:6 },
  videoIcon:     { width:40, height:40, borderRadius:20, backgroundColor:'#0369A1', alignItems:'center', justifyContent:'center' },
  videoTitle:    { flex:1, fontSize:14, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },

  emptyCard:     { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'#F5F0E8', borderRadius:12, padding:16, marginBottom:10 },
  emptyTxt:      { fontSize:13, color:COLORS.inkLight, fontFamily:'NotoSansDevanagari_400Regular', fontStyle:'italic' },

  adminEditBtn:  { flexDirection:'row', alignItems:'center', gap:8, backgroundColor:COLORS.navyPrimary, borderRadius:10, padding:12, marginBottom:20 },
  adminEditTxt:  { color:'#fff', fontSize:13, fontFamily:'NotoSansDevanagari_700Bold' },

  editHeader:    { marginBottom:20 },
  editTitle:     { fontSize:20, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyPrimary },
  editSub:       { fontSize:12, color:COLORS.inkLight, marginTop:4 },

  fieldLabel:    { fontSize:14, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark, marginBottom:8 },
  input:         { backgroundColor:'#fff', borderRadius:10, borderWidth:1, borderColor:'#E0D6C8', padding:12, fontSize:13, color:COLORS.ink, fontFamily:'NotoSansDevanagari_400Regular', lineHeight:20 },

  videoRow:      { flexDirection:'row', gap:10, alignItems:'flex-start', marginBottom:14 },
  removeBtn:     { width:36, height:36, borderRadius:10, backgroundColor:'#FEE2E2', alignItems:'center', justifyContent:'center', marginTop:4 },

  addVideoBtn:   { flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'#EEF2FF', borderRadius:10, padding:12, marginBottom:24 },
  addVideoBtnTxt:{ fontSize:13, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyPrimary },

  editActions:   { flexDirection:'row', gap:12 },
  cancelBtn:     { flex:1, backgroundColor:'#F5F0E8', borderRadius:12, padding:14, alignItems:'center' },
  cancelBtnTxt:  { fontSize:14, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.inkSoft },
  saveBtn:       { flex:2, backgroundColor:COLORS.navyPrimary, borderRadius:12, padding:14, alignItems:'center' },
  saveBtnTxt:    { fontSize:14, fontFamily:'NotoSansDevanagari_700Bold', color:'#fff' },
});
