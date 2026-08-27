import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';

const API_BASE_URL = 'http://119.59.102.161:3033/api';
const SERVER_BASE_URL = 'http://119.59.102.161:3033';
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500';

interface Product {
  id: string;
  productCode: string;
  name: string;
  category?: string;
  stock: number;
  price?: number;
  image?: string;
  image_url?: string;
  img?: string;
  product_image?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const { isAdmin, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL WATCHES');
  const [categories, setCategories] = useState<string[]>(['ALL WATCHES']);

  // State สำหรับค้นหา
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // State สำหรับตะกร้าสินค้า
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartVisible, setIsCartVisible] = useState<boolean>(false);

  // State สำหรับ Modal เมนูหลัก (ปุ่ม 3 ขีด)
  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();

      const rawList = Array.isArray(data)
        ? data
        : data.data && Array.isArray(data.data)
        ? data.data
        : [];

      const formattedData: Product[] = rawList.map((item: any) => {
        const realId = item.id ? String(item.id) : '';
        const pCode = String(item.Productcode || item.productCode || realId);
        const dbId = realId || pCode;

        return {
          ...item,
          id: dbId,
          productCode: pCode,
          name: item.name || item.Name || item.product_name || 'Unnamed Product',
          category: item.category || item.Category || item.category_name || 'Uncategorized',
          stock: Number(item.stock ?? item.Stock ?? item.quantity ?? 0),
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

  // --- ฟังก์ชันการเปลี่ยนหน้าจาก Modal Menu ---
  const handleMenuNavigate = (path: string) => {
    setIsMenuVisible(false);
    router.push(path as any);
  };

  // --- ฟังก์ชัน Log out จาก Modal Menu ---
  const handleLogout = () => {
    setIsMenuVisible(false);

    const doLogout = () => {
      logout();
      router.replace('/login' as any);
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) doLogout();
      return;
    }

    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: doLogout,
      },
    ]);
  };

  // --- ฟังก์ชันจัดการตะกร้าสินค้าพร้อมระบบตัด/คืนสต็อก ---
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.id === product.id ? { ...p, stock: p.stock - 1 } : p
      )
    );

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, amount: number) => {
    const productInList = products.find((p) => p.id === productId);

    if (amount > 0 && productInList && productInList.stock <= 0) {
      return;
    }

    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        if (p.id === productId) {
          return { ...p, stock: p.stock - amount };
        }
        return p;
      })
    );

    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + amount;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0);

  const filteredProducts = products.filter((item) => {
    const matchesCategory =
      selectedCategory === 'ALL WATCHES' ||
      item.category?.toUpperCase().trim() === selectedCategory.toUpperCase().trim();

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      (item.productCode && item.productCode.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query)) ||
      (item.price && item.price.toString().includes(query));

    return matchesCategory && matchesSearch;
  });

  const resolveImageUrl = (item: Product) => {
    const rawPath = item.image_url || item.image || item.img || item.product_image;

    if (!rawPath) return PLACEHOLDER_IMAGE;
    if (
      rawPath.startsWith('http://') ||
      rawPath.startsWith('https://') ||
      rawPath.startsWith('data:image/')
    ) {
      return rawPath;
    }
    return `${SERVER_BASE_URL}${rawPath.startsWith('/') ? '' : '/'}${rawPath}`;
  };

  const renderProductCard = ({ item }: { item: Product }) => {
    const imageUrl = resolveImageUrl(item);
    const isOutOfStock = item.stock <= 0;

    return (
      <View style={styles.productCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.categorySubText}>
            {(item.category || 'WATCHES').toUpperCase()}
          </Text>
        </View>

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

          <Text style={[styles.stockText, isOutOfStock && styles.outOfStockText]}>
            {isOutOfStock ? 'Out of Stock' : `In Stock: ${item.stock} units`}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceText}>
              ฿{item.price ? item.price.toLocaleString() : '0'}
            </Text>
            <TouchableOpacity
              style={[styles.addButton, isOutOfStock && styles.disabledButton]}
              onPress={() => handleAddToCart(item)}
              disabled={isOutOfStock}
            >
              <Ionicons
                name="bag-add-outline"
                size={18}
                color={isOutOfStock ? '#64748B' : '#0F172A'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {isSearching ? (
          <View style={styles.searchBarContainer}>
            <Ionicons name="search-outline" size={20} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
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
            {/* Modal Menu */}
            <TouchableOpacity style={styles.iconButton} onPress={() => setIsMenuVisible(true)}>
              <Feather name="menu" size={22} color="#F8FAFC" />
            </TouchableOpacity>

            <View style={styles.brandContainer}>
              <Text style={styles.brandTitle}>CHRONO</Text>
              <Text style={styles.brandSubTitle}>TIC-TAC & CO.</Text>
            </View>

            <View style={styles.headerRightGroup}>
              <TouchableOpacity style={styles.iconButton} onPress={() => setIsSearching(true)}>
                <Ionicons name="search-outline" size={22} color="#F8FAFC" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => setIsCartVisible(true)}>
                <Ionicons name="bag-handle-outline" size={22} color="#F8FAFC" />
                {totalCartItems > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{totalCartItems}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Categories */}
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

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>COLLECTION</Text>
        <Text style={styles.piecesCountText}>{filteredProducts.length} Items Available</Text>
      </View>

      {/* List สินค้า */}
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
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
        />
      )}

      {/* Modal Menu */}
      <Modal
        visible={isMenuVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <View style={styles.menuOverlay}>
          <View style={styles.menuCard}>
            <View style={styles.menuHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsMenuVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={26} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.menuHeaderTitle}>Inventor. io</Text>
              <View style={{ width: 26 }} />
            </View>

            <View style={styles.menuItemsContainer}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => setIsMenuVisible(false)}
              >
                <Text style={styles.menuText}>Home</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuNavigate('/product')}
              >
                <Text style={styles.menuText}>Products</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuNavigate('/categories')}
              >
                <Text style={styles.menuText}>Categories</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuNavigate('/stores')}
              >
                <Text style={styles.menuText}>Stores</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuNavigate('/finances')}
              >
                <Text style={styles.menuText}>Finances</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuNavigate('/settings')}
              >
                <Text style={styles.menuText}>Settings</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.menuFooter}>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                <Text style={styles.logoutText}>Log out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal ตะกร้าสินค้า */}
      <Modal visible={isCartVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Shopping Cart ({totalCartItems})</Text>
            <TouchableOpacity onPress={() => setIsCartVisible(false)}>
              <Ionicons name="close" size={26} color="#F8FAFC" />
            </TouchableOpacity>
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyCartContainer}>
              <Ionicons name="bag-remove-outline" size={60} color="#64748B" />
              <Text style={styles.emptyCartText}>No products in cart</Text>
            </View>
          ) : (
            <FlatList
              data={cart}
              keyExtractor={(item) => item.product.id}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => {
                const liveProduct = products.find((p) => p.id === item.product.id);
                const isMaxStockReached = liveProduct ? liveProduct.stock <= 0 : false;

                return (
                  <View style={styles.cartCard}>
                    <Image
                      source={{ uri: resolveImageUrl(item.product) }}
                      style={styles.cartImage}
                      resizeMode="contain"
                    />
                    <View style={styles.cartInfo}>
                      <Text style={styles.cartProductName} numberOfLines={1}>
                        {item.product.name}
                      </Text>
                      <Text style={styles.cartProductPrice}>
                        ฿{(item.product.price || 0).toLocaleString()}
                      </Text>
                      <View style={styles.qtyContainer}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => handleUpdateQuantity(item.product.id, -1)}
                        >
                          <Text style={styles.qtyBtnText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={[styles.qtyBtn, isMaxStockReached && styles.disabledQtyBtn]}
                          onPress={() => handleUpdateQuantity(item.product.id, 1)}
                          disabled={isMaxStockReached}
                        >
                          <Text style={[styles.qtyBtnText, isMaxStockReached && styles.disabledQtyBtnText]}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          )}

          {cart.length > 0 && (
            <View style={styles.cartFooter}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Price:</Text>
                <Text style={styles.totalValue}>฿{totalPrice.toLocaleString()}</Text>
              </View>
              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={() => {
                  Alert.alert('Order Successful', 'Thank you for your purchase!');
                  setCart([]);
                  setIsCartVisible(false);
                }}
              >
                <Text style={styles.checkoutBtnText}>Checkout</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/' as any)}>
          <Ionicons name="home" size={22} color="#D4AF37" />
          <Text style={[styles.navText, { color: '#D4AF37' }]}>Home</Text>
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/add' as any)}>
            <Ionicons name="add-circle-outline" size={22} color="#94A3B8" />
            <Text style={styles.navText}>Add</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/product' as any)}>
          <Ionicons name="bag-handle-outline" size={22} color="#94A3B8" />
          <Text style={styles.navText}>Product</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/categories' as any)}>
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
  iconButton: { padding: 6, position: 'relative' },
  brandContainer: { alignItems: 'center' },
  brandTitle: { fontSize: 22, fontWeight: '300', letterSpacing: 4, color: '#D4AF37' },
  brandSubTitle: { fontSize: 8, fontWeight: '600', letterSpacing: 2, marginTop: 2, color: '#94A3B8' },
  headerRightGroup: { flexDirection: 'row', gap: 12 },
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
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
    marginLeft: 8,
    paddingVertical: 0,
  },
  cancelSearchText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '600',
  },
  cartBadge: {
    position: 'absolute',
    right: 0,
    top: 2,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
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
  categorySubText: { fontSize: 9, fontWeight: '700', color: '#64748B' },
  imageContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  productImage: { width: '100%', height: '100%', backgroundColor: '#FFFFFF' },
  productDetails: { marginTop: 4 },
  productName: { fontSize: 13, fontWeight: '600', color: '#F8FAFC' },
  stockText: { fontSize: 10, color: '#64748B', marginTop: 4 },
  outOfStockText: { color: '#EF4444', fontWeight: '600' },
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
  disabledButton: {
    backgroundColor: '#334155',
    opacity: 0.6,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { color: '#64748B', fontSize: 14 },

  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  menuCard: {
    width: '100%',
    height: '90%',
    backgroundColor: '#1E293B', // เปลี่ยนเป็นสีเทาเข้มโทนเดียวกับแอปแล้ว
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

  modalContainer: { flex: 1, backgroundColor: '#0F172A' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#F8FAFC' },
  emptyCartContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyCartText: { color: '#64748B', fontSize: 16, marginTop: 12 },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cartImage: { width: 60, height: 60, backgroundColor: '#FFFFFF', borderRadius: 6 },
  cartInfo: { flex: 1, marginLeft: 12 },
  cartProductName: { color: '#F8FAFC', fontSize: 14, fontWeight: '600' },
  cartProductPrice: { color: '#D4AF37', fontSize: 13, fontWeight: '700', marginTop: 2 },
  qtyContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  qtyBtn: {
    backgroundColor: '#334155',
    width: 26,
    height: 26,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledQtyBtn: { backgroundColor: '#1E293B', opacity: 0.5 },
  qtyBtnText: { color: '#F8FAFC', fontWeight: 'bold' },
  disabledQtyBtnText: { color: '#64748B' },
  qtyText: { color: '#F8FAFC', marginHorizontal: 12, fontSize: 14, fontWeight: '600' },
  cartFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  totalLabel: { color: '#94A3B8', fontSize: 14 },
  totalValue: { color: '#D4AF37', fontSize: 18, fontWeight: '700' },
  checkoutBtn: {
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutBtnText: { color: '#0F172A', fontSize: 16, fontWeight: '700' },
});