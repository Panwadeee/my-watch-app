import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';

export default function ProductScreen() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { category } = useLocalSearchParams();

  const API_BASE_URL = 'http://119.59.102.161:3033/api';

  const [productsData, setProductsData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.products)
        ? res.products
        : [];

      const parsedData = rawList.map((item: any) => {
        const dbId =
          item.id !== undefined && item.id !== null && item.id !== ''
            ? String(item.id)
            : String(item.Productcode || item.productCode || item.product_code || '');

        const pCode = String(item.Productcode || item.productCode || item.product_code || dbId);

        return {
          ...item,
          id: dbId,
          productCode: pCode,
          name: item.Name || item.name || item.product_name || 'Unnamed Product',
          stock: Number(item.Stock ?? item.stock ?? item.quantity ?? 0),
          price: Number(item.Price ?? item.price ?? item.product_price ?? item.unit_price ?? 0),
          category: item.Category || item.category || item.category_name || 'General',
          location_text: item.Location || item.location_text || item.location || 'Default',
          brand: item.Brand || item.brand || 'Unnamed Brand',
          badge_status: item.Status || item.badge_status || item.status || 'Active',
          image_url: item.image_url || item.image || item.img || '',
          description: item.description || item.Description || '',
          sizes: item.sizes || item.Sizes || '',
        };
      });

      setProductsData(parsedData);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setErrorMsg(err.message || 'An unexpected error occurred while fetching products.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  // กดแล้วส่งข้อมูลไปหน้า details
  const handleViewDetails = (item: any) => {
    router.push({
      pathname: '/(tabs)/details',
      params: {
        id: item.id,
        productCode: item.productCode,
        name: item.name,
        stock: String(item.stock),
        price: String(item.price),
        category: item.category,
        location_text: item.location_text,
        brand: item.brand,
        badge_status: item.badge_status,
        image_url: item.image_url,
        description: item.description,
        sizes: item.sizes,
      },
    });
  };

  // ยิง API ลบสินค้าจากหน้า Product โดยตรง
  const executeDeleteAPI = async (item: any) => {
    const primaryId = item.id ? String(item.id) : '';
    const codeId = item.productCode ? String(item.productCode) : '';
    const targetKey = primaryId || codeId;

    if (!targetKey) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่พบ ID หรือ Product Code สำหรับส่งลบ');
      return;
    }

    try {
      setDeletingId(targetKey);

      const res = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(targetKey)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          id: primaryId || targetKey,
          productCode: codeId || targetKey,
        }),
      });

      if (res.ok || res.status === 204) {
        // ตัดออกจากลิสต์ทันที แล้วค่อยดึงข้อมูลใหม่จาก Server
        setProductsData((prev) => prev.filter((p) => String(p.id) !== targetKey));
        fetchProducts();
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = data.message || data.error || `Status ${res.status}`;
        if (Platform.OS === 'web') window.alert(`ลบไม่สำเร็จ: ${msg}`);
        else Alert.alert('ลบไม่สำเร็จ', `Server ตอบกลับ: ${msg}`);
      }
    } catch (err: any) {
      console.error('Delete Error:', err);
      if (Platform.OS === 'web') window.alert(`เชื่อมต่อล้มเหลว: ${err.message}`);
      else Alert.alert('เชื่อมต่อล้มเหลว', `ไม่สามารถติดต่อ Server ได้: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // กดปุ่มถังขยะบนการ์ดสินค้า
  const handleDeleteProduct = (item: any) => {
    if (deletingId) return;

    const message = `คุณต้องการลบ "${item.name}" ออกจากระบบใช่หรือไม่?`;

    if (Platform.OS === 'web') {
      if (window.confirm(message)) executeDeleteAPI(item);
      return;
    }

    Alert.alert('ยืนยันการลบสินค้า', message, [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ลบสินค้า', style: 'destructive', onPress: () => executeDeleteAPI(item) },
    ]);
  };

  const displayedProducts = productsData
    .filter((item) => {
      if (!category) return true;
      return String(item.category).toLowerCase() === String(category).toLowerCase();
    })
    .filter((item) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;

      return (
        item.name.toLowerCase().includes(query) ||
        String(item.category).toLowerCase().includes(query) ||
        String(item.brand).toLowerCase().includes(query) ||
        String(item.location_text).toLowerCase().includes(query) ||
        String(item.price).includes(query) ||
        String(item.id).toLowerCase().includes(query) ||
        String(item.productCode).toLowerCase().includes(query)
      );
    });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {isSearching ? (
          <View style={styles.searchBarContainer}>
            <Ionicons name="search-outline" size={20} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#64748B"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => {
                setIsSearching(false);
                setSearchQuery('');
              }}
            >
              <Text style={styles.cancelSearchText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/modal')}>
              <Feather name="menu" size={22} color="#F8FAFC" />
            </TouchableOpacity>

            <View style={styles.brandContainer}>
              <Text style={styles.brandTitle}>
                {category ? String(category).toUpperCase() : 'PRODUCTS'}
              </Text>
              <Text style={styles.brandSubTitle}>MANAGEMENT</Text>
            </View>

            <View style={styles.headerRightGroup}>
              <TouchableOpacity style={styles.iconButton} onPress={() => setIsSearching(true)}>
                <Ionicons name="search-outline" size={22} color="#F8FAFC" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={fetchProducts}>
                <Ionicons name="refresh-outline" size={22} color="#F8FAFC" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Action Bar */}
      <View style={styles.toolBarRow}>
        <Text style={styles.countText}>{displayedProducts.length} Items Listed</Text>
        {isAdmin && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(tabs)/add')}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>+ Add Product</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Loading & Error */}
      {loading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={{ marginTop: 12, color: '#94A3B8', fontSize: 14 }}>Loading product data...</Text>
        </View>
      )}

      {errorMsg && !loading && (
        <View style={styles.centerContainer}>
          <Text style={{ color: '#EF4444', fontWeight: '600' }}>An error occurred while loading product data</Text>
          <Text style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>{errorMsg}</Text>
        </View>
      )}

      {/* List - แสดงเฉพาะ รูปภาพ + ชื่อสินค้า */}
      {!loading && !errorMsg && (
        <FlatList
          data={displayedProducts}
          keyExtractor={(item, index) => (item.id ? String(item.id) : String(index))}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={{ color: '#64748B', fontSize: 15 }}>No products found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productCard}
              activeOpacity={0.85}
              onPress={() => handleViewDetails(item)}
            >
              <View style={styles.cardMainRow}>
                <Image
                  source={{
                    uri:
                      item.image_url
                        ? item.image_url
                        : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
                  }}
                  style={styles.productImage}
                  resizeMode="contain"
                />

                <View style={styles.detailsContainer}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.name}
                  </Text>
                </View>

                {isAdmin && (
                  <TouchableOpacity
                    style={styles.deleteIconButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteProduct(item);
                    }}
                    disabled={deletingId !== null}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {deletingId === String(item.id) ? (
                      <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                      <Feather name="trash-2" size={18} color="#EF4444" />
                    )}
                  </TouchableOpacity>
                )}

                <Feather name="chevron-right" size={20} color="#D4AF37" />
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)')}>
          <Ionicons name="home-outline" size={22} color="#94A3B8" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/add')}>
          <Ionicons name="add-circle-outline" size={22} color="#94A3B8" />
          <Text style={styles.navText}>Add</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/product')}>
          <Ionicons name="bag-handle" size={22} color="#D4AF37" />
          <Text style={[styles.navText, { color: '#D4AF37', fontWeight: '700' }]}>Products</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/categories')}>
          <Ionicons name="grid-outline" size={22} color="#94A3B8" />
          <Text style={styles.navText}>Categories</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    minHeight: 65,
  },
  iconButton: { padding: 6 },
  brandContainer: { alignItems: 'center' },
  brandTitle: { fontSize: 20, fontWeight: '300', letterSpacing: 3, color: '#D4AF37' },
  brandSubTitle: { fontSize: 8, fontWeight: '600', letterSpacing: 2, marginTop: 2, color: '#94A3B8' },
  headerRightGroup: { flexDirection: 'row', gap: 10 },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchInput: { flex: 1, color: '#F8FAFC', fontSize: 14, marginLeft: 8, paddingVertical: 0 },
  cancelSearchText: { color: '#D4AF37', fontSize: 13, fontWeight: '600' },
  toolBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  countText: { color: '#D4AF37', fontSize: 12, fontWeight: '500' },
  addButton: { backgroundColor: '#D4AF37', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  addButtonText: { color: '#0F172A', fontSize: 13, fontWeight: '700' },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  centerContainer: { justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
  productCard: {
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardMainRow: { flexDirection: 'row', alignItems: 'center' },
  productImage: { width: 65, height: 65, borderRadius: 8, backgroundColor: '#FFFFFF', marginRight: 14 },
  detailsContainer: { flex: 1, justifyContent: 'center', paddingRight: 8 },
  productName: { fontSize: 15, fontWeight: '600', color: '#F8FAFC' },
  deleteIconButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    marginRight: 8,
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
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 11, marginTop: 2, color: '#94A3B8' },
});