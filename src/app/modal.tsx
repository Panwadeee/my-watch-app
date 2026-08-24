import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';

export default function MenuModalScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    const doLogout = () => {
      logout();
      router.replace('/login');
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) doLogout();
      return;
    }

    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: doLogout },
    ]);
  };

  return (
    <View style={styles.modalOverlay}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0, 0, 0, 0.6)" />
      
      <View style={styles.menuCard}>
        {/* Header ของ Modal */}
        <View style={styles.menuHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="x" size={26} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.menuHeaderTitle}>Inventor. io</Text>
          <View style={{ width: 26 }} />
        </View>

        {/* รายการเมนู */}
        <View style={styles.menuItemsContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.menuText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.replace('/product')}
          >
            <Text style={styles.menuText}>Products</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.replace('/categories')}
          >
            <Text style={styles.menuText}>Categories</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.replace('/stores')}
          >
            <Text style={styles.menuText}>Stores</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.replace('/finances')}
          >
            <Text style={styles.menuText}>Finances</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.replace('/settings')}
          >
            <Text style={styles.menuText}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* ปุ่ม Log out ด้านล่าง */}
        <View style={styles.menuFooter}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  menuCard: {
    width: '100%',
    height: '90%',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#334155',
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 4,
  },
  menuHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  menuItemsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItem: {
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  menuFooter: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  logoutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  logoutText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
  },
});