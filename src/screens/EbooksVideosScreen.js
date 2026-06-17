import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';

// ============ CONTENT DATA — fill in pdf + video URLs here ============
// pdf: paste the Cloudinary PDF link.   videos: array of { title, url }.
const CLASSES = [
  {
    cls: 'कक्षा 1', clsEng: 'Class 1', color: '#1A3A6B',
    subjects: [
      { name: 'हिन्दी',   eng: 'Hindi',   pdf: '', videos: [] },
      { name: 'अंग्रेज़ी', eng: 'English', pdf: '', videos: [] },
      { name: 'गणित',     eng: 'Maths',   pdf: '', videos: [] },
    ],
  },
  {
    cls: 'कक्षा 2', clsEng: 'Class 2', color: '#C2410C',
    subjects: [
      { name: 'हिन्दी',   eng: 'Hindi',   pdf: '', videos: [] },
      { name: 'अंग्रेज़ी', eng: 'English', pdf: '', videos: [] },
      { name: 'गणित',     eng: 'Maths',   pdf: '', videos: [] },
    ],
  },
  {
    cls: 'कक्षा 3', clsEng: 'Class 3', color: '#138808',
    subjects: [
      { name: 'हिन्दी',   eng: 'Hindi',    pdf: '', videos: [] },
      { name: 'अंग्रेज़ी', eng: 'English',  pdf: '', videos: [] },
      { name: 'गणित',     eng: 'Maths',    pdf: '', videos: [] },
      { name: 'पर्यावरण',  eng: 'EVS',      pdf: '', videos: [] },
      { name: 'संस्कृत',   eng: 'Sanskrit', pdf: '', videos: [] },
    ],
  },
  {
    cls: 'कक्षा 4', clsEng: 'Class 4', color: '#7C3AED',
    subjects: [
      { name: 'हिन्दी',   eng: 'Hindi',    pdf: '', videos: [] },
      { name: 'अंग्रेज़ी', eng: 'English',  pdf: '', videos: [] },
      { name: 'गणित',     eng: 'Maths',    pdf: '', videos: [] },
      { name: 'पर्यावरण',  eng: 'EVS',      pdf: '', videos: [] },
      { name: 'संस्कृत',   eng: 'Sanskrit', pdf: '', videos: [] },
    ],
  },
  {
    cls: 'कक्षा 5', clsEng: 'Class 5', color: '#BE185D',
    subjects: [
      { name: 'हिन्दी',   eng: 'Hindi',    pdf: '', videos: [] },
      { name: 'अंग्रेज़ी', eng: 'English',  pdf: '', videos: [] },
      { name: 'गणित',     eng: 'Maths',    pdf: '', videos: [] },
      { name: 'पर्यावरण',  eng: 'EVS',      pdf: '', videos: [] },
      { name: 'संस्कृत',   eng: 'Sanskrit', pdf: '', videos: [] },
    ],
  },
];
// =====================================================================

export default function EbooksVideosScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selClass, setSelClass] = useState(null);   // index into CLASSES
  const [selSub, setSelSub]     = useState(null);   // index into subjects

  const openUrl = (url) => {
    if (!url) return;
    Linking.openURL(url).catch(() => {});
  };

  // Header title changes by level
  let titleHi = 'ई-पुस्तकें व वीडियो', titleEng = 'E-Books & Videos';
  if (selClass !== null && selSub === null) { titleHi = CLASSES[selClass].cls; titleEng = CLASSES[selClass].clsEng; }
  if (selClass !== null && selSub !== null) { titleHi = CLASSES[selClass].subjects[selSub].name; titleEng = CLASSES[selClass].subjects[selSub].eng; }

  const goBack = () => {
    if (selSub !== null) { setSelSub(null); return; }
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
          <Text style={s.headerHindi}>{titleHi}</Text>
          <Text style={s.headerEng}>{titleEng}</Text>
        </View>
        <View style={{ width: 38 }} />
      </LinearGradient>
      <View style={s.tricolor}>
        <View style={[s.stripe,{backgroundColor:'#FF9933'}]} />
        <View style={[s.stripe,{backgroundColor:'#fff'}]} />
        <View style={[s.stripe,{backgroundColor:'#138808'}]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* LEVEL 1 — class list */}
        {selClass === null && (
          <View style={s.section}>
            <LinearGradient colors={['#0F2347','#1A3A6B','#1E4D8C']} style={s.hero}>
              <View style={s.heroIcon}><Ionicons name="library" size={28} color={COLORS.gold} /></View>
              <Text style={s.heroTitle}>डिजिटल पुस्तकालय</Text>
              <Text style={s.heroSub}>कक्षावार ई-पुस्तकें व वीडियो सामग्री</Text>
            </LinearGradient>

            <View style={{height:8}} />
            {CLASSES.map((c, i) => (
              <TouchableOpacity key={i} activeOpacity={0.85} onPress={() => setSelClass(i)} style={s.classCard}>
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
        )}

        {/* LEVEL 2 — subject list */}
        {selClass !== null && selSub === null && (
          <View style={s.section}>
            <View style={s.secHead}>
              <View style={s.secBar} />
              <Text style={s.secTitle}>विषय चुनें</Text>
            </View>
            <Text style={s.secTitleEng}>Select Subject  ·  {CLASSES[selClass].clsEng}</Text>

            {CLASSES[selClass].subjects.map((sub, i) => (
              <TouchableOpacity key={i} activeOpacity={0.85} onPress={() => setSelSub(i)} style={s.subCard}>
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
        )}

        {/* LEVEL 3 — content (pdf + videos) */}
        {selClass !== null && selSub !== null && (
          <View style={s.section}>
            {(() => {
              const sub = CLASSES[selClass].subjects[selSub];
              const accent = CLASSES[selClass].color;
              return (
                <>
                  {/* E-Book */}
                  <View style={s.secHead}>
                    <View style={s.secBar} />
                    <Text style={s.secTitle}>ई-पुस्तक</Text>
                  </View>
                  <Text style={s.secTitleEng}>E-Book (PDF)</Text>

                  {sub.pdf ? (
                    <TouchableOpacity activeOpacity={0.85} onPress={() => openUrl(sub.pdf)} style={s.pdfCard}>
                      <View style={[s.pdfIcon,{backgroundColor:'#C2410C'}]}>
                        <Ionicons name="document-text" size={24} color="#fff" />
                      </View>
                      <View style={{flex:1}}>
                        <Text style={s.pdfTitle}>{sub.name} — पाठ्यपुस्तक</Text>
                        <Text style={s.pdfSub}>टैप करें · PDF खोलें</Text>
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
                  <View style={[s.secHead,{marginTop:24}]}>
                    <View style={s.secBar} />
                    <Text style={s.secTitle}>वीडियो सामग्री</Text>
                  </View>
                  <Text style={s.secTitleEng}>Video Lessons</Text>

                  {sub.videos && sub.videos.length > 0 ? (
                    sub.videos.map((v, i) => (
                      <TouchableOpacity key={i} activeOpacity={0.85} onPress={() => openUrl(v.url)} style={s.videoCard}>
                        <View style={[s.videoIcon,{backgroundColor:'#0369A1'}]}>
                          <Ionicons name="play" size={20} color="#fff" />
                        </View>
                        <Text style={s.videoTitle}>{v.title}</Text>
                        <Ionicons name="open-outline" size={18} color="#0369A1" />
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={s.emptyCard}>
                      <Ionicons name="videocam-outline" size={18} color={COLORS.inkLight} />
                      <Text style={s.emptyTxt}>वीडियो शीघ्र उपलब्ध होंगे</Text>
                    </View>
                  )}
                </>
              );
            })()}
          </View>
        )}

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

  classCard:    { flexDirection:'row', alignItems:'center', gap:14, backgroundColor:'#fff', borderRadius:14, padding:14, marginBottom:10, elevation:2, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:6 },
  classNum:     { width:48, height:48, borderRadius:14, alignItems:'center', justifyContent:'center' },
  classNumTxt:  { color:'#fff', fontSize:22, fontFamily:'NotoSansDevanagari_700Bold' },
  classCardTitle:{ fontSize:17, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },
  classCardSub: { fontSize:12, color:COLORS.inkLight, marginTop:2, fontFamily:'NotoSansDevanagari_400Regular' },

  subCard:      { flexDirection:'row', alignItems:'center', gap:14, backgroundColor:'#fff', borderRadius:14, padding:14, marginBottom:10, elevation:2, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:6 },
  subIcon:      { width:44, height:44, borderRadius:12, alignItems:'center', justifyContent:'center' },
  subTitle:     { fontSize:16, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },
  subSub:       { fontSize:12, color:COLORS.inkLight, marginTop:2, fontFamily:'NotoSansDevanagari_400Regular' },

  pdfCard:      { flexDirection:'row', alignItems:'center', gap:14, backgroundColor:'#fff', borderRadius:14, padding:16, elevation:2, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:6, borderLeftWidth:4, borderLeftColor:'#C2410C' },
  pdfIcon:      { width:48, height:48, borderRadius:12, alignItems:'center', justifyContent:'center' },
  pdfTitle:     { fontSize:15, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },
  pdfSub:       { fontSize:12, color:COLORS.inkLight, marginTop:2, fontFamily:'NotoSansDevanagari_400Regular' },

  videoCard:    { flexDirection:'row', alignItems:'center', gap:14, backgroundColor:'#fff', borderRadius:14, padding:14, marginBottom:10, elevation:2, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:6 },
  videoIcon:    { width:40, height:40, borderRadius:20, alignItems:'center', justifyContent:'center' },
  videoTitle:   { flex:1, fontSize:14, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },

  emptyCard:    { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'#F5F0E8', borderRadius:12, padding:16 },
  emptyTxt:     { fontSize:13, color:COLORS.inkLight, fontFamily:'NotoSansDevanagari_400Regular', fontStyle:'italic' },
});
