import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function AddProductScreen() {
  const router = useRouter();
  
  // State สำหรับจัดการข้อมูลในฟิลด์ต่างๆ
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [stockSize, setStockSize] = useState('');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* 1. Header ด้านบนสุด */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#4A148C" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Add product</Text>
        
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-outline" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* 2. ฟอร์มกรอกข้อมูลรูปแบบเลื่อนได้ (ScrollView) */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        
        {/* Name* */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Name*</Text>
          <TextInput
            style={styles.singleInput}
            value={name}
            onChangeText={setName}
            placeholderTextColor="#A0A0A0"
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={styles.multiInput}
            value={description}
            onChangeText={setDescription}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Category* */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Category*</Text>
          <TextInput
            style={styles.singleInput}
            value={category}
            onChangeText={setCategory}
          />
        </View>

        {/* Price* */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Price*</Text>
          <TextInput
            style={styles.singleInput}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
        </View>

        {/* Item code* */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Item code*</Text>
          <TextInput
            style={styles.singleInput}
            value={itemCode}
            onChangeText={setItemCode}
          />
        </View>

        {/* Stock size* */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Stock size*</Text>
          <TextInput
            style={styles.singleInput}
            value={stockSize}
            onChangeText={setStockSize}
            keyboardType="numeric"
          />
        </View>

        {/* Stores availability* (Dropdown Style) */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Stores availability*</Text>
          <TouchableOpacity style={styles.dropdownInput} activeOpacity={0.7}>
            <Text style={styles.dropdownText}></Text>
            <Ionicons name="chevron-down" size={18} color="#4A148C" style={styles.dropdownIcon} />
          </TouchableOpacity>
        </View>

        {/* Product photos* */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Product photos*</Text>
          <TouchableOpacity style={styles.photoBoxContainer} activeOpacity={0.8}>
            {/* กล่องเปล่าสีเทาสำหรับใส่รูปภาพตามดีไซน์ในภาพ */}
          </TouchableOpacity>
        </View>

        {/* Save Product Button */}
        <TouchableOpacity style={styles.saveButton} activeOpacity={0.9}>
          <Text style={styles.saveButtonText}>Save product</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 70,
    backgroundColor: '#FFFFFF',
  },
  menuButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4A148C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 120, // เผื่อพื้นที่ด้านล่างไม่ให้โดน Navigation Bar บัง
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 10,
    paddingLeft: 2,
  },
  singleInput: {
    backgroundColor: '#F3F2F5', // สีเทาอ่อนพาสเทลตามภาพเป๊ะๆ
    height: 62,
    borderRadius: 20,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#000000',
  },
  multiInput: {
    backgroundColor: '#F3F2F5',
    height: 160, // ความสูงกล่อง Description ล้อตามสัดส่วนภาพ
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    fontSize: 16,
    color: '#000000',
  },
  dropdownInput: {
    backgroundColor: '#F3F2F5',
    height: 62,
    borderRadius: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#000000',
  },
  dropdownIcon: {
    position: 'absolute',
    right: 20,
  },
  photoBoxContainer: {
    backgroundColor: '#F3F2F5',
    height: 185, // กล่องอัปโหลดรูปภาพขนาดใหญ่ตามสัดส่วนภาพที่ 3
    borderRadius: 24,
  },
  saveButton: {
    backgroundColor: '#4A148C', // สีม่วงเข้มหลักของแอปพลิเคชัน
    height: 60,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    // เงาปุ่มกดแบบนุ่มนวล
    shadowColor: '#4A148C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});