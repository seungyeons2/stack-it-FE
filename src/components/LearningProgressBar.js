// components/LearningProgressBar.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

// 🎨 테마 훅 import
import { useTheme } from '../utils/ThemeContext';

const LearningProgressBar = ({ current = 12, total = 20 }) => {
  // 🎨 테마 가져오기
  const { theme } = useTheme();
  
  const progress = Math.min(current / total, 1);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.progressContainer, {
        backgroundColor: `${theme.status.success}4D` // 남은 부분 색 (투명도 30%)
      }]}>
        <View style={[styles.progressFill, { 
          flex: progress,
          backgroundColor: theme.status.success // 진행된 부분 색
        }]} />
        <View style={{ flex: 1 - progress }} />
      </View>
      <Text style={[styles.progressText, { color: theme.text.primary }]}>
        {current} / {total}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 15,
    overflow: 'hidden',
    height: 12,
    marginRight: 8,
  },
  progressFill: {
    // 동적 색상 적용됨
  },
  progressText: {
    fontWeight: 'bold',
    minWidth: 50,
    textAlign: 'right',
  },
});

export default LearningProgressBar;