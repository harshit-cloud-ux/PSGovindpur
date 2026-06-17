import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';

const SCHOOL_PHOTO = require('../assets/images/school-front.jpg');

const INFO_ITEMS = [
  { icon:'location',      label:'पता / Address', link:'https://maps.app.goo.gl/6uB3wAtZ4KR6AHR79?g_st=ipc',        value:'गोविंदपुर बस्ती, कुसुम वाटिका के पास,वार्ड नंबर 24,सराय आजमाबाद, नगर निगम मथुरा, उत्तर प्रदेश' },
  { icon:'calendar',      label:'स्थापना / Established', value:'1962' },
  { icon:'people',        label:'छात्र / Students',      value:'166' },
  { icon:'person',        label:'शिक्षक / Teachers',     value:'3' },
  { icon:'time',          label:'समय / Timings',         value:'सोम-शनि  ·  7:30 AM - 12:30 PM' },
  { icon:'ribbon',        label:'संबद्धता / Affiliation', value:'बेसिक शिक्षा परिषद, उ.प्र.' },
  { icon:'document-text', label:'UDISE कोड',             value:'09141101809' },
];

const VISION_POINTS = [
  { icon:'git-network', title:'समान शिक्षा का अधिकार', desc:'समाज के हर वर्ग के बच्चे तक बिना भेदभाव के उच्च स्तरीय शिक्षा।' },
  { icon:'sparkles',    title:'आधुनिकता और परंपरा',    desc:'भारतीय संस्कृति व नैतिक मूल्यों के साथ स्मार्ट क्लास व ICT।' },
  { icon:'flag',        title:'निपुण भारत मिशन',        desc:'बुनियादी साक्षरता और संख्यात्मक ज्ञान (FLN) को सुदृढ़ करना।' },
];

const FEATURES = [
  { icon:'school',         color:'#1A3A6B', title:'अनुभवी शिक्षक',         desc:'उच्च योग्य, प्रशिक्षित और बाल-केंद्रित शिक्षण विधियों में निपुण।' },
  { icon:'color-palette',  color:'#BE185D', title:'BALA परिसर',            desc:'दीवारें ज्ञानवर्धक चित्रों, कविताओं व गणितीय आकृतियों से सुसज्जित।' },
  { icon:'gift',           color:'#059669', title:'निःशुल्क सामग्री',      desc:'पाठ्यपुस्तकें, यूनिफॉर्म, जूता-मोजा, बैग और DBT सहायता।' },
  { icon:'restaurant',     color:'#C2410C', title:'मध्याह्न भोजन',         desc:'प्रतिदिन ताजा, स्वच्छ और पौष्टिक भोजन शासन के मीनू अनुसार।' },
  { icon:'football',       color:'#7C3AED', title:'सह-शैक्षणिक गतिविधियाँ', desc:'खेलकूद, चित्रकला, संगीत, योग और सांस्कृतिक कार्यक्रम।' },
  { icon:'people-circle',  color:'#0891B2', title:'समुदाय का सहयोग',       desc:'विद्यालय प्रबंध समिति (SMC) व अभिभावक-शिक्षक बैठक (PTM) के माध्यम से अभिभावक बच्चों की प्रगति में बराबर के भागीदार।' },
];

export default function SchoolScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.root,{paddingTop:insets.top}]}>
      <LinearGradient colors={['#060F24','#0F2347','#1A3A6B']} style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} hitSlop={{top:10,bottom:10,left:10,right:10}}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerTitle}>
          <Text style={s.headerHindi}>विद्यालय परिचय</Text>
          <Text style={s.headerEng}>About School</Text>
        </View>
        <View style={{width:38}} />
      </LinearGradient>
      <View style={s.tricolor}>
        <View style={[s.stripe,{backgroundColor:'#FF9933'}]} />
        <View style={[s.stripe,{backgroundColor:'#fff'}]} />
        <View style={[s.stripe,{backgroundColor:'#138808'}]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:40}}>

        {/* Photo */}
        <Image source={SCHOOL_PHOTO} style={s.photo} resizeMode="contain" />

        {/* Welcome intro — calligraphic (Tiro Devanagari Hindi) */}
        <View style={s.introCard}>
          <View style={s.introMedallion}>
            <Ionicons name="book" size={22} color={COLORS.gold} />
          </View>
          <Text style={s.introLead}>विद्या का पावन मंदिर</Text>
          <View style={s.introAccent} />
          <Text style={s.introBody}>
            बेसिक शिक्षा परिषद, उत्तर प्रदेश द्वारा संचालित प्राथमिक विद्यालय गोविंदपुर में आपका हार्दिक स्वागत है। भगवान श्री कृष्ण की पावन क्रीड़ास्थली मथुरा में स्थित यह विद्यालय बच्चों को गुणवत्तापूर्ण, संस्कारयुक्त और आधुनिक शिक्षा देने के लिए समर्पित है।
          </Text>
          <Text style={s.introMotto}>{'"संस्कारयुक्त आधुनिक शिक्षा के द्वारा उत्कृष्ट विद्यार्थी निर्माण से राष्ट्र निर्माण— यही है हमारा संकल्प।" \n जाग रहा है जन गण मन, निश्चित होगा परिवर्तन।'}</Text>
        </View>

        <View style={s.section}>
          <SectionHead hindi="विद्यालय की जानकारी" eng="School Information" />
          <View style={s.infoGrid}>
            {INFO_ITEMS.map((item,i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={item.link ? 0.75 : 1}
                onPress={() => item.link && Linking.openURL(item.link)}
                style={[s.infoCard, item.link && s.infoCardTappable]}
              >
                <View style={s.infoIcon}><Ionicons name={item.icon} size={20} color={COLORS.navyPrimary} /></View>
                <View style={{flex:1}}>
                  <Text style={s.infoLabel}>{item.label}</Text>
                  <Text style={[s.infoValue, item.link && s.infoValueLink]}>{item.value}</Text>
                </View>
                {item.link && <Ionicons name="open-outline" size={16} color={COLORS.navyPrimary} style={{opacity:0.5}} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <SectionHead hindi="हमारा विजन" eng="Our Vision & Mission" />
          {VISION_POINTS.map((v,i) => (
            <LinearGradient key={i} colors={['#0F2347','#1A3A6B']} start={{x:0,y:0}} end={{x:1,y:1}} style={s.visionCard}>
              <View style={s.visionIcon}><Ionicons name={v.icon} size={22} color={COLORS.gold} /></View>
              <View style={{flex:1}}>
                <Text style={s.visionTitle}>{v.title}</Text>
                <Text style={s.visionDesc}>{v.desc}</Text>
              </View>
            </LinearGradient>
          ))}
        </View>

        <View style={s.section}>
          <SectionHead hindi="हमारी विशेषताएँ" eng="Key Features" />
          {FEATURES.map((f,i) => (
            <View key={i} style={s.featureCard}>
              <View style={[s.featureIcon,{backgroundColor:f.color}]}>
                <Ionicons name={f.icon} size={22} color="#fff" />
              </View>
              <View style={{flex:1}}>
                <Text style={s.featureTitle}>{f.title}</Text>
                <Text style={s.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={s.section}>
          <LinearGradient colors={['#0A6B0A','#138808','#1AA81A']} start={{x:0,y:0}} end={{x:1,y:1}} style={s.contactCard}>
            <Text style={s.contactHeading}>प्रवेश के लिए संपर्क करें</Text>
            <Text style={s.contactSub}>प्रवेश अवधि: प्रतिवर्ष 1 अप्रैल से (शासन के नियमानुसार)</Text>
            <TouchableOpacity style={s.phoneBtn} activeOpacity={0.85} onPress={() => Linking.openURL('tel:7217037876')}>
              <Ionicons name="call" size={18} color="#0A6B0A" />
              <Text style={s.phoneText}>7217037876</Text>
            </TouchableOpacity>
            <Text style={s.contactMotto}>"आओ स्कूल चलें, अपना भविष्य बुनें।"</Text>
          </LinearGradient>
        </View>

      </ScrollView>
    </View>
  );
}

function SectionHead({ hindi, eng }) {
  return (
    <View style={{marginBottom:14}}>
      <View style={s.secHead}>
        <View style={s.secBar} />
        <Text style={s.secTitle}>{hindi}</Text>
      </View>
      <Text style={s.secTitleEng}>{eng}</Text>
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
  headerEng:      { color:COLORS.saffronLight, fontSize:11, marginTop:1 },

  photo:          { width:'100%', height:180, backgroundColor:'#0F2347' },

  introCard:      { marginHorizontal:16, marginTop:18, backgroundColor:'#fff', borderRadius:18, paddingVertical:26, paddingHorizontal:22, alignItems:'center', elevation:3, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:8, borderWidth:1, borderColor:'#F0E6D2' },
  introMedallion: { width:48, height:48, borderRadius:24, backgroundColor:'#0F2347', alignItems:'center', justifyContent:'center', borderWidth:2, borderColor:COLORS.gold, marginBottom:16 },
  introLead:      { fontSize:26, lineHeight:42, paddingTop:4, fontFamily:'TiroDevanagariHindi_400Regular', color:COLORS.navyPrimary, textAlign:'center', letterSpacing:0.3 },
  introAccent:    { width:54, height:3, backgroundColor:COLORS.saffron, borderRadius:2, marginVertical:14 },
  introBody:      { fontSize:16.5, lineHeight:31, color:COLORS.inkSoft, fontFamily:'TiroDevanagariHindi_400Regular', textAlign:'center' },
  introMotto:     { fontSize:15, lineHeight:25, color:COLORS.gold, fontFamily:'TiroDevanagariHindi_400Regular_Italic', textAlign:'center', marginTop:18, paddingTop:16, borderTopWidth:1, borderTopColor:'#F0E6D2' },

  section:        { paddingHorizontal:16, paddingTop:22 },
  secHead:        { flexDirection:'row', alignItems:'center' },
  secBar:         { width:4, height:22, backgroundColor:COLORS.saffron, borderRadius:2, marginRight:10 },
  secTitle:       { fontSize:18, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyPrimary },
  secTitleEng:    { fontSize:11, color:COLORS.inkLight, marginLeft:14, marginTop:2, letterSpacing:0.5 },

  infoGrid:       { gap:10 },
  infoCard:       { flexDirection:'row', alignItems:'center', gap:14, backgroundColor:'#fff', borderRadius:14, padding:14, elevation:2, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:6, borderLeftWidth:3, borderLeftColor:COLORS.navyPrimary },
  infoIcon:       { width:40, height:40, borderRadius:10, backgroundColor:'#EEF2FF', alignItems:'center', justifyContent:'center' },
  infoLabel:      { fontSize:13, color:COLORS.inkLight, marginBottom:3 },
  infoValue:      { fontSize:16, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.ink },

  visionCard:     { flexDirection:'row', alignItems:'center', gap:14, borderRadius:14, padding:16, marginBottom:10, elevation:3, shadowColor:'#000', shadowOpacity:0.15, shadowRadius:8 },
  visionIcon:     { width:46, height:46, borderRadius:23, backgroundColor:'rgba(201,168,76,0.15)', borderWidth:1, borderColor:'rgba(201,168,76,0.4)', alignItems:'center', justifyContent:'center' },
  visionTitle:    { color:'#fff', fontSize:16, fontFamily:'NotoSansDevanagari_700Bold', marginBottom:3 },
  visionDesc:     { color:'#C9DCF0', fontSize:14, lineHeight:21, fontFamily:'NotoSansDevanagari_400Regular' },

  featureCard:    { flexDirection:'row', alignItems:'center', gap:14, backgroundColor:'#fff', borderRadius:14, padding:14, marginBottom:10, elevation:2, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:6 },
  featureIcon:    { width:48, height:48, borderRadius:14, alignItems:'center', justifyContent:'center' },
  featureTitle:   { fontSize:16, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark, marginBottom:3 },
  featureDesc:    { fontSize:14, lineHeight:21, color:COLORS.inkSoft, lineHeight:18, fontFamily:'NotoSansDevanagari_400Regular' },

  contactCard:    { borderRadius:18, padding:22, alignItems:'center', elevation:6, shadowColor:COLORS.green, shadowOpacity:0.3, shadowRadius:10 },
  contactHeading: { color:'#fff', fontSize:18, fontFamily:'NotoSansDevanagari_700Bold' },
  contactSub:     { color:'rgba(255,255,255,0.85)', fontSize:11, marginTop:6, textAlign:'center', fontFamily:'NotoSansDevanagari_400Regular' },
  phoneBtn:       { flexDirection:'row', alignItems:'center', gap:8, backgroundColor:'#fff', borderRadius:24, paddingHorizontal:24, paddingVertical:11, marginTop:16 },
  phoneText:      { color:'#0A6B0A', fontSize:17, fontWeight:'800', letterSpacing:0.5 },
  contactMotto:   { color:'#fff', fontSize:13, fontStyle:'italic', marginTop:16, textAlign:'center', fontFamily:'NotoSansDevanagari_400Regular' },
});
