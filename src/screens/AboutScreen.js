import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';

const ABOUT_CARDS = [
  { screen: 'School', icon: 'school', label: 'विद्यालय परिचय', sublabel: 'About School', desc: 'इतिहास, सुविधाएँ और उपलब्धियाँ', descEng: 'History, Facilities & Achievements', gradient: ['#1A3A6B','#2D5AA0'] },
  { screen: 'Staff',  icon: 'people', label: 'हमारे शिक्षक',   sublabel: 'Our Staff',    desc: 'प्रधानाध्यापक एवं शिक्षक गण',  descEng: 'Principal & Teaching Staff',    gradient: ['#065F46','#059669'] },
];

export default function AboutScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#060F24','#0F2347','#1A3A6B']} style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} hitSlop={{ top:10,bottom:10,left:10,right:10 }}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerTitle}>
          <Text style={s.headerHindi}>अबाउट</Text>
          <Text style={s.headerEng}>About</Text>
        </View>
        <View style={{ width: 38 }} />
      </LinearGradient>
      <View style={s.tricolor}>
        <View style={[s.stripe,{backgroundColor:'#FF9933'}]} />
        <View style={[s.stripe,{backgroundColor:'#fff'}]} />
        <View style={[s.stripe,{backgroundColor:'#138808'}]} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <Text style={s.hint}>एक अनुभाग चुनें  ·  Select a section</Text>
        {ABOUT_CARDS.map((card) => (
          <TouchableOpacity key={card.screen} activeOpacity={0.85} onPress={() => navigation.navigate(card.screen)}>
            <LinearGradient colors={card.gradient} start={{x:0,y:0}} end={{x:1,y:1}} style={s.card}>
              <View style={s.iconCircle}>
                <Ionicons name={card.icon} size={32} color="#fff" />
              </View>
              <View style={s.cardBody}>
                <Text style={s.cardLabel}>{card.label}</Text>
                <Text style={s.cardSub}>{card.sublabel}</Text>
                <View style={s.divider} />
                <Text style={s.cardDesc}>{card.desc}</Text>
                <Text style={s.cardDescEng}>{card.descEng}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex:1, backgroundColor:'#FBF3E4' },
  tricolor:   { flexDirection:'row', height:4 },
  stripe:     { flex:1 },
  header:     { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:14 },
  backBtn:    { width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,255,255,0.12)', borderWidth:1, borderColor:'rgba(255,255,255,0.18)', alignItems:'center', justifyContent:'center' },
  headerTitle:{ alignItems:'center' },
  headerHindi:{ color:'#fff', fontSize:18, fontFamily:'NotoSansDevanagari_700Bold' },
  headerEng:  { color:COLORS.saffronLight, fontSize:11, marginTop:1 },
  content:    { padding:20, gap:16, paddingBottom:40 },
  hint:       { textAlign:'center', color:COLORS.inkLight, fontSize:12, fontFamily:'NotoSansDevanagari_400Regular', marginBottom:8 },
  card:       { borderRadius:20, padding:20, flexDirection:'row', alignItems:'center', gap:16, elevation:6, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.2, shadowRadius:10 },
  iconCircle: { width:64, height:64, borderRadius:32, backgroundColor:'rgba(255,255,255,0.15)', borderWidth:2, borderColor:'rgba(255,255,255,0.25)', alignItems:'center', justifyContent:'center' },
  cardBody:   { flex:1 },
  cardLabel:  { color:'#fff', fontSize:18, fontFamily:'NotoSansDevanagari_700Bold' },
  cardSub:    { color:'rgba(255,255,255,0.7)', fontSize:12, marginTop:2, letterSpacing:0.5 },
  divider:    { height:1, backgroundColor:'rgba(255,255,255,0.2)', marginVertical:10 },
  cardDesc:   { color:'rgba(255,255,255,0.9)', fontSize:13, fontFamily:'NotoSansDevanagari_400Regular' },
  cardDescEng:{ color:'rgba(255,255,255,0.55)', fontSize:11, marginTop:3 },
});
