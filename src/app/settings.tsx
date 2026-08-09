import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  
  const [selectedRole, setSelectedRole] = useState('Manager');
  const [permissions, setPermissions] = useState({
    customer: true,
    product: true,
    user: true,
  });

  const togglePermission = (key: 'customer' | 'product' | 'user') => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const roles = ['Manager', 'Editor', 'Supplier', 'Seller', 'Admin', 'Finance'];

  return (
    <View style={styles.container}>
      {/* 📌 ROW 1: Header (Menu, Title, Profile) */}
      <View style={styles.headerRow}>
        {/* ผูกคำสั่งให้กดแล้วลิงก์ไปยังหน้าจอโมดอลสีม่วงสำเร็จ */}
        <TouchableOpacity onPress={() => router.push('/modal')}>
          <Feather name="menu" size={26} color="#6200EE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.profileButtonActive}>
          <Feather name="user" size={22} color="#FFF" /> 
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 🟣 SECTION 1: Personal Settings */}
        <Text style={styles.sectionTitle}>Personal settings</Text>
        <View style={styles.personalCard}>
          <View style={styles.fieldHeader}>
            <Text style={styles.fieldLabel}>Name*</Text>
            <TouchableOpacity><Feather name="edit-2" size={18} color="#000" /></TouchableOpacity>
          </View>
          <Text style={styles.fieldValue}>John Hopkins</Text>

          <Text style={styles.fieldLabel}>Company email*</Text>
          <Text style={styles.fieldValue}>j.hopkins@inventor.io</Text>

          <Text style={styles.fieldLabel}>Account password*</Text>
          <Text style={styles.fieldValue}>********************</Text>

          <Text style={styles.fieldLabel}>Store</Text>
          <Text style={styles.fieldValue}>Leicester, UK</Text>

          <Text style={styles.fieldLabel}>Employee code</Text>
          <Text style={styles.fieldValue}>94-K-6764-LEI</Text>
        </View>

        {/* ⚪ SECTION 2: Current Role Selection */}
        <View style={styles.roleCard}>
          <View style={styles.fieldHeader}>
            <Text style={[styles.fieldLabel, { color: '#6200EE', fontWeight: '600' }]}>Current role</Text>
            <TouchableOpacity><Feather name="edit-2" size={18} color="#000" /></TouchableOpacity>
          </View>
          
          {roles.map((role) => (
            <TouchableOpacity 
              key={role} 
              style={styles.checkboxRow}
              onPress={() => setSelectedRole(role)}
            >
              <View style={[
                styles.checkbox, 
                selectedRole === role && styles.checkboxChecked
              ]}>
                {selectedRole === role && <Feather name="check" size={12} color="#6200EE" />}
              </View>
              <Text style={[
                styles.roleText, 
                selectedRole === role && styles.roleTextActive
              ]}>
                {role}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 🟣 SECTION 3: Role Management */}
        <Text style={styles.sectionTitle}>Role</Text>
        <View style={styles.permissionCard}>
          <View style={styles.permissionRow}>
            <Text style={styles.permissionText}>Customer</Text>
            <View style={styles.permissionActions}>
              <Feather name="check" size={16} color="#000" style={styles.checkIcon} />
              <Switch 
                value={permissions.customer} 
                onValueChange={() => togglePermission('customer')}
                trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
                thumbColor={permissions.customer ? '#6200EE' : '#F3F4F6'}
              />
              <TouchableOpacity style={{ marginLeft: 16 }}>
                <Feather name="edit-2" size={16} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.permissionRow}>
            <Text style={styles.permissionText}>Product</Text>
            <View style={styles.permissionActions}>
              <Feather name="check" size={16} color="#000" style={styles.checkIcon} />
              <Switch 
                value={permissions.product} 
                onValueChange={() => togglePermission('product')}
                trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
                thumbColor={permissions.product ? '#6200EE' : '#F3F4F6'}
              />
              <View style={{ width: 16, marginLeft: 16 }} />
            </View>
          </View>

          <View style={styles.permissionRow}>
            <Text style={styles.permissionText}>User</Text>
            <View style={styles.permissionActions}>
              <Feather name="check" size={16} color="#000" style={styles.checkIcon} />
              <Switch 
                value={permissions.user} 
                onValueChange={() => togglePermission('user')}
                trackColor={{ false: '#D1D5DB', true: '#A78BFA' }}
                thumbColor={permissions.user ? '#6200EE' : '#F3F4F6'}
              />
              <View style={{ width: 16, marginLeft: 16 }} />
            </View>
          </View>
        </View>

      </ScrollView>

      {/* 📌 4. Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/')}>
          <Ionicons name="home-outline" size={22} color="#A78BFA" />
          <Text style={[styles.navText, { color: '#A78BFA' }]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/add')}>
          <Ionicons name="add-circle-outline" size={22} color="#A78BFA" />
          <Text style={[styles.navText, { color: '#A78BFA' }]}>Add</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/product')}>
          <Ionicons name="bag-outline" size={22} color="#A78BFA" />
          <Text style={[styles.navText, { color: '#A78BFA' }]}>Product</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/categories')}>
          <Ionicons name="shapes-outline" size={22} color="#A78BFA" />
          <Text style={[styles.navText, { color: '#A78BFA' }]}>Categories</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: 50,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  profileButtonActive: {
    width: 44,
    height: 44,
    backgroundColor: '#6200EE',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginTop: 12,
    marginBottom: 16,
  },
  personalCard: {
    backgroundColor: '#EAE5FF',
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 20,
  },
  roleCard: {
    backgroundColor: '#F5F5F7',
    padding: 24,
    borderRadius: 24,
    marginBottom: 28,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: '#A78BFA',
    borderRadius: 6,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  checkboxChecked: {
    borderColor: '#6200EE',
  },
  roleText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  roleTextActive: {
    color: '#6200EE',
    fontWeight: '600',
  },
  permissionCard: {
    borderWidth: 1.5,
    borderColor: '#A78BFA',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  permissionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  permissionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginRight: 16,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
  },
});