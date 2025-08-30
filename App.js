import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './src/navigation/StackNavigator';
import { setupNotificationListeners } from './src/services/PushNotificationService';

export default function App() {
  const navigationRef = useRef();
  const cleanupRef = useRef();

  useEffect(() => {

    const initializeNotifications = () => {
      if (navigationRef.current) {
        console.log('expo 푸시알림 리스너 초기화');
        const cleanup = setupNotificationListeners(navigationRef.current);
        cleanupRef.current = cleanup;
        
        return cleanup;
      }
    };

    const timer = setTimeout(initializeNotifications, 1000);

    return () => {
      clearTimeout(timer);
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <StackNavigator />
    </NavigationContainer>
  );
}