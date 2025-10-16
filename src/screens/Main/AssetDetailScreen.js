import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import { API_BASE_URL } from "../../utils/apiConfig";
import { getNewAccessToken } from "../../utils/token";
import { Ionicons } from "@expo/vector-icons";

// 🎨 테마 훅 import
import { useTheme } from "../../utils/ThemeContext";

const screenWidth = Dimensions.get("window").width;

const AssetDetailScreen = ({ navigation }) => {
  // 🎨 테마 가져오기
  const { theme } = useTheme();
  
  const [assetData, setAssetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAssetData = async () => {
    try {
      setLoading(true);

      const accessToken = await getNewAccessToken(navigation);

      if (!accessToken) {
        setError("인증이 필요합니다");
        setLoading(false);
        return;
      }

      // 자산 API 호출
      const response = await fetch(`${API_BASE_URL}api/asset/summary/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        setError("서버 응답 오류: " + response.status);
        setLoading(false);
        return;
      }

      const responseText = await response.text();

      try {
        const data = JSON.parse(responseText);

        if (data.status === "success") {
          // ✅ 보유하지 않은 종목 필터링 추가
          const filteredData = {
            ...data,
            breakdown: data.breakdown
              ? data.breakdown.filter((item) => {
                  // 예수금은 항상 포함
                  if (item.label === "예수금") {
                    return true;
                  }
                  // 주식은 value가 0보다 큰 것만 포함
                  return item.value > 0;
                })
              : [],
          };

          console.log(
            "✅ 필터링 전 breakdown:",
            data.breakdown?.length || 0,
            "개"
          );
          console.log(
            "✅ 필터링 후 breakdown:",
            filteredData.breakdown?.length || 0,
            "개"
          );

          // 필터링된 항목들 로그 출력
          filteredData.breakdown.forEach((item) => {
            console.log(`📊 ${item.label}: ${item.value.toLocaleString()}원`);
          });

          setAssetData(filteredData);
          setError(null);
        } else {
          setError("API 응답 실패: " + (data.message || "알 수 없는 오류"));
        }
      } catch (jsonError) {
        console.error("JSON 파싱 오류:", jsonError);
        setError("응답 데이터 처리 오류");
      }
    } catch (err) {
      console.error("자산 데이터 로딩 오류:", err);
      setError("네트워크 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetData();
  }, []);

  // 금액 포맷팅
  const formatCurrency = (amount) => {
    if (typeof amount !== "number") return "0";
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // 퍼센트 계산
  const calculatePercentage = (value) => {
    if (!assetData || !assetData.total_asset || assetData.total_asset === 0)
      return "0%";
    return ((value / assetData.total_asset) * 100).toFixed(1) + "%";
  };

  // 🎨 차트 데이터 - 테마 색상 적용
  const prepareChartData = () => {
    if (
      !assetData ||
      !assetData.breakdown ||
      assetData.breakdown.length === 0
    ) {
      return [];
    }

    return assetData.breakdown.map((item, index) => ({
      name: item.label,
      value: item.value,
      color: theme.chart.colors[index % theme.chart.colors.length],
      legendFontColor: theme.text.primary,
      legendFontSize: 12,
    }));
  };

  // 실제 보유 주식만 필터링하는 함수
  const getOwnedStocks = () => {
    if (!assetData?.breakdown) return [];

    return assetData.breakdown.filter(
      (stock) => stock.label !== "예수금" && stock.value > 0
    );
  };

  // 로딩
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={theme.accent.primary} />
        <Text style={[styles.loadingText, { color: theme.text.primary }]}>
          보유 주식 정보를 불러오는 중...
        </Text>
      </View>
    );
  }

  // 에러
  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.background.primary }]}>
        <Text style={[styles.errorText, { color: theme.status.error }]}>{error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: theme.button.primary }]} 
          onPress={fetchAssetData}
        >
          <Text style={[styles.retryButtonText, { color: theme.text.primary }]}>
            다시 시도
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.backButton, { borderColor: theme.button.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: theme.button.primary }]}>
            돌아가기
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 데이터 없음 화면
  if (!assetData) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.background.primary }]}>
        <Text style={[styles.errorText, { color: theme.status.error }]}>
          데이터를 불러올 수 없습니다
        </Text>
        <TouchableOpacity
          style={[styles.backButton, { borderColor: theme.button.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: theme.button.primary }]}>
            돌아가기
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const chartData = prepareChartData();
  const ownedStocks = getOwnedStocks();

  // 정상 화면
  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={[styles.header, { backgroundColor: theme.background.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backText, { color: theme.accent.primary }]}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
          총 자산 상세
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* 차트 섹션 */}
        <View style={styles.chartSection}>
          {chartData.length > 0 ? (
            <PieChart
              data={chartData}
              width={screenWidth - 60}
              height={screenWidth - 60}
              chartConfig={{
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => theme.text.primary,
              }}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute={false}
              hasLegend={false}
              style={styles.chart}
              innerRadius="70%"
              center={[screenWidth * 0.23, 0]}
            />
          ) : (
            <View style={[styles.emptyChart, { backgroundColor: theme.background.secondary }]}>
              <Text style={[styles.emptyChartText, { color: theme.text.primary }]}>
                차트 데이터가 없습니다
              </Text>
            </View>
          )}
        </View>

        {/* 범례 컨테이너 */}
        <View style={styles.legendContainer}>
          {chartData.map((item, index) => (
            <View key={index} style={styles.legendItemVertical}>
              <View
                style={[styles.legendColor, { backgroundColor: item.color }]}
              />
              <Text style={[styles.legendLabel, { color: theme.text.secondary }]}>
                {item.name} {calculatePercentage(item.value)}
              </Text>
            </View>
          ))}
        </View>

        {/* 보유 주식 목록 */}
        <View style={styles.stockListContainer}>
          <Text style={[styles.sectionTitle, { color: theme.accent.primary }]}>
            보유 주식 목록{" "}
            {ownedStocks.length > 0 && `(${ownedStocks.length}개)`}
          </Text>

          {ownedStocks.length > 0 ? (
            ownedStocks.map((stock, index) => (
              <View 
                key={index} 
                style={[styles.stockItem, { backgroundColor: theme.background.secondary }]}
              >
                <View style={styles.stockInfoTop}>
                  <Text style={[styles.stockName, { color: theme.text.primary }]}>
                    {stock.label}
                  </Text>
                  <Text style={[styles.stockPercentage, { color: theme.status.success }]}>
                    {calculatePercentage(stock.value)}
                  </Text>
                </View>
                <Text style={[styles.stockValue, { color: theme.text.secondary }]}>
                  {formatCurrency(stock.value)}원
                </Text>
              </View>
            ))
          ) : (
            <View style={[styles.emptyListContainer, { backgroundColor: theme.background.secondary }]}>
              <Text style={[styles.emptyListText, { color: theme.text.secondary }]}>
                보유 주식이 없습니다
              </Text>
              <Text style={[styles.emptyListSubText, { color: theme.text.tertiary }]}>
                메인화면에서 주식 거래를 시작해보세요!
              </Text>
            </View>
          )}
        </View>

        {/* 자산 요약 */}
        <View style={[styles.summaryContainer, { backgroundColor: theme.background.secondary }]}>
          <View style={[styles.summaryItem, { borderBottomColor: theme.border.light }]}>
            <Text style={[styles.summaryLabel, { color: theme.text.secondary }]}>
              평가 금액
            </Text>
            <Text style={[styles.summaryValue, { color: theme.text.primary }]}>
              {formatCurrency(assetData.evaluation)}원
            </Text>
          </View>
          <View style={[styles.summaryItem, { borderBottomColor: theme.border.light }]}>
            <Text style={[styles.summaryLabel, { color: theme.text.secondary }]}>
              예수금
            </Text>
            <Text style={[styles.summaryValue, { color: theme.text.primary }]}>
              {formatCurrency(assetData.cash)}원
            </Text>
          </View>
          <View style={[styles.summaryItem, styles.totalItem]}>
            <Text style={[styles.totalLabel, { color: theme.accent.primary }]}>
              총 자산
            </Text>
            <Text style={[styles.totalValue, { color: theme.accent.primary }]}>
              {formatCurrency(assetData.total_asset)}원
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 10,
  },
  chartSection: {
    position: "relative",
    width: screenWidth - 60,
    height: screenWidth - 60,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8.65,
    elevation: 8,
  },
  chart: {
    borderRadius: 16,
  },
  emptyChart: {
    height: screenWidth - 40,
    width: screenWidth - 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  emptyChartText: {
    fontSize: 16,
  },
  stockListContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  stockItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  stockInfoTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  stockName: {
    fontSize: 16,
    fontWeight: "600",
  },
  stockPercentage: {
    fontSize: 14,
    fontWeight: "500",
  },
  stockValue: {
    fontSize: 14,
  },
  emptyListContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyListText: {
    textAlign: "center",
  },
  summaryContainer: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  totalItem: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  legendContainer: {
    paddingLeft: 21,
    marginBottom: 10,
  },
  legendItemVertical: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 14,
  },
  backText: {
    fontSize: 36,
  },
  emptyListSubText: {
    textAlign: "center",
    fontSize: 14,
    marginTop: 8,
  },
});

export default AssetDetailScreen;