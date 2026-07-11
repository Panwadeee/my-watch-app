import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // 1. นำเข้า useRouter สำหรับจัดการลิงก์
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CategoriesScreen() {
  const router = useRouter(); // 2. ประกาศตัวแปรเรียกใช้งาน router

  // ข้อมูลหมวดหมู่จำลองตามรูปภาพ
  const categoriesData = [
    { id: '1', name: 'Bottoms', items: '49 items', icon: 'tshirt-crew', iconType: 'MaterialCommunityIcons' },
    { id: '2', name: 'Coats', items: '23 items', icon: 'roller-skate', iconType: 'MaterialCommunityIcons' }, 
    { id: '3', name: 'Jeans', items: '11 items', icon: 'hat-fedora', iconType: 'MaterialCommunityIcons' }, 
    { id: '4', name: 'Watches', items: '7 items', icon: 'watch', iconType: 'MaterialCommunityIcons' }, // เปลี่ยนไอคอนให้ตรงกับนาฬิกา
    { id: '5', name: 'Tops', items: '7 items', icon: 'backpack', iconType: 'MaterialCommunityIcons' },
  ];

  // ฟังก์ชันสลับไอคอนให้ตรงตามแต่ละหมวดหมู่
  const renderIcon = (item) => {
    return <MaterialCommunityIcons name={item.icon} size={32} color="#6200EE" />;
  };

  return (
    <View style={styles.container}>
      {/* 📌 ROW 1: Header (Menu, Title, Profile) */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.push('/modal')}>
          <Feather name="menu" size={26} color="#6200EE" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Categories</Text>
        
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/settings')}
        >
          <Feather name="user" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* 📌 2. รายการหมวดหมู่ (FlatList) */}
      <FlatList
        data={categoriesData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.categoryCard}
            // ✨ แก้วิธีการส่งข้อมูลตรงนี้ใหม่ทั้งหมด โดยเปลี่ยนเป็น String URL แบบส่ง Query Parameter ตรงตัว 
            onPress={() => router.push(`/product?category=${encodeURIComponent(item.name)}`)}
          >
            {/* กล่องใส่ไอคอนสีม่วงอ่อน */}
            <View style={styles.iconContainer}>
              {renderIcon(item)}
            </View>
            
            {/* ข้อความชื่อหมวดหมู่และจำนวน items */}
            <View style={styles.textContainer}>
              <Text style={styles.categoryName}>{item.name}</Text>
              <Text style={styles.categoryItems}>{item.items}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* 📌 3. Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
          <Ionicons name="home-outline" size={22} color="#A78BFA" />
          <Text style={[styles.navText, { color: '#A78BFA' }]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/add')}>
          <Ionicons name="add-circle-outline" size={22} color="#A78BFA" />
          <Text style={[styles.navText, { color: '#A78BFA' }]}>Add</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/product')}>
          <Ionicons name="bag-outline" size={22} color="#A78BFA" />
          <Text style={[styles.navText, { color: '#A78BFA' }]}>Products</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/categories')}>
          <Ionicons name="shapes" size={22} color="#6200EE" />
          <Text style={[styles.navText, { color: '#6200EE', fontWeight: '700' }]}>Categories</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF', 
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  profileButton: {
    width: 44,
    height: 44,
    backgroundColor: '#6200EE',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 120, 
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F7', 
    padding: 20,
    borderRadius: 24, 
    marginBottom: 20,
  },
  iconContainer: {
    width: 76,
    height: 76,
    backgroundColor: '#EAE5FF', 
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  textContainer: {
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  categoryItems: {
    fontSize: 16,
    color: '#9CA3AF',
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