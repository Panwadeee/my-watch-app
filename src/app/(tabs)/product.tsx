import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProductScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams();

  const API_BASE_URL = 'http://119.59.102.161:3033/api';

  const [productsData, setProductsData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const apiCall = async (endpoint: string, options: any = {}) => {
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...options.headers,
      },
    };

    const targetUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const response = await fetch(targetUrl, config);

    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    return await response.json();
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const res = await apiCall('/products');

      const rawList = Array.isArray(res)
        ? res
        : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.products) ? res.products : []));

      const parsedData = rawList.map((item: any) => {
        // ดึง Primary Key จริงจาก Database (id หรือ Productcode)
        const dbId = item.id !== undefined && item.id !== null && item.id !== '' 
          ? String(item.id) 
          : String(item.Productcode || item.productCode || item.product_code || '');

        const pCode = String(item.Productcode || item.productCode || item.product_code || dbId);

        return {
          ...item,
          id: dbId,
          productCode: pCode,
          name: item.Name || item.name || item.product_name || 'ไม่มีชื่อสินค้า',
          stock: item.Stock ?? item.stock ?? item.quantity ?? 0,
          category: item.Category || item.category || item.category_name || 'General',
          location_text: item.Location || item.location_text || item.location || 'Default',
          brand: item.Brand || item.brand || 'Unnamed Brand',
          badge_status: item.Status || item.badge_status || item.status || 'Active',
          image_url: item.image || item.image_url || item.img || '',
          description: item.description || item.Description || '',
        };
      });

      setProductsData(parsedData);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setErrorMsg(err.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  // ฟังก์ชันส่งค่าไปยังหน้า Edit Product
  const handleEditProduct = (item: any) => {
    router.push({
      pathname: '/edit',
      params: {
        id: item.id,
        productCode: item.productCode,
        Productcode: item.productCode, // เพิ่มเผื่อหน้า Edit เรียกใช้ Key ตัวใหญ่
        name: item.name,
        stock: String(item.stock),
        category: item.category,
        location_text: item.location_text,
        badge_status: item.badge_status,
        image_url: item.image_url,
        description: item.description,
      },
    });
  };

  const displayedProducts = productsData
    .filter((item) => {
      if (!category) return true;
      return String(item.category).toLowerCase() === String(category).toLowerCase();
    })
    .filter((item) => {
      if (!searchQuery.trim()) return true;
      return (
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(item.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(item.productCode).toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/modal')}>
          <Feather name="menu" size={24} color="#6B21A8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category ? category : 'Products'}</Text>
        <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/settings')}>
          <Feather name="user" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Tool Bar */}
      <View style={styles.toolBarRow}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#A1A1AA" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#A1A1AA"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(tabs)/add')}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={fetchProducts} activeOpacity={0.6}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={{ marginTop: 12, color: '#71717A', fontSize: 14 }}>กำลังโหลดข้อมูลสินค้า...</Text>
        </View>
      )}

      {/* Error State */}
      {errorMsg && !loading && (
        <View style={styles.centerContainer}>
          <Text style={{ color: '#EF4444', fontWeight: '600' }}>เกิดข้อผิดพลาดในการโหลดข้อมูล</Text>
          <Text style={{ color: '#71717A', fontSize: 13, marginTop: 4 }}>{errorMsg}</Text>
        </View>
      )}

      {/* Product List */}
      {!loading && !errorMsg && (
        <FlatList
          data={displayedProducts}
          keyExtractor={(item, index) => (item.id ? String(item.id) : String(index))}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={{ color: '#A1A1AA', fontSize: 15 }}>ไม่มีรายการสินค้า</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productCard}
              activeOpacity={0.85}
              onPress={() => handleEditProduct(item)}
            >
              <View style={styles.cardMainRow}>
                {/* Product Image */}
                <Image
                  source={{
                    uri: item.image_url && item.image_url.startsWith('http')
                      ? item.image_url
                      : 'https://via.placeholder.com/150',
                  }}
                  style={styles.productImage}
                  resizeMode="cover"
                />

                {/* Details */}
                <View style={styles.detailsContainer}>
                  <Text style={styles.detailText}>
                    Stock: <Text style={styles.detailValue}>{item.stock} in stock</Text>
                  </Text>
                  <Text style={styles.detailText}>
                    Category: <Text style={styles.detailValue}>{item.category || '-'}</Text>
                  </Text>
                  <Text style={styles.detailText}>
                    Location: <Text style={styles.detailValue}>{item.location_text || '-'}</Text>
                  </Text>
                  <Text style={styles.detailText}>
                    Brand: <Text style={styles.detailValue}>{item.brand}</Text>
                  </Text>
                </View>

                {/* Badge & Arrow */}
                <View style={styles.rightActionContainer}>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>{item.badge_status}</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#A78BFA" />
                </View>
              </View>

              {/* Product Name */}
              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)')}>
          <Ionicons name="home-outline" size={22} color="#9CA3AF" />
          <Text style={[styles.navText, { color: '#9CA3AF' }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/add')}>
          <Ionicons name="add-circle-outline" size={23} color="#9CA3AF" />
          <Text style={[styles.navText, { color: '#9CA3AF' }]}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/product')}>
          <Ionicons name="cube" size={22} color="#7C3AED" />
          <Text style={[styles.navText, { color: '#7C3AED', fontWeight: '700' }]}>Products</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/categories')}>
          <Ionicons name="folder-outline" size={22} color="#9CA3AF" />
          <Text style={[styles.navText, { color: '#9CA3AF' }]}>Categories</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 48,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  iconBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#6B21A8',
  },
  profileButton: {
    width: 38,
    height: 38,
    backgroundColor: '#8B5CF6',
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
  },
  addButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  refreshText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 100,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    marginRight: 14,
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  detailText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 3,
  },
  detailValue: {
    color: '#334155',
    fontWeight: '500',
  },
  rightActionContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 80,
  },
  activeBadge: {
    backgroundColor: '#10B981',
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
    lineHeight: 22,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 11,
    marginTop: 3,
  },
});