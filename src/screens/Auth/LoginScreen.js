import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EyeOpen from "../../components/EyeOpen";
import EyeClosed from "../../components/EyeClosed";
import { API_BASE_URL, API_ENDPOINTS } from "../../utils/apiConfig";
import { registerPushToken } from "../../services/PushNotificationService";

const LoginScreen = ({ navigation }) => {
  const [seePassword, setSeePassword] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const titleOpacity = useState(new Animated.Value(1))[0];
  const titleTranslateY = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      handleKeyboardShow
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      handleKeyboardHide
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const handleKeyboardShow = () => {
    setKeyboardVisible(true);
    Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(titleTranslateY, {
        toValue: -30,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleKeyboardHide = () => {
    setKeyboardVisible(false);
    Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(titleTranslateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("알림", "이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("로그인 시도:", { email, password: "***" });

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      console.log("응답 상태:", response.status);

      const responseText = await response.text();
      console.log("응답 본문:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("JSON 파싱 오류:", e);
        Alert.alert("오류", "서버 응답을 처리할 수 없습니다.");
        setIsLoading(false);
        return;
      }

      if (response.ok && data.status === "success") {
        const { access, refresh, has_completed_tutorial } = data.data;
        console.log("✅ 토큰 발급 성공");
        console.log("튜토리얼 완료 여부:", has_completed_tutorial);

        await AsyncStorage.setItem("accessToken", access);
        await AsyncStorage.setItem("refreshToken", refresh);
        await AsyncStorage.setItem("userEmail", email);
        await AsyncStorage.setItem("userPassword", password);

        await AsyncStorage.setItem(
          "hasCompletedTutorial",
          has_completed_tutorial.toString()
        );

        try {
          const pushTokenSuccess = await registerPushToken(navigation);
          if (pushTokenSuccess) {
            console.log("✅ Push Token 등록 성공");
          } else {
            console.warn("Push Token 등록 실패");
          }
        } catch (pushError) {
          console.error(" Push Token 등록 중 오류:", pushError);
        }

        if (has_completed_tutorial) {
          console.log("🔹 튜토리얼 완료 → MainTab 이동");
          navigation.navigate("MainTab");
        } else {
          console.log("🔹 튜토리얼 미완료 → TutorialScreen 이동");
          navigation.navigate("TutorialScreen", { fromLogin: true });
        }
      } else {
        console.log("❌ 로그인 실패:", data);
        Alert.alert(
          "오류",
          "로그인 정보가 일치하지 않습니다.\n다시 확인해 주세요."
        );
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      Alert.alert("오류", "네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            },
          ]}
        >
          <Text style={styles.title}>로그인</Text>
        </Animated.View>

        <View
          style={[
            styles.inputSection,
            keyboardVisible && styles.inputSectionKeyboard,
          ]}
        >
          <View style={styles.inputGroup}>
            <Text style={styles.label}>이메일</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="이메일(아이디)를 입력해주세요"
                placeholderTextColor="#CCCDD0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>비밀번호</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="비밀번호를 입력해주세요"
                  placeholderTextColor="#CCCDD0"
                  secureTextEntry={seePassword}
                  value={password}
                  onChangeText={setPassword}
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setSeePassword(!seePassword)}
                  style={styles.eyeIcon}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {seePassword ? <EyeClosed /> : <EyeOpen />}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? "로그인 중..." : "로그인"}
            </Text>
          </TouchableOpacity>

          <View style={styles.linkContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate("FindPassword")}
              style={styles.linkButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.linkText}>비밀번호 찾기</Text>
            </TouchableOpacity>

            <View style={styles.linkSeparator} />

            <TouchableOpacity
              onPress={() => navigation.navigate("SignUp1")}
              style={styles.linkButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.linkText}>회원가입</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003340",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 30,
  },
  titleContainer: {
    paddingTop: 130,
    paddingBottom: 50,
    alignItems: "flex-start",
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#F074BA",
    letterSpacing: 0.5,
  },
  inputSection: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 60,
  },
  inputSectionKeyboard: {
    justifyContent: "flex-start",
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: "#F074BA",
    marginBottom: 8,
    fontWeight: "500",
  },
  inputWrapper: {
    borderRadius: 12,
    backgroundColor: "#f9f9f9",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333",
    backgroundColor: "transparent",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333",
  },
  eyeIcon: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  loginButton: {
    height: 52,
    backgroundColor: "#F074BA",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    shadowColor: "#F074BA",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonDisabled: {
    backgroundColor: "#d3d3d3",
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    paddingBottom: 20,
  },
  linkButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  linkText: {
    color: "#EFF1F5",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  linkSeparator: {
    width: 1,
    height: 16,
    backgroundColor: "#EFF1F5",
    marginHorizontal: 16,
    opacity: 0.5,
  },
});

export default LoginScreen;
