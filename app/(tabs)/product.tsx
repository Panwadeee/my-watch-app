import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProductsScreen() {
  const router = useRouter(); 
  const { category } = useLocalSearchParams();

  const PRODUCTS_URL = 'https://raw.githubusercontent.com/Panwadeee/my-watch-app/refs/heads/main/products.json';

  const [productsData, setProductsData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setErrorMsg(null);
        
        const response = await fetch(PRODUCTS_URL);
        
        if (!response.ok) {
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setProductsData(data); 
      } catch (error: any) {
        console.error("Error fetching products:", error);
        setErrorMsg(error.message || "Cannot fetch online data");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const displayedProducts = category
    ? productsData.filter((item) => item.category.toLowerCase() === category.toLowerCase())
    : productsData;

  return (
    <View style={styles.container}>
      {/* 📌 ROW 1: Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.push('/modal')}>
          <Feather name="menu" size={26} color="#6200EE" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{category ? category : 'Products'}</Text>
        
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/settings')}
        >
          <Feather name="user" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* 📌 ROW 2: Tool Bar */}
      <View style={styles.toolBarRow}>
        <TouchableOpacity>
          <Feather name="search" size={26} color="#6200EE" />
        </TouchableOpacity>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/(tabs)/add')}>
            <Text style={styles.addButtonText}>+ Add Product</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Filter </Text>
            <MaterialIcons name="filter-alt" size={16} color="#6200EE" />
          </TouchableOpacity>
        </View>
      </View>

      {/* สถานะการโหลด */}
      {loading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6200EE" />
          <Text style={{ marginTop: 10, color: '#666' }}>กำลังโหลดข้อมูลสินค้าจากระบบออนไลน์...</Text>
        </View>
      )}

      {/* กรณีโหลดผิดพลาด */}
      {errorMsg && (
        <View style={styles.centerContainer}>
          <Text style={{ color: 'red', fontWeight: 'bold' }}>เกิดข้อผิดพลาด!</Text>
          <Text style={{ color: '#666', fontSize: 13, textAlign: 'center', marginTop: 4 }}>{errorMsg}</Text>
        </View>
      )}

      {/* 📌 3. รายการสินค้า */}
      {!loading && !errorMsg && (
        <FlatList
          data={displayedProducts} 
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={{ color: '#999' }}>ไม่มีรายการสินค้าที่จะแสดงผล</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <View style={styles.cardTopSection}>
                <Image source={{ uri: item.image }} style={styles.productImage} />
                <View style={styles.detailsContainer}>
                  <Text style={styles.detailText}><Text style={styles.labelBold}>Stock:</Text> {item.stock}</Text>
                  <Text style={styles.detailText}><Text style={styles.labelBold}>Category:</Text> {item.category}</Text>
                  <Text style={styles.detailText}><Text style={styles.labelBold}>Location:</Text> {item.location}</Text>
                  <View style={styles.statusRow}>
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>{item.status}</Text>
                    </View>
                    <TouchableOpacity style={styles.arrowButton}>
                      <Feather name="chevron-right" size={16} color="#6200EE" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <Text style={styles.productName}>{item.name}</Text>
            </View>
          )}
        />
      )}

      {/* 📌 4. Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)')}>
          <Ionicons name="home-outline" size={22} color="#A78BFA" />
          <Text style={[styles.navText, { color: '#A78BFA' }]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/add')}>
          <Ionicons name="add-circle-outline" size={22} color="#A78BFA" />
          <Text style={[styles.navText, { color: '#A78BFA' }]}>Add</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/product')}>
          <Ionicons name="bag" size={22} color="#6200EE" />
          <Text style={[styles.navText, { color: '#6200EE', fontWeight: '700' }]}>Products</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/categories')}>
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
    backgroundColor: '#F5F5F7',
    paddingHorizontal: 20,
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
  toolBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addButton: {
    backgroundColor: '#4A00B4',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  filterButton: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  filterButtonText: {
    color: '#6200EE',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 90,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  productCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#F0EFFF',
    marginBottom: 16,
  },
  cardTopSection: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  productImage: {
    width: 130,
    height: 130,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  detailsContainer: {
    flex: 1,
    paddingLeft: 16,
    justifyContent: 'center',
  },
  labelBold: {
    fontWeight: '400',
    color: '#6B7280',
  },
  detailText: {
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  activeBadge: {
    backgroundColor: '#A78BFA',
    paddingVertical: 6,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  activeBadgeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  arrowButton: {
    width: 28,
    height: 28,
    backgroundColor: '#EEE7FF',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 4,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
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