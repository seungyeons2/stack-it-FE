import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EyeOpen from '../components/EyeOpen';
import EyeClosed from '../components/EyeClosed';

const LoginScreen = ({ navigation }) => {
  const [seePassword, setSeePassword] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('알림', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }
  
    setIsLoading(true);
  
    try {
      // 로그인 시도 전 로그 추가
      console.log('로그인 시도:', { email, password: '***' });
      
      const response = await fetch(
        'https://port-0-doodook-backend-lyycvlpm0d9022e4.sel4.cloudtype.app/api/token/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,  // email 필드명 사용
            password,
          }),
        }
      );
  
      // 응답 상태 로깅
      console.log('응답 상태:', response.status);
      
      const responseText = await response.text();
      console.log('응답 본문:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('JSON 파싱 오류:', e);
        Alert.alert('오류', '서버 응답을 처리할 수 없습니다.');
        setIsLoading(false);
        return;
      }
  
      if (response.ok && data.access) {
        console.log('토큰 발급 성공');
        // Save both access and refresh tokens
        await AsyncStorage.setItem('accessToken', data.access);
        if (data.refresh) {
          await AsyncStorage.setItem('refreshToken', data.refresh);
        }
        
        console.log('로그인 성공, MainTab으로 이동 시도');
        navigation.navigate('MainTab');
        console.log('MainTab 네비게이션 완료');
      } else {
        console.log('로그인 실패:', data);
        Alert.alert('오류', data.detail || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('오류', '네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인</Text>
      
      <Text style={styles.label}>이메일</Text>
      <TextInput
        style={styles.input}
        placeholder="이메일(아이디)를 입력해주세요"
        placeholderTextColor="#CCCDD0"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <Text style={styles.label}>비밀번호</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputField}
          placeholder="비밀번호를 입력해주세요"
          placeholderTextColor="#CCCDD0"
          secureTextEntry={seePassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setSeePassword(!seePassword)} style={styles.icon}>
          {seePassword ? <EyeClosed /> : <EyeOpen />}
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? '로그인 중...' : '로그인'}
        </Text>
      </TouchableOpacity>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('FindId')} style={styles.findIdButton}>
          <Text style={styles.findIdText}>이메일 찾기</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate('FindPassword')} style={styles.findPasswordButton}>
          <Text style={styles.findPasswordText}>비밀번호 찾기</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.signUpButton}>
          <Text style={styles.findPasswordText}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003340',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F074BA',
    position: 'absolute',
    top: 150,
    left: 30,
  },
  label: {
    fontSize: 16,
    color: '#F074BA',
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 5,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: 'black',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  inputField: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: 'black',
  },
  icon: {
    padding: 10,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#F074BA',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 80,
  },
  buttonDisabled: {
    backgroundColor: '#d3d3d3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  findIdButton: {
    alignItems: 'center',
    marginRight: 10,
  },
  findIdText: {
    color: '#EFF1F5',
    fontSize: 16,
  },
  findPasswordButton: {
    alignItems: 'center',
    marginRight: 80,
  },
  findPasswordText: {
    color: '#EFF1F5',
    fontSize: 16,
  },
  signUpButton: {
    alignItems: 'center',
  },
  signUpText: {
    color: '#EFF1F5',
    fontSize: 16,
  },
});

export default LoginScreen;