import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4C0099" />
      
      <View style={styles.cardContainer}>
        {/* โลโก้แอป */}
        <View style={styles.logoWrapper}>
          <Text style={styles.logoBgText}>Inventor.io</Text>
          <Text style={styles.logoFrontText}>Inventor.io</Text>
        </View>

        {/* ฟอร์มกรอกข้อมูล */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              placeholder="Username"
              placeholderTextColor="#CCCCCC"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholder="Password"
              placeholderTextColor="#CCCCCC"
            />
          </View>
        </View>

        {/* ปุ่มกดเข้าสู่ระบบ */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    width: '90%',
    height: '85%',
    backgroundColor: '#4C0099', 
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  logoBgText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.1)',
    position: 'absolute',
  },
  logoFrontText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333333',
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#4C0099',
    fontSize: 18,
    fontWeight: 'bold',
  },
});