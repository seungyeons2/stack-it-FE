import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SearchIcon from "../../assets/icons/search.svg";
import { fetchUserInfo } from "../../utils/user";
import { getNewAccessToken } from "../../utils/token";
import { fetchPortfolio } from "../../utils/portfolio";
import RecommendedStock from "../../components/RecommendedStock";
import { API_BASE_URL } from "../../utils/apiConfig";
import { fetchWithHantuToken } from "../../utils/hantuToken";

// 🎨 테마 훅 import
import { useTheme } from "../../utils/ThemeContext";

const StockTradeScreen = ({ navigation }) => {
  // 🎨 테마 가져오기
  const { theme } = useTheme();
  
  console.log("📌 StockTradeScreen 렌더링");
  const [userInfo, setUserInfo] = useState(null);
  const [portfolioData, setPortfolioData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRecommended, setShowRecommended] = useState(false);

  useEffect(() => {
    const load = async () => {
      await fetchUserInfo(navigation, setUserInfo);
      await fetchEnhancedPortfolio();

      // 보유 주식 로딩 완료 후 2초 뒤에 추천 주식 표시
      setTimeout(() => {
        setShowRecommended(true);
      }, 2000);
    };
    load();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("📥 다시 focus됨: 포트폴리오 재요청");
      fetchEnhancedPortfolio();

      // 화면 재진입 시에도 추천 주식 로딩 지연
      setShowRecommended(false);
      setTimeout(() => {
        setShowRecommended(true);
      }, 2000);
    });

    return unsubscribe;
  }, [navigation]);

  // 포트폴리오 데이터에 전일대비 증감률 정보를 추가하는 함수
  const fetchEnhancedPortfolio = async () => {
    console.log("📥 향상된 포트폴리오 요청 시작");

    try {
      setLoading(true);

      // 1. 기본 포트폴리오 데이터 가져오기
      const response = await fetch(`${API_BASE_URL}trading/portfolio/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${await getNewAccessToken(navigation)}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("📦 포트폴리오 응답:", result);

      if (result?.status !== "success" || !Array.isArray(result.portfolio)) {
        console.warn("⚠️ 응답 구조가 예상과 다릅니다:", result);
        setPortfolioData([]);
        return;
      }

      // 2. 수량이 0인 항목 필터링 및 기본 데이터 파싱
      const filteredPortfolio = result.portfolio.filter(
        (item) => item.quantity > 0
      );

      // 3. 각 종목에 대해 전일대비 증감률 정보 조회 (순차적으로, 간격을 두고)
      const enhancedPortfolio = [];

      for (let index = 0; index < filteredPortfolio.length; index++) {
        const item = filteredPortfolio[index];

        try {
          console.log(
            `📊 ${item.stock_code} 전일대비 증감률 조회 중... (${index + 1}/${
              filteredPortfolio.length
            })`
          );

          // API 호출 간격을 두어 429 에러 방지 (1초에 2회 제한이므로 500ms 간격)
          if (index > 0) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }

          // 전일대비 증감률 API 호출
          const changeResult = await fetchWithHantuToken(
            `${API_BASE_URL}stocks/price_change/?stock_code=${item.stock_code}`
          );

          let currentPrice = item.current_price;
          let changePercent = 0;
          let changeStatus = "same";

          if (changeResult.success && changeResult.data?.status === "success") {
            currentPrice = changeResult.data.current_price;
            changePercent = changeResult.data.price_change_percentage;
            changeStatus = changeResult.data.change_status;
            console.log(`✅ ${item.stock_code} 증감률: ${changePercent}%`);
          } else {
            console.warn(`⚠️ ${item.stock_code} 증감률 조회 실패, 기본값 사용`);
          }

          enhancedPortfolio.push({
            id: `${item.stock_code}-${index}`,
            name: item.stock_name,
            symbol: item.stock_code,
            price: currentPrice || 0,
            change: changePercent || 0,
            changeStatus: changeStatus || "same",
            quantity: item.quantity || 0,
            average_price: item.average_price || 0,
            totalBuyPrice: (item.average_price || 0) * (item.quantity || 0),
            current_value: (currentPrice || 0) * (item.quantity || 0),
            profit_amount:
              ((currentPrice || 0) - (item.average_price || 0)) *
              (item.quantity || 0),
          });
        } catch (error) {
          console.error(`❌ ${item.stock_code} 데이터 처리 실패:`, error);

          // 오류 발생 시 기본값 사용
          enhancedPortfolio.push({
            id: `${item.stock_code}-${index}`,
            name: item.stock_name,
            symbol: item.stock_code,
            price: item.current_price || 0,
            change: 0,
            changeStatus: "same",
            quantity: item.quantity || 0,
            average_price: item.average_price || 0,
            totalBuyPrice: (item.average_price || 0) * (item.quantity || 0),
            current_value: (item.current_price || 0) * (item.quantity || 0),
            profit_amount:
              ((item.current_price || 0) - (item.average_price || 0)) *
              (item.quantity || 0),
          });
        }
      }

      console.log("✅ 향상된 포트폴리오 데이터:", enhancedPortfolio);
      setPortfolioData(enhancedPortfolio);
    } catch (error) {
      console.error("❌ 향상된 포트폴리오 요청 실패:", error);
      setPortfolioData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (number) => {
    if (typeof number !== "number" || isNaN(number)) {
      return "0";
    }
    return number.toLocaleString();
  };

  const getChangeColor = (changeStatus) => {
    return theme.status[changeStatus] || theme.status.same;
  };

  const getChangeSymbol = (changeStatus) => {
    switch (changeStatus) {
      case "up":
        return "▲";
      case "down":
        return "▼";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background.primary, justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={theme.accent.primary} />
        <Text style={[styles.loadingText, { color: theme.text.primary }]}>보유 주식 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={[styles.backText, { color: theme.accent.primary }]}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.accent.primary }]}>주식 거래하기</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 현재 보유 주식 */}
        <Text style={[styles.sectionTitle, { color: theme.accent.secondary }]}>현재 보유 주식</Text>
        <View style={[styles.divider, { backgroundColor: theme.background.secondary }]} />

        {portfolioData.length > 0 ? (
          portfolioData.map((stock) => (
            <View key={stock.id}>
              <TouchableOpacity
                style={styles.stockItem}
                onPress={() => {
                  console.log("📱 보유 주식 클릭:", stock.name, stock.symbol);
                  navigation.navigate("StockDetail", {
                    symbol: stock.symbol,
                    name: stock.name,
                  });
                }}
                activeOpacity={0.7}
              >
                <View style={styles.stockInfo}>
                  <Text style={[styles.stockName, { color: theme.text.primary }]}>{stock.name}</Text>
                  <Text style={[styles.stockCode, { color: theme.text.tertiary }]}>({stock.symbol})</Text>

                  <View style={styles.priceContainer}>
                    <Text style={[styles.stockPrice, { color: theme.text.primary }]}>
                      {formatNumber(stock.price)}원
                    </Text>
                    <Text
                      style={[
                        styles.stockChange,
                        { color: getChangeColor(stock.changeStatus) },
                      ]}
                    >
                      {getChangeSymbol(stock.changeStatus)}
                      {Math.abs(stock.change || 0).toFixed(2)}%
                    </Text>
                  </View>

                  <Text style={styles.averageLine}>
                    평균 단가: {formatNumber(stock.average_price)}원
                  </Text>
                  <Text style={styles.stockLine}>
                    총 매수 금액: {formatNumber(stock.totalBuyPrice)}원
                  </Text>
                  <Text style={[styles.quantity, { color: theme.text.primary }]}>
                    보유 수량: {formatNumber(stock.quantity)}주
                  </Text>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.buyButton, { backgroundColor: theme.status.down }]}
                    onPress={(e) => {
                      e.stopPropagation(); // 부모 TouchableOpacity 이벤트 방지
                      console.log("매수 버튼 클릭됨");
                      console.log("전달할 stock 데이터:", {
                        id: stock.id,
                        name: stock.name,
                        price: stock.price,
                        change: stock.change,
                        quantity: stock.quantity,
                        symbol: stock.symbol,
                      });

                      if (!stock.name || !stock.price) {
                        Alert.alert("오류", "주식 정보가 완전하지 않습니다.");
                        return;
                      }

                      navigation.navigate("TradingBuy", { stock });
                    }}
                  >
                    <Text style={[styles.buyText, { color: theme.background.primary }]}>매수</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.sellButton, { backgroundColor: theme.status.up }]}
                    onPress={(e) => {
                      e.stopPropagation(); // 부모 TouchableOpacity 이벤트 방지
                      navigation.navigate("TradingSell", { stock });
                    }}
                  >
                    <Text style={[styles.sellText, { color: theme.background.primary }]}>매도</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
              <View style={[styles.divider, { backgroundColor: theme.background.secondary }]} />
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.text.primary }]}>보유 중인 주식이 없습니다</Text>
            <Text style={[styles.emptySubText, { color: theme.text.tertiary }]}>
              아래 추천 주식에서 투자를 시작해보세요!
            </Text>
          </View>
        )}

        {/* 추천 주식 섹션 */}
        {/* <Text style={styles.sectionTitle}>추천 주식</Text>
        <View style={styles.divider} />

        {showRecommended ? (
          ["005930", "352820", "066570"].map((stockCode) => (
            <RecommendedStock
              key={stockCode}
              stockCode={stockCode}
              navigation={navigation}
              styles={styles}
            />
          ))
        ) : (
          <View style={styles.recommendedLoading}>
            <Text style={styles.recommendedLoadingText}>
              추천 주식 로딩 중...
            </Text>
          </View>
        )} */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  backButton: {
    position: "absolute",
    top: 0,
    left: 20,
    zIndex: 10,
  },
  backText: {
    fontSize: 36,
  },
  scrollView: {
    flex: 1,
    marginTop: 70,
    marginBottom: 20,
    maxHeight: 1000,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    top: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 0,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  stockItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  stockInfo: {
    flex: 1,
  },
  stockName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  stockCode: {
    fontSize: 12,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stockPrice: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  stockChange: {
    fontSize: 16,
    fontWeight: "bold",
  },
  averageLine: {
    fontSize: 16,
    color: "#11A5CF",
    marginTop: 10,
  },
  stockLine: {
    fontSize: 16,
    color: "#AFA5CF",
    marginTop: 4,
  },
  quantity: {
    fontSize: 14,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  buyButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  buyText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  sellButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  sellText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: "center",
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  recommendedLoading: {
    paddingVertical: 20,
    alignItems: "center",
  },
  recommendedLoadingText: {
    fontSize: 14,
  },
});

export default StockTradeScreen;