import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNewAccessToken } from '../utils/token';

const MyPageScreen = ({ navigation }) => {
  console.log('📌 MyPageScreen 렌더링');

  const [userInfo, setUserInfo] = useState(null);

  const profileImage = 'https://via.placeholder.com/100';
  const userInfoUrl =
    'https://port-0-doodook-backend-lyycvlpm0d9022e4.sel4.cloudtype.app/users/me';
  // const tokenUrl =
  //   'https://port-0-doodook-backend-lyycvlpm0d9022e4.sel4.cloudtype.app/api/token/';

  // // 🔹 새로운 Access Token 요청 (이메일 + 비밀번호 로그인 방식)
  // const getNewAccessToken = async () => {
  //   try {
  //     const email = await AsyncStorage.getItem('userEmail');
  //     const password = await AsyncStorage.getItem('userPassword');

  //     if (!email || !password) {
  //       console.error('❌ 저장된 이메일 또는 비밀번호 없음');
  //       navigation.navigate('Login');
  //       return null;
  //     }

  //     console.log('🔄 Access Token 요청 중...');
  //     const response = await fetch(tokenUrl, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ email, password }),
  //     });

  //     console.log('📡 응답 상태 코드:', response.status);
  //     const responseText = await response.text();
  //     console.log('📡 응답 본문:', responseText);

  //     if (!response.ok) throw new Error('❌ Access Token 발급 실패');

  //     const data = JSON.parse(responseText);

  //     await AsyncStorage.setItem('accessToken', data.access);
  //     console.log('✅ 새 Access Token 저장 완료:', data.access);

  //     return data.access;
  //   } catch (error) {
  //     console.error('❌ Access Token 요청 실패:', error);
  //     return null;
  //   }
  // };

  // 🔹 사용자 정보 가져오기 (401 발생 시 자동 재시도)
  const fetchUserInfo = async (retry = true) => {
    let accessToken = await AsyncStorage.getItem('accessToken');

    if (!accessToken) {
      console.warn('⚠️ 액세스 토큰 없음. 새 토큰 요청 시도');
      accessToken = await getNewAccessToken();
      if (!accessToken) return;
    }

    // ✅ 새 Access Token이 저장될 때까지 대기 후 가져오기 (최신화 보장)
    accessToken = await AsyncStorage.getItem('accessToken');
    accessToken = accessToken ? accessToken.trim() : '';

    console.log('📡 사용 중인 액세스 토큰:', `Bearer ${accessToken}`);

    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(userInfoUrl, {
        method: 'GET',
        headers: headers,
        credentials: 'include', // ✅ cURL과 동일하게 서버에 인증 정보 포함
        cache: 'no-store',
      });

      console.log('📡 응답 상태 코드:', response.status);

      if (response.status === 401 && retry) {
        console.warn('⚠️ Access Token 만료됨. 새로 발급 후 재시도');
        const newAccessToken = await getNewAccessToken();
        if (newAccessToken) {
          console.log('✅ 새 Access Token 저장 완료:', newAccessToken);
          return fetchUserInfo(false); // 🔥 새 토큰으로 재시도 (단 1회만)
        } else {
          console.error('❌ 토큰 갱신 실패. 로그인 필요');
          navigation.navigate('Login');
          return;
        }
      }

      const responseText = await response.text();
      console.log('📡 응답 본문:', responseText);

      const data = JSON.parse(responseText);
      console.log('✅ 전체 데이터:', data);

      if (data?.id) {
        setUserInfo(data);
      } else {
        console.error('❌ 알 수 없는 응답 구조. 전체 응답:', data);
      }
    } catch (error) {
      console.error('❌ 사용자 정보 가져오기 실패:', error);
    }
  };

  useEffect(() => {
    const checkTokenAndFetch = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      console.log('🚀 useEffect() 실행 전 저장된 토큰:', token);
      fetchUserInfo();
    };

    checkTokenAndFetch();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <Image
          source={{ uri: userInfo?.profileImage || profileImage }}
          style={styles.profileImage}
        />
        <Text style={styles.userName}>{userInfo?.nickname || '닉네임 없음'}</Text>
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>닉네임:</Text>
          <Text style={styles.infoValue}>{userInfo?.nickname || '없음'}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>성별:</Text>
          <Text style={styles.infoValue}>{userInfo?.gender === 'male' ? '남자' : '여자'}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>생일:</Text>
          <Text style={styles.infoValue}>{userInfo?.birthdate || '미등록'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#012A3A',
    alignItems: 'center',
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 40,
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
  infoContainer: {
    width: '90%',
    marginTop: 30,
  },
  infoBox: {
    backgroundColor: '#2C4A52',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    color: '#A9C4D3',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 3,
  },
});

export default MyPageScreen;
