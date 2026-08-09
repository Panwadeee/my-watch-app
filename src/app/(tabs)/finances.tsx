import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function FinancesScreen() {
  const router = useRouter();

  // ข้อมูลจำลองสำหรับกราฟแท่งเดี่ยว (Net Sales & Gross Profit)
  // ความสูงจำลองตามรูปภาพที่ส่งมา (ไล่ระดับจากน้อยไปมาก)
  const singleChartData = [
    { height: 30, color: '#EBE2FF' },
    { height: 75, color: '#7C3AED' },
    { height: 55, color: '#A78BFA' },
    { height: 45, color: '#EBE2FF' },
    { height: 45, color: '#EBE2FF' },
    { height: 60, color: '#A78BFA' },
    { height: 45, color: '#EBE2FF' },
    { height: 130, color: '#5B21B6' },
    { height: 120, color: '#5B21B6' },
    { height: 140, color: '#4C1D95' },
    { height: 90, color: '#7C3AED' },
    { height: 90, color: '#7C3AED' },
  ];

  return (
    <View style={styles.container}>
      {/* 📌 ROW 1: Header (Menu, Title, Profile) */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.push('/modal')}>
          <Feather name="menu" size={26} color="#6200EE" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Finances</Text>
        
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/settings')}
        >
          <Feather name="user" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* 📌 ROW 2: Filter Time Range */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.viewRangeButton}>
          <Text style={styles.viewRangeText}>View range</Text>
          <Feather name="chevron-down" size={16} color="#6200EE" />
        </TouchableOpacity>
        <Text style={styles.dateRangeText}>February 2023 - March 2023</Text>
      </View>

      {/* 📌 Scrollable Content Area */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 📊 CARD 1: Net sales */}
        <View style={styles.financeCard}>
          <Text style={styles.cardTitle}>Net sales</Text>
          <View style={styles.valueRow}>
            <Text style={styles.mainValue}>$4.103</Text>
            <Text style={styles.percentageText}>+2.12%</Text>
          </View>
          
          {/* กราฟแท่งจำลอง */}
          <View style={styles.chartWrapper}>
            <View style={styles.chartContainer}>
              {singleChartData.map((bar, index) => (
                <View 
                  key={`netsales-${index}`} 
                  style={[styles.chartBar, { height: bar.height, backgroundColor: bar.color }]} 
                />
              ))}
            </View>
            <View style={styles.chartBaseLine} />
          </View>
        </View>

        {/* 📊 CARD 2: Gross profit */}
        <View style={styles.financeCard}>
          <Text style={styles.cardTitle}>Gross profit</Text>
          <View style={styles.valueRow}>
            <Text style={styles.mainValue}>$3.819</Text>
            <Text style={styles.percentageText}>+1.40%</Text>
          </View>
          
          {/* กราฟแท่งจำลอง */}
          <View style={styles.chartWrapper}>
            <View style={styles.chartContainer}>
              {singleChartData.map((bar, index) => (
                <View 
                  key={`grossprofit-${index}`} 
                  style={[styles.chartBar, { height: bar.height, backgroundColor: bar.color }]} 
                />
              ))}
            </View>
            <View style={styles.chartBaseLine} />
          </View>
        </View>

        {/* 📊 CARD 3: Margin */}
        <View style={styles.financeCard}>
          <Text style={styles.cardTitle}>Margin</Text>
          <View style={styles.emptyDataContainer}>
            <Text style={styles.emptyDataText}>Not enough data</Text>
            <Text style={styles.emptyDataSubText}>to show the chart.</Text>
          </View>
        </View>

        {/* 📊 CARD 4: Revenue (Stacked Bar Chart) */}
        <View style={styles.revenueCard}>
          <Text style={styles.cardTitle}>Revenue</Text>
          
          {/* ส่วนของแท่งกราฟแบบซ้อนกลุ่ม (Stacked) */}
          <View style={[styles.chartWrapper, { marginTop: 20 }]}>
            <View style={[styles.chartContainer, { alignItems: 'flex-end', height: 160 }]}>
              {/* แท่งที่ 1 - 12 จำลองการซ้อนสีตามประเภทสินค้า */}
              {[
                { b: 15, t: 15, tp: 0, a: 30, j: 0 },
                { b: 15, t: 15, tp: 15, a: 30, j: 50 },
                { b: 15, t: 15, tp: 15, a: 30, j: 25 },
                { b: 15, t: 15, tp: 15, a: 30, j: 45 },
                { b: 15, t: 15, tp: 15, a: 50, j: 35 },
                { b: 15, t: 15, tp: 15, a: 30, j: 25 },
                { b: 15, t: 15, tp: 15, a: 30, j: 50 },
                { b: 15, t: 15, tp: 15, a: 30, j: 25 },
                { b: 15, t: 15, tp: 15, a: 50, j: 35 },
                { b: 15, t: 15, tp: 15, a: 30, j: 65 },
                { b: 15, t: 15, tp: 15, a: 30, j: 55 },
                { b: 15, t: 15, tp: 15, a: 45, j: 45 },
              ].map((stack, idx) => (
                <View key={`revenue-${idx}`} style={styles.stackedBarColumn}>
                  {stack.j > 0 && <View style={[styles.stackSegment, { height: stack.j, backgroundColor: '#6B8E7D', borderTopLeftRadius: 6, borderTopRightRadius: 6 }]} />}
                  {stack.a > 0 && <View style={[styles.stackSegment, { height: stack.a, backgroundColor: '#4C00B4', borderTopLeftRadius: stack.j ? 0 : 6, borderTopRightRadius: stack.j ? 0 : 6 }]} />}
                  {stack.tp > 0 && <View style={[styles.stackSegment, { height: stack.tp, backgroundColor: '#A78BFA' }]} />}
                  {stack.t > 0 && <View style={[styles.stackSegment, { height: stack.t, backgroundColor: '#D9A406' }]} />}
                  <View style={[styles.stackSegment, { height: stack.b, backgroundColor: '#EBE2FF', borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }]} />
                </View>
              ))}
            </View>
            <View style={styles.chartBaseLine} />
          </View>

          {/* คำอธิบายสีกราฟด้านล่าง */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#EBE2FF' }]} /><Text style={styles.legendText}>Bottoms</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#A78BFA' }]} /><Text style={styles.legendText}>T-shirt</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#D9A406' }]} /><Text style={styles.legendText}>Tops</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#4C00B4' }]} /><Text style={styles.legendText}>Accessories</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#6B8E7D' }]} /><Text style={styles.legendText}>Jeans</Text></View>
          </View>
        </View>
      </ScrollView>

      {/* 📌 5. Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
          <Ionicons name="home-outline" size={22} color="#A78BFA" />
          <Text style={[styles.navText, { color: '#A78BFA' }]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/add')}>
          <Ionicons name="add-circle-outline" size={22} color="#A78BFA" />
          <Text style={[styles.navText, { color: '#A78BFA' }]}>Add</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/product')}>
          <Ionicons name="bag-outline" size={22} color="#A78BFA" />
          <Text style={[styles.navText, { color: '#A78BFA' }]}>Products</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/categories')}>
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
    backgroundColor: '#F9F9FB',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  viewRangeButton: {
    backgroundColor: '#EBE2FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  viewRangeText: {
    color: '#4C00B4',
    fontSize: 15,
    fontWeight: '600',
  },
  dateRangeText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  financeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DCD6FA',
    marginBottom: 20,
  },
  revenueCard: {
    backgroundColor: '#F3F4F6', // พื้นหลังสีเทาอ่อนตามรูปชาร์ต Revenue
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  mainValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#6200EE',
  },
  percentageText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  chartWrapper: {
    width: '100%',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    paddingHorizontal: 4,
  },
  chartBar: {
    width: 10,
    borderRadius: 6,
  },
  chartBaseLine: {
    height: 1.5,
    backgroundColor: '#4B5563',
    marginTop: 4,
    width: '100%',
  },
  emptyDataContainer: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDataText: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  emptyDataSubText: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '400',
    marginTop: 4,
  },
  stackedBarColumn: {
    width: 12,
    flexDirection: 'column-reverse', 
    alignItems: 'center',
  },
  stackSegment: {
    width: '100%',
    marginBottom: 1,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
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
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
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