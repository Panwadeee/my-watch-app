import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';

export default function AddProductScreen() {
  const router = useRouter();
  const { isAdmin } = useAuth();

  // เฉพาะ admin เท่านั้นที่เข้าหน้านี้ได้ - กันกรณี user เข้าตรงๆ ผ่าน URL
  useEffect(() => {
    if (!isAdmin) {
      if (Platform.OS === 'web') {
        window.alert('เฉพาะผู้ดูแลระบบ (admin) เท่านั้นที่เพิ่มสินค้าได้');
      } else {
        Alert.alert('ไม่มีสิทธิ์เข้าถึง', 'เฉพาะผู้ดูแลระบบ (admin) เท่านั้นที่เพิ่มสินค้าได้');
      }
      router.replace('/(tabs)/product');
    }
  }, [isAdmin]);

  // URL API Backend
  const API_BASE_URL = 'http://119.59.102.161:3033/api';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [stockSize, setStockSize] = useState('');
  const [storesAvailability, setStoresAvailability] = useState('');
  const [productPhotos, setProductPhotos] = useState('');

  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  
  //Apdate Store
  const storeOptions = ['Manchester, UK', 'Yorkshire, UK', 'Hull, UK'];

  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('');
    setPrice('');
    setItemCode('');
    setStockSize('');
    setStoresAvailability('');
    setProductPhotos('');
  };

  const handleSaveProduct = async () => {
    if (
      !name.trim() ||
      !category.trim() ||
      !price.trim() ||
      !itemCode.trim() ||
      !stockSize.trim() ||
      !storesAvailability.trim()
    ) {
      Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลในช่องที่มี * ให้ครบถ้วน');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: name.trim(),
        stock: stockSize.trim() !== '' ? parseInt(stockSize, 10) : 0,
        price: price.trim() !== '' ? parseFloat(price) : 0,
        category: category.trim() || null,
        location: storesAvailability.trim() || null,
        status: 'Active',
        image: productPhotos.trim() || null,
        productCode: itemCode.trim(),
        description: description.trim() || null,
      };

      const targetUrl = `${API_BASE_URL}/products`;

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && (data.success || response.status === 200 || response.status === 201)) {
        resetForm();
        Alert.alert('สำเร็จ', 'บันทึกสินค้าเรียบร้อยแล้ว');
        router.replace('/(tabs)/product');
      } else {
        const errorMsg = data.error || data.message || `HTTP Error: ${response.status}`;
        Alert.alert('เกิดข้อผิดพลาด', errorMsg);
      }
    } catch (error: any) {
      console.error('Save Error:', error);
      Alert.alert('เชื่อมต่อล้มเหลว', `ไม่สามารถติดต่อ Server ได้: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header Bar โทนเดียวกับหน้า Home / Product */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/modal')}>
          <Feather name="menu" size={22} color="#F8FAFC" />
        </TouchableOpacity>

        <View style={styles.brandContainer}>
          <Text style={styles.brandTitle}>ADD NEW</Text>
          <Text style={styles.brandSubTitle}>PRODUCT</Text>
        </View>

        <TouchableOpacity style={styles.iconButton} onPress={() => router.replace('/(tabs)/product')}>
          <Ionicons name="close-outline" size={26} color="#F8FAFC" />
        </TouchableOpacity>
      </View>

      {/* Form Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Product Name <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={styles.singleInput}
            value={name}
            onChangeText={setName}
            placeholder="Name Product"
            placeholderTextColor="#64748B"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Item Code <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={styles.singleInput}
            value={itemCode}
            onChangeText={setItemCode}
            placeholder="Item Code (e.g. PRD-001)"
            placeholderTextColor="#64748B"
          />
        </View>

        <View style={styles.rowTwoColumns}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>
              Price <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.singleInput}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="Price (฿)"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>
              Stock <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.singleInput}
              value={stockSize}
              onChangeText={setStockSize}
              keyboardType="numeric"
              placeholder="Stock Quantity"
              placeholderTextColor="#64748B"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Category <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TextInput
            style={styles.singleInput}
            value={category}
            onChangeText={setCategory}
            placeholder="Category (e.g. LUXURY, AUTOMATIC, SPORT)"
            placeholderTextColor="#64748B"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Location / Store <Text style={styles.requiredStar}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dropdownInput}
            activeOpacity={0.7}
            onPress={() => setShowStoreDropdown(true)}
          >
            <Text style={[styles.dropdownText, !storesAvailability && { color: '#64748B' }]}>
              {storesAvailability || 'Select Store Location'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#D4AF37" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Image URL</Text>
          <TextInput
            style={styles.photoInput}
            value={productPhotos}
            onChangeText={setProductPhotos}
            multiline={true}
            textAlignVertical="top"
            placeholder="https://..."
            placeholderTextColor="#64748B"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={styles.multiInput}
            value={description}
            onChangeText={setDescription}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
            placeholder="Product Description..."
            placeholderTextColor="#64748B"
          />
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.85}
          onPress={handleSaveProduct}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0F172A" />
          ) : (
            <Text style={styles.saveButtonText}>SAVE PRODUCT</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Dropdown Modal */}
      <Modal
        visible={showStoreDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStoreDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStoreDropdown(false)}
        >
          <View style={styles.dropdownMenu}>
            {storeOptions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dropdownOption,
                  storesAvailability === item && styles.selectedOption,
                ]}
                onPress={() => {
                  setStoresAvailability(item);
                  setShowStoreDropdown(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    storesAvailability === item && styles.selectedOptionText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)')}>
          <Ionicons name="home-outline" size={22} color="#94A3B8" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/add')}>
          <Ionicons name="add-circle" size={22} color="#D4AF37" />
          <Text style={[styles.navText, { color: '#D4AF37', fontWeight: '700' }]}>Add</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/product')}>
          <Ionicons name="bag-handle-outline" size={22} color="#94A3B8" />
          <Text style={styles.navText}>Products</Text>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 110,
  },
  inputGroup: {
    marginBottom: 16,
  },
  rowTwoColumns: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 8,
  },
  requiredStar: {
    color: '#EF4444',
  },
  singleInput: {
    backgroundColor: '#1E293B',
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
  },
  multiInput: {
    backgroundColor: '#1E293B',
    height: 110,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    fontSize: 14,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
  },
  photoInput: {
    backgroundColor: '#1E293B',
    height: 70,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    fontSize: 14,
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
  },
  dropdownInput: {
    backgroundColor: '#1E293B',
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  dropdownText: {
    fontSize: 14,
    color: '#F8FAFC',
  },
  saveButton: {
    backgroundColor: '#D4AF37',
    height: 52,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  dropdownMenu: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  dropdownOption: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#0F172A',
  },
  selectedOption: {
    backgroundColor: '#334155',
  },
  optionText: {
    fontSize: 15,
    color: '#CBD5E1',
  },
  selectedOptionText: {
    color: '#D4AF37',
    fontWeight: '700',
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
  },
});