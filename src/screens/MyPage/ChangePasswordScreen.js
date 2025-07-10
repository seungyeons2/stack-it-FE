import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { API_BASE_URL } from "../../utils/apiConfig";
import { getNewAccessToken } from "../../utils/token";
import EyeOpen from "../../components/EyeOpen";
import EyeClosed from "../../components/EyeClosed";

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(true);
  const [showNew, setShowNew] = useState(true);

  // 화면 진입 시 토큰 갱신
  useEffect(() => {
    const prepareToken = async () => {
      const token = await getNewAccessToken(navigation);
      if (!token) {
        Alert.alert("오류", "인증이 필요합니다.");
        navigation.goBack();
      }
    };
    prepareToken();
  }, []);

  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert("오류", "새 비밀번호를 입력하세요.");
      return;
    }
    if (currentPassword === newPassword) {
      Alert.alert("오류", "이전과 동일한 비밀번호로 변경할 수 없습니다.");
      return;
    }

    setLoading(true);
    try {
      const accessToken = await getNewAccessToken(navigation);
      if (!accessToken) {
        Alert.alert("오류", "인증이 필요합니다.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/users/change_password/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const result = await response.json();

      if (response.ok && result.status === "success") {
        Alert.alert("성공", result.message, [
          { text: "확인", onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert("오류", result.message || "변경에 실패했습니다.");
      }
    } catch (error) {
      console.error("ChangePassword 오류:", error);
      Alert.alert("오류", "네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>{"<"}</Text>
      </TouchableOpacity>
      <Text style={styles.title}>비밀번호 변경</Text>

      <Text style={styles.label}>현재 비밀번호</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputField}
          placeholder="현재 비밀번호 입력"
          placeholderTextColor="#CCCDD0"
          secureTextEntry={showCurrent}
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.icon}>
          {showCurrent ? <EyeClosed /> : <EyeOpen />}
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>새 비밀번호</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputField}
          placeholder="새 비밀번호 입력"
          placeholderTextColor="#CCCDD0"
          secureTextEntry={showNew}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.icon}>
          {showNew ? <EyeClosed /> : <EyeOpen />}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleChangePassword}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>변경</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003340",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backText: {
    fontSize: 36,
    color: "#F074BA",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F074BA",
    position: "absolute",
    top: 150,
    left: 30,
  },
  label: {
    fontSize: 16,
    color: "#F074BA",
    alignSelf: "flex-start",
    marginLeft: 8,
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: "black",
  },
  icon: {
    padding: 10,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#F074BA",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 80,
  },
  disabledButton: {
    backgroundColor: "#A0A0A0",
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});
