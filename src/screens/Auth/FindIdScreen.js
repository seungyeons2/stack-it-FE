import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const FindIdScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const handleSendCode = () => {
    console.log(`Sending verification code to: ${phoneNumber}`);
  };

  const handleVerifyCode = () => {
    setIsVerified(true);
  };

  return (
    <View style={styles.container}>
      {/* 🔙 뒤로 가기 버튼 */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>{'<'}</Text>
      </TouchableOpacity>

      {/* 🏷 타이틀 */}
      <Text style={styles.title}>이메일 찾기</Text>

      {/* 📱 휴대전화 입력 */}
      <Text style={styles.label}>휴대전화 번호</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="휴대전화 번호 입력 (- 제외)"
          placeholderTextColor="#ccc"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendCode}>
          <Text style={styles.sendButtonText}>전송</Text>
        </TouchableOpacity>
      </View>

      {/* 🔢 인증번호 입력 */}
      <Text style={styles.label}>인증번호 입력</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="인증번호 입력"
          placeholderTextColor="#ccc"
          keyboardType="number-pad"
          value={verificationCode}
          onChangeText={setVerificationCode}
        />
        <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyCode}>
          <Text style={styles.verifyButtonText}>확인</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ 이메일 찾기 버튼 */}
      <TouchableOpacity style={[styles.findButton, !isVerified && styles.disabledButton]} disabled={!isVerified}>
        <Text style={styles.findButtonText}>이메일 찾기</Text>
      </TouchableOpacity>
    </View>
  );
};

// ✅ 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003340',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  // 🔙 뒤로 가기 버튼 스타일
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

  // 🏷 타이틀 스타일
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F074BA',
    position: 'absolute',
    top: 150,
    left: 30,
  },

  // 🏷 라벨 스타일
  label: {
    fontSize: 16,
    color: '#F074BA',
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 10,
  },

  // 📱 입력 필드 스타일
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: 'black',
  },

  // 📨 전송 버튼
  sendButton: {
    width: 60,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#CCCDD0',
    borderRadius: 16,
    marginLeft: 10,
  },
  sendButtonText: {
    fontSize: 14,
    color: 'black',
  },

  // ✅ 인증번호 확인 버튼
  verifyButton: {
    width: 60,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#CCCDD0',
    borderRadius: 16,
    marginLeft: 10,
  },
  verifyButtonText: {
    fontSize: 14,
    color: 'black',
  },

  // 🔎 이메일 찾기 버튼
  findButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#F074BA',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },

  // 🚫 비활성화된 버튼 스타일
  disabledButton: {
    backgroundColor: '#F8C7CC',
  },

  findButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FindIdScreen;
