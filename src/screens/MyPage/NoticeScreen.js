// NoticeScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

const dummyNotices = [
  {
    id: 1,
    title: '앱 업데이트 안내',
    content: '1.1.0 버전이 출시되었습니다. 새로운 기능과 안정성 개선이 포함되어 있습니다.',
  },
  {
    id: 2,
    title: '점검 안내',
    content: '4월 10일 오전 2시부터 3시까지 시스템 점검이 있을 예정입니다.',
  },
];

const NoticeScreen = ({navigation}) => {
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    // 추후 서버 연동 시 여기에 fetch 로직 추가
    const loadNotices = async () => {
      setLoading(true);
      try {
        // const res = await fetch('https://your-api/notice');
        // const data = await res.json();
        setNotices(dummyNotices);
      } catch (e) {
        console.error('공지사항 로딩 실패:', e);
      } finally {
        setLoading(false);
      }
    };
    loadNotices();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#F074BA" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backText}>{'<'}</Text>
              </TouchableOpacity>
      <Text style={styles.title}>공지사항</Text>
      <ScrollView contentContainerStyle={styles.scroll}>
        {notices.map((notice) => (
          <TouchableOpacity
            key={notice.id}
            onPress={() => toggleExpand(notice.id)}
            style={styles.noticeBox}
          >
            <Text style={styles.noticeTitle}>{notice.title}</Text>
            {expandedId === notice.id && (
              <Text style={styles.noticeContent}>{notice.content}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default NoticeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#003340',
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
        color: '#F074BA',
      },
//   title: {
//     fontSize: 20,
//     color: '#F8C7CC',
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
title: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scroll: {
    paddingBottom: 30,
  },
  noticeBox: {
    backgroundColor: '#D4DDEF30',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  noticeTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  noticeContent: {
    marginTop: 10,
    color: '#EEEEEE',
    fontSize: 15,
    lineHeight: 22,
  },
});
