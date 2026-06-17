import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';

const HOLIDAYS = [
  { n:1,  name:'हजरत अली का जन्म दिवस',         date:'03 जनवरी 2026',   day:'शनिवार',  month:'जन', color:'#1A3A6B' },
  { n:2,  name:'मकर संक्रान्ति',                 date:'14 जनवरी 2026',   day:'बुधवार',  month:'जन', color:'#C2410C' },
  { n:3,  name:'बसंत पंचमी',                     date:'23 जनवरी 2026',   day:'शुक्रवार', month:'जन', color:'#B45309' },
  { n:4,  name:'गणतन्त्र दिवस',                  date:'26 जनवरी 2026',   day:'सोमवार',  month:'जन', color:'#138808' },
  { n:5,  name:'संत रविदास जयंती',               date:'01 फरवरी 2026',   day:'रविवार',  month:'फर', color:'#7C3AED' },
  { n:6,  name:'महाशिवरात्रि',                   date:'15 फरवरी 2026',   day:'रविवार',  month:'फर', color:'#1A3A6B' },
  { n:7,  name:'होलिका दहन',                     date:'02 मार्च 2026',   day:'सोमवार',  month:'मार', color:'#C2410C' },
  { n:8,  name:'होली',                           date:'04 मार्च 2026',   day:'बुधवार',  month:'मार', color:'#BE185D' },
  { n:9,  name:'ईद-उल-फितर',                     date:'21 मार्च 2026',   day:'शनिवार',  month:'मार', color:'#059669' },
  { n:10, name:'रामनवमी',                        date:'26 मार्च 2026',   day:'गुरुवार', month:'मार', color:'#B45309' },
  { n:11, name:'महावीर जयन्ती',                  date:'31 मार्च 2026',   day:'मंगलवार', month:'मार', color:'#7C3AED' },
  { n:12, name:'गुड फ्राइडे',                    date:'03 अप्रैल 2026',  day:'शुक्रवार', month:'अप्र', color:'#1A3A6B' },
  { n:13, name:'डा० भीमराव अम्बेडकर जन्म दिवस',  date:'14 अप्रैल 2026',  day:'मंगलवार', month:'अप्र', color:'#0891B2' },
  { n:14, name:'बुद्ध पूर्णिमा',                 date:'01 मई 2026',      day:'शुक्रवार', month:'मई', color:'#B45309' },
  { n:15, name:'ईदुज्जुहा (बकरीद)',             date:'27 मई 2026',      day:'बुधवार',  month:'मई', color:'#059669' },
  { n:16, name:'मोहर्रम',                        date:'26 जून 2026',     day:'शुक्रवार', month:'जून', color:'#059669' },
  { n:17, name:'चेहल्लुम',                       date:'04 अगस्त 2026',   day:'मंगलवार', month:'अग', color:'#059669' },
  { n:18, name:'स्वतंत्रता दिवस',               date:'15 अगस्त 2026',   day:'शनिवार',  month:'अग', color:'#138808' },
  { n:19, name:'ईद-ए-मिलाद / बारावफात',         date:'26 अगस्त 2026',   day:'बुधवार',  month:'अग', color:'#059669' },
  { n:20, name:'रक्षाबंधन',                      date:'28 अगस्त 2026',   day:'शुक्रवार', month:'अग', color:'#BE185D' },
  { n:21, name:'जन्माष्टमी',                     date:'04 सितम्बर 2026', day:'शुक्रवार', month:'सित', color:'#1A3A6B' },
  { n:22, name:'विश्वकर्मा पूजा',               date:'17 सितम्बर 2026', day:'गुरुवार', month:'सित', color:'#C2410C' },
  { n:23, name:'अनन्त चतुर्दशी',                date:'25 सितम्बर 2026', day:'शुक्रवार', month:'सित', color:'#B45309' },
  { n:24, name:'महात्मा गाँधी जन्मदिवस',        date:'02 अक्टूबर 2026', day:'शुक्रवार', month:'अक्ट', color:'#138808' },
  { n:25, name:'दशहरा (महा नवमी) / (विजय दशमी)', date:'20 अक्टूबर 2026', day:'मंगलवार', month:'अक्ट', color:'#C2410C' },
  { n:26, name:'महर्षि बाल्मीकि जयंती',         date:'26 अक्टूबर 2026', day:'सोमवार',  month:'अक्ट', color:'#7C3AED' },
  { n:27, name:'सरदार वल्लभ भाई पटेल जयंती / आचार्य नरेन्द्र देव जयंती', date:'31 अक्टूबर 2026', day:'शनिवार', month:'अक्ट', color:'#B45309' },
  { n:28, name:'नरक चतुर्दशी / दीपावली',        date:'08 नवम्बर 2026',  day:'रविवार',  month:'नव', color:'#C2410C' },
  { n:29, name:'गोवर्धन पूजा',                   date:'09 नवम्बर 2026',  day:'सोमवार',  month:'नव', color:'#B45309' },
  { n:30, name:'भैया दूज / चित्रगुप्त जयंती',   date:'11 नवम्बर 2026',  day:'बुधवार',  month:'नव', color:'#BE185D' },
  { n:31, name:'छठ पूजा पर्व',                   date:'15 नवम्बर 2026',  day:'रविवार',  month:'नव', color:'#C2410C' },
  { n:32, name:'गुरुनानक जयंती / कार्तिक पूर्णिमा / गुरु तेगबहादुर शहीद दिवस', date:'24 नवम्बर 2026', day:'मंगलवार', month:'नव', color:'#1A3A6B' },
  { n:33, name:'क्रिसमस डे',                     date:'25 दिसम्बर 2026', day:'शुक्रवार', month:'दिस', color:'#138808' },
];

const RULES = [
  'तालिका में अंकित अवकाश सभी परिषदीय एवं मान्यता प्राप्त विद्यालयों में अनिवार्य रूप से देय होंगे।',
  'जिलाधिकारी द्वारा घोषित स्थानीय अवकाश अलग से देय होंगे।',
  'मुस्लिम त्योहारों के अवकाश चन्द्र दर्शन (चाँद दिखने) के अनुसार ही मान्य होंगे।',
  'हरितालिका तीज, करवा चौथ, हलषष्ठी/ललई छठ, जीउतिया व्रत/अहोई अष्टमी का अवकाश केवल शिक्षिकाओं व बालिकाओं को देय। पितृ-विसर्जन का अवकाश केवल शिक्षकों/शिक्षिकाओं को देय।',
  'ग्रीष्मावकाश: 20 मई से 15 जून तक  ·  शीतकालीन अवकाश: 31 दिसम्बर से 14 जनवरी तक।',
  'राष्ट्रीय पर्वों (स्वतंत्रता दिवस, गणतंत्र दिवस, गांधी जयंती) पर विद्यालय में विशेष कार्यक्रम आयोजित किए जायेंगे।',
];

export default function HolidayScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [showRules, setShowRules] = useState(false);

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#060F24','#0F2347','#1A3A6B']} style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} hitSlop={{top:10,bottom:10,left:10,right:10}}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerTitle}>
          <Text style={s.headerHindi}>अवकाश तालिका</Text>
          <Text style={s.headerEng}>Holiday List 2026</Text>
        </View>
        <View style={{ width: 38 }} />
      </LinearGradient>
      <View style={s.tricolor}>
        <View style={[s.stripe,{backgroundColor:'#FF9933'}]} />
        <View style={[s.stripe,{backgroundColor:'#fff'}]} />
        <View style={[s.stripe,{backgroundColor:'#138808'}]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Hero */}
        <LinearGradient colors={['#0F2347','#1A3A6B','#1E4D8C']} style={s.hero}>
          <View style={s.heroIcon}><Ionicons name="calendar-clear" size={28} color={COLORS.gold} /></View>
          <Text style={s.heroTitle}>आधिकारिक अवकाश तालिका</Text>
          <Text style={s.heroSub}>उत्तर प्रदेश बेसिक शिक्षा परिषद, प्रयागराज  ·  वर्ष 2026</Text>
          <View style={s.heroPills}>
            <View style={s.pill}><Text style={s.pillTxt}>कुल 33 अवकाश</Text></View>
          </View>
        </LinearGradient>

        {/* School timings */}
        <View style={s.section}>
          <View style={s.secHead}>
            <View style={s.secBar} />
            <Text style={s.secTitle}>शैक्षणिक समय सारणी</Text>
          </View>
          <Text style={s.secTitleEng}>School Timings</Text>

          <View style={s.timeCard}>
            <View style={[s.timeIcon,{backgroundColor:'#C2410C'}]}><Ionicons name="sunny" size={20} color="#fff" /></View>
            <View style={{flex:1}}>
              <Text style={s.timeLabel}>ग्रीष्मकाल · 01 अप्रैल – 30 सितम्बर</Text>
              <Text style={s.timeValue}>प्रातः 08:00 – अपरान्ह 02:00</Text>
              <Text style={s.timeNote}>मध्यावकाश: 10:30 – 11:00</Text>
            </View>
          </View>

          <View style={s.timeCard}>
            <View style={[s.timeIcon,{backgroundColor:'#1A3A6B'}]}><Ionicons name="snow" size={20} color="#fff" /></View>
            <View style={{flex:1}}>
              <Text style={s.timeLabel}>शीतकाल · 01 अक्टूबर – 31 मार्च</Text>
              <Text style={s.timeValue}>प्रातः 09:00 – अपरान्ह 03:00</Text>
              <Text style={s.timeNote}>मध्यावकाश: 12:00 – 12:30</Text>
            </View>
          </View>
        </View>

        {/* Holiday list */}
        <View style={s.section}>
          <View style={s.secHead}>
            <View style={s.secBar} />
            <Text style={s.secTitle}>अवकाश सूची</Text>
          </View>
          <Text style={s.secTitleEng}>Holidays · 2026</Text>

          {HOLIDAYS.map((h) => (
            <View key={h.n} style={s.row}>
              <View style={[s.dateChip,{backgroundColor:h.color}]}>
                <Text style={s.dateChipNum}>{h.date.split(' ')[0]}</Text>
                <Text style={s.dateChipMon}>{h.month}</Text>
              </View>
              <View style={{flex:1}}>
                <Text style={s.rowName}>{h.name}</Text>
                <Text style={s.rowDay}>{h.day}  ·  {h.date}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Rules — collapsible */}
        <View style={s.section}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => setShowRules(!showRules)} style={s.rulesToggle}>
            <Ionicons name="information-circle" size={20} color={COLORS.navyPrimary} />
            <Text style={s.rulesToggleTxt}>महत्वपूर्ण नियम एवं दिशा-निर्देश</Text>
            <Ionicons name={showRules ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.inkLight} />
          </TouchableOpacity>

          {showRules && (
            <View style={s.rulesBody}>
              {RULES.map((r, i) => (
                <View key={i} style={s.ruleRow}>
                  <View style={s.ruleBullet}><Text style={s.ruleNum}>{i+1}</Text></View>
                  <Text style={s.ruleText}>{r}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={s.footerNote}>
          <Ionicons name="document-text-outline" size={15} color={COLORS.inkLight} />
          <Text style={s.footerTxt}>आधार: पत्रांक बे०शि०प०/19684-89/2025-26  ·  दिनांक 31-12-2025</Text>
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
  headerTitle:  { alignItems:'center' },
  headerHindi:  { color:'#fff', fontSize:18, fontFamily:'NotoSansDevanagari_700Bold' },
  headerEng:    { color:COLORS.saffronLight, fontSize:10, marginTop:1 },

  hero:         { marginHorizontal:16, marginTop:16, borderRadius:18, padding:22, alignItems:'center', elevation:4, shadowColor:'#000', shadowOpacity:0.2, shadowRadius:8 },
  heroIcon:     { width:56, height:56, borderRadius:28, backgroundColor:'rgba(201,168,76,0.15)', borderWidth:1.5, borderColor:COLORS.gold, alignItems:'center', justifyContent:'center', marginBottom:12 },
  heroTitle:    { color:'#fff', fontSize:19, fontFamily:'NotoSansDevanagari_700Bold', textAlign:'center' },
  heroSub:      { color:'#C9DCF0', fontSize:12, marginTop:5, textAlign:'center', fontFamily:'NotoSansDevanagari_400Regular' },
  heroPills:    { flexDirection:'row', gap:10, marginTop:14 },
  pill:         { backgroundColor:'rgba(255,255,255,0.12)', borderRadius:20, paddingHorizontal:16, paddingVertical:5, borderWidth:1, borderColor:'rgba(255,255,255,0.2)' },
  pillTxt:      { color:'#fff', fontSize:12, fontFamily:'NotoSansDevanagari_700Bold' },

  section:      { paddingHorizontal:16, paddingTop:22 },
  secHead:      { flexDirection:'row', alignItems:'center', marginBottom:4 },
  secBar:       { width:4, height:22, backgroundColor:COLORS.saffron, borderRadius:2, marginRight:10 },
  secTitle:     { fontSize:18, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyPrimary },
  secTitleEng:  { fontSize:11, color:COLORS.inkLight, marginLeft:14, marginBottom:14, letterSpacing:0.4 },

  timeCard:     { flexDirection:'row', alignItems:'center', gap:14, backgroundColor:'#fff', borderRadius:14, padding:14, marginBottom:10, elevation:2, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:6 },
  timeIcon:     { width:44, height:44, borderRadius:12, alignItems:'center', justifyContent:'center' },
  timeLabel:    { fontSize:12, color:COLORS.inkLight, fontFamily:'NotoSansDevanagari_400Regular' },
  timeValue:    { fontSize:15, color:COLORS.navyDark, fontFamily:'NotoSansDevanagari_700Bold', marginTop:2 },
  timeNote:     { fontSize:11, color:COLORS.inkLight, marginTop:2, fontFamily:'NotoSansDevanagari_400Regular' },

  row:          { flexDirection:'row', alignItems:'center', gap:14, backgroundColor:'#fff', borderRadius:14, padding:12, marginBottom:9, elevation:2, shadowColor:'#000', shadowOpacity:0.05, shadowRadius:5 },
  dateChip:     { width:52, height:52, borderRadius:12, alignItems:'center', justifyContent:'center' },
  dateChipNum:  { color:'#fff', fontSize:18, fontFamily:'NotoSansDevanagari_700Bold', lineHeight:22 },
  dateChipMon:  { color:'rgba(255,255,255,0.85)', fontSize:10, fontFamily:'NotoSansDevanagari_400Regular' },
  rowName:      { fontSize:15, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark, lineHeight:21 },
  rowDay:       { fontSize:12, color:COLORS.inkLight, marginTop:2, fontFamily:'NotoSansDevanagari_400Regular' },

  rulesToggle:  { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'#EEF2FF', borderRadius:14, padding:14 },
  rulesToggleTxt:{ flex:1, fontSize:15, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyPrimary },
  rulesBody:    { marginTop:10 },
  ruleRow:      { flexDirection:'row', alignItems:'flex-start', gap:10, backgroundColor:'#fff', borderRadius:12, padding:13, marginBottom:8, elevation:1, shadowColor:'#000', shadowOpacity:0.04, shadowRadius:4 },
  ruleBullet:   { width:22, height:22, borderRadius:11, backgroundColor:COLORS.saffron, alignItems:'center', justifyContent:'center', marginTop:1 },
  ruleNum:      { color:'#fff', fontSize:11, fontFamily:'NotoSansDevanagari_700Bold' },
  ruleText:     { flex:1, fontSize:13, color:COLORS.inkSoft, lineHeight:20, fontFamily:'NotoSansDevanagari_400Regular' },

  footerNote:   { flexDirection:'row', alignItems:'flex-start', gap:8, marginHorizontal:16, marginTop:14, backgroundColor:'#F5F0E8', borderRadius:10, padding:12 },
  footerTxt:    { flex:1, fontSize:11, color:COLORS.inkLight, lineHeight:17, fontFamily:'NotoSansDevanagari_400Regular', fontStyle:'italic' },
});
