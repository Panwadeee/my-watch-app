import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';

export default function DetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isAdmin } = useAuth();

  const API_BASE_URL = 'http://119.59.102.161:3033/api';
  const [deleting, setDeleting] = useState(false);

  const {
    id,
    productCode,
    name,
    stock,
    price,
    category,
    location_text,
    brand,
    badge_status,
    image_url,
    description,
    sizes,
  } = params;

  // นำทางไปหน้า Edit
  const handleEdit = () => {
    router.push({
      pathname: '/(tabs)/edit',
      params: { ...params },
    });
  };

  // ยิง API ลบสินค้าจริง
  const executeDeleteAPI = async () => {
    const primaryId = id ? String(id) : '';
    const codeId = productCode ? String(productCode) : '';
    const targetKey = primaryId || codeId;

    if (!targetKey) {
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่พบ ID หรือ Product Code สำหรับส่งลบ');
      return;
    }

    try {
      setDeleting(true);

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
        const done = () => router.replace('/(tabs)/product');
        if (Platform.OS === 'web') {
          done();
        } else {
          Alert.alert('สำเร็จ', 'ลบสินค้าเรียบร้อยแล้ว', [{ text: 'ตกลง', onPress: done }]);
        }
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
      setDeleting(false);
    }
  };

  // ฟังก์ชันกดลบสินค้า
  const handleDelete = () => {
    if (deleting) return;

    if (Platform.OS === 'web') {
      if (window.confirm('คุณต้องการลบสินค้านี้ออกจากระบบใช่หรือไม่?')) executeDeleteAPI();
      return;
    }

    Alert.alert('Delete Product', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: executeDeleteAPI,
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PRODUCT DETAILS</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* รูปสินค้า */}
        <View style={styles.imageCard}>
          <Image
            source={{
              uri:
                typeof image_url === 'string' && image_url.startsWith('http')
                  ? image_url
                  : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
            }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* ข้อมูลสินค้าแบบการ์ดตาราง */}
        <View style={styles.infoCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price:</Text>
            <Text style={styles.priceValue}>฿{Number(price || 0).toLocaleString()}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Stock:</Text>
            <Text style={styles.stockValue}>{stock || '0'} items</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={styles.statusValue}>{badge_status || 'Active'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Product Code:</Text>
            <Text style={styles.detailValueBold}>{productCode || id || '-'}</Text>
          </View>

          {sizes ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Sizes:</Text>
              <Text style={styles.detailValueBold}>{sizes}</Text>
            </View>
          ) : null}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValueBold}>{location_text || '-'}</Text>
          </View>
        </View>

        {/* ปุ่ม Edit / Delete - เฉพาะ admin */}
        {isAdmin && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, styles.editBtn]} onPress={handleEdit}>
              <Text style={styles.actionBtnText}>Edit Product</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn, deleting && { opacity: 0.6 }]}
              onPress={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.actionBtnText}>Delete Product</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  iconButton: { padding: 4 },
  headerTitle: { color: '#D4AF37', fontSize: 16, fontWeight: '700', letterSpacing: 1.5 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  imageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  image: { width: '100%', height: 220 },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: { color: '#64748B', fontSize: 14, fontWeight: '500' },
  priceValue: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
  stockValue: { color: '#10B981', fontSize: 14, fontWeight: '700' },
  statusValue: { color: '#10B981', fontSize: 14, fontWeight: '700' },
  detailValueBold: { color: '#0F172A', fontSize: 14, fontWeight: '700' },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: { backgroundColor: '#8B5CF6' },
  deleteBtn: { backgroundColor: '#EF4444' },
  actionBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});