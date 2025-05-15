import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchUserBalance } from '../../utils/account';
import { fetchUserInfo } from '../../utils/user';
import { PieChart } from 'react-native-chart-kit'; // 추가된 부분
import { API_BASE_URL } from '../../utils/apiConfig'; // API 설정 import
import { getNewAccessToken } from '../../utils/token'; // 토큰 가져오기 import

import BellIcon from "../../assets/icons/bell.svg";
import SearchIcon from "../../assets/icons/search.svg";

const screenWidth = Dimensions.get('window').width; // 화면 너비

const mockStocks = [
  {
    id: 1,
    name: "뱅가드 토탈 미국 주식 ETF",
    price: "429,710",
    change: "+0.03",
    isFavorite: true,
  },
  {
    id: 2,
    name: "스포티파이 테크놀로지",
    price: "692,438",
    change: "+0.75",
    isFavorite: true,
  },
  {
    id: 3,
    name: "Kingdom of Banana",
    price: "4,000",
    change: "+9.13",
    isFavorite: false,
  },
];

const MainScreen = ({ navigation }) => {
  console.log('📌 MainScreen 렌더링');
  const [userInfo, setUserInfo] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [watchlist, setWatchlist] = useState(mockStocks);
  const [balance, setBalance] = useState('0원');
  
  // 자산 데이터 상태 추가
  const [assetData, setAssetData] = useState(null);
  const [assetLoading, setAssetLoading] = useState(true);
  const [assetError, setAssetError] = useState(null);

  useEffect(() => {
    const load = async () => {
      await fetchUserInfo(navigation, setUserInfo);
      await fetchUserBalance(navigation, setBalance);
      await fetchAssetData(); // 자산 데이터 불러오기
    };
    load();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("📥 MainScreen 다시 focus됨 → 잔고 재요청");
      fetchUserBalance(navigation, setBalance);
      fetchAssetData(); // 화면에 돌아올 때마다 자산 데이터 갱신
    });
  
    return unsubscribe;
  }, [navigation]);

  // 자산 데이터를 가져오는 함수
  const fetchAssetData = async () => {
    try {
      setAssetLoading(true);
      
      // 액세스 토큰 가져오기
      const accessToken = await getNewAccessToken(navigation);
      
      if (!accessToken) {
        setAssetError('인증이 필요합니다');
        setAssetLoading(false);
        return;
      }
      
      // 자산 요약 API 호출
      const response = await fetch(
        `${API_BASE_URL}/api/asset/summary/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setAssetData(data);
        setAssetError(null);
      } else {
        setAssetError('데이터를 불러오는 데 실패했습니다');
      }
    } catch (err) {
      console.error('자산 데이터 로딩 오류:', err);
      setAssetError('데이터를 불러오는 데 실패했습니다');
    } finally {
      setAssetLoading(false);
    }
  };

  const toggleFavorite = (id) => {
    setWatchlist(
      watchlist.map((stock) =>
        stock.id === id ? { ...stock, isFavorite: !stock.isFavorite } : stock
      )
    );
  };

  // 검색창 클릭 시 SearchScreen으로 이동
  const handleSearchPress = () => {
    navigation.navigate("SearchScreen");
  };

  // 상세 자산 페이지로 이동
  const navigateToAssetDetail = () => {
    navigation.navigate("AssetDetail");
  };

  // 금액 포맷팅 함수
  const formatCurrency = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 차트 데이터 준비
  const prepareChartData = () => {
    if (!assetData || !assetData.breakdown) {
      return [];
    }

    const chartColors = [
      '#6366F1', // 인디고
      '#3B82F6', // 파랑
      '#34D399', // 에메랄드
      '#10B981', // 녹색
      '#F59E0B', // 황색
      '#EF4444', // 빨강
    ];

    return assetData.breakdown.map((item, index) => ({
      name: item.label,
      value: item.value,
      color: chartColors[index % chartColors.length],
      legendFontColor: "#EFF1F5",
      legendFontSize: 10
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        {/* 검색창 클릭 시 SearchScreen으로 이동 */}
        <TouchableOpacity 
          style={styles.searchInputContainer} 
          onPress={handleSearchPress}
          activeOpacity={0.7}
        >
          <SearchIcon style={styles.searchIconInInput} width={18} height={18} />
          <Text style={styles.searchPlaceholder}>주식명 검색</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <BellIcon style={styles.BellIcon} width={24} height={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.assetContainer}>
        <Text style={styles.assetLabel}>자산</Text>
        <Text style={styles.assetValue}>{balance}</Text>
        
        {/* 그래프 부분 교체 */}
        
        <View style={styles.graphContainer}>
          {assetLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#F074BA" />
              <Text style={styles.loadingText}>자산 정보 로딩 중...</Text>
            </View>
          ) : assetError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{assetError}</Text>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={fetchAssetData}
              >
                <Text style={styles.retryButtonText}>다시 시도</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.chartWrapper}>
              <PieChart
                data={prepareChartData()}
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
                center={[screenWidth * 0.13, 0]} // 이 부분 잘 조절해서 중심 맞춰야댐 근데 Android는 다를 수도
                avoidFalseZero
                style={styles.chart}
                innerRadius="70%"
              />
              
              <View style={styles.centerInfo}>
                <Text style={styles.centerInfoTitle}>총 자산</Text>
                {assetData && (
                  <Text style={styles.centerInfoAmount}>
                    {formatCurrency(assetData.total_asset)}원
                  </Text>
                )}
              </View>
              
              <TouchableOpacity 
                style={styles.detailButton}
                onPress={navigateToAssetDetail}
              >
                <Text style={styles.detailButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.tradeButton}
        onPress={() => navigation.navigate("StockTrade")}
      >
        <Text style={styles.tradeButtonText}>주식 거래하기 📈</Text>
      </TouchableOpacity>

      <View style={styles.watchlistContainer}>
        <Text style={styles.watchlistTitle}>나의 관심 주식</Text>
        <ScrollView>
          {watchlist.map((stock) => (
            <View key={stock.id} style={styles.stockItem}>
              <TouchableOpacity onPress={() => toggleFavorite(stock.id)}>
                <Image
                  source={
                    stock.isFavorite
                      ? require("../../assets/icons/star-filled.png")
                      : require("../../assets/icons/star-empty.png")
                  }
                  style={styles.starIcon}
                />
              </TouchableOpacity>
              <Text style={styles.stockName}>{stock.name}</Text>
              <View style={styles.stockPriceContainer}>
                <Text style={styles.stockPrice}>{stock.price}원</Text>
                <Text style={styles.stockChange}>{stock.change}%</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003340",
    padding: 30,
    paddingBottom: 90,
  },
  searchContainer: {
    marginTop: 40,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "space-between",
  },
  searchInputContainer: {
    flex: 1,
    backgroundColor: "#EFF1F5",
    borderRadius: 13,
    padding: 10,
    marginRight: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  searchIconInInput: {
    width: 18,
    height: 18,
    fill: "#6B7280",
    marginRight: 8,
  },
  searchPlaceholder: {
    color: "#6B7280",
    fontSize: 14,
  },
  SearchIcon: {
    width: 24,
    height: 24,
    fill: "#EFF1F5",
    right: 10,
    marginLeft: 10,
  },
  BellIcon: {
    width: 24,
    height: 24,
    fill: "#EFF1F5",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#EFF1F5",
    borderRadius: 13,
    padding: 10,
    marginRight: 10,
  },
  assetContainer: {
    marginBottom: 20,
  },
  assetLabel: {
    color: "#F074BA",
    fontSize: 18,
  },
  assetValue: {
    color: "#F074BA",
    fontSize: 40,
    fontWeight: "bold",
  },
  // MainScreen.js의 스타일 부분 수정
  graphContainer: {
    height: screenWidth - 60,
    //backgroundColor: "#004455",
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  chartWrapper: {
    position: 'relative',
    width: screenWidth - 60,
    height: screenWidth - 60,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8.65,
    elevation: 8, // Android에서의 그림자 효과
  },
  chart: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  centerInfo: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  centerInfoTitle: {
    color: '#003340',
    fontSize: 18,
    fontWeight: '800',
  },
  centerInfoAmount: {
    color: '#003340',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 4,
  },
  detailButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#6366F1',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#EFF1F5',
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#EFF1F5',
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    color: '#FF6B6B',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#F074BA',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#EFF1F5',
    fontWeight: 'bold',
  },
  percentageContainer: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  tradeButton: {
    backgroundColor: "#EFF1F5",
    padding: 13,
    borderRadius: 13,
    alignItems: "center",
    marginBottom: 20,
  },
  tradeButtonText: {
    color: "#003340",
    fontSize: 18,
    fontWeight: "900",
  },
  watchlistContainer: {
    flex: 1,
  },
  watchlistTitle: {
    color: "#F074BA",
    fontSize: 18,
    marginBottom: 5,
    marginLeft: 5,
    marginTop: 5,
    fontWeight: "600",
  },
  stockItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#004455",
  },
  stockName: {
    flex: 1,
    color: "#EFF1F5",
    marginLeft: 10,
  },
  stockPriceContainer: {
    alignItems: "flex-end",
  },
  stockPrice: {
    color: "#EFF1F5",
  },
  stockChange: {
    color: "#F074BA",
    fontWeight: "bold",
  },
  starIcon: {
    width: 20,
    height: 20,
  },
  percentageText: {
    color: "#EFF1F5",
  },
  percentageBar: {
    marginBottom: 5,
  },
  shadow: {
    shadowColor: "rgb(255, 210, 229)",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default MainScreen;