// src/screens/Settings/ThemeSelectorScreen.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useTheme } from '../../utils/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;
const CARD_HEIGHT = 80;

const ThemeSelectorScreen = ({ navigation }) => {
  const { theme, currentTheme, changeTheme, themes } = useTheme();

  const themeOptions = [
    {
      id: 'default',
      name: 'Default',
      gradient: ['#003340', '#00556F', '#F074BA'],
    },
    {
      id: 'stack',
      name: 'Main',
      gradient: ['#F8FAF5', '#2CAD66', '#7FD99A'],
    },
    {
      id: 'premium',
      name: 'Premium',
      gradient: ['#0A1929', '#132F4C', '#FFD700'],
    },
    {
      id: 'sakura',
      name: 'Sakura',
      gradient: ['#FFF5F7', '#FFB7C5', '#98D8C8'],
    },
    {
      id: 'ocean',
      name: 'Ocean',
      gradient: ['#001C30', '#00324A', '#00D4FF'],
    },
    {
      id: 'autumn',
      name: 'Autumn',
      gradient: ['#2C1810', '#3E2418', '#DA8848'],
    },
    {
      id: 'midnight',
      name: 'Midnight',
      gradient: ['#1A0F2E', '#2D1B4E', '#9370DB'],
    },
  ];

  const handleThemeChange = async (themeId) => {
    // 햅틱 피드백
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const success = await changeTheme(themeId);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <StatusBar barStyle="light-content" />
      
      {/* iOS 스타일 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <Icon name="chevron-left" size={28} color={theme.accent.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
            테마
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.text.secondary }]}>
            Theme Selection
          </Text>
        </View>
        
        <View style={{ width: 28 }} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 현재 테마 배너 */}
        <View style={styles.currentThemeSection}>
          <Text style={[styles.sectionLabel, { color: theme.text.secondary }]}>
            CURRENT THEME
          </Text>
          <LinearGradient
            colors={themeOptions.find(t => t.id === currentTheme)?.gradient || themeOptions[0].gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.currentThemeBanner}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>
                {themeOptions.find(t => t.id === currentTheme)?.name || 'Default'}
              </Text>
            </View>
            <View style={styles.activeIndicator}>
              <Icon name="check-circle" size={20} color="#FFFFFF" />
            </View>
          </LinearGradient>
        </View>

        {/* 테마 그리드 */}
        <View style={styles.themesSection}>
          <Text style={[styles.sectionLabel, { color: theme.text.secondary }]}>
            ALL THEMES
          </Text>
          <View style={styles.themeGrid}>
            {themeOptions.map((option, index) => {
              const isSelected = currentTheme === option.id;
              
              return (
                <View key={option.id} style={styles.themeCardWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.themeCard,
                      isSelected && styles.themeCardSelected,
                    ]}
                    onPress={() => handleThemeChange(option.id)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={option.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.themeCardGradient}
                    >
                      {/* 선택 체크 오버레이 */}
                      {isSelected && (
                        <View style={styles.selectedOverlay}>
                          <View style={styles.checkBadge}>
                            <Icon name="check" size={12} color="#FFFFFF" />
                          </View>
                        </View>
                      )}
                    </LinearGradient>
                    
                    {/* iOS 스타일 카드 글로우 이펙트 */}
                    {isSelected && (
                      <View style={styles.cardGlow} />
                    )}
                  </TouchableOpacity>
                  
                  {/* 카드 아래 텍스트 */}
                  <Text style={[
                    styles.cardLabel,
                    { color: isSelected ? theme.accent.primary : theme.text.secondary }
                  ]}>
                    {option.name}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* iOS 스타일 인포 카드 */}
        <View style={[styles.infoCard, { backgroundColor: theme.background.card }]}>
          <View style={[styles.infoIconCircle, { backgroundColor: theme.accent.primary + '20' }]}>
            <Icon name="info" size={16} color={theme.accent.primary} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoTitle, { color: theme.text.primary }]}>
              자동 저장
            </Text>
            <Text style={[styles.infoText, { color: theme.text.secondary }]}>
              테마는 앱 전체에 즉시 적용되며{'\n'}다음 실행 시에도 유지됩니다
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -12,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    opacity: 0.6,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  
  // 현재 테마 섹션
  currentThemeSection: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    opacity: 0.6,
  },
  currentThemeBanner: {
    height: 70,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  activeIndicator: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // 테마 그리드
  themesSection: {
    marginBottom: 24,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  themeCardWrapper: {
    width: CARD_WIDTH,
    alignItems: 'center',
    gap: 8,
  },
  themeCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  themeCardSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },
  themeCardGradient: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardGlow: {
    position: 'absolute',
    top: -1.5,
    left: -1.5,
    right: -1.5,
    bottom: -1.5,
    borderRadius: 17.5,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: -1,
  },
  
  // 인포 카드
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  infoIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    flex: 1,
    gap: 4,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.8,
  },
});

export default ThemeSelectorScreen;


// ========================================
// src/utils/theme.js
// ========================================

export const themes = {
  default: {
    background: {
      primary: '#003340',
      secondary: '#004455',
      card: 'rgba(255, 255, 255, 0.09)',
    },
    text: {
      primary: '#EFF1F5',
      secondary: '#B8C5D1',
      tertiary: '#6B7280',
      disabled: '#AAAAAA',
    },
    accent: {
      primary: '#F074BA',
      light: '#FFD1EB',
      pale: '#fb9dd2ff',
    },
    status: {
      up: '#F074BA',
      down: '#00BFFF',
      same: '#AAAAAA',
      success: '#6EE69E',
      error: '#FF6B6B',
    },
    chart: {
      colors: [
        '#F074BA', '#3B82F6', '#34D399', '#10B981',
        '#F59E0B', '#EF4444', '#6366F1', '#8B5CF6',
        '#EC4899', '#F87171', '#FBBF24', '#4ADE80',
        '#22D3EE', '#60A5FA', '#A78BFA', '#F472B6',
      ],
    },
    button: {
      primary: '#F074BA',
      secondary: '#EFF1F5',
      info: '#6366F1',
    },
    border: {
      light: 'rgba(255, 255, 255, 0.08)',
      medium: 'rgba(255, 255, 255, 0.1)',
    },
  },

  stack: {
    background: {
      primary: '#F8FAF5',
      secondary: '#E8EFE5',
      card: 'rgba(44, 173, 102, 0.08)',
    },
    text: {
      primary: '#1A2E1A',
      secondary: '#2D5A3D',
      tertiary: '#6B8E70',
      disabled: '#A8B5A8',
    },
    accent: {
      primary: '#2CAD66',
      light: '#7FD99A',
      pale: '#A8E6C1',
    },
    status: {
      up: '#2CAD66',
      down: '#FF8C42',
      same: '#8E9E8E',
      success: '#2CAD66',
      error: '#E85D4A',
    },
    chart: {
      colors: [
        '#2CAD66', '#4ECDC4', '#667EEA', '#95E1D3',
        '#7B68EE', '#3498DB', '#FFB84D', '#FF8C94',
        '#9B59B6', '#1ABC9C', '#5DADE2', '#AF7AC5',
        '#52C1B8', '#85C1E2', '#B19CD9', '#6C9A8B',
      ],
    },
    button: {
      primary: '#2CAD66',
      secondary: '#4ECDC4',
      info: '#667EEA',
    },
    border: {
      light: 'rgba(44, 173, 102, 0.12)',
      medium: 'rgba(44, 173, 102, 0.2)',
    },
  },

  premium: {
    background: {
      primary: '#0A1929',
      secondary: '#132F4C',
      card: 'rgba(255, 215, 0, 0.05)',
    },
    text: {
      primary: '#F0F3F7',
      secondary: '#C2CDD9',
      tertiary: '#8B99A8',
      disabled: '#647586',
    },
    accent: {
      primary: '#FFD700',
      light: '#FFE97F',
      pale: '#FFF4CC',
    },
    status: {
      up: '#FFD700',
      down: '#6495ED',
      same: '#90A4AE',
      success: '#4FC3F7',
      error: '#FF7961',
    },
    chart: {
      colors: [
        '#FFD700', '#6495ED', '#4FC3F7', '#BA68C8',
        '#FF8A65', '#4DD0E1', '#AED581', '#FFB74D',
        '#9575CD', '#4DB6AC', '#F06292', '#7986CB',
        '#64B5F6', '#81C784', '#FFD54F', '#A1887F',
      ],
    },
    button: {
      primary: '#FFD700',
      secondary: '#6495ED',
      info: '#4FC3F7',
    },
    border: {
      light: 'rgba(255, 255, 255, 0.08)',
      medium: 'rgba(255, 255, 255, 0.12)',
    },
  },

  sakura: {
    background: {
      primary: '#FFF5F7',
      secondary: '#FFE4E9',
      card: 'rgba(255, 192, 203, 0.08)',
    },
    text: {
      primary: '#2D1F2E',
      secondary: '#5A4A5E',
      tertiary: '#8B7A8F',
      disabled: '#B8ADB9',
    },
    accent: {
      primary: '#FFB7C5',
      light: '#FFD4DC',
      pale: '#FFEAF0',
    },
    status: {
      up: '#98D8C8',
      down: '#F7A4BC',
      same: '#C5B8C9',
      success: '#7EC4B6',
      error: '#E88D99',
    },
    chart: {
      colors: [
        '#FFB7C5', '#98D8C8', '#C5A3D9', '#A8D8EA',
        '#FFCAD4', '#B4E7CE', '#E8BBE0', '#87CEEB',
        '#F7A4BC', '#7EC4B6', '#D4A5C7', '#9BD3D0',
        '#FFC9D4', '#A5D8CF', '#E0B8D3', '#7FD5D5',
      ],
    },
    button: {
      primary: '#FFB7C5',
      secondary: '#98D8C8',
      info: '#C5A3D9',
    },
    border: {
      light: 'rgba(255, 183, 197, 0.15)',
      medium: 'rgba(255, 183, 197, 0.25)',
    },
  },

  ocean: {
    background: {
      primary: '#001C30',
      secondary: '#00324A',
      card: 'rgba(0, 212, 255, 0.08)',
    },
    text: {
      primary: '#E3F4FF',
      secondary: '#B3DAF0',
      tertiary: '#7FAEC8',
      disabled: '#5A8CAF',
    },
    accent: {
      primary: '#00D4FF',
      light: '#66E4FF',
      pale: '#B3F0FF',
    },
    status: {
      up: '#4DFFA6',
      down: '#FF6B9D',
      same: '#7BA3B8',
      success: '#26E7A6',
      error: '#FF5C7C',
    },
    chart: {
      colors: [
        '#00D4FF', '#4DFFA6', '#FF6B9D', '#B794F4',
        '#38B6FF', '#5EE3C1', '#FF8FB1', '#9D7EF0',
        '#0099CC', '#4ECDC4', '#FF85A2', '#8B7FC7',
        '#26C6DA', '#7FD99A', '#FFA0BA', '#A78BFA',
      ],
    },
    button: {
      primary: '#00D4FF',
      secondary: '#4DFFA6',
      info: '#B794F4',
    },
    border: {
      light: 'rgba(0, 212, 255, 0.12)',
      medium: 'rgba(0, 212, 255, 0.2)',
    },
  },

  autumn: {
    background: {
      primary: '#2C1810',
      secondary: '#3E2418',
      card: 'rgba(218, 136, 72, 0.08)',
    },
    text: {
      primary: '#FFF5E6',
      secondary: '#E8D2B8',
      tertiary: '#C4A885',
      disabled: '#9E8870',
    },
    accent: {
      primary: '#DA8848',
      light: '#F4B17A',
      pale: '#FFD6A5',
    },
    status: {
      up: '#E8A24E',
      down: '#9B6B4D',
      same: '#A89080',
      success: '#C69F73',
      error: '#D64545',
    },
    chart: {
      colors: [
        '#DA8848', '#B4846C', '#E8A24E', '#8B6F47',
        '#F4B17A', '#A67B5B', '#FFB366', '#9E7C5A',
        '#E09F3E', '#8B7355', '#FFD085', '#A28A6B',
        '#D4A574', '#7A6148', '#FFC872', '#B8956A',
      ],
    },
    button: {
      primary: '#DA8848',
      secondary: '#E8A24E',
      info: '#C69F73',
    },
    border: {
      light: 'rgba(218, 136, 72, 0.15)',
      medium: 'rgba(218, 136, 72, 0.25)',
    },
  },

  midnight: {
    background: {
      primary: '#1A0F2E',
      secondary: '#2D1B4E',
      card: 'rgba(147, 112, 219, 0.08)',
    },
    text: {
      primary: '#F0E6FF',
      secondary: '#C9B8E4',
      tertiary: '#9B86BD',
      disabled: '#7A6B94',
    },
    accent: {
      primary: '#9370DB',
      light: '#B8A4E0',
      pale: '#E0D5F7',
    },
    status: {
      up: '#A78BFA',
      down: '#60A5FA',
      same: '#8B7FA8',
      success: '#818CF8',
      error: '#F472B6',
    },
    chart: {
      colors: [
        '#9370DB', '#60A5FA', '#F472B6', '#34D399',
        '#8B5CF6', '#3B82F6', '#EC4899', '#10B981',
        '#A78BFA', '#60A5FA', '#F87171', '#14B8A6',
        '#C084FC', '#93C5FD', '#FDA4AF', '#6EE7B7',
      ],
    },
    button: {
      primary: '#9370DB',
      secondary: '#60A5FA',
      info: '#818CF8',
    },
    border: {
      light: 'rgba(147, 112, 219, 0.12)',
      medium: 'rgba(147, 112, 219, 0.2)',
    },
  },
};

export const defaultTheme = themes.default;