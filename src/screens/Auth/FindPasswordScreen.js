import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Keyboard,
} from "react-native";
import { API_BASE_URL } from "../../utils/apiConfig";
import EyeOpen from "../../components/EyeOpen";
import EyeClosed from "../../components/EyeClosed";
import { useTheme } from "../../utils/ThemeContext";

const { height, width } = Dimensions.get("window");

const FindPasswordScreen = ({ navigation }) => {
  const { theme } = useTheme();
  
  const [step, setStep] = useState(1); // 1: 이메일 입력, 2: 인증번호 + 새 비밀번호
  
  // 이메일 입력 단계
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // 인증 단계
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [seeNewPassword, setSeeNewPassword] = useState(true);
  const [seeConfirmPassword, setSeeConfirmPassword] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  // refs
  const codeInputs = useRef([]);
  const refNewPw = useRef(null);
  const refConfirmPw = useRef(null);
  const scrollRef = useRef(null);

  // 키보드 처리
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardVisible(true);
      setKeyboardHeight(e?.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const bottomSpacer = useMemo(() => {
    if (!keyboardVisible) return 120;
    return Math.max(220, keyboardHeight + 140);
  }, [keyboardVisible, keyboardHeight]);

  // validators
  const validateEmail = (e) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((e || "").trim().toLowerCase());

  const passwordValid = (p) => {
    const s = p || "";
    if (s.length < 8 || s.length > 32) return false;
    const kinds =
      (/[A-Za-z]/.test(s) ? 1 : 0) + (/\d/.test(s) ? 1 : 0) + (/[^\w\s]/.test(s) ? 1 : 0);
    return kinds >= 2;
  };

  // 비밀번호 강도(0~3)
  const passwordStrength = useMemo(() => {
    if (!newPassword) return 0;
    const lenScore = newPassword.length >= 12 ? 1 : 0;
    const kinds =
      (/[A-Z]/.test(newPassword) ? 1 : 0) +
      (/[a-z]/.test(newPassword) ? 1 : 0) +
      (/\d/.test(newPassword) ? 1 : 0) +
      (/[^\w\s]/.test(newPassword) ? 1 : 0);
    if (newPassword.length >= 8 && kinds >= 2) {
      if (lenScore && kinds >= 3) return 3; // 강
      return 2; // 보통
    }
    return 1; // 약
  }, [newPassword]);

  const strengthText = ["", "약함", "보통", "강함"][passwordStrength];

  // 1단계: 이메일로 인증번호 요청
  const handleRequestCode = async () => {
    if (isLoading) return;

    if (!validateEmail(email)) {
      Alert.alert("오류", "올바른 이메일 형식을 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}users/password_reset/request/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();
      console.log("✅ 인증번호 요청 응답:", data);

      if (response.status === 200 || data.message) {
        Alert.alert(
          "인증번호 전송",
          "이메일로 인증번호가 전송되었습니다.\n6자리 인증번호를 입력해주세요.",
          [{ text: "확인", onPress: () => setStep(2) }]
        );
      } else {
        Alert.alert("오류", data.message || "인증번호 전송에 실패했습니다.");
      }
    } catch (error) {
      console.error("🚨 Network Error:", error);
      Alert.alert("오류", "네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 인증번호 입력 처리
  const handleCodeChange = (text, index) => {
    if (/^\d$/.test(text)) {
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);

      if (index < 5) {
        codeInputs.current[index + 1].focus();
      } else {
        // 6자리 입력 완료
        codeInputs.current[index].blur();
      }
    } else if (text === "") {
      const newCode = [...code];
      newCode[index] = "";
      setCode(newCode);
    }
  };

  // 2단계: 인증번호 + 새 비밀번호 검증
  const handleResetPassword = async () => {
    if (isVerifying) return;

    const enteredCode = code.join("");
    
    if (enteredCode.length !== 6) {
      Alert.alert("오류", "6자리 인증번호를 모두 입력해주세요.");
      return;
    }

    if (!passwordValid(newPassword)) {
      Alert.alert("오류", "비밀번호는 8~32자이며, 영문/숫자/특수 중 2가지 이상을 포함해야 합니다.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("오류", "비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsVerifying(true);

    try {
      const response = await fetch(`${API_BASE_URL}users/password_reset/verify/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: enteredCode,
          new_password: newPassword,
        }),
      });

      const data = await response.json();
      console.log("✅ 비밀번호 찾기 응답:", data);

      if (response.status === 200 || data.status === "success") {
        Alert.alert(
          "성공",
          "비밀번호가 성공적으로 변경되었습니다.\n새 비밀번호로 로그인해주세요.",
          [{ text: "확인", onPress: () => navigation.navigate("Login") }]
        );
      } else {
        Alert.alert("오류", data.message || "비밀번호 재설정에 실패했습니다.");
        // 인증번호 초기화
        setCode(["", "", "", "", "", ""]);
        if (codeInputs.current[0]) {
          codeInputs.current[0].focus();
        }
      }
    } catch (error) {
      console.error("🚨 비밀번호 찾기 오류:", error);
      Alert.alert("오류", "네트워크 오류가 발생했습니다.");
    } finally {
      setIsVerifying(false);
    }
  };

  // 인증번호 재전송
  const handleResendCode = async () => {
    setCode(["", "", "", "", "", ""]);
    await handleRequestCode();
  };

  // 단계별 제출 가능 여부
  const canSubmitStep1 = validateEmail(email);
  const canSubmitStep2 = 
    code.join("").length === 6 && 
    passwordValid(newPassword) && 
    newPassword === confirmPassword;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background.primary }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 56 : 0}
      >
        {/* 헤더 */}
        <View style={[styles.header, { backgroundColor: theme.background.primary }]}>
          <TouchableOpacity
            onPress={() => step === 1 ? navigation.goBack() : setStep(1)}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.backText, { color: theme.accent.primary }]}>{"<"}</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.accent.primary }]}>비밀번호 찾기</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 ? (
            // 1단계: 이메일 입력
            <>
              <Text style={[styles.stepTitle, { color: theme.accent.primary }]}>
                이메일 주소 입력
              </Text>
              <Text style={[styles.stepDescription, { color: theme.text.secondary }]}>
                가입 시 사용한 이메일 주소를 입력하시면{"\n"}
                비밀번호 재설정 인증번호를 보내드립니다.
              </Text>

              <Text style={[styles.label, { color: theme.accent.primary }]}>이메일</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.background.card,
                    color: theme.text.primary,
                    borderColor: email.length > 0 && !validateEmail(email)
                      ? theme.status.error
                      : theme.border.medium
                  }
                ]}
                placeholder="이메일 입력"
                placeholderTextColor={theme.text.tertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(t) => setEmail((t || "").trimStart())}
                returnKeyType="done"
                onSubmitEditing={handleRequestCode}
              />
              {email.length > 0 && !validateEmail(email) && (
                <Text style={[styles.errorText, { color: theme.status.error }]}>
                  올바른 이메일 형식이 아닙니다.
                </Text>
              )}

              <View style={{ height: bottomSpacer }} />
            </>
          ) : (
            // 2단계: 인증번호 + 새 비밀번호
            <>
              <Text style={[styles.stepTitle, { color: theme.accent.primary }]}>
                인증번호 및 새 비밀번호 입력
              </Text>
              <Text style={[styles.stepDescription, { color: theme.text.secondary }]}>
                {email} 주소로 전송된{"\n"}
                인증번호 6자리와 새 비밀번호를 입력해주세요.
              </Text>

              {/* 인증번호 입력 */}
              <Text style={[styles.label, { color: theme.accent.primary }]}>인증번호</Text>
              <View style={styles.codeContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (codeInputs.current[index] = ref)}
                    style={[
                      styles.codeInput,
                      {
                        backgroundColor: theme.background.card,
                        color: theme.text.primary,
                        borderColor: theme.border.medium
                      }
                    ]}
                    value={digit}
                    onChangeText={(text) => handleCodeChange(text, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                  />
                ))}
              </View>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendCode}
              >
                <Text style={[styles.resendText, { color: theme.accent.primary }]}>
                  인증번호 다시 보내기
                </Text>
              </TouchableOpacity>

              {/* 새 비밀번호 */}
              <Text style={[styles.label, { color: theme.accent.primary }]}>새 비밀번호</Text>
              <View style={[
                styles.inputContainer,
                {
                  backgroundColor: theme.background.card,
                  borderColor: newPassword.length > 0 && !passwordValid(newPassword)
                    ? theme.status.error
                    : theme.border.medium
                }
              ]}>
                <TextInput
                  ref={refNewPw}
                  style={[styles.inputField, { color: theme.text.primary }]}
                  placeholder="새 비밀번호 입력"
                  placeholderTextColor={theme.text.tertiary}
                  secureTextEntry={seeNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  returnKeyType="next"
                  onSubmitEditing={() => refConfirmPw.current && refConfirmPw.current.focus()}
                />
                <TouchableOpacity onPress={() => setSeeNewPassword((v) => !v)} style={styles.icon}>
                  {seeNewPassword ? <EyeClosed /> : <EyeOpen />}
                </TouchableOpacity>
              </View>

              {/* 강도 표시 */}
              {newPassword.length > 0 && (
                <View style={styles.strengthRow}>
                  <View style={[
                    styles.strengthBar,
                    { backgroundColor: theme.border.medium },
                    passwordStrength >= 1 && { backgroundColor: theme.accent.primary }
                  ]} />
                  <View style={[
                    styles.strengthBar,
                    { backgroundColor: theme.border.medium },
                    passwordStrength >= 2 && { backgroundColor: theme.accent.primary }
                  ]} />
                  <View style={[
                    styles.strengthBar,
                    { backgroundColor: theme.border.medium },
                    passwordStrength >= 3 && { backgroundColor: theme.accent.primary }
                  ]} />
                  <Text style={[styles.strengthText, { color: theme.text.secondary }]}>
                    {strengthText}
                  </Text>
                </View>
              )}
              {newPassword.length > 0 && !passwordValid(newPassword) && (
                <Text style={[styles.errorText, { color: theme.status.error }]}>
                  영문/숫자/특수 중 2종 이상, 8~32자
                </Text>
              )}
              <Text style={[styles.passwordGuide, { color: theme.text.secondary }]}>
                영문 대/소문자·숫자·특수 중 2가지 이상, 8~32자
              </Text>

              {/* 비밀번호 확인 */}
              <Text style={[styles.label, { color: theme.accent.primary }]}>
                새 비밀번호 확인
              </Text>
              <View style={[
                styles.inputContainer,
                {
                  backgroundColor: theme.background.card,
                  borderColor: confirmPassword.length > 0 && confirmPassword !== newPassword
                    ? theme.status.error
                    : theme.border.medium
                }
              ]}>
                <TextInput
                  ref={refConfirmPw}
                  style={[styles.inputField, { color: theme.text.primary }]}
                  placeholder="새 비밀번호 확인"
                  placeholderTextColor={theme.text.tertiary}
                  secureTextEntry={seeConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleResetPassword}
                />
                <TouchableOpacity onPress={() => setSeeConfirmPassword((v) => !v)} style={styles.icon}>
                  {seeConfirmPassword ? <EyeClosed /> : <EyeOpen />}
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && confirmPassword !== newPassword && (
                <Text style={[styles.errorText, { color: theme.status.error }]}>
                  비밀번호가 일치하지 않아요.
                </Text>
              )}
              {confirmPassword.length > 0 && newPassword === confirmPassword && (
                <Text style={[styles.passwordMatch, { color: theme.status.success }]}>
                  비밀번호가 일치합니다.
                </Text>
              )}

              <View style={{ height: bottomSpacer }} />
            </>
          )}
        </ScrollView>

        {/* 제출 버튼 */}
        <View style={[styles.footer, { backgroundColor: `${theme.background.primary}ee` }]}>
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: (step === 1 ? canSubmitStep1 : canSubmitStep2)
                  ? theme.button.primary
                  : theme.text.disabled
              }
            ]}
            onPress={step === 1 ? handleRequestCode : handleResetPassword}
            disabled={(step === 1 ? !canSubmitStep1 || isLoading : !canSubmitStep2 || isVerifying)}
            activeOpacity={0.9}
          >
            {(step === 1 ? isLoading : isVerifying) ? (
              <ActivityIndicator color={theme.background.primary} />
            ) : (
              <Text style={[styles.buttonText, { color: theme.background.primary }]}>
                {step === 1 ? "인증번호 전송" : "비밀번호 변경"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },

  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 28, marginTop: -2 },
  title: { fontSize: 20, fontWeight: "bold" },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 8 },

  stepTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },

  label: { fontSize: 15, marginTop: 12, marginBottom: 8 },

  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
    fontSize: 16,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 6,
  },
  inputField: { flex: 1, height: 50, fontSize: 16, paddingHorizontal: 8 },
  icon: { padding: 10 },

  // 인증번호 입력
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  codeInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 20,
    textAlign: "center",
  },

  resendButton: {
    alignSelf: "center",
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    textDecorationLine: "underline",
  },

  errorText: { fontSize: 12, marginBottom: 6, marginLeft: 2 },
  passwordGuide: { fontSize: 12, marginBottom: 6, marginLeft: 2 },
  passwordMatch: { fontSize: 12, marginBottom: 6, marginLeft: 2 },

  // 비밀번호 강도
  strengthRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6, marginLeft: 2 },
  strengthBar: { width: 32, height: 6, borderRadius: 4 },
  strengthText: { fontSize: 12, marginLeft: 6 },

  // 푸터 버튼
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  button: {
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontSize: 18, fontWeight: "bold" },
});

export default FindPasswordScreen;