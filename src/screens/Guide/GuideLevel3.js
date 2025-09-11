// GuideLevel3.js - Improved Version (keeping original clean design)
import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// SVG 아이콘 import
import CheckIcon from '../../assets/icons/studycheck.svg';
import LockIcon from '../../assets/icons/studylock.svg';
import StudyingIcon from '../../assets/icons/studying.svg';

import { API_BASE_URL } from '../../utils/apiConfig';
import { getNewAccessToken } from '../../utils/token';

const { width: screenWidth } = Dimensions.get('window');

const GuideLevel3 = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [contentProgress, setContentProgress] = useState({});
  const [error, setError] = useState(null);

  const fetchProgress = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const accessToken = await getNewAccessToken(navigation);
      if (!accessToken) {
        Alert.alert('인증 오류', '토큰이 만료되었습니다. 다시 로그인해주세요.');
        navigation.navigate('Login');
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}progress/level/3/content/`,
        {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!res.ok) {
        throw new Error(`Level 3 content fetch failed: ${res.status}`);
      }
      
      const data = await res.json();
      setContentProgress(data.content_progress || {});
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError(err.message);
      Alert.alert('데이터 오류', '진행도 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchProgress();
    }, [])
  );

  const handleRetry = () => {
    fetchProgress();
  };

  const handleChapterPress = (contentIndex) => {
    navigation.navigate('StudyScreen', {
      level: 3,
      contentIndex: contentIndex,
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>네트워크 오류</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // progress 객체를 [ { id, done }, ... ] 형태로 변환 & 정렬
  const entries = Object.entries(contentProgress)
    .map(([key, done]) => ({ id: Number(key), done }))
    .sort((a, b) => a.id - b.id);

  const firstIncomplete = entries.find(e => !e.done)?.id;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
        accessibilityLabel="뒤로가기"
      >
        <Text style={styles.backText}>{'<'}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>3단계</Text>

      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {entries.map(({ id, done }, idx) => {
          const isCurrentChapter = !done && id === firstIncomplete;
          let IconComponent;
          
          if (done) {
            IconComponent = <CheckIcon width={96} height={96} />;
          } else if (isCurrentChapter) {
            IconComponent = <StudyingIcon width={128} height={128} />;
          } else {
            IconComponent = <LockIcon width={96} height={96} />;
          }

          const isClickable = done || isCurrentChapter;

          return (
            <View
              key={id}
              style={[
                styles.stepContainer,
                idx % 2 === 0 ? styles.left : styles.right,
              ]}
            >
              <View style={styles.stepBox}>
                {isClickable ? (
                  <TouchableOpacity 
                    onPress={() => handleChapterPress(id)}
                    activeOpacity={0.7}
                    style={styles.iconTouchable}
                  >
                    {IconComponent}
                  </TouchableOpacity>
                ) : (
                  <View style={styles.iconContainer}>
                    {IconComponent}
                  </View>
                )}
                <Text style={styles.chapterLabel}>{`챕터 3-${id}`}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#037F9F',
    paddingHorizontal: 30,
  },
  
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10, // 터치 영역 확대
  },
  
  backText: {
    fontSize: 36,
    color: '#FFFFFF',
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: 60,
  },
  
  scrollView: {
    paddingBottom: 60,
    paddingTop: 20,
  },
  
  stepContainer: {
    width: '100%',
    marginVertical: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  left: {
    justifyContent: 'flex-start',
    paddingLeft: '15%',
  },
  
  right: {
    justifyContent: 'flex-end',
    paddingRight: '15%',
  },
  
  stepBox: {
    alignItems: 'center',
  },
  
  iconTouchable: {
    padding: 10, // 터치 영역 확대
  },
  
  iconContainer: {
    padding: 10,
    opacity: 0.6,
  },
  
  chapterLabel: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF40',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#003340A0',
    textAlign: 'center',
    minWidth: 80,
  },
  
  errorText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GuideLevel3;