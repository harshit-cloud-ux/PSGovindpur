import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  Animated, Dimensions, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

const { width } = Dimensions.get('window');
const PANEL_W = width * 0.78;

export default function SidePanel({ visible, onClose, onLoginPress }) {
  const insets = useSafeAreaInsets();
  const { isAdmin, user, logout } = useAuth();
  const slideX = useRef(new Animated.Value(PANEL_W)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideX, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideX, { toValue: PANEL_W, duration: 220, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[s.backdrop, { opacity: fade }]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[s.panel, { transform: [{ translateX: slideX }] }]}>
        <LinearGradient
          colors={['#060F24', '#0F2347', '#1A3A6B']}
          style={[s.panelInner, { paddingTop: insets.top + 20 }]}
        >
          <View style={s.header}>
            <View style={s.avatar}>
              <Ionicons
                name={isAdmin ? 'shield-checkmark' : 'person-circle-outline'}
                size={42}
                color={COLORS.gold}
              />
            </View>
            <Text style={s.headerName}>
              {isAdmin ? 'व्यवस्थापक' : 'अतिथि'}
            </Text>
            <Text style={s.headerEng}>
              {isAdmin ? (user?.email || 'Admin') : 'Guest'}
            </Text>
          </View>

          <View style={s.divider} />

          {!isAdmin ? (
            <TouchableOpacity style={s.item} onPress={onLoginPress} activeOpacity={0.7}>
              <Ionicons name="log-in-outline" size={22} color={COLORS.saffronLight} />
              <View style={{ flex: 1 }}>
                <Text style={s.itemText}>व्यवस्थापक लॉगिन</Text>
                <Text style={s.itemEng}>Login as Admin</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={s.item} onPress={handleLogout} activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={22} color="#FCA5A5" />
              <View style={{ flex: 1 }}>
                <Text style={[s.itemText, { color: '#FCA5A5' }]}>लॉगआउट</Text>
                <Text style={s.itemEng}>Logout</Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={s.footer}>
            <Text style={s.footerText}>P.S. Govindpur</Text>
            <Text style={s.footerSub}>Version 1.0  ·  Phase 2</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  panel: {
    position: 'absolute', top: 0, right: 0, bottom: 0, width: PANEL_W,
    elevation: 12, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 16,
  },
  panelInner: { flex: 1, paddingHorizontal: 20 },
  header: { alignItems: 'center', paddingVertical: 20 },
  avatar: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 2, borderColor: COLORS.gold,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  headerName: { color: '#fff', fontSize: 18, fontFamily: 'NotoSansDevanagari_700Bold' },
  headerEng: { color: COLORS.saffronLight, fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 14 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12,
  },
  itemText: { color: '#fff', fontSize: 15, fontFamily: 'NotoSansDevanagari_700Bold' },
  itemEng: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 },
  footer: { position: 'absolute', bottom: 30, left: 20, right: 20, alignItems: 'center' },
  footerText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: 'NotoSansDevanagari_700Bold' },
  footerSub: { color: 'rgba(255,255,255,0.35)', fontSize: 10, marginTop: 3 },
});