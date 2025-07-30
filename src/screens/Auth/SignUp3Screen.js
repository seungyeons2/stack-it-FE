import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { API_BASE_URL } from "../../utils/apiConfig";

const SignUp3Screen = ({ route, navigation }) => {
  const { email, id } = route.params;

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    if (/^\d$/.test(text)) {
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);

      if (index < 5) {
        inputs.current[index + 1].focus();
      } else {
        // 6자리 입력 완료 → API 호출
        verifyCode(newCode.join(""));
      }
    } else if (text === "") {
      const newCode = [...code];
      newCode[index] = "";
      setCode(newCode);
    }
  };

  const verifyCode = async (enteredCode) => {
    try {
      const response = await fetch(`${API_BASE_URL}users/activation/code/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: enteredCode,
        }),
      });

      const data = await response.json();
      console.log("🔐 인증 응답:", data);

      if (response.status === 200 || data.status === "success") {
        Alert.alert("성공", "회원가입이 완료되었습니다!", [
          { text: "확인", onPress: () => navigation.navigate("SignUp4") },
        ]);
      } else {
        Alert.alert("오류", data.message || "인증에 실패했습니다.");
        setCode(["", "", "", "", "", ""]);
        inputs.current[0].focus();
      }
    } catch (error) {
      console.error("🚨 인증 오류:", error);
      Alert.alert("네트워크 오류", "잠시 후 다시 시도해주세요.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>인증번호 입력</Text>
      <Text style={styles.subtitle}>
        {email} 주소로 전송된 인증번호 6자리를 입력해주세요.
      </Text>

      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputs.current[index] = ref)}
            style={styles.codeInput}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.resendButton}
        onPress={() => Alert.alert("미구현", "재전송 기능은 추후 구현 예정입니다.")}
      >
        <Text style={styles.resendText}>인증번호 다시 보내기</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003340",
    paddingHorizontal: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#F074BA",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  codeInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: "#F074BA",
    borderRadius: 8,
    fontSize: 24,
    color: "#fff",
    backgroundColor: "#002830",
    marginHorizontal: 4,
  },
  resendButton: {
    marginTop: 30,
  },
  resendText: {
    color: "#F074BA",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});

export default SignUp3Screen;
