import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router'; // ✨ นำเข้า useLocalSearchParams เพิ่มเติม
import React from 'react';
import {
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

  const productsData = [
    {
      id: '1',
      name: 'G-Shock GA 2100 Limited Edition',
      stock: '12 in stock',
      category: 'Watches',
      location: '3 stores',
      status: 'Active',
      image: 'https://th.bing.com/th/id/OIP.dI2ipluSK2yvjt-AB4hAlgHaHa?r=0&o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3',
    },
    {
      id: '2',
      name: 'casio b640wc-5a',
      stock: '12 in stock',
      category: 'Watches',
      location: '3 stores',
      status: 'Active',
      image: 'https://images.stockx.com/images/Casio-Vintage-B640WC-5A-Rose-Gold.jpg?fit=fill&bg=FFFFFF&w=480&h=320&fm=webp&auto=compress&dpr=2&trim=color&updated_at=1637174698&q=60',
    },
    {
      id: '3',
      name: 'Rolex Submariner Date 126610LN',
      stock: '12 in stock',
      category: 'Watches',
      location: '3 stores',
      status: 'Active',
      image: 'https://a.1stdibscdn.com/rolex-submariner-date-40mm-116610ln-2019-unworn-for-sale/v_26322/v_156271721652818477651/v_15627172_1652818478788_bg_processed.jpg?disable=upscale&auto=webp&quality=60&width=960',
    },
    {
      id: '4',
      name: 'Rolex Datejust 41 126334',
      stock: '12 in stock',
      category: 'Watches',
      location: '3 stores',
      status: 'Active',
      image: 'https://tse3.mm.bing.net/th/id/OIP.6LXvf8jNOmI4QNtEHzb-fwHaJ4?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    },
    {
      id: '5',
      name: 'Garmin Forerunner 265',
      stock: '12 in stock',
      category: 'Watches',
      location: '3 stores',
      status: 'Active',
      image: 'https://assets.voila.id/voila/images/product/garmin/2product-010-02810-53-Xms-2024-11-13T0931350700.jpeg',
    },
    {
      id: '6',
      name: 'Apple Watch Series 6 GPS',
      stock: '12 in stock',
      category: 'Watches',
      location: '3 stores',
      status: 'Active',
      image: 'https://www.tccq.com/image/cache/catalog/1801223/Apple-Watch-Series-9-GPS-45mm-Starlight-Aluminium-Case-with-Starlight-Sport-Loop-in-Qatar-1200x1200.jpg',
    },
  ];

  // ✨ 2. กรองข้อมูลสินค้า: ถ้ามีค่า category ส่งมา ให้ดึงเฉพาะรายการสินค้าที่คีย์ category ตรงกันมาแสดงผล
  const displayedProducts = category
    ? productsData.filter((item) => item.category.toLowerCase() === category.toLowerCase())
    : productsData;

  return (
    <View style={styles.container}>
      {/* 📌 ROW 1: Header (Menu, Title, Profile) */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.push('/modal')}>
          <Feather name="menu" size={26} color="#6200EE" />
        </TouchableOpacity>
        
        {/* ✨ ปรับหัวข้อ Title ให้ไดนามิกตามหมวดหมู่ที่เลือก */}
        <Text style={styles.headerTitle}>{category ? category : 'Products'}</Text>
        
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/settings')}
        >
          <Feather name="user" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* 📌 ROW 2: Tool Bar (Search, Add Button, Filter) */}
      <View style={styles.toolBarRow}>
        <TouchableOpacity>
          <Feather name="search" size={26} color="#6200EE" />
        </TouchableOpacity>
        <View style={styles.actionButtons}>
          {/* ✨ ปรับพาร์ทเป็น /(tabs)/add */}
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/(tabs)/add')}>
            <Text style={styles.addButtonText}>+ Add Product</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Filter </Text>
            <MaterialIcons name="filter-alt" size={16} color="#6200EE" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 📌 3. รายการสินค้า */}
      <FlatList
        data={displayedProducts} 
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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

      {/* 📌 4. Bottom Navigation Bar (✨ ปรับลิงก์ให้วิ่งเข้าหาโฟลเดอร์กลุ่ม tabs ทั้งหมดป้องกัน Unmatched Route) */}
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