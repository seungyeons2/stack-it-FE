import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MainScreen from '../screens/MainScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import MyPageScreen from '../screens/MyPageScreen';

// SVG imports
import HomeIcon from '../../assets/icons/home.svg';
import HomeSelectedIcon from '../../assets/icons/home-selected.svg';
import ChatbotIcon from '../../assets/icons/chatbot.svg';
import ChatbotSelectedIcon from '../../assets/icons/chatbot-selected.svg';
import MyPageIcon from '../../assets/icons/mypage.svg';
import MyPageSelectedIcon from '../../assets/icons/mypage-selected.svg';

const Tab = createBottomTabNavigator();

const MainTab = () => {
    console.log('MainTab 나타났음');
    return (
        <Tab.Navigator
        screenOptions={({ route }) => ({
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
        zIndex: 999, // 추가
        },
        tabBarIcon: ({ focused, size }) => {
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
    })}
    tabBarOptions={{
        showLabel: false,
        style: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 0,
        backgroundColor: '#003340',
        borderTopColor: 'transparent',
        height: 65,
        },
    }}
    >
<Tab.Screen name="Home" component={MainScreen} />
      <Tab.Screen name="Chatbot" component={ChatbotScreen} />
      <Tab.Screen name="MyPage" component={MyPageScreen} />
    </Tab.Navigator>
    );
};

export default MainTab;