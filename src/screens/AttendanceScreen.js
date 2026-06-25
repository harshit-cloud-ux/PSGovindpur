import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { doc, getDoc, setDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

// ─── DEFAULT ROSTERS ────────────────────────────────────────────────────────
const DEFAULT_STUDENTS = {
  1: ['देव','लवकुश','काव्या','उमंग','इजरा','अनुज','शिवांश','शौर्य','अमन','प्रियांशी','अन्नू','कुमकुम','ऋतिक','सचिन','मायरा','साध्वी','मायनूर','ज्योति','भक्ति','निधि','वंश शुक्ला','पूनम','भूमि','आहद','जानवी','नैना','प्रशांत','वंश','कुनाल','अनिका','शिवा','चेतन'],
  2: ['अंशिका','अरुण','चिंकी','गुंजन','इकरा','जानवी','काव्या','मयंक','मोहित','प्रशांत','राधिका','रोहित','सौरव','शिव','शिवम','शिवानी','तानिया','वेदांश','विष्णु','प्रियांशी','स्नेहा','भूमि','दिव्यम','लवकुश','कान्हा','हरेंद्र','नित्या','शिवा','गौरव','ललित','सुहानी'],
  3: ['कुनाल','आदित्य','भावना','देव','कृष्णा','नाजरा','नित्या','रीतेश','सागर','श्रीकांत','राम','टीना','कपिल','प्रिया','शिवांश','केशव','सक्षम','डिंपल','निधि','ईशानी','दीपक','यस्शू','अल्लशिफा'],
  4: ['आचुकी','लवली','ऋषि','शिवम गोला','विष्णु','यतिका','जैनव','पायल','मिशव','शिवम','शिवानी','बोंटी','गुड़िया','मेघा','परी','रीया','मोहिनी','सुंदरी'],
  5: ['अंशु','दीपक','दीपिका','दिशू','देव','दिव्या','गुड़िया गोस्वामी','हर्ष','कपिल','कृष्णा','लवी','लवली','माधुरी','नंदिनी','परी शुक्ला','पायल','माहिरा','प्रियांशु','रूही','शिव','योगिता'],
};

const CLASSES = [
  { n: 1, hi: 'कक्षा 1', eng: 'Class 1', color: '#1A3A6B' },
  { n: 2, hi: 'कक्षा 2', eng: 'Class 2', color: '#C2410C' },
  { n: 3, hi: 'कक्षा 3', eng: 'Class 3', color: '#138808' },
  { n: 4, hi: 'कक्षा 4', eng: 'Class 4', color: '#7C3AED' },
  { n: 5, hi: 'कक्षा 5', eng: 'Class 5', color: '#BE185D' },
];

const HINDI_MONTHS   = ['जनवरी','फरवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितंबर','अक्टूबर','नवंबर','दिसंबर'];
const HINDI_WEEKDAYS = ['रविवार','सोमवार','मंगलवार','बुधवार','गुरुवार','शुक्रवार','शनिवार'];

function todayISO() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
}
function fmtDate(iso) {
  if (!iso) return '';
  const [y,m,d] = iso.split('-').map(Number);
  const dt = new Date(y,m-1,d);
  return `${HINDI_WEEKDAYS[dt.getDay()]}, ${d} ${HINDI_MONTHS[m-1]} ${y}`;
}
function rosterDocId(classN) { return `roster_class${classN}`; }
function attDocId(classN, iso) { return `class${classN}_${iso}`; }

// ─── DATE PICKER ─────────────────────────────────────────────────────────────
function DatePickerModal({ visible, initial, onPick, onClose }) {
  const init = (initial||todayISO()).split('-').map(Number);
  const [y,setY]=useState(init[0]); const [m,setM]=useState(init[1]); const [d,setD]=useState(init[2]);
  const days=Array.from({length:new Date(y,m,0).getDate()},(_,i)=>i+1);
  const thisYear=new Date().getFullYear();
  const years=Array.from({length:3},(_,i)=>thisYear-1+i);
  const confirm=()=>{ onPick(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`); };
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.modalBackdrop}>
        <View style={s.modalCard}>
          <Text style={s.modalTitle}>तिथि चुनें</Text>
          <Text style={s.modalSub}>दिन</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={s.chipRow}>{days.map(x=>(
              <TouchableOpacity key={x} onPress={()=>setD(x)} style={[s.chip,d===x&&s.chipActive]}>
                <Text style={[s.chipTxt,d===x&&s.chipActiveTxt]}>{String(x).padStart(2,'0')}</Text>
              </TouchableOpacity>))}</View>
          </ScrollView>
          <Text style={s.modalSub}>माह</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={s.chipRow}>{HINDI_MONTHS.map((nm,i)=>(
              <TouchableOpacity key={i} onPress={()=>setM(i+1)} style={[s.chip,m===i+1&&s.chipActive]}>
                <Text style={[s.chipTxt,m===i+1&&s.chipActiveTxt]}>{nm}</Text>
              </TouchableOpacity>))}</View>
          </ScrollView>
          <Text style={s.modalSub}>वर्ष</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={s.chipRow}>{years.map(x=>(
              <TouchableOpacity key={x} onPress={()=>setY(x)} style={[s.chip,y===x&&s.chipActive]}>
                <Text style={[s.chipTxt,y===x&&s.chipActiveTxt]}>{x}</Text>
              </TouchableOpacity>))}</View>
          </ScrollView>
          <View style={s.modalActions}>
            <TouchableOpacity style={[s.modalBtn,{backgroundColor:'#E7E5E4'}]} onPress={onClose}><Text style={[s.modalBtnTxt,{color:COLORS.inkSoft}]}>रद्द करें</Text></TouchableOpacity>
            <TouchableOpacity style={[s.modalBtn,{backgroundColor:COLORS.green}]} onPress={confirm}><Text style={s.modalBtnTxt}>ठीक है</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── ADD STUDENT MODAL ───────────────────────────────────────────────────────
function AddStudentModal({ visible, onAdd, onClose }) {
  const [name, setName] = useState('');
  const submit = () => {
    const n = name.trim();
    if (!n) { Alert.alert('नाम खाली है','कृपया छात्र का नाम लिखें।'); return; }
    onAdd(n); setName('');
  };
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={s.modalBackdrop} behavior={Platform.OS==='ios'?'padding':undefined}>
        <View style={s.modalCard}>
          <Text style={s.modalTitle}>नया छात्र जोड़ें</Text>
          <TextInput style={s.nameInput} value={name} onChangeText={setName}
            placeholder="छात्र का नाम लिखें" placeholderTextColor={COLORS.inkLight} autoFocus />
          <View style={s.modalActions}>
            <TouchableOpacity style={[s.modalBtn,{backgroundColor:'#E7E5E4'}]} onPress={()=>{setName('');onClose();}}>
              <Text style={[s.modalBtnTxt,{color:COLORS.inkSoft}]}>रद्द करें</Text></TouchableOpacity>
            <TouchableOpacity style={[s.modalBtn,{backgroundColor:COLORS.green}]} onPress={submit}>
              <Text style={s.modalBtnTxt}>जोड़ें</Text></TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── ATTENDANCE TAKER (admin) ────────────────────────────────────────────────
function AttendanceTaker({ classN, date, accent, onBack }) {
  const [students,  setStudents]  = useState([]);
  const [status,    setStatus]    = useState({});   // {name: 'P'|'A'}
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [addOpen,   setAddOpen]   = useState(false);

  // load roster from Firestore (or fall back to default)
  const loadRoster = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db,'attendance',rosterDocId(classN)));
      const list = snap.exists() ? snap.data().students : DEFAULT_STUDENTS[classN];
      setStudents(list||[]);
      // load any existing attendance for this date
      const attSnap = await getDoc(doc(db,'attendance',attDocId(classN,date)));
      setStatus(attSnap.exists() ? (attSnap.data().status||{}) : {});
    } catch(e){ console.warn(e); setStudents(DEFAULT_STUDENTS[classN]||[]); }
    setLoading(false);
  },[classN,date]);

  useEffect(()=>{ loadRoster(); },[loadRoster]);

  const toggle = (name, val) => setStatus(prev=>({...prev,[name]:val}));

  const addStudent = async (name) => {
    const next = [...students, name];
    setStudents(next);
    setAddOpen(false);
    try { await setDoc(doc(db,'attendance',rosterDocId(classN)),{students:next},{merge:true}); }
    catch(e){ Alert.alert('त्रुटि',e.message); }
  };

  const removeStudent = (name) => {
    Alert.alert('छात्र हटाएं?', `"${name}" को सूची से हटाना चाहते हैं?`,[
      {text:'नहीं',style:'cancel'},
      {text:'हटाएं',style:'destructive', onPress: async ()=>{
        const next = students.filter(s=>s!==name);
        setStudents(next);
        const newStatus = {...status}; delete newStatus[name]; setStatus(newStatus);
        try { await setDoc(doc(db,'attendance',rosterDocId(classN)),{students:next},{merge:true}); }
        catch(e){ Alert.alert('त्रुटि',e.message); }
      }},
    ]);
  };

  const submit = async () => {
    const unmarked = students.filter(n=>!status[n]);
    if (unmarked.length>0) {
      Alert.alert('अधूरी उपस्थिति',`${unmarked.length} छात्रों की उपस्थिति अभी तक नहीं ली गई:\n${unmarked.slice(0,5).join(', ')}${unmarked.length>5?'...':''}`,
        [{text:'वापस जाएं',style:'cancel'},{text:'फिर भी जमा करें',onPress:()=>doSubmit()}]);
      return;
    }
    doSubmit();
  };

  const doSubmit = async () => {
    setSaving(true);
    try {
      const present = students.filter(n=>status[n]==='P');
      const absent  = students.filter(n=>status[n]==='A');
      await setDoc(doc(db,'attendance',attDocId(classN,date)),{
        classN, date, status, present, absent,
        total:students.length, submitted_at: new Date().toISOString(),
      });
      Alert.alert('✅ सफल!',`उपस्थिति सफलतापूर्वक जमा की गई।\nउपस्थित: ${present.length}  |  अनुपस्थित: ${absent.length}`,[{text:'ठीक है',onPress:onBack}]);
    } catch(e){ Alert.alert('त्रुटि',e.message); }
    setSaving(false);
  };

  const present = students.filter(n=>status[n]==='P').length;
  const absent  = students.filter(n=>status[n]==='A').length;

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={accent}/></View>;

  return (
    <View style={{flex:1}}>
      {/* summary bar */}
      <View style={[s.summaryBar,{backgroundColor:accent}]}>
        <View style={s.summaryItem}><Text style={s.summaryNum}>{students.length}</Text><Text style={s.summaryLbl}>कुल</Text></View>
        <View style={s.summaryItem}><Text style={s.summaryNum}>{present}</Text><Text style={s.summaryLbl}>उपस्थित</Text></View>
        <View style={s.summaryItem}><Text style={s.summaryNum}>{absent}</Text><Text style={s.summaryLbl}>अनुपस्थित</Text></View>
        <View style={s.summaryItem}><Text style={s.summaryNum}>{students.length-present-absent}</Text><Text style={s.summaryLbl}>शेष</Text></View>
      </View>

      <ScrollView contentContainerStyle={{padding:16,paddingBottom:100}}>
        {/* admin controls */}
        <View style={s.adminRow}>
          <TouchableOpacity style={[s.adminSmBtn,{backgroundColor:accent}]} onPress={()=>setAddOpen(true)}>
            <Ionicons name="person-add" size={16} color="#fff"/>
            <Text style={s.adminSmTxt}>छात्र जोड़ें</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.adminSmBtn,{backgroundColor:'#6B7280'}]} onPress={()=>{
            const all={}; students.forEach(n=>all[n]='P'); setStatus(all);
          }}>
            <Ionicons name="checkmark-done" size={16} color="#fff"/>
            <Text style={s.adminSmTxt}>सभी उपस्थित</Text>
          </TouchableOpacity>
        </View>

        {students.map((name,i)=>(
          <View key={i} style={s.studentRow}>
            <Text style={s.studentNum}>{i+1}</Text>
            <Text style={s.studentName}>{name}</Text>
            <TouchableOpacity
              style={[s.attBtn, status[name]==='P' ? s.btnPresent : s.btnPresentOff]}
              onPress={()=>toggle(name,'P')}
            >
              <Text style={[s.attBtnTxt, status[name]==='P' && {color:'#fff'}]}>P</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.attBtn, status[name]==='A' ? s.btnAbsent : s.btnAbsentOff]}
              onPress={()=>toggle(name,'A')}
            >
              <Text style={[s.attBtnTxt, status[name]==='A' && {color:'#fff'}]}>A</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>removeStudent(name)} hitSlop={{top:8,bottom:8,left:8,right:8}}>
              <Ionicons name="trash-outline" size={18} color="#DC2626"/>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* submit button */}
      <View style={s.submitWrap}>
        <TouchableOpacity style={[s.submitBtn,{backgroundColor:accent}]} onPress={submit} activeOpacity={0.85}>
          {saving ? <ActivityIndicator color="#fff"/> : <>
            <Ionicons name="checkmark-circle" size={22} color="#fff"/>
            <Text style={s.submitTxt}>उपस्थिति जमा करें</Text>
          </>}
        </TouchableOpacity>
      </View>

      <AddStudentModal visible={addOpen} onAdd={addStudent} onClose={()=>setAddOpen(false)}/>
    </View>
  );
}

// ─── ATTENDANCE VIEWER (students) ────────────────────────────────────────────
function AttendanceViewer({ classN, date, accent }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    setLoading(true);
    getDoc(doc(db,'attendance',attDocId(classN,date)))
      .then(snap=>{ setData(snap.exists()?snap.data():null); setLoading(false); })
      .catch(()=>setLoading(false));
  },[classN,date]);

  if (loading) return <View style={s.center}><ActivityIndicator size="large" color={accent}/></View>;
  if (!data)   return (
    <View style={s.center}>
      <Ionicons name="document-text-outline" size={52} color={COLORS.inkLight}/>
      <Text style={s.emptyTxt}>इस तिथि की उपस्थिति अभी उपलब्ध नहीं है।</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{padding:16,paddingBottom:40}}>
      <View style={[s.summaryBar,{backgroundColor:accent,borderRadius:14,marginBottom:16}]}>
        <View style={s.summaryItem}><Text style={s.summaryNum}>{data.total||0}</Text><Text style={s.summaryLbl}>कुल</Text></View>
        <View style={s.summaryItem}><Text style={s.summaryNum}>{data.present?.length||0}</Text><Text style={s.summaryLbl}>उपस्थित</Text></View>
        <View style={s.summaryItem}><Text style={s.summaryNum}>{data.absent?.length||0}</Text><Text style={s.summaryLbl}>अनुपस्थित</Text></View>
      </View>

      {(data.absent||[]).length>0 && (
        <View style={s.listSection}>
          <View style={s.listHead}><View style={[s.listDot,{backgroundColor:'#DC2626'}]}/><Text style={s.listHeadTxt}>अनुपस्थित विद्यार्थी ({data.absent?.length||0})</Text></View>
          {(data.absent||[]).map((n,i)=>(
            <View key={i} style={s.viewRow}>
              <Text style={s.viewNum}>{i+1}</Text>
              <Text style={s.viewName}>{n}</Text>
              <View style={s.badgeAbsent}><Text style={s.badgeTxt}>अनुपस्थित</Text></View>
            </View>
          ))}
        </View>
      )}

      <View style={[s.listSection,{marginTop:16}]}>
        <View style={s.listHead}><View style={[s.listDot,{backgroundColor:'#16A34A'}]}/><Text style={s.listHeadTxt}>उपस्थित विद्यार्थी ({data.present?.length||0})</Text></View>
        {(data.present||[]).map((n,i)=>(
          <View key={i} style={s.viewRow}>
            <Text style={s.viewNum}>{i+1}</Text>
            <Text style={s.viewName}>{n}</Text>
            <View style={s.badgePresent}><Text style={s.badgeTxt}>उपस्थित</Text></View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── CLASS DETAIL SCREEN ─────────────────────────────────────────────────────
function ClassScreen({ cls, onBack }) {
  const { isAdmin } = useAuth();
  const [date,        setDate]        = useState(todayISO());
  const [pickerOpen,  setPickerOpen]  = useState(false);

  // students: for non-admin, jump to latest submitted date
  const [latestDate, setLatestDate] = useState(null);
  const [loadingLatest, setLoadingLatest] = useState(!isAdmin);

  useEffect(()=>{
    if (isAdmin) return;
    setLoadingLatest(true);
    // fetch all attendance docs for this class, pick latest
    getDocs(collection(db,'attendance'))
      .then(snap=>{
        const prefix=`class${cls.n}_`;
        const ids=snap.docs.map(d=>d.id).filter(id=>id.startsWith(prefix)).map(id=>id.replace(prefix,''));
        if (ids.length>0){
          const latest=ids.sort((a,b)=>b.localeCompare(a))[0];
          setDate(latest); setLatestDate(latest);
        }
        setLoadingLatest(false);
      })
      .catch(()=>setLoadingLatest(false));
  },[cls.n,isAdmin]);

  if (loadingLatest) return <View style={s.center}><ActivityIndicator size="large" color={cls.color}/></View>;

  return (
    <View style={{flex:1}}>
      {/* Date bar */}
      <View style={[s.dateBar,{backgroundColor:cls.color}]}>
        <TouchableOpacity
          activeOpacity={isAdmin?0.7:1}
          onPress={isAdmin?()=>setPickerOpen(true):undefined}
          style={s.dateBarInner}
        >
          <View style={s.dateIcon}><Ionicons name="calendar" size={20} color="#FED7AA"/></View>
          <View style={{flex:1}}>
            <Text style={s.dateLabel}>{isAdmin?'तिथि चुनें (टैप करें)':'दिनांक'}</Text>
            <Text style={s.dateValue}>{fmtDate(date)}</Text>
          </View>
          {isAdmin && <Ionicons name="chevron-down" size={18} color="#FED7AA"/>}
        </TouchableOpacity>
      </View>

      {isAdmin
        ? <AttendanceTaker classN={cls.n} date={date} accent={cls.color} onBack={onBack}/>
        : <AttendanceViewer classN={cls.n} date={date} accent={cls.color}/>
      }

      <DatePickerModal visible={pickerOpen} initial={date} onPick={d=>{setDate(d);setPickerOpen(false);}} onClose={()=>setPickerOpen(false)}/>
    </View>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function AttendanceScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selClass, setSelClass] = useState(null);

  const cls = selClass !== null ? CLASSES[selClass] : null;

  const goBack = () => {
    if (selClass !== null) { setSelClass(null); return; }
    navigation.goBack();
  };

  return (
    <View style={[s.root,{paddingTop:insets.top}]}>
      <LinearGradient colors={['#060F24','#0F2347','#1A3A6B']} style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={goBack} hitSlop={{top:10,bottom:10,left:10,right:10}}>
          <Ionicons name="arrow-back" size={22} color="#fff"/>
        </TouchableOpacity>
        <View style={s.headerTitle}>
          <Text style={s.headerHindi}>{cls ? cls.hi : 'उपस्थिति'}</Text>
          <Text style={s.headerEng}>{cls ? cls.eng : 'Attendance'}</Text>
        </View>
        <View style={{width:38}}/>
      </LinearGradient>
      <View style={s.tricolor}>
        <View style={[s.stripe,{backgroundColor:'#FF9933'}]}/>
        <View style={[s.stripe,{backgroundColor:'#fff'}]}/>
        <View style={[s.stripe,{backgroundColor:'#138808'}]}/>
      </View>

      {selClass === null ? (
        <ScrollView contentContainerStyle={{paddingBottom:40}}>
          <View style={s.section}>
            <LinearGradient colors={['#0F2347','#1A3A6B','#1E4D8C']} style={s.hero}>
              <View style={s.heroIcon}><Ionicons name="people" size={28} color={COLORS.gold}/></View>
              <Text style={s.heroTitle}>उपस्थिति पंजिका</Text>
              <Text style={s.heroSub}>कक्षावार दैनिक उपस्थिति · सत्र 2026-27</Text>
            </LinearGradient>
          </View>
          <View style={s.section}>
            <View style={s.secHead}><View style={s.secBar}/><Text style={s.secTitle}>कक्षा चुनें</Text></View>
            <Text style={s.secTitleEng}>Select Class</Text>
            {CLASSES.map((c,i)=>(
              <TouchableOpacity key={c.n} activeOpacity={0.85} onPress={()=>setSelClass(i)} style={s.classCard}>
                <View style={[s.classNum,{backgroundColor:c.color}]}><Text style={s.classNumTxt}>{c.n}</Text></View>
                <View style={{flex:1}}>
                  <Text style={s.classCardTitle}>{c.hi}</Text>
                  <Text style={s.classCardSub}>{c.eng} · {DEFAULT_STUDENTS[c.n].length} छात्र</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.inkLight}/>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ClassScreen cls={cls} onBack={()=>setSelClass(null)}/>
      )}
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:         { flex:1, backgroundColor:'#FBF3E4' },
  header:       { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:14 },
  backBtn:      { width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,255,255,0.12)', borderWidth:1, borderColor:'rgba(255,255,255,0.18)', alignItems:'center', justifyContent:'center' },
  headerTitle:  { alignItems:'center', flex:1, paddingHorizontal:6 },
  headerHindi:  { color:'#fff', fontSize:18, fontFamily:'NotoSansDevanagari_700Bold' },
  headerEng:    { color:'#FED7AA', fontSize:10, marginTop:1 },
  tricolor:     { flexDirection:'row', height:4 },
  stripe:       { flex:1 },
  section:      { paddingHorizontal:16, paddingTop:16 },
  hero:         { borderRadius:18, padding:22, alignItems:'center', elevation:4, shadowColor:'#000', shadowOpacity:0.2, shadowRadius:8 },
  heroIcon:     { width:56, height:56, borderRadius:28, backgroundColor:'rgba(201,168,76,0.15)', borderWidth:1.5, borderColor:COLORS.gold, alignItems:'center', justifyContent:'center', marginBottom:12 },
  heroTitle:    { color:'#fff', fontSize:20, fontFamily:'NotoSansDevanagari_700Bold', textAlign:'center' },
  heroSub:      { color:'#C9DCF0', fontSize:12, marginTop:5, textAlign:'center', fontFamily:'NotoSansDevanagari_400Regular' },
  secHead:      { flexDirection:'row', alignItems:'center', marginBottom:4 },
  secBar:       { width:4, height:22, borderRadius:2, marginRight:10, backgroundColor:COLORS.saffron },
  secTitle:     { fontSize:18, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyPrimary },
  secTitleEng:  { fontSize:11, color:COLORS.inkLight, marginLeft:14, marginBottom:14, letterSpacing:0.4 },
  classCard:    { flexDirection:'row', alignItems:'center', gap:14, backgroundColor:'#fff', borderRadius:14, padding:14, marginBottom:10, elevation:2, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:6 },
  classNum:     { width:48, height:48, borderRadius:14, alignItems:'center', justifyContent:'center' },
  classNumTxt:  { color:'#fff', fontSize:22, fontFamily:'NotoSansDevanagari_700Bold' },
  classCardTitle:{ fontSize:17, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },
  classCardSub: { fontSize:12, color:COLORS.inkLight, marginTop:2, fontFamily:'NotoSansDevanagari_400Regular' },
  center:       { flex:1, alignItems:'center', justifyContent:'center', gap:12, padding:24 },
  emptyTxt:     { color:COLORS.inkLight, fontSize:14, fontFamily:'NotoSansDevanagari_400Regular', textAlign:'center', marginTop:8 },

  dateBar:      { paddingHorizontal:16, paddingVertical:12 },
  dateBarInner: { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:'rgba(255,255,255,0.15)', borderRadius:14, padding:12 },
  dateIcon:     { width:40, height:40, borderRadius:10, backgroundColor:'rgba(255,255,255,0.15)', alignItems:'center', justifyContent:'center' },
  dateLabel:    { color:'rgba(255,255,255,0.75)', fontSize:11, fontFamily:'NotoSansDevanagari_400Regular' },
  dateValue:    { color:'#fff', fontSize:15, fontFamily:'NotoSansDevanagari_700Bold', marginTop:2 },

  summaryBar:   { flexDirection:'row', justifyContent:'space-around', paddingVertical:14, paddingHorizontal:8 },
  summaryItem:  { alignItems:'center' },
  summaryNum:   { color:'#fff', fontSize:22, fontFamily:'NotoSansDevanagari_700Bold' },
  summaryLbl:   { color:'rgba(255,255,255,0.8)', fontSize:11, fontFamily:'NotoSansDevanagari_400Regular', marginTop:2 },

  adminRow:     { flexDirection:'row', gap:10, marginBottom:14 },
  adminSmBtn:   { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:6, paddingVertical:11, borderRadius:12 },
  adminSmTxt:   { color:'#fff', fontSize:13, fontFamily:'NotoSansDevanagari_700Bold' },

  studentRow:   { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'#fff', borderRadius:12, paddingHorizontal:12, paddingVertical:11, marginBottom:8, elevation:1, shadowColor:'#000', shadowOpacity:0.04, shadowRadius:4 },
  studentNum:   { width:22, color:COLORS.inkLight, fontSize:13, fontWeight:'700', textAlign:'center' },
  studentName:  { flex:1, fontSize:15, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },
  attBtn:       { width:40, height:36, borderRadius:8, alignItems:'center', justifyContent:'center', borderWidth:2 },
  attBtnTxt:    { fontSize:14, fontWeight:'900', color:COLORS.inkLight },
  btnPresent:   { backgroundColor:'#16A34A', borderColor:'#16A34A' },
  btnPresentOff:{ backgroundColor:'#F0FDF4', borderColor:'#86EFAC' },
  btnAbsent:    { backgroundColor:'#DC2626', borderColor:'#DC2626' },
  btnAbsentOff: { backgroundColor:'#FEF2F2', borderColor:'#FCA5A5' },

  submitWrap:   { position:'absolute', bottom:0, left:0, right:0, padding:16, backgroundColor:'rgba(251,243,228,0.95)' },
  submitBtn:    { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, paddingVertical:16, borderRadius:16, elevation:4, shadowColor:'#000', shadowOpacity:0.15, shadowRadius:8 },
  submitTxt:    { color:'#fff', fontSize:16, fontFamily:'NotoSansDevanagari_700Bold' },

  listSection:  { backgroundColor:'#fff', borderRadius:14, padding:14, elevation:2, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:6 },
  listHead:     { flexDirection:'row', alignItems:'center', gap:8, marginBottom:12 },
  listDot:      { width:10, height:10, borderRadius:5 },
  listHeadTxt:  { fontSize:15, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },
  viewRow:      { flexDirection:'row', alignItems:'center', gap:10, paddingVertical:9, borderBottomWidth:1, borderBottomColor:'#F5F5F4' },
  viewNum:      { width:24, color:COLORS.inkLight, fontSize:13, fontWeight:'700', textAlign:'center' },
  viewName:     { flex:1, fontSize:14, fontFamily:'NotoSansDevanagari_400Regular', color:COLORS.ink },
  badgePresent: { backgroundColor:'#DCFCE7', paddingHorizontal:10, paddingVertical:4, borderRadius:8 },
  badgeAbsent:  { backgroundColor:'#FEE2E2', paddingHorizontal:10, paddingVertical:4, borderRadius:8 },
  badgeTxt:     { fontSize:11, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },

  modalBackdrop:{ flex:1, backgroundColor:'rgba(0,0,0,0.55)', justifyContent:'flex-end' },
  modalCard:    { backgroundColor:'#fff', borderTopLeftRadius:22, borderTopRightRadius:22, padding:20, paddingBottom:28 },
  modalTitle:   { fontSize:18, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyPrimary, marginBottom:8 },
  modalSub:     { fontSize:12, color:COLORS.inkSoft, fontFamily:'NotoSansDevanagari_400Regular', marginTop:14, marginBottom:6 },
  chipRow:      { flexDirection:'row', gap:8 },
  chip:         { paddingHorizontal:14, paddingVertical:9, borderRadius:18, backgroundColor:'#F5F5F4', borderWidth:1, borderColor:COLORS.border },
  chipActive:   { backgroundColor:COLORS.navyPrimary, borderColor:COLORS.navyPrimary },
  chipTxt:      { color:COLORS.ink, fontSize:13, fontFamily:'NotoSansDevanagari_400Regular' },
  chipActiveTxt:{ color:'#fff', fontWeight:'700' },
  modalActions: { flexDirection:'row', gap:10, marginTop:22 },
  modalBtn:     { flex:1, paddingVertical:14, borderRadius:12, alignItems:'center' },
  modalBtnTxt:  { color:'#fff', fontSize:15, fontFamily:'NotoSansDevanagari_700Bold' },
  nameInput:    { borderWidth:1.5, borderColor:COLORS.border, borderRadius:12, padding:14, fontSize:15, fontFamily:'NotoSansDevanagari_400Regular', color:COLORS.ink, backgroundColor:COLORS.paper },
});