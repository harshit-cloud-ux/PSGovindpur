import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as WebBrowser from 'expo-web-browser';

const CLOUD_NAME    = 'dgjxqjvbv';
const UPLOAD_PRESET = 'ps_govindpur';
const COLLECTION    = 'attendance';

const CLASSES = [
  { n: 1, hi: 'कक्षा 1', eng: 'Class 1', color: '#1A3A6B' },
  { n: 2, hi: 'कक्षा 2', eng: 'Class 2', color: '#C2410C' },
  { n: 3, hi: 'कक्षा 3', eng: 'Class 3', color: '#138808' },
  { n: 4, hi: 'कक्षा 4', eng: 'Class 4', color: '#7C3AED' },
  { n: 5, hi: 'कक्षा 5', eng: 'Class 5', color: '#BE185D' },
];

async function uploadToCloudinary(uri, type) {
  const ext  = uri.split('.').pop().toLowerCase();
  const mime = type === 'pdf' ? 'application/pdf' : ext === 'png' ? 'image/png' : 'image/jpeg';
  const form = new FormData();
  form.append('file', { uri, type: mime, name: `attendance.${ext}` });
  form.append('upload_preset', UPLOAD_PRESET);
  form.append('folder', 'ps_govindpur/attendance');
  const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: form });
  const data = await res.json();
  if (!data.secure_url) throw new Error(data.error?.message || 'Upload failed');
  return { url: data.secure_url, kind: type };
}

function UploadBlock({ docId, title, accent }) {
  const { isAdmin } = useAuth();
  const [entry,     setEntry]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getDoc(doc(db, COLLECTION, docId))
      .then(snap => { if (!active) return; if (snap.exists()) setEntry(snap.data()); setLoading(false); })
      .catch(() => setLoading(false));
    return () => { active = false; };
  }, [docId]);

  const save = async (newEntry) => {
    await setDoc(doc(db, COLLECTION, docId), newEntry);
    setEntry(newEntry);
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('अनुमति चाहिए', 'फोटो एक्सेस की अनुमति दें।'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85 });
    if (result.canceled) return;
    setUploading(true);
    try { await save(await uploadToCloudinary(result.assets[0].uri, 'image')); Alert.alert('सफल!', 'अपलोड हो गया।'); }
    catch (e) { Alert.alert('त्रुटि', 'अपलोड नहीं हुआ। पुनः प्रयास करें।'); }
    setUploading(false);
  };

  const pickPDF = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
    if (result.canceled) return;
    setUploading(true);
    try { await save(await uploadToCloudinary(result.assets[0].uri, 'pdf')); Alert.alert('सफल!', 'PDF अपलोड हो गई।'); }
    catch (e) { Alert.alert('त्रुटि', 'अपलोड नहीं हुआ। पुनः प्रयास करें।'); }
    setUploading(false);
  };

  const removeEntry = () => {
    Alert.alert('हटाएं?', 'क्या आप हटाना चाहते हैं?', [
      { text: 'नहीं', style: 'cancel' },
      { text: 'हाँ, हटाएं', style: 'destructive', onPress: async () => { await save({ url: '', kind: '' }); } },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <View style={s.secHead}><View style={[s.secBar,{backgroundColor:accent}]} /><Text style={s.secTitle}>{title}</Text></View>
      <View style={{ height: 12 }} />

      {isAdmin && (
        <View style={s.adminBox}>
          <Text style={s.adminLabel}>व्यवस्थापक — अपलोड करें</Text>
          {uploading ? (
            <View style={s.uploadingBox}><ActivityIndicator color={accent} size="large" /><Text style={s.uploadingTxt}>अपलोड हो रहा है...</Text></View>
          ) : (
            <View style={s.uploadBtns}>
              <TouchableOpacity onPress={pickImage} style={[s.uploadBtn,{backgroundColor:accent}]}>
                <Ionicons name="image-outline" size={20} color="#fff" />
                <Text style={s.uploadBtnTxt}>फोटो</Text>
                <Text style={s.uploadBtnSub}>JPG / PNG</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={pickPDF} style={[s.uploadBtn,{backgroundColor:'#0F2347'}]}>
                <Ionicons name="document-outline" size={20} color="#fff" />
                <Text style={s.uploadBtnTxt}>PDF</Text>
                <Text style={s.uploadBtnSub}>PDF फाइल</Text>
              </TouchableOpacity>
            </View>
          )}
          {entry?.url ? (
            <TouchableOpacity onPress={removeEntry} style={s.removeBtn}>
              <Ionicons name="trash-outline" size={15} color="#DC2626" />
              <Text style={s.removeBtnTxt}>हटाएं</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {loading ? (
        <View style={s.loaderBox}><ActivityIndicator color={accent} /></View>
      ) : entry?.url ? (
        entry.kind === 'image' ? (
          <View style={s.imageCard}>
            <Image source={{ uri: entry.url }} style={s.docImage} resizeMode="contain" />
            <TouchableOpacity onPress={() => Linking.openURL(entry.url)} style={s.openFullBtn}>
              <Ionicons name="expand-outline" size={16} color={COLORS.navyPrimary} />
              <Text style={s.openFullTxt}>पूर्ण स्क्रीन में देखें</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity activeOpacity={0.85} onPress={() => WebBrowser.openBrowserAsync(entry.url)} style={s.pdfCard}>
            <View style={[s.pdfIcon,{backgroundColor:accent}]}><Ionicons name="document-text" size={26} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.pdfTitle}>{title} PDF</Text>
              <Text style={s.pdfSub}>टैप करें · PDF खोलें</Text>
            </View>
            <Ionicons name="open-outline" size={22} color={accent} />
          </TouchableOpacity>
        )
      ) : (
        <View style={s.emptyCard}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.inkLight} />
          <Text style={s.emptyTxt}>शीघ्र उपलब्ध होगा</Text>
        </View>
      )}
    </ScrollView>
  );
}

export default function AttendanceScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selClass, setSelClass] = useState(null);

  let titleHi = 'अटेंडेंस', titleEng = 'Attendance';
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
              <View style={s.heroIcon}><Ionicons name="checkbox" size={28} color={COLORS.gold} /></View>
              <Text style={s.heroTitle}>उपस्थिति विवरण</Text>
              <Text style={s.heroSub}>कक्षावार उपस्थिति · सत्र 2026-27</Text>
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
        <UploadBlock docId={`class${CLASSES[selClass].n}`} title={CLASSES[selClass].hi} accent={CLASSES[selClass].color} />
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
  uploadBtns:   { flexDirection:'row', gap:12 },
  uploadBtn:    { flex:1, borderRadius:14, padding:14, alignItems:'center', gap:5 },
  uploadBtnTxt: { color:'#fff', fontSize:15, fontFamily:'NotoSansDevanagari_700Bold' },
  uploadBtnSub: { color:'rgba(255,255,255,0.7)', fontSize:11 },
  uploadingBox: { alignItems:'center', padding:18, gap:10 },
  uploadingTxt: { fontSize:14, color:COLORS.inkSoft, fontFamily:'NotoSansDevanagari_400Regular' },
  removeBtn:    { flexDirection:'row', alignItems:'center', gap:6, marginTop:12, alignSelf:'flex-start' },
  removeBtnTxt: { fontSize:13, color:'#DC2626', fontFamily:'NotoSansDevanagari_400Regular' },
  loaderBox:    { padding:30, alignItems:'center' },
  imageCard:    { backgroundColor:'#fff', borderRadius:16, overflow:'hidden', elevation:3, shadowColor:'#000', shadowOpacity:0.1, shadowRadius:8 },
  docImage:     { width:'100%', height:440 },
  openFullBtn:  { flexDirection:'row', alignItems:'center', gap:6, padding:12, justifyContent:'center', borderTopWidth:1, borderTopColor:'#F0EAE0' },
  openFullTxt:  { fontSize:13, color:COLORS.navyPrimary, fontFamily:'NotoSansDevanagari_700Bold' },
  pdfCard:      { flexDirection:'row', alignItems:'center', gap:14, backgroundColor:'#fff', borderRadius:14, padding:18, elevation:2, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:6, borderLeftWidth:4, borderLeftColor:'#0F2347' },
  pdfIcon:      { width:50, height:50, borderRadius:14, alignItems:'center', justifyContent:'center' },
  pdfTitle:     { fontSize:16, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },
  pdfSub:       { fontSize:12, color:COLORS.inkLight, marginTop:3, fontFamily:'NotoSansDevanagari_400Regular' },
  emptyCard:    { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:'#F5F0E8', borderRadius:14, padding:18 },
  emptyTxt:     { fontSize:14, color:COLORS.inkLight, fontFamily:'NotoSansDevanagari_400Regular', fontStyle:'italic' },
});
