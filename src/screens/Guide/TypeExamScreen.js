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

// 질문 데이터는 API에서 불러올 예정

const TypeExamScreen = ({ navigation }) => {
  // 질문 데이터와 현재 상태를 저장하는 상태 변수들
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 질문 데이터 불러오기
  useEffect(() => {
    fetchQuestions();
  }, []);

  // 질문 데이터 불러오는 함수
  const fetchQuestions = async () => {
    try {
      // 인증 토큰 가져오기
      const accessToken = await getNewAccessToken(navigation);
      if (!accessToken) {
        console.error("액세스 토큰이 없습니다.");
        Alert.alert("오류 발생", "로그인이 필요합니다.", [
          { text: "확인", onPress: () => navigation.navigate("Login") },
        ]);
        return;
      }

      console.log("질문을 불러오는 중...");
      const response = await fetch(`${API_BASE_URL}/mbti/questions/`, {
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

  // 답변 선택 핸들러
  const handleSelectOption = (option) => {
    // 현재 답변 배열 복사본 생성
    const newAnswers = [...answers];
    // 현재 질문에 대한 답변 저장
    newAnswers[currentQuestionIndex] = option;
    setAnswers(newAnswers);

    // 마지막 질문인지 확인
    if (currentQuestionIndex === questions.length - 1) {
      // 마지막 질문이면 결과 제출
      submitAnswers(newAnswers);
    } else {
      // 다음 질문으로 이동
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // 답변 제출 함수
  const submitAnswers = async (finalAnswers) => {
    setIsSubmitting(true);

    try {
      // 인증 토큰 가져오기
      const accessToken = await getNewAccessToken(navigation);
      if (!accessToken) {
        console.error("액세스 토큰이 없습니다.");
        Alert.alert("오류 발생", "로그인이 필요합니다.", [
          { text: "확인", onPress: () => navigation.navigate("Login") },
        ]);
        return;
      }

      // API 엔드포인트에 답변 제출
      const response = await fetch(`${API_BASE_URL}/mbti/result/`, {
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

      // 성공적으로 제출되면 결과 화면으로 이동
      navigation.navigate("TypeResult");
    } catch (error) {
      console.error("Error submitting answers:", error);
      Alert.alert(
        "오류 발생",
        "답변 제출 중 오류가 발생했습니다. 다시 시도해주세요.",
        [{ text: "확인", onPress: () => setIsSubmitting(false) }]
      );
    }
  };

  // 로딩 중이거나 질문이 없을 경우
  if (isLoading || questions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6EE69E" />
        <Text style={styles.loadingText}>질문을 불러오는 중...</Text>
      </View>
    );
  }

  // 현재 질문 객체
  const currentQuestion = questions[currentQuestionIndex];

  // 진행 상황 계산 (예: "3 / 12")
  const progressText = `${currentQuestionIndex + 1} / ${questions.length}`;

  return (
    <View style={styles.container}>
      {isSubmitting ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6EE69E" />
          <Text style={styles.loadingText}>결과를 분석 중입니다...</Text>
        </View>
      ) : (
        <>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{progressText}</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      ((currentQuestionIndex + 1) / questions.length) * 100
                    }%`,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {currentQuestion.question_text}
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleSelectOption("A")}
            >
              <Text style={styles.optionText}>
                A. {currentQuestion.option_a}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleSelectOption("B")}
            >
              <Text style={styles.optionText}>
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
    backgroundColor: "#003340",
    padding: 20,
  },
  progressContainer: {
    marginTop: 60,
    marginBottom: 20,
  },
  progressText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 5,
    textAlign: "right",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#D4DDEF20",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#6EE69E",
    borderRadius: 4,
  },
  questionContainer: {
    marginVertical: 40,
    alignItems: "center",
  },
  questionText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
  },
  optionsContainer: {
    marginTop: 20,
  },
  optionButton: {
    backgroundColor: "#D4DDEF60",
    padding: 20,
    borderRadius: 15,
    marginVertical: 10,
  },
  optionText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 18,
    marginTop: 20,
  },
});

export default TypeExamScreen;
