import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Alert, ActivityIndicator, Switch, Image, Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { COLORS } from '../theme/colors';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as ImagePicker from 'expo-image-picker';
import { buildPdfHtml, dobWords, nowStamp, truthy, HINDI_MONTHS, CONSENT } from '../utils/registrationPdf';
import { uploadToCloudinary } from '../config/cloudinary';


const BLANK = {
  block:'नगर क्षेत्र मथुरा', district:'मथुरा', state:'उत्तर प्रदेश',
  app_no:'', app_date:'', enrollment_no:'', school_name:'प्राथमिक विद्यालय गोविंदपुर', udise:'09141101809',
  student_name_hi:'', student_name_en:'', applied_class:'', pen:'', apaar:'', unique_id:'', aadhaar:'', aadhaar_enrol:'',
  prev_school:'', prev_udise:'', prev_class:'', prev_enrol:'', prev_attendance:'', prev_percent:'',
  dob:'', dob_words:'', gender:'', height:'', weight:'', blood:'', residence_area:'', divyang:'नहीं', divyang_type:'',
  religion:'', caste:'', sub_caste:'', mother_tongue:'हिन्दी', ews:'नहीं', ration:'', residence_duration:'',
  father_name_hi:'', father_name_en:'', father_occ:'', father_edu:'', father_aadhaar:'', father_bank_name:'', father_acc:'', father_ifsc:'', father_bank:'', father_mobile:'',
  mother_name_hi:'', mother_name_en:'', mother_occ:'', mother_edu:'', mother_aadhaar:'', mother_bank_name:'', mother_acc:'', mother_ifsc:'', mother_bank:'', mother_mobile:'',
  perm_mohalla:'', perm_village:'', perm_post:'', perm_district:'', perm_state:'उत्तर प्रदेश', perm_pin:'',
  curr_mohalla:'', curr_village:'', curr_post:'', curr_district:'', curr_state:'', curr_pin:'',
  guardian_name:'', guardian_rel:'', guardian_mobile:'',
  siblings:[
    { name:'', rel:'', dob:'', school:'', reason:'' },
    { name:'', rel:'', dob:'', school:'', reason:'' },
    { name:'', rel:'', dob:'', school:'', reason:'' },
    { name:'', rel:'', dob:'', school:'', reason:'' },
  ],
  doc_birth:false, doc_student_aadhaar:false, doc_student_passbook:false,
  doc_father_aadhaar:false, doc_father_passbook:false, doc_mother_aadhaar:false, doc_mother_passbook:false,
  declared:false,
  _photo:null, _photoUri:null, photo_url:'',
};

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

// Custom date selector (day / month / year) — no native dependency, works in Expo Go.
function DateField({ label, value, onPick }) {
  const [open, setOpen] = useState(false);
  const parts = value ? value.split('-') : ['', '', ''];
  const [d, setD] = useState(parts[0] || '');
  const [m, setM] = useState(parts[1] || '');
  const [y, setY] = useState(parts[2] || '');
  const days  = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const months = HINDI_MONTHS.map((nm, i) => ({ label: nm, val: String(i + 1).padStart(2, '0') }));
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 22 }, (_, i) => String(thisYear - i));

  const confirm = () => {
    if (d && m && y) { onPick(`${d}-${m}-${y}`); setOpen(false); }
    else Alert.alert('अधूरी तिथि', 'कृपया दिन, माह और वर्ष तीनों चुनें।');
  };

  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <TouchableOpacity style={[s.input, s.dateInput]} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Text style={{ color: value ? COLORS.ink : COLORS.inkLight, fontFamily:'NotoSansDevanagari_400Regular', fontSize:14 }}>
          {value || 'तिथि चुनें'}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={COLORS.navyPrimary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>जन्मतिथि चुनें</Text>
            <Text style={s.modalSub}>दिन</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}><View style={s.modalRow}>
              {days.map(x => <TouchableOpacity key={x} onPress={() => setD(x)} style={[s.chip, d===x && s.chipActive]}><Text style={[s.chipTxt, d===x && s.chipActiveTxt]}>{x}</Text></TouchableOpacity>)}
            </View></ScrollView>
            <Text style={s.modalSub}>माह</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}><View style={s.modalRow}>
              {months.map(mo => <TouchableOpacity key={mo.val} onPress={() => setM(mo.val)} style={[s.chip, m===mo.val && s.chipActive]}><Text style={[s.chipTxt, m===mo.val && s.chipActiveTxt]}>{mo.label}</Text></TouchableOpacity>)}
            </View></ScrollView>
            <Text style={s.modalSub}>वर्ष</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}><View style={s.modalRow}>
              {years.map(x => <TouchableOpacity key={x} onPress={() => setY(x)} style={[s.chip, y===x && s.chipActive]}><Text style={[s.chipTxt, y===x && s.chipActiveTxt]}>{x}</Text></TouchableOpacity>)}
            </View></ScrollView>
            <View style={s.modalActions}>
              <TouchableOpacity style={[s.modalBtn,{backgroundColor:'#E7E5E4'}]} onPress={() => setOpen(false)}><Text style={[s.modalBtnTxt,{color:COLORS.inkSoft}]}>रद्द करें</Text></TouchableOpacity>
              <TouchableOpacity style={[s.modalBtn,{backgroundColor:COLORS.green}]} onPress={confirm}><Text style={s.modalBtnTxt}>ठीक है</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const BOOL_KEYS = ['doc_birth','doc_student_aadhaar','doc_student_passbook','doc_father_aadhaar','doc_father_passbook','doc_mother_aadhaar','doc_mother_passbook','declared'];

// Build a clean form state from a stored Firestore record (normalises booleans + siblings).
function recordToForm(rec) {
  const { id, createdAt, updated_at, submitted_at, ...data } = rec || {};
  const f = { ...BLANK, ...data };
  BOOL_KEYS.forEach(k => { f[k] = truthy(data[k]); });
  if (!Array.isArray(f.siblings) || f.siblings.length === 0) f.siblings = BLANK.siblings.map(s => ({ ...s }));
  f._photo = null; f._photoUri = null; // photos re-fetch from photo_url; new pick re-uploads
  return f;
}

export default function RegistrationScreen({ navigation, route }) {
  const editRecord = route?.params?.editRecord || null;
  const editDocId  = route?.params?.docId || null;
  const isEdit      = !!editDocId;

  const insets = useSafeAreaInsets();
  const [form, setForm]       = useState(() => isEdit ? recordToForm(editRecord) : { ...BLANK, app_no: 'PSGOV' });
  const [view, setView]       = useState('form');
  const [saving, setSaving]   = useState(false);
  const [regId, setRegId]     = useState('');
  const [pdfHtml, setPdfHtml] = useState('');
  const scrollRef             = useRef(null);
  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));
  const setSibling = (i, key) => (val) => setForm(f => {
    const sib = f.siblings.map((r, idx) => idx === i ? { ...r, [key]: val } : r);
    return { ...f, siblings: sib };
  });

  const onPickDob = (dateStr) => setForm(f => ({ ...f, dob: dateStr, dob_words: dobWords(dateStr) }));

  const pickPhotoFor = (key) => async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('अनुमति चाहिए', 'फोटो एक्सेस की अनुमति दें।'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [3,4], quality: 0.6, base64: true });
    if (result.canceled) return;
    const a = result.assets[0];
    setForm(f => ({ ...f, [key]: `data:image/jpeg;base64,${a.base64}`, [key + 'Uri']: a.uri }));
  };
  const removePhoto = (key) => () => setForm(f => ({ ...f, [key]: null, [key + 'Uri']: null, photo_url: '' }));

  const submit = async () => {
    if (!form.student_name_hi.trim()) { Alert.alert('अनिवार्य', 'छात्र/छात्रा का नाम (हिन्दी में) भरें।'); return; }
    if (!form.app_no.trim() || form.app_no.trim().toUpperCase() === 'PSGOV') { Alert.alert('आवेदन संख्या', 'कृपया आवेदन संख्या पूरी भरें (PSGOV के बाद क्रमांक)।'); return; }
    if (!form.declared) { Alert.alert('घोषणा', 'कृपया अभिभावक की घोषणा स्वीकार करें।'); return; }
    setSaving(true);
    try {
      const id = form.app_no.trim();
      const stamp = nowStamp();
      // Upload the student photo to Cloudinary (only if a new one was picked); store just the URL in Firestore.
      let photoUrl = form.photo_url || '';
      if (form._photoUri) {
        try { photoUrl = await uploadToCloudinary(form._photoUri, 'registrations'); }
        catch (e) { Alert.alert('फोटो अपलोड में समस्या', 'फोटो अपलोड नहीं हो पाई — फॉर्म फोटो के बिना सहेजा जा रहा है।\n' + e.message); }
      }
      // Drop the in-memory photo fields; Firestore keeps only the hosted photo_url.
      const { _photo, _photoUri, ...rest } = form;
      if (isEdit) {
        const payload = { ...rest, _id: id, photo_url: photoUrl, updated_at: stamp };
        await updateDoc(doc(db, 'registrations', editDocId), payload);
      } else {
        const payload = { ...rest, _id: id, photo_url: photoUrl, submitted_at: stamp, createdAt: Date.now() };
        await addDoc(collection(db, 'registrations'), payload);
      }
      setPdfHtml(buildPdfHtml({ ...form, photo_url: photoUrl }, id, stamp));
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
    if (isEdit) { navigation.goBack(); return; }
    setForm({ ...BLANK, app_no: 'PSGOV' });
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

  const PhotoPicker = ({ title, photoKey }) => {
    const src = form[photoKey] || (photoKey === '_photo' ? form.photo_url : '') || null;
    return (
    <View style={s.photoRow}>
      <View style={s.photoPreview}>
        {src ? <Image source={{ uri: src }} style={s.photoImg} /> : <Text style={s.photoPh}>फोटो{'\n'}प्रीव्यू</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.photoTitle}>{title}</Text>
        <Text style={s.photoBody}>पासपोर्ट साइज़ फोटो। फॉर्म व रिकॉर्ड में सुरक्षित रहेगी।</Text>
        <View style={{ flexDirection:'row', gap:8, marginTop:8 }}>
          <TouchableOpacity onPress={pickPhotoFor(photoKey)} style={s.photoBtn}>
            <Ionicons name="image-outline" size={16} color="#fff" /><Text style={s.photoBtnTxt}>फोटो चुनें</Text>
          </TouchableOpacity>
          {src ? (
            <TouchableOpacity onPress={removePhoto(photoKey)} style={s.photoRemove}>
              <Ionicons name="trash-outline" size={15} color="#DC2626" /><Text style={s.photoRemoveTxt}>हटाएँ</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
    );
  };

  if (view === 'thankyou') return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <Hdr hi="पंजीकरण सफल" eng="Registration Complete" />
      <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center', paddingBottom: 60 }}>
        <View style={s.tyCheck}><Ionicons name="checkmark" size={42} color="#fff" /></View>
        <Text style={s.tyHi}>धन्यवाद!</Text>
        <Text style={s.tyBig}>{isEdit ? 'पंजीकरण अपडेट हो गया' : 'पंजीकरण सफलतापूर्वक हो गया'}</Text>
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
            <Ionicons name="add-circle-outline" size={18} color={COLORS.saffron} /><Text style={[s.tyBtnTxt,{color:COLORS.saffron}]}>{isEdit ? 'सूची पर वापस जाएँ' : 'अगला पंजीकरण'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.tyNote}>विद्यालय कार्यालय आपसे शीघ्र ही संपर्क करेगा।</Text>
      </ScrollView>
    </View>
  );

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <Hdr hi={isEdit ? 'पंजीकरण संपादन' : 'नया पंजीकरण'} eng={isEdit ? 'Edit Registration' : 'New Student Registration'} />
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={s.intro}>
          <View style={s.introLeft}><Ionicons name="school-outline" size={22} color={COLORS.green} /></View>
          <View style={{flex:1}}>
            <Text style={s.introTitle}>नए छात्र का पंजीकरण</Text>
            <Text style={s.introBody}>प्रवेश आवेदन। * चिह्न वाले फ़ील्ड अनिवार्य हैं।</Text>
          </View>
        </View>
        <View style={s.formBody}>
          <SecHead num="1" title="विद्यालय एवं आवेदन विवरण" />
          <Row><Field label="विकास क्षेत्र" value={form.block} onChangeText={set('block')} /><Field label="जनपद" value={form.district} onChangeText={set('district')} /></Row>
          <Row><Field label="प्रदेश" value={form.state} onChangeText={set('state')} /><Field label="UDISE कोड" value={form.udise} onChangeText={set('udise')} editable={false} /></Row>
          <Row><Field label="आवेदन संख्या *" value={form.app_no} onChangeText={set('app_no')} placeholder="PSGOV0001" /><Field label="आवेदन दिनांक" value={form.app_date} onChangeText={set('app_date')} placeholder="DD-MM-YYYY" /></Row>
          <Row><Field label="नामांकन संख्या" value={form.enrollment_no} onChangeText={set('enrollment_no')} placeholder="कार्यालय द्वारा" /></Row>
          <SecHead num="2" title="छात्र/छात्रा का विवरण *" />
          <Row><Field label="नाम (हिन्दी में) *" value={form.student_name_hi} onChangeText={set('student_name_hi')} placeholder="उदा. प्रिया सिंह" /></Row>
          <Row><Field label="नाम (English में)" value={form.student_name_en} onChangeText={set('student_name_en')} placeholder="e.g. Priya Singh" /></Row>
          <PickerRow label="आवेदित कक्षा" value={form.applied_class} onChange={set('applied_class')} options={['कक्षा 1','कक्षा 2','कक्षा 3','कक्षा 4','कक्षा 5']} />
          <Row><Field label="PEN" value={form.pen} onChangeText={set('pen')} keyboardType="numeric" maxLength={11} placeholder="11 अंक" /><Field label="APAAR ID" value={form.apaar} onChangeText={set('apaar')} keyboardType="numeric" maxLength={12} placeholder="12 अंक" /></Row>
          <Row><Field label="UNIQUE ID" value={form.unique_id} onChangeText={set('unique_id')} /><Field label="आधार संख्या" value={form.aadhaar} onChangeText={set('aadhaar')} keyboardType="numeric" maxLength={12} placeholder="12 अंक" /></Row>
          <Row><Field label="आधार पंजीकरण संख्या (यदि आधार नहीं)" value={form.aadhaar_enrol} onChangeText={set('aadhaar_enrol')} /></Row>
          <SecHead num="3" title="पूर्व विद्यालय विवरण" />
          <Row><Field label="पूर्व विद्यालय का नाम" value={form.prev_school} onChangeText={set('prev_school')} /></Row>
          <Row><Field label="पूर्व UDISE कोड" value={form.prev_udise} onChangeText={set('prev_udise')} /><Field label="पूर्व कक्षा" value={form.prev_class} onChangeText={set('prev_class')} /></Row>
          <Row><Field label="पूर्व नामांकन संख्या" value={form.prev_enrol} onChangeText={set('prev_enrol')} /><Field label="उपस्थित दिन" value={form.prev_attendance} onChangeText={set('prev_attendance')} keyboardType="numeric" /></Row>
          <SecHead num="4" title="व्यक्तिगत विवरण" />
          <DateField label="जन्मतिथि" value={form.dob} onPick={onPickDob} />
          <Row><Field label="जन्मतिथि (शब्दों में)" value={form.dob_words} onChangeText={set('dob_words')} placeholder="उदा. पच्चीस जनवरी 2020" /></Row>
          <PickerRow label="लिंग" value={form.gender} onChange={set('gender')} options={['बालक','बालिका','अन्य']} />
          <Row><Field label="ऊँचाई (cm)" value={form.height} onChangeText={set('height')} keyboardType="decimal-pad" /><Field label="वज़न (kg)" value={form.weight} onChangeText={set('weight')} keyboardType="decimal-pad" /></Row>
          <PickerRow label="रक्त वर्ग" value={form.blood} onChange={set('blood')} options={['A+','A−','B+','B−','O+','O−','AB+','AB−']} />
          <PickerRow label="निवास क्षेत्र" value={form.residence_area} onChange={set('residence_area')} options={['ग्रामीण','शहरी']} />
          <PickerRow label="दिव्यांगता" value={form.divyang} onChange={set('divyang')} options={['नहीं','हाँ']} />
          {form.divyang === 'हाँ' && <Row><Field label="दिव्यांगता का प्रकार" value={form.divyang_type} onChangeText={set('divyang_type')} /></Row>}
          <PickerRow label="धर्म" value={form.religion} onChange={set('religion')} options={['हिन्दू','मुस्लिम','सिक्ख','ईसाई','बौद्ध','जैन','अन्य']} />
          <PickerRow label="उपजाति" value={form.caste} onChange={set('caste')} options={['सामान्य','OBC','SC','ST']} />
          <Row><Field label="वर्ग" value={form.sub_caste} onChangeText={set('sub_caste')} placeholder="वर्ग टाइप करें" /><Field label="मातृभाषा" value={form.mother_tongue} onChangeText={set('mother_tongue')} /></Row>
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
          <Row><Field label="मकान नं." value={form.perm_mohalla} onChangeText={set('perm_mohalla')} /><Field label="ग्राम/बस्ती" value={form.perm_village} onChangeText={set('perm_village')} /></Row>
          <Row><Field label="डाकखाना" value={form.perm_post} onChangeText={set('perm_post')} /><Field label="जनपद" value={form.perm_district} onChangeText={set('perm_district')} /></Row>
          <Row><Field label="प्रदेश" value={form.perm_state} onChangeText={set('perm_state')} /><Field label="पिनकोड" value={form.perm_pin} onChangeText={set('perm_pin')} keyboardType="numeric" maxLength={6} /></Row>
          <SecHead num="8" title="वर्तमान पता" />
          <TouchableOpacity style={s.copyAddrBtn} onPress={() => setForm(f => ({ ...f, curr_mohalla:f.perm_mohalla, curr_village:f.perm_village, curr_post:f.perm_post, curr_district:f.perm_district, curr_state:f.perm_state, curr_pin:f.perm_pin }))}>
            <Ionicons name="copy-outline" size={14} color={COLORS.navyPrimary} />
            <Text style={s.copyAddrTxt}>स्थायी पते के समान भरें</Text>
          </TouchableOpacity>
          <Row><Field label="मकान नं." value={form.curr_mohalla} onChangeText={set('curr_mohalla')} /><Field label="ग्राम/बस्ती" value={form.curr_village} onChangeText={set('curr_village')} /></Row>
          <Row><Field label="डाकखाना" value={form.curr_post} onChangeText={set('curr_post')} /><Field label="जनपद" value={form.curr_district} onChangeText={set('curr_district')} /></Row>
          <Row><Field label="प्रदेश" value={form.curr_state} onChangeText={set('curr_state')} /><Field label="पिनकोड" value={form.curr_pin} onChangeText={set('curr_pin')} keyboardType="numeric" maxLength={6} /></Row>
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
          <PhotoPicker title="छात्र/छात्रा का फोटो" photoKey="_photo" />
          <Text style={s.photoHint}>माता एवं पिता के फोटो प्रिंट के बाद हाथ से चिपकाए जाएँगे — फॉर्म में उनके लिए खाली बॉक्स छपेंगे।</Text>
          <SecHead num="12" title="भाई / बहन का विवरण" />
          {form.siblings.map((sib, i) => (
            <View key={i} style={s.sibCard}>
              <Text style={s.sibCardTitle}>प्रविष्टि {i + 1}</Text>
              <Row><Field label="नाम" value={sib.name} onChangeText={setSibling(i,'name')} /></Row>
              <Row><Field label="जन्मतिथि" value={sib.dob} onChangeText={setSibling(i,'dob')} placeholder="DD-MM-YYYY" /><Field label="नामांकित विद्यालय" value={sib.school} onChangeText={setSibling(i,'school')} /></Row>
            </View>
          ))}
          <View style={s.declarationBox}>
            <Text style={s.declarationTitle}>अभिभावक की घोषणा</Text>
            <Text style={s.declarationBody}>मेरे द्वारा अपने पुत्र/पुत्री/पाल्य तथा उसके माता-पिता/अभिभावक के सन्दर्भ में यहाँ पर दी गयी सभी सूचनाएँ की भली-भाँति जाँच कर ली गयी है। सभी सूचनाएँ पूर्णतया सत्य हैं।{'\n\n'}{CONSENT}</Text>
            <CheckRow label="मैं उपरोक्त घोषणा से सहमत हूँ *" value={form.declared} onValueChange={set('declared')} />
          </View>
          <TouchableOpacity onPress={submit} disabled={saving} style={s.submitBtn} activeOpacity={0.85}>
            <LinearGradient colors={['#138808','#15803D']} style={s.submitGrad}>
              {saving ? <ActivityIndicator color="#fff" /> : <><Ionicons name="checkmark-circle-outline" size={22} color="#fff" /><Text style={s.submitTxt}>{isEdit ? 'अपडेट करें' : 'जमा करें'}</Text></>}
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
  dateInput:       { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  chip:            { paddingHorizontal:12, paddingVertical:7, borderRadius:20, backgroundColor:'#fff', borderWidth:1, borderColor:'#D6D3D1' },
  chipActive:      { backgroundColor:COLORS.navyPrimary, borderColor:COLORS.navyPrimary },
  chipTxt:         { fontSize:13, color:COLORS.inkSoft, fontFamily:'NotoSansDevanagari_400Regular' },
  chipActiveTxt:   { color:'#fff' },
  copyAddrBtn:     { flexDirection:'row', alignItems:'center', gap:6, alignSelf:'flex-start', marginBottom:10, paddingVertical:6, paddingHorizontal:12, borderRadius:8, backgroundColor:'#EFF6FF', borderWidth:1, borderColor:'#BFDBFE' },
  copyAddrTxt:     { fontSize:12, color:COLORS.navyPrimary, fontFamily:'NotoSansDevanagari_400Regular' },
  checkGrid:       { gap:4, marginBottom:8 },
  checkRow:        { flexDirection:'row', alignItems:'center', gap:8, paddingVertical:6, paddingHorizontal:10, backgroundColor:'#fff', borderRadius:8, borderWidth:1, borderColor:'#E7E5E4', marginBottom:3 },
  checkLabel:      { fontSize:13, color:COLORS.inkSoft, flex:1, fontFamily:'NotoSansDevanagari_400Regular' },
  sibCard:         { backgroundColor:'#fff', borderRadius:12, padding:12, borderWidth:1, borderColor:'#E7E5E4', marginBottom:10 },
  sibCardTitle:    { fontSize:13, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyPrimary, marginBottom:6 },
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
  photoHint:       { fontSize:11, color:COLORS.inkLight, marginTop:8, fontStyle:'italic', fontFamily:'NotoSansDevanagari_400Regular' },
  modalBackdrop:   { flex:1, backgroundColor:'rgba(0,0,0,0.45)', justifyContent:'flex-end' },
  modalCard:       { backgroundColor:'#fff', borderTopLeftRadius:20, borderTopRightRadius:20, padding:20, paddingBottom:28 },
  modalTitle:      { fontSize:17, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.navyDark, marginBottom:10, textAlign:'center' },
  modalSub:        { fontSize:12, fontFamily:'NotoSansDevanagari_700Bold', color:COLORS.green, marginTop:10, marginBottom:4 },
  modalRow:        { flexDirection:'row', gap:6, paddingVertical:2 },
  modalActions:    { flexDirection:'row', gap:10, marginTop:18 },
  modalBtn:        { flex:1, alignItems:'center', justifyContent:'center', paddingVertical:14, borderRadius:12 },
  modalBtnTxt:     { color:'#fff', fontSize:15, fontFamily:'NotoSansDevanagari_700Bold' },
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