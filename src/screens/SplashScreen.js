import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const SplashScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/logo-ko.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate('Login')}>
          <Text style={styles.startButtonText}>시작하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.signupButtonText}>
            두둑이 처음이라면?{' '}
            <Text style={[styles.signupButtonText, styles.underline]}>
              회원가입
            </Text>
          </Text>
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
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 250,
  },
  slogan: {
    color: '#F074BA',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  startButton: {
    backgroundColor: '#EFF1F5',
    paddingVertical: 15,
    borderRadius: 13,
    width: '100%',
    marginBottom: 5,
  },
  startButtonText: {
    color: '#003340',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
  },
  underline: {
    textDecorationLine: 'underline',
  },
  signupButton: {
    paddingVertical: 10,
  },
  signupButtonText: {
    color: '#FFD1EB',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default SplashScreen;