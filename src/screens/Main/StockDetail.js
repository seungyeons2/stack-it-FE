import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { API_BASE_URL } from "../../utils/apiConfig";
import { fetchWithHantuToken } from "../../utils/hantuToken";
import { fetchWithAuth } from "../../utils/token";
import { 
  addToWatchlist, 
  removeFromWatchlist, 
  isInWatchlist 
} from "../../utils/watchList";

// 🎨 테마 훅 import
import { useTheme } from "../../utils/ThemeContext";

const screenWidth = Dimensions.get("window").width;

const StockDetail = ({ route, navigation }) => {
  // 🎨 테마 가져오기
  const { theme } = useTheme();
  
  const { symbol, name } = route.params;
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // 보유 수량 관련 state
  const [ownedQuantity, setOwnedQuantity] = useState(0);
  const [averagePrice, setAveragePrice] = useState(0);
  const [portfolioLoading, setPortfolioLoading] = useState(true);

  // 차트 관련 state
  const [chartData, setChartData] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("1M");

  // 차트 포인트 클릭 관련 state
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 포트폴리오에서 해당 종목의 보유 수량 조회
  const fetchOwnedQuantity = async () => {
    try {
      setPortfolioLoading(true);
      console.log(`📊 ${symbol} 보유 수량 조회 시작`);

      const response = await fetchWithAuth(
        `${API_BASE_URL}trading/portfolio/`,
        { method: "GET" },
        navigation
      );

      if (!response.ok) {
        throw new Error(`포트폴리오 조회 실패: ${response.status}`);
      }

      const result = await response.json();

      if (result?.status === "success" && Array.isArray(result.portfolio)) {
        // 현재 종목과 일치하는 항목 찾기
        const ownedStock = result.portfolio.find(
          (item) => item.stock_code === symbol && item.quantity > 0
        );

        if (ownedStock) {
          setOwnedQuantity(ownedStock.quantity);
          setAveragePrice(ownedStock.average_price);
          console.log(
            `✅ ${symbol} 보유 수량: ${ownedStock.quantity}주, 평균단가: ${ownedStock.average_price}원`
          );
        } else {
          setOwnedQuantity(0);
          setAveragePrice(0);
          console.log(`📝 ${symbol} 보유하지 않음`);
        }
      } else {
        console.warn("포트폴리오 응답 형식이 예상과 다름:", result);
        setOwnedQuantity(0);
        setAveragePrice(0);
      }
    } catch (error) {
      console.error(`❌ ${symbol} 보유 수량 조회 실패:`, error);
      setOwnedQuantity(0);
      setAveragePrice(0);
    } finally {
      setPortfolioLoading(false);
    }
  };

  // 주식 데이터 조회 함수
  const fetchStockData = async () => {
    try {
      // 1. 현재 주가 조회
      const priceResult = await fetchWithHantuToken(
        `${API_BASE_URL}trading/stock_price/?stock_code=${symbol}`
      );
      if (!priceResult.success) throw new Error(priceResult.error);
      const priceData = priceResult.data;

      // 2. 가격 변동 정보 조회
      const changeResult = await fetchWithHantuToken(
        `${API_BASE_URL}stocks/price_change/?stock_code=${symbol}`
      );
      if (!changeResult.success) throw new Error(changeResult.error);
      const changeData = changeResult.data;

      // 3. 데이터 설정
      if (priceData.status === "success" && changeData.status === "success") {
        const changeSign =
        changeData.change_status === "up"
          ? " \u25B2 "  
          : changeData.change_status === "down"
          ? " \u25BC "  
          : "";

        const priceChangeSign =
          changeData.change_status === "up"
            ? "+"
            : changeData.change_status === "down"
            ? "-"
            : "";

        setStockData({
          symbol: symbol,
          name: name,
          price: priceData.current_price.toLocaleString(),
          change: `${changeSign}${Math.abs(
            changeData.price_change_percentage
          ).toFixed(2)}`,
          changeStatus: changeData.change_status,
          priceChange: `${priceChangeSign}${Math.abs(
            changeData.price_change
          ).toLocaleString()}`,
          previousPrice: changeData.previous_price.toLocaleString(),
          currentDate: changeData.current_date,
          previousDate: changeData.previous_date,
        });
      } else {
        throw new Error("주식 가격 또는 변동 정보 조회 실패");
      }
    } catch (error) {
      console.error("fetchStockData 오류:", error);
      throw error;
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
  
        // 병렬로 데이터 조회
        await Promise.all([
          fetchStockData(), 
          fetchOwnedQuantity(),
          checkWatchlistStatus() // 관심주식 상태 확인 추가
        ]);
      } catch (err) {
        console.error("StockDetail 데이터 로딩 실패:", err);
  
        // 오류 시 기본값 설정
        setStockData({
          symbol: symbol,
          name: name,
          price: "0",
          change: "0.00",
          changeStatus: "none",
          priceChange: "0",
          previousPrice: "0",
          currentDate: new Date().toISOString().split("T")[0],
          previousDate: new Date().toISOString().split("T")[0],
        });
  
        Alert.alert(
          "데이터 로딩 오류",
          "주식 정보를 불러오는 중 문제가 발생했습니다. 기본 정보만 표시됩니다.",
          [{ text: "확인" }]
        );
      } finally {
        setLoading(false);
      }
    };
  
    fetchAll();
  }, [symbol]);

  // 관심주식 상태 확인'
  const checkWatchlistStatus = async () => {
    try {
      console.log("⭐ 관심주식 상태 확인:", symbol);
      const isWatchlisted = await isInWatchlist(navigation, symbol);
      setIsFavorite(isWatchlisted);
      console.log(`${symbol} 관심주식 상태:`, isWatchlisted);
    } catch (error) {
      console.error("❌ 관심주식 상태 확인 실패:", error);
      setIsFavorite(false);
    }
  };
  

  // 차트 데이터 가져오기
  const fetchChartData = async (period) => {
    setChartLoading(true);
    try {
      // 기간별 날짜 계산
      const endDate = new Date();
      const startDate = new Date();

      switch (period) {
        case "1M":
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case "3M":
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case "6M":
          startDate.setMonth(endDate.getMonth() - 6);
          break;
        default:
          startDate.setMonth(endDate.getMonth() - 1);
      }

      const formatDate = (date) => {
        return (
          date.getFullYear() +
          String(date.getMonth() + 1).padStart(2, "0") +
          String(date.getDate()).padStart(2, "0")
        );
      };

      const startDateStr = formatDate(startDate);
      const endDateStr = formatDate(endDate);

      console.log(
        `📊 일봉 데이터 요청: ${symbol}, ${startDateStr} ~ ${endDateStr}`
      );

      const response = await fetchWithHantuToken(
        `${API_BASE_URL}stocks/daily_stock_price/?stock_code=${symbol}&start_date=${startDateStr}&end_date=${endDateStr}`
      );

      if (!response.success) {
        console.warn("일봉 데이터 조회 실패:", response.error);
        setChartData(null);
        return;
      }

      const data = response.data;
      console.log("📊 일봉 응답:", data);

      if (data.status === "success" && data.chart_data) {
        // 데이터를 차트에 맞게 변환
        const sortedData = data.chart_data.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        // 최대 표시할 점의 개수 설정
        const maxDataPoints = 25;
        const dataInterval = Math.max(
          1,
          Math.ceil(sortedData.length / maxDataPoints)
        );

        // 데이터 샘플링
        const sampledData = sortedData.filter(
          (_, index) => index % dataInterval === 0
        );

        // 마지막 데이터는 항상 포함
        if (
          sortedData.length > 0 &&
          sampledData[sampledData.length - 1] !==
            sortedData[sortedData.length - 1]
        ) {
          sampledData.push(sortedData[sortedData.length - 1]);
        }

        const labels = sampledData.map((item) => {
          const date = new Date(item.date);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        });

        const prices = sampledData.map((item) => item.close);

        // x축 레이블 개수 조정
        const maxLabelCount = 8;
        const labelInterval = Math.max(
          1,
          Math.ceil(labels.length / maxLabelCount)
        );
        const displayLabels = labels.map((label, index) =>
          index % labelInterval === 0 ? label : ""
        );

        setChartData({
          labels: displayLabels,
          datasets: [
            {
              data: prices,
              color: (opacity = 1) =>
                stockData?.changeStatus === "up"
                  ? `rgba(240, 116, 186, ${opacity})`
                  : stockData?.changeStatus === "down"
                  ? `rgba(96, 165, 250, ${opacity})`
                  : `rgba(156, 163, 175, ${opacity})`,
              strokeWidth: 2,
            },
          ],
          rawData: sampledData,
          yAxisSegments: 6,
        });
      } else {
        console.warn("일봉 데이터를 불러올 수 없습니다:", data);
        setChartData(null);
      }
    } catch (error) {
      console.error("일봉 데이터 요청 실패:", error);
      setChartData(null);
    } finally {
      setChartLoading(false);
    }
  };

  // 선택된 기간이 변경될 때마다 차트 데이터 새로 불러오기
  useEffect(() => {
    if (stockData) {
      fetchChartData(selectedPeriod);
    }
  }, [selectedPeriod, stockData]);

  // 즐겨찾기 토글
  const toggleFavorite = async () => {
    try {
      console.log("⭐ 관심주식 토글 시작:", symbol, "현재 상태:", isFavorite);
      
      // 낙관적 업데이트 (UI 먼저 변경)
      const newFavoriteState = !isFavorite;
      setIsFavorite(newFavoriteState);
      
      let result;
      if (newFavoriteState) {
        // 관심주식에 추가
        console.log("⭐ 관심주식 추가 요청:", symbol);
        result = await addToWatchlist(navigation, symbol);
      } else {
        // 관심주식에서 제거
        console.log("🗑️ 관심주식 제거 요청:", symbol);
        result = await removeFromWatchlist(navigation, symbol);
      }
      
      if (result.success) {
        console.log("✅ 관심주식 처리 성공:", result.message);
        // 성공 시 추가 피드백 (선택사항)
        // Alert.alert("성공", result.message);
      } else {
        console.error("❌ 관심주식 처리 실패:", result.message);
        // 실패 시 원래 상태로 되돌리기
        setIsFavorite(isFavorite);
        Alert.alert("오류", result.message || "관심주식 처리에 실패했습니다.");
      }
    } catch (error) {
      console.error("❌ 관심주식 토글 오류:", error);
      // 오류 시 원래 상태로 되돌리기
      setIsFavorite(isFavorite);
      Alert.alert("오류", "관심주식 처리 중 문제가 발생했습니다.");
    }
  };

  // 차트 색상 결정 함수
  const getChartColor = (opacity = 1) => {
    if (stockData?.changeStatus === "up") {
      return `rgba(240, 116, 186, ${opacity})`;
    } else if (stockData?.changeStatus === "down") {
      return `rgba(96, 165, 250, ${opacity})`;
    }
    return `rgba(156, 163, 175, ${opacity})`;
  };

  // 차트 설정에 테마 적용
  const getChartConfig = () => ({
    backgroundColor: theme.background.secondary,
    backgroundGradientFrom: theme.background.secondary,
    backgroundGradientTo: theme.background.secondary,
    decimalPlaces: 0,
    color: getChartColor,
    labelColor: (opacity = 1) => theme.text.primary,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: stockData?.changeStatus === "up"
        ? theme.status.up
        : stockData?.changeStatus === "down"
        ? theme.status.down
        : theme.status.same,
    },
  });

  // 매수 버튼 핸들러
  const handleBuyPress = () => {
    const stock = {
      name: stockData.name,
      price: stockData.price,
      change: stockData.change,
      symbol: stockData.symbol,
      quantity: ownedQuantity,
    };
    navigation.navigate("TradingBuy", { stock });
  };

  // 매도 버튼 핸들러
  const handleSellPress = () => {
    const stock = {
      name: stockData.name,
      price: stockData.price,
      change: stockData.change,
      symbol: stockData.symbol,
      quantity: ownedQuantity,
      average_price: averagePrice,
    };
    navigation.navigate("TradingSell", { stock });
  };

  // 차트 포인트 클릭 핸들러
  const handleDataPointClick = (data) => {
    if (chartData && chartData.rawData && data.index !== undefined) {
      const pointData = chartData.rawData[data.index];
      if (pointData) {
        const date = new Date(pointData.date);
        const formattedDate = `${date.getFullYear()}년 ${
          date.getMonth() + 1
        }월 ${date.getDate()}일`;

        setSelectedPoint({
          date: formattedDate,
          price: pointData.close.toLocaleString(),
          x: data.x,
          y: data.y,
        });
        setModalVisible(true);
      }
    }
  };

  // 모달 닫기
  const closeModal = () => {
    setModalVisible(false);
    setSelectedPoint(null);
  };

  // 기간 선택 버튼 렌더링
  const renderPeriodButtons = () => {
    const periods = [
      { key: "1M", label: "1개월" },
      { key: "3M", label: "3개월" },
      { key: "6M", label: "6개월" },
    ];

    return (
      <View style={styles.periodButtonContainer}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.selectedPeriodButton,
            ]}
            onPress={() => setSelectedPeriod(period.key)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period.key &&
                  styles.selectedPeriodButtonText,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // 차트 렌더링
  const renderChart = () => {
    if (chartLoading) {
      return (
        <View style={[styles.chartLoadingContainer, { backgroundColor: theme.background.secondary }]}>
          <ActivityIndicator size="large" color={theme.accent.primary} />
          <Text style={[styles.chartLoadingText, { color: theme.text.secondary }]}>차트 로딩 중...</Text>
        </View>
      );
    }

    if (!chartData || !chartData.datasets[0].data.length) {
      return (
        <View style={[styles.chartPlaceholder, { backgroundColor: theme.background.secondary }]}>
          <Text style={[styles.chartText, { color: theme.text.secondary }]}>차트 데이터를 불러올 수 없습니다</Text>
        </View>
      );
    }

    return (
      <View style={[styles.chartContainer, { backgroundColor: theme.background.secondary }]}>
        <LineChart
          data={chartData}
          width={screenWidth - 32}
          height={200}
          chartConfig={getChartConfig()}
          bezier
          style={styles.chart}
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLines={true}
          segments={chartData.yAxisSegments || 4}
          onDataPointClick={handleDataPointClick}
        />
      </View>
    );
  };

  if (loading || portfolioLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={theme.accent.primary} />
        <Text style={[styles.loadingText, { color: theme.text.primary }]}>주식 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* 헤더 */}
      <View style={[styles.header, { borderBottomColor: theme.background.secondary }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={[styles.backText, { color: theme.text.primary }]}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>{name}</Text>
        <TouchableOpacity
          onPress={toggleFavorite}
          style={styles.favoriteButton}
        >
          {isFavorite ? (
            <Text style={[styles.starIcon, { color: theme.accent.primary }]}>★</Text>
          ) : (
            <Text style={[styles.starIcon, { color: theme.accent.primary }]}>☆</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* 가격 섹션 */}
        <View style={styles.priceSection}>
          <Text style={[styles.symbolText, { color: theme.text.secondary }]}>{symbol}</Text>
          <Text style={[styles.priceText, { color: theme.text.primary }]}>{stockData.price}원</Text>
          <Text
            style={[
              styles.changeText,
              { color: theme.status[stockData.changeStatus] || theme.status.same }
            ]}
          >
            {stockData.change}% ({stockData.priceChange}원)
          </Text>
        </View>

        {/* 차트 섹션 */}
        <View style={styles.chartSection}>
          {renderPeriodButtons()}
          {renderChart()}
        </View>

        {/* 주요 지표 섹션 */}
        <View style={[styles.statsContainer, { backgroundColor: theme.background.secondary }]}>
          <Text style={[styles.sectionTitle, { color: theme.accent.primary }]}>주요 지표</Text>

          <View style={[styles.statRow, { borderBottomColor: theme.background.primary }]}>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
              전일 종가 ({stockData.previousDate})
            </Text>
            <Text style={[styles.statValue, { color: theme.text.primary }]}>{stockData.previousPrice}원</Text>
          </View>

          <View style={[styles.statRow, { borderBottomColor: theme.background.primary }]}>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
              현재가 ({stockData.currentDate})
            </Text>
            <Text style={[styles.statValue, { color: theme.text.primary }]}>{stockData.price}원</Text>
          </View>

          <View style={[styles.statRow, { borderBottomColor: theme.background.primary }]}>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>전일대비 변동</Text>
            <Text
              style={[
                styles.statValue,
                { color: theme.status[stockData.changeStatus] || theme.status.same }
              ]}
            >
              {stockData.change}% ({stockData.priceChange}원)
            </Text>
          </View>

          {/* 보유 정보 섹션 */}
          <View style={[styles.statRow, { borderBottomColor: theme.background.primary }]}>
            <Text style={[styles.statLabel, { color: theme.text.secondary }]}>보유 수량</Text>
            <Text style={[styles.statValue, { color: theme.text.primary }]}>
              {ownedQuantity.toLocaleString()}주
            </Text>
          </View>

          {ownedQuantity > 0 && (
            <View style={[styles.statRow, { borderBottomColor: theme.background.primary }]}>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>평균 단가</Text>
              <Text style={[styles.statValue, { color: theme.text.primary }]}>
                {averagePrice.toLocaleString()}원
              </Text>
            </View>
          )}
        </View>

        {/* 매수/매도 버튼 컨테이너 */}
        <View style={styles.tradeButtonContainer}>
          <TouchableOpacity 
            style={[styles.buyButton, { backgroundColor: theme.button.buy }]} 
            onPress={handleBuyPress}
          >
            <Text style={[styles.buyButtonText, { color: theme.background.primary }]}>매수</Text>
          </TouchableOpacity>

          {/* 매도 버튼 조건부 렌더링 */}
          {ownedQuantity > 0 ? (
            <TouchableOpacity
              style={[styles.sellButton, { backgroundColor: theme.button.sell }]}
              onPress={handleSellPress}
            >
              <Text style={[styles.sellButtonText, { color: theme.background.primary }]}>매도</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.disabledSellButton} disabled={true}>
              <Text style={styles.disabledSellButtonText}>매도</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* 차트 포인트 클릭 모달 */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: theme.background.secondary }]}>
                {selectedPoint && (
                  <>
                    <Text style={[styles.modalDate, { color: theme.text.primary }]}>{selectedPoint.date}</Text>
                    <Text style={[styles.modalPrice, { color: theme.text.primary }]}>
                      {selectedPoint.price}원
                    </Text>
                    <TouchableOpacity
                      style={[styles.modalCloseButton, { backgroundColor: theme.button.primary }]}
                      onPress={closeModal}
                    >
                      <Text style={[styles.modalCloseText, { color: theme.text.primary }]}>확인</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginTop: 40,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  favoriteButton: {
    padding: 8,
  },
  starIcon: {
    width: 24,
    height: 24,
    fontSize: 24,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  priceSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  symbolText: {
    fontSize: 14,
    marginBottom: 8,
  },
  priceText: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
  },
  changeText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  // 차트 관련 스타일
  chartSection: {
    marginBottom: 24,
  },
  periodButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    backgroundColor: "#004455",
    borderRadius: 20,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  selectedPeriodButton: {
    backgroundColor: "#F074BA",
  },
  periodButtonText: {
    color: "#9ca3af",
    fontSize: 14,
    fontWeight: "500",
  },
  selectedPeriodButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  chartContainer: {
    alignItems: "center",
    borderRadius: 16,
    padding: 8,
  },
  chart: {
    borderRadius: 16,
  },
  chartLoadingContainer: {
    height: 200,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  chartLoadingText: {
    marginTop: 10,
  },
  chartPlaceholder: {
    height: 200,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  chartText: {
  },
  statsContainer: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  // 매수/매도 버튼 스타일
  tradeButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 32,
  },
  buyButton: {
    flex: 1,
    padding: 16,
    borderRadius: 13,
    alignItems: "center",
    marginLeft: 10,
    marginRight: 4,
  },
  buyButtonText: {
    fontSize: 20,
    fontWeight: "900",
  },
  sellButton: {
    flex: 1,
    padding: 16,
    borderRadius: 13,
    alignItems: "center",
    marginRight: 10,
    marginLeft: 4,
  },
  sellButtonText: {
    fontSize: 20,
    fontWeight: "900",
  },
  disabledSellButton: {
    flex: 1,
    backgroundColor: "#8b8b8bff",
    padding: 16,
    borderRadius: 13,
    alignItems: "center",
    marginRight: 10,
    marginLeft: 4,
  },
  disabledSellButtonText: {
    color: "#cbcbcbff",
    fontSize: 20,
    fontWeight: "900",
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    minWidth: 200,
  },
  modalDate: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  modalPrice: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalCloseButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
});

export default StockDetail;