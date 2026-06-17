import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';

const STAFF = [
  {
    id: 1,
    name: 'श्री रविंद्र चौधरी',
    nameEng: 'Shri Ravindra Chaudhary',
    role: 'प्रधानाध्यापक',
    roleEng: 'Principal',
    qualification: 'M.A. (English), B.P.Ed.',
    shlok: '"विद्या ददाति विनयं, विनयाद् याति पात्रताम्।"\n(विद्या विनय देती है, और विनय से योग्यता आती है।)', thought: 'प्रिय अभिभावकों एवं प्रिय बच्चों,\nशिक्षा केवल अक्षरों का ज्ञान या पाठ्यपुस्तकों को रटना नहीं है, बल्कि यह एक ऐसी निरंतर प्रक्रिया है जो मनुष्य के भीतर छिपी असीम संभावनाओं और आंतरिक प्रतिभा को निखारती है। भगवान श्री कृष्ण की पावन कर्मस्थली मथुरा में स्थित हमारा विद्यालय, बच्चों के मानसिक, शारीरिक और नैतिक विकास के लिए पूरी तरह संकल्पित है।हमारा प्रयास रहता है कि विद्यालय में भयमुक्त, सुरक्षित और बाल-केंद्रित वातावरण का निर्माण हो। निपुण भारत मिशन के अंतर्गत बुनियादी साक्षरता और संख्यात्मक ज्ञान को सुदृढ़ करने के साथ-साथ, डिजिटल व स्मार्ट क्लास के माध्यम से शिक्षा को रोचक और सुलभ बनाया जा रहा है।हमारा मुख्य लक्ष्य समाज के अंतिम पायदान पर खड़े प्रत्येक बच्चे तक गुणवत्तापूर्ण शिक्षा पहुँचाना है। खेलकूद, योग, कला और सांस्कृतिक कार्यक्रमों से जोड़कर बच्चों का सर्वांगीण विकास हमारी दिनचर्या का अभिन्न हिस्सा है।\nअभिभावक हमारे सबसे महत्वपूर्ण स्तंभ हैं। विद्यालय और परिवार के बीच मजबूत समन्वय से ही बच्चों का सर्वांगीण विकास संभव है।\n"आओ स्कूल चलें, अपना भविष्य बुनें।"', sign: 'शुभकामनाओं सहित,\nरविंद्र कुमार चौधरी\nप्रधानाध्यापक\nप्राथमिक विद्यालय गोविंदपुर\nनगर क्षेत्र, मथुरा (उत्तर प्रदेश)',
    photo: require('../assets/images/staff-1.jpg'),
    isHead: true,
  },
  {
    id: 2,
    name: 'श्रीमती अंजना राना',
    nameEng: 'Shrimati Anjana Rana',
    role: 'सहायक अध्यापक',
    roleEng: 'Assistant Teacher',
    qualification: 'M.Sc., B.Ed.',
    thought: '"एक अच्छा शिक्षक आशा जगाता है, कल्पना को प्रज्वलित करता है और सीखने के प्रति प्रेम उत्पन्न करता है।" हमारा प्रयास है कि प्रत्येक बच्चा विज्ञान की जिज्ञासा को अपने जीवन में उतारे और तर्कशील सोच के साथ आगे बढ़े।',
    photo: require('../assets/images/staff-2.jpg'),
    isHead: false,
  },
  {
    id: 3,
    name: 'श्रीमती योगेश चौधरी',
    nameEng: 'Shrimati Yogesh Chaudhary',
    role: 'शिक्षामित्र',
    roleEng: 'Shiksha Mitra',
    qualification: 'B.A., BTC',
    thought: '"बच्चों की मुस्कान ही हमारी सबसे बड़ी उपलब्धि है।" छोटे-छोटे कदमों से बड़े सपने पूरे होते हैं — यही हम अपने विद्यार्थियों को सिखाते हैं।',
    photo: require('../assets/images/staff-3.jpg'),
    isHead: false,
  },
  {
    id: 4,
    name: 'कुमारी प्रियंका',
    nameEng: 'Kumari Priyanka',
    role: 'वालंटियर शिक्षक',
    roleEng: 'Volunteer Teacher',
    qualification: 'B.Sc.',
    thought: '"शिक्षा वह शक्ति है जो हर बाधा को पार कर सकती है।" बच्चों को पढ़ाना मेरे लिए सेवा नहीं, बल्कि एक सार्थक यात्रा है।',
    photo: require('../assets/images/staff-4.jpg'),
    isHead: false,
  },
  {
    id: 5,
    name: 'कुमारी अंजली',
    nameEng: 'Kumari Anjali',
    role: 'वालंटियर शिक्षक',
    roleEng: 'Volunteer Teacher',
    qualification: 'B.A.',
    thought: '"हर बच्चे में एक असाधारण प्रतिभा छिपी है — बस उसे पहचानने की जरूरत है।" यही विश्वास मुझे रोज़ कक्षा में प्रेरित करता है।',
    photo: require('../assets/images/staff-5.jpg'),
    isHead: false,
  },
];

function StaffCard({ member }) {
  return (
    <View style={[s.card, member.isHead && s.cardHead]}>
      {member.isHead && (
        <LinearGradient colors={['#1A3A6B','#2D5AA0']} style={s.headBadge}>
          <Text style={s.headBadgeText}>Principal</Text>
        </LinearGradient>
      )}
      <View style={s.cardTop}>
        <View style={[s.photoFrame, member.isHead && s.photoFrameHead]}>
          {member.photo
            ? <Image source={member.photo} style={member.isHead ? s.photoHead : s.photo} resizeMode="cover" />
            : <View style={s.photoPlaceholder}><Ionicons name="person" size={member.isHead?40:32} color="rgba(255,255,255,0.6)" /></View>
          }
        </View>
        <View style={s.nameBlock}>
          <Text style={[s.name, member.isHead && s.nameHead]}>{member.name}</Text>
          <View style={s.rolePill}><Text style={s.roleText}>{member.role}</Text></View>
          <Text style={s.qual}>{member.qualification}</Text>
        </View>
      </View>
      <View style={s.thoughtWrap}>
        <Ionicons name="chatbubble-ellipses" size={16} color={COLORS.saffron} style={{marginBottom:6}} />
        {member.shlok && <Text style={s.shlok}>{member.shlok}</Text>}
        <Text style={s.thought}>{member.thought}</Text>
        {member.sign && <Text style={s.sign}>{member.sign}</Text>}
      </View>
    </View>
  );
}

export default function StaffScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.root,{paddingTop:insets.top}]}>
      <LinearGradient colors={['#060F24','#0F2347','#1A3A6B']} style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} hitSlop={{top:10,bottom:10,left:10,right:10}}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerTitle}>
          <Text style={s.headerHindi}>Our Staff</Text>
        </View>
        <View style={{width:38}} />
      </LinearGradient>
      <View style={s.tricolor}>
        <View style={[s.stripe,{backgroundColor:'#FF9933'}]} />
        <View style={[s.stripe,{backgroundColor:'#fff'}]} />
        <View style={[s.stripe,{backgroundColor:'#138808'}]} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <Text style={s.countText}>{STAFF.length} Staff Members</Text>
        {STAFF.map((member) => <StaffCard key={member.id} member={member} />)}
        <View style={{height:30}} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:           { flex:1, backgroundColor:'#FBF3E4' },
  tricolor:       { flexDirection:'row', height:4 },
  stripe:         { flex:1 },
  header:         { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:14 },
  backBtn:        { width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,255,255,0.12)', borderWidth:1, borderColor:'rgba(255,255,255,0.18)', alignItems:'center', justifyContent:'center' },
  headerTitle:    { alignItems:'center' },
  headerHindi:    { color:'#fff', fontSize:18, fontFamily:'NotoSansDevanagari_700Bold' },
  content:        { padding:16, gap:16 },
  countText:      { textAlign:'center', color:COLORS.inkLight, fontSize:12, marginBottom:4 },
  card:           { backgroundColor:'#fff', borderRadius:20, overflow:'hidden', elevation:4, shadowColor:'#000', shadowOpacity:0.1, shadowRadius:10 },
  cardHead:       { borderWidth:2, borderColor:COLORS.gold },
  headBadge:      { paddingVertical:6, paddingHorizontal:16, alignItems:'center' },
  headBadgeText:  { color:'#fff', fontSize:11, fontFamily:'NotoSansDevanagari_700Bold', letterSpacing:0.5 },
  cardTop:        { flexDirection:'row', padding:16, gap:14, alignItems:'flex-start' },
  photoFrame:     { width:104, height:104, borderRadius:52, overflow:'hidden', justifyContent:'flex-start', borderWidth:3, borderColor:COLORS.navyPrimary, backgroundColor:'#0F2347' },
  photoFrameHead: { width:120, height:120, borderRadius:60, overflow:'hidden', justifyContent:'flex-start', borderColor:COLORS.gold, borderWidth:3 },
  photo:          { width:'100%', height:'140%', resizeMode:'cover' },
  photoHead:      { width:'100%', height:'108%', resizeMode:'cover' },
  photoPlaceholder:{ flex:1, alignItems:'center', justifyContent:'center', backgroundColor:'#1A3A6B' },
  nameBlock:      { flex:1, paddingTop:4 },
  name:           { fontSize:18, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },
  nameHead:       { fontSize:20, color:COLORS.navyPrimary },
  rolePill:       { alignSelf:'flex-start', marginTop:6, backgroundColor:'#EEF2FF', borderRadius:8, paddingHorizontal:10, paddingVertical:3 },
  roleText:       { fontSize:13, color:COLORS.navyPrimary, fontFamily:'NotoSansDevanagari_700Bold' },
  qual:           { fontSize:14, color:COLORS.inkLight, marginTop:5 },
  thoughtWrap:    { marginHorizontal:16, marginBottom:16, padding:14, backgroundColor:'#FAFAFA', borderRadius:12, borderLeftWidth:3, borderLeftColor:COLORS.saffron },
  thought:        { fontSize:15, color:COLORS.inkSoft, lineHeight:24, fontStyle:'italic' },
  shlok:          { fontSize:15, lineHeight:24, color:COLORS.saffronDark, fontFamily:'NotoSansDevanagari_700Bold', marginBottom:10 },
  sign:           { fontSize:15, lineHeight:24, color:COLORS.navyDark, fontFamily:'NotoSansDevanagari_700Bold', marginTop:10 },
});
