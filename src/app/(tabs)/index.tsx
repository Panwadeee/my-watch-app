import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const API_BASE_URL = 'http://119.59.102.161:3033/api';
const SERVER_BASE_URL = 'http://119.59.102.161:3033';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';

interface Product {
  id: string;
  productCode: string;
  name: string;
  category?: string;
  stock?: number;
  price?: number;
  image?: string;
  image_url?: string;
  img?: string;
  product_image?: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL WATCHES');
  const [categories, setCategories] = useState<string[]>(['ALL WATCHES']);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();
      
      const rawList = Array.isArray(data)
        ? data
        : (data.data && Array.isArray(data.data) ? data.data : []);

      const formattedData: Product[] = rawList.map((item: any) => {
        const realId = item.id ? String(item.id) : '';
        const pCode = String(item.Productcode || item.productCode || realId);
        const dbId = realId || pCode;

        return {
          ...item,
          id: dbId,
          productCode: pCode,
          name: item.name || item.Name || item.product_name || 'ไม่มีชื่อสินค้า',
          category: item.category || item.Category || item.category_name || 'Uncategorized',
          stock: item.stock ?? item.Stock ?? item.quantity ?? 0,
          price: Number(item.Price ?? item.price ?? item.product_price ?? item.unit_price ?? 0),
        };
      });

      setProducts(formattedData);

      const extractedCategories = Array.from(
        new Set(
          formattedData
            .map((item) => item.category?.toUpperCase().trim())
            .filter((cat): cat is string => Boolean(cat))
        )
      );
      setCategories(['ALL WATCHES', ...extractedCategories]);

    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const executeDelete = async (targetId: string, pCode?: string) => {
    const idToDelete = targetId || pCode;

    if (!idToDelete) {
      Alert.alert('ผิดพลาด', 'ไม่พบรหัสสินค้าสำหรับลบ');
      return;
    }

    try {
      let response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(idToDelete)}`, {
        method: 'DELETE',
      });

      if (!response.ok && pCode && pCode !== idToDelete) {
        response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(pCode)}`, {
          method: 'DELETE',
        });
      }

      const resData = await response.json().catch(() => ({}));

      if (response.ok) {
        setProducts((prev) =>
          prev.filter((product) => product.id !== targetId && product.productCode !== pCode)
        );
        
        if (Platform.OS === 'web') {
          window.alert('ลบสินค้าเรียบร้อยแล้ว');
        } else {
          Alert.alert('สำเร็จ', 'ลบสินค้าเรียบร้อยแล้ว');
        }
      } else {
        Alert.alert('เกิดข้อผิดพลาด', resData.error || resData.message || 'ไม่สามารถลบสินค้าได้');
      }
    } catch (error) {
      console.error('Delete Product Error:', error);
      Alert.alert('ผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

  const handleDeleteProduct = (product: Product) => {
    const confirmMsg = `คุณต้องการลบ "${product.name}" ออกจากระบบใช่หรือไม่?`;

    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm(confirmMsg);
      if (confirmDelete) {
        executeDelete(product.id, product.productCode);
      }
    } else {
      Alert.alert(
        'ยืนยันการลบสินค้า',
        confirmMsg,
        [
          { text: 'ยกเลิก', style: 'cancel' },
          {
            text: 'ลบสินค้า',
            style: 'destructive',
            onPress: () => executeDelete(product.id, product.productCode),
          },
        ]
      );
    }
  };

  const filteredProducts = products.filter((item) => {
    if (selectedCategory === 'ALL WATCHES') return true;
    return item.category?.toUpperCase().trim() === selectedCategory.toUpperCase().trim();
  });

  const resolveImageUrl = (item: Product) => {
    const rawPath = item.image || item.image_url || item.img || item.product_image;
    
    if (!rawPath) return PLACEHOLDER_IMAGE;
    if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
      return rawPath;
    }
    return `${SERVER_BASE_URL}${rawPath.startsWith('/') ? '' : '/'}${rawPath}`;
  };

  const renderProductCard = ({ item }: { item: Product }) => {
    const imageUrl = resolveImageUrl(item);

    return (
      <View style={styles.productCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.categorySubText}>
            {(item.category || 'WATCHES').toUpperCase()}
          </Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteProduct(item)}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* ปรับพื้นหลังกรอบรูปเป็นสีขาว */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.productImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.productDetails}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>

          <Text style={styles.stockText}>
            In Stock: {item.stock ?? 0} units
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceText}>
              ฿{item.price ? item.price.toLocaleString() : '0'}
            </Text>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="bag-add-outline" size={18} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}>
          <Feather name="menu" size={22} color="#F8FAFC" />
        </TouchableOpacity>

        <View style={styles.brandContainer}>
          <Text style={styles.brandTitle}>CHRONO</Text>
          <Text style={styles.brandSubTitle}>TIMEPIECES & CO.</Text>
        </View>

        <View style={styles.headerRightGroup}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search-outline" size={22} color="#F8FAFC" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="bag-handle-outline" size={22} color="#F8FAFC" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.categoryWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollContent}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipSelected]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextSelected]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>COLLECTION</Text>
        <Text style={styles.piecesCountText}>{filteredProducts.length} Items Available</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderProductCard}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.productListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D4AF37" />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>ไม่พบสินค้าในหมวดหมู่นี้</Text>
            </View>
          }
        />
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
          <Ionicons name="home" size={22} color="#D4AF37" />
          <Text style={[styles.navText, { color: '#D4AF37' }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/add')}>
          <Ionicons name="add-circle-outline" size={22} color="#94A3B8" />
          <Text style={styles.navText}>Add</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/product')}>
          <Ionicons name="bag-handle-outline" size={22} color="#94A3B8" />
          <Text style={styles.navText}>Product</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/categories')}>
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
  },
  iconButton: { padding: 6 },
  brandContainer: { alignItems: 'center' },
  brandTitle: { fontSize: 22, fontWeight: '300', letterSpacing: 4, color: '#D4AF37' },
  brandSubTitle: { fontSize: 8, fontWeight: '600', letterSpacing: 2, marginTop: 2, color: '#94A3B8' },
  headerRightGroup: { flexDirection: 'row', gap: 12 },
  categoryWrapper: { marginVertical: 12 },
  categoryScrollContent: { paddingHorizontal: 16, gap: 10 },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1E293B',
  },
  categoryChipSelected: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  categoryChipText: { fontSize: 11, fontWeight: '600', color: '#94A3B8' },
  categoryChipTextSelected: { color: '#0F172A', fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', letterSpacing: 1.5, color: '#F8FAFC' },
  piecesCountText: { fontSize: 12, color: '#D4AF37', fontWeight: '500' },
  productListContent: { paddingHorizontal: 16, paddingBottom: 100 },
  columnWrapper: { justifyContent: 'space-between', marginBottom: 16 },
  productCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 4,
  },
  categorySubText: { fontSize: 9, fontWeight: '700', color: '#64748B' },
  imageContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#FFFFFF', // เปลี่ยนพื้นหลังกรอบรูปเป็นสีขาว
    borderRadius: 8,
  },
  productImage: { width: '100%', height: '100%', backgroundColor: '#FFFFFF' }, // กำหนดพื้นหลังรูปภาพเป็นสีขาว
  productDetails: { marginTop: 4 },
  productName: { fontSize: 13, fontWeight: '600', color: '#F8FAFC' },
  stockText: { fontSize: 10, color: '#64748B', marginTop: 4 },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priceText: { fontSize: 14, fontWeight: '700', color: '#D4AF37' },
  addButton: {
    width: 28,
    height: 28,
    backgroundColor: '#D4AF37',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { color: '#64748B', fontSize: 14 },
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
  navItem: { alignItems: 'center' },
  navText: { fontSize: 11, fontWeight: '500', marginTop: 2, color: '#94A3B8' },
});