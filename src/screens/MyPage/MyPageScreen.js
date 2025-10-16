// /src/screens/MyPage/MyPageScreen.js
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Feather";
import { API_BASE_URL } from "../../utils/apiConfig";

import { getNewAccessToken, clearTokens } from "../../utils/token";
import { fetchUserInfo } from "../../utils/user";
import { fetchUserMbtiType, getMbtiImage } from "../../utils/mbtiType";
import { increaseBalance } from "../../utils/point";
import { unregisterPushToken } from "../../services/PushNotificationService";

// 🎨 테마 훅 import
import { useTheme } from "../../utils/ThemeContext";

const MyPageScreen = ({ navigation }) => {
  // 🎨 테마 가져오기
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  console.log("🔌 MyPageScreen 렌더링");

  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [equippedBadges, setEquippedBadges] = useState(["🔥", "🌟", "💯"]);
  const [isEditingIntro, setIsEditingIntro] = useState(false);
  const [mbtiType, setMbtiType] = useState(null);
  const [mbtiAlias, setMbtiAlias] = useState(null);
  const [aliasLoading, setAliasLoading] = useState(false);

  const DEPOSIT_AMOUNT = 100000;

  useEffect(() => {
    fetchUserMbtiType(navigation, setMbtiType);
  }, []);

  // MBTI 추천 정보 가져오기 (별명 가져올라구)
  const fetchMbtiRecommendations = async () => {
    try {
      setAliasLoading(true);
      console.log("🎯 MBTI 추천 정보 요청 시작");

      const accessToken = await getNewAccessToken(navigation);
      if (!accessToken) {
        console.warn("⚠️ 액세스 토큰이 없음");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}mbti/result/recommendations/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("📡 MBTI 추천 API 응답 상태:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ MBTI 추천 데이터:", data);

        if (data.alias) {
          setMbtiAlias(data.alias);
          console.log("🎭 별명 설정 완료:", data.alias);
        } else {
          console.warn("⚠️ 응답에 alias가 없음");
        }
      } else {
        const errorText = await response.text();
        console.warn(
          "❌ MBTI 추천 정보 가져오기 실패:",
          response.status,
          errorText
        );
      }
    } catch (error) {
      console.log("ℹ️ MBTI 추천 정보 가져오기 완료:", error.message || error);
    } finally {
      setAliasLoading(false);
    }
  };

  // 생년월일 포맷팅
  const formatBirthdate = (birthdate) => {
    if (!birthdate) return "";
    const date = new Date(birthdate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // 이메일 마스킹
  const maskEmail = (email) => {
    if (!email) return "";
    const [localPart, domain] = email.split("@");
    if (localPart.length <= 2) return email;
    const maskedLocal =
      localPart.substring(0, 2) + "*".repeat(localPart.length - 2);
    return `${maskedLocal}@${domain}`;
  };

  // 생일까지 D-day 계산
  const calculateBirthdayDday = (birthdate) => {
    if (!birthdate) return "";

    const today = new Date();
    const birth = new Date(birthdate);

    const thisYearBirthday = new Date(
      today.getFullYear(),
      birth.getMonth(),
      birth.getDate()
    );

    // 올해 생일이 지났으면 내년 생일로
    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1);
    }
    const diffTime = thisYearBirthday - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "🎉 생일 축하드려요!";
    if (diffDays === 1) return "🎂 D-1";
    return `🎂 D-${diffDays}`;
  };

  // 🎨 MenuButton 컴포넌트 (theme 적용)
  const MenuButton = ({ label, onPress, iconColor }) => (
    <TouchableOpacity 
      style={[styles.menuButton, { 
        backgroundColor: theme.background.card,
        borderColor: theme.border.light 
      }]} 
      onPress={onPress}
    >
      <View style={styles.menuRow}>
        <Text style={[styles.menuText, { color: theme.text.primary }]}>
          {label}
        </Text>
        <Icon name="chevron-right" size={20} color={iconColor || theme.text.primary} />
      </View>
    </TouchableOpacity>
  );

  const handleLogout = async () => {
    try {
      console.log("📱 Push Token 해제 시작");
      try {
        const pushUnregisterSuccess = await unregisterPushToken(navigation);
        if (pushUnregisterSuccess) {
          console.log("✅ Push Token 해제 성공");
        } else {
          console.warn("⚠️ Push Token 해제 실패 (계속 진행)");
        }
      } catch (pushError) {
        console.log("ℹ️ Push Token 해제 건너뜀:", pushError.message || pushError);
      }

      try {
        const accessToken = await getNewAccessToken(navigation);
        if (accessToken) {
          const response = await fetch(`${API_BASE_URL}logout/`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });

          if (response.ok) {
            console.log("✅ 서버 로그아웃 성공");
          } else {
            console.warn("⚠️ 서버 로그아웃 실패:", response.status);
          }
        }
      } catch (serverError) {
        console.warn("⚠️ 서버 로그아웃 요청 중 오류:", serverError);
      }

      await Promise.all([
        clearTokens(),
        AsyncStorage.removeItem("userEmail"),
        AsyncStorage.removeItem("userPassword"),
        AsyncStorage.removeItem("deviceId"),
        AsyncStorage.removeItem("pushToken"),
      ]);

      console.log("✅ 로컬 데이터 정리 완료");

      Alert.alert("로그아웃", "정상적으로 로그아웃되었습니다.", [
        {
          text: "확인",
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          },
        },
      ]);
    } catch (err) {
      console.error("❌ 로그아웃 중 오류:", err);

      try {
        await Promise.all([
          clearTokens(),
          AsyncStorage.removeItem("userEmail"),
          AsyncStorage.removeItem("userPassword"),
          AsyncStorage.removeItem("deviceId"),
          AsyncStorage.removeItem("pushToken"),
        ]);
      } catch (cleanupError) {
        console.error("❌ 로컬 데이터 정리 중 오류:", cleanupError);
      }

      Alert.alert("로그아웃", "로그아웃되었습니다.", [
        {
          text: "확인",
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          },
        },
      ]);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "회원 탈퇴",
      "정말 탈퇴하시겠습니까?\n이 작업은 되돌릴 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴하기",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("🔱 회원 탈퇴 - Push Token 해제 시작");
              
              // Push Token 해제를 조용하게 처리
              try {
                await unregisterPushToken(navigation);
                console.log("✅ 탈퇴 시 Push Token 해제 성공");
              } catch (pushError) {
                console.log("ℹ️ 탈퇴 시 Push Token 해제 건너뜀:", pushError.message || "알 수 없는 오류");
              }

              const accessToken = await getNewAccessToken(navigation);
              if (!accessToken) {
                Alert.alert(
                  "인증 오류",
                  "토큰이 만료되었습니다. 다시 로그인해주세요."
                );
                navigation.navigate("Login");
                return;
              }

              const response = await fetch(`${API_BASE_URL}users/delete/`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
              });

              if (response.ok) {
                await Promise.all([
                  clearTokens(),
                  AsyncStorage.removeItem("userEmail"),
                  AsyncStorage.removeItem("userPassword"),
                  AsyncStorage.removeItem("deviceId"),
                  AsyncStorage.removeItem("pushToken"),
                ]);

                Alert.alert("탈퇴 완료", "계정이 삭제되었습니다.");
                navigation.navigate("Login");
              } else {
                const text = await response.text();
                console.error("회원 탈퇴 실패 응답:", text);
                Alert.alert("오류", "회원 탈퇴에 실패했습니다.");
              }
            } catch (err) {
              console.error("회원 탈퇴 중 오류:", err);
              Alert.alert("오류", "네트워크 오류로 탈퇴에 실패했습니다.");
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const accessToken = await getNewAccessToken(navigation);
        if (!accessToken) {
          console.error("❌ 액세스 토큰 없음, 로그인으로 이동");
          Alert.alert("인증 만료", "다시 로그인해주세요.");
          navigation.navigate("Login");
          return;
        }

        // 사용자 정보와 MBTI 추천 정보를 병렬로 로드
        await Promise.all([
          fetchUserInfo(navigation, setUserInfo),
          fetchMbtiRecommendations(),
        ]);
      } catch (err) {
        console.error("❌ 사용자 정보 불러오기 실패:", err);
        Alert.alert("오류", "사용자 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchMbtiRecommendations();
    });

    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return (
      <View style={[styles.container, { 
        backgroundColor: theme.background.primary,
        justifyContent: "center" 
      }]}>
        <ActivityIndicator size="large" color={theme.accent.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: (insets?.bottom || 0) + 80 },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 프로필 섹션 */}
        <View style={styles.profileSection}>
          <View style={[styles.profileCard, { backgroundColor: theme.background.card }]}>
            {/* 프로필 이미지 */}
            <View style={styles.profileImageContainer}>
              <Image
                source={
                  mbtiType && getMbtiImage(mbtiType)
                    ? getMbtiImage(mbtiType)
                    : require("../../assets/profile.png")
                }
                style={styles.profileImage}
              />
              <View style={styles.profileImageShadow} />
            </View>

            {/* 유저 정보 */}
            <View style={styles.userInfoContainer}>
              <Text style={[styles.userName, { color: theme.accent.light }]}>
                {userInfo?.nickname || "잔고가 두둑한 햄스터"}
              </Text>

              {/* MBTI 별명 */}
              {aliasLoading ? (
                <View style={styles.aliasLoadingContainer}>
                  <ActivityIndicator size="small" color={theme.status.success} />
                  <Text style={styles.aliasLoadingText}></Text>
                </View>
              ) : mbtiAlias ? (
                <Text style={[styles.mbtiAlias, { color: theme.text.secondary }]}>
                  "{mbtiAlias}"
                </Text>
              ) : (
                <Text style={[styles.mbtiAliasEmpty, { color: theme.text.tertiary }]}>
                  별명을 불러오는 중...
                </Text>
              )}

              <View style={styles.userDetailsContainer}>
                {userInfo?.email && (
                  <View style={styles.userDetailRow}>
                    <Icon
                      name="mail"
                      size={14}
                      color={theme.text.secondary}
                      style={styles.detailIcon}
                    />
                    <Text style={[styles.userDetailText, { color: theme.text.secondary }]}>
                      {userInfo.email}
                    </Text>
                  </View>
                )}

                {userInfo?.birthdate && (
                  <View style={styles.userDetailRow}>
                    <Icon
                      name="calendar"
                      size={14}
                      color={theme.text.secondary}
                      style={styles.detailIcon}
                    />
                    <Text style={[styles.userDetailText, { color: theme.text.secondary }]}>
                      {formatBirthdate(userInfo.birthdate)}
                    </Text>
                    <Text style={[styles.birthdayDday, { 
                      color: theme.accent.pale,
                      backgroundColor: 'rgba(254, 212, 236, 0.1)'
                    }]}>
                      {calculateBirthdayDday(userInfo.birthdate)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border.medium }]} />

        {/* 돌림판 섹션 */}
        <View style={styles.rouletteSection}>
          <Text style={[styles.moneyTitle, { color: theme.text.secondary }]}>
            📢 진행 중인 이벤트
          </Text>
          <TouchableOpacity
            style={[styles.rouletteButton, { 
              backgroundColor: theme.button.primary,
              shadowColor: theme.button.primary 
            }]}
            onPress={() => navigation.navigate("Roulette")}
          >
            <View style={styles.rouletteButtonContent}>
              <Text style={[styles.rouletteButtonText, { color: theme.text.primary }]}>
                일일 룰렛 돌리기
              </Text>
              <Icon name="arrow-right" size={20} color={theme.text.primary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border.medium }]} />

        {/* 메뉴 섹션 */}
        <View style={styles.menuSectionContainer}>
          <View style={styles.menuContainer}>
            {/* 🎨 테마 변경 버튼 추가 */}
            <MenuButton
              label="테마 변경"
              onPress={() => navigation.navigate("ThemeSelector")}
              iconColor={theme.accent.primary}
            />
            <MenuButton
              label="공지사항"
              onPress={() => navigation.navigate("Notice")}
              iconColor={theme.status.success}
            />
            <MenuButton
              label="자주 묻는 질문(FAQ)"
              onPress={() => navigation.navigate("FAQ")}
              iconColor={theme.status.success}
            />
            <MenuButton
              label="비밀번호 변경"
              onPress={() => navigation.navigate("ChangePassword")}
              iconColor={theme.status.success}
            />
            <MenuButton
              label="로그아웃"
              onPress={handleLogout}
              iconColor={theme.status.success}
            />
            <MenuButton
              label="회원 탈퇴"
              onPress={handleDeleteAccount}
              iconColor={theme.text.disabled}
            />
          </View>
        </View>
        <View style={{ height: (insets?.bottom || 0) + 16 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  profileSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  profileCard: {
    borderRadius: 20,
    padding: 25,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  profileImageContainer: { 
    position: "relative", 
    marginRight: 20 
  },
  profileImage: {
    width: 95,
    height: 95,
    borderRadius: 50,
    backgroundColor: "rgba(212, 221, 239, 0.2)",
  },
  profileImageShadow: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 95,
    height: 95,
    borderRadius: 50,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(247, 206, 229, 0.3)",
  },
  userInfoContainer: { 
    flex: 1, 
    justifyContent: "center", 
    backgroundColor: "transparent" 
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
    marginTop: 5,
    letterSpacing: 0.5,
  },
  mbtiAlias: {
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 13,
    letterSpacing: 0.3,
  },
  mbtiAliasEmpty: {
    fontSize: 12,
    fontWeight: "400",
    marginBottom: 13,
  },
  aliasLoadingContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 8 
  },
  aliasLoadingText: { 
    fontSize: 12, 
    marginLeft: 6, 
    fontStyle: "italic" 
  },
  userDetailsContainer: { 
    gap: 6 
  },
  userDetailRow: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  detailIcon: { 
    marginRight: 8, 
    width: 16 
  },
  userDetailText: {
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: 0.2,
  },
  birthdayDday: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    marginVertical: 25,
  },
  rouletteSection: { 
    marginBottom: 10 
  },
  moneyTitle: {
    fontSize: 17,
    marginBottom: 15,
    fontWeight: "500",
    textAlign: "left",
    marginLeft: 4,
  },
  rouletteButton: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  rouletteButtonContent: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center" 
  },
  rouletteButtonText: {
    fontSize: 17,
    fontWeight: "600",
    marginRight: 10,
    letterSpacing: 0.3,
  },
  menuSectionContainer: {
    marginTop: 0,
  },
  menuContainer: {
    paddingBottom: 10,
  },
  menuButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 10,
    borderWidth: 1,
  },
  menuRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center" 
  },
  menuText: { 
    fontSize: 17, 
    fontWeight: "500", 
    letterSpacing: 0.2 
  },
});

export default MyPageScreen;