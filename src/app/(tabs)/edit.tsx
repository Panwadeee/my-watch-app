import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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

export default function EditProductScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAdmin, authLoading } = useAuth();

  const API_BASE_URL = 'http://119.59.102.161:3033/api';

  // เฉพาะ admin เท่านั้นที่แก้ไขสินค้าได้ - กันกรณี user เข้าตรงๆ ผ่าน URL
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      if (Platform.OS === 'web') {
        window.alert('เฉพาะผู้ดูแลระบบ (admin) เท่านั้นที่แก้ไขสินค้าได้');
      } else {
        Alert.alert('ไม่มีสิทธิ์เข้าถึง', 'เฉพาะผู้ดูแลระบบ (admin) เท่านั้นที่แก้ไขสินค้าได้');
      }
      router.replace('/(tabs)/product');
    }
  }, [authLoading, isAdmin, router]);

  // State สำหรับเก็บข้อมูลสินค้า
  const [originalId, setOriginalId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [stockSize, setStockSize] = useState('');
  const [storesAvailability, setStoresAvailability] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImage, setUploadedImage] = useState('');

  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const storeOptions = ['Manchester, UK', 'Yorkshire, UK', 'Hull, UK'];

  const [submitting, setSubmitting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const pickProductImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('ต้องการสิทธิ์เข้าถึงรูปภาพ', 'กรุณาอนุญาตให้แอปเข้าถึงรูปภาพในเครื่อง');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.base64) {
        setUploadedImage(`data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`);
        setImageUrl('');
      } else {
        Alert.alert('เลือกรูปไม่สำเร็จ', 'ไม่สามารถอ่านไฟล์รูปจากเครื่องได้');
      }
    }
  };

  // ฟังก์ชันย้ายกลับหน้า Product
  const navigateToProducts = () => {
    router.replace('/(tabs)/product');
  };

  // ดึงข้อมูลจาก Params เมื่อเปิดหน้าจอ Edit
  useEffect(() => {
    if (!isLoaded && params) {
      const realId = params.id ? String(params.id) : (typeof id === 'string' ? id : '');
      const pCode = String(params.productCode || params.Productcode || realId);

      if (realId || pCode) {
        setOriginalId(realId);
        setItemCode(pCode);
        setName(params.name ? String(params.name) : '');
        setDescription(params.description ? String(params.description) : '');
        setCategory(params.category ? String(params.category) : '');
        setPrice(params.price !== undefined && params.price !== null ? String(params.price) : '');
        setStockSize(params.stock !== undefined && params.stock !== null ? String(params.stock) : '');
        setStoresAvailability(params.location_text || params.location ? String(params.location_text || params.location) : '');
        const existingImage = params.image_url || params.image ? String(params.image_url || params.image) : '';
        if (existingImage.startsWith('data:')) setUploadedImage(existingImage);
        else setImageUrl(existingImage);

        setIsLoaded(true);
      }
    }
  }, [params, isLoaded, id]);

  // Fetch สำรองหาก Params ไม่มีข้อมูล
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const targetFetchId = id || params.id || params.productCode;
        if (!targetFetchId) return;

        const response = await fetch(`${API_BASE_URL}/products/${targetFetchId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        const realId = data.id ? String(data.id) : String(targetFetchId);
        const pCode = String(data.productCode || data.Productcode || realId);

        setOriginalId(realId);
        setItemCode(pCode);
        setName(data.name || '');
        setDescription(data.description || '');
        setCategory(data.category ? String(data.category) : '');
        setPrice(data.price !== undefined && data.price !== null ? String(data.price) : '');
        setStockSize(data.stock !== undefined && data.stock !== null ? String(data.stock) : '');
        setStoresAvailability(data.location || '');
        const existingImage = data.image_url || data.image || '';
        if (String(existingImage).startsWith('data:')) setUploadedImage(String(existingImage));
        else setImageUrl(String(existingImage));
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    if ((id || params.id || params.productCode) && !isLoaded) {
      fetchProduct();
    }
  }, [id, params, isLoaded]);

  // ฟังก์ชันอัปเดตข้อมูลสินค้า
  const handleUpdateProduct = async () => {
    if (submitting) return;

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
      setSubmitting(true);

      const payload = {
        productCode: itemCode.trim(),
        name: name.trim(),
        stock: stockSize.trim() !== '' ? parseInt(stockSize, 10) : 0,
        price: price.trim() !== '' ? parseFloat(price) : 0,
        category: category.trim() || null,
        location: storesAvailability.trim() || null,
        status: 'Active',
        image_url: uploadedImage || imageUrl.trim() || null,
        description: description.trim() || null,
      };

      const targetKey = originalId || itemCode || id || params.id;
      const targetUrl = `${API_BASE_URL}/products/${encodeURIComponent(String(targetKey))}`;

      const response = await fetch(targetUrl, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok || response.status === 200 || response.status === 201) {
        if (Platform.OS === 'web') {
          window.alert('บันทึกแก้ไขสินค้าเรียบร้อยแล้ว');
          navigateToProducts();
        } else {
          Alert.alert('สำเร็จ', 'บันทึกแก้ไขสินค้าเรียบร้อยแล้ว', [
            { text: 'ตกลง', onPress: navigateToProducts },
          ]);
        }
      } else {
        const data = await response.json().catch(() => ({}));
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>

        <View style={styles.brandContainer}>
          <Text style={styles.brandTitle}>EDIT</Text>
          <Text style={styles.brandSubTitle}>PRODUCT DETAILS</Text>
        </View>

        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/modal')}>
          <Feather name="menu" size={22} color="#F8FAFC" />
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
            placeholder="ชื่อสินค้า"
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
            placeholder="รหัสสินค้า (e.g. PRD-001)"
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
              placeholder="ราคา (฿)"
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
              placeholder="จำนวนสต็อก"
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
            placeholder="หมวดหมู่ (เช่น Accessories, Electronics)"
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
              {storesAvailability || 'Select Warehouse / Store'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#D4AF37" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Image URL (Optional)</Text>
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickProductImage} activeOpacity={0.8}>
            <Ionicons name="image-outline" size={20} color="#0F172A" />
            <Text style={styles.imagePickerButtonText}>Select Image</Text>
          </TouchableOpacity>
          {uploadedImage || imageUrl ? (
            <Image source={{ uri: uploadedImage || imageUrl }} style={styles.imagePreview} resizeMode="contain" />
          ) : null}
          <TextInput
            style={styles.photoInput}
            value={imageUrl}
            onChangeText={(value) => {
              setImageUrl(value);
              setUploadedImage('');
            }}
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
            placeholder="Additional product details..."
            placeholderTextColor="#64748B"
          />
        </View>

        {/* ปุ่มบันทึกการแก้ไข */}
        <TouchableOpacity
          style={styles.saveButton}
          activeOpacity={0.7}
          onPress={handleUpdateProduct}
        >
          {submitting ? (
            <ActivityIndicator color="#0F172A" />
          ) : (
            <Text style={styles.saveButtonText}>UPDATE PRODUCT</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Dropdown */}
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
          <Ionicons name="add-circle-outline" size={22} color="#94A3B8" />
          <Text style={styles.navText}>Add</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={navigateToProducts}>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 140,
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
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D4AF37',
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 10,
  },
  imagePickerButtonText: { color: '#0F172A', fontWeight: '700' },
  imagePreview: {
    width: '100%',
    height: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 10,
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