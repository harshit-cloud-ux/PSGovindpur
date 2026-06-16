import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

export default function LoginScreen({ onClose }) {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('त्रुटि / Error', 'कृपया ईमेल और पासवर्ड दोनों दर्ज करें');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      onClose();
    } catch (err) {
      Alert.alert(
        'लॉगिन विफल / Login Failed',
        err.code === 'auth/invalid-credential'
          ? 'गलत ईमेल या पासवर्ड / Invalid email or password'
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <LinearGradient
        colors={['#060F24', '#0F2347', '#1A3A6B']}
        style={[s.root, { paddingTop: insets.top + 20 }]}
      >
        <TouchableOpacity style={s.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        <View style={s.header}>
          <View style={s.iconCircle}>
            <Ionicons name="shield-checkmark" size={40} color={COLORS.gold} />
          </View>
          <Text style={s.title}>व्यवस्थापक लॉगिन</Text>
          <Text style={s.subtitle}>Admin Login</Text>
        </View>

        <View style={s.form}>
          <View style={s.inputWrap}>
            <Ionicons name="mail-outline" size={20} color={COLORS.saffronLight} style={s.inputIcon} />
            <TextInput
              style={s.input}
              placeholder="ईमेल / Email"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          <View style={s.inputWrap}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.saffronLight} style={s.inputIcon} />
            <TextInput
              style={s.input}
              placeholder="पासवर्ड / Password"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[s.submitBtn, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.submitText}>लॉगिन करें  ·  Login</Text>}
          </TouchableOpacity>
        </View>

        <Text style={s.footer}>केवल अधिकृत व्यवस्थापक  ·  Authorized Admins Only</Text>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24 },
  closeBtn: { alignSelf: 'flex-end', padding: 8 },
  header: { alignItems: 'center', marginTop: 30, marginBottom: 40 },
  iconCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 2, borderColor: COLORS.gold,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  title: { color: '#fff', fontSize: 26, fontFamily: 'NotoSansDevanagari_700Bold', textAlign: 'center' },
  subtitle: { color: COLORS.saffronLight, fontSize: 14, marginTop: 4, letterSpacing: 1 },
  form: { gap: 14 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#fff', fontSize: 15, paddingVertical: 14 },
  submitBtn: {
    backgroundColor: COLORS.saffron, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 10,
    elevation: 4, shadowColor: COLORS.saffron, shadowOpacity: 0.4, shadowRadius: 8,
  },
  submitText: { color: '#fff', fontSize: 16, fontFamily: 'NotoSansDevanagari_700Bold', letterSpacing: 0.5 },
  footer: {
    position: 'absolute', bottom: 30, left: 0, right: 0,
    textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 11,
  },
});