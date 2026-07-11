import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MenuModalScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4C0099" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.logoText}>Inventor.io</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.menuList}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.menuText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.replace('/product')}>
          <Text style={styles.menuText}>Products</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.replace('/categories')}>
          <Text style={styles.menuText}>Categories</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.replace('/stores')}>
          <Text style={styles.menuText}>Stores</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.replace('/finances')}>
          <Text style={styles.menuText}>Finances</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.replace('/settings')}>
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/login')}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4C0099',
    paddingHorizontal: 24,
    paddingTop: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
  },
  closeButton: {
    padding: 4,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  menuList: {
    alignItems: 'center',
    gap: 24,
    marginVertical: 40,
  },
  menuItem: {
    paddingVertical: 4,
    width: '100%',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  logoutText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
    opacity: 0.9,
  },
});