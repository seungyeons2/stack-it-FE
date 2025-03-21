import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import BellIcon from "../../assets/icons/bell.svg";
import SearchIcon from "../../assets/icons/search.svg";

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
  const [searchText, setSearchText] = useState("");
  const [watchlist, setWatchlist] = useState(mockStocks);
  const [balance, setBalance] = useState("0원");

  useEffect(() => {
    const fetchUserBalance = async () => {
      try {
        // Get the access token from AsyncStorage
        const accessToken = await AsyncStorage.getItem("accessToken");

        if (!accessToken) {
          console.error("액세스 토큰이 없습니다.");
          navigation.navigate("Login");
          return;
        }

        console.log("사용 중인 액세스 토큰:", accessToken);

        const response = await fetch(
          "https://port-0-doodook-backend-lyycvlpm0d9022e4.sel4.cloudtype.app/users/account/",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        // 응답 상태 로깅
        console.log("응답 상태:", response.status);

        // 액세스 토큰이 만료된 경우 (401 Unauthorized)
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
              return fetchUserBalance();
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

        // 응답 본문 로깅
        const text = await response.text();
        console.log("응답 본문:", text);

        try {
          // 텍스트를 JSON으로 파싱
          const data = JSON.parse(text);

          // 데이터 구조 로깅
          console.log("전체 데이터:", data);

          // 응답 구조 로깅 (모든 키 확인)
          console.log("응답의 최상위 키들:", Object.keys(data));

          // 정확한 응답 구조에 맞게 잔고 추출
          let userBalance = null;

          // status/data/balance 구조 (확인된 응답 구조)
          if (data?.status === "success" && data?.data?.balance !== undefined) {
            userBalance = data.data.balance;
            console.log("응답에서 잔고 찾음:", userBalance);
          }
          // 기타 가능한 경로 예외 처리
          else if (data?.balance !== undefined) {
            userBalance = data.balance;
            console.log("대체 경로에서 잔고 찾음:", userBalance);
          } else {
            console.log("알 수 없는 응답 구조, 전체 응답:", data);
            userBalance = 0;
          }

          // 숫자로 변환 및 형식 지정
          const formattedBalance =
            Number(userBalance || 0).toLocaleString() + "원";
          console.log("최종 형식화된 잔고:", formattedBalance);
          setBalance(formattedBalance);
        } catch (parseError) {
          console.error("JSON 파싱 오류:", parseError);
          setBalance("0원");
        }
      } catch (error) {
        console.error("잔고 불러오기 실패:", error);
        setBalance("0원");
      }
    };

    fetchUserBalance();
  }, []);

  const toggleFavorite = (id) => {
    setWatchlist(
      watchlist.map((stock) =>
        stock.id === id ? { ...stock, isFavorite: !stock.isFavorite } : stock
      )
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="주식명 검색"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity>
          <SearchIcon style={styles.SearchIcon} width={24} height={24} />
        </TouchableOpacity>
        <TouchableOpacity>
          <BellIcon style={styles.BellIcon} width={24} height={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.assetContainer}>
        <Text style={styles.assetLabel}>자산</Text>
        <Text style={styles.assetValue}>{balance}</Text>
        <View style={styles.graphContainer}>
          <View style={styles.mockGraph} />
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
  graphContainer: {
    height: 200,
    backgroundColor: "#004455",
    borderRadius: 8,
    marginTop: 10,
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
