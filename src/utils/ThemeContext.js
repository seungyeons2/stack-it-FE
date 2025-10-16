// src/utils/ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, defaultTheme } from './theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [theme, setTheme] = useState(defaultTheme);

  // 앱 시작 시 저장된 테마 불러오기
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('selectedTheme');
      if (savedTheme && themes[savedTheme]) {
        setCurrentTheme(savedTheme);
        setTheme(themes[savedTheme]);
        console.log('✅ [Theme] 테마 로드 완료:', savedTheme);
      }
    } catch (error) {
      console.error('❌ [Theme] 테마 로드 실패:', error);
    }
  };

  const changeTheme = async (themeName) => {
    try {
      if (themes[themeName]) {
        setCurrentTheme(themeName);
        setTheme(themes[themeName]);
        await AsyncStorage.setItem('selectedTheme', themeName);
        console.log('✅ [Theme] 테마 변경 완료:', themeName);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ [Theme] 테마 변경 실패:', error);
      return false;
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, changeTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};