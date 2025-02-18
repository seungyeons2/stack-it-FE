import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import EyeOpen from '../components/EyeOpen';
import EyeClosed from '../components/EyeClosed';


const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [seePassword, setSeePassword] = useState(true);
  const [seeConfirmPassword, setSeeConfirmPassword] = useState(true);
  const [passwordMatch, setPasswordMatch] = useState(null);

  const handlePasswordChange = (text) => {
    setPassword(text);
    setPasswordMatch(text === confirmPassword ? 'match' : 'mismatch');
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    setPasswordMatch(text === password ? 'match' : 'mismatch');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>{'<'}</Text>
            </TouchableOpacity>
      <Text style={styles.title}>회원가입</Text>

      <Text style={styles.label}>이메일</Text>
      <TextInput
        style={styles.input}
        placeholder="이메일 입력"
        placeholderTextColor="#ccc"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>비밀번호</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputField}
          placeholder="비밀번호 입력"
          placeholderTextColor="#ccc"
          secureTextEntry={seePassword}
          value={password}
          onChangeText={handlePasswordChange}
        />
        <TouchableOpacity onPress={() => setSeePassword(!seePassword)} style={styles.icon}>
          {seePassword ? <EyeClosed /> : <EyeOpen />}
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>비밀번호 확인</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputField}
          placeholder="비밀번호 확인"
          placeholderTextColor="#ccc"
          secureTextEntry={seeConfirmPassword}
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
        />
        <TouchableOpacity onPress={() => setSeeConfirmPassword(!seeConfirmPassword)} style={styles.icon}>
          {seeConfirmPassword ? <EyeClosed /> : <EyeOpen />}
        </TouchableOpacity>
      </View>

      {passwordMatch === 'match' && <Text style={styles.matchText}>비밀번호가 일치합니다.</Text>}
      {passwordMatch === 'mismatch' && confirmPassword.length > 0 && (
        <Text style={styles.mismatchText}>비밀번호가 일치하지 않습니다.</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SignUp2')}>
        <Text style={styles.buttonText}>다음</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   backgroundColor: '#003340',
  //   paddingHorizontal: 30,
  //   paddingTop: 60,
  // },
  container: {
    flex: 1,
    backgroundColor: '#003340',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
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
    marginBottom: 15,
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
    marginBottom: 5,
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
  passwordHint: {
    fontSize: 12,
    color: '#ccc',
    marginBottom: 15,
  },
  matchText: {
    fontSize: 12,
    color: 'lightgreen',
    marginBottom: 15,
  },
  mismatchText: {
    fontSize: 12,
    color: 'red',
    marginBottom: 15,
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






});






export default SignUpScreen;

