import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CategoriesScreen() {
  const router = useRouter();

  // ข้อมูลหมวดหมู่
  const categoriesData = [
    { id: '1', name: 'Bottoms', items: '49 items', icon: 'tshirt-crew' },
    { id: '2', name: 'Coats', items: '23 items', icon: 'roller-skate' }, 
    { id: '3', name: 'Jeans', items: '11 items', icon: 'hat-fedora' }, 
    { id: '4', name: 'Watches', items: '7 items', icon: 'watch' }, 
    { id: '5', name: 'Tops', items: '7 items', icon: 'backpack' },
  ];

  return (
    <View style={styles.container}>
      {/* 📌 Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/modal' as any)}>
          <Feather name="menu" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Categories</Text>
        
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => router.push('/settings' as any)}
        >
          <Feather name="user" size={22} color="#F8FAFC" />
        </TouchableOpacity>
      </View>

      {/* 📌 รายการหมวดหมู่ (FlatList) */}
      <FlatList
        data={categoriesData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.categoryCard}
            onPress={() => router.push(`/product?category=${encodeURIComponent(item.name)}` as any)}
          >
            {/* กล่องใส่ไอคอน */}
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name={item.icon as any} size={28} color="#D4AF37" />
            </View>
            
            {/* ข้อความชื่อหมวดหมู่และจำนวน items */}
            <View style={styles.textContainer}>
              <Text style={styles.categoryName}>{item.name}</Text>
              <Text style={styles.categoryItems}>{item.items}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* 📌 Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)' as any)}>
          <Ionicons name="home-outline" size={22} color="#94A3B8" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/add' as any)}>
          <Ionicons name="add-circle-outline" size={22} color="#94A3B8" />
          <Text style={styles.navText}>Add</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/product' as any)}>
          <Ionicons name="bag-outline" size={22} color="#94A3B8" />
          <Text style={styles.navText}>Products</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/categories' as any)}>
          <Ionicons name="grid" size={22} color="#D4AF37" />
          <Text style={[styles.navText, { color: '#D4AF37', fontWeight: '700' }]}>Categories</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', 
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 30 : 50,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 100, 
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B', 
    padding: 16,
    borderRadius: 16, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#0F172A', 
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  textContainer: {
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  categoryItems: {
    fontSize: 13,
    color: '#94A3B8',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 11,
    marginTop: 2,
    color: '#94A3B8',
    fontWeight: '500',
  },
});