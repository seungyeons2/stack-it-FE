import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SearchIcon from "../../assets/icons/search.svg";

const StockTradeScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState("");
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStockData();
  }, []);

  // 인증 및 주식 데이터 가져오기
  const fetchStockData = async () => {
    try {
      // 액세스 토큰 가져오기
      const accessToken = await AsyncStorage.getItem("accessToken");

      if (!accessToken) {
        console.error("액세스 토큰이 없습니다.");
        navigation.navigate("Login");
        return;
      }

      console.log("사용 중인 액세스 토큰:", accessToken);

      // API에서 주식 데이터 가져오기 시도
      // 실제 엔드포인트는 서버에 맞게 수정 필요
      const response = await fetch(
        "https://port-0-doodook-backend-lyycvlpm0d9022e4.sel4.cloudtype.app/stocks/",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("응답 상태:", response.status);

      // 401 에러 처리 (토큰 만료)
      if (response.status === 401) {
        const refreshToken = await AsyncStorage.getItem("refreshToken");

        if (refreshToken) {
          // 리프레시 토큰으로 새 액세스 토큰 요청
          const refreshResponse = await fetch(
            "https://port-0-doodook-backend-lyycvlpm0d9022e4.sel4.cloudtype.app/api/token/refresh/",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                refresh: refreshToken,
              }),
            }
          );

          const refreshData = await refreshResponse.json();

          if (refreshResponse.ok && refreshData.access) {
            // 새 액세스 토큰 저장
            await AsyncStorage.setItem("accessToken", refreshData.access);

            // 새 토큰으로 다시 요청
            return fetchStockData();
          } else {
            // 리프레시 토큰도 만료된 경우 로그인 화면으로
            console.error("리프레시 토큰이 만료되었습니다.");
            navigation.navigate("Login");
            return;
          }
        } else {
          // 리프레시 토큰이 없는 경우 로그인 화면으로
          console.error("리프레시 토큰이 없습니다.");
          navigation.navigate("Login");
          return;
        }
      }

      // 응답 처리
      // 현재는 API 응답이 없을 수 있으므로 기본 데이터 사용
      // 실제 API 응답이 있다면 아래를 수정하세요
      setStockData([
        {
          id: 1,
          name: "뱅가드 토탈 미국 주식 ETF",
          price: "429,710",
          change: "+0.03",
          volume: "50,000",
        },
        {
          id: 2,
          name: "스포티파이 테크놀로지",
          price: "692,438",
          change: "+0.75",
          volume: "30,000",
        },
        {
          id: 3,
          name: "관심 좀 그만 가지세요",
          price: "913,913",
          change: "+9.13",
          volume: "70,000",
        },
      ]);
    } catch (error) {
      console.error("주식 정보 불러오기 실패:", error);
      Alert.alert("오류", "주식 정보를 불러오는데 실패했습니다.");

      // 오류 시에도 기본 데이터 설정
      setStockData([
        {
          id: 1,
          name: "뱅가드 토탈 미국 주식 ETF",
          price: "429,710",
          change: "+0.03",
          volume: "50,000",
        },
        {
          id: 2,
          name: "스포티파이 테크놀로지",
          price: "692,438",
          change: "+0.75",
          volume: "30,000",
        },
        {
          id: 3,
          name: "관심 좀 그만 가지세요",
          price: "913,913",
          change: "+9.13",
          volume: "70,000",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 검색 필터 적용
  const filteredStocks = stockData.filter((stock) =>
    stock.name.includes(searchText)
  );

  // 매수 화면으로 이동하는 함수
  const navigateToBuy = (stock) => {
    // 현재 보유량 정보 추가 (실제 앱에서는 API나 저장소에서 가져올 수 있음)
    const stockWithHolding = {
      ...stock,
      currentHolding: "7주", // 예시 데이터
    };

    navigation.navigate("TradingBuyScreen", { stock: stockWithHolding });
  };

  // 매도 화면으로 이동하는 함수
  const navigateToSell = (stock) => {
    // 현재 보유량 정보 추가 (실제 앱에서는 API나 저장소에서 가져올 수 있음)
    const stockWithHolding = {
      ...stock,
      currentHolding: "7주", // 예시 데이터
    };

    navigation.navigate("TradingSellScreen", { stock: stockWithHolding });
  };

  return (
    <View style={styles.container}>
      {/* 상단 네비게이션 바 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>주식 거래하기</Text>
      </View>

      <ScrollView>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F074BA" />
            <Text style={styles.loadingText}>주식 정보를 불러오는 중...</Text>
          </View>
        ) : (
          <>
            {/* 현재 보유 주식 섹션 */}
            <Text style={styles.sectionTitle}>현재 보유 주식</Text>
            <View style={styles.divider} />

            {filteredStocks.map((stock) => (
              <View key={stock.id}>
                <View style={styles.stockItem}>
                  {/* 주식 정보 */}
                  <View style={styles.stockInfo}>
                    <Text style={styles.stockName}>{stock.name}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.stockPrice}>{stock.price}원</Text>
                      <Text style={styles.stockChange}>
                        ▲{stock.change.replace("+", "")}%
                      </Text>
                    </View>
                    <Text style={styles.stockVolume}>
                      거래량: {stock.volume}
                    </Text>
                  </View>

                  {/* 매수/매도 버튼 */}
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.buyButton}
                      onPress={() => navigateToBuy(stock)}
                    >
                      <Text style={styles.buyText}>매수</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.sellButton}
                      onPress={() => navigateToSell(stock)}
                    >
                      <Text style={styles.sellText}>매도</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.divider} />
              </View>
            ))}
          </>
        )}

        {/* 검색창 (현재 보유 주식 아래로 이동) */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="주식명 검색"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => console.log("검색 버튼 클릭", searchText)}
          >
            <SearchIcon width={24} height={24} fill="#003340" />
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
    padding: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  loadingText: {
    color: "#EFF1F5",
    marginTop: 10,
    fontSize: 16,
  },

  backText: {
    fontSize: 28,
    color: "#F074BA",
  },

  backButton: {
    position: "absolute",
    top: 0,
    left: 20,
    zIndex: 10,
  },

  header: {
    flexDirection: "row",
    alignItems: "center", // 수직 정렬
    justifyContent: "center", // 가로 중앙 정렬
    marginTop: 20, // 상단 간격 추가
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#F074BA",
    textAlign: "center", // 텍스트 중앙 정렬
    top: 10,
  },

  sectionTitle: {
    fontSize: 18,
    color: "#FFD1EB",
    fontWeight: "bold",
    marginBottom: 0,
  },
  divider: {
    height: 1,
    backgroundColor: "#4A5A60",
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
    color: "#EFF1F5",
    fontWeight: "bold",
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stockPrice: {
    fontSize: 18,
    color: "#EFF1F5",
    fontWeight: "bold",
    marginRight: 10,
  },
  stockChange: {
    fontSize: 16,
    color: "#F074BA",
    fontWeight: "bold",
  },
  stockVolume: {
    fontSize: 14,
    color: "#EFF1F5",
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  buyButton: {
    backgroundColor: "#6EE69E",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  buyText: {
    color: "#003340",
    fontWeight: "bold",
    fontSize: 16,
  },
  sellButton: {
    backgroundColor: "#F074BA",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  sellText: {
    color: "#003340",
    fontWeight: "bold",
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF1F5",
    borderRadius: 15,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 15,
    marginTop: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    backgroundColor: "#EFF1F5",
    borderRadius: 13,
    padding: 10,
    marginRight: 10,
  },
  searchButton: {
    padding: 5,
  },
});

export default StockTradeScreen;
