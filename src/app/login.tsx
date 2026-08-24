import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // URL API สำหรับ Login
  const API_URL = 'http://119.59.102.161:3033/api/login';

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอก Username และ Password');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success && data.user) {
        login(data.user);
        const goHome = () => router.replace('/(tabs)');

        if (Platform.OS === 'web') {
          goHome();
        } else {
          Alert.alert('สำเร็จ', 'เข้าสู่ระบบเรียบร้อยแล้ว', [{ text: 'ตกลง', onPress: goHome }]);
        }
      } else {
        const msg = data.message || 'Username หรือ Password ไม่ถูกต้อง';
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('เข้าสู่ระบบไม่สำเร็จ', msg);
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      if (Platform.OS === 'web') window.alert('ไม่สามารถเชื่อมต่อกับ Server ได้');
      else Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับ Server ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <View style={styles.cardContainer}>
        {/* โลโก้แอป */}
        <View style={styles.logoWrapper}>
          <Text style={styles.brandTitle}>CHRONO</Text>
          <Text style={styles.brandSubTitle}>TIC-TAC & CO.</Text>
        </View>

        {/* ฟอร์มกรอกข้อมูล */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              nativeID="login-username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder="Enter username"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              nativeID="login-password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholder="Enter password"
              placeholderTextColor="#64748B"
            />
          </View>
        </View>

        {/* ปุ่มกดเข้าสู่ระบบ */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#0F172A" />
            ) : (
              <Text style={styles.buttonText}>Log in</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerLink} onPress={() => router.push('/register')}>
            <Text style={styles.registerLinkText}>Don't have an account? Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: '90%',
    maxWidth: 400,
    height: '85%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '300',
    letterSpacing: 4,
    color: '#D4AF37',
  },
  brandSubTitle: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: 4,
    color: '#94A3B8',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  registerLinkText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});