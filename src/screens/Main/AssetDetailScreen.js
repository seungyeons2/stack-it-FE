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

const screenWidth = Dimensions.get("window").width;

const AssetDetailScreen = ({ navigation }) => {
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

  // 차트 데이터 - 필터링된 데이터 사용
  const prepareChartData = () => {
    if (
      !assetData ||
      !assetData.breakdown ||
      assetData.breakdown.length === 0
    ) {
      return [];
    }

    const chartColors = [
      "#F074BA", // 예수금 : 두둑 핑크
      "#3B82F6", // 파랑
      "#34D399", // 에메랄드
      "#10B981", // 녹색
      "#F59E0B", // 황색
      "#EF4444", // 빨강
      "#6366F1", // 보라
      "#8B5CF6", // 연보라
      "#EC4899", // 핑크
      "#F87171", // 연빨강
      "#FBBF24", // 주황
      "#4ADE80", // 연녹색
      "#22D3EE", // 하늘색
      "#60A5FA", // 연파랑
      "#A78BFA", // 라벤더
      "#F472B6", // 코랄 핑크
    ];

    return assetData.breakdown.map((item, index) => ({
      name: item.label,
      value: item.value,
      color: chartColors[index % chartColors.length],
      legendFontColor: "#EFF1F5",
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F074BA" />
        <Text style={styles.loadingText}>보유 주식 정보를 불러오는 중...</Text>
      </View>
    );
  }

  // 에러
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchAssetData}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 데이터 없음 화면
  if (!assetData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>데이터를 불러올 수 없습니다</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const chartData = prepareChartData();
  const ownedStocks = getOwnedStocks();

  // 정상 화면
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>총 자산 상세</Text>
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
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
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
            <View style={styles.emptyChart}>
              <Text style={styles.emptyChartText}>차트 데이터가 없습니다</Text>
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
              <Text style={styles.legendLabel}>
                {item.name} {calculatePercentage(item.value)}
              </Text>
            </View>
          ))}
        </View>

        {/* 보유 주식 목록 */}
        <View style={styles.stockListContainer}>
          <Text style={styles.sectionTitle}>
            보유 주식 목록{" "}
            {ownedStocks.length > 0 && `(${ownedStocks.length}개)`}
          </Text>

          {ownedStocks.length > 0 ? (
            ownedStocks.map((stock, index) => (
              <View key={index} style={styles.stockItem}>
                <View style={styles.stockInfoTop}>
                  <Text style={styles.stockName}>{stock.label}</Text>
                  <Text style={styles.stockPercentage}>
                    {calculatePercentage(stock.value)}
                  </Text>
                </View>
                <Text style={styles.stockValue}>
                  {formatCurrency(stock.value)}원
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyListContainer}>
              <Text style={styles.emptyListText}>보유 주식이 없습니다</Text>
              <Text style={styles.emptyListSubText}>
                메인화면에서 주식 거래를 시작해보세요!
              </Text>
            </View>
          )}
        </View>

        {/* 자산 요약 */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>평가 금액</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(assetData.evaluation)}원
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>예수금</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(assetData.cash)}원
            </Text>
          </View>
          <View style={[styles.summaryItem, styles.totalItem]}>
            <Text style={styles.totalLabel}>총 자산</Text>
            <Text style={styles.totalValue}>
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
    backgroundColor: "#003340",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: "#003340",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#EFF1F5",
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
    backgroundColor: "#004455",
    borderRadius: 16,
  },
  emptyChartText: {
    color: "#EFF1F5",
    fontSize: 16,
  },
  stockListContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F074BA",
    marginBottom: 16,
  },
  stockItem: {
    backgroundColor: "#004455",
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
    color: "#EFF1F5",
  },
  stockPercentage: {
    fontSize: 14,
    color: "#4ECDC4",
    fontWeight: "500",
  },
  stockValue: {
    fontSize: 14,
    color: "rgba(239, 241, 245, 0.7)",
  },
  emptyListContainer: {
    padding: 20,
    backgroundColor: "#004455",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyListText: {
    color: "rgba(239, 241, 245, 0.7)",
    textAlign: "center",
  },
  summaryContainer: {
    padding: 16,
    backgroundColor: "#004455",
    margin: 16,
    borderRadius: 12,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(239, 241, 245, 0.1)",
  },
  summaryLabel: {
    color: "rgba(239, 241, 245, 0.7)",
    fontSize: 14,
  },
  summaryValue: {
    color: "#EFF1F5",
    fontSize: 14,
    fontWeight: "500",
  },
  totalItem: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  totalLabel: {
    color: "#F074BA",
    fontSize: 16,
    fontWeight: "bold",
  },
  totalValue: {
    color: "#F074BA",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#003340",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#EFF1F5",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#003340",
  },
  errorText: {
    fontSize: 16,
    color: "#FF6B6B",
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#F074BA",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 8,
  },
  retryButtonText: {
    color: "#EFF1F5",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F074BA",
  },
  backButtonText: {
    color: "#F074BA",
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
    color: "rgba(239, 241, 245, 0.7)",
    fontSize: 14,
  },
  backText: {
    fontSize: 36,
    color: "#F074BA",
  },

  emptyListSubText: {
    color: "rgba(239, 241, 245, 0.5)",
    textAlign: "center",
    fontSize: 14,
    marginTop: 8,
  },
});

export default AssetDetailScreen;
