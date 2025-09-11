import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Feather";
import Markdown from "react-native-markdown-display";
import { API_BASE_URL } from "../../utils/apiConfig";
import { getNewAccessToken } from "../../utils/token";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const StudyScreen = () => {
  const { level, contentIndex } = useRoute().params;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // map level & contentIndex → advanced-guide id
  const guideApiId = 
    level === 1
      ? contentIndex
      : level === 2
      ? contentIndex + 8
      : contentIndex + 13;

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState(null);

  const [progressIndex, setProgressIndex] = useState(0);
  const [showButton, setShowButton] = useState(true);
  const buttonAnim = useRef(new Animated.Value(1)).current;
  const scrollOffset = useRef(0);
  const scrollViewRef = useRef(null);

  // fetch guide content
  const fetchGuide = async () => {
    setLoading(true);
    setError(null);

    try {
      const accessToken = await getNewAccessToken(navigation);
      if (!accessToken) {
        Alert.alert("인증 오류", "토큰이 만료되었습니다. 다시 로그인해주세요.");
        navigation.navigate("Login");
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}api/advanced-guides/${guideApiId}/`,
        {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!res.ok) {
        throw new Error(`Failed to load guide (${res.status})`);
      }
      
      const data = await res.json();
      setContent(data.content || "콘텐츠를 불러올 수 없습니다.");
    } catch (err) {
      console.error("Error fetching guide:", err);
      setError(err.message);
      setContent("콘텐츠를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuide();
  }, [guideApiId]);

  // handle scroll for progress bar & button
  const handleScroll = useCallback((e) => {
    const y = e.nativeEvent.contentOffset.y;
    const scrollH = e.nativeEvent.contentSize.height - e.nativeEvent.layoutMeasurement.height;
    const pct = scrollH > 0 ? Math.max(0, Math.min(1, y / scrollH)) : 0;
    setProgressIndex(Math.min(10, Math.floor(pct * 10)));

    const threshold = 50;
    const dir = y > scrollOffset.current + threshold ? "down" : y < scrollOffset.current - threshold ? "up" : null;
    
    if (dir === "down" && showButton && y > 100) {
      setShowButton(false);
      Animated.timing(buttonAnim, { 
        toValue: 0, 
        duration: 300, 
        useNativeDriver: true 
      }).start();
    } else if (dir === "up" && !showButton) {
      setShowButton(true);
      Animated.timing(buttonAnim, { 
        toValue: 1, 
        duration: 300, 
        useNativeDriver: true 
      }).start();
    }
    
    if (Math.abs(y - scrollOffset.current) > threshold) {
      scrollOffset.current = y;
    }
  }, [showButton, buttonAnim]);

  // mark complete
  const handleComplete = async () => {
    if (completing) return;
    
    setCompleting(true);
    try {
      const accessToken = await getNewAccessToken(navigation);
      if (!accessToken) {
        Alert.alert("인증 오류", "토큰이 만료되었습니다. 다시 로그인해주세요.");
        navigation.navigate("Login");
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}progress/complete/${level}/${contentIndex}/`,
        {
          method: "POST",
          headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!res.ok) {
        throw new Error(`Complete failed (${res.status})`);
      }
      
      // 성공 피드백
      Alert.alert(
        "학습 완료!", 
        "챕터를 성공적으로 완료했습니다.", 
        [
          {
            text: "확인",
            onPress: () => navigation.goBack(),
          }
        ]
      );
    } catch (err) {
      console.error("Error completing:", err);
      Alert.alert("오류", "완료 처리 중 문제가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setCompleting(false);
    }
  };

  const handleRetry = () => {
    fetchGuide();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#00AACC" />
        <Text style={styles.loadingText}>학습 콘텐츠를 불러오는 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Icon name="wifi-off" size={64} color="#666" style={{ opacity: 0.6 }} />
        <Text style={styles.errorText}>콘텐츠를 불러올 수 없습니다</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Icon name="chevron-left" size={24} color="#003340" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.chapterNumber}>챕터 {level}-{contentIndex}</Text>
          <Text style={styles.headerTitle}>학습 콘텐츠</Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => {
              // 메뉴 기능 추가 가능
            }}
          >
            <Icon name="more-vertical" size={20} color="#003340" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${(progressIndex / 10) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round((progressIndex / 10) * 100)}%
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <Markdown style={markdownStyles}>{content}</Markdown>
        </View>
      </ScrollView>

      {/* Complete Button */}
      <Animated.View
        style={[
          styles.completeButtonContainer,
          {
            transform: [
              {
                translateY: buttonAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [120, 0],
                }),
              },
            ],
            opacity: buttonAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.completeButton, completing && styles.completingButton]}
          onPress={handleComplete}
          disabled={completing}
          activeOpacity={0.8}
        >
          {completing ? (
            <View style={styles.completingContent}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.completingText}>처리 중...</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <Icon name="check-circle" size={20} color="#fff" />
              <Text style={styles.buttonText}>학습을 완료했어요</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8FAFB" 
  },
  
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    paddingHorizontal: 20,
  },
  
  loadingText: {
    color: "#666",
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  
  errorText: {
    color: "#666",
    fontSize: 18,
    textAlign: "center",
    marginVertical: 16,
  },
  
  retryButton: {
    backgroundColor: "#00AACC",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
  },
  
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#E8F4F8",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 51, 64, 0.1)",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  headerTitleContainer: { 
    flex: 1, 
    alignItems: "center" 
  },

  chapterNumber: { 
    fontSize: 14, 
    color: "#666",
    fontWeight: "500",
  },

  headerTitle: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#003340",
    marginTop: 2,
  },

  headerRight: {
    width: 40,
    alignItems: "center",
  },

  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },

  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },

  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5F3F6",
    borderRadius: 4,
    marginRight: 12,
  },

  progressBarFill: {
    height: 8,
    backgroundColor: "#00AACC",
    borderRadius: 4,
    minWidth: 8,
  },

  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#00AACC",
    minWidth: 40,
    textAlign: "right",
  },

  scrollArea: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 120,
  },

  contentContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 0,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  completeButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(248, 250, 251, 0.95)",
  },

  completeButton: {
    backgroundColor: "#00AACC",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#00AACC",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  completingButton: {
    backgroundColor: "#0088AA",
  },

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  buttonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600",
    marginLeft: 8,
  },

  completingContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  completingText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

const markdownStyles = {
  body: { 
    fontSize: 16, 
    lineHeight: 28, 
    color: "#333",
    fontFamily: "System",
  },
  
  heading1: { 
    fontSize: 24, 
    fontWeight: "700", 
    marginTop: 24, 
    marginBottom: 12,
    color: "#003340",
  },
  
  heading2: { 
    fontSize: 20, 
    fontWeight: "600", 
    marginTop: 20, 
    marginBottom: 10,
    color: "#003340",
  },
  
  heading3: { 
    fontSize: 18, 
    fontWeight: "600", 
    marginTop: 16, 
    marginBottom: 8,
    color: "#003340",
  },
  
  paragraph: {
    marginBottom: 16,
    lineHeight: 28,
  },
  
  list_item: { 
    flexDirection: "row", 
    alignItems: "flex-start",
    marginBottom: 8,
  },
  
  bullet_list: {
    marginBottom: 16,
  },
  
  code_inline: {
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 14,
    color: "#00AACC",
  },
  
  code_block: {
    backgroundColor: "#F5F7FA",
    padding: 16,
    borderRadius: 8,
    marginVertical: 12,
  },
  
  blockquote: {
    backgroundColor: "#F8FAFB",
    borderLeftWidth: 4,
    borderLeftColor: "#00AACC",
    paddingLeft: 16,
    paddingVertical: 12,
    marginVertical: 12,
  },
};

export default StudyScreen;