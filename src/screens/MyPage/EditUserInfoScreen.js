import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { getNewAccessToken } from '../../Utils/token';
import { fetchUserInfo } from '../../Utils/user';

const EditUserInfoScreen = ({ navigation }) => {
  console.log('📌 EditUserInfoScreen 렌더링');

  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const profileImage = 'https://via.placeholder.com/100';

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const accessToken = await getNewAccessToken(navigation);
        if (!accessToken) {
          console.error('❌ 액세스 토큰 없음, 로그인으로 이동');
          Alert.alert('인증 만료', '다시 로그인해주세요.');
          navigation.navigate('Login');
          return;
        }

        await fetchUserInfo(navigation, setUserInfo);
      } catch (err) {
        console.error('❌ 사용자 정보 불러오기 실패:', err);
        Alert.alert('오류', '사용자 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

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
              
      <View style={styles.profileSection}>
        <Image
          source={{ uri: userInfo?.profileImage || profileImage }}
          style={styles.profileImage}
        />
        <Text style={styles.userName}>{userInfo?.nickname || '닉네임 없음'}</Text>
      </View>

      <ScrollView>
      {/* <View style={styles.infoContainer}> */}
        <InfoItem label="닉네임" value={userInfo?.nickname || '없음'} />
        <InfoItem label="성별" value={userInfo?.gender === 'male' ? '남자' : userInfo?.gender === 'female' ? '여자' : '미등록'} />
        <InfoItem label="생일" value={userInfo?.birthdate || '미등록'} />
        <InfoItem label="이메일" value={userInfo?.email || '미등록'} />
        <InfoItem label="주소" value={userInfo?.address || '미등록'} />
      {/* </View> */}
    </ScrollView>
    </View>
  );
};

const InfoItem = ({ label, value }) => (
  <View style={styles.infoBox}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   backgroundColor: '#003340',
  //   alignItems: 'center',
  //   padding: 20,
  // },

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

  profileSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#F074BA',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },

  scrollContainer: {
    width: '100%',
  },
  
  // infoContainer: {
  //   width: '100%',
  // },
  infoBox: {
    backgroundColor: '#D4DDEF30',
    padding: 18,
    borderRadius: 10,
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 15,
    color: '#A9C4D3',
    marginBottom: 10,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 3,
  },
});

export default EditUserInfoScreen;
