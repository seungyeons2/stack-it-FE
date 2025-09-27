import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Pressable,
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

const { height, width } = Dimensions.get("window");

const SignUp2Screen = ({ navigation }) => {
  const [seePassword, setSeePassword] = useState(true);
  const [seeConfirmPassword, setSeeConfirmPassword] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [gender, setGender] = useState(""); // "male" | "female"
  const [nickname, setNickname] = useState("");

  // ✅ 생년월일: 3칸 입력 + 서버 전송은 YYYY-MM-DD
  const [birthY, setBirthY] = useState("");
  const [birthM, setBirthM] = useState("");
  const [birthD, setBirthD] = useState("");
  const [birthdate, setBirthdate] = useState(""); // 조합된 값(서버 전송용)

  // 주소 (필수 2 + 선택 2)
  const [addrRegion, setAddrRegion] = useState(""); // 도/특별시/광역시
  const [addrCity, setAddrCity] = useState(""); // 시/군/구
  const [addrTown, setAddrTown] = useState(""); // 읍/면/동 (선택)
  const [addrDetail, setAddrDetail] = useState(""); // 상세 (선택)
  const [showMoreAddr, setShowMoreAddr] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // refs: 포커스 이동
  const refPw = useRef(null);
  const refPw2 = useRef(null);
  const refNick = useRef(null);
  const refBirthY = useRef(null);
  const refBirthM = useRef(null);
  const refBirthD = useRef(null);
  const refRegion = useRef(null);
  const refCity = useRef(null);
  const refTown = useRef(null);
  const refDetail = useRef(null);
  const scrollRef = useRef(null);

 // 키보드 열릴 때 하단 여유공간을 크게 확보
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

 // 기본 버튼 영역 96 + 키보드가 보이면 키보드 높이 + 여백 120
 const bottomSpacer = useMemo(() => {
   if (!keyboardVisible) return 120; // 평소에도 넉넉히
   return Math.max(220, keyboardHeight + 140);
 }, [keyboardVisible, keyboardHeight]);





  // validators
  const validateEmail = (e) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((e || "").trim().toLowerCase());

  const isValidDate = (d) => /^\d{4}-\d{2}-\d{2}$/.test((d || "").trim());

  // 비밀번호: 8~32자 & (영문/숫자/특수) 2종 이상
  const passwordValid = (p) => {
    const s = p || "";
    if (s.length < 8 || s.length > 32) return false;
    const kinds =
      (/[A-Za-z]/.test(s) ? 1 : 0) + (/\d/.test(s) ? 1 : 0) + (/[^\w\s]/.test(s) ? 1 : 0);
    return kinds >= 2;
  };

  // 비밀번호 강도(0~3)
  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    const lenScore = password.length >= 12 ? 1 : 0;
    const kinds =
      (/[A-Z]/.test(password) ? 1 : 0) +
      (/[a-z]/.test(password) ? 1 : 0) +
      (/\d/.test(password) ? 1 : 0) +
      (/[^\w\s]/.test(password) ? 1 : 0);
    if (password.length >= 8 && kinds >= 2) {
      if (lenScore && kinds >= 3) return 3; // 강
      return 2; // 보통
    }
    return 1; // 약
  }, [password]);

  // 한국식 라이트 체크(끝글자 기준)
  const looksLikeRegion = (s) => /(도|특별시|광역시)$/.test((s || "").trim());
  const looksLikeCity = (s) => /(시|군|구)$/.test((s || "").trim());

  // 서버 전송용 address 합치기
  const mergedAddress = useMemo(
    () =>
      [addrRegion, addrCity, addrTown, addrDetail]
        .map((v) => (v || "").trim())
        .filter(Boolean)
        .join(" "),
    [addrRegion, addrCity, addrTown, addrDetail]
  );

  // 제출 가능 여부
  const canSubmit = useMemo(() => {
    return (
      validateEmail(email) &&
      passwordValid(password) &&
      confirmPassword === password &&
      !!gender &&
      !!nickname &&
      isValidDate(birthdate) &&
      addrRegion.trim() &&
      addrCity.trim() &&
      looksLikeRegion(addrRegion) &&
      looksLikeCity(addrCity)
    );
  }, [email, password, confirmPassword, gender, nickname, birthdate, addrRegion, addrCity]);

  // 필드별 에러
  const fieldError = {
    email: email.length > 0 && !validateEmail(email) ? "올바른 이메일 형식이 아니에요." : "",
    password:
      password.length > 0 && !passwordValid(password)
        ? "영문/숫자/특수 2종 이상, 8~32자"
        : "",
    confirm:
      confirmPassword.length > 0 && confirmPassword !== password
        ? "비밀번호가 일치하지 않아요."
        : "",
    birth:
      (birthY + birthM + birthD).length > 0 && !isValidDate(birthdate)
        ? "YYYY-MM-DD 형식으로 입력해주세요."
        : "",
    region:
      addrRegion.length > 0 && !looksLikeRegion(addrRegion)
        ? "예) 경기도, 서울특별시, 인천광역시"
        : "",
    city:
      addrCity.length > 0 && !looksLikeCity(addrCity)
        ? "예) 화성시, 수원시 영통구, 양평군"
        : "",
  };

  // ✅ 생년월일 3칸 → YYYY-MM-DD로 자동 합치기
  useEffect(() => {
    const y = (birthY || "").padStart(4, ""); // 그대로
    const m = (birthM || "").padStart(2, "");
    const d = (birthD || "").padStart(2, "");
    if (birthY.length === 4 && birthM.length === 2 && birthD.length === 2) {
      setBirthdate(`${birthY}-${birthM}-${birthD}`);
    } else {
      // 불완전할 땐 빈 값으로 두어 검증에 걸리게
      setBirthdate("");
    }
  }, [birthY, birthM, birthD]);

  // ✅ 각 칸 입력 시 숫자만, 글자수 채우면 자동으로 다음 칸 포커스
  const onChangeBirthY = (t) => {
    const v = (t || "").replace(/[^\d]/g, "").slice(0, 4);
    setBirthY(v);
    if (v.length === 4 && refBirthM.current && refBirthM.current.focus) {
      refBirthM.current.focus();
    }
  };
  const onChangeBirthM = (t) => {
    let v = (t || "").replace(/[^\d]/g, "").slice(0, 2);
    // 13월 방지(UX 차원에서 보정)
    if (v.length === 2) {
      const n = Math.max(1, Math.min(12, parseInt(v, 10) || 0));
      v = String(n).padStart(2, "0");
    }
    setBirthM(v);
    if (v.length === 2 && refBirthD.current && refBirthD.current.focus) {
      refBirthD.current.focus();
    }
  };
  const onChangeBirthD = (t) => {
    let v = (t || "").replace(/[^\d]/g, "").slice(0, 2);
    // 32일 방지(대략적 보정)
    if (v.length === 2) {
      const n = Math.max(1, Math.min(31, parseInt(v, 10) || 0));
      v = String(n).padStart(2, "0");
    }
    setBirthD(v);
    // 마지막 칸은 자동 이동 없음 (엔터로 다음 필드 이동)
  };

  const handleSignUp = async () => {
    if (isLoading) return;
    setIsLoading(true);

    // 방어 검증
    if (!validateEmail(email)) {
      Alert.alert("오류", "올바른 이메일 형식을 입력해주세요.");
      setIsLoading(false); return;
    }
    if (!passwordValid(password)) {
      Alert.alert("오류", "비밀번호는 8~32자이며, 영문/숫자/특수 중 2가지 이상을 포함해야 합니다.");
      setIsLoading(false); return;
    }
    if (password !== confirmPassword) {
      Alert.alert("오류", "비밀번호가 일치하지 않습니다.");
      setIsLoading(false); return;
    }
    if (!gender || !nickname) {
      Alert.alert("오류", "모든 필드를 입력해주세요.");
      setIsLoading(false); return;
    }
    if (!isValidDate(birthdate)) {
      Alert.alert("오류", "생년월일은 YYYY-MM-DD 형식으로 입력해야 합니다.");
      setIsLoading(false); return;
    }
    if (!addrRegion.trim() || !addrCity.trim()) {
      Alert.alert("오류", "주소는 최소 '도/광역시'와 '시/군/구'까지 입력해야 합니다.");
      setIsLoading(false); return;
    }
    if (!looksLikeRegion(addrRegion)) {
      Alert.alert("오류", "도/광역시 입력을 확인해주세요. 예) 경기도, 서울특별시, 인천광역시");
      setIsLoading(false); return;
    }
    if (!looksLikeCity(addrCity)) {
      Alert.alert("오류", "시/군/구 입력을 확인해주세요. 예) 화성시, 수원시 영통구, 양평군");
      setIsLoading(false); return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          gender,
          nickname: (nickname || "").trim(),
          birthdate: birthdate.trim(), // ✅ 서버에는 YYYY-MM-DD 전달
          address: mergedAddress,
        }),
      });

      const data = await response.json();
      console.log("✅ 회원가입 응답 데이터:", data);

      if (response.status === 201 && data.status === "success") {
        const { id } = data.data;
        Alert.alert(
          "이메일로 링크 전송",
          "이메일에서 인증 링크를 클릭하여,\n회원가입을 진행해주세요.",
          [{ text: "확인", onPress: () => navigation.navigate("SignUp3", { email, id }) }]
        );
      } else if (response.status === 400 && data.errors?.email) {
        Alert.alert("오류", "이미 존재하는 이메일입니다. 다른 이메일을 사용해주세요.");
      } else {
        Alert.alert("오류", data.message || "회원가입 실패");
      }
    } catch (error) {
      console.error("🚨 Network Error:", error);
      Alert.alert("오류", "네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const strengthText = ["", "약함", "보통", "강함"][passwordStrength];

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 56 : 0}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backText}>{"<"}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>회원가입</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* 폼 */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 이메일 */}
          <Text style={styles.label}>이메일</Text>
          <TextInput
            style={[styles.input, fieldError.email ? styles.inputError : null]}
            placeholder="이메일 입력"
            placeholderTextColor="#bcd1d6"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(t) => setEmail((t || "").trimStart())}
            returnKeyType="next"
            onSubmitEditing={() => refPw.current && refPw.current.focus && refPw.current.focus()}
          />
          {!!fieldError.email && <Text style={styles.errorText}>{fieldError.email}</Text>}

          {/* 비밀번호 */}
          <Text style={styles.label}>비밀번호</Text>
          <View style={[styles.inputContainer, fieldError.password ? styles.inputError : null]}>
            <TextInput
              ref={refPw}
              style={styles.inputField}
              placeholder="비밀번호 입력"
              placeholderTextColor="#bcd1d6"
              secureTextEntry={seePassword}
              showSoftInputOnFocus={false}
              value={password}
              onChangeText={setPassword}
              returnKeyType="next"
              onSubmitEditing={() => refPw2.current && refPw2.current.focus && refPw2.current.focus()}
            />
            <TouchableOpacity onPress={() => setSeePassword((v) => !v)} style={styles.icon}>
              {seePassword ? <EyeClosed /> : <EyeOpen />}
            </TouchableOpacity>
          </View>

          {/* 강도 표시 */}
          {password.length > 0 && (
            <View style={styles.strengthRow}>
              <View style={[styles.strengthBar, passwordStrength >= 1 && styles.strengthOn]} />
              <View style={[styles.strengthBar, passwordStrength >= 2 && styles.strengthOn]} />
              <View style={[styles.strengthBar, passwordStrength >= 3 && styles.strengthOn]} />
              <Text style={styles.strengthText}>{strengthText}</Text>
            </View>
          )}
          {!!fieldError.password && <Text style={styles.errorText}>{fieldError.password}</Text>}
          <Text style={styles.passwordGuide}>영문 대/소문자·숫자·특수 중 2가지 이상, 8~32자</Text>

          {/* 비밀번호 확인 */}
          <Text style={styles.label}>비밀번호 확인</Text>
          <View style={[styles.inputContainer, fieldError.confirm ? styles.inputError : null]}>
            <TextInput
              ref={refPw2}
              style={styles.inputField}
              placeholder="비밀번호 확인"
              placeholderTextColor="#bcd1d6"
              secureTextEntry={seeConfirmPassword}
              value={confirmPassword}
              //showSoftInputOnFocus={false}
              onChangeText={setConfirmPassword}
              returnKeyType="next"
              onSubmitEditing={() => refNick.current && refNick.current.focus && refNick.current.focus()}
            />
            <TouchableOpacity onPress={() => setSeeConfirmPassword((v) => !v)} style={styles.icon}>
              {seeConfirmPassword ? <EyeClosed /> : <EyeOpen />}
            </TouchableOpacity>
          </View>
          {!!fieldError.confirm && <Text style={styles.errorText}>{fieldError.confirm}</Text>}
          {confirmPassword.length > 0 && password === confirmPassword && (
            <Text style={styles.passwordMatch}>비밀번호가 일치합니다.</Text>
          )}

          {/* 성별 */}
          <Text style={styles.label}>성별</Text>
          <View style={styles.segment}>
            <Pressable
              onPress={() => setGender("male")}
              style={[styles.segmentItem, gender === "male" && styles.segmentItemOn]}
              hitSlop={8}
            >
              <Text style={[styles.segmentText, gender === "male" && styles.segmentTextOn]}>
                남성
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setGender("female")}
              style={[styles.segmentItem, gender === "female" && styles.segmentItemOn]}
              hitSlop={8}
            >
              <Text style={[styles.segmentText, gender === "female" && styles.segmentTextOn]}>
                여성
              </Text>
            </Pressable>
          </View>

          {/* 닉네임 */}
          <Text style={styles.label}>닉네임</Text>
          <TextInput
            ref={refNick}
            style={styles.input}
            placeholder="닉네임 입력"
            placeholderTextColor="#bcd1d6"
            value={nickname}
            onChangeText={setNickname}
            returnKeyType="next"
            onSubmitEditing={() => refBirthY.current && refBirthY.current.focus && refBirthY.current.focus()}
          />

          {/* ✅ 생년월일: 3칸 입력 */}
          <Text style={styles.label}>생년월일</Text>
          <View style={styles.birthRow}>
            <TextInput
              ref={refBirthY}
              style={[styles.input, styles.birthColY, fieldError.birth ? styles.inputError : null]}
              placeholder="YYYY"
              placeholderTextColor="#bcd1d6"
              keyboardType="number-pad"
              maxLength={4}
              value={birthY}
              onChangeText={onChangeBirthY}
              returnKeyType="next"
              onSubmitEditing={() => refBirthM.current && refBirthM.current.focus && refBirthM.current.focus()}
            />
            <Text style={styles.birthDash}>-</Text>
            <TextInput
              ref={refBirthM}
              style={[styles.input, styles.birthCol, fieldError.birth ? styles.inputError : null]}
              placeholder="MM"
              placeholderTextColor="#bcd1d6"
              keyboardType="number-pad"
              maxLength={2}
              value={birthM}
              onChangeText={onChangeBirthM}
              returnKeyType="next"
              onSubmitEditing={() => refBirthD.current && refBirthD.current.focus && refBirthD.current.focus()}
            />
            <Text style={styles.birthDash}>-</Text>
            <TextInput
              ref={refBirthD}
              style={[styles.input, styles.birthCol, fieldError.birth ? styles.inputError : null]}
              placeholder="DD"
              placeholderTextColor="#bcd1d6"
              keyboardType="number-pad"
              maxLength={2}
              value={birthD}
              onChangeText={onChangeBirthD}
              returnKeyType="next"
              onSubmitEditing={() => refRegion.current && refRegion.current.focus && refRegion.current.focus()}
            />
          </View>
          {!!fieldError.birth && <Text style={styles.errorText}>{fieldError.birth}</Text>}

          {/* 주소 */}
          <Text style={styles.labelRow}>
            <Text style={styles.label}>주소</Text>
            <Text style={styles.requiredBadge}>  (도/광역시 + 시/군/구 필수)</Text>
          </Text>

          <View style={styles.rowTwoCols}>
            <TextInput
              ref={refRegion}
              style={[styles.input, styles.col, fieldError.region ? styles.inputError : null]}
              placeholder="도/특별시/광역시 (예: 경기도)"
              placeholderTextColor="#bcd1d6"
              value={addrRegion}
              onChangeText={setAddrRegion}
              returnKeyType="next"
              onSubmitEditing={() => refCity.current && refCity.current.focus && refCity.current.focus()}
            />
            <TextInput
              ref={refCity}
              style={[styles.input, styles.col, fieldError.city ? styles.inputError : null]}
              placeholder="시/군/구 (예: 화성시, 영통구)"
              placeholderTextColor="#bcd1d6"
              value={addrCity}
              onChangeText={setAddrCity}
              returnKeyType="done"
              onSubmitEditing={() => setShowMoreAddr(true)}
            />
          </View>
          {!!fieldError.region && <Text style={styles.errorText}>{fieldError.region}</Text>}
          {!!fieldError.city && <Text style={styles.errorText}>{fieldError.city}</Text>}
          <Text style={styles.inlineHint}>예) 경기도 화성시</Text>

          {/* 선택 아코디언: 🔺 화살표 크게 */}
          <Pressable
            onPress={() => setShowMoreAddr((v) => !v)}
            style={styles.accordionHeader}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.accordionTitle}>추가 주소 입력 (선택)</Text>
            <Text style={styles.accordionChevron}>{showMoreAddr ? "▴" : "▾"}</Text>
          </Pressable>

          {showMoreAddr && (
            <View style={{ marginTop: 8 }}>
              <View style={styles.rowTwoCols}>
                <TextInput
                  ref={refTown}
                  style={[styles.input, styles.col]}
                  placeholder="읍/면/동 (예: 동탄동 · 봉담읍)"
                  placeholderTextColor="#bcd1d6"
                  value={addrTown}
                  onChangeText={setAddrTown}
                  returnKeyType="next"
                  onSubmitEditing={() => refDetail.current && refDetail.current.focus && refDetail.current.focus()}
                  onFocus={() => {
                   if (!showMoreAddr) setShowMoreAddr(true);
                    requestAnimationFrame(() => {
                     scrollRef.current?.scrollToEnd({ animated: true });
                    });
                }}
                />
                <TextInput
                  ref={refDetail}
                  style={[styles.input, styles.col]}
                  placeholder="상세 (예: ○○아파트 101동)"
                  placeholderTextColor="#bcd1d6"
                  value={addrDetail}
                  onChangeText={setAddrDetail}
                  returnKeyType="done"


                onFocus={() => {
                 if (!showMoreAddr) setShowMoreAddr(true);
                   requestAnimationFrame(() => {
                     scrollRef.current?.scrollToEnd({ animated: true });
                   });
                 }}


                />
              </View>
            </View>
          )}

          {/* 하단 여백: 버튼 공간 확보 */}
          <View style={{ height: bottomSpacer }} />
        </ScrollView>

        {/* 제출 버튼 */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: canSubmit ? "#F074BA" : "#F8C7CC" }]}
            onPress={handleSignUp}
            disabled={!canSubmit || isLoading}
            activeOpacity={0.9}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>인증하기</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#003340" },
  flex: { flex: 1 },

  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#003340",
  },
  backButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  backText: { fontSize: 28, color: "#F074BA", marginTop: -2 },
  title: { fontSize: 20, fontWeight: "bold", color: "#F074BA" },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 8 },

  label: { fontSize: 15, color: "#F074BA", marginTop: 12, marginBottom: 8 },
  labelRow: { fontSize: 16, color: "#F074BA", marginTop: 12, marginBottom: 8 },
  requiredBadge: { fontSize: 12, color: "#ffcae4" },

  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#87a9b1",
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: "#f1f6f7",
    color: "#0a0a0a",
  },
  inputError: { borderColor: "#ff8a8a" },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#87a9b1",
    borderRadius: 10,
    backgroundColor: "#f1f6f7",
    marginBottom: 10,
    paddingHorizontal: 6,
  },
  inputField: { flex: 1, height: 50, fontSize: 16, color: "#0a0a0a", paddingHorizontal: 8 },
  icon: { padding: 10 },

  errorText: { color: "tomato", fontSize: 12, marginBottom: 6, marginLeft: 2 },
  passwordGuide: { fontSize: 12, color: "#cfe7ec", marginBottom: 6, marginLeft: 2 },
  passwordMatch: { fontSize: 12, color: "#00e676", marginBottom: 6, marginLeft: 2 },

  // 성별 세그먼트
  segment: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#0e4652",
    padding: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  segmentItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "transparent",
  },
  segmentItemOn: { backgroundColor: "#F074BA" },
  segmentText: { color: "#d2eef3", fontSize: 14, fontWeight: "600" },
  segmentTextOn: { color: "#fff" },

  // 비밀번호 강도
  strengthRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6, marginLeft: 2 },
  strengthBar: { width: 32, height: 6, borderRadius: 4, backgroundColor: "#6e8f98" },
  strengthOn: { backgroundColor: "#F074BA" },
  strengthText: { color: "#cfe7ec", fontSize: 12, marginLeft: 6 },

  // 생년월일 3칸
  birthRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  birthColY: { flex: 1.2, textAlign: "center" },
  birthCol: { flex: 0.9, textAlign: "center" },
  birthDash: { color: "#cfe7ec", marginHorizontal: 6, fontSize: 18, marginBottom: 4 },

  // 주소
  rowTwoCols: { flexDirection: "row", gap: 10 },
  col: { flex: 1 },
  inlineHint: { fontSize: 12, color: "#9bbcc4", marginTop: -2, marginBottom: 6, marginLeft: 2 },

  // 🔺 커진 아코디언 화살표
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  accordionTitle: { fontSize: 15, color: "#cfe7ec" },
  accordionChevron: { fontSize: 22, color: "#cfe7ec" }, // ← 기존보다 크게

  // 푸터 버튼
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: "rgba(0, 51, 64, 0.92)",
  },
  button: {
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

export default SignUp2Screen;
