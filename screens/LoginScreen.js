import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity } from 'react-native';
import EyeOpen from '../components/EyeOpen';
import EyeClosed from '../components/EyeClosed';

const LoginScreen = ({ navigation }) => {
  const [seePassword, setSeePassword] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인</Text>
      
      <Text style={styles.label}>이메일</Text>
      <TextInput
        style={styles.input}
        placeholder="이메일(아이디)를 입력해주세요"
        placeholderTextColor="#CCCDD0"
      />
      
      <Text style={styles.label}>비밀번호</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputField}
          placeholder="비밀번호를 입력해주세요"
          placeholderTextColor="#CCCDD0"
          secureTextEntry={seePassword}
        />
        <TouchableOpacity onPress={() => setSeePassword(!seePassword)} style={styles.icon}>
          {seePassword ? <EyeClosed /> : <EyeOpen />}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>로그인</Text>
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

// ✅ 스타일
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
