import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';

export default function TabLayout() {
  const { isAdmin } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      {/* 1. แท็บ Home */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Ionicons 
                name={focused ? "home-sharp" : "home-outline"} 
                size={24} 
                color={focused ? "#D4AF37" : "#64748B"} 
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>Home</Text>
            </View>
          ),
        }}
      />

      {/* 2. แท็บ Add - แสดงเฉพาะ admin */}
      <Tabs.Screen
        name="add"
        options={{
          href: isAdmin ? undefined : null,
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Ionicons 
                name={focused ? "add-circle-sharp" : "add-circle-outline"} 
                size={25} 
                color={focused ? "#D4AF37" : "#64748B"} 
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>Add</Text>
            </View>
          ),
        }}
      />

      {/* 3. แท็บ Product */}
      <Tabs.Screen
        name="product" 
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Ionicons 
                name={focused ? "bag-sharp" : "bag-outline"} 
                size={23} 
                color={focused ? "#D4AF37" : "#64748B"} 
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>Product</Text>
            </View>
          ),
        }}
      />

      {/* 4. แท็บ Categories */}
      <Tabs.Screen
        name="categories"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Ionicons 
                name={focused ? "shapes-sharp" : "shapes-outline"} 
                size={22} 
                color={focused ? "#D4AF37" : "#64748B"} 
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>Categories</Text>
            </View>
          ),
        }}
      />

      {/* ซ่อนหน้าอื่นๆ ที่ไม่ได้ใช้ใน Tab Bar */}
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="stores" options={{ href: null }} />
      <Tabs.Screen name="finances" options={{ href: null }} />
      <Tabs.Screen name="edit" options={{ href: null }} />
      <Tabs.Screen name="details" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#1E293B', // สีเดียวกับการ์ด Dark Mode
    borderTopWidth: 1,
    borderTopColor: '#334155', // เส้นขอบสีเทาเข้มตัดขอบสวยงาม
    height: 75,
    paddingBottom: 12,
    paddingTop: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 85,
  },
  tabLabel: {
    fontSize: 12,
    color: '#64748B', // สีตัวหนังสือตอนไม่เลือก (สีเทาอ่อน)
    marginTop: 5,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#D4AF37', // สีตัวหนังสือตอนถูกเลือก (สีทอง)
    fontWeight: '700',
  },
});