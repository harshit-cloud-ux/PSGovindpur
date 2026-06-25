import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, TextInput, ActivityIndicator, Alert, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

const PHOTOS = {
  azad:    require('../assets/images/azad.jpg'),
  bhagat:  require('../assets/images/bhagat.jpg'),
  rajguru: require('../assets/images/rajguru.jpg'),
  sukhdev: require('../assets/images/sukhdev.jpg'),
};

const HOUSES = [
  { key:'azad',    name:'चंद्रशेखर आज़ाद हाउस', leader:'चंद्रशेखर आज़ाद', eng:'Chandrashekhar Azad House', initial:'च',  color:'#138808', dark:false },
  { key:'bhagat',  name:'भगत सिंह हाउस',         leader:'भगत सिंह',         eng:'Bhagat Singh House',        initial:'भ',  color:'#1D4ED8', dark:false },
  { key:'rajguru', name:'राजगुरु हाउस',          leader:'शिवराम राजगुरु',   eng:'Rajguru House',             initial:'रा', color:'#DC2626', dark:false },
  { key:'sukhdev', name:'सुखदेव हाउस',           leader:'सुखदेव थापर',      eng:'Sukhdev House',             initial:'सु', color:'#EAB308', dark:true  },
];

function EditableText({ docId, field, emptyHi, emptyEng, accent }) {
  const { isAdmin } = useAuth();
  const [val,     setVal]     = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState('');
  const [saving,  setSaving]  = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!editing) { pulse.setValue(0); return; }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue:1, duration:1200, useNativeDriver:false }),
        Animated.timing(pulse, { toValue:0, duration:1200, useNativeDriver:false }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [editing]);
  const borderColor = pulse.interpolate({ inputRange:[0,1], outputRange:['#E0D6C8', accent||'#1A3A6B'] });
  const shadowOpacity = pulse.interpolate({ inputRange:[0,1], outputRange:[0.04, 0.32] });

  useEffect(() => {
    let active = true;
    setLoading(true);
    getDoc(doc(db, 'house', docId))
      .then(snap => {
        if (!active) return;
        if (snap.exists()) setVal(snap.data()[field] || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => { active = false; };
  }, [docId, field]);

  const openEdit = () => { setDraft(val); setEditing(true); };

  const save = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'house', docId), { [field]: draft.trim() }, { merge: true });
      setVal(draft.trim());
      setEditing(false);
    } catch (e) {
      Alert.alert('Error', 'सेव नहीं हुआ। कृपया पुनः प्रयास करें।');
    }
    setSaving(false);
  };

  if (loading) return (
    <View style={s.loaderBox}><ActivityIndicator color={accent || COLORS.navyPrimary} /></View>
  );

  if (editing) return (
    <View>
      <Animated.View style={[s.editAreaWrap,{borderColor, shadowOpacity, shadowColor: accent||'#1A3A6B'}]}>
        <TextInput
          style={s.editArea}
          value={draft}
          onChangeText={setDraft}
          placeholder="यहाँ टेक्स्ट लिखें या पेस्ट करें..."
          placeholderTextColor={COLORS.inkLight}
          multiline
          textAlignVertical="top"
          keyboardType="default"
          spellCheck={false}
          rejectResponderTermination={false}
        />
      </Animated.View>
      <View style={s.editActions}>
        <TouchableOpacity onPress={()=>setEditing(false)} style={s.cancelBtn}>
          <Text style={s.cancelBtnTxt}>रद्द करें</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={save} style={[s.saveBtn,{backgroundColor:accent||COLORS.navyPrimary}]} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnTxt}>सेव करें  ✓</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View>
      {isAdmin && (
        <TouchableOpacity onPress={openEdit} style={[s.adminEditBtn,{backgroundColor:accent||COLORS.navyPrimary}]}>
          <Ionicons name="create-outline" size={16} color="#fff" />
          <Text style={s.adminEditTxt}>{val ? 'संपादित करें (Admin)' : 'जोड़ें (Admin)'}</Text>
        </TouchableOpacity>
      )}
      {val ? (
        <View style={s.contentCard}><Text style={s.contentTxt}>{val}</Text></View>
      ) : (
        <View style={s.emptyCard}>
          <Ionicons name="information-circle-outline" size={18} color={COLORS.inkLight} />
          <View style={{flex:1}}>
            <Text style={s.emptyTxt}>{emptyHi}</Text>
            {emptyEng ? <Text style={s.emptyTxtEng}>{emptyEng}</Text> : null}
          </View>
        </View>
      )}
    </View>
  );
}

function HouseDetail({ house }) {
  const photo = PHOTOS[house.key];
  const txt = house.dark ? '#0F2347' : '#fff';
  return (
    <ScrollView contentContainerStyle={{ padding:16, paddingBottom:48 }}>
      <LinearGradient colors={[house.color, house.color]} style={s.detailBanner}>
        <View style={[s.detailPhotoFrame,{borderColor:house.dark?'rgba(15,35,71,0.25)':'rgba(255,255,255,0.6)'}]}>
          {photo
            ? <Image source={photo} style={s.detailPhoto} resizeMode="cover" />
            : <View style={[s.detailInitial,{backgroundColor:house.dark?'rgba(15,35,71,0.12)':'rgba(255,255,255,0.2)'}]}><Text style={[s.detailInitialTxt,{color:txt}]}>{house.initial}</Text></View>}
        </View>
        <Text style={[s.detailName,{color:txt}]}>{house.name}</Text>
        <Text style={[s.detailLeader,{color:txt,opacity:0.85}]}>{house.leader}</Text>
      </LinearGradient>

      <View style={[s.secHead,{marginTop:22}]}><View style={[s.secBar,{backgroundColor:house.color}]} /><Text style={s.secTitle}>सदन सामग्री</Text></View>
      <Text style={s.secTitleEng}>Posts & Assigned Students</Text>

      <EditableText docId={house.key} field="content"
        emptyHi="सामग्री शीघ्र जोड़ी जाएगी"
        emptyEng="Content will be added soon"
        accent={house.color} />
    </ScrollView>
  );
}

export default function HouseScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isAdmin } = useAuth();
  const [selHouse,      setSelHouse]      = useState(null);
  const [activeDuty,    setActiveDuty]    = useState('');
  const [dutyLoading,   setDutyLoading]   = useState(true);
  const [markingSaving, setMarkingSaving] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'house', 'duties'))
      .then(snap => {
        if (snap.exists()) setActiveDuty(snap.data().activeDuty || '');
        setDutyLoading(false);
      })
      .catch(() => setDutyLoading(false));
  }, []);

  const markDuty = async (key) => {
    const next = activeDuty === key ? '' : key;
    setMarkingSaving(true);
    try {
      await setDoc(doc(db, 'house', 'duties'), { activeDuty: next }, { merge: true });
      setActiveDuty(next);
    } catch(e) { Alert.alert('Error', 'सेव नहीं हुआ।'); }
    setMarkingSaving(false);
  };

  const current  = selHouse !== null ? HOUSES[selHouse] : null;
  const titleHi  = current ? current.name : 'हाउस';
  const titleEng = current ? current.eng  : 'House System';

  const goBack = () => {
    if (selHouse !== null) { setSelHouse(null); return; }
    navigation.goBack();
  };

  return (
    <View style={[s.root,{paddingTop:insets.top}]}>
      <LinearGradient colors={['#060F24','#0F2347','#1A3A6B']} style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={goBack} hitSlop={{top:10,bottom:10,left:10,right:10}}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerTitle}>
          <Text style={s.headerHindi} numberOfLines={1}>{titleHi}</Text>
          <Text style={s.headerEng}>{titleEng}</Text>
        </View>
        <View style={{width:38}} />
      </LinearGradient>
      <View style={s.tricolor}>
        <View style={[s.stripe,{backgroundColor:'#FF9933'}]} />
        <View style={[s.stripe,{backgroundColor:'#fff'}]} />
        <View style={[s.stripe,{backgroundColor:'#138808'}]} />
      </View>

      {selHouse === null ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:40}}>
          <View style={s.section}>
            <LinearGradient colors={['#0F2347','#1A3A6B','#1E4D8C']} style={s.hero}>
              <View style={s.heroIcon}><Ionicons name="trophy" size={28} color={COLORS.gold} /></View>
              <Text style={s.heroTitle}>सदन व्यवस्था</Text>
              <Text style={s.heroSub}>चार सदन · एकता, अनुशासन व प्रतिस्पर्धा</Text>
            </LinearGradient>
          </View>

          <View style={s.section}>
            {HOUSES.map((h,i) => {
              const photo = PHOTOS[h.key];
              const txt = h.dark ? '#0F2347' : '#fff';
              const onDuty = activeDuty === h.key;
              return (
                <TouchableOpacity key={h.key} activeOpacity={0.88} onPress={()=>setSelHouse(i)}>
                  <LinearGradient colors={[h.color, h.color]} style={[s.houseCard, onDuty && s.houseCardActive]}>
                    <View style={[s.photoFrame,{borderColor:h.dark?'rgba(15,35,71,0.25)':'rgba(255,255,255,0.6)'}]}>
                      {photo
                        ? <Image source={photo} style={s.photo} resizeMode="cover" />
                        : <View style={[s.initialBox,{backgroundColor:h.dark?'rgba(15,35,71,0.12)':'rgba(255,255,255,0.2)'}]}><Text style={[s.initialTxt,{color:txt}]}>{h.initial}</Text></View>}
                    </View>
                    <View style={{flex:1}}>
                      <View style={{flexDirection:'row', alignItems:'center', gap:6, flexWrap:'wrap'}}>
                        <Text style={[s.houseName,{color:txt}]}>{h.name}</Text>
                        {onDuty && <Text style={s.dutyBadge}>⭐ ड्यूटी</Text>}
                      </View>
                      <Text style={[s.houseLeader,{color:txt}]}>{h.leader}</Text>
                    </View>
                    {isAdmin
                      ? <TouchableOpacity onPress={()=>markDuty(h.key)} style={[s.markBtn,{borderColor:txt}]} disabled={markingSaving}>
                          <Ionicons name={onDuty ? 'star' : 'star-outline'} size={22} color={txt} />
                        </TouchableOpacity>
                      : <Ionicons name="chevron-forward" size={22} color={txt} />
                    }
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>

          
        </ScrollView>
      ) : (
        <HouseDetail house={current} />
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
  headerTitle:   { alignItems:'center', flex:1, paddingHorizontal:6 },
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
  houseCard:     { flexDirection:'row', alignItems:'center', gap:14, borderRadius:16, padding:16, marginBottom:12, elevation:3, shadowColor:'#000', shadowOpacity:0.18, shadowRadius:7 },
  houseCardActive:{ borderWidth:2.5, borderColor:'rgba(255,255,255,0.85)' },
  dutyBadge:     { fontSize:11, fontFamily:'NotoSansDevanagari_700Bold', color:'#fff', backgroundColor:'rgba(0,0,0,0.22)', borderRadius:8, paddingHorizontal:7, paddingVertical:2 },
  markBtn:       { width:36, height:36, borderRadius:18, borderWidth:1.5, alignItems:'center', justifyContent:'center' },
  photoFrame:    { width:58, height:58, borderRadius:29, borderWidth:2, overflow:'hidden', alignItems:'center', justifyContent:'center' },
  photo:         { width:'100%', height:'100%' },
  initialBox:    { width:'100%', height:'100%', alignItems:'center', justifyContent:'center' },
  initialTxt:    { fontSize:22, fontFamily:'NotoSansDevanagari_700Bold' },
  houseName:     { fontSize:17, fontFamily:'NotoSansDevanagari_700Bold' },
  houseLeader:   { fontSize:12.5, marginTop:2, fontFamily:'NotoSansDevanagari_400Regular' },
  detailBanner:  { borderRadius:18, padding:24, alignItems:'center', elevation:4, shadowColor:'#000', shadowOpacity:0.2, shadowRadius:8 },
  detailPhotoFrame:{ width:96, height:96, borderRadius:48, borderWidth:3, overflow:'hidden', alignItems:'center', justifyContent:'center', marginBottom:12 },
  detailPhoto:   { width:'100%', height:'100%' },
  detailInitial: { width:'100%', height:'100%', alignItems:'center', justifyContent:'center' },
  detailInitialTxt:{ fontSize:38, fontFamily:'NotoSansDevanagari_700Bold' },
  detailName:    { fontSize:22, fontFamily:'NotoSansDevanagari_700Bold', textAlign:'center' },
  detailLeader:  { fontSize:14, marginTop:4, fontFamily:'NotoSansDevanagari_400Regular' },
  loaderBox:     { padding:24, alignItems:'center' },
  adminEditBtn:  { flexDirection:'row', alignItems:'center', gap:8, borderRadius:10, paddingVertical:11, paddingHorizontal:16, marginBottom:12, alignSelf:'flex-start' },
  adminEditTxt:  { color:'#fff', fontSize:13, fontFamily:'NotoSansDevanagari_700Bold' },
  contentCard:   { backgroundColor:'#fff', borderRadius:14, padding:16, elevation:2, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:6 },
  contentTxt:    { fontSize:17, lineHeight:28, color:COLORS.ink, fontFamily:'NotoSansDevanagari_700Bold' },
  emptyCard:     { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'#F5F0E8', borderRadius:12, padding:16 },
  emptyTxt:      { fontSize:13, color:COLORS.inkLight, fontFamily:'NotoSansDevanagari_400Regular', fontStyle:'italic' },
  emptyTxtEng:   { fontSize:11, color:COLORS.inkLight, marginTop:2 },
  editAreaWrap:  { borderRadius:12, borderWidth:2, shadowRadius:10, shadowOffset:{width:0,height:0}, elevation:6, marginBottom:0 },
  editArea:      { backgroundColor:'#fff', borderRadius:10, padding:14, minHeight:170, fontSize:15, lineHeight:24, color:COLORS.ink, fontFamily:'NotoSansDevanagari_400Regular' },
  editActions:   { flexDirection:'row', gap:12, marginTop:12 },
  cancelBtn:     { flex:1, backgroundColor:'#F5F0E8', borderRadius:12, padding:14, alignItems:'center' },
  cancelBtnTxt:  { fontSize:14, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.inkSoft },
  saveBtn:       { flex:2, borderRadius:12, padding:14, alignItems:'center' },
  saveBtnTxt:    { fontSize:14, fontFamily:'NotoSansDevanagari_700Bold', color:'#fff' },
});
