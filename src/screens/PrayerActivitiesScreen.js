import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { collection, doc, getDoc, setDoc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

// 10 fixed activities — titles never change, only content.
const ACTIVITIES = [
  { key: 'pledge',    hi: 'प्रतिज्ञा',          en: 'Pledge',                    icon: 'hand-right' },
  { key: 'almanac',   hi: 'पंचांग',             en: 'Almanac',                   icon: 'sunny' },
  { key: 'subhashit', hi: 'सुभाषित',            en: 'Ciceronian',                icon: 'sparkles' },
  { key: 'thought',   hi: 'सुविचार',            en: 'Thought of the Day',        icon: 'bulb' },
  { key: 'words',     hi: 'आज के शब्द',         en: 'Words of the Day',          icon: 'text' },
  { key: 'news',      hi: 'आज के समाचार',       en: 'News of the Day',           icon: 'newspaper' },
  { key: 'history',   hi: 'इतिहास में आज का दिन', en: 'History of the Day',       icon: 'time' },
  { key: 'questions', hi: 'आज के प्रश्न',        en: 'Questions of the Day',      icon: 'help-circle' },
  { key: 'poems',     hi: 'आज की कविताएं',       en: 'Poems of the Day',          icon: 'musical-notes' },
  { key: 'song',      hi: 'आज का देशगीत',       en: 'Patriotic Song of the Day', icon: 'flag' },
];

const HINDI_MONTHS = ['जनवरी','फरवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितंबर','अक्टूबर','नवंबर','दिसंबर'];
const HINDI_WEEKDAYS = ['रवि','सोम','मंगल','बुध','गुरु','शुक्र','शनि'];

// "2026-06-25" -> "बुधवार, 25 जून 2026"
function formatHindiDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const wd = ['रविवार','सोमवार','मंगलवार','बुधवार','गुरुवार','शुक्रवार','शनिवार'][dt.getDay()];
  return `${wd}, ${d} ${HINDI_MONTHS[m - 1]} ${y}`;
}
function todayISO() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
}

// ---------- date picker (admin only) ----------
function DatePickerModal({ visible, initialDate, onPick, onClose }) {
  const init = initialDate ? initialDate.split('-').map(Number) : [new Date().getFullYear(), new Date().getMonth()+1, new Date().getDate()];
  const [y, setY] = useState(init[0]);
  const [m, setM] = useState(init[1]);
  const [d, setD] = useState(init[2]);

  const daysInMonth = new Date(y, m, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const months = HINDI_MONTHS.map((nm, i) => ({ label: nm, val: i + 1 }));
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => thisYear - 1 + i); // last yr, this yr, next yr

  const confirm = () => {
    const iso = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    onPick(iso);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.modalBackdrop}>
        <View style={s.modalCard}>
          <Text style={s.modalTitle}>तिथि चुनें</Text>

          <Text style={s.modalSub}>दिन</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={s.chipRow}>
              {days.map(x => (
                <TouchableOpacity key={x} onPress={() => setD(x)} style={[s.chip, d===x && s.chipActive]}>
                  <Text style={[s.chipTxt, d===x && s.chipActiveTxt]}>{String(x).padStart(2,'0')}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={s.modalSub}>माह</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={s.chipRow}>
              {months.map(mo => (
                <TouchableOpacity key={mo.val} onPress={() => setM(mo.val)} style={[s.chip, m===mo.val && s.chipActive]}>
                  <Text style={[s.chipTxt, m===mo.val && s.chipActiveTxt]}>{mo.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={s.modalSub}>वर्ष</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={s.chipRow}>
              {years.map(x => (
                <TouchableOpacity key={x} onPress={() => setY(x)} style={[s.chip, y===x && s.chipActive]}>
                  <Text style={[s.chipTxt, y===x && s.chipActiveTxt]}>{x}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={s.modalActions}>
            <TouchableOpacity style={[s.modalBtn, { backgroundColor: '#E7E5E4' }]} onPress={onClose}>
              <Text style={[s.modalBtnTxt, { color: COLORS.inkSoft }]}>रद्द करें</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.modalBtn, { backgroundColor: COLORS.green }]} onPress={confirm}>
              <Text style={s.modalBtnTxt}>ठीक है</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ---------- field editor modal ----------
function FieldEditorModal({ visible, activity, value, onSave, onClose }) {
  const [text, setText] = useState(value || '');
  useEffect(() => { setText(value || ''); }, [value, visible]);

  if (!activity) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={s.modalBackdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[s.modalCard, { maxHeight: '85%' }]}>
          <View style={s.editorHead}>
            <View style={s.editorIcon}>
              <Ionicons name={activity.icon} size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.editorTitle}>{activity.hi}</Text>
              <Text style={s.editorSub}>{activity.en}</Text>
            </View>
          </View>

          <TextInput
            style={s.editorInput}
            value={text}
            onChangeText={setText}
            placeholder="यहाँ सामग्री लिखें..."
            placeholderTextColor={COLORS.inkLight}
            multiline
            textAlignVertical="top"
          />

          <View style={s.modalActions}>
            <TouchableOpacity style={[s.modalBtn, { backgroundColor: '#E7E5E4' }]} onPress={onClose}>
              <Text style={[s.modalBtnTxt, { color: COLORS.inkSoft }]}>रद्द करें</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.modalBtn, { backgroundColor: COLORS.green }]}
              onPress={() => onSave(text.trim())}
            >
              <Text style={s.modalBtnTxt}>सहेजें</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ============== MAIN SCREEN ==============
export default function PrayerActivitiesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isAdmin } = useAuth();
  const [date, setDate] = useState(todayISO());
  const [entry, setEntry] = useState(null);      // { pledge: '...', almanac: '...', ... } or null
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editing, setEditing] = useState(null);  // activity object

  // student initial load: jump to latest filled date
  // admin initial load: stay on today
  useEffect(() => {
    (async () => {
      if (!isAdmin) {
        try {
          const snap = await getDocs(collection(db, 'prayerEntries'));
          if (!snap.empty) {
            // pick the doc with the largest ID (ISO date sorts lexicographically = chronologically)
            const latest = snap.docs
              .map(d => ({ id: d.id, data: d.data() }))
              .sort((a, b) => b.id.localeCompare(a.id))[0];
            setDate(latest.id);
            setEntry(latest.data);
          }
        } catch (e) {
          console.warn('prayer load latest failed', e);
        }
        setLoading(false);
      } else {
        loadDate(date);
      }
    })();
  }, []);

  const loadDate = useCallback(async (iso) => {
    setLoading(true);
    try {
      const ref = doc(db, 'prayerEntries', iso);
      const snap = await getDoc(ref);
      setEntry(snap.exists() ? snap.data() : null);
    } catch (e) {
      console.warn('prayer load failed', e);
      setEntry(null);
    }
    setLoading(false);
  }, []);

  const onPickDate = (iso) => {
    setPickerOpen(false);
    setDate(iso);
    loadDate(iso);
  };

  const saveField = async (text) => {
    if (!editing) return;
    setSaving(true);
    try {
      const ref = doc(db, 'prayerEntries', date);
      const next = { ...(entry || {}), [editing.key]: text, updated_at: new Date().toISOString() };
      await setDoc(ref, next, { merge: true });
      setEntry(next);
      setEditing(null);
    } catch (e) {
      Alert.alert('सहेजने में त्रुटि', e.message || 'पुनः प्रयास करें।');
    }
    setSaving(false);
  };

  // For students: only show activities that have content. For admin: show all 10.
  const visibleActivities = isAdmin
    ? ACTIVITIES
    : ACTIVITIES.filter(a => entry && entry[a.key] && entry[a.key].trim());

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top:10,bottom:10,left:10,right:10 }}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={s.topTitle}>प्रार्थना गतिविधियां</Text>
          <Text style={s.topSub}>Prayer Activities</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Date header — tap to change (admin only) */}
      <View style={s.dateBar}>
        <TouchableOpacity
          activeOpacity={isAdmin ? 0.7 : 1}
          onPress={isAdmin ? () => setPickerOpen(true) : undefined}
          style={s.dateBarInner}
        >
          <View style={s.dateIcon}>
            <Ionicons name="calendar" size={22} color={COLORS.saffronLight} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.dateLabel}>{isAdmin ? 'चयनित तिथि' : 'दिनांक'}</Text>
            <Text style={s.dateValue}>{formatHindiDate(date)}</Text>
          </View>
          {isAdmin && (
            <View style={s.dateChevron}>
              <Ionicons name="chevron-down" size={20} color={COLORS.saffronLight} />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={COLORS.saffron} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Admin hint */}
          {isAdmin && (
            <View style={s.adminHint}>
              <Ionicons name="information-circle" size={18} color={COLORS.navyDark} />
              <Text style={s.adminHintText}>किसी गतिविधि पर टैप करके सामग्री जोड़ें या संपादित करें</Text>
            </View>
          )}

          {/* Empty state — students */}
          {!isAdmin && visibleActivities.length === 0 && (
            <View style={s.empty}>
              <Ionicons name="document-text-outline" size={60} color={COLORS.inkLight} />
              <Text style={s.emptyTitle}>आज की प्रार्थना सामग्री अभी उपलब्ध नहीं है</Text>
              <Text style={s.emptySub}>कृपया बाद में पुनः जाँचें।</Text>
            </View>
          )}

          {/* Activity cards */}
          {visibleActivities.map((a, i) => {
            const content = entry && entry[a.key];
            const hasContent = content && content.trim();
            const card = (
              <View key={a.key} style={s.activityCard}>
                <LinearGradient
                  colors={hasContent ? ['#1A3A6B', '#2D5AA0'] : ['#3A3A3A', '#555555']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={s.activityHeader}
                >
                  <View style={s.activityNum}><Text style={s.activityNumText}>{i + 1}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.activityHi}>{a.hi}</Text>
                    <Text style={s.activityEn}>{a.en}</Text>
                  </View>
                  {isAdmin && (
                    <Ionicons
                      name={hasContent ? 'create' : 'add-circle'}
                      size={22}
                      color="#FED7AA"
                    />
                  )}
                </LinearGradient>
                <View style={s.activityBody}>
                  {hasContent ? (
                    <Text style={s.activityContent}>{content}</Text>
                  ) : (
                    <Text style={s.activityPlaceholder}>
                      {isAdmin ? 'सामग्री जोड़ने के लिए टैप करें' : 'अभी उपलब्ध नहीं'}
                    </Text>
                  )}
                </View>
              </View>
            );

            return isAdmin ? (
              <TouchableOpacity key={a.key} activeOpacity={0.85} onPress={() => setEditing(a)}>
                {card}
              </TouchableOpacity>
            ) : card;
          })}

          <View style={{ height: 30 }} />
        </ScrollView>
      )}

      {/* Date picker */}
      <DatePickerModal
        visible={pickerOpen}
        initialDate={date}
        onPick={onPickDate}
        onClose={() => setPickerOpen(false)}
      />

      {/* Field editor */}
      <FieldEditorModal
        visible={!!editing}
        activity={editing}
        value={editing && entry ? entry[editing.key] : ''}
        onSave={saveField}
        onClose={() => setEditing(null)}
      />

      {saving && (
        <View style={s.savingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: '#fff', marginTop: 10, fontFamily: 'NotoSansDevanagari_700Bold' }}>सहेज रहे हैं...</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.cream },

  topBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.navyPrimary,
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  topTitle: { color: '#fff', fontSize: 18, fontFamily: 'NotoSansDevanagari_700Bold' },
  topSub:   { color: COLORS.saffronLight, fontSize: 11, marginTop: 2 },

  dateBar: { backgroundColor: COLORS.navyDark, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 22 },
  dateBarInner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16, padding: 14,
  },
  dateIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(254,215,170,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  dateLabel: { color: COLORS.saffronLight, fontSize: 11, fontFamily: 'NotoSansDevanagari_400Regular', letterSpacing: 1 },
  dateValue: { color: '#fff', fontSize: 16, fontFamily: 'NotoSansDevanagari_700Bold', marginTop: 2 },
  dateChevron: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { padding: 16, paddingTop: 18 },

  adminHint: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FED7AA', borderRadius: 12, padding: 12, marginBottom: 14,
  },
  adminHintText: { flex: 1, color: COLORS.navyDark, fontSize: 12, fontFamily: 'NotoSansDevanagari_400Regular' },

  empty: { alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 15, color: COLORS.inkSoft, fontFamily: 'NotoSansDevanagari_700Bold', marginTop: 14, textAlign: 'center' },
  emptySub:   { fontSize: 12, color: COLORS.inkLight, marginTop: 6 },

  activityCard: {
    marginBottom: 14, borderRadius: 16, overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  activityHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  activityNum: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  activityNumText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  activityIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  activityHi: { color: '#fff', fontSize: 15, fontFamily: 'NotoSansDevanagari_700Bold', lineHeight: 20 },
  activityEn: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 1, letterSpacing: 0.3 },

  activityBody: { padding: 16, paddingTop: 16 },
  activityContent:     { color: COLORS.ink, fontSize: 14, fontFamily: 'NotoSansDevanagari_400Regular', lineHeight: 22 },
  activityPlaceholder: { color: COLORS.inkLight, fontSize: 13, fontFamily: 'NotoSansDevanagari_400Regular', fontStyle: 'italic' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // modals
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, paddingBottom: 28 },
  modalTitle: { fontSize: 18, fontFamily: 'NotoSansDevanagari_700Bold', color: COLORS.navyPrimary, marginBottom: 8 },
  modalSub: { fontSize: 12, color: COLORS.inkSoft, fontFamily: 'NotoSansDevanagari_400Regular', marginTop: 14, marginBottom: 6 },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18, backgroundColor: '#F5F5F4', borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.navyPrimary, borderColor: COLORS.navyPrimary },
  chipTxt: { color: COLORS.ink, fontSize: 13, fontFamily: 'NotoSansDevanagari_400Regular' },
  chipActiveTxt: { color: '#fff', fontWeight: '700' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 22 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalBtnTxt: { color: '#fff', fontSize: 15, fontFamily: 'NotoSansDevanagari_700Bold' },

  // editor
  editorHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  editorIcon: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: COLORS.navyPrimary,
    alignItems: 'center', justifyContent: 'center',
  },
  editorTitle: { fontSize: 17, fontFamily: 'NotoSansDevanagari_700Bold', color: COLORS.navyPrimary },
  editorSub:   { fontSize: 11, color: COLORS.inkLight, marginTop: 2, letterSpacing: 0.3 },
  editorInput: {
    minHeight: 160, maxHeight: 300,
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, padding: 14,
    fontSize: 14, fontFamily: 'NotoSansDevanagari_400Regular', color: COLORS.ink,
    backgroundColor: COLORS.paper,
  },

  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },
});
