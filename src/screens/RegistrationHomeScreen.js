import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';

export default function RegistrationHomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#060F24','#0F2347','#1A3A6B']} style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} hitSlop={{top:10,bottom:10,left:10,right:10}}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerTitle}><Text style={s.headerHindi}>छात्र पंजीकरण</Text><Text style={s.headerEng}>Student Registration</Text></View>
        <View style={{ width: 38 }} />
      </LinearGradient>
      <View style={s.tricolor}><View style={[s.stripe,{backgroundColor:'#FF9933'}]}/><View style={[s.stripe,{backgroundColor:'#fff'}]}/><View style={[s.stripe,{backgroundColor:'#138808'}]}/></View>

      <View style={s.body}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Registration')}>
          <LinearGradient colors={['#0A6B0A','#138808','#1AA81A']} start={{x:0,y:0}} end={{x:1,y:0}} style={s.card}>
            <View style={s.cardIcon}><Ionicons name="create-outline" size={28} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>फॉर्म भरें</Text>
              <Text style={s.cardSub}>नया प्रवेश आवेदन भरें</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={28} color="rgba(255,255,255,0.85)" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('RegistrationList')}>
          <LinearGradient colors={['#0F2347','#1A3A6B','#2D5AA0']} start={{x:0,y:0}} end={{x:1,y:0}} style={s.card}>
            <View style={s.cardIcon}><Ionicons name="documents-outline" size={26} color="#fff" /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>भरे हुए फॉर्म</Text>
              <Text style={s.cardSub}>सभी जमा किए गए आवेदन देखें, संपादित करें या हटाएँ</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={28} color="rgba(255,255,255,0.85)" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex:1, backgroundColor:'#FBF3E4' },
  header:      { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:14 },
  backBtn:     { width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,255,255,0.12)', borderWidth:1, borderColor:'rgba(255,255,255,0.18)', alignItems:'center', justifyContent:'center' },
  headerTitle: { alignItems:'center', flex:1, paddingHorizontal:6 },
  headerHindi: { color:'#fff', fontSize:18, fontFamily:'NotoSansDevanagari_700Bold' },
  headerEng:   { color:'#FED7AA', fontSize:10, marginTop:1 },
  tricolor:    { flexDirection:'row', height:4 },
  stripe:      { flex:1 },
  body:        { padding:18, gap:16 },
  card:        { flexDirection:'row', alignItems:'center', gap:14, padding:20, borderRadius:18, elevation:4, shadowColor:'#000', shadowOpacity:0.15, shadowRadius:8 },
  cardIcon:    { width:52, height:52, borderRadius:26, backgroundColor:'rgba(255,255,255,0.18)', alignItems:'center', justifyContent:'center' },
  cardTitle:   { color:'#fff', fontSize:19, fontFamily:'NotoSansDevanagari_700Bold' },
  cardSub:     { color:'rgba(255,255,255,0.88)', fontSize:12, marginTop:3, fontFamily:'NotoSansDevanagari_400Regular' },
});