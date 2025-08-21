import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  Linking,
  ImageBackground
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { API_BASE_URL } from "../../utils/apiConfig";
import { getNewAccessToken } from "../../utils/token";

const TypeResultScreen = ({ navigation }) => {
  const [result, setResult] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 결과 데이터 가져오기
    fetchResultAndRecommendations();
  }, []);

  // 결과와 추천 정보를 함께 가져오는 함수
  const fetchResultAndRecommendations = async () => {
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

      console.log("MBTI 결과와 추천 정보를 가져오는 중...");

      // 1. 먼저 기본 결과 정보 가져오기
      const resultResponse = await fetch(
        `${API_BASE_URL}/mbti/result/detail/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!resultResponse.ok) {
        throw new Error(`결과 요청 실패: ${resultResponse.status}`);
      }

      const resultText = await resultResponse.text();
      console.log("결과 응답 원본:", resultText);

      let mbtiType = "";

      try {
        const resultData = JSON.parse(resultText);
        console.log("파싱된 결과 데이터:", resultData);

        // 서버가 {"result":"RDGQ"} 형태로 응답하는 경우
        if (resultData.result && typeof resultData.result === "string") {
          mbtiType = resultData.result;
          setResult({ type: mbtiType });
        }
        // 서버가 {type: "RDGQ"} 형태로 응답하는 경우
        else if (resultData.type) {
          mbtiType = resultData.type;
          setResult(resultData);
        }
        // 그 외의 예상치 못한 응답 형태
        else {
          console.error("예상치 못한 결과 형태:", resultData);
          throw new Error("결과 데이터 형식이 올바르지 않습니다");
        }

        console.log("MBTI 유형 코드:", mbtiType);

        // 2. 추천 정보 가져오기
        const recResponse = await fetch(
          `${API_BASE_URL}/mbti/result/recommendations/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!recResponse.ok) {
          throw new Error(`추천 요청 실패: ${recResponse.status}`);
        }

        const recText = await recResponse.text();
        console.log("추천 응답 원본:", recText);

        try {
          const recData = JSON.parse(recText);
          console.log("파싱된 추천 데이터:", recData);
          setRecommendations(recData);
        } catch (recParseError) {
          console.error("추천 JSON 파싱 오류:", recParseError);
          throw new Error("추천 데이터 파싱에 실패했습니다");
        }
      } catch (resultParseError) {
        console.error("결과 JSON 파싱 오류:", resultParseError);
        throw new Error("결과 데이터 파싱에 실패했습니다");
      }
    } catch (error) {
      console.error("데이터 요청 오류:", error);
      Alert.alert("오류 발생", "결과를 불러오는 중 오류가 발생했습니다.", [
        { text: "확인", onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 결과 공유 기능
  const handleShare = async () => {
    if (!recommendations) return;

    try {
      const message = `나의 투자 유형은 "${recommendations.alias}"(${recommendations.mbti})입니다!\n`;
      const guide = recommendations.psychology_guide
        ? `\n투자 조언: ${recommendations.psychology_guide}`
        : "";

      await Share.share({
        message: message + guide + "\n두둑 앱에서 확인해보세요!",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // 웹사이트 열기
  const openLink = (url) => {
    // 공백 제거 (일부 URL에 앞에 공백이 있을 수 있음)
    const trimmedUrl = url.trim();

    Linking.canOpenURL(trimmedUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(trimmedUrl);
        } else {
          console.error("이 URL을 열 수 없습니다:", trimmedUrl);
          Alert.alert("오류", "이 링크를 열 수 없습니다.");
        }
      })
      .catch((err) => {
        console.error("링크 열기 오류:", err);
        Alert.alert("오류", "링크를 여는 중 문제가 발생했습니다.");
      });
  };

  // 이미지 동적 로드 함수
  const getMbtiImage = (mbtiType) => {
    if (!mbtiType) return null;

    console.log("이미지 로드 시도:", mbtiType);

    // MBTI 타입에 따라 이미지 선택
    // React Native에서는 require() 인자로 동적 문자열을 사용할 수 없음
    // 따라서 모든 가능한 케이스를 직접 매핑
    switch (mbtiType) {
      // 안정형(S) 유형들
      case "SDGH":
        return require("../../assets/mbti/SDGH.png"); // 꼼꼼한 연구자
      case "SDGQ":
        return require("../../assets/mbti/SDGQ.png"); // 현실적인 기회포착가
      case "SDVH":
        return require("../../assets/mbti/SDVH.png"); // 거북이 연구원
      case "SDVQ":
        return require("../../assets/mbti/SDVQ.png"); // 숫자 요술사
      case "SFGH":
        return require("../../assets/mbti/SFGH.png"); // 우직한 성장 농부
      case "SFGQ":
        return require("../../assets/mbti/SFGQ.png"); // 순간을 노리는 헌터
      case "SFVH":
        return require("../../assets/mbti/SFVH.png"); // 안정적인 항해자
      case "SFVQ":
        return require("../../assets/mbti/SFVQ.png"); // 과감한 플레이어

      // 모험형(R) 유형들
      case "RDGH":
        return require("../../assets/mbti/RDGH.png"); // 미래의 유니콘 찾는 자
      case "RDGQ":
        return require("../../assets/mbti/RDGQ.png"); // 숨은 보석 감별사
      case "RDVH":
        return require("../../assets/mbti/RDVH.png"); // 인내심 강한 포식자
      case "RDVQ":
        return require("../../assets/mbti/RDVQ.png"); // 변화의 춤꾼
      case "RFGH":
        return require("../../assets/mbti/RFGH.png"); // 미래를 향한 개척자
      case "RFGQ":
        return require("../../assets/mbti/RFGQ.png"); // 변화의 선두주자
      case "RFVH":
        return require("../../assets/mbti/RFVH.png"); // 혁신 사냥꾼
      case "RFVQ":
        return require("../../assets/mbti/RFVQ.png"); // 변동 추적자

      default:
        // 일치하는 이미지가 없을 경우 경고 표시
        console.warn(`이미지를 찾을 수 없습니다: ${mbtiType}`);
        return null;
    }
  };

  const handleGoBack = () => {
    navigation.navigate('MainTab', { screen: 'Guide' });
  };

  // 로딩 중 화면
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6EE69E" />
        <Text style={styles.loadingText}>결과를 불러오는 중...</Text>
      </View>
    );
  }

  // 결과가 없는 경우
  if (!result || !recommendations) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>결과를 불러올 수 없습니다.</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.navigate("TypeExam")}
        >
          <Text style={styles.retryButtonText}>다시 테스트하기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 이미지 로드하기
  const mbtiImage = getMbtiImage(recommendations.mbti || result.type);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.backButton}
        >
          <Text style={styles.backText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>나의 투자 유형</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Icon name="share-2" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.resultCard}>
          <View style={styles.mbtiTypeContainer}>
            <Text style={styles.mbtiType}>
              {recommendations.mbti || result.type}
            </Text>
          </View>

          <Text style={styles.nicknameTitleLabel}>당신의 투자 유형은</Text>
          <Text style={styles.nickname}>
            {recommendations.alias || "투자자"}
          </Text>

          {mbtiImage ? (
            <View style={styles.imageContainer}>
              <Image
                source={mbtiImage}
                style={styles.mbtiImage}
                resizeMode="contain"
              />
            </View>
          ) : (
            <View style={styles.noImageContainer}>
              <Text style={styles.noImageText}>
                유형 이미지를 준비 중입니다
              </Text>
            </View>
          )}


          <View style={styles.typeGraphContainer}>
            <ImageBackground
              source={require("../../assets/mbti/type-graph-bg.png")}
              style={styles.typeGraphImage}
              imageStyle={{ borderRadius: 20 }} // 이미지 자체에 둥근 모서리
              resizeMode="contain"
            />
          </View>

          {recommendations.psychology_guide && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>당신을 위한 조언</Text>
              <Text style={styles.sectionText}>
                {recommendations.psychology_guide}
              </Text>
            </View>
          )}

          {recommendations.books && recommendations.books.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>추천 도서</Text>
              {recommendations.books.map((book, index) => (
                <Text key={`book-${index}`} style={styles.listItem}>
                  • {book}
                </Text>
              ))}
            </View>
          )}

          {recommendations.websites && recommendations.websites.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>추천 웹사이트</Text>
              {recommendations.websites.map((website, index) => (
                <TouchableOpacity
                  key={`website-${index}`}
                  onPress={() => openLink(website)}
                >
                  <Text style={styles.listItem}>• {website}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {recommendations.newsletters &&
            recommendations.newsletters.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>추천 기사</Text>
                {recommendations.newsletters.map((newsletter, index) => (
                  <TouchableOpacity
                    key={`newsletter-${index}`}
                    onPress={() => openLink(newsletter)}
                  >
                    <Text style={styles.listItem}>• {newsletter}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.tryAgainButton]}
            onPress={() => navigation.navigate("TypeExam")}
          >
            <Text style={styles.buttonText}>다시 검사하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003340",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  shareButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  resultCard: {
    backgroundColor: "#D4DDEF20",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  mbtiTypeContainer: {
    backgroundColor: "#6EE69E",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 15,
  },
  mbtiType: {
    color: "#003340",
    fontSize: 16,
    fontWeight: "700",
  },
  nicknameTitleLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 5,
  },
  nickname: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  imageContainer: {
    width: "100%",
    height: 200,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  mbtiImage: {
    width: "100%",
    height: "100%",
  },
  noImageContainer: {
    width: "100%",
    height: 200,
    marginVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D4DDEF30",
    borderRadius: 10,
  },
  noImageText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontStyle: "italic",
  },
  sectionContainer: {
    width: "100%",
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#D4DDEF40",
  },
  sectionTitle: {
    color: "#6EE69E",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sectionText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 10,
  },
  listItem: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
    paddingRight: 15,
  },
  linkItem: {
    color: "#6EE69E",
    textDecorationLine: "underline",
  },
  buttonsContainer: {
    marginTop: 30,
    marginBottom: 50,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    marginVertical: 8,
  },
  tryAgainButton: {
    backgroundColor: "#F074BA",
  },
  guideButton: {
    backgroundColor: "#6EE69E",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
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
  errorText: {
    color: "#FFFFFF",
    fontSize: 18,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#6EE69E",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  retryButtonText: {
    color: "#003340",
    fontSize: 16,
    fontWeight: "bold",
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },

  typeGraphContainer: {
    width: "100%",
    height: 250,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'transparent', 
  },
  typeGraphImage: {
    width: "100%", 
    height: "100%",
    borderRadius: 20, 
  },

});

export default TypeResultScreen;
