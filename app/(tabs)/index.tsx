import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F7FA" />
      
      {/* 1. Header ด้านบนสุด */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/modal')}>
          <Ionicons name="menu" size={28} color="#4A148C" />
        </TouchableOpacity>
        
        <Text style={styles.logoText}>Inventor. io</Text>
        
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/settings')}
        >
          <Ionicons name="person-outline" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* 2. ScrollView หลัก */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* --- Section 1: Recent activity --- */}
        <Text style={styles.sectionTitle}>Recent activity</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>741</Text>
            <Text style={styles.statUnit}>Qty</Text>
            <Text style={styles.statLabel}>NEW ITEMS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>123</Text>
            <Text style={styles.statUnit}>Qty</Text>
            <Text style={styles.statLabel}>NEW ORDERS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statUnit}>Qty</Text>
            <Text style={styles.statLabel}>REFUNDS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statUnit}>Qty</Text>
            <Text style={styles.statLabel}>MESSAGE</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statUnit}>Qty</Text>
            <Text style={styles.statLabel}>GROUPS</Text>
          </View>
          
          {/* View More Card ปรับรูปแบบตามภาพ */}
          <TouchableOpacity style={styles.viewMoreCard}>
            <View style={styles.viewMoreCircle}>
              <Ionicons name="chevron-forward" size={14} color="#7E57C2" />
            </View>
            <Text style={styles.viewMoreText}>View more</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* --- Section 2: Sales (กราฟแท่ง) --- */}
        <Text style={styles.sectionTitle}>Sales</Text>
        <View style={styles.chartCard}>
          {/* เส้น Grid Lines ด้านหลังกราฟ */}
          <View style={styles.chartBackgroundLines}>
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
          </View>

          <View style={styles.chartContent}>
            <View style={styles.barGroup}>
              <View style={[styles.bar, { height: 95, backgroundColor: '#B388FF' }]} />
              <Text style={styles.barLabel}>Confirmed</Text>
            </View>
            <View style={styles.barGroup}>
              <View style={[styles.bar, { height: 145, backgroundColor: '#7C4DFF' }]} />
              <Text style={styles.barLabel}>Packed</Text>
            </View>
            <View style={styles.barGroup}>
              <View style={[styles.bar, { height: 45, backgroundColor: '#B388FF' }]} />
              <Text style={styles.barLabel}>Refunded</Text>
            </View>
            <View style={styles.barGroup}>
              <View style={[styles.bar, { height: 145, backgroundColor: '#4A148C' }]} />
              <Text style={styles.barLabel}>Shipped</Text>
            </View>
          </View>
          {/* เส้นฐานของกราฟ */}
          <View style={styles.chartBaseLine} />
        </View>

        <View style={styles.divider} />

        {/* --- Section 3: Top item categories (กล่องไอคอนม่วงพาสเทล) --- */}
        <Text style={styles.sectionTitle}>Top item categories</Text>
        <View style={styles.iconGrid}>
          <View style={styles.iconCard}><FontAwesome5 name="tshirt" size={24} color="#4A148C" /></View>
          <View style={styles.iconCard}><FontAwesome5 name="hat-cowboy" size={24} color="#4A148C" /></View>
          <View style={styles.iconCard}><FontAwesome5 name="shopping-bag" size={24} color="#4A148C" /></View>
          <View style={styles.iconCard}><MaterialCommunityIcons name="roller-skate" size={28} color="#4A148C" /></View>
          <View style={styles.iconCard}><FontAwesome5 name="backpack" size={24} color="#4A148C" /></View>
          <View style={styles.iconCard}><FontAwesome5 name="glasses" size={24} color="#4A148C" /></View>
        </View>
        <TouchableOpacity style={styles.centerLink}>
          <Text style={styles.viewMoreLinkText}>View more</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* --- Section 4: Top item categories (ตารางสรุป) --- */}
        <Text style={styles.sectionTitle}>Top item categories</Text>
        <View style={styles.infoListCard}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: '#7C4DFF', fontWeight: '600' }]}>Low stock items</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={[styles.infoValue, { color: '#7C4DFF', fontWeight: '600' }]}>12 </Text>
              <Ionicons name="information-circle-outline" size={15} color="#7C4DFF" />
            </View>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Item categories</Text>
            <Text style={styles.infoValue}>6</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Refunded items</Text>
            <Text style={styles.infoValue}>1</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* --- Section 5: Stores list --- */}
        <Text style={styles.sectionTitle}>Stores list</Text>
        <View style={styles.infoListCard}>
          {['Manchester, UK', 'Yorkshire, UK', 'Hull, UK', 'Leicester, UK'].map((store, index) => (
            <TouchableOpacity key={index} style={[styles.storeRow, index === 3 && { borderBottomWidth: 0 }]}>
              <Text style={styles.storeName}>{store}</Text>
              <Ionicons name="chevron-forward" size={14} color="#000000" />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7FA', // สีพื้นหลังหลักที่นุ่มนวลขึ้นตามภาพ
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 70,
    backgroundColor: '#F8F7FA',
  },
  menuButton: {
    padding: 4,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4A148C',
    fontFamily: 'System',
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
    paddingBottom: 100, // เผื่อพื้นที่ให้ Bottom Tab ด้านล่างไม่บังข้อมูล
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    width: '31%',
    alignItems: 'center',
    height: 95,
    justifyContent: 'center',
    // เงาบางๆ สไตล์ iOS/Android ให้การ์ดลอยขึ้นมาเล็กน้อยเหมือนต้นฉบับ
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A148C',
  },
  statUnit: {
    fontSize: 11,
    color: '#7C4DFF',
    fontWeight: '600',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  viewMoreCard: {
    backgroundColor: '#F8F7FA',
    borderRadius: 18,
    padding: 12,
    width: '31%',
    alignItems: 'center',
    height: 95,
    justifyContent: 'center',
  },
  viewMoreCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#D1C4E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  viewMoreText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#7E57C2',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 28,
    marginBottom: 8,
  },
  chartCard: {
    backgroundColor: '#E1D5F5', // สีม่วงพาสเทลตามรูปภาพ
    borderRadius: 20,
    paddingTop: 30,
    paddingBottom: 10,
    height: 220,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  chartBackgroundLines: {
    position: 'absolute',
    top: 25,
    left: 15,
    right: 15,
    bottom: 45,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: '#CEBEEB',
  },
  chartContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
    zIndex: 2,
    paddingHorizontal: 10,
  },
  barGroup: {
    alignItems: 'center',
    width: '22%',
  },
  bar: {
    width: 15,
    borderRadius: 7,
    marginBottom: 10,
  },
  barLabel: {
    fontSize: 11,
    color: '#333333',
    fontWeight: '500',
  },
  chartBaseLine: {
    position: 'absolute',
    bottom: 32,
    left: 15,
    right: 15,
    height: 2,
    backgroundColor: '#000000',
    zIndex: 1,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 12,
  },
  iconCard: {
    backgroundColor: '#E1D5F5', // ปรับเป็นม่วงอ่อนพาสเทลตามดีไซน์
    width: '30.5%',
    height: 85,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLink: {
    alignItems: 'center',
    marginVertical: 12,
  },
  viewMoreLinkText: {
    fontSize: 13,
    color: '#9E9E9E',
  },
  infoListCard: {
    backgroundColor: '#F0EFF2', // พื้นหลังสีเทาอ่อนมนๆ
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0DDE3',
  },
  infoLabel: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '400',
  },
  infoValue: {
    fontSize: 16,
    color: '#333333',
  },
  storeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0DDE3',
  },
  storeName: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '400',
  },
});