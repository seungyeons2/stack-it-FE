import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MainScreen from '../screens/Main/MainScreen';
import GuideScreen from '../screens/Guide/GuideScreen';
import ChatbotScreen from '../screens/Chatbot/ChatbotScreen';
import MyPageScreen from '../screens/MyPage/MyPageScreen';

// 🎨 테마 훅 import
import { useTheme } from '../utils/ThemeContext';

// 🎉 Lucide 아이콘 import
import { Home, Pencil, MessageCircle, User } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

const MainTab = () => {
  // 🎨 테마 가져오기
  const { theme } = useTheme();
  
  console.log('MainTab 나타났음');
  const insets = useSafeAreaInsets();
  
  const getTabBarHeight = () => {
    const baseHeight = 60;
    const paddingBottom = Platform.OS === 'android' ? 
      Math.max(insets.bottom, 10) :
      insets.bottom + 10;
    
    return baseHeight + paddingBottom;
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background.primary,
          borderTopColor: 'transparent',
          height: getTabBarHeight(),
          paddingBottom: Platform.OS === 'android' ? 
            Math.max(insets.bottom, 10) : 
            insets.bottom + 10,
          paddingTop: 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: theme.accent.primary,
        tabBarInactiveTintColor: theme.accent.primary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={MainScreen}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({ focused, color }) => (
            <Home 
              size={24} 
              color={color}
              strokeWidth={focused ? 2.5 : 2}
              fill={focused ? color : 'transparent'}
            />
          ),
        }}
        listeners={{
          tabPress: e => {
            console.log('Home tab pressed');
          },
        }}
      />
      <Tab.Screen
        name="Guide"
        component={GuideScreen}
        options={{
          tabBarLabel: '학습',
          tabBarIcon: ({ focused, color }) => (
            <Pencil 
              size={24} 
              color={color}
              strokeWidth={focused ? 2.5 : 2}
              fill={focused ? color : 'transparent'}
            />
          ),
        }}
        listeners={{
          tabPress: e => {
            console.log('Guide tab pressed');
          },
        }}
      />
      <Tab.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{
          tabBarLabel: '챗봇',
          tabBarIcon: ({ focused, color }) => (
            <MessageCircle 
              size={24} 
              color={color}
              strokeWidth={focused ? 2.5 : 2}
              fill={focused ? color : 'transparent'}
            />
          ),
        }}
        listeners={{
          tabPress: e => {
            console.log('Chatbot tab pressed');
          },
        }}
      />
      <Tab.Screen
        name="MyPage"
        component={MyPageScreen}
        options={{
          tabBarLabel: '마이페이지',
          tabBarIcon: ({ focused, color }) => (
            <User 
              size={24} 
              color={color}
              strokeWidth={focused ? 2.5 : 2}
              fill={focused ? color : 'transparent'}
            />
          ),
        }}
        listeners={{
          tabPress: e => {
            console.log('MyPage tab pressed');
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTab;