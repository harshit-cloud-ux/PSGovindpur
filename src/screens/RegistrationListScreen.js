import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, RefreshControl, Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLORS } from '../theme/colors';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { buildPdfHtml } from '../utils/registrationPdf';

export default function RegistrationListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'registrations'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Newest first. createdAt is a numeric timestamp on new records; older ones fall back to 0.
      data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setRows(data);
    } catch (e) {
      Alert.alert('त्रुटि', 'सूची लोड करने में समस्या: ' + e.message);
    }
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const viewPdf = async (rec) => {
    setBusyId(rec.id);
    try {
      const html = buildPdfHtml(rec, rec._id || rec.app_no || '', rec.submitted_at || '');
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'फॉर्म देखें' });
    } catch (e) { Alert.alert('त्रुटि', 'PDF खोलने में समस्या: ' + e.message); }
    setBusyId(null);
  };

  const editForm = (rec) => navigation.navigate('Registration', { editRecord: rec, docId: rec.id });

  const confirmDelete = (rec) => {
    Alert.alert(
      'फॉर्म हटाएँ?',
      `${rec.student_name_hi || 'इस छात्र'} का पंजीकरण (${rec._id || ''}) स्थायी रूप से हटा दिया जाएगा। यह क्रिया वापस नहीं ली जा सकती।`,
      [
        { text: 'रद्द करें', style: 'cancel' },
        { text: 'हटाएँ', style: 'destructive', onPress: async () => {
            setBusyId(rec.id);
            try {
              await deleteDoc(doc(db, 'registrations', rec.id));
              setRows(prev => prev.filter(r => r.id !== rec.id));
            } catch (e) { Alert.alert('त्रुटि', 'हटाने में समस्या: ' + e.message); }
            setBusyId(null);
          } },
      ]
    );
  };

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#060F24','#0F2347','#1A3A6B']} style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} hitSlop={{top:10,bottom:10,left:10,right:10}}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerTitle}><Text style={s.headerHindi}>भरे हुए फॉर्म</Text><Text style={s.headerEng}>Filled Forms</Text></View>
        <View style={{ width: 38 }} />
      </LinearGradient>
      <View style={s.tricolor}><View style={[s.stripe,{backgroundColor:'#FF9933'}]}/><View style={[s.stripe,{backgroundColor:'#fff'}]}/><View style={[s.stripe,{backgroundColor:'#138808'}]}/></View>

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" color={COLORS.green} /><Text style={s.muted}>लोड हो रहा है…</Text></View>
      ) : rows.length === 0 ? (
        <View style={s.center}>
          <Ionicons name="document-text-outline" size={48} color={COLORS.inkLight} />
          <Text style={s.muted}>अभी तक कोई फॉर्म जमा नहीं हुआ है।</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
        >
          <Text style={s.count}>कुल {rows.length} फॉर्म</Text>
          {rows.map((rec, i) => (
            <View key={rec.id} style={s.card}>
              <View style={s.cardTop}>
                <View style={s.serial}><Text style={s.serialTxt}>{i + 1}</Text></View>
                {rec.photo_url ? <Image source={{ uri: rec.photo_url }} style={s.thumb} /> : null}
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{rec.student_name_hi || '—'}</Text>
                  <Text style={s.meta}>{rec._id || '—'}{rec.applied_class ? '  ·  ' + rec.applied_class : ''}</Text>
                  <Text style={s.metaSub}>{rec.submitted_at || ''}</Text>
                </View>
              </View>
              <View style={s.actions}>
                {busyId === rec.id ? (
                  <ActivityIndicator color={COLORS.navyPrimary} style={{ paddingVertical: 6 }} />
                ) : (
                  <>
                    <TouchableOpacity style={[s.btn, s.btnView]} onPress={() => viewPdf(rec)}>
                      <Ionicons name="eye-outline" size={16} color={COLORS.navyPrimary} /><Text style={[s.btnTxt,{color:COLORS.navyPrimary}]}>देखें</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.btn, s.btnEdit]} onPress={() => editForm(rec)}>
                      <Ionicons name="create-outline" size={16} color={COLORS.green} /><Text style={[s.btnTxt,{color:COLORS.green}]}>संपादित</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.btn, s.btnDel]} onPress={() => confirmDelete(rec)}>
                      <Ionicons name="trash-outline" size={16} color="#DC2626" /><Text style={[s.btnTxt,{color:'#DC2626'}]}>हटाएँ</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
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
  center:      { flex:1, alignItems:'center', justifyContent:'center', gap:12, padding:24 },
  muted:       { color:COLORS.inkLight, fontSize:14, fontFamily:'NotoSansDevanagari_400Regular', textAlign:'center' },
  count:       { fontSize:12, color:COLORS.inkLight, marginBottom:10, fontFamily:'NotoSansDevanagari_400Regular' },
  card:        { backgroundColor:'#fff', borderRadius:14, padding:14, marginBottom:12, borderWidth:1, borderColor:'#E7E5E4', elevation:2, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:6 },
  cardTop:     { flexDirection:'row', alignItems:'center', gap:12 },
  serial:      { width:30, height:30, borderRadius:15, backgroundColor:'#FEF3C7', alignItems:'center', justifyContent:'center' },
  serialTxt:   { fontSize:13, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },
  thumb:       { width:40, height:50, borderRadius:6, borderWidth:1, borderColor:'#D6D3D1', backgroundColor:'#FAFAF9' },
  name:        { fontSize:16, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },
  meta:        { fontSize:12, color:COLORS.inkSoft, marginTop:2, fontFamily:'NotoSansDevanagari_400Regular' },
  metaSub:     { fontSize:11, color:COLORS.inkLight, marginTop:1, fontFamily:'NotoSansDevanagari_400Regular' },
  actions:     { flexDirection:'row', gap:8, marginTop:12, justifyContent:'flex-end' },
  btn:         { flexDirection:'row', alignItems:'center', gap:5, paddingHorizontal:12, paddingVertical:8, borderRadius:8, borderWidth:1 },
  btnView:     { backgroundColor:'#EFF6FF', borderColor:'#BFDBFE' },
  btnEdit:     { backgroundColor:'#F0FDF4', borderColor:'#BBF7D0' },
  btnDel:      { backgroundColor:'#FEF2F2', borderColor:'#FCA5A5' },
  btnTxt:      { fontSize:13, fontFamily:'NotoSansDevanagari_700Bold' },
});