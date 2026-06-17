import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';

const EVENTS = [
  {
    id: 1,
    title: 'स्कूल चलो अभियान',
    eng: 'School Enrolment Drive',
    icon: 'walk',
    color: '#1A3A6B',
    date: 'Phase 1: 1–15 अप्रैल  ·  Phase 2: 1–15 जुलाई',
    dateShort: '1 अप्रैल',
    points: [
      'Phase 1: अप्रैल 1–15 (नामांकन अभियान)',
      'Phase 2: जुलाई 1–15 (ड्रॉपआउट वापसी)',
    ],
  },
  {
    id: 2,
    title: 'विद्या प्रवेश',
    eng: 'School Readiness Program',
    icon: 'school',
    color: '#059669',
    date: '1 अप्रैल से',
    dateShort: '1 अप्रैल',
    points: [
      'कक्षा 1 के लिए 12-सप्ताह स्कूल रेडिनेस कार्यक्रम',
      'प्रारंभ: 1 अप्रैल से (विद्या प्रघोषा 2)',
    ],
  },
  {
    id: 3,
    title: 'समर कैंप',
    eng: 'Summer Camp',
    icon: 'sunny',
    color: '#C2410C',
    date: '20 मई – 15 जून',
    dateShort: 'मई–जून',
    points: [
      'सृजनात्मक व खेलकूद गतिविधियाँ',
      'विद्यार्थियों की रचनात्मकता का विकास',
    ],
  },
  {
    id: 4,
    title: 'शिक्षण कार्य एवं पाठ्य सहगामी क्रियाएँ',
    eng: 'Teaching & Co-Curricular',
    icon: 'book',
    color: '#7C3AED',
    date: 'पूरे सत्र',
    dateShort: 'सत्र भर',
    points: [
      'प्रत्येक कक्षा के लिए मासिक शिक्षण योजना',
      'विद्यालय पुस्तकालय का सुदृढ़ उपयोग',
      'प्रत्यक्ष लाभ अंतरण (DBT) हेतु बैंक खाते',
      'पाठ्यपुस्तकों व कार्यपुस्तिकाओं का वितरण',
    ],
  },
  {
    id: 5,
    title: 'खान एकेडमी',
    eng: 'Khan Academy',
    icon: 'laptop',
    color: '#0369A1',
    date: '31 दिसंबर – 14 जनवरी',
    dateShort: 'दिसं–जन',
    points: [
      'कक्षा 6–8: गणित और विज्ञान में विषयाधारित शिक्षण',
      'प्रत्यक्ष लाभ अंतरण (DBT) हेतु बैंक खाते सत्यापन',
    ],
  },
  {
    id: 6,
    title: 'आकलन एवं परीक्षाएँ',
    eng: 'Assessments & Exams',
    icon: 'document-text',
    color: '#BE185D',
    date: 'अगस्त / सितंबर / दिसंबर / मार्च',
    dateShort: 'त्रैमासिक',
    points: [
      'प्रथम सत्र परीक्षा — अगस्त',
      'अर्ध-वार्षिक परीक्षा — सितंबर',
      'द्वितीय सत्र परीक्षा — दिसंबर',
      'वार्षिक परीक्षा — मार्च',
    ],
  },
  {
    id: 7,
    title: 'खेलकूद एवं शारीरिक शिक्षा',
    eng: 'Sports & Physical Education',
    icon: 'football',
    color: '#138808',
    date: '31 दिसंबर  ·  29 अगस्त',
    dateShort: 'अगस्त–दिसं',
    points: [
      'दैनिक शारीरिक व्यायाम और योग',
      'सदनवार खेल-कूद प्रतियोगिताएँ',
      'राष्ट्रीय खेल दिवस — 29 अगस्त',
      'उच्च प्राथमिक छात्र-छात्राओं का शैक्षिक भ्रमण — 29 अगस्त',
    ],
  },
  {
    id: 8,
    title: 'विद्या प्रवेश (मिशन शक्ति)',
    eng: 'Vidya Pravesh – Mission Shakti',
    icon: 'star',
    color: '#B45309',
    date: '15 अगस्त',
    dateShort: '15 अगस्त',
    points: [
      '12 वड़ी स्कूल स्तामान्, Phase 2',
      'खान एकेडमी',
      'डीजिल यारियरस',
    ],
  },
  {
    id: 9,
    title: 'बालिका सशक्तिकरण (मिशन शक्ति)',
    eng: 'Girl Empowerment – Mission Shakti',
    icon: 'female',
    color: '#9D174D',
    date: 'पूरे सत्र',
    dateShort: 'सत्र भर',
    points: [
      'शक्ति मंच का गठन एवं नियमित बैठक',
      'बाल एवं महिला अधिकारों पर चर्चा',
      'आत्मरक्षा के उपायों पर अभ्यास',
      'शैक्षिक एवं सांस्कृतिक गतिविधियों का आयोजन',
    ],
  },
  {
    id: 10,
    title: 'विद्यालय प्रबंध समिति (SMC) बैठक',
    eng: 'School Management Committee',
    icon: 'people',
    color: '#0891B2',
    date: 'नियमित',
    dateShort: 'नियमित',
    points: [
      'त्रैमासिक SMC बैठक का आयोजन',
      'विद्यालय विकास योजना की समीक्षा',
    ],
  },
  {
    id: 11,
    title: 'मेगा PTM',
    eng: 'Parent Teacher Meeting',
    icon: 'chatbubbles',
    color: '#065F46',
    date: 'त्रैमासिक आयोजन',
    dateShort: 'त्रैमासिक',
    points: [
      'अभिभावक-शिक्षक संवाद',
      'छात्र प्रगति पत्र वितरण',
      'अगले सत्र की योजना',
    ],
  },
];

export default function CalendarScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(null);

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#060F24','#0F2347','#1A3A6B']} style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} hitSlop={{top:10,bottom:10,left:10,right:10}}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerTitle}>
          <Text style={s.headerHindi}>वार्षिक कैलेंडर</Text>
          <Text style={s.headerEng}>Academic Calendar 2026–27</Text>
        </View>
        <View style={{ width: 38 }} />
      </LinearGradient>
      <View style={s.tricolor}>
        <View style={[s.stripe, { backgroundColor: '#FF9933' }]} />
        <View style={[s.stripe, { backgroundColor: '#fff' }]} />
        <View style={[s.stripe, { backgroundColor: '#138808' }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Hero band */}
        <LinearGradient colors={['#0F2347','#1A3A6B','#1E4D8C']} style={s.hero}>
          <View style={s.heroIcon}>
            <Ionicons name="calendar" size={30} color={COLORS.gold} />
          </View>
          <Text style={s.heroTitle}>शैक्षिक सत्र 2026–27</Text>
          <Text style={s.heroSub}>समग्र शिक्षा, उत्तर प्रदेश सरकार</Text>
          <View style={s.heroPills}>
            <View style={s.pill}><Text style={s.pillTxt}>11 कार्यक्रम</Text></View>
            <View style={s.pill}><Text style={s.pillTxt}>अप्रैल – मार्च</Text></View>
          </View>
        </LinearGradient>

        {/* Tap-to-expand event cards */}
        <View style={s.section}>
          <View style={s.secHead}>
            <View style={s.secBar} />
            <Text style={s.secTitle}>कार्यक्रम एवं गतिविधियाँ</Text>
          </View>
          <Text style={s.secTitleEng}>Events & Activities  ·  tap to expand</Text>

          {EVENTS.map((ev) => {
            const open = expanded === ev.id;
            return (
              <TouchableOpacity
                key={ev.id}
                activeOpacity={0.85}
                onPress={() => setExpanded(open ? null : ev.id)}
                style={s.card}
              >
                <View style={s.cardRow}>
                  <View style={[s.cardIcon, { backgroundColor: ev.color }]}>
                    <Ionicons name={ev.icon} size={20} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.cardTitle}>{ev.title}</Text>
                    <Text style={s.cardEng}>{ev.eng}</Text>
                  </View>
                  <View style={s.dateBadge}>
                    <Text style={s.dateBadgeTxt}>{ev.dateShort}</Text>
                  </View>
                  <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={COLORS.inkLight}
                    style={{ marginLeft: 6 }}
                  />
                </View>

                {open && (
                  <View style={s.cardBody}>
                    <View style={[s.cardDivider, { backgroundColor: ev.color }]} />
                    <Text style={s.cardDate}>
                      <Ionicons name="time-outline" size={12} color={COLORS.inkLight} /> {'  '}{ev.date}
                    </Text>
                    {ev.points.map((p, pi) => (
                      <View key={pi} style={s.pointRow}>
                        <View style={[s.bullet, { backgroundColor: ev.color }]} />
                        <Text style={s.pointText}>{p}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer note */}
        <View style={s.footerNote}>
          <Ionicons name="information-circle" size={16} color={COLORS.inkLight} />
          <Text style={s.footerTxt}>सभी परिषदीय विद्यालयों द्वारा कैलेंडर का कड़ाई से पालन सुनिश्चित किया जाए।</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#FBF3E4' },
  tricolor:     { flexDirection: 'row', height: 4 },
  stripe:       { flex: 1 },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn:      { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:  { alignItems: 'center' },
  headerHindi:  { color: '#fff', fontSize: 18, fontFamily: 'NotoSansDevanagari_700Bold' },
  headerEng:    { color: COLORS.saffronLight, fontSize: 10, marginTop: 1 },

  hero:         { marginHorizontal: 16, marginTop: 16, borderRadius: 18, padding: 22, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8 },
  heroIcon:     { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(201,168,76,0.15)', borderWidth: 1.5, borderColor: COLORS.gold, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  heroTitle:    { color: '#fff', fontSize: 20, fontFamily: 'NotoSansDevanagari_700Bold', textAlign: 'center' },
  heroSub:      { color: '#C9DCF0', fontSize: 12, marginTop: 4, fontFamily: 'NotoSansDevanagari_400Regular' },
  heroPills:    { flexDirection: 'row', gap: 10, marginTop: 14 },
  pill:         { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  pillTxt:      { color: '#fff', fontSize: 12, fontFamily: 'NotoSansDevanagari_400Regular' },

  section:      { paddingHorizontal: 16, paddingTop: 22 },
  secHead:      { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  secBar:       { width: 4, height: 22, backgroundColor: COLORS.saffron, borderRadius: 2, marginRight: 10 },
  secTitle:     { fontSize: 18, fontFamily: 'NotoSansDevanagari_700Bold', color: COLORS.navyPrimary },
  secTitleEng:  { fontSize: 11, color: COLORS.inkLight, marginLeft: 14, marginBottom: 14, letterSpacing: 0.4 },

  card:         { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6 },
  cardRow:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIcon:     { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTitle:    { fontSize: 14, fontFamily: 'NotoSansDevanagari_700Bold', color: COLORS.navyDark },
  cardEng:      { fontSize: 11, color: COLORS.inkLight, marginTop: 1 },
  dateBadge:    { backgroundColor: '#EEF2FF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  dateBadgeTxt: { fontSize: 10, color: COLORS.navyPrimary, fontFamily: 'NotoSansDevanagari_700Bold' },

  cardBody:     { marginTop: 12 },
  cardDivider:  { height: 2, borderRadius: 1, marginBottom: 10, opacity: 0.3 },
  cardDate:     { fontSize: 12, color: COLORS.inkLight, marginBottom: 8, fontFamily: 'NotoSansDevanagari_400Regular' },
  pointRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  bullet:       { width: 7, height: 7, borderRadius: 4, marginTop: 5 },
  pointText:    { flex: 1, fontSize: 13, color: COLORS.inkSoft, lineHeight: 20, fontFamily: 'NotoSansDevanagari_400Regular' },

  footerNote:   { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginHorizontal: 16, marginTop: 8, backgroundColor: '#F5F0E8', borderRadius: 10, padding: 12 },
  footerTxt:    { flex: 1, fontSize: 11, color: COLORS.inkLight, lineHeight: 17, fontFamily: 'NotoSansDevanagari_400Regular', fontStyle: 'italic' },
});
