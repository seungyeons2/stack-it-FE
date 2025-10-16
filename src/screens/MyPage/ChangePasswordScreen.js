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
import { fetchWithAuth } from "../../utils/token";
import { useTheme } from "../../utils/ThemeContext";

export default function ChangePasswordScreen({ navigation }) {
  const { theme } = useTheme();
  
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
      const response = await fetchWithAuth(
        `${API_BASE_URL}/users/change_password/`,
        {
          method: "PUT",
          body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
          }),
        },
        navigation
      );

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
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.backText, { color: theme.accent.primary }]}>{"<"}</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: theme.accent.primary }]}>비밀번호 변경</Text>

      <Text style={[styles.label, { color: theme.accent.primary }]}>현재 비밀번호</Text>
      <View style={[
        styles.inputContainer,
        { 
          backgroundColor: theme.background.card,
          borderColor: theme.border.medium
        }
      ]}>
        <TextInput
          style={[styles.inputField, { color: theme.text.primary }]}
          placeholder="현재 비밀번호 입력"
          placeholderTextColor={theme.text.tertiary}
          secureTextEntry={showCurrent}
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <TouchableOpacity
          onPress={() => setShowCurrent(!showCurrent)}
          style={styles.icon}
        >
          {showCurrent ? <EyeClosed /> : <EyeOpen />}
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, { color: theme.accent.primary }]}>새 비밀번호</Text>
      <View style={[
        styles.inputContainer,
        { 
          backgroundColor: theme.background.card,
          borderColor: theme.border.medium
        }
      ]}>
        <TextInput
          style={[styles.inputField, { color: theme.text.primary }]}
          placeholder="새 비밀번호 입력"
          placeholderTextColor={theme.text.tertiary}
          secureTextEntry={showNew}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity
          onPress={() => setShowNew(!showNew)}
          style={styles.icon}
        >
          {showNew ? <EyeClosed /> : <EyeOpen />}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          { 
            backgroundColor: loading ? theme.text.disabled : theme.button.primary,
            shadowColor: theme.button.primary
          }
        ]}
        onPress={handleChangePassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.background.primary} />
        ) : (
          <Text style={[styles.buttonText, { color: theme.background.primary }]}>변경</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    position: "absolute",
    top: 150,
    left: 30,
  },
  label: {
    fontSize: 16,
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
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
  },
  icon: {
    padding: 10,
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 80,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});