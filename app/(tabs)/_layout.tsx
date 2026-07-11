import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function TabLayout() {
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
                name={focused ? "home-sharp" : "home-outline"} // ✨ ใช้ -sharp เพื่อความหนาทึบสวยงาม
                size={24} 
                color={focused ? "#4A148C" : "#A883E0"} 
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>Home</Text>
            </View>
          ),
        }}
      />

      {/* 2. แท็บ Add */}
      <Tabs.Screen
        name="add"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Ionicons 
                name={focused ? "add-circle-sharp" : "add-circle-outline"} // ✨ ใช้ -sharp เวลา focused
                size={25} 
                color={focused ? "#4A148C" : "#A883E0"} 
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
                name={focused ? "bag-sharp" : "bag-outline"} // ✨ เปลี่ยนจาก "bag" เป็น "bag-sharp" ทึบเต็มใบสวยๆ
                size={23} 
                color={focused ? "#4A148C" : "#A883E0"} 
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
                name={focused ? "shapes-sharp" : "shapes-outline"} // ✨ ใช้ "shapes-sharp" รูปทรงเรขาคณิตจะทึบสวยมาก
                size={22} 
                color={focused ? "#4A148C" : "#A883E0"} 
              />
              <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>Categories</Text>
            </View>
          ),
        }}
      />

      {/* 🚫 บรรทัดดักซ่อนกล่องกากบาท explore เก่าไม่ให้โผล่มากวนใจ */}
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="stores" options={{ href: null }} />
      <Tabs.Screen name="finances" options={{ href: null }} />
      
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E6E0F3', 
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
    fontSize: 13,
    color: '#A883E0', 
    marginTop: 5,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#4A148C', 
    fontWeight: 'bold',
  },
});