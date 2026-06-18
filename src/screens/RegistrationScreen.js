import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Alert, ActivityIndicator, Switch, Platform, Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLORS } from '../theme/colors';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as ImagePicker from 'expo-image-picker';

const genId = () => 'REG-' + Date.now().toString().slice(-10);
const today = () => new Date().toLocaleDateString('hi-IN');

const HINDI_MONTHS = ['जनवरी','फरवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितंबर','अक्टूबर','नवंबर','दिसंबर'];
const HN = ['शून्य','एक','दो','तीन','चार','पाँच','छह','सात','आठ','नौ','दस','ग्यारह','बारह','तेरह','चौदह','पन्द्रह','सोलह','सत्रह','अठारह','उन्नीस','बीस','इक्कीस','बाईस','तेईस','चौबीस','पच्चीस','छब्बीस','सत्ताईस','अट्ठाईस','उनतीस','तीस','इकतीस'];
function dobWords(dob) {
  if (!dob) return '';
  const parts = dob.split('-').map(Number);
  if (parts.length !== 3) return dob;
  const [y,m,d] = parts;
  return `${HN[d]||d} ${HINDI_MONTHS[m-1]||m} ${y}`;
}

const BLANK = {
  session:'2026-2027', block:'गोविंदपुर', district:'मथुरा', state:'उत्तर प्रदेश',
  app_no:'', app_date:'', enrollment_no:'', school_name:'प्राथमिक विद्यालय गोविंदपुर', udise:'09XXXXXXXXX',
  student_name_hi:'', student_name_en:'', applied_class:'', pen:'', apaar:'', unique_id:'', aadhaar:'', aadhaar_enrol:'',
  prev_school:'', prev_udise:'', prev_class:'', prev_enrol:'', prev_attendance:'', prev_percent:'',
  dob:'', gender:'', height:'', weight:'', blood:'', residence_area:'', divyang:'नहीं', divyang_type:'',
  religion:'', caste:'', sub_caste:'', mother_tongue:'हिन्दी', ews:'नहीं', ration:'', residence_duration:'',
  father_name_hi:'', father_name_en:'', father_occ:'', father_edu:'', father_aadhaar:'', father_bank_name:'', father_acc:'', father_ifsc:'', father_bank:'', father_mobile:'',
  mother_name_hi:'', mother_name_en:'', mother_occ:'', mother_edu:'', mother_aadhaar:'', mother_bank_name:'', mother_acc:'', mother_ifsc:'', mother_bank:'', mother_mobile:'',
  perm_mohalla:'', perm_village:'', perm_post:'', perm_district:'', perm_state:'उत्तर प्रदेश', perm_pin:'', perm_email:'',
  curr_mohalla:'', curr_village:'', curr_post:'', curr_district:'', curr_state:'', curr_pin:'', curr_mobile1:'', curr_mobile2:'', curr_email:'',
  guardian_name:'', guardian_rel:'', guardian_mobile:'',
  doc_birth:false, doc_student_aadhaar:false, doc_student_passbook:false,
  doc_father_aadhaar:false, doc_father_passbook:false, doc_mother_aadhaar:false, doc_mother_passbook:false,
  declared:false,
  _photo:null,
};

function buildPdfHtml(f, regId) {
  const v = (key) => f[key] || '';
  const chk = (key) => f[key] ? 'हाँ ✓' : 'नहीं';
  return `<!DOCTYPE html><html lang="hi"><head><meta charset="UTF-8">
<style>
@page{size:A4;margin:0}
html,body{margin:0;padding:0}
body{font-family:sans-serif;font-size:10px;color:#000;padding:14px 22px;line-height:1.5;width:794px;box-sizing:border-box}
.header{text-align:center;border-bottom:2px solid #9A3412;padding-bottom:5px;margin-bottom:5px}
.header h1{font-size:13px;color:#9A3412;margin:1px 0}
.header p{font-size:10px;color:#444;margin:2px 0}
.school-bar{text-align:center;font-size:12px;font-weight:700;color:#9A3412;border:1.5px solid #9A3412;padding:4px;margin:4px 0;background:#FFFBEB}
.line{margin:3px 0;font-size:9.5px}
.val{display:inline-block;min-width:60px;border-bottom:1px dotted #000;padding:0 3px;font-weight:600}
.val-lg{min-width:120px}.val-xl{min-width:180px}
.sec{font-weight:700;color:#15803D;font-size:10px;margin:5px 0 2px;border-bottom:1px solid #ccc}
.docs-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:2px 10px;font-size:10px}
.declaration{border:1.5px solid #9A3412;padding:6px;background:#FFFBEB;font-size:9px;margin:5px 0}
.sigs{display:flex;justify-content:space-between;margin-top:10px;font-size:10px;font-weight:700;color:#1E3A8A}
.footer{text-align:center;font-size:8px;color:#888;border-top:1px solid #eee;margin-top:6px;padding-top:4px}
.tricolor{height:4px;display:flex;margin-bottom:6px}
.t1{flex:1;background:#FF9933}.t2{flex:1;background:#fff}.t3{flex:1;background:#138808}
.photo-box{float:right;width:84px;height:104px;border:1.5px solid #9A3412;margin:0 0 4px 10px;overflow:hidden}.photo-box img{width:100%;height:100%;object-fit:cover}.photo-ph{display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:#999;font-size:9px}</style></head><body>
<div class="tricolor"><div class="t1"></div><div class="t2"></div><div class="t3"></div></div>
<div class="header"><h1>विद्यालय में प्रवेश हेतु आवेदन पत्र — शैक्षिक सत्र: ${v('session')}</h1><p>प्राथमिक विद्यालय गोविंदपुर · उत्तर प्रदेश बेसिक शिक्षा परिषद</p></div>
${f._photo ? `<div class="photo-box"><img src="${f._photo}"></div>` : '<div class="photo-box"><div class="photo-ph">फोटो</div></div>'}
<div class="school-bar">विद्यालय का नाम:- ${v('school_name')}</div>
<div class="line">विकास क्षेत्र:- <span class="val">${v('block')}</span> &nbsp; जनपद:- <span class="val">${v('district')}</span> &nbsp; प्रदेश:- <span class="val">${v('state')}</span> &nbsp; UDISE: <span class="val">${v('udise')}</span></div>
<div class="line">आवेदन संख्या:- <span class="val">${v('app_no')}</span> &nbsp; दिनाँक:- <span class="val">${v('app_date')}</span> &nbsp; नामांकन संख्या:- <span class="val">${v('enrollment_no')}</span></div>
<div class="sec">★ छात्र/छात्रा का विवरण</div>
<div class="line">नाम (हिन्दी):- <span class="val val-xl">${v('student_name_hi')}</span> &nbsp; नाम (English):- <span class="val val-xl">${v('student_name_en')}</span></div>
<div class="line">आवेदित कक्षा:- <span class="val">${v('applied_class')}</span> &nbsp; PEN: <span class="val">${v('pen')}</span> &nbsp; APAAR: <span class="val">${v('apaar')}</span> &nbsp; UNIQUE ID: <span class="val">${v('unique_id')}</span></div>
<div class="line">आधार संख्या:- <span class="val">${v('aadhaar')}</span> &nbsp; आधार पंजीकरण संख्या:- <span class="val val-lg">${v('aadhaar_enrol')}</span></div>
<div class="sec">★ पूर्व विद्यालय विवरण</div>
<div class="line">पूर्व विद्यालय:- <span class="val val-xl">${v('prev_school')}</span> &nbsp; UDISE: <span class="val">${v('prev_udise')}</span> &nbsp; पूर्व कक्षा: <span class="val">${v('prev_class')}</span> &nbsp; नामांकन: <span class="val">${v('prev_enrol')}</span></div>
<div class="sec">★ व्यक्तिगत विवरण</div>
<div class="line">जन्मतिथि:- <span class="val">${v('dob')}</span> &nbsp; (शब्दों में): <span class="val val-lg">${dobWords(f.dob)}</span> &nbsp; लिंग:- <span class="val">${v('gender')}</span></div>
<div class="line">ऊँचाई: <span class="val">${v('height')}</span> cm &nbsp; वज़न: <span class="val">${v('weight')}</span> kg &nbsp; रक्त वर्ग: <span class="val">${v('blood')}</span> &nbsp; निवास: <span class="val">${v('residence_area')}</span> &nbsp; दिव्यांग: <span class="val">${v('divyang')}</span> ${v('divyang_type') ? '('+v('divyang_type')+')' : ''}</div>
<div class="line">धर्म: <span class="val">${v('religion')}</span> &nbsp; जाति: <span class="val">${v('caste')}</span> &nbsp; उपजाति: <span class="val">${v('sub_caste')}</span> &nbsp; मातृभाषा: <span class="val">${v('mother_tongue')}</span> &nbsp; EWS: <span class="val">${v('ews')}</span> &nbsp; राशन: <span class="val">${v('ration')}</span></div>
<div class="sec">★ पिता का विवरण</div>
<div class="line">नाम (हिन्दी):- <span class="val val-xl">${v('father_name_hi')}</span> &nbsp; नाम (English):- <span class="val val-xl">${v('father_name_en')}</span></div>
<div class="line">व्यवसाय: <span class="val">${v('father_occ')}</span> &nbsp; शिक्षा: <span class="val">${v('father_edu')}</span> &nbsp; आधार: <span class="val val-lg">${v('father_aadhaar')}</span> &nbsp; मोबाइल: <span class="val">${v('father_mobile')}</span></div>
<div class="line">बैंक नाम: <span class="val val-xl">${v('father_bank_name')}</span> &nbsp; खाता: <span class="val val-lg">${v('father_acc')}</span> &nbsp; IFSC: <span class="val">${v('father_ifsc')}</span> &nbsp; बैंक: <span class="val">${v('father_bank')}</span></div>
<div class="sec">★ माता का विवरण</div>
<div class="line">नाम (हिन्दी):- <span class="val val-xl">${v('mother_name_hi')}</span> &nbsp; नाम (English):- <span class="val val-xl">${v('mother_name_en')}</span></div>
<div class="line">व्यवसाय: <span class="val">${v('mother_occ')}</span> &nbsp; शिक्षा: <span class="val">${v('mother_edu')}</span> &nbsp; आधार: <span class="val val-lg">${v('mother_aadhaar')}</span> &nbsp; मोबाइल: <span class="val">${v('mother_mobile')}</span></div>
<div class="line">बैंक नाम: <span class="val val-xl">${v('mother_bank_name')}</span> &nbsp; खाता: <span class="val val-lg">${v('mother_acc')}</span> &nbsp; IFSC: <span class="val">${v('mother_ifsc')}</span> &nbsp; बैंक: <span class="val">${v('mother_bank')}</span></div>
<div class="sec">★ स्थायी पता</div>
<div class="line">मोहल्ला: <span class="val">${v('perm_mohalla')}</span> &nbsp; ग्राम: <span class="val">${v('perm_village')}</span> &nbsp; डाकखाना: <span class="val">${v('perm_post')}</span> &nbsp; जनपद: <span class="val">${v('perm_district')}</span> &nbsp; प्रदेश: <span class="val">${v('perm_state')}</span> &nbsp; PIN: <span class="val">${v('perm_pin')}</span> &nbsp; ईमेल: <span class="val val-lg">${v('perm_email')}</span></div>
<div class="sec">★ वर्तमान पता</div>
<div class="line">मोहल्ला: <span class="val">${v('curr_mohalla')}</span> &nbsp; ग्राम: <span class="val">${v('curr_village')}</span> &nbsp; डाकखाना: <span class="val">${v('curr_post')}</span> &nbsp; जनपद: <span class="val">${v('curr_district')}</span> &nbsp; प्रदेश: <span class="val">${v('curr_state')}</span> &nbsp; PIN: <span class="val">${v('curr_pin')}</span></div>
<div class="line">मोबाइल 1: <span class="val">${v('curr_mobile1')}</span> &nbsp; मोबाइल 2: <span class="val">${v('curr_mobile2')}</span> &nbsp; ईमेल: <span class="val val-lg">${v('curr_email')}</span></div>
<div class="sec">★ अभिभावक विवरण</div>
<div class="line">नाम: <span class="val val-xl">${v('guardian_name')}</span> &nbsp; सम्बन्ध: <span class="val">${v('guardian_rel')}</span> &nbsp; मोबाइल: <span class="val">${v('guardian_mobile')}</span></div>
<div class="sec">★ संलग्न दस्तावेज</div>
<div class="docs-grid">
  <div>• जन्म प्रमाण-पत्र: <strong>${chk('doc_birth')}</strong></div>
  <div>• छात्र का आधार: <strong>${chk('doc_student_aadhaar')}</strong></div>
  <div>• छात्र की पासबुक: <strong>${chk('doc_student_passbook')}</strong></div>
  <div>• पिता का आधार: <strong>${chk('doc_father_aadhaar')}</strong></div>
  <div>• पिता की पासबुक: <strong>${chk('doc_father_passbook')}</strong></div>
  <div>• माता का आधार: <strong>${chk('doc_mother_aadhaar')}</strong></div>
  <div>• माता की पासबुक: <strong>${chk('doc_mother_passbook')}</strong></div>
</div>
<div class="declaration"><strong>अभिभावक की घोषणा:-</strong><br>मेरे द्वारा दी गयी सभी सूचनाएँ सत्य हैं। कोई भी तथ्य छिपाया नहीं गया है।<div style="text-align:right;margin-top:6px;font-weight:700">हस्ताक्षर/निशानी अँगूठा :- ..................................</div></div>
<div class="sigs"><div>हस्ताक्षर कक्षा अध्यापक:- .......................<br><small>दिनाँक: ............................</small></div><div style="text-align:right">हस्ताक्षर प्र०अ० :- .......................<br><small>(मोहर सहित)</small></div></div>
<div class="footer">पंजीकरण क्रमांक: ${regId} · दर्ज दिनांक: ${today()}</div>
</body></html>`;
}

function Field({ label, value, onChangeText, placeholder, keyboardType, maxLength, editable=true, multiline=false }) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <TextInput style={[s.input, !editable && s.inputDisabled, multiline && { height: 72, textAlignVertical:'top' }]} value={value} onChangeText={onChangeText} placeholder={placeholder||''} placeholderTextColor={COLORS.inkLight} keyboardType={keyboardType||'default'} maxLength={maxLength} editable={editable} multiline={multiline} spellCheck={false} autoCorrect={false} />
    </View>
  );
}
function Row({ children }) { return <View style={s.row}>{children}</View>; }
function SecHead({ num, title }) {
  return (
    <View style={s.secHead}>
      <View style={s.secNum}><Text style={s.secNumTxt}>{num}</Text></View>
      <Text style={s.secTitle}>{title}</Text>
    </View>
  );
}
function CheckRow({ label, value, onValueChange }) {
  return (
    <View style={s.checkRow}>
      <Switch value={value} onValueChange={onValueChange} trackColor={{false:'#D6D3D1',true:COLORS.green}} thumbColor={value?'#fff':COLORS.inkLight} style={{transform:[{scale:0.85}]}} />
      <Text style={s.checkLabel}>{label}</Text>
    </View>
  );
}
function PickerRow({ label, value, options, onChange }) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{flexDirection:'row',gap:6,paddingVertical:4}}>
          {options.map(opt => (
            <TouchableOpacity key={opt} onPress={()=>onChange(opt)} style={[s.chip, value===opt && s.chipActive]}>
              <Text style={[s.chipTxt, value===opt && s.chipActiveTxt]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default function RegistrationScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [form, setForm]       = useState({ ...BLANK, app_no: genId(), app_date: today() });
  const [view, setView]       = useState('form');
  const [saving, setSaving]   = useState(false);
  const [regId, setRegId]     = useState('');
  const [pdfHtml, setPdfHtml] = useState('');
  const scrollRef             = useRef(null);
  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('अनुमति चाहिए', 'फोटो एक्सेस की अनुमति दें।'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [3,4], quality: 0.6, base64: true });
    if (result.canceled) return;
    const a = result.assets[0];
    setForm(f => ({ ...f, _photo: `data:image/jpeg;base64,${a.base64}` }));
  };
  const removePhoto = () => setForm(f => ({ ...f, _photo: null }));

  const submit = async () => {
    if (!form.student_name_hi.trim()) { Alert.alert('अनिवार्य', 'छात्र/छात्रा का नाम (हिन्दी में) भरें।'); return; }
    if (!form.declared) { Alert.alert('घोषणा', 'कृपया अभिभावक की घोषणा स्वीकार करें।'); return; }
    setSaving(true);
    try {
      const id = genId();
      const payload = { ...form, _id: id, _timestamp: today(), dob_words: dobWords(form.dob) };
      Object.keys(payload).forEach(k => { if (typeof payload[k] === 'boolean') payload[k] = payload[k] ? 'हाँ' : 'नहीं'; });
      await addDoc(collection(db, 'registrations'), payload);
      const html = buildPdfHtml(form, id);
      setPdfHtml(html);
      setRegId(id);
      setView('thankyou');
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    } catch (e) { Alert.alert('त्रुटि', 'सहेजने में समस्या हुई।\n' + e.message); }
    setSaving(false);
  };
  const downloadPdf = async () => {
    try {
      const { uri } = await Print.printToFileAsync({ html: pdfHtml, base64: false });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'PDF सहेजें' });
    } catch (e) { Alert.alert('त्रुटि', 'PDF बनाने में समस्या: ' + e.message); }
  };
  const printForm = async () => {
    try { await Print.printAsync({ html: pdfHtml }); }
    catch (e) { Alert.alert('त्रुटि', 'प्रिंट करने में समस्या: ' + e.message); }
  };
  const nextReg = () => {
    setForm({ ...BLANK, app_no: genId(), app_date: today() });
    setPdfHtml(''); setRegId('');
    setView('form');
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const Hdr = ({ hi, eng }) => (
    <>
      <LinearGradient colors={['#060F24','#0F2347','#1A3A6B']} style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} hitSlop={{top:10,bottom:10,left:10,right:10}}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerTitle}><Text style={s.headerHindi}>{hi}</Text><Text style={s.headerEng}>{eng}</Text></View>
        <View style={{ width: 38 }} />
      </LinearGradient>
      <View style={s.tricolor}><View style={[s.stripe,{backgroundColor:'#FF9933'}]}/><View style={[s.stripe,{backgroundColor:'#fff'}]}/><View style={[s.stripe,{backgroundColor:'#138808'}]}/></View>
    </>
  );

  if (view === 'thankyou') return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <Hdr hi="पंजीकरण सफल" eng="Registration Complete" />
      <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center', paddingBottom: 60 }}>
        <View style={s.tyCheck}><Ionicons name="checkmark" size={42} color="#fff" /></View>
        <Text style={s.tyHi}>धन्यवाद!</Text>
        <Text style={s.tyBig}>पंजीकरण सफलतापूर्वक हो गया</Text>
        <Text style={s.tyBody}>आपका आवेदन प्राथमिक विद्यालय गोविंदपुर में सुरक्षित रूप से सहेज लिया गया है।</Text>
        <View style={s.tyRef}><Text style={s.tyRefTxt}>पंजीकरण क्रमांक: {regId}</Text></View>
        <View style={s.tyActions}>
          <TouchableOpacity style={[s.tyBtn,{backgroundColor:COLORS.green}]} onPress={downloadPdf}>
            <Ionicons name="download-outline" size={18} color="#fff" /><Text style={s.tyBtnTxt}>PDF डाउनलोड करें</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.tyBtn,{backgroundColor:COLORS.navyPrimary}]} onPress={printForm}>
            <Ionicons name="print-outline" size={18} color="#fff" /><Text style={s.tyBtnTxt}>प्रिंट करें</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.tyBtn,{backgroundColor:'#fff',borderWidth:1.5,borderColor:COLORS.saffron}]} onPress={nextReg}>
            <Ionicons name="add-circle-outline" size={18} color={COLORS.saffron} /><Text style={[s.tyBtnTxt,{color:COLORS.saffron}]}>अगला पंजीकरण</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.tyNote}>विद्यालय कार्यालय आपसे शीघ्र ही संपर्क करेगा।</Text>
      </ScrollView>
    </View>
  );

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <Hdr hi="नया पंजीकरण" eng="New Student Registration" />
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={s.intro}>
          <View style={s.introLeft}><Ionicons name="school-outline" size={22} color={COLORS.green} /></View>
          <View style={{flex:1}}>
            <Text style={s.introTitle}>नए छात्र का पंजीकरण</Text>
            <Text style={s.introBody}>शैक्षिक सत्र 2026-27 हेतु प्रवेश आवेदन। * चिह्न वाले फ़ील्ड अनिवार्य हैं।</Text>
          </View>
        </View>
        <View style={s.formBody}>
          <SecHead num="1" title="विद्यालय एवं आवेदन विवरण" />
          <Row><Field label="शैक्षिक सत्र" value={form.session} onChangeText={set('session')} /><Field label="विकास क्षेत्र" value={form.block} onChangeText={set('block')} /></Row>
          <Row><Field label="जनपद" value={form.district} onChangeText={set('district')} /><Field label="प्रदेश" value={form.state} onChangeText={set('state')} /></Row>
          <Row><Field label="आवेदन संख्या" value={form.app_no} onChangeText={set('app_no')} editable={false} /><Field label="आवेदन दिनांक" value={form.app_date} onChangeText={set('app_date')} /></Row>
          <Row><Field label="नामांकन संख्या" value={form.enrollment_no} onChangeText={set('enrollment_no')} placeholder="कार्यालय द्वारा" /><Field label="UDISE कोड" value={form.udise} onChangeText={set('udise')} editable={false} /></Row>
          <SecHead num="2" title="छात्र/छात्रा का विवरण *" />
          <Row><Field label="नाम (हिन्दी में) *" value={form.student_name_hi} onChangeText={set('student_name_hi')} placeholder="उदा. प्रिया सिंह" /></Row>
          <Row><Field label="नाम (English में)" value={form.student_name_en} onChangeText={set('student_name_en')} placeholder="e.g. Priya Singh" /></Row>
          <PickerRow label="आवेदित कक्षा" value={form.applied_class} onChange={set('applied_class')} options={['बाल वाटिका','कक्षा 1','कक्षा 2','कक्षा 3','कक्षा 4','कक्षा 5']} />
          <Row><Field label="PEN" value={form.pen} onChangeText={set('pen')} keyboardType="numeric" maxLength={11} placeholder="11 अंक" /><Field label="APAAR ID" value={form.apaar} onChangeText={set('apaar')} keyboardType="numeric" maxLength={12} placeholder="12 अंक" /></Row>
          <Row><Field label="UNIQUE ID" value={form.unique_id} onChangeText={set('unique_id')} /><Field label="आधार संख्या" value={form.aadhaar} onChangeText={set('aadhaar')} keyboardType="numeric" maxLength={12} placeholder="12 अंक" /></Row>
          <Row><Field label="आधार पंजीकरण संख्या (यदि आधार नहीं)" value={form.aadhaar_enrol} onChangeText={set('aadhaar_enrol')} /></Row>
          <SecHead num="3" title="पूर्व विद्यालय विवरण" />
          <Row><Field label="पूर्व विद्यालय का नाम" value={form.prev_school} onChangeText={set('prev_school')} /></Row>
          <Row><Field label="पूर्व UDISE कोड" value={form.prev_udise} onChangeText={set('prev_udise')} /><Field label="पूर्व कक्षा" value={form.prev_class} onChangeText={set('prev_class')} /></Row>
          <Row><Field label="पूर्व नामांकन संख्या" value={form.prev_enrol} onChangeText={set('prev_enrol')} /><Field label="उपस्थित दिन" value={form.prev_attendance} onChangeText={set('prev_attendance')} keyboardType="numeric" /></Row>
          <SecHead num="4" title="व्यक्तिगत विवरण" />
          <Row><Field label="जन्मतिथि (DD-MM-YYYY)" value={form.dob} onChangeText={set('dob')} placeholder="25-01-2020" keyboardType="numeric" /></Row>
          <PickerRow label="लिंग" value={form.gender} onChange={set('gender')} options={['बालक','बालिका','अन्य']} />
          <Row><Field label="ऊँचाई (cm)" value={form.height} onChangeText={set('height')} keyboardType="decimal-pad" /><Field label="वज़न (kg)" value={form.weight} onChangeText={set('weight')} keyboardType="decimal-pad" /></Row>
          <PickerRow label="रक्त वर्ग" value={form.blood} onChange={set('blood')} options={['A+','A−','B+','B−','O+','O−','AB+','AB−']} />
          <PickerRow label="निवास क्षेत्र" value={form.residence_area} onChange={set('residence_area')} options={['ग्रामीण','शहरी']} />
          <PickerRow label="दिव्यांगता" value={form.divyang} onChange={set('divyang')} options={['नहीं','हाँ']} />
          {form.divyang === 'हाँ' && <Row><Field label="दिव्यांगता का प्रकार" value={form.divyang_type} onChangeText={set('divyang_type')} /></Row>}
          <PickerRow label="धर्म" value={form.religion} onChange={set('religion')} options={['हिन्दू','मुस्लिम','सिक्ख','ईसाई','बौद्ध','जैन','अन्य']} />
          <PickerRow label="जाति" value={form.caste} onChange={set('caste')} options={['सामान्य','OBC','SC','ST']} />
          <Row><Field label="उपजाति" value={form.sub_caste} onChangeText={set('sub_caste')} /><Field label="मातृभाषा" value={form.mother_tongue} onChangeText={set('mother_tongue')} /></Row>
          <PickerRow label="EWS / वंचित समुदाय" value={form.ews} onChange={set('ews')} options={['नहीं','हाँ']} />
          <PickerRow label="राशन कार्ड प्रकार" value={form.ration} onChange={set('ration')} options={['APL','BPL','अंत्योदय (AAY)','नहीं है']} />
          <Row><Field label="प्रदेश में निवास अवधि" value={form.residence_duration} onChangeText={set('residence_duration')} placeholder="उदा. 10 वर्ष" /></Row>
          <SecHead num="5" title="पिता का विवरण" />
          <Row><Field label="नाम (हिन्दी)" value={form.father_name_hi} onChangeText={set('father_name_hi')} /></Row>
          <Row><Field label="नाम (English)" value={form.father_name_en} onChangeText={set('father_name_en')} /></Row>
          <Row><Field label="व्यवसाय" value={form.father_occ} onChangeText={set('father_occ')} /><Field label="शैक्षिक योग्यता" value={form.father_edu} onChangeText={set('father_edu')} /></Row>
          <Row><Field label="आधार संख्या" value={form.father_aadhaar} onChangeText={set('father_aadhaar')} keyboardType="numeric" maxLength={12} /><Field label="मोबाइल नम्बर" value={form.father_mobile} onChangeText={set('father_mobile')} keyboardType="phone-pad" maxLength={10} /></Row>
          <Row><Field label="बैंक खाते अनुसार नाम" value={form.father_bank_name} onChangeText={set('father_bank_name')} /></Row>
          <Row><Field label="बैंक खाता संख्या" value={form.father_acc} onChangeText={set('father_acc')} keyboardType="numeric" /><Field label="IFSC कोड" value={form.father_ifsc} onChangeText={set('father_ifsc')} /></Row>
          <Row><Field label="बैंक का नाम" value={form.father_bank} onChangeText={set('father_bank')} /></Row>
          <SecHead num="6" title="माता का विवरण" />
          <Row><Field label="नाम (हिन्दी)" value={form.mother_name_hi} onChangeText={set('mother_name_hi')} /></Row>
          <Row><Field label="नाम (English)" value={form.mother_name_en} onChangeText={set('mother_name_en')} /></Row>
          <Row><Field label="व्यवसाय" value={form.mother_occ} onChangeText={set('mother_occ')} /><Field label="शैक्षिक योग्यता" value={form.mother_edu} onChangeText={set('mother_edu')} /></Row>
          <Row><Field label="आधार संख्या" value={form.mother_aadhaar} onChangeText={set('mother_aadhaar')} keyboardType="numeric" maxLength={12} /><Field label="मोबाइल नम्बर" value={form.mother_mobile} onChangeText={set('mother_mobile')} keyboardType="phone-pad" maxLength={10} /></Row>
          <Row><Field label="बैंक खाते अनुसार नाम" value={form.mother_bank_name} onChangeText={set('mother_bank_name')} /></Row>
          <Row><Field label="बैंक खाता संख्या" value={form.mother_acc} onChangeText={set('mother_acc')} keyboardType="numeric" /><Field label="IFSC कोड" value={form.mother_ifsc} onChangeText={set('mother_ifsc')} /></Row>
          <Row><Field label="बैंक का नाम" value={form.mother_bank} onChangeText={set('mother_bank')} /></Row>
          <SecHead num="7" title="स्थायी पता" />
          <Row><Field label="मोहल्ला / मजरा" value={form.perm_mohalla} onChangeText={set('perm_mohalla')} /><Field label="ग्राम / नगर" value={form.perm_village} onChangeText={set('perm_village')} /></Row>
          <Row><Field label="डाकखाना" value={form.perm_post} onChangeText={set('perm_post')} /><Field label="जनपद" value={form.perm_district} onChangeText={set('perm_district')} /></Row>
          <Row><Field label="प्रदेश" value={form.perm_state} onChangeText={set('perm_state')} /><Field label="पिनकोड" value={form.perm_pin} onChangeText={set('perm_pin')} keyboardType="numeric" maxLength={6} /></Row>
          <Row><Field label="ईमेल" value={form.perm_email} onChangeText={set('perm_email')} keyboardType="email-address" /></Row>
          <SecHead num="8" title="वर्तमान पता" />
          <TouchableOpacity style={s.copyAddrBtn} onPress={() => setForm(f => ({ ...f, curr_mohalla:f.perm_mohalla, curr_village:f.perm_village, curr_post:f.perm_post, curr_district:f.perm_district, curr_state:f.perm_state, curr_pin:f.perm_pin }))}>
            <Ionicons name="copy-outline" size={14} color={COLORS.navyPrimary} />
            <Text style={s.copyAddrTxt}>स्थायी पते के समान भरें</Text>
          </TouchableOpacity>
          <Row><Field label="मोहल्ला / मजरा" value={form.curr_mohalla} onChangeText={set('curr_mohalla')} /><Field label="ग्राम / नगर" value={form.curr_village} onChangeText={set('curr_village')} /></Row>
          <Row><Field label="डाकखाना" value={form.curr_post} onChangeText={set('curr_post')} /><Field label="जनपद" value={form.curr_district} onChangeText={set('curr_district')} /></Row>
          <Row><Field label="प्रदेश" value={form.curr_state} onChangeText={set('curr_state')} /><Field label="पिनकोड" value={form.curr_pin} onChangeText={set('curr_pin')} keyboardType="numeric" maxLength={6} /></Row>
          <Row><Field label="मोबाइल नम्बर 1" value={form.curr_mobile1} onChangeText={set('curr_mobile1')} keyboardType="phone-pad" maxLength={10} /><Field label="मोबाइल नम्बर 2" value={form.curr_mobile2} onChangeText={set('curr_mobile2')} keyboardType="phone-pad" maxLength={10} /></Row>
          <Row><Field label="ईमेल" value={form.curr_email} onChangeText={set('curr_email')} keyboardType="email-address" /></Row>
          <SecHead num="9" title="अभिभावक विवरण (वैकल्पिक)" />
          <Row><Field label="अभिभावक का नाम" value={form.guardian_name} onChangeText={set('guardian_name')} /></Row>
          <Row><Field label="विद्यार्थी से सम्बन्ध" value={form.guardian_rel} onChangeText={set('guardian_rel')} placeholder="उदा. चाचा, नाना" /><Field label="मोबाइल नम्बर" value={form.guardian_mobile} onChangeText={set('guardian_mobile')} keyboardType="phone-pad" maxLength={10} /></Row>
          <SecHead num="10" title="संलग्न दस्तावेज" />
          <View style={s.checkGrid}>
            {[['doc_birth','जन्म प्रमाण-पत्र'],['doc_student_aadhaar','छात्र का आधार कार्ड'],['doc_student_passbook','छात्र की बैंक पासबुक'],['doc_father_aadhaar','पिता का आधार कार्ड'],['doc_father_passbook','पिता की बैंक पासबुक'],['doc_mother_aadhaar','माता का आधार कार्ड'],['doc_mother_passbook','माता की बैंक पासबुक']].map(([k,l]) => (
              <CheckRow key={k} label={l} value={form[k]} onValueChange={set(k)} />
            ))}
          </View>
          <SecHead num="11" title="छात्र का फोटो (वैकल्पिक)" />
          <View style={s.photoRow}>
            <View style={s.photoPreview}>
              {form._photo ? <Image source={{ uri: form._photo }} style={s.photoImg} /> : <Text style={s.photoPh}>फोटो{'\n'}प्रीव्यू</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.photoTitle}>पासपोर्ट साइज़ फोटो</Text>
              <Text style={s.photoBody}>फॉर्म में स्वतः जुड़ जाएगी। यह अनिवार्य नहीं है।</Text>
              <View style={{ flexDirection:'row', gap:8, marginTop:8 }}>
                <TouchableOpacity onPress={pickPhoto} style={s.photoBtn}>
                  <Ionicons name="image-outline" size={16} color="#fff" /><Text style={s.photoBtnTxt}>फोटो चुनें</Text>
                </TouchableOpacity>
                {form._photo ? (
                  <TouchableOpacity onPress={removePhoto} style={s.photoRemove}>
                    <Ionicons name="trash-outline" size={15} color="#DC2626" /><Text style={s.photoRemoveTxt}>हटाएँ</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>
          <View style={s.declarationBox}>
            <Text style={s.declarationTitle}>अभिभावक की घोषणा</Text>
            <Text style={s.declarationBody}>मेरे द्वारा अपने पुत्र/पुत्री/पाल्य तथा उसके माता-पिता/अभिभावक के सन्दर्भ में यहाँ पर दी गयी सभी सूचनाएँ की भली-भाँति जाँच कर ली गयी है। सभी सूचनाएँ पूर्णतया सत्य हैं।</Text>
            <CheckRow label="मैं उपरोक्त घोषणा से सहमत हूँ *" value={form.declared} onValueChange={set('declared')} />
          </View>
          <TouchableOpacity onPress={submit} disabled={saving} style={s.submitBtn} activeOpacity={0.85}>
            <LinearGradient colors={['#138808','#15803D']} style={s.submitGrad}>
              {saving ? <ActivityIndicator color="#fff" /> : <><Ionicons name="checkmark-circle-outline" size={22} color="#fff" /><Text style={s.submitTxt}>जमा करें</Text></>}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:            { flex:1, backgroundColor:'#FBF3E4' },
  tricolor:        { flexDirection:'row', height:4 },
  stripe:          { flex:1 },
  header:          { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:14 },
  backBtn:         { width:38, height:38, borderRadius:19, backgroundColor:'rgba(255,255,255,0.12)', borderWidth:1, borderColor:'rgba(255,255,255,0.18)', alignItems:'center', justifyContent:'center' },
  headerTitle:     { alignItems:'center', flex:1, paddingHorizontal:6 },
  headerHindi:     { color:'#fff', fontSize:18, fontFamily:'NotoSansDevanagari_700Bold' },
  headerEng:       { color:'#FED7AA', fontSize:10, marginTop:1 },
  intro:           { flexDirection:'row', alignItems:'flex-start', gap:12, backgroundColor:'#fff', margin:16, padding:16, borderRadius:14, borderLeftWidth:4, borderLeftColor:COLORS.green, elevation:2, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:6 },
  introLeft:       { width:36, height:36, borderRadius:18, backgroundColor:'#F0FDF4', alignItems:'center', justifyContent:'center' },
  introTitle:      { fontSize:16, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },
  introBody:       { fontSize:12, color:COLORS.inkLight, marginTop:3, fontFamily:'NotoSansDevanagari_400Regular' },
  formBody:        { paddingHorizontal:16, paddingBottom:24 },
  secHead:         { flexDirection:'row', alignItems:'center', gap:10, marginTop:20, marginBottom:12 },
  secNum:          { width:28, height:28, borderRadius:14, backgroundColor:COLORS.green, alignItems:'center', justifyContent:'center' },
  secNumTxt:       { color:'#fff', fontSize:13, fontFamily:'NotoSansDevanagari_700Bold' },
  secTitle:        { fontSize:16, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyPrimary, flex:1 },
  row:             { flexDirection:'row', gap:10, marginBottom:6 },
  field:           { flex:1, marginBottom:6 },
  label:           { fontSize:11, color:COLORS.inkSoft, marginBottom:4, fontFamily:'NotoSansDevanagari_400Regular' },
  input:           { backgroundColor:'#fff', borderRadius:8, borderWidth:1, borderColor:'#D6D3D1', paddingHorizontal:12, paddingVertical:10, fontSize:14, fontFamily:'NotoSansDevanagari_400Regular', color:COLORS.ink },
  inputDisabled:   { backgroundColor:'#F5F5F4' },
  chip:            { paddingHorizontal:12, paddingVertical:7, borderRadius:20, backgroundColor:'#fff', borderWidth:1, borderColor:'#D6D3D1' },
  chipActive:      { backgroundColor:COLORS.navyPrimary, borderColor:COLORS.navyPrimary },
  chipTxt:         { fontSize:13, color:COLORS.inkSoft, fontFamily:'NotoSansDevanagari_400Regular' },
  chipActiveTxt:   { color:'#fff' },
  copyAddrBtn:     { flexDirection:'row', alignItems:'center', gap:6, alignSelf:'flex-start', marginBottom:10, paddingVertical:6, paddingHorizontal:12, borderRadius:8, backgroundColor:'#EFF6FF', borderWidth:1, borderColor:'#BFDBFE' },
  copyAddrTxt:     { fontSize:12, color:COLORS.navyPrimary, fontFamily:'NotoSansDevanagari_400Regular' },
  checkGrid:       { gap:4, marginBottom:8 },
  checkRow:        { flexDirection:'row', alignItems:'center', gap:8, paddingVertical:6, paddingHorizontal:10, backgroundColor:'#fff', borderRadius:8, borderWidth:1, borderColor:'#E7E5E4', marginBottom:3 },
  checkLabel:      { fontSize:13, color:COLORS.inkSoft, flex:1, fontFamily:'NotoSansDevanagari_400Regular' },
  declarationBox:  { backgroundColor:'#FFFBEB', borderRadius:14, padding:16, borderLeftWidth:4, borderLeftColor:COLORS.saffron, marginTop:16, marginBottom:8 },
  declarationTitle:{ fontSize:15, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark, marginBottom:8 },
  declarationBody: { fontSize:12, color:COLORS.inkSoft, lineHeight:20, marginBottom:12, fontFamily:'NotoSansDevanagari_400Regular' },
  submitBtn:       { marginTop:20, borderRadius:16, overflow:'hidden', elevation:4, shadowColor:'#000', shadowOpacity:0.15, shadowRadius:8 },
  submitGrad:      { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, paddingVertical:18 },
  submitTxt:       { color:'#fff', fontSize:18, fontFamily:'NotoSansDevanagari_700Bold' },
  photoRow:        { flexDirection:'row', gap:14, backgroundColor:'#fff', borderRadius:12, padding:14, borderWidth:1, borderColor:'#E7E5E4', alignItems:'center' },
  photoPreview:    { width:90, height:112, borderRadius:8, borderWidth:1.5, borderColor:'#D6D3D1', backgroundColor:'#FAFAF9', alignItems:'center', justifyContent:'center', overflow:'hidden' },
  photoImg:        { width:'100%', height:'100%' },
  photoPh:         { fontSize:11, color:COLORS.inkLight, textAlign:'center', fontFamily:'NotoSansDevanagari_400Regular' },
  photoTitle:      { fontSize:14, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },
  photoBody:       { fontSize:11, color:COLORS.inkLight, marginTop:3, fontFamily:'NotoSansDevanagari_400Regular' },
  photoBtn:        { flexDirection:'row', alignItems:'center', gap:6, backgroundColor:COLORS.green, paddingHorizontal:12, paddingVertical:8, borderRadius:8 },
  photoBtnTxt:     { color:'#fff', fontSize:13, fontFamily:'NotoSansDevanagari_700Bold' },
  photoRemove:     { flexDirection:'row', alignItems:'center', gap:5, paddingHorizontal:10, paddingVertical:8, borderRadius:8, borderWidth:1, borderColor:'#FCA5A5', backgroundColor:'#FEF2F2' },
  photoRemoveTxt:  { color:'#DC2626', fontSize:13, fontFamily:'NotoSansDevanagari_400Regular' },
  tyCheck:         { width:80, height:80, borderRadius:40, backgroundColor:COLORS.green, alignItems:'center', justifyContent:'center', marginBottom:16, marginTop:24, elevation:6, shadowColor:'#000', shadowOpacity:0.2, shadowRadius:10 },
  tyHi:            { fontSize:24, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.saffron, marginBottom:4 },
  tyBig:           { fontSize:22, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark, textAlign:'center', marginBottom:10 },
  tyBody:          { fontSize:14, color:COLORS.inkSoft, textAlign:'center', marginBottom:18, lineHeight:22, fontFamily:'NotoSansDevanagari_400Regular', paddingHorizontal:8 },
  tyRef:           { backgroundColor:'#FEF3C7', paddingHorizontal:18, paddingVertical:8, borderRadius:8, marginBottom:24 },
  tyRefTxt:        { fontSize:14, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark },
  tyActions:       { width:'100%', gap:10 },
  tyBtn:           { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, paddingVertical:15, borderRadius:14, elevation:2, shadowColor:'#000', shadowOpacity:0.1, shadowRadius:5 },
  tyBtnTxt:        { fontSize:15, fontFamily:'NotoSansDevanagari_700Bold', color:'#fff' },
  tyNote:          { marginTop:20, fontSize:12, color:COLORS.inkLight, textAlign:'center', fontFamily:'NotoSansDevanagari_400Regular', fontStyle:'italic' },
});
