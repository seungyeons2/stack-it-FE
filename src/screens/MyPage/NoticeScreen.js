// NoticeScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { API_BASE_URL, fetchAPI } from '../../utils/apiConfig';

// 🎨 테마 적용
import { useTheme } from '../../utils/ThemeContext';

const NoticeScreen = ({ navigation }) => {
  const { theme } = useTheme(); // 현재 테마 가져오기

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notices, setNotices] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  // 공지사항 목록 조회
  const loadNotices = async () => {
    try {
      const result = await fetchAPI('notification/');
      if (result.success) {
        console.log('공지사항 로딩 성공:', result.data.length, '개');
        setNotices(result.data);
      } else {
        console.error('공지사항 로딩 실패:', result.error);
        Alert.alert('공지사항을 불러오는 데 실패했습니다.');
      }
    } catch (error) {
      console.error('공지사항 로딩 중 오류:', error);
      Alert.alert('오류', '네트워크 연결을 확인해주세요.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadNotices();
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.background.primary, justifyContent: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color={theme.accent.primary} />
        <Text style={[styles.loadingText, { color: theme.text.primary }]}>
          공지사항을 불러오는 중...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* 뒤로가기 버튼 */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={[styles.backText, { color: theme.accent.primary }]}>{'<'}</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.text.primary }]}>공지사항</Text>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent.primary}
            colors={[theme.accent.primary]}
          />
        }
      >
        {notices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.text.secondary }]}>
              등록된 공지사항이 없습니다.
            </Text>
          </View>
        ) : (
          notices.map((notice) => (
            <TouchableOpacity
              key={notice.id}
              onPress={() => toggleExpand(notice.id)}
              style={[
                styles.noticeBox,
                {
                  backgroundColor: theme.background.card,
                  borderColor: theme.border.medium,
                  borderWidth: 1,
                },
              ]}
            >
              <View style={styles.noticeHeader}>
                <Text style={[styles.noticeTitle, { color: theme.text.primary }]}>
                  {notice.title}
                </Text>
                <Text style={[styles.noticeDate, { color: theme.text.tertiary }]}>
                  {formatDate(notice.created_at)}
                </Text>
              </View>

              {expandedId === notice.id && (
                <View style={styles.noticeContentContainer}>
                  <View
                    style={[styles.divider, { backgroundColor: theme.border.light }]}
                  />
                  <Text style={[styles.noticeContent, { color: theme.text.secondary }]}>
                    {notice.content.replace(/\\r\\n/g, '\n')}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default NoticeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backText: {
    fontSize: 36,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    textAlign: 'center',
  },
  scroll: {
    paddingBottom: 30,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  noticeBox: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  noticeDate: {
    fontSize: 12,
  },
  noticeContentContainer: {
    marginTop: 10,
  },
  divider: {
    height: 1,
    marginBottom: 10,
  },
  noticeContent: {
    fontSize: 15,
    lineHeight: 22,
  },
});
