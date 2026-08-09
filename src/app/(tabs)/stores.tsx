import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WatchStoresScreen() {
  // ข้อมูลจำลองร้านค้าขายนาฬิกาตามสาขาต่างๆ พร้อมรูปภาพสินค้าประเภทนาฬิกา
  const storesData = [
    {
      id: 1,
      name: 'Manchester, UK',
      // คุณสามารถเปลี่ยนเป็น URL รูปภาพนาฬิกาจริงของคุณได้ที่นี่
      imageUri: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300&auto=format&fit=crop', 
      isActive: true, // กล่องแรกไฮไลท์สีม่วงพาสเทลตามรูป
    },
    {
      id: 2,
      name: 'Yorkshire, UK',
      imageUri: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=300&auto=format&fit=crop',
      isActive: false,
    },
    {
      id: 3,
      name: 'Hull, UK',
      imageUri: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=300&auto=format&fit=crop',
      isActive: false,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* 1. Header ด้านบนสุด */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#4A148C" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Stores</Text>
        
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-outline" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* 2. แถบเครื่องมือค้นหา และ ปุ่ม Action ต่างๆ */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.searchButton}>
          <Feather name="search" size={24} color="#6200EE" />
        </TouchableOpacity>

        <View style={styles.rightActions}>
          {/* ปุ่ม + Add Product */}
          <TouchableOpacity style={styles.addProductButton} activeOpacity={0.8}>
            <Text style={styles.addProductText}>+ Add Product</Text>
          </TouchableOpacity>

          {/* ปุ่ม Filter */}
          <TouchableOpacity style={styles.filterButton} activeOpacity={0.8}>
            <Text style={styles.filterText}>Filter </Text>
            <MaterialCommunityIcons name="filter-variant" size={16} color="#6200EE" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. รายชื่อร้านค้าเลื่อนได้ */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {storesData.map((store) => (
          <TouchableOpacity
            key={store.id}
            style={[
              styles.storeCard,
              store.isActive ? styles.activeCard : styles.inactiveCard
            ]}
            activeOpacity={0.9}
          >
            {/* รูปภาพนาฬิกาประจำสาขา */}
            <Image 
              source={{ uri: store.imageUri }} 
              style={styles.storeImage} 
              resizeMode="cover"
            />
            
            {/* ชื่อสาขา */}
            <Text style={styles.storeName}>{store.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 70,
    backgroundColor: '#FFFFFF',
  },
  menuButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  profileButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginVertical: 16,
  },
  searchButton: {
    padding: 4,
  },
  rightActions: {
    flexDirection: 'row',
    gap: 10,
  },
  addProductButton: {
    backgroundColor: '#4A148C',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addProductText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  filterButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterText: {
    color: '#6200EE',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 16,
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    height: 120,
  },
  activeCard: {
    backgroundColor: '#EDE7F6', // สีม่วงพาสเทลอ่อนสำหรับไอเทมแรกที่ถูกเลือก
    borderWidth: 1,
    borderColor: '#D1C4E9',
  },
  inactiveCard: {
    backgroundColor: '#F5F5F7', // สีเทาอ่อนมนๆ สำหรับไอเทมทั่วไป
  },
  storeImage: {
    width: 110,
    height: 88,
    borderRadius: 18,
    backgroundColor: '#D1C4E9', // แบคกราวด์สำรองระหว่างโหลดรูป
  },
  storeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginLeft: 20,
    flex: 1,
  },
});