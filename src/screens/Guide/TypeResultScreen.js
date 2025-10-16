import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet as RNStyleSheet,
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
import ViewShot from "react-native-view-shot";
import { API_BASE_URL } from "../../utils/apiConfig";
import { getNewAccessToken } from "../../utils/token";

// 🎨 테마 훅 import
import { useTheme } from "../../utils/ThemeContext";

const TypeResultScreen = ({ navigation }) => {
  // 🎨 테마 가져오기
  const { theme } = useTheme();
  
  const [result, setResult] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const viewShotRef = useRef();

  useEffect(() => {
    fetchResultAndRecommendations();
  }, []);

  const fetchResultAndRecommendations = async () => {
    try {
      const accessToken = await getNewAccessToken(navigation);
      if (!accessToken) {
        console.error("액세스 토큰이 없습니다.");
        Alert.alert("오류 발생", "로그인이 필요합니다.", [
          { text: "확인", onPress: () => navigation.navigate("Login") },
        ]);
        return;
      }

      console.log("MBTI 결과와 추천 정보를 가져오는 중...");

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

        if (resultData.result && typeof resultData.result === "string") {
          mbtiType = resultData.result;
          setResult({ type: mbtiType });
        } else if (resultData.type) {
          mbtiType = resultData.type;
          setResult(resultData);
        } else {
          console.error("예상치 못한 결과 형태:", resultData);
          throw new Error("결과 데이터 형식이 올바르지 않습니다");
        }

        console.log("MBTI 유형 코드:", mbtiType);

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

  const handleShare = async () => {
    if (!recommendations) return;

    try {
      const uri = await viewShotRef.current.capture();
      
      const message = `나의 투자 유형은 "${recommendations.alias}"(${recommendations.mbti})입니다!\n`;
      const guide = recommendations.psychology_guide
        ? `\n투자 조언: ${recommendations.psychology_guide}`
        : "";

      await Share.share({
        message: message + guide + "\n두둑 앱에서 확인해보세요!",
        url: uri,
      });
    } catch (error) {
      console.error("Error sharing:", error);
      Alert.alert("공유 오류", "공유 중 문제가 발생했습니다.");
    }
  };

  const openLink = (url) => {
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

  const getMbtiImage = (mbtiType) => {
    if (!mbtiType) return null;

    console.log("이미지 로드 시도:", mbtiType);

    switch (mbtiType) {
      case "SDGH":
        return require("../../assets/mbti/SDGH.png");
      case "SDGQ":
        return require("../../assets/mbti/SDGQ.png");
      case "SDVH":
        return require("../../assets/mbti/SDVH.png");
      case "SDVQ":
        return require("../../assets/mbti/SDVQ.png");
      case "SFGH":
        return require("../../assets/mbti/SFGH.png");
      case "SFGQ":
        return require("../../assets/mbti/SFGQ.png");
      case "SFVH":
        return require("../../assets/mbti/SFVH.png");
      case "SFVQ":
        return require("../../assets/mbti/SFVQ.png");
      case "RDGH":
        return require("../../assets/mbti/RDGH.png");
      case "RDGQ":
        return require("../../assets/mbti/RDGQ.png");
      case "RDVH":
        return require("../../assets/mbti/RDVH.png");
      case "RDVQ":
        return require("../../assets/mbti/RDVQ.png");
      case "RFGH":
        return require("../../assets/mbti/RFGH.png");
      case "RFGQ":
        return require("../../assets/mbti/RFGQ.png");
      case "RFVH":
        return require("../../assets/mbti/RFVH.png");
      case "RFVQ":
        return require("../../assets/mbti/RFVQ.png");
      default:
        console.warn(`이미지를 찾을 수 없습니다: ${mbtiType}`);
        return null;
    }
  };

  const handleGoBack = () => {
    navigation.navigate('MainTab', { screen: 'Guide' });
  };

  if (loading) {
    return (
      <View style={[resultStyles.loadingContainer, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={theme.status.success} />
        <Text style={[resultStyles.loadingText, { color: theme.text.primary }]}>
          결과를 불러오는 중...
        </Text>
      </View>
    );
  }

  if (!result || !recommendations) {
    return (
      <View style={[resultStyles.loadingContainer, { backgroundColor: theme.background.primary }]}>
        <Text style={[resultStyles.errorText, { color: theme.status.error }]}>
          결과를 불러올 수 없습니다.
        </Text>
        <TouchableOpacity
          style={[resultStyles.retryButton, { backgroundColor: theme.status.success }]}
          onPress={() => navigation.navigate("TypeExam")}
        >
          <Text style={[resultStyles.retryButtonText, { color: theme.background.primary }]}>
            다시 테스트하기
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const mbtiImage = getMbtiImage(recommendations.mbti || result.type);

  return (
    <View style={[resultStyles.container, { backgroundColor: theme.background.primary }]}>
      <View style={resultStyles.header}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={resultStyles.backButton}
        >
          <Text style={[resultStyles.backText, { color: theme.text.primary }]}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={[resultStyles.headerTitle, { color: theme.text.primary }]}>
          나의 투자 유형
        </Text>
        <TouchableOpacity onPress={handleShare} style={resultStyles.shareButton}>
          <Icon name="share-2" size={24} color={theme.text.primary} />
        </TouchableOpacity>
      </View>

      {/* ViewShot 숨김처리*/}
      <ViewShot 
        ref={viewShotRef} 
        options={{ 
          fileName: "investment-type-result", 
          format: "png", 
          quality: 0.9,
          result: "tmpfile",
        }}
        style={resultStyles.hiddenViewShot}
      >
        <View style={resultStyles.shareableContent}>
          <Text style={resultStyles.appBranding}>두둑 투자 유형 테스트</Text>
          
          <View style={resultStyles.shareableMbtiContainer}>
            <Text style={resultStyles.shareableMbtiType}>
              {recommendations?.mbti || result?.type}
            </Text>
          </View>

          <Text style={resultStyles.shareableLabel}>당신의 투자 유형은</Text>
          <Text style={resultStyles.shareableNickname}>
            {recommendations?.alias || "투자자"}
          </Text>

          {mbtiImage ? (
            <View style={resultStyles.shareableImageContainer}>
              <Image
                source={mbtiImage}
                style={resultStyles.shareableMbtiImage}
                resizeMode="contain"
              />
            </View>
          ) : (
            <View style={resultStyles.shareableNoImageContainer}>
              <Text style={resultStyles.shareableNoImageText}>
                유형 이미지를 준비 중입니다
              </Text>
            </View>
          )}

          {recommendations?.psychology_guide && (
            <View style={resultStyles.shareableGuideContainer}>
              <Text style={resultStyles.shareableGuideText}>
                {recommendations.psychology_guide}
              </Text>
            </View>
          )}

          <Text style={resultStyles.bottomBranding}>두둑 앱에서 자세히 확인하세요!</Text>
        </View>
      </ViewShot>

      <ScrollView style={resultStyles.content} showsVerticalScrollIndicator={false}>
        <View style={[resultStyles.resultCard, { backgroundColor: theme.background.card }]}>
          <View style={[resultStyles.mbtiTypeContainer, { backgroundColor: theme.status.success }]}>
            <Text style={[resultStyles.mbtiType, { color: theme.background.primary }]}>
              {recommendations.mbti || result.type}
            </Text>
          </View>

          <Text style={[resultStyles.nicknameTitleLabel, { color: theme.text.primary }]}>
            당신의 투자 유형은
          </Text>
          <Text style={[resultStyles.nickname, { color: theme.text.primary }]}>
            {recommendations.alias || "투자자"}
          </Text>

          {mbtiImage ? (
            <View style={resultStyles.imageContainer}>
              <Image
                source={mbtiImage}
                style={resultStyles.mbtiImage}
                resizeMode="contain"
              />
            </View>
          ) : (
            <View style={[resultStyles.noImageContainer, { backgroundColor: theme.background.secondary }]}>
              <Text style={[resultStyles.noImageText, { color: theme.text.secondary }]}>
                유형 이미지를 준비 중입니다.
              </Text>
            </View>
          )}

          <View style={resultStyles.typeGraphContainer}>
            <ImageBackground
              source={require("../../assets/mbti/type-graph-bg.png")}
              style={resultStyles.typeGraphImage}
              imageStyle={{ borderRadius: 20 }}
              resizeMode="contain"
            />
          </View>

          {recommendations.psychology_guide && (
            <View style={[resultStyles.sectionContainer, { borderTopColor: theme.border.medium }]}>
              <Text style={[resultStyles.sectionTitle, { color: theme.status.success }]}>
                당신을 위한 조언
              </Text>
              <Text style={[resultStyles.sectionText, { color: theme.text.primary }]}>
                {recommendations.psychology_guide}
              </Text>
            </View>
          )}

          {recommendations.books && recommendations.books.length > 0 && (
            <View style={[resultStyles.sectionContainer, { borderTopColor: theme.border.medium }]}>
              <Text style={[resultStyles.sectionTitle, { color: theme.status.success }]}>
                추천 도서
              </Text>
              {recommendations.books.map((book, index) => (
                <Text 
                  key={`book-${index}`} 
                  style={[resultStyles.listItem, { color: theme.text.primary }]}
                >
                  • {book}
                </Text>
              ))}
            </View>
          )}

          {recommendations.websites && recommendations.websites.length > 0 && (
            <View style={[resultStyles.sectionContainer, { borderTopColor: theme.border.medium }]}>
              <Text style={[resultStyles.sectionTitle, { color: theme.status.success }]}>
                추천 웹사이트
              </Text>
              {recommendations.websites.map((website, index) => (
                <TouchableOpacity
                  key={`website-${index}`}
                  onPress={() => openLink(website)}
                >
                  <Text style={[resultStyles.listItem, { color: theme.text.primary }]}>
                    • {website}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {recommendations.newsletters && recommendations.newsletters.length > 0 && (
            <View style={[resultStyles.sectionContainer, { borderTopColor: theme.border.medium }]}>
              <Text style={[resultStyles.sectionTitle, { color: theme.status.success }]}>
                추천 기사
              </Text>
              {recommendations.newsletters.map((newsletter, index) => (
                <TouchableOpacity
                  key={`newsletter-${index}`}
                  onPress={() => openLink(newsletter)}
                >
                  <Text style={[resultStyles.listItem, { color: theme.text.primary }]}>
                    • {newsletter}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={resultStyles.buttonsContainer}>
          <TouchableOpacity
            style={[resultStyles.button, resultStyles.tryAgainButton, { backgroundColor: theme.button.primary }]}
            onPress={() => navigation.navigate("TypeExam")}
          >
            <Text style={[resultStyles.buttonText, { color: theme.text.primary }]}>
              다시 검사하기
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const resultStyles = RNStyleSheet.create({
  container: {
    flex: 1,
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
  hiddenViewShot: {
    position: 'absolute',
    left: -9999,
    top: -9999,
    width: 350,
    height: 600,
  },
  shareableContent: {
    width: 350,
    height: 600,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shareableMbtiContainer: {
    backgroundColor: "#6EE69E",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  shareableMbtiType: {
    color: "#003340",
    fontSize: 18,
    fontWeight: "700",
  },
  shareableLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  shareableNickname: {
    color: "#003340",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  shareableImageContainer: {
    width: 200,
    height: 200,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  shareableMbtiImage: {
    width: "100%",
    height: "100%",
  },
  shareableNoImageContainer: {
    width: 200,
    height: 200,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
  },
  shareableNoImageText: {
    color: "#666",
    fontSize: 14,
    fontStyle: "italic",
  },
  shareableGuideContainer: {
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  shareableGuideText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    lineHeight: 20,
  },
  appBranding: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomBranding: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  resultCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  mbtiTypeContainer: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 15,
  },
  mbtiType: {
    fontSize: 16,
    fontWeight: "700",
  },
  nicknameTitleLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  nickname: {
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
    borderRadius: 10,
  },
  noImageText: {
    fontSize: 16,
    fontStyle: "italic",
  },
  sectionContainer: {
    width: "100%",
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 10,
  },
  listItem: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
    paddingRight: 15,
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
    // backgroundColor will be set by theme
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
   },
  loadingText: {
    //color: "#FFFFFF",
    fontSize: 18,
    marginTop: 20,
  },
  errorText: {
    //color: "#FFFFFF",
    fontSize: 18,
    marginBottom: 20,
  },
  retryButton: {
    //backgroundColor: "#6EE69E",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  retryButtonText: {
    //color: "#003340",
    fontSize: 16,
    fontWeight: "bold",
  },
  backText: {
    //color: "#FFFFFF",
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