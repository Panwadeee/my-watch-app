import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function EditProductScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const API_BASE_URL = 'http://119.59.102.161:3033/api';

  // State ให้ตรงกับหน้า Add ทุกประการ
  const [originalId, setOriginalId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [stockSize, setStockSize] = useState('');
  const [storesAvailability, setStoresAvailability] = useState('');
  const [productPhotos, setProductPhotos] = useState('');

  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const storeOptions = ['3 stores', 'Option 1', 'Option 2', 'Option 3'];

  const [submitting, setSubmitting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // ดึงข้อมูลจาก Params มาลง State เมื่อเปิดหน้าจอ Edit
  useEffect(() => {
    if (!isLoaded && params) {
      console.log('--- PARAMS RECEIVED IN EDIT ---', params);
      
      const targetId = String(params.productCode || params.id || '');
      
      if (targetId) {
        setOriginalId(targetId);
        setItemCode(targetId);
        setName(params.name ? String(params.name) : '');
        setDescription(params.description ? String(params.description) : '');
        setCategory(params.category ? String(params.category) : '');
        setPrice(params.price !== undefined && params.price !== null ? String(params.price) : '');
        setStockSize(params.stock !== undefined && params.stock !== null ? String(params.stock) : '');
        setStoresAvailability(params.location ? String(params.location) : '');
        setProductPhotos(params.image ? String(params.image) : '');
        
        setIsLoaded(true);
      }
    }
  }, [params, isLoaded]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        setName(data.name || '');
        setDescription(data.description || '');
        setCategory(data.category ? String(data.category) : '');
        setPrice(data.price !== undefined && data.price !== null ? String(data.price) : '');
        setItemCode(data.productCode || '');
        setStockSize(data.stock !== undefined && data.stock !== null ? String(data.stock) : '');
        setStoresAvailability(data.location || '');
        setProductPhotos(data.image || '');
        
      } catch (error) {
        console.error('Error fetching product:', error);
        Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลสินค้าได้');
      } finally {
        setIsLoaded(true); // เปลี่ยนจาก setIsLoading เป็น setIsLoaded
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // ฟังก์ชันอัปเดตข้อมูลสินค้าส่งไปที่ Backend
  const handleUpdateProduct = async () => {
    if (!name.trim() || !category.trim() || !price.trim() || !itemCode.trim() || !stockSize.trim() || !storesAvailability.trim()) {
      Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลในช่องที่มี * ให้ครบถ้วน');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        productCode: itemCode.trim(),
        name: name.trim(),
        stock: stockSize.trim() !== '' ? parseInt(stockSize, 10) : 0,
        price: price.trim() !== '' ? parseFloat(price) : 0,
        category: category.trim() || null,
        location: storesAvailability.trim() || null,
        status: 'Active',
        image: productPhotos.trim() || null,
        description: description.trim() || null,
      };

      const targetUrl = `${API_BASE_URL}/products/${encodeURIComponent(originalId)}`;
      console.log('🚀 Sending PUT to:', targetUrl);
      console.log('📦 Payload:', payload);

      const response = await fetch(targetUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && (data.success || response.status === 200)) {
        Alert.alert('สำเร็จ', 'บันทึกแก้ไขสินค้าเรียบร้อยแล้ว');
        router.replace('/(tabs)/product');
      } else {
        const errorMsg = data.error || data.message || `HTTP Error: ${response.status}`;
        Alert.alert('เกิดข้อผิดพลาด', errorMsg);
      }
    } catch (error: any) {
      console.error('Update Error:', error);
      Alert.alert('เชื่อมต่อล้มเหลว', `ไม่สามารถติดต่อ Server ได้: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#4A148C" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Edit product</Text>

        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-outline" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Form Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Name*</Text>
          <TextInput
            style={styles.singleInput}
            value={name}
            onChangeText={setName}
            placeholder="ชื่อสินค้า"
            placeholderTextColor="#A0A0A0"
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
            placeholder="รายละเอียดเพิ่มเติม..."
            placeholderTextColor="#A0A0A0"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Category*</Text>
          <TextInput
            style={styles.singleInput}
            value={category}
            onChangeText={setCategory}
            placeholder="หมวดหมู่ (เช่น SPORT)"
            placeholderTextColor="#A0A0A0"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Price*</Text>
          <TextInput
            style={styles.singleInput}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="ราคา"
            placeholderTextColor="#A0A0A0"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Item code*</Text>
          <TextInput
            style={styles.singleInput}
            value={itemCode}
            onChangeText={setItemCode}
            placeholder="รหัสสินค้า"
            placeholderTextColor="#A0A0A0"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Stock size*</Text>
          <TextInput
            style={styles.singleInput}
            value={stockSize}
            onChangeText={setStockSize}
            keyboardType="numeric"
            placeholder="จำนวนสต็อก"
            placeholderTextColor="#A0A0A0"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Stores availability*</Text>
          <TouchableOpacity
            style={styles.dropdownInput}
            activeOpacity={0.7}
            onPress={() => setShowStoreDropdown(true)}
          >
            <Text style={[styles.dropdownText, !storesAvailability && { color: '#A0A0A0' }]}>
              {storesAvailability || 'เลือกสาขา'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#4A148C" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Product photos*</Text>
          <TextInput
            style={styles.photoInput}
            value={productPhotos}
            onChangeText={setProductPhotos}
            multiline={true}
            textAlignVertical="top"
            placeholder="ใส่ URL รูปภาพสินค้า"
            placeholderTextColor="#A0A0A0"
          />
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.9}
          onPress={handleUpdateProduct}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Update product</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal สำหรับ Dropdown สาขา */}
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
                  storesAvailability === item && styles.selectedOption
                ]}
                onPress={() => {
                  setStoresAvailability(item);
                  setShowStoreDropdown(false);
                }}
              >
                <Text style={[
                  styles.optionText,
                  storesAvailability === item && styles.selectedOptionText
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 70,
    backgroundColor: '#FFFFFF',
    marginTop: 30,
  },
  menuButton: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#000000' },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4A148C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 120 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 18, fontWeight: '600', color: '#000000', marginBottom: 10, paddingLeft: 2 },
  singleInput: { backgroundColor: '#F3F2F5', height: 62, borderRadius: 20, paddingHorizontal: 20, fontSize: 16, color: '#000000' },
  multiInput: { backgroundColor: '#F3F2F5', height: 160, borderRadius: 20, paddingHorizontal: 20, paddingTop: 16, fontSize: 16, color: '#000000' },
  photoInput: { backgroundColor: '#F3F2F5', height: 140, borderRadius: 20, paddingHorizontal: 20, paddingTop: 16, fontSize: 16, color: '#000000' },
  dropdownInput: {
    backgroundColor: '#F3F2F5',
    height: 62,
    borderRadius: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: { fontSize: 16, color: '#000000' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', paddingHorizontal: 40 },
  dropdownMenu: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#777777', borderRadius: 10, overflow: 'hidden', elevation: 5 },
  dropdownOption: { paddingVertical: 14, paddingHorizontal: 16 },
  selectedOption: { backgroundColor: '#4A148C' },
  optionText: { fontSize: 18, color: '#000000' },
  selectedOptionText: { color: '#FFFFFF' },
  saveButton: {
    backgroundColor: '#4A148C',
    height: 60,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#4A148C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  saveButtonText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
});