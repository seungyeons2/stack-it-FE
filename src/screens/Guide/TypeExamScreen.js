import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { API_BASE_URL } from "../../utils/apiConfig";
import { getNewAccessToken } from "../../utils/token";

// 🎨 테마 훅 import
import { useTheme } from "../../utils/ThemeContext";

const TypeExamScreen = ({ navigation }) => {
  // 🎨 테마 가져오기
  const { theme } = useTheme();
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const accessToken = await getNewAccessToken(navigation);
      if (!accessToken) {
        console.error("액세스 토큰이 없습니다.");
        Alert.alert("오류 발생", "로그인이 필요합니다.", [
          { text: "확인", onPress: () => navigation.navigate("Login") },
        ]);
        return;
      }

      console.log("질문을 불러오는 중...");
      const response = await fetch(`${API_BASE_URL}mbti/questions/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`서버 응답이 정상적이지 않습니다: ${response.status}`);
      }

      const data = await response.json();
      console.log(`${data.length}개의 질문을 불러왔습니다.`);
      setQuestions(data);
      setAnswers(Array(data.length).fill(null));
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching questions:", error);
      Alert.alert("오류 발생", "질문을 불러오는 중 오류가 발생했습니다.", [
        { text: "확인", onPress: () => navigation.goBack() },
      ]);
    }
  };

  const handleSelectOption = (option) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = option;
    setAnswers(newAnswers);

    if (currentQuestionIndex === questions.length - 1) {
      submitAnswers(newAnswers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const submitAnswers = async (finalAnswers) => {
    setIsSubmitting(true);

    try {
      const accessToken = await getNewAccessToken(navigation);
      if (!accessToken) {
        console.error("액세스 토큰이 없습니다.");
        Alert.alert("오류 발생", "로그인이 필요합니다.", [
          { text: "확인", onPress: () => navigation.navigate("Login") },
        ]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}mbti/result/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers: finalAnswers,
        }),
      });

      if (!response.ok) {
        throw new Error(`서버 응답이 정상적이지 않습니다: ${response.status}`);
      }

      navigation.reset({
        index: 0,
        routes: [
          { name: 'MainTab' },
          { name: 'TypeResult' }
        ],
      });
    } catch (error) {
      console.error("Error submitting answers:", error);
      Alert.alert(
        "오류 발생",
        "답변 제출 중 오류가 발생했습니다. 다시 시도해주세요.",
        [{ text: "확인", onPress: () => setIsSubmitting(false) }]
      );
    }
  };

  if (isLoading || questions.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={theme.status.success} />
        <Text style={[styles.loadingText, { color: theme.text.primary }]}>
          질문을 불러오는 중...
        </Text>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressText = `${currentQuestionIndex + 1} / ${questions.length}`;

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {isSubmitting ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.status.success} />
          <Text style={[styles.loadingText, { color: theme.text.primary }]}>
            결과를 분석 중입니다...
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.progressContainer}>
            <Text style={[styles.progressText, { color: theme.text.primary }]}>
              {progressText}
            </Text>
            <View style={[styles.progressBar, { backgroundColor: theme.background.card }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      ((currentQuestionIndex + 1) / questions.length) * 100
                    }%`,
                    backgroundColor: theme.status.success,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.questionContainer}>
            <Text style={[styles.questionText, { color: theme.text.primary }]}>
              {currentQuestion.question_text}
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: theme.background.card }]}
              onPress={() => handleSelectOption("A")}
            >
              <Text style={[styles.optionText, { color: theme.text.primary }]}>
                A. {currentQuestion.option_a}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, { backgroundColor: theme.background.card }]}
              onPress={() => handleSelectOption("B")}
            >
              <Text style={[styles.optionText, { color: theme.text.primary }]}>
                B. {currentQuestion.option_b}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  progressContainer: {
    marginTop: 60,
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: "right",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  questionContainer: {
    marginVertical: 40,
    alignItems: "center",
  },
  questionText: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
  },
  optionsContainer: {
    marginTop: 20,
  },
  optionButton: {
    padding: 20,
    borderRadius: 15,
    marginVertical: 10,
  },
  optionText: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    marginTop: 20,
  },
});

export default TypeExamScreen;