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

  // 상단 여백: 기기 safe-area + 추가 마진
  const topGutter = Math.max(insets.top, 0) + 24;

  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  // ✅ 튜토리얼: 헤더 우측 아이콘으로 이동
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerTitle: "학습 가이드",
        headerStyle: { backgroundColor: "#003340" },
        headerTintColor: "#c6d4e1",
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate("TutorialScreen", { allowSkip: true })}
            style={{ paddingHorizontal: 12, paddingVertical: 6 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="help-circle" size={22} color="#c6d4e1" />
          </TouchableOpacity>
        ),
      });

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
      <View style={[styles.container, { paddingTop: topGutter }, styles.center]}>
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
    <View style={[styles.container, { paddingTop: topGutter }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: 4,
            paddingBottom: tabBarHeight + Math.max(insets.bottom, 0) + 56 + 14 + 8,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 인라인 튜토리얼 카드 (헤더 아이콘 보완) */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate("TutorialScreen", { allowSkip: true })}
          style={styles.tutorialCard}
        >
          <View style={styles.tutorialCardLeft}>
            <Image
              source={require("../../assets/icons/question.png")}
              style={{ width: 36, height: 36 }}
              resizeMode="contain"
            />
          </View>
          <View style={{ flex: 1, marginHorizontal: 10 }}>
            <Text style={styles.tutorialTitle}>튜토리얼 빠르게 보기</Text>
            <Text style={styles.tutorialDesc}>핵심 기능을 1분 컷으로 훑어보기</Text>
          </View>
          <Icon name="arrow-right" size={18} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>

        <Text style={styles.title}>🧠 투자 유형 검사하기</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.examButton}
            onPress={() => navigation.navigate("TypeExam")}
            activeOpacity={0.9}
          >
            <View style={styles.examButtonContent}>
              <View style={styles.examIconContainer}>
                <InspectIcon width={64} height={64} />
              </View>
              <View style={styles.examTextContainer}>
                <Text style={styles.examButtonTitle}>유형 검사하기</Text>
                <Text style={styles.examButtonSubtitle}>간단한 질문으로 투자 성향 파악</Text>
              </View>
              <Icon name="arrow-right" size={20} color="rgba(255,255,255,0.8)" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resultButton}
            onPress={() => navigation.navigate("TypeResult")}
            activeOpacity={0.9}
          >
            <View style={styles.examButtonContent}>
              <View style={styles.resultIconContainer}>
                <ResultIcon width={64} height={64} />
              </View>
              <View style={styles.examTextContainer}>
                <Text style={styles.examButtonTitle}>결과 확인하기</Text>
                <Text style={styles.examButtonSubtitle}>나의 투자 유형과 추천 전략</Text>
              </View>
              <Icon name="arrow-right" size={20} color="rgba(255,255,255,0.8)" />
            </View>
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

      {/* ⛔ FAB 제거: 위치 애매/시야 방해 이슈 해소 */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#003340" },

  scrollContent: { paddingHorizontal: 20 },

  center: { justifyContent: "center", alignItems: "center" },

  // 인라인 튜토리얼 카드
  tutorialCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 16,
  },
  tutorialCardLeft: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  tutorialTitle: {
    color: "#FFFFFF",
    fontSize: 14.5,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  tutorialDesc: {
    marginTop: 2,
    color: "rgba(255,255,255,0.7)",
    fontSize: 12.5,
  },

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
    gap: 12,
    marginBottom: 10,
  },

  examButton: {
    backgroundColor: "rgba(110, 230, 158, 0.15)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(110, 230, 158, 0.3)",
    shadowColor: "rgba(110, 230, 158, 0.4)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  resultButton: {
    backgroundColor: "rgba(240, 116, 186, 0.15)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(240, 116, 186, 0.3)",
    shadowColor: "rgba(240, 116, 186, 0.4)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  examButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  examIconContainer: {
    width: 80,
    height: 75,
    backgroundColor: "rgba(110, 230, 158, 0.2)",
    borderRadius: 16,
    justifyContent: "flex-end",
    alignItems: "center",
  },

  resultIconContainer: {
    width: 80,
    height: 75,
    backgroundColor: "rgba(240, 116, 186, 0.2)",
    borderRadius: 16,
    justifyContent: "flex-end",
    alignItems: "center",
  },

  examTextContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },

  examButtonTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
    letterSpacing: 0.3,
  },

  examButtonSubtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 18,
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
});

export default GuideScreen;
