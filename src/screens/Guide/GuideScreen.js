// GuideScreen.js
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Feather";

import LearningProgressBar from "../../components/LearningProgressBar";
import InspectIcon from "../../assets/icons/stock-inspect.svg";
import ResultIcon from "../../assets/icons/stock-result.svg";
import LockIcon from "../../assets/icons/lock.svg";

import { API_BASE_URL } from "../../utils/apiConfig";
import { getNewAccessToken } from "../../utils/token";

const LEVELS = [1, 2, 3];

const GuideScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadAllProgress = async () => {
        setLoading(true);
        const accessToken = await getNewAccessToken(navigation);
        if (!accessToken) {
          Alert.alert("인증 오류", "토큰이 만료되었습니다. 다시 로그인해주세요.");
          navigation.navigate("Login");
          return;
        }

        try {
          const map = {};
          for (const levelId of LEVELS) {
            const res = await fetch(`${API_BASE_URL}progress/level/${levelId}/`, {
              method: "GET",
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!res.ok) throw new Error(`Level ${levelId} fetch failed: ${res.status}`);
            map[levelId] = await res.json();
          }
          setProgressMap(map);
        } catch (err) {
          console.error(err);
          Alert.alert("데이터 오류", "진행도 정보를 불러오는 중 오류가 발생했습니다.");
        } finally {
          setLoading(false);
        }
      };

      loadAllProgress();
    }, [navigation])
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  const ClearButton = ({ label, onPress }) => (
    <TouchableOpacity style={styles.clearButton} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.menuRow}>
        <Text style={styles.menuText}>{label}</Text>
        <Icon name="chevron-right" size={20} color="#ffffff" />
      </View>
    </TouchableOpacity>
  );

  const UnClearButton = ({ onPress, children }) => (
    <TouchableOpacity style={styles.unclearButton} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.menuRow}>
        {children}
        <Icon name="chevron-right" size={20} color="#ffffff" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 전체 스크롤 (상단 카드 + 학습가이드 모두 포함) */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: tabBarHeight + Math.max(insets.bottom, 0) + 56 + 14 + 8,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>🧠 투자 유형 검사하기</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.examButton}
            onPress={() => navigation.navigate("TypeExam")}
            activeOpacity={0.9}
          >
            <InspectIcon width={84} height={84} />
            <Text
              style={styles.buttonText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
              ellipsizeMode="tail"
            >
              유형 검사하기
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resultButton}
            onPress={() => navigation.navigate("TypeResult")}
            activeOpacity={0.9}
          >
            <ResultIcon width={84} height={84} />
            <Text
              style={styles.buttonText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
              ellipsizeMode="tail"
            >
              유형 결과 확인하기
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <Text style={styles.title}>✏️ 주식 초보를 위한 학습가이드</Text>

        <View style={styles.menuContainer}>
          {LEVELS.map((levelId) => {
            const data = progressMap[levelId] || {
              completed: 0,
              total: 0,
              is_level_completed: false,
              progress_ratio: "0/0",
            };

            const prevComplete = levelId === 1 || progressMap[levelId - 1]?.is_level_completed;
            const showLockIcon = !prevComplete;

            const label = `${levelId}단계`;
            const onPress = () => navigation.navigate(`GuideLevel${levelId}`);

            return (
              <View key={levelId} style={styles.levelBlock}>
                {data.is_level_completed ? (
                  <ClearButton label={label} onPress={onPress} />
                ) : (
                  <UnClearButton onPress={onPress}>
                    <View style={styles.labelWithIcon}>
                      <Text style={styles.menuText}>{label}</Text>
                      {showLockIcon && <LockIcon style={styles.lockIcon} width={20} height={20} />}
                    </View>
                  </UnClearButton>
                )}

                <LearningProgressBar current={data.completed} total={data.total} />
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* 튜토리얼 FAB */}
      <View
        style={[
          styles.fabContainer,
          {
            bottom: tabBarHeight + Math.max(insets.bottom, 0) + 4,
          },
        ]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          onPress={() => navigation.navigate("TutorialScreen", { allowSkip: true })}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.fabImageWrapper}
        >
          <Image
            source={require("../../assets/icons/question.png")}
            style={styles.fabImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text
          style={styles.fabLabel}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.9}
        >
          튜토리얼
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#003340", paddingTop: 50 },

  scrollContent: { paddingHorizontal: 20 },

  center: { justifyContent: "center", alignItems: "center" },

  title: {
    color: "#c6d4e1ff",
    fontSize: 17,
    marginBottom: 15,
    fontWeight: "500",
    textAlign: "left",
    marginLeft: 4,
    marginTop: 5,
    letterSpacing: 0.2,
  },

  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },
  examButton: {
    flex: 1,
    height: 150,
    backgroundColor: "#6EE69E",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    shadowColor: "#6EE69E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  resultButton: {
    flex: 1,
    height: 150,
    backgroundColor: "#F074BA",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    shadowColor: "#F074BA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    marginTop: 10,
    letterSpacing: 0.3,
    textAlign: "center",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 25,
  },

  menuContainer: { paddingBottom: 10 },
  levelBlock: { marginBottom: 8 },
  menuRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  clearButton: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
  },
  unclearButton: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },

  labelWithIcon: { flexDirection: "row", alignItems: "center" },
  lockIcon: { marginLeft: 6, marginTop: 1 },

  menuText: { fontSize: 17, color: "#FFFFFF", fontWeight: "500", letterSpacing: 0.2 },

  fabContainer: {
    position: "absolute",
    right: 24,
    alignItems: "center",
    zIndex: 999,
    elevation: 9,
    pointerEvents: "box-none",
  },
  fabImageWrapper: {},
  fabImage: { width: 56, height: 56 },
  fabLabel: {
    marginTop: 4,
    fontSize: 11,
    color: "#EEEEEE",
    letterSpacing: 0.2,
    textAlign: "center",
    maxWidth: 72,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default GuideScreen;
