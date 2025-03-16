import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Clipboard, ScrollView } from 'react-native';

const SignUp3Screen = ({ navigation, route }) => {
  const { email, id } = route.params;
  const [tokenInput, setTokenInput] = useState('');
  const [inputHeight, setInputHeight] = useState(100); // 동적 높이 조절
  const textInputRef = useRef(null);

  // 🔥 공백을 만나기 전까지 token= 이후 모든 문자 포함하는 정규식으로 수정
  const extractToken = (input) => {
    const match = input.match(/token=([\w-._]+)/);
    return match ? match[1] : input; // "token=" 다음 값이 있으면 추출, 없으면 그대로 반환
  };

  const handleTokenChange = (input) => {
    const cleanedToken = extractToken(input);
    setTokenInput(cleanedToken);
  };

  const verifyEmail = async () => {
    if (!tokenInput.trim()) {
      Alert.alert('오류', '이메일에서 받은 인증 토큰을 입력해주세요.');
      return;
    }

    try {
      // 🔥 올바른 인증 요청 URL 생성
      const url = `https://port-0-doodook-backend-lyycvlpm0d9022e4.sel4.cloudtype.app/users/${id}/activation?token=${encodeURIComponent(tokenInput)}`;

      console.log("🔍 인증 요청 URL:", url);

      const response = await fetch(url, { method: 'GET' });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`서버 응답 오류: ${errorText}`);
      }

      const data = await response.json();
      console.log("📩 서버 응답 데이터:", data);

      if (data.status === 'success') {
        console.log("✅ 이메일 인증 성공, LoginScreen으로 이동");
        Alert.alert('이메일 인증 완료', '회원가입이 성공적으로 완료되었습니다.', [
          {
            text: "확인",
            onPress: () => {
              navigation.replace('Login', { id, email });
            }
          }
        ]);
      } else {
        Alert.alert('오류', data.message || '이메일 인증 실패');
      }
    } catch (error) {
      console.error("🚨 Network Error:", error);
      Alert.alert('오류', '네트워크 오류가 발생했습니다.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>이메일 인증</Text>
      <Text style={styles.label}>이메일에서 받은 링크를 복사해서 붙여넣어 주세요.</Text>

      {/* 🔥 긴 토큰을 온전히 붙여넣을 수 있도록 설정 */}
      <TextInput
        ref={textInputRef}
        style={[styles.input, { height: inputHeight }]}
        placeholder="여기에 링크 또는 토큰을 붙여넣으세요."
        value={tokenInput}
        onChangeText={handleTokenChange}
        multiline={true}  // 여러 줄 입력 가능
        textAlignVertical="top"  // 텍스트 상단 정렬
        onContentSizeChange={(event) => setInputHeight(event.nativeEvent.contentSize.height)}
      />

      {/* 📋 복사 기능 추가 */}
      <TouchableOpacity
        style={styles.copyButton}
        onPress={() => {
          Clipboard.setString(tokenInput);
          Alert.alert('복사됨', '토큰이 클립보드에 복사되었습니다.');
        }}
      >
        <Text style={styles.copyButtonText}>📋 토큰 복사</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={verifyEmail}>
        <Text style={styles.buttonText}>인증하기</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#003340',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F074BA',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#F074BA',
    alignSelf: 'center',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    minHeight: 100, // 최소 높이 설정
    maxHeight: 300, // 너무 커지지 않도록 제한
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: 'black',
    textAlignVertical: 'top',  // 여러 줄 입력 시 텍스트가 위쪽에서 시작하도록 설정
  },
  copyButton: {
    width: '100%',
    height: 40,
    backgroundColor: '#008CBA',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#F074BA',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SignUp3Screen;
