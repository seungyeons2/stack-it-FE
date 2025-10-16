import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchUserBalance } from "../../utils/account";
import { fetchUserInfo } from "../../utils/user";
import { fetchWatchlist, removeFromWatchlist, addToWatchlist } from "../../utils/watchList";

import { PieChart } from "react-native-chart-kit";
import { API_BASE_URL } from "../../utils/apiConfig";
import { getNewAccessToken } from "../../utils/token";
import { fetchWithHantuToken } from "../../utils/hantuToken";
import {
  initializeHantuToken,
  scheduleTokenRefresh,
} from "../../utils/hantuToken";

// 🎉 Lucide 아이콘 import
import { Bell, Search, Star } from "lucide-react-native";

// 🎨 테마 훅 import
import { useTheme } from "../../utils/ThemeContext";

const screenWidth = Dimensions.get("window").width;

const MainScreen = ({ navigation }) => {
  // 🎨 테마 가져오기
  const { theme } = useTheme();
  
  const [userInfo, setUserInfo] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [watchlist, setWatchlist] = useState([]);
  const [balance, setBalance] = useState("0원");
  const [refreshing, setRefreshing] = useState(false);

  const [assetData, setAssetData] = useState(null);
  const [assetLoading, setAssetLoading] = useState(true);
  const [assetError, setAssetError] = useState(null);

  const [watchlistLoading, setWatchlistLoading] = useState(true);

  useEffect(() => {
    let refreshInterval;
    const load = async () => {
      await initializeHantuToken();
      refreshInterval = scheduleTokenRefresh();
      
      await fetchUserInfo(navigation, setUserInfo);
      await fetchUserBalance(navigation, setBalance);
      await fetchAssetData();
      await loadWatchlistData();
    };
    load();
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("🔥 MainScreen 다시 focus됨 → 데이터 재요청");
      fetchUserBalance(navigation, setBalance);
      fetchAssetData();
      loadWatchlistData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadWatchlistData = async () => {
    try {
      setWatchlistLoading(true);
      console.log("⭐ 관심주식 데이터 로딩 시작");

      const result = await fetchWatchlist(navigation);
      
      if (result.success && result.watchlist) {
        const enrichedWatchlist = await Promise.all(
          result.watchlist.map(async (stock, index) => {
            try {
              if (index > 0) {
                await new Promise(resolve => setTimeout(resolve, 300));
              }

              const priceResult = await fetchWithHantuToken(
                `${API_BASE_URL}trading/stock_price/?stock_code=${stock.symbol}`
              );

              let currentPrice = 0;
              if (priceResult.success && priceResult.data?.current_price) {
                currentPrice = priceResult.data.current_price;
              }

              const changeResponse = await fetch(
                `${API_BASE_URL}stocks/price_change/?stock_code=${stock.symbol}`
              );

              let changeData = { price_change_percentage: 0, change_status: 'same' };
              if (changeResponse.ok) {
                const changeResult = await changeResponse.json();
                if (changeResult.status === 'success') {
                  changeData = changeResult;
                }
              }

              return {
                id: stock.id || `watchlist-${stock.symbol}`,
                name: stock.name,
                symbol: stock.symbol,
                price: currentPrice && !isNaN(currentPrice) ? currentPrice.toLocaleString() : "0",
                change: changeData.price_change_percentage >= 0 
                  ? `+${changeData.price_change_percentage.toFixed(2)}`
                  : `${changeData.price_change_percentage.toFixed(2)}`,
                changeStatus: changeData.change_status,
                isFavorite: true,
              };
            } catch (error) {
              console.error(`❌ ${stock.symbol} 가격 정보 조회 실패:`, error);
              return {
                id: stock.id || `watchlist-${stock.symbol}`,
                name: stock.name,
                symbol: stock.symbol,
                price: "0",
                change: "0.00",
                changeStatus: 'same',
                isFavorite: true,
              };
            }
          })
        );

        console.log("✅ 관심주식 데이터 로딩 완료:", enrichedWatchlist);
        setWatchlist(enrichedWatchlist);
      } else {
        console.log("📋 관심주식이 없음");
        setWatchlist([]);
      }
    } catch (error) {
      console.error("❌ 관심주식 데이터 로딩 실패:", error);
      setWatchlist([]);
    } finally {
      setWatchlistLoading(false);
    }
  };

  const fetchAssetData = async () => {
    try {
      setAssetLoading(true);

      const accessToken = await getNewAccessToken(navigation);

      if (!accessToken) {
        setAssetError("인증이 필요합니다");
        setAssetLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}api/asset/summary/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.status === "success") {
        const filteredData = {
          ...data,
          breakdown: data.breakdown
            ? data.breakdown.filter((item) => {
                if (item.label === "예수금") {
                  return true;
                }
                return item.value > 0;
              })
            : [],
        };

        console.log(
          "✅ MainScreen 필터링 전 breakdown:",
          data.breakdown?.length || 0,
          "개"
        );
        console.log(
          "✅ MainScreen 필터링 후 breakdown:",
          filteredData.breakdown?.length || 0,
          "개"
        );

        setAssetData(filteredData);
        setAssetError(null);
      } else {
        setAssetError("데이터를 불러오는 데 실패했습니다");
      }
    } catch (err) {
      console.error("자산 데이터 로딩 오류:", err);
      setAssetError("데이터를 불러오는 데 실패했습니다");
    } finally {
      setAssetLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchUserBalance(navigation, setBalance),
      fetchAssetData(),
      loadWatchlistData(),
    ]);
    setRefreshing(false);
  };

  const toggleFavorite = async (stockSymbol) => {
    try {
      console.log("⭐ 관심주식 토글:", stockSymbol);
      
      const currentStock = watchlist.find(stock => stock.symbol === stockSymbol);
      
      if (currentStock?.isFavorite) {
        setWatchlist(prev => 
          prev.map(stock => 
            stock.symbol === stockSymbol 
              ? { ...stock, isFavorite: false }
              : stock
          )
        );
        
        console.log("🗑️ 관심주식 해제 요청:", stockSymbol);
        const result = await removeFromWatchlist(navigation, stockSymbol);
        
        if (result.success) {
          console.log("✅ 관심주식 해제 완료 (새로고침 시 사라짐)");
        } else {
          console.error("❌ 관심주식 해제 실패:", result.message);
          setWatchlist(prev => 
            prev.map(stock => 
              stock.symbol === stockSymbol 
                ? { ...stock, isFavorite: true }
                : stock
            )
          );
        }
      } else {
        setWatchlist(prev => 
          prev.map(stock => 
            stock.symbol === stockSymbol 
              ? { ...stock, isFavorite: true }
              : stock
          )
        );
        
        console.log("⭐ 관심주식 추가 요청:", stockSymbol);
        const result = await addToWatchlist(navigation, stockSymbol);
        
        if (!result.success) {
          console.error("❌ 관심주식 추가 실패:", result.message);
          setWatchlist(prev => 
            prev.map(stock => 
              stock.symbol === stockSymbol 
                ? { ...stock, isFavorite: false }
                : stock
            )
          );
        }
      }
    } catch (error) {
      console.error("❌ 관심주식 토글 오류:", error);
    }
  };

  const handleSearchPress = () => {
    navigation.navigate("SearchScreen");
  };

  const navigateToAssetDetail = () => {
    navigation.navigate("AssetDetail");
  };

  const handleStockPress = (stock) => {
    navigation.navigate("StockDetail", {
      symbol: stock.symbol,
      name: stock.name,
    });
  };

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return "0";
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // 🎨 차트 데이터에 테마 색상 적용
  const prepareChartData = () => {
    if (
      !assetData ||
      !assetData.breakdown ||
      assetData.breakdown.length === 0
    ) {
      console.log("⚠️ MainScreen: 차트 데이터가 없음");
      return [];
    }

    const chartData = assetData.breakdown.map((item, index) => ({
      name: item.label,
      value: item.value,
      color: theme.chart.colors[index % theme.chart.colors.length],
      legendFontColor: theme.text.primary,
      legendFontSize: 10,
    }));

    console.log("📊 MainScreen 차트 데이터 생성:", chartData.length, "개 항목");
    return chartData;
  };

  const renderChart = () => {
    const chartData = prepareChartData();

    if (chartData.length === 0) {
      return (
        <View style={[styles.emptyChart, { backgroundColor: theme.background.secondary }]}>
          <Text style={[styles.emptyChartText, { color: theme.text.primary }]}>
            보유 자산이 없습니다
          </Text>
          <Text style={[styles.emptyChartSubText, { color: theme.text.secondary }]}>
            주식 거래를 시작해보세요!
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.chartWrapper}>
        <PieChart
          data={chartData}
          width={screenWidth}
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
          center={[screenWidth * 0.13, 0]}
          avoidFalseZero
          style={styles.chart}
          innerRadius="70%"
        />

        <View style={styles.centerInfo}>
          <Text style={[styles.centerInfoTitle, { color: theme.background.primary }]}>
            총 자산
          </Text>
          {assetData && assetData.total_asset ? (
            <Text style={[styles.centerInfoAmount, { color: theme.background.primary }]}>
              {formatCurrency(assetData.total_asset)}원
            </Text>
          ) : (
            <Text style={[styles.centerInfoAmount, { color: theme.background.primary }]}>
              0원
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.detailButton, { backgroundColor: theme.button.info }]}
          onPress={navigateToAssetDetail}
        >
          <Text style={[styles.detailButtonText, { color: theme.background.primary }]}>+</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const getChangeColor = (changeStatus) => {
    return theme.status[changeStatus] || theme.status.same;
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor={theme.accent.primary}
        />
      }
    >
      {/* 🔍 검색 & 알림 영역 */}
      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={[styles.searchInputContainer, { backgroundColor: theme.background.secondary }]}
          onPress={handleSearchPress}
          activeOpacity={0.7}
        >
          <Search 
            size={18} 
            color="#6B7280"
            strokeWidth={2}
            style={styles.searchIconInInput}
          />
          <Text style={[styles.searchPlaceholder, { color: theme.text.tertiary }]}>
            주식명 검색
          </Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Bell 
            size={24} 
            color={theme.text.primary}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      {/* 💰 자산 정보 */}
      <View style={styles.assetContainer}>
        <Text style={[styles.assetLabel, { color: theme.accent.primary }]}>예수금</Text>
        <Text style={[styles.assetValue, { color: theme.accent.primary }]}>{balance}</Text>

        <View style={styles.graphContainer}>
          {assetLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.accent.primary} />
              <Text style={[styles.loadingText, { color: theme.text.primary }]}>
                자산 정보 로딩 중...
              </Text>
            </View>
          ) : assetError ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: theme.status.error }]}>
                {assetError}
              </Text>
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: theme.button.primary }]}
                onPress={fetchAssetData}
              >
                <Text style={[styles.retryButtonText, { color: theme.text.primary }]}>
                  다시 시도
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            renderChart()
          )}
        </View>
      </View>

      {/* 📈 거래 버튼 */}
      <TouchableOpacity
        style={[styles.tradeButton, { backgroundColor: theme.button.secondary }]}
        onPress={() => navigation.navigate("StockTrade")}
      >
        <Text style={[styles.tradeButtonText, { color: theme.background.primary }]}>
          주식 거래하기 📈
        </Text>
      </TouchableOpacity>

      {/* ⭐ 관심주식 목록 */}
      <View style={styles.watchlistContainer}>
        <Text style={[styles.watchlistTitle, { color: theme.accent.primary }]}>
          나의 관심 주식
        </Text>
        
        {watchlistLoading ? (
          <View style={styles.watchlistLoadingContainer}>
            <ActivityIndicator size="large" color={theme.accent.primary} />
            <Text style={[styles.watchlistLoadingText, { color: theme.text.primary }]}>
              관심주식 로딩 중...
            </Text>
          </View>
        ) : watchlist.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {watchlist.map((stock) => (
              <TouchableOpacity
                key={stock.id}
                style={[styles.stockItem, { borderBottomColor: theme.background.secondary }]}
                onPress={() => handleStockPress(stock)}
                activeOpacity={0.7}
              >
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleFavorite(stock.symbol);
                  }}
                  style={styles.starTouchArea}
                >
                  {/* ⭐ Lucide Star 아이콘 사용! */}
                  <Star
                    size={20}
                    color={theme.accent.primary}
                    fill={stock.isFavorite ? theme.accent.primary : "transparent"}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
                <Text style={[styles.stockName, { color: theme.text.primary }]}>
                  {stock.name}
                </Text>
                <View style={styles.stockPriceContainer}>
                  <Text style={[styles.stockPrice, { color: theme.text.primary }]}>
                    {stock.price}원
                  </Text>
                  <Text 
                    style={[
                      styles.stockChange,
                      { color: getChangeColor(stock.changeStatus) }
                    ]}
                  >
                    {stock.change}%
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyWatchlist}>
            <Text style={[styles.emptyWatchlistText, { color: theme.text.primary }]}>
              관심주식이 없습니다
            </Text>
            <Text style={[styles.emptyWatchlistSubText, { color: theme.text.secondary }]}>
              검색창에서 주식을 찾아 관심주식으로 등록해보세요!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 10,
    paddingBottom: 120,
  },
  searchContainer: {
    marginTop: 60,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "space-between",
  },
  searchInputContainer: {
    flex: 1,
    borderRadius: 13,
    padding: 10,
    marginRight: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  searchIconInInput: {
    marginRight: 8,
  },
  searchPlaceholder: {
    fontSize: 14,
  },
  assetContainer: {
    marginBottom: 20,
  },
  assetLabel: {
    fontSize: 18,
  },
  assetValue: {
    fontSize: 40,
    fontWeight: "bold",
  },
  graphContainer: {
    height: screenWidth - 60,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  chartWrapper: {
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
    position: "absolute",
    top: 0,
    left: 0,
  },
  centerInfo: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  centerInfoTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  centerInfoAmount: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 4,
  },
  detailButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 20,
  },
  detailButtonText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  errorText: {
    marginBottom: 12,
    textAlign: "center",
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    fontWeight: "bold",
  },
  tradeButton: {
    padding: 13,
    borderRadius: 13,
    alignItems: "center",
    marginBottom: 20,
  },
  tradeButtonText: {
    fontSize: 18,
    fontWeight: "900",
  },
  watchlistContainer: {
    flex: 1,
    minHeight: 200,
  },
  watchlistTitle: {
    fontSize: 18,
    marginBottom: 10,
    marginLeft: 5,
    marginTop: 5,
    fontWeight: "600",
  },
  watchlistLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  watchlistLoadingText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  starTouchArea: {
    padding: 8,
    marginRight: 2,
  },
  stockItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    borderBottomWidth: 1,
  },
  stockName: {
    flex: 1,
    marginLeft: 10,
  },
  stockPriceContainer: {
    alignItems: "flex-end",
  },
  stockPrice: {
  },
  stockChange: {
    fontWeight: "bold",
  },
  emptyChart: {
    height: screenWidth - 60,
    width: screenWidth - 60,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  emptyChartText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyChartSubText: {
    fontSize: 14,
  },
  emptyWatchlist: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyWatchlistText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyWatchlistSubText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default MainScreen;