import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { useTheme } from "../../utils/ThemeContext";

const SignUp4Screen = ({ navigation }) => {
  const { theme } = useTheme();

  const handleGoToLogin = () => {
    navigation.replace("Login");
  };

  return (
    <ScrollView 
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.background.primary }
      ]}
    >
      <Image source={require("../../assets/tutorial_ham.png")} style={styles.image} />

      <Text style={[styles.title, { color: theme.accent.primary }]}>
        가입이 완료되었어요!
      </Text>
      <Text style={[styles.subtitle, { color: theme.text.primary }]}>
        두둑에 오신 걸 환영합니다!{`\n`}지금 바로 로그인해볼까요?
      </Text>

      <TouchableOpacity 
        style={[
          styles.button,
          { 
            backgroundColor: theme.button.primary,
            shadowColor: theme.button.primary
          }
        ]} 
        onPress={handleGoToLogin}
      >
        <Text style={[styles.buttonText, { color: theme.background.primary }]}>
          로그인하러 가기
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingBottom: 60,
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 0,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 18,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default SignUp4Screen;