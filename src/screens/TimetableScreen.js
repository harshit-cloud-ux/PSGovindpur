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
const DOC_ID        = 'timetable';

async function uploadToCloudinary(uri, type) {
  const ext  = uri.split('.').pop().toLowerCase();
  const mime = type === 'pdf' ? 'application/pdf'
             : ext === 'png'  ? 'image/png'
             : 'image/jpeg';
  const form = new FormData();
  form.append('file', { uri, type: mime, name: `timetable.${ext}` });
  form.append('upload_preset', UPLOAD_PRESET);
  form.append('folder', 'ps_govindpur/timetable');
  const resType = 'image';
  const res  = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resType}/upload`,
    { method: 'POST', body: form }
  );
  const data = await res.json();
  if (!data.secure_url) throw new Error(data.error?.message || 'Upload failed');
  return { url: data.secure_url, kind: type };
}

export default function TimetableScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isAdmin } = useAuth();

  const [entry,     setEntry]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'school', DOC_ID))
      .then(snap => {
        if (snap.exists()) setEntry(snap.data());
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const saveToFirestore = async (newEntry) => {
    await setDoc(doc(db, 'school', DOC_ID), newEntry);
    setEntry(newEntry);
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('अनुमति चाहिए', 'फोटो एक्सेस की अनुमति दें।'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: false,
    });
    if (result.canceled) return;
    const uri = result.assets[0].uri;
    setUploading(true);
    try {
      const newEntry = await uploadToCloudinary(uri, 'image');
      await saveToFirestore(newEntry);
      Alert.alert('सफल!', 'समय-सारणी अपलोड हो गई।');
    } catch (e) {
      Alert.alert('त्रुटि', 'अपलोड नहीं हुआ। पुनः प्रयास करें।');
    }
    setUploading(false);
  };

  const pickPDF = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const uri = result.assets[0].uri;
    setUploading(true);
    try {
      const newEntry = await uploadToCloudinary(uri, 'pdf');
      await saveToFirestore(newEntry);
      Alert.alert('सफल!', 'PDF अपलोड हो गई।');
    } catch (e) {
      Alert.alert('त्रुटि', 'अपलोड नहीं हुआ। पुनः प्रयास करें।');
    }
    setUploading(false);
  };

  const removeEntry = () => {
    Alert.alert('हटाएं?', 'क्या आप समय-सारणी हटाना चाहते हैं?', [
      { text: 'नहीं', style: 'cancel' },
      { text: 'हाँ, हटाएं', style: 'destructive', onPress: async () => {
        await saveToFirestore({ url: '', kind: '' });
      }},
    ]);
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#060F24','#0F2347','#1A3A6B']} style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} hitSlop={{top:10,bottom:10,left:10,right:10}}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerTitle}>
          <Text style={s.headerHindi}>समय-सारणी</Text>
          <Text style={s.headerEng}>Timetable</Text>
        </View>
        <View style={{ width: 38 }} />
      </LinearGradient>
      <View style={s.tricolor}>
        <View style={[s.stripe,{backgroundColor:'#FF9933'}]} />
        <View style={[s.stripe,{backgroundColor:'#fff'}]} />
        <View style={[s.stripe,{backgroundColor:'#138808'}]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        <View style={s.section}>
          <LinearGradient colors={['#0F2347','#1A3A6B','#1E4D8C']} style={s.hero}>
            <View style={s.heroIcon}><Ionicons name="calendar" size={28} color={COLORS.gold} /></View>
            <Text style={s.heroTitle}>कक्षा समय-सारणी</Text>
            <Text style={s.heroSub}>प्राथमिक विद्यालय गोविंदपुर · सत्र 2026-27</Text>
          </LinearGradient>
        </View>

        {isAdmin && (
          <View style={s.section}>
            <View style={s.adminBox}>
              <Text style={s.adminLabel}>व्यवस्थापक — समय-सारणी अपलोड करें</Text>
              {uploading ? (
                <View style={s.uploadingBox}>
                  <ActivityIndicator color={COLORS.navyPrimary} size="large" />
                  <Text style={s.uploadingTxt}>अपलोड हो रहा है...</Text>
                </View>
              ) : (
                <View style={s.uploadBtns}>
                  <TouchableOpacity onPress={pickImage} style={s.uploadBtn}>
                    <Ionicons name="image-outline" size={22} color="#fff" />
                    <Text style={s.uploadBtnTxt}>फोटो चुनें</Text>
                    <Text style={s.uploadBtnSub}>JPG / PNG</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={pickPDF} style={[s.uploadBtn,{backgroundColor:'#C2410C'}]}>
                    <Ionicons name="document-outline" size={22} color="#fff" />
                    <Text style={s.uploadBtnTxt}>PDF चुनें</Text>
                    <Text style={s.uploadBtnSub}>PDF फाइल</Text>
                  </TouchableOpacity>
                </View>
              )}
              {entry?.url ? (
                <TouchableOpacity onPress={removeEntry} style={s.removeBtn}>
                  <Ionicons name="trash-outline" size={15} color="#DC2626" />
                  <Text style={s.removeBtnTxt}>मौजूदा समय-सारणी हटाएं</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}

        <View style={s.section}>
          <View style={s.secHead}><View style={s.secBar} /><Text style={s.secTitle}>समय-सारणी</Text></View>
          <Text style={s.secTitleEng}>Class Timetable</Text>

          {loading ? (
            <View style={s.loaderBox}><ActivityIndicator color={COLORS.navyPrimary} size="large" /></View>
          ) : entry?.url ? (
            entry.kind === 'image' ? (
              <View style={s.imageCard}>
                <Image source={{ uri: entry.url }} style={s.timetableImage} resizeMode="contain" />
                <TouchableOpacity onPress={() => Linking.openURL(entry.url)} style={s.openFullBtn}>
                  <Ionicons name="expand-outline" size={16} color={COLORS.navyPrimary} />
                  <Text style={s.openFullTxt}>पूर्ण स्क्रीन में देखें</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity activeOpacity={0.85} onPress={() => WebBrowser.openBrowserAsync(entry.url)} style={s.pdfCard}>
                <View style={s.pdfIcon}>
                  <Ionicons name="document-text" size={28} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.pdfTitle}>समय-सारणी PDF</Text>
                  <Text style={s.pdfSub}>टैप करें · PDF खोलें</Text>
                </View>
                <Ionicons name="open-outline" size={22} color="#C2410C" />
              </TouchableOpacity>
            )
          ) : (
            <View style={s.emptyCard}>
              <Ionicons name="time-outline" size={22} color={COLORS.inkLight} />
              <View style={{ flex: 1 }}>
                <Text style={s.emptyTxt}>समय-सारणी शीघ्र उपलब्ध होगी</Text>
                <Text style={s.emptyTxtEng}>Timetable will be uploaded soon</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:         { flex:1, backgroundColor:'#FBF3E4' },
  tricolor:     { flexDirection:'row', height:4 },
  stripe:       { flex:1 },
  header:       { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:14 },
  backBtn:      { width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,255,255,0.12)', borderWidth:1, borderColor:'rgba(255,255,255,0.18)', alignItems:'center', justifyContent:'center' },
  headerTitle:  { alignItems:'center', flex:1 },
  headerHindi:  { color:'#fff', fontSize:18, fontFamily:'NotoSansDevanagari_700Bold' },
  headerEng:    { color:COLORS.saffronLight, fontSize:10, marginTop:1 },
  hero:         { borderRadius:18, padding:22, alignItems:'center', elevation:4, shadowColor:'#000', shadowOpacity:0.2, shadowRadius:8 },
  heroIcon:     { width:56, height:56, borderRadius:28, backgroundColor:'rgba(201,168,76,0.15)', borderWidth:1.5, borderColor:COLORS.gold, alignItems:'center', justifyContent:'center', marginBottom:12 },
  heroTitle:    { color:'#fff', fontSize:20, fontFamily:'NotoSansDevanagari_700Bold', textAlign:'center' },
  heroSub:      { color:'#C9DCF0', fontSize:12, marginTop:5, textAlign:'center', fontFamily:'NotoSansDevanagari_400Regular' },
  section:      { paddingHorizontal:16, paddingTop:16 },
  secHead:      { flexDirection:'row', alignItems:'center', marginBottom:4 },
  secBar:       { width:4, height:22, backgroundColor:COLORS.saffron, borderRadius:2, marginRight:10 },
  secTitle:     { fontSize:18, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyPrimary },
  secTitleEng:  { fontSize:11, color:COLORS.inkLight, marginLeft:14, marginBottom:14, letterSpacing:0.4 },
  adminBox:     { backgroundColor:'#fff', borderRadius:16, padding:16, elevation:2, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:6, borderLeftWidth:4, borderLeftColor:COLORS.saffron },
  adminLabel:   { fontSize:13, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark, marginBottom:14 },
  uploadBtns:   { flexDirection:'row', gap:12 },
  uploadBtn:    { flex:1, backgroundColor:COLORS.navyPrimary, borderRadius:14, padding:16, alignItems:'center', gap:6 },
  uploadBtnTxt: { color:'#fff', fontSize:15, fontFamily:'NotoSansDevanagari_700Bold' },
  uploadBtnSub: { color:'rgba(255,255,255,0.7)', fontSize:11 },
  uploadingBox: { alignItems:'center', padding:20, gap:10 },
  uploadingTxt: { fontSize:14, color:COLORS.inkSoft, fontFamily:'NotoSansDevanagari_400Regular' },
  removeBtn:    { flexDirection:'row', alignItems:'center', gap:6, marginTop:14, alignSelf:'flex-start' },
  removeBtnTxt: { fontSize:13, color:'#DC2626', fontFamily:'NotoSansDevanagari_400Regular' },
  loaderBox:    { padding:40, alignItems:'center' },
  imageCard:    { backgroundColor:'#fff', borderRadius:16, overflow:'hidden', elevation:3, shadowColor:'#000', shadowOpacity:0.1, shadowRadius:8 },
  timetableImage:{ width:'100%', height:480 },
  openFullBtn:  { flexDirection:'row', alignItems:'center', gap:6, padding:12, justifyContent:'center', borderTopWidth:1, borderTopColor:'#F0EAE0' },
  openFullTxt:  { fontSize:13, color:COLORS.navyPrimary, fontFamily:'NotoSansDevanagari_700Bold' },
  pdfCard:      { flexDirection:'row', alignItems:'center', gap:14, backgroundColor:'#fff', borderRadius:14, padding:18, elevation:2, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:6, borderLeftWidth:4, borderLeftColor:'#C2410C' },
  pdfIcon:      { width:52, height:52, borderRadius:14, backgroundColor:'#C2410C', alignItems:'center', justifyContent:'center' },
  pdfTitle:     { fontSize:16, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },
  pdfSub:       { fontSize:12, color:COLORS.inkLight, marginTop:3, fontFamily:'NotoSansDevanagari_400Regular' },
  emptyCard:    { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:'#F5F0E8', borderRadius:14, padding:18 },
  emptyTxt:     { fontSize:14, color:COLORS.inkLight, fontFamily:'NotoSansDevanagari_400Regular', fontStyle:'italic' },
  emptyTxtEng:  { fontSize:11, color:COLORS.inkLight, marginTop:3 },
});
