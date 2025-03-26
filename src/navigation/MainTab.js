import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MainScreen from '../screens/Main/MainScreen';
import ChatbotScreen from '../screens/Chatbot/ChatbotScreen';
import MyPageScreen from '../screens/MyPage/MyPageScreen';

// SVG imports
import HomeIcon from '../assets/icons/home.svg';
import HomeSelectedIcon from '../assets/icons/home-selected.svg';
import ChatbotIcon from '../assets/icons/chatbot.svg';
import ChatbotSelectedIcon from '../assets/icons/chatbot-selected.svg';
import MyPageIcon from '../assets/icons/mypage.svg';
import MyPageSelectedIcon from '../assets/icons/mypage-selected.svg';

const Tab = createBottomTabNavigator();

const MainTab = () => {
  console.log('MainTab 나타났음');
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#003340',
          borderTopColor: 'transparent',
          height: 65,
          paddingBottom: 15,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          zIndex: 999,
        },
        tabBarIcon: ({focused, size}) => {
          console.log(`Tab pressed: ${route.name}, focused: ${focused}`);
          let Icon;
          if (route.name === 'Home') {
            Icon = focused ? HomeSelectedIcon : HomeIcon;
          } else if (route.name === 'Chatbot') {
            Icon = focused ? ChatbotSelectedIcon : ChatbotIcon;
          } else {
            Icon = focused ? MyPageSelectedIcon : MyPageIcon;
          }
          return <Icon width={50} height={50} />;
        },
        tabBarShowLabel: false,
      })}>
      <Tab.Screen 
        name="Home" 
        component={MainScreen}
        listeners={{
          tabPress: e => {
            console.log('Home tab pressed');
          },
        }}
      />
      <Tab.Screen 
        name="Chatbot" 
        component={ChatbotScreen}
        listeners={{
          tabPress: e => {
            console.log('Chatbot tab pressed');
          },
        }}
      />
      <Tab.Screen 
        name="MyPage" 
        component={MyPageScreen}
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