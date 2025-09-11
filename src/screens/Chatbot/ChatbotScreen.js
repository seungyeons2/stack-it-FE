// ChatbotScreen.js
import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import SearchIcon from "../../assets/icons/search.svg";
import { chatbotReply } from "../../utils/chatbotReply";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const INPUT_BAR_HEIGHT = 70;
const INPUT_FONT_SIZE = 16;
const GAP_FROM_TAB = 0;

const ChatbotScreen = () => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "안녕하세요! 투자에 대해 궁금한 것이 있으시면 언제든 물어보세요 ✨",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const scrollRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const suggestions = [
    { text: "주식 투자 시작하기", icon: "📈", category: "기초" },
    { text: "PER과 PBR 차이점", icon: "📊", category: "지표" },
    { text: "배당주 추천해줘", icon: "💰", category: "투자" },
    { text: "분산투자 전략", icon: "🎯", category: "전략" },
    { text: "코스피 vs 코스닥", icon: "🏛️", category: "시장" },
    { text: "ETF란 무엇인가요?", icon: "📦", category: "상품" },
    { text: "공매도 원리", icon: "📉", category: "거래" },
    { text: "주식 거래 시간", icon: "⏰", category: "기초" },
  ];

  React.useEffect(() => {
    if (showSuggestions) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showSuggestions]);

  const sendMessage = useCallback(
    async (messageText = input) => {
      if (!messageText.trim()) return;

      const userMsg = {
        sender: "user",
        text: messageText,
        timestamp: Date.now(),
      };
      const loadingMsg = { sender: "bot", text: "typing", timestamp: Date.now() };

      setMessages((prev) => [...prev, userMsg, loadingMsg]);
      setInput("");
      setLoading(true);
      setShowSuggestions(false);

      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);

      try {
        const reply = await chatbotReply(messageText);
        setMessages((prev) => {
          const next = [...prev];
          next.pop();
          return [
            ...next,
            { sender: "bot", text: reply, timestamp: Date.now() },
          ];
        });
      } catch {
        setMessages((prev) => {
          const next = [...prev];
          next.pop();
          return [
            ...next,
            {
              sender: "bot",
              text: "죄송해요, 잠시 후 다시 시도해주세요 🙏",
              timestamp: Date.now(),
            },
          ];
        });
      } finally {
        setLoading(false);
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    },
    [input]
  );

  const keyboardOffset =
    Platform.select({
      ios: tabBarHeight + GAP_FROM_TAB,
      android: 0,
      default: 0,
    }) || 0;

  const bottomOffset = tabBarHeight + GAP_FROM_TAB;

  const TypingIndicator = () => {
    const dot1Anim = useRef(new Animated.Value(0.4)).current;
    const dot2Anim = useRef(new Animated.Value(0.4)).current;
    const dot3Anim = useRef(new Animated.Value(0.4)).current;

    React.useEffect(() => {
      const animate = () => {
        Animated.sequence([
          Animated.timing(dot1Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot2Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot3Anim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot1Anim, { toValue: 0.4, duration: 400, useNativeDriver: true }),
          Animated.timing(dot2Anim, { toValue: 0.4, duration: 400, useNativeDriver: true }),
          Animated.timing(dot3Anim, { toValue: 0.4, duration: 400, useNativeDriver: true }),
        ]).start(() => animate());
      };
      animate();
    }, []);

    return (
      <View style={styles.typingContainer}>
        <Animated.View style={[styles.typingDot, { opacity: dot1Anim }]} />
        <Animated.View style={[styles.typingDot, { opacity: dot2Anim }]} />
        <Animated.View style={[styles.typingDot, { opacity: dot3Anim }]} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={keyboardOffset}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <View style={styles.aiIndicator}>
            <View style={styles.aiDot} />
            <Text style={styles.aiText}>AI Assistant</Text>
          </View>
          <Text style={styles.headerSubtitle}>투자 전문 상담</Text>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.chatScroll}
          contentContainerStyle={[
            styles.chatContainer,
            { paddingBottom: bottomOffset + INPUT_BAR_HEIGHT + 20 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, index) => {
            const isUser = msg.sender === "user";
            const isTyping = msg.text === "typing";

            return (
              <View
                key={`${index}-${msg.timestamp}`}
                style={[
                  styles.messageWrapper,
                  isUser ? styles.userMessageWrapper : styles.botMessageWrapper,
                ]}
              >
                {!isUser && (
                  <View style={styles.avatarContainer}>
                    <View style={styles.botAvatar}>
                      <Text style={styles.avatarText}>🤖</Text>
                    </View>
                  </View>
                )}

                <View
                  style={[
                    styles.messageBubble,
                    isUser ? styles.userBubble : styles.botBubble,
                  ]}
                >
                  {isTyping ? (
                    <TypingIndicator />
                  ) : (
                    <Text
                      style={[
                        styles.messageText,
                        isUser ? styles.userText : styles.botText,
                      ]}
                    >
                      {msg.text}
                    </Text>
                  )}
                </View>

                {isUser && (
                  <View style={styles.avatarContainer}>
                    <View style={styles.userAvatar}>
                      <Text style={styles.avatarText}>👤</Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Suggestions */}
        {showSuggestions && (
          <Animated.View
            style={[
              styles.suggestionContainer,
              {
                bottom: bottomOffset + INPUT_BAR_HEIGHT + 12,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.suggestionBackground} />

            <View style={styles.suggestionHeader}>
              <Text style={styles.suggestionTitle}>💡 추천 질문</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionRow}
            >
              {suggestions.map((item, idx) => (
                <TouchableOpacity
                  key={`${item.text}-${idx}`}
                  onPress={() => sendMessage(item.text)}
                  style={styles.suggestionCard}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionIcon}>{item.icon}</Text>
                  <Text style={styles.suggestionText}>{item.text}</Text>
                  <Text style={styles.suggestionCategory}>{item.category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Input Bar */}
        <View
          style={[
            styles.inputBar,
            {
              paddingBottom: Math.max(insets.bottom, 12),
              bottom: bottomOffset,
            },
          ]}
        >
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={[
                styles.suggestionButton,
                showSuggestions && styles.suggestionButtonActive,
              ]}
              onPress={() => setShowSuggestions((prev) => !prev)}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionButtonIcon}>
                {showSuggestions ? "✨" : "💡"}
              </Text>
            </TouchableOpacity>

            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="궁금한 투자 정보를 물어보세요..."
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={input}
                onChangeText={setInput}
                returnKeyType="send"
                onSubmitEditing={() => sendMessage()}
                blurOnSubmit={false}
                autoCorrect={false}
                autoCapitalize="none"
                multiline
                maxLength={500}
              />
            </View>

            <TouchableOpacity
              onPress={() => sendMessage()}
              activeOpacity={0.7}
              style={[styles.sendButton, input.trim() && styles.sendButtonActive]}
              disabled={!input.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <SearchIcon width={20} height={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003340",
  },

  keyboardView: {
    flex: 1,
  },

  header: {
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#003340",
  },

  aiIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  aiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fb9dd2ff",
    marginRight: 8,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },

  aiText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  headerSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    letterSpacing: 0.3,
  },

  chatScroll: {
    flex: 1,
    backgroundColor: "#003340",
  },

  chatContainer: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },

  messageWrapper: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },

  userMessageWrapper: {
    justifyContent: "flex-end",
  },

  botMessageWrapper: {
    justifyContent: "flex-start",
  },

  avatarContainer: {
    marginHorizontal: 8,
  },

  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },

  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(230, 59, 246, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(230, 59, 246, 0.3)",
  },

  avatarText: {
    fontSize: 14,
  },

  messageBubble: {
    maxWidth: SCREEN_WIDTH * 0.7,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  botBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderBottomLeftRadius: 6,
    shadowColor: "#000000",
  },

  userBubble: {
    backgroundColor: "#fb9dd2ff",
    borderBottomRightRadius: 6,
    shadowColor: "#3b82f6",
  },

  messageText: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.2,
  },

  botText: {
    color: "#1F2937",
  },

  userText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },

  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },

  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#9CA3AF",
    marginRight: 4,
  },

  // Suggestions
  suggestionContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  suggestionBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 51, 64, 0.95)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  suggestionHeader: {
    marginBottom: 12,
  },

  suggestionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  suggestionRow: {
    paddingVertical: 8,
  },

  suggestionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    marginRight: 12,
    minWidth: 140,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  suggestionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },

  suggestionText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 2,
  },

  suggestionCategory: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.6)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: "hidden",
  },

  // Input Bar
  inputBar: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingHorizontal: 16,
    backgroundColor: "#003340",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    minHeight: 44,
  },

  suggestionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },

  suggestionButtonActive: {
    backgroundColor: "rgba(16, 185, 129, 0.3)",
    borderColor: "rgba(16, 185, 129, 0.5)",
    transform: [{ scale: 1.05 }],
  },

  suggestionButtonIcon: {
    fontSize: 18,
  },

  textInputContainer: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    minHeight: 44,
    maxHeight: 100,
    justifyContent: "center",
  },

  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: INPUT_FONT_SIZE,
    lineHeight: 20,
    letterSpacing: 0.2,
    textAlignVertical: Platform.OS === "android" ? "top" : "center",
    minHeight: 44,
  },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },

  sendButtonActive: {
    backgroundColor: "rgba(182, 137, 186, 0.3)",
    borderColor: "#fb9dd28f",
    shadowColor: "#fb9dd2ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default ChatbotScreen;