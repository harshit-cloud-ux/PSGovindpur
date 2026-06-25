import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView,
  Platform, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

// ─── MASTER ROSTER ───────────────────────────────────────────────────────────
const DEFAULT_ROSTER = [
  ...['देव','लवकुश','काव्या','उमंग','इजरा','अनुज','शिवांश','शौर्य','अमन','प्रियांशी','अन्नू','कुमकुम','ऋतिक','सचिन','मायरा','साध्वी','मायनूर','ज्योति','भक्ति','निधि','वंश शुक्ला','पूनम','भूमि','आहद','जानवी','नैना','प्रशांत','वंश','कुनाल','अनिका','शिवा','चेतन'].map(n=>({name:n,class:1,phone:''})),
  ...['अंशिका','अरुण','चिंकी','गुंजन','इकरा','जानवी','काव्या','मयंक','मोहित','प्रशांत','राधिका','रोहित','सौरव','शिव','शिवम','शिवानी','तानिया','वेदांश','विष्णु','प्रियांशी','स्नेहा','भूमि','दिव्यम','लवकुश','कान्हा','हरेंद्र','नित्या','शिवा','गौरव','ललित','सुहानी'].map(n=>({name:n,class:2,phone:''})),
  ...['कुनाल','आदित्य','भावना','देव','कृष्णा','नाजरा','नित्या','रीतेश','सागर','श्रीकांत','राम','टीना','कपिल','प्रिया','शिवांश','केशव','सक्षम','डिंपल','निधि','ईशानी','दीपक','यस्शू','अल्लशिफा'].map(n=>({name:n,class:3,phone:''})),
  ...['आचुकी','लवली','ऋषि','शिवम गोला','विष्णु','यतिका','जैनव','पायल','मिशव','शिवम','शिवानी','बोंटी','गुड़िया','मेघा','परी','रीया','मोहिनी','सुंदरी'].map(n=>({name:n,class:4,phone:''})),
  ...['अंशु','दीपक','दीपिका','दिशू','देव','दिव्या','गुड़िया गोस्वामी','हर्ष','कपिल','कृष्णा','लवी','लवली','माधुरी','नंदिनी','परी शुक्ला','पायल','माहिरा','प्रियांशु','रूही','शिव','योगिता'].map(n=>({name:n,class:5,phone:''})),
];
const MASTER_DOC = 'master_roster';

const CLASSES = [
  { n:1, hi:'कक्षा 1', eng:'Class 1', color:'#1A3A6B' },
  { n:2, hi:'कक्षा 2', eng:'Class 2', color:'#C2410C' },
  { n:3, hi:'कक्षा 3', eng:'Class 3', color:'#138808' },
  { n:4, hi:'कक्षा 4', eng:'Class 4', color:'#7C3AED' },
  { n:5, hi:'कक्षा 5', eng:'Class 5', color:'#BE185D' },
];

const HINDI_MONTHS   = ['जनवरी','फरवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितंबर','अक्टूबर','नवंबर','दिसंबर'];
const HINDI_WEEKDAYS = ['रविवार','सोमवार','मंगलवार','बुधवार','गुरुवार','शुक्रवार','शनिवार'];

function todayISO() {
  const t=new Date();
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
}
function fmtDate(iso) {
  if (!iso) return '';
  const [y,m,d]=iso.split('-').map(Number); const dt=new Date(y,m-1,d);
  return `${HINDI_WEEKDAYS[dt.getDay()]}, ${d} ${HINDI_MONTHS[m-1]} ${y}`;
}
function attDocId(classN,iso) { return `class${classN}_${iso}`; }

function absenceMsg(name, dateISO) {
  const [y,m,d]=dateISO.split('-').map(Number);
  const dateStr=`${d} ${HINDI_MONTHS[m-1]} ${y}`;
  return `आदरणीय अभिभावक,\nआपका पुत्र/पुत्री ${name} आज दिनांक ${dateStr} को प्राथमिक विद्यालय गोविंदपुर में अनुपस्थित रहा/रही। कृपया अपने बच्चे को अनिवार्य रूप से प्रतिदिन विद्यालय भेजें। अनुपस्थिति के संबंध में विद्यालय से मो: 7217037876 पर संपर्क करें।\nधन्यवाद\nप्रधानाध्यापक,\nप्राथमिक विद्यालय गोविंदपुर`;
}

// ─── DATE PICKER ─────────────────────────────────────────────────────────────
function DatePickerModal({ visible, initial, onPick, onClose }) {
  const init=(initial||todayISO()).split('-').map(Number);
  const [y,setY]=useState(init[0]); const [m,setM]=useState(init[1]); const [d,setD]=useState(init[2]);
  const days=Array.from({length:new Date(y,m,0).getDate()},(_,i)=>i+1);
  const yr=new Date().getFullYear(); const years=Array.from({length:3},(_,i)=>yr-1+i);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.modalBackdrop}><View style={s.modalCard}>
        <Text style={s.modalTitle}>तिथि चुनें</Text>
        {[['दिन',days,d,setD,x=>String(x).padStart(2,'0')],['माह',HINDI_MONTHS.map((_,i)=>i+1),m,setM,x=>HINDI_MONTHS[x-1]],['वर्ष',years,y,setY,x=>String(x)]].map(([lbl,arr,val,set,fmt])=>(
          <View key={lbl}>
            <Text style={s.modalSub}>{lbl}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={s.chipRow}>{arr.map(x=>(
                <TouchableOpacity key={x} onPress={()=>set(x)} style={[s.chip,val===x&&s.chipActive]}>
                  <Text style={[s.chipTxt,val===x&&s.chipActiveTxt]}>{fmt(x)}</Text>
                </TouchableOpacity>))}
              </View>
            </ScrollView>
          </View>
        ))}
        <View style={s.modalActions}>
          <TouchableOpacity style={[s.modalBtn,{backgroundColor:'#E7E5E4'}]} onPress={onClose}><Text style={[s.modalBtnTxt,{color:COLORS.inkSoft}]}>रद्द करें</Text></TouchableOpacity>
          <TouchableOpacity style={[s.modalBtn,{backgroundColor:COLORS.green}]} onPress={()=>onPick(`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`)}>
            <Text style={s.modalBtnTxt}>ठीक है</Text></TouchableOpacity>
        </View>
      </View></View>
    </Modal>
  );
}

// ─── PHONE EDITOR MODAL ──────────────────────────────────────────────────────
function PhoneModal({ visible, student, onSave, onClose }) {
  const [phone,setPhone]=useState('');
  useEffect(()=>{ if(visible) setPhone(student?.phone||''); },[visible]);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={s.modalBackdrop} behavior={Platform.OS==='ios'?'padding':undefined}>
        <View style={s.modalCard}>
          <Text style={s.modalTitle}>{student?.name}</Text>
          <Text style={s.modalSub}>अभिभावक का मोबाइल नंबर</Text>
          <TextInput style={s.nameInput} value={phone} onChangeText={setPhone}
            placeholder="10 अंकों का मोबाइल नंबर" placeholderTextColor={COLORS.inkLight}
            keyboardType="phone-pad" maxLength={10} autoFocus />
          <View style={s.modalActions}>
            <TouchableOpacity style={[s.modalBtn,{backgroundColor:'#E7E5E4'}]} onPress={onClose}><Text style={[s.modalBtnTxt,{color:COLORS.inkSoft}]}>रद्द करें</Text></TouchableOpacity>
            <TouchableOpacity style={[s.modalBtn,{backgroundColor:COLORS.green}]} onPress={()=>onSave(phone.trim())}><Text style={s.modalBtnTxt}>सहेजें</Text></TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── ADD STUDENT MODAL ───────────────────────────────────────────────────────
function AddStudentModal({ visible, onAdd, onClose }) {
  const [name,setName]=useState(''); const [phone,setPhone]=useState(''); const [cls,setCls]=useState(1);
  const submit=()=>{
    const n=name.trim();
    if(!n){Alert.alert('नाम खाली है','कृपया छात्र का नाम लिखें।');return;}
    onAdd({name:n,class:cls,phone:phone.trim()}); setName(''); setPhone('');
  };
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={s.modalBackdrop} behavior={Platform.OS==='ios'?'padding':undefined}>
        <View style={s.modalCard}>
          <Text style={s.modalTitle}>नया छात्र जोड़ें</Text>
          <Text style={s.modalSub}>नाम</Text>
          <TextInput style={s.nameInput} value={name} onChangeText={setName} placeholder="छात्र का नाम" placeholderTextColor={COLORS.inkLight} autoFocus />
          <Text style={s.modalSub}>कक्षा</Text>
          <View style={s.chipRow}>
            {[1,2,3,4,5].map(n=>(
              <TouchableOpacity key={n} onPress={()=>setCls(n)} style={[s.chip,cls===n&&s.chipActive]}>
                <Text style={[s.chipTxt,cls===n&&s.chipActiveTxt]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.modalSub}>अभिभावक का मोबाइल (वैकल्पिक)</Text>
          <TextInput style={s.nameInput} value={phone} onChangeText={setPhone} placeholder="10 अंकों का नंबर" placeholderTextColor={COLORS.inkLight} keyboardType="phone-pad" maxLength={10} />
          <View style={s.modalActions}>
            <TouchableOpacity style={[s.modalBtn,{backgroundColor:'#E7E5E4'}]} onPress={()=>{setName('');setPhone('');onClose();}}><Text style={[s.modalBtnTxt,{color:COLORS.inkSoft}]}>रद्द करें</Text></TouchableOpacity>
            <TouchableOpacity style={[s.modalBtn,{backgroundColor:COLORS.green}]} onPress={submit}><Text style={s.modalBtnTxt}>जोड़ें</Text></TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── MASTER ROSTER SCREEN ────────────────────────────────────────────────────
function MasterRosterScreen({ roster, onRosterChange }) {
  const [phoneModal,setPhoneModal]=useState(null);
  const [addOpen,setAddOpen]=useState(false);
  const [saving,setSaving]=useState(false);

  const saveRoster=async(next)=>{
    setSaving(true);
    try{ await setDoc(doc(db,'attendance',MASTER_DOC),{students:next}); onRosterChange(next); }
    catch(e){ Alert.alert('त्रुटि',e.message); }
    setSaving(false);
  };

  return (
    <View style={{flex:1}}>
      <ScrollView contentContainerStyle={{padding:16,paddingBottom:100}}>
        <View style={[s.adminRow,{marginBottom:16}]}>
          <TouchableOpacity style={[s.adminSmBtn,{backgroundColor:COLORS.navyPrimary}]} onPress={()=>setAddOpen(true)}>
            <Ionicons name="person-add" size={16} color="#fff"/>
            <Text style={s.adminSmTxt}>नया छात्र जोड़ें</Text>
          </TouchableOpacity>
        </View>
        {CLASSES.map(c=>{
          const list=roster.filter(s=>s.class===c.n);
          return (
            <View key={c.n} style={{marginBottom:20}}>
              <View style={[s.rosterClassHead,{backgroundColor:c.color}]}>
                <Text style={s.rosterClassTitle}>{c.hi}</Text>
                <Text style={s.rosterClassCount}>{list.length} छात्र</Text>
              </View>
              {list.map((stu,i)=>(
                <View key={i} style={s.rosterRow}>
                  <Text style={s.rosterNum}>{i+1}</Text>
                  <View style={{flex:1}}>
                    <Text style={s.rosterName}>{stu.name}</Text>
                    {stu.phone ? <Text style={s.rosterPhone}>📱 {stu.phone}</Text> : <Text style={s.rosterNoPhone}>नंबर नहीं जोड़ा</Text>}
                  </View>
                  <TouchableOpacity style={[s.phoneBtn,{backgroundColor:stu.phone?'#DCFCE7':'#FEF3C7'}]} onPress={()=>setPhoneModal(stu)}>
                    <Ionicons name={stu.phone?'create-outline':'add-circle-outline'} size={15} color={stu.phone?'#16A34A':'#B45309'}/>
                    <Text style={[s.phoneBtnTxt,{color:stu.phone?'#16A34A':'#B45309'}]}>{stu.phone?'बदलें':'+ नंबर'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={()=>Alert.alert('छात्र हटाएं?',`"${stu.name}" को हटाना चाहते हैं?`,[{text:'नहीं',style:'cancel'},{text:'हटाएं',style:'destructive',onPress:()=>saveRoster(roster.filter(s=>s!==stu))}])} hitSlop={{top:8,bottom:8,left:8,right:8}} style={{marginLeft:8}}>
                    <Ionicons name="trash-outline" size={18} color="#DC2626"/>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
      {saving&&<View style={s.savingOverlay}><ActivityIndicator size="large" color="#fff"/></View>}
      <PhoneModal visible={!!phoneModal} student={phoneModal}
        onSave={async(phone)=>{ const next=roster.map(s=>s===phoneModal?{...s,phone}:s); setPhoneModal(null); await saveRoster(next); }}
        onClose={()=>setPhoneModal(null)}/>
      <AddStudentModal visible={addOpen} onAdd={async(stu)=>{ setAddOpen(false); await saveRoster([...roster,stu]); }} onClose={()=>setAddOpen(false)}/>
    </View>
  );
}

// ─── ATTENDANCE TAKER (admin) ────────────────────────────────────────────────
function AttendanceTaker({ classN, date, roster, accent, onSubmitted }) {
  const students=roster.filter(s=>s.class===classN);
  const [status,setStatus]=useState({});
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);

  useEffect(()=>{
    setLoading(true);
    getDoc(doc(db,'attendance',attDocId(classN,date)))
      .then(snap=>{ setStatus(snap.exists()?(snap.data().status||{}):{});setLoading(false); })
      .catch(()=>setLoading(false));
  },[classN,date]);

  const toggle=(name,val)=>setStatus(prev=>({...prev,[name]:val}));
  const present=students.filter(s=>status[s.name]==='P').length;
  const absent =students.filter(s=>status[s.name]==='A').length;

  const doSubmit=async()=>{
    setSaving(true);
    try{
      const presentNames=students.filter(s=>status[s.name]==='P').map(s=>s.name);
      const absentStudents=students.filter(s=>status[s.name]==='A');
      await setDoc(doc(db,'attendance',attDocId(classN,date)),{
        classN, date, status,
        present:presentNames,
        absent:absentStudents.map(s=>s.name),
        absentWithPhone:absentStudents.filter(s=>s.phone&&s.phone.length>=10).map(s=>({name:s.name,phone:s.phone})),
        total:students.length,
        submitted_at:new Date().toISOString(),
      });
      // switch to viewer so admin can send SMS
      onSubmitted(presentNames.length, absentStudents.length);
    } catch(e){ Alert.alert('त्रुटि',e.message); }
    setSaving(false);
  };

  const submit=()=>{
    const unmarked=students.filter(s=>!status[s.name]);
    if(unmarked.length>0){
      Alert.alert('अधूरी उपस्थिति',`${unmarked.length} छात्रों की उपस्थिति बाकी:\n${unmarked.slice(0,5).map(s=>s.name).join(', ')}${unmarked.length>5?'...':''}`,
        [{text:'वापस',style:'cancel'},{text:'फिर भी जमा करें',onPress:doSubmit}]);
      return;
    }
    doSubmit();
  };

  if(loading) return <View style={s.center}><ActivityIndicator size="large" color={accent}/></View>;

  return (
    <View style={{flex:1}}>
      <View style={[s.summaryBar,{backgroundColor:accent}]}>
        <View style={s.summaryItem}><Text style={s.summaryNum}>{students.length}</Text><Text style={s.summaryLbl}>कुल</Text></View>
        <View style={s.summaryItem}><Text style={s.summaryNum}>{present}</Text><Text style={s.summaryLbl}>उपस्थित</Text></View>
        <View style={s.summaryItem}><Text style={s.summaryNum}>{absent}</Text><Text style={s.summaryLbl}>अनुपस्थित</Text></View>
        <View style={s.summaryItem}><Text style={s.summaryNum}>{students.length-present-absent}</Text><Text style={s.summaryLbl}>शेष</Text></View>
      </View>
      <ScrollView contentContainerStyle={{padding:16,paddingBottom:100}}>
        <View style={[s.adminRow,{marginBottom:14}]}>
          <TouchableOpacity style={[s.adminSmBtn,{backgroundColor:'#6B7280'}]} onPress={()=>{ const all={}; students.forEach(s=>{all[s.name]='P';}); setStatus(all); }}>
            <Ionicons name="checkmark-done" size={16} color="#fff"/>
            <Text style={s.adminSmTxt}>सभी उपस्थित</Text>
          </TouchableOpacity>
        </View>
        {students.map((stu,i)=>(
          <View key={i} style={s.studentRow}>
            <Text style={s.studentNum}>{i+1}</Text>
            <Text style={s.studentName}>{stu.name}</Text>
            <TouchableOpacity style={[s.attBtn,status[stu.name]==='P'?s.btnPresent:s.btnPresentOff]} onPress={()=>toggle(stu.name,'P')}>
              <Text style={[s.attBtnTxt,status[stu.name]==='P'&&{color:'#fff'}]}>P</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.attBtn,status[stu.name]==='A'?s.btnAbsent:s.btnAbsentOff]} onPress={()=>toggle(stu.name,'A')}>
              <Text style={[s.attBtnTxt,status[stu.name]==='A'&&{color:'#fff'}]}>A</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <View style={s.submitWrap}>
        <TouchableOpacity style={[s.submitBtn,{backgroundColor:accent}]} onPress={submit} activeOpacity={0.85}>
          {saving?<ActivityIndicator color="#fff"/>:<>
            <Ionicons name="checkmark-circle" size={22} color="#fff"/>
            <Text style={s.submitTxt}>उपस्थिति जमा करें</Text>
          </>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── ATTENDANCE VIEWER ────────────────────────────────────────────────────────
// isAdmin prop controls whether SMS button is shown
function AttendanceViewer({ classN, date, accent, isAdmin }) {
  const [data,setData]=useState(null); const [loading,setLoading]=useState(true);

  useEffect(()=>{
    setLoading(true);
    getDoc(doc(db,'attendance',attDocId(classN,date)))
      .then(snap=>{setData(snap.exists()?snap.data():null);setLoading(false);})
      .catch(()=>setLoading(false));
  },[classN,date]);

  const sendSMS=async(name,phone)=>{
    const msg=absenceMsg(name,date);
    const url=`sms:${phone}?body=${encodeURIComponent(msg)}`;
    try{ await Linking.openURL(url); }
    catch(e){ Alert.alert('त्रुटि','SMS नहीं भेजा जा सका।'); }
  };

  if(loading) return <View style={s.center}><ActivityIndicator size="large" color={accent}/></View>;
  if(!data)   return (
    <View style={s.center}>
      <Ionicons name="document-text-outline" size={52} color={COLORS.inkLight}/>
      <Text style={s.emptyTxt}>इस तिथि की उपस्थिति उपलब्ध नहीं है।</Text>
    </View>
  );

  const absentWithPhone=data.absentWithPhone||[];

  return (
    <ScrollView contentContainerStyle={{padding:16,paddingBottom:40}}>
      <View style={[s.summaryBar,{backgroundColor:accent,borderRadius:14,marginBottom:16}]}>
        <View style={s.summaryItem}><Text style={s.summaryNum}>{data.total||0}</Text><Text style={s.summaryLbl}>कुल</Text></View>
        <View style={s.summaryItem}><Text style={s.summaryNum}>{data.present?.length||0}</Text><Text style={s.summaryLbl}>उपस्थित</Text></View>
        <View style={s.summaryItem}><Text style={s.summaryNum}>{data.absent?.length||0}</Text><Text style={s.summaryLbl}>अनुपस्थित</Text></View>
      </View>

      {/* Absent first */}
      {(data.absent||[]).length>0&&(
        <View style={[s.listSection,{marginBottom:16}]}>
          <View style={s.listHead}><View style={[s.listDot,{backgroundColor:'#DC2626'}]}/><Text style={s.listHeadTxt}>अनुपस्थित छात्र ({data.absent.length})</Text></View>
          {data.absent.map((name,i)=>{
            const wp=absentWithPhone.find(s=>s.name===name);
            return (
              <View key={i} style={s.viewRow}>
                <Text style={s.viewNum}>{i+1}</Text>
                <Text style={s.viewName}>{name}</Text>
                {/* SMS button: only admin + only if phone available */}
                {isAdmin && wp ? (
                  <TouchableOpacity style={s.smsBtn} onPress={()=>sendSMS(name,wp.phone)} activeOpacity={0.8}>
                    <Ionicons name="chatbubble-ellipses" size={14} color="#fff"/>
                    <Text style={s.smsBtnTxt}>SMS</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={s.badgeAbsent}><Text style={s.badgeTxt}>अनुपस्थित</Text></View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Present */}
      <View style={s.listSection}>
        <View style={s.listHead}><View style={[s.listDot,{backgroundColor:'#16A34A'}]}/><Text style={s.listHeadTxt}>उपस्थित छात्र ({data.present?.length||0})</Text></View>
        {(data.present||[]).map((name,i)=>(
          <View key={i} style={s.viewRow}>
            <Text style={s.viewNum}>{i+1}</Text>
            <Text style={s.viewName}>{name}</Text>
            <View style={s.badgePresent}><Text style={s.badgeTxt}>उपस्थित</Text></View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── CLASS SCREEN ─────────────────────────────────────────────────────────────
function ClassScreen({ cls, roster, onBack }) {
  const { isAdmin }=useAuth();
  const [date,setDate]=useState(todayISO());
  const [pickerOpen,setPickerOpen]=useState(false);
  const [loadingLatest,setLoadingLatest]=useState(!isAdmin);
  // after admin submits, switch to viewer (so they can send SMS)
  const [viewMode,setViewMode]=useState(false);

  useEffect(()=>{
    if(isAdmin){ setViewMode(false); return; }
    setLoadingLatest(true);
    getDocs(collection(db,'attendance')).then(snap=>{
      const prefix=`class${cls.n}_`;
      const ids=snap.docs.map(d=>d.id).filter(id=>id.startsWith(prefix)).map(id=>id.replace(prefix,''));
      if(ids.length>0) setDate(ids.sort((a,b)=>b.localeCompare(a))[0]);
      setLoadingLatest(false);
    }).catch(()=>setLoadingLatest(false));
  },[cls.n,isAdmin]);

  const handleDateChange=(d)=>{ setDate(d); setPickerOpen(false); setViewMode(false); };

  const handleSubmitted=(presentCount, absentCount)=>{
    setViewMode(true);
    Alert.alert(
      '✅ उपस्थिति जमा हुई',
      `उपस्थित: ${presentCount}  |  अनुपस्थित: ${absentCount}\n\nअब आप अनुपस्थित छात्रों को SMS भेज सकते हैं।`,
      [{text:'ठीक है'}]
    );
  };

  if(loadingLatest) return <View style={s.center}><ActivityIndicator size="large" color={cls.color}/></View>;

  return (
    <View style={{flex:1}}>
      <View style={[s.dateBar,{backgroundColor:cls.color}]}>
        <TouchableOpacity activeOpacity={isAdmin?0.7:1} onPress={isAdmin?()=>setPickerOpen(true):undefined} style={s.dateBarInner}>
          <View style={s.dateIcon}><Ionicons name="calendar" size={20} color="#FED7AA"/></View>
          <View style={{flex:1}}>
            <Text style={s.dateLabel}>{isAdmin?'तिथि चुनें (टैप करें)':'दिनांक'}</Text>
            <Text style={s.dateValue}>{fmtDate(date)}</Text>
          </View>
          {isAdmin&&<Ionicons name="chevron-down" size={18} color="#FED7AA"/>}
        </TouchableOpacity>
        {/* toggle taker/viewer for admin */}
        {isAdmin&&(
          <TouchableOpacity onPress={()=>setViewMode(v=>!v)} style={s.toggleBtn}>
            <Ionicons name={viewMode?'create-outline':'eye-outline'} size={18} color="#FED7AA"/>
            <Text style={s.toggleTxt}>{viewMode?'उपस्थिति लें':'देखें'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* admin sees taker or viewer; student always sees viewer */}
      {isAdmin && !viewMode
        ? <AttendanceTaker classN={cls.n} date={date} roster={roster} accent={cls.color} onSubmitted={handleSubmitted}/>
        : <AttendanceViewer classN={cls.n} date={date} accent={cls.color} isAdmin={isAdmin}/>
      }

      <DatePickerModal visible={pickerOpen} initial={date} onPick={handleDateChange} onClose={()=>setPickerOpen(false)}/>
    </View>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function AttendanceScreen({ navigation }) {
  const insets=useSafeAreaInsets();
  const { isAdmin }=useAuth();
  const [view,setView]=useState(null);
  const [roster,setRoster]=useState([]);
  const [rosterLoading,setRosterLoading]=useState(true);

  useEffect(()=>{
    getDoc(doc(db,'attendance',MASTER_DOC))
      .then(snap=>{ setRoster(snap.exists()?snap.data().students:DEFAULT_ROSTER); setRosterLoading(false); })
      .catch(()=>{ setRoster(DEFAULT_ROSTER); setRosterLoading(false); });
  },[]);

  const cls=view?.type==='class'?CLASSES[view.idx]:null;
  let headerHi='उपस्थिति', headerEng='Attendance';
  if(cls){ headerHi=cls.hi; headerEng=cls.eng; }
  else if(view==='roster'){ headerHi='सभी विद्यार्थी'; headerEng='All Students'; }

  const goBack=()=>{ if(view!==null){setView(null);return;} navigation.goBack(); };
  const classCount=(n)=>roster.filter(s=>s.class===n).length;

  return (
    <View style={[s.root,{paddingTop:insets.top}]}>
      <LinearGradient colors={['#060F24','#0F2347','#1A3A6B']} style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={goBack} hitSlop={{top:10,bottom:10,left:10,right:10}}>
          <Ionicons name="arrow-back" size={22} color="#fff"/>
        </TouchableOpacity>
        <View style={s.headerTitle}><Text style={s.headerHindi}>{headerHi}</Text><Text style={s.headerEng}>{headerEng}</Text></View>
        <View style={{width:38}}/>
      </LinearGradient>
      <View style={s.tricolor}>
        <View style={[s.stripe,{backgroundColor:'#FF9933'}]}/>
        <View style={[s.stripe,{backgroundColor:'#fff'}]}/>
        <View style={[s.stripe,{backgroundColor:'#138808'}]}/>
      </View>

      {view===null&&(
        rosterLoading ? <View style={s.center}><ActivityIndicator size="large" color={COLORS.saffron}/></View> : (
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
              <TouchableOpacity key={c.n} activeOpacity={0.85} onPress={()=>setView({type:'class',idx:i})} style={s.classCard}>
                <View style={[s.classNum,{backgroundColor:c.color}]}><Text style={s.classNumTxt}>{c.n}</Text></View>
                <View style={{flex:1}}>
                  <Text style={s.classCardTitle}>{c.hi}</Text>
                  <Text style={s.classCardSub}>{c.eng} · {classCount(c.n)} छात्र</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.inkLight}/>
              </TouchableOpacity>
            ))}
            {isAdmin&&(
              <TouchableOpacity activeOpacity={0.85} onPress={()=>setView('roster')} style={[s.classCard,{marginTop:8,borderWidth:1.5,borderColor:COLORS.gold,borderStyle:'dashed'}]}>
                <View style={[s.classNum,{backgroundColor:COLORS.navyPrimary}]}>
                  <Ionicons name="people-circle" size={26} color={COLORS.gold}/>
                </View>
                <View style={{flex:1}}>
                  <Text style={s.classCardTitle}>सभी विद्यार्थी</Text>
                  <Text style={s.classCardSub}>Master Roster · {roster.length} छात्र</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.inkLight}/>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      ))}

      {view?.type==='class'&&cls&&(
        <ClassScreen cls={cls} roster={roster} onBack={()=>setView(null)}/>
      )}
      {view==='roster'&&(
        <MasterRosterScreen roster={roster} onRosterChange={next=>setRoster(next)}/>
      )}
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:           { flex:1, backgroundColor:'#FBF3E4' },
  header:         { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:14 },
  backBtn:        { width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,255,255,0.12)', borderWidth:1, borderColor:'rgba(255,255,255,0.18)', alignItems:'center', justifyContent:'center' },
  headerTitle:    { alignItems:'center', flex:1, paddingHorizontal:6 },
  headerHindi:    { color:'#fff', fontSize:18, fontFamily:'NotoSansDevanagari_700Bold' },
  headerEng:      { color:'#FED7AA', fontSize:10, marginTop:1 },
  tricolor:       { flexDirection:'row', height:4 },
  stripe:         { flex:1 },
  section:        { paddingHorizontal:16, paddingTop:16 },
  hero:           { borderRadius:18, padding:22, alignItems:'center', elevation:4, shadowColor:'#000', shadowOpacity:0.2, shadowRadius:8 },
  heroIcon:       { width:56, height:56, borderRadius:28, backgroundColor:'rgba(201,168,76,0.15)', borderWidth:1.5, borderColor:COLORS.gold, alignItems:'center', justifyContent:'center', marginBottom:12 },
  heroTitle:      { color:'#fff', fontSize:20, fontFamily:'NotoSansDevanagari_700Bold', textAlign:'center' },
  heroSub:        { color:'#C9DCF0', fontSize:12, marginTop:5, textAlign:'center', fontFamily:'NotoSansDevanagari_400Regular' },
  secHead:        { flexDirection:'row', alignItems:'center', marginBottom:4 },
  secBar:         { width:4, height:22, borderRadius:2, marginRight:10, backgroundColor:COLORS.saffron },
  secTitle:       { fontSize:18, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyPrimary },
  secTitleEng:    { fontSize:11, color:COLORS.inkLight, marginLeft:14, marginBottom:14, letterSpacing:0.4 },
  classCard:      { flexDirection:'row', alignItems:'center', gap:14, backgroundColor:'#fff', borderRadius:14, padding:14, marginBottom:10, elevation:2, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:6 },
  classNum:       { width:48, height:48, borderRadius:14, alignItems:'center', justifyContent:'center' },
  classNumTxt:    { color:'#fff', fontSize:22, fontFamily:'NotoSansDevanagari_700Bold' },
  classCardTitle: { fontSize:17, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },
  classCardSub:   { fontSize:12, color:COLORS.inkLight, marginTop:2, fontFamily:'NotoSansDevanagari_400Regular' },
  center:         { flex:1, alignItems:'center', justifyContent:'center', gap:12, padding:24 },
  emptyTxt:       { color:COLORS.inkLight, fontSize:14, fontFamily:'NotoSansDevanagari_400Regular', textAlign:'center', marginTop:8 },
  dateBar:        { paddingHorizontal:16, paddingTop:12, paddingBottom:10, backgroundColor:'transparent' },
  dateBarInner:   { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:'rgba(255,255,255,0.15)', borderRadius:14, padding:12 },
  dateIcon:       { width:40, height:40, borderRadius:10, backgroundColor:'rgba(255,255,255,0.15)', alignItems:'center', justifyContent:'center' },
  dateLabel:      { color:'rgba(255,255,255,0.75)', fontSize:11, fontFamily:'NotoSansDevanagari_400Regular' },
  dateValue:      { color:'#fff', fontSize:15, fontFamily:'NotoSansDevanagari_700Bold', marginTop:2 },
  toggleBtn:      { flexDirection:'row', alignItems:'center', gap:6, marginTop:8, alignSelf:'flex-end', backgroundColor:'rgba(255,255,255,0.15)', paddingHorizontal:12, paddingVertical:7, borderRadius:10 },
  toggleTxt:      { color:'#FED7AA', fontSize:12, fontFamily:'NotoSansDevanagari_700Bold' },
  summaryBar:     { flexDirection:'row', justifyContent:'space-around', paddingVertical:14, paddingHorizontal:8 },
  summaryItem:    { alignItems:'center' },
  summaryNum:     { color:'#fff', fontSize:22, fontFamily:'NotoSansDevanagari_700Bold' },
  summaryLbl:     { color:'rgba(255,255,255,0.8)', fontSize:11, fontFamily:'NotoSansDevanagari_400Regular', marginTop:2 },
  adminRow:       { flexDirection:'row', gap:10 },
  adminSmBtn:     { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:6, paddingVertical:11, borderRadius:12 },
  adminSmTxt:     { color:'#fff', fontSize:13, fontFamily:'NotoSansDevanagari_700Bold' },
  studentRow:     { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'#fff', borderRadius:12, paddingHorizontal:12, paddingVertical:11, marginBottom:8, elevation:1, shadowColor:'#000', shadowOpacity:0.04, shadowRadius:4 },
  studentNum:     { width:22, color:COLORS.inkLight, fontSize:13, fontWeight:'700', textAlign:'center' },
  studentName:    { flex:1, fontSize:16, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },
  attBtn:         { width:40, height:36, borderRadius:8, alignItems:'center', justifyContent:'center', borderWidth:2 },
  attBtnTxt:      { fontSize:14, fontWeight:'900', color:COLORS.inkLight },
  btnPresent:     { backgroundColor:'#16A34A', borderColor:'#16A34A' },
  btnPresentOff:  { backgroundColor:'#F0FDF4', borderColor:'#86EFAC' },
  btnAbsent:      { backgroundColor:'#DC2626', borderColor:'#DC2626' },
  btnAbsentOff:   { backgroundColor:'#FEF2F2', borderColor:'#FCA5A5' },
  submitWrap:     { position:'absolute', bottom:0, left:0, right:0, padding:16, backgroundColor:'rgba(251,243,228,0.95)' },
  submitBtn:      { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, paddingVertical:16, borderRadius:16, elevation:4, shadowColor:'#000', shadowOpacity:0.15, shadowRadius:8 },
  submitTxt:      { color:'#fff', fontSize:16, fontFamily:'NotoSansDevanagari_700Bold' },
  listSection:    { backgroundColor:'#fff', borderRadius:14, padding:14, elevation:2, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:6 },
  listHead:       { flexDirection:'row', alignItems:'center', gap:8, marginBottom:12 },
  listDot:        { width:10, height:10, borderRadius:5 },
  listHeadTxt:    { fontSize:15, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },
  viewRow:        { flexDirection:'row', alignItems:'center', gap:10, paddingVertical:9, borderBottomWidth:1, borderBottomColor:'#F5F5F4' },
  viewNum:        { width:24, color:COLORS.inkLight, fontSize:13, fontWeight:'700', textAlign:'center' },
  viewName:       { flex:1, fontSize:16, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.ink },
  badgePresent:   { backgroundColor:'#DCFCE7', paddingHorizontal:10, paddingVertical:4, borderRadius:8 },
  badgeAbsent:    { backgroundColor:'#FEE2E2', paddingHorizontal:10, paddingVertical:4, borderRadius:8 },
  badgeTxt:       { fontSize:11, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },
  smsBtn:         { flexDirection:'row', alignItems:'center', gap:4, backgroundColor:'#DC2626', paddingHorizontal:10, paddingVertical:6, borderRadius:8 },
  smsBtnTxt:      { color:'#fff', fontSize:12, fontFamily:'NotoSansDevanagari_700Bold' },
  rosterClassHead:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:14, paddingVertical:10, borderRadius:10, marginBottom:6 },
  rosterClassTitle:{ color:'#fff', fontSize:15, fontFamily:'NotoSansDevanagari_700Bold' },
  rosterClassCount:{ color:'rgba(255,255,255,0.8)', fontSize:12 },
  rosterRow:      { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'#fff', borderRadius:10, paddingHorizontal:12, paddingVertical:10, marginBottom:6, elevation:1, shadowColor:'#000', shadowOpacity:0.04, shadowRadius:4 },
  rosterNum:      { width:22, color:COLORS.inkLight, fontSize:13, fontWeight:'700', textAlign:'center' },
  rosterName:     { fontSize:15, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },
  rosterPhone:    { fontSize:12, color:'#16A34A', marginTop:2, fontFamily:'NotoSansDevanagari_400Regular' },
  rosterNoPhone:  { fontSize:11, color:COLORS.inkLight, marginTop:2, fontStyle:'italic' },
  phoneBtn:       { flexDirection:'row', alignItems:'center', gap:4, paddingHorizontal:10, paddingVertical:6, borderRadius:8 },
  phoneBtnTxt:    { fontSize:12, fontFamily:'NotoSansDevanagari_700Bold' },
  savingOverlay:  { ...StyleSheet.absoluteFillObject, backgroundColor:'rgba(0,0,0,0.45)', alignItems:'center', justifyContent:'center' },
  modalBackdrop:  { flex:1, backgroundColor:'rgba(0,0,0,0.55)', justifyContent:'flex-end' },
  modalCard:      { backgroundColor:'#fff', borderTopLeftRadius:22, borderTopRightRadius:22, padding:20, paddingBottom:28 },
  modalTitle:     { fontSize:18, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyPrimary, marginBottom:8 },
  modalSub:       { fontSize:12, color:COLORS.inkSoft, fontFamily:'NotoSansDevanagari_400Regular', marginTop:14, marginBottom:6 },
  chipRow:        { flexDirection:'row', gap:8, flexWrap:'wrap' },
  chip:           { paddingHorizontal:14, paddingVertical:9, borderRadius:18, backgroundColor:'#F5F5F4', borderWidth:1, borderColor:COLORS.border },
  chipActive:     { backgroundColor:COLORS.navyPrimary, borderColor:COLORS.navyPrimary },
  chipTxt:        { color:COLORS.ink, fontSize:13, fontFamily:'NotoSansDevanagari_400Regular' },
  chipActiveTxt:  { color:'#fff', fontWeight:'700' },
  modalActions:   { flexDirection:'row', gap:10, marginTop:22 },
  modalBtn:       { flex:1, paddingVertical:14, borderRadius:12, alignItems:'center' },
  modalBtnTxt:    { color:'#fff', fontSize:15, fontFamily:'NotoSansDevanagari_700Bold' },
  nameInput:      { borderWidth:1.5, borderColor:COLORS.border, borderRadius:12, padding:14, fontSize:15, fontFamily:'NotoSansDevanagari_400Regular', color:COLORS.ink, backgroundColor:COLORS.paper },
});