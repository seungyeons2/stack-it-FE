// ChatbotScreen.js
import React, { useState, useRef, useCallback, useEffect } from "react";
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
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { chatbotReply } from "../../utils/chatbotReply";

// 🎉 Lucide 아이콘 import
import { Send } from "lucide-react-native";

// 🎨 테마 훅 import
import { useTheme } from "../../utils/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const INPUT_BAR_HEIGHT = 70;
const INPUT_FONT_SIZE = 16;
const GAP_FROM_TAB = 0;

const ChatbotScreen = () => {
  // 🎨 테마 가져오기
  const { theme } = useTheme();
  
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
  const [inputHeight, setInputHeight] = useState(44);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  const scrollRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const suggestions = [
    { text: "주식 투자 시작하기", icon: "📈", category: "기초" },
    { text: "PER과 PBR 차이점", icon: "📊", category: "지표" },
    { text: "배당주 추천해줘", icon: "💰", category: "투자" },
    { text: "분산투자 전략", icon: "🎯", category: "전략" },
    { text: "코스피 vs 코스닥", icon: "🛍️", category: "시장" },
    { text: "ETF란 무엇인가요?", icon: "📦", category: "상품" },
    { text: "공매도 원리", icon: "📉", category: "거래" },
    { text: "주식 거래 시간", icon: "⏰", category: "기초" },
  ];

  // 키보드 이벤트 리스너
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

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
      setInputHeight(44);

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

  // 동적 높이 계산
  const dynamicInputBarHeight = Math.max(INPUT_BAR_HEIGHT, inputHeight + 26);
  const bottomOffset = keyboardHeight > 0 ? 0 : tabBarHeight + GAP_FROM_TAB;
  
  // 추천 질문 컨테이너의 bottom 위치 계산 (키보드 높이 포함)
  const suggestionBottomPosition = keyboardHeight > 0 
    ? keyboardHeight + dynamicInputBarHeight + 12
    : bottomOffset + dynamicInputBarHeight + 12;

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
        <Animated.View style={[styles.typingDot, { 
          opacity: dot1Anim,
          backgroundColor: theme.text.secondary 
        }]} />
        <Animated.View style={[styles.typingDot, { 
          opacity: dot2Anim,
          backgroundColor: theme.text.secondary 
        }]} />
        <Animated.View style={[styles.typingDot, { 
          opacity: dot3Anim,
          backgroundColor: theme.text.secondary 
        }]} />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={[styles.header, { 
          paddingTop: insets.top + 20,
          backgroundColor: theme.background.primary,
          borderBottomColor: theme.border.light
        }]}>
          <View style={styles.aiIndicator}>
            <View style={[styles.aiDot, { 
              backgroundColor: theme.status.down,
              shadowColor: theme.status.down
            }]} />
            <Text style={[styles.aiText, { color: theme.text.primary }]}>
              AI Assistant
            </Text>
          </View>
          <Text style={[styles.headerSubtitle, { color: theme.text.secondary }]}>
            투자 전문 상담
          </Text>
        </View>

        <ScrollView
          ref={scrollRef}
          style={[styles.chatScroll, { backgroundColor: theme.background.primary }]}
          contentContainerStyle={[
            styles.chatContainer,
            { paddingBottom: dynamicInputBarHeight + keyboardHeight + 20 },
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
                    <View style={[styles.botAvatar, {
                      backgroundColor: `${theme.status.success}33`,
                      borderColor: `${theme.status.success}4D`
                    }]}>
                      <Text style={styles.avatarText}>🤖</Text>
                    </View>
                  </View>
                )}

                <View
                  style={[
                    styles.messageBubble,
                    isUser ? [styles.userBubble, {
                      backgroundColor: theme.accent.primary,
                      shadowColor: theme.accent.primary
                    }] : [styles.botBubble, {
                      backgroundColor: theme.background.card,
                      shadowColor: theme.shadow
                    }],
                  ]}
                >
                  {isTyping ? (
                    <TypingIndicator />
                  ) : (
                    <Text
                      style={[
                        styles.messageText,
                        isUser ? [styles.userText, { color: theme.background.primary }] 
                              : [styles.botText, { color: theme.text.primary }],
                      ]}
                    >
                      {msg.text}
                    </Text>
                  )}
                </View>

                {isUser && (
                  <View style={styles.avatarContainer}>
                    <View style={[styles.userAvatar, {
                      backgroundColor: `${theme.accent.secondary}33`,
                      borderColor: `${theme.accent.secondary}4D`
                    }]}>
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
                bottom: suggestionBottomPosition,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={[styles.suggestionBackground, {
              backgroundColor: theme.background.card,
              borderColor: theme.border.light
            }]} />

            <View style={styles.suggestionHeader}>
              <Text style={[styles.suggestionTitle, { color: theme.text.primary }]}>
                💡 추천 질문
              </Text>
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
                  style={[styles.suggestionCard, {
                    backgroundColor: theme.background.secondary,
                    borderColor: theme.border.medium,
                    shadowColor: theme.shadow
                  }]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionIcon}>{item.icon}</Text>
                  <Text style={[styles.suggestionText, { color: theme.text.primary }]}>
                    {item.text}
                  </Text>
                  <Text style={[styles.suggestionCategory, { 
                    color: theme.text.secondary,
                    backgroundColor: theme.background.tertiary
                  }]}>
                    {item.category}
                  </Text>
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
              backgroundColor: theme.background.primary,
              borderTopColor: theme.border.light
            },
          ]}
        >
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={[
                styles.suggestionButton,
                {
                  backgroundColor: theme.background.secondary,
                  borderColor: theme.border.medium
                },
                showSuggestions && {
                  backgroundColor: `${theme.status.success}4D`,
                  borderColor: `${theme.status.success}80`
                },
              ]}
              onPress={() => setShowSuggestions((prev) => !prev)}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionButtonIcon}>
                {showSuggestions ? "✨" : "💡"}
              </Text>
            </TouchableOpacity>

            <View style={[styles.textInputContainer, {
              backgroundColor: theme.background.secondary,
              borderColor: theme.border.medium
            }]}>
              <TextInput
                style={[styles.textInput, { color: theme.text.primary }]}
                placeholder="궁금한 투자 정보를 물어보세요..."
                placeholderTextColor={theme.text.tertiary}
                value={input}
                onChangeText={setInput}
                onContentSizeChange={(event) => {
                  const { height } = event.nativeEvent.contentSize;
                  const newHeight = Math.min(Math.max(height + 8, 44), 120);
                  setInputHeight(newHeight);
                }}
                returnKeyType="send"
                onSubmitEditing={() => sendMessage()}
                blurOnSubmit={false}
                autoCorrect={false}
                autoCapitalize="none"
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              onPress={() => sendMessage()}
              activeOpacity={0.7}
              style={[
                styles.sendButton,
                {
                  backgroundColor: theme.background.secondary,
                  borderColor: theme.border.medium
                },
                input.trim() && styles.sendButtonActive,
                input.trim() && {
                  backgroundColor: `${theme.accent.primary}4D`,
                  borderColor: `${theme.accent.primary}80`
                }
              ]}
              disabled={!input.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.accent.primary} />
              ) : (
                <Send 
                  size={20} 
                  color={input.trim() ? theme.accent.primary : theme.text.tertiary}
                  strokeWidth={2}
                />
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
  },

  keyboardView: {
    flex: 1,
  },

  header: {
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomWidth: 1,
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
    marginRight: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },

  aiText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  headerSubtitle: {
    fontSize: 14,
    letterSpacing: 0.3,
  },

  chatScroll: {
    flex: 1,
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
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
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
    borderBottomLeftRadius: 6,
  },

  userBubble: {
    borderBottomRightRadius: 6,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.2,
  },

  botText: {
  },

  userText: {
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
    borderRadius: 12,
    borderWidth: 1,
  },

  suggestionHeader: {
    marginBottom: 12,
  },

  suggestionTitle: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  suggestionRow: {
    paddingVertical: 8,
  },

  suggestionCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 12,
    minWidth: 140,
    alignItems: "center",
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
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 2,
  },

  suggestionCategory: {
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: "hidden",
  },

  // Input Bar
  inputBar: {
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
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
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  suggestionButtonIcon: {
    fontSize: 18,
  },

  textInputContainer: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    minHeight: 44,
    maxHeight: 120,
    justifyContent: "center",
  },

  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: INPUT_FONT_SIZE,
    lineHeight: 20,
    letterSpacing: 0.2,
    minHeight: 44,
  },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  sendButtonActive: {
    transform: [{ scale: 1.05 }],
  },
});

export default ChatbotScreen;