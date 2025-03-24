import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";

import { getNewAccessToken } from '../utils/token';
import { fetchUserBalance } from '../utils/account';

const TradingBuyScreen = ({ route, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [authenticated, setAuthenticated] = useState(false);

  // 기본 주식 정보 (route.params로부터 받거나 기본값 사용)
  const stockInfo = route.params?.stock || {
    name: "스포티파이 테크놀로지",
    price: "692,438",
    change: "+0.75",
    currentHolding: "7주",
  };

  useEffect(() => {
    verifyAuthentication();
    fetchUserBalance();
  }, []);

  // 사용자 인증 확인
  const verifyAuthentication = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");

      if (!accessToken) {
        console.error("액세스 토큰이 없습니다.");
        navigation.navigate("Login");
        return;
      }

      setAuthenticated(true);
    } catch (error) {
      console.error("인증 확인 실패:", error);
      navigation.navigate("Login");
    }
  };

  // 사용자 잔고 조회
  // const fetchUserBalance = async () => {
  //   try {
  //     const accessToken = await AsyncStorage.getItem("accessToken");

  //     if (!accessToken) {
  //       console.error("액세스 토큰이 없습니다.");
  //       navigation.navigate("Login");
  //       return;
  //     }

  //     console.log("사용 중인 액세스 토큰:", accessToken);

  //     const response = await fetch(
  //       "https://port-0-doodook-backend-lyycvlpm0d9022e4.sel4.cloudtype.app/users/account/",
  //       {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     console.log("응답 상태:", response.status);

  //   if (response.status === 401) {
  //     console.warn("🔑 Access Token 만료됨. 재발급 시도 중...");
    
  //     const newToken = await getNewAccessToken(); // ← 너가 만든 함수
    
  //     if (newToken) {
  //       console.log("🔁 새 토큰으로 잔고 재요청");
  //       return fetchUserBalance(); // 재시도
  //     } else {
  //       console.error("❌ 토큰 재발급 실패. 로그인 화면으로 이동");
  //       navigation.navigate("Login");
  //       return;
  //     }
  //   }
    




  //     const text = await response.text();
  //     console.log("응답 본문:", text);

  //     try {
  //       const data = JSON.parse(text);
  //       console.log("전체 데이터:", data);

  //       let balance = 0;

  //       if (data?.status === "success" && data?.data?.balance !== undefined) {
  //         balance = data.data.balance;
  //       } else if (data?.balance !== undefined) {
  //         balance = data.balance;
  //       }

  //       setUserBalance(Number(balance));
  //     } catch (parseError) {
  //       console.error("JSON 파싱 오류:", parseError);
  //     }
  //   } catch (error) {
  //     console.error("잔고 불러오기 실패:", error);
  //   }
  // };

  const [quantity, setQuantity] = useState("1");

  // 수량에 따른 총액 계산 (콤마 제거 후 계산)
  const calculateTotal = () => {
    const priceWithoutComma = stockInfo.price.replace(/,/g, "");
    const total = parseInt(priceWithoutComma) * parseInt(quantity || 0);
    return total.toLocaleString();
  };

  // 음수 표시를 위한 색상
  const totalColor = "#4CD964"; // 초록색 (음수)
  const totalAmount = `-${calculateTotal()}원`;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>{"<"}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>매수</Text>
        </View>

        {/* 주식 정보 */}
        <View style={styles.stockInfoContainer}>
          <Text style={styles.stockName}>{stockInfo.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.stockPrice}>{stockInfo.price}원</Text>
            <Text style={styles.stockChange}>
              ▲{stockInfo.change.replace("+", "")}%
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* 현재 보유량 */}
        <View style={styles.holdingContainer}>
          <Text style={styles.holdingLabel}>현재 보유량</Text>
          <Text style={styles.holdingValue}>{stockInfo.currentHolding}</Text>
        </View>

        {/* 매수할 수량 */}
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>얼마나 매수할까요?</Text>
          <View style={styles.quantityInputContainer}>
            <TextInput
              style={styles.quantityInput}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={styles.quantityUnit}>주</Text>
          </View>
        </View>

        {/* 총액 */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>총</Text>
          <Text style={[styles.totalAmount, { color: totalColor }]}>
            {totalAmount}
          </Text>
        </View>

        {/* 매수하기 버튼 */}
        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => {
            // 매수 처리 로직 구현
            alert(`${quantity}주 매수가 완료되었습니다.`);
            navigation.goBack();
          }}
        >
          <Text style={styles.buyButtonText}>매수하기</Text>
        </TouchableOpacity>

        {/* 홈 인디케이터 */}
        <View style={styles.homeIndicator} />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003340",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 30,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    padding: 10,
  },
  backText: {
    fontSize: 28,
    color: "#F074BA",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#F074BA",
  },
  stockInfoContainer: {
    marginBottom: 20,
  },
  stockName: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 5,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stockPrice: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginRight: 10,
  },
  stockChange: {
    fontSize: 16,
    color: "#F074BA",
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#4A5A60",
    marginVertical: 20,
  },
  holdingContainer: {
    marginBottom: 30,
  },
  holdingLabel: {
    fontSize: 16,
    color: "#FFD1EB",
    marginBottom: 5,
  },
  holdingValue: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  quantityContainer: {
    marginBottom: 30,
  },
  quantityLabel: {
    fontSize: 16,
    color: "#FFD1EB",
    marginBottom: 10,
  },
  quantityInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 18,
    color: "#000000",
    width: 80,
    textAlign: "center",
  },
  quantityUnit: {
    fontSize: 18,
    color: "#FFFFFF",
    marginLeft: 10,
  },
  totalContainer: {
    marginBottom: 40,
  },
  totalAmountContainer: {
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    marginRight: 10,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
  },
  buyButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 20,
  },
  buyButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#003340",
  },
  homeIndicator: {
    alignSelf: "center",
    width: 150,
    height: 5,
    backgroundColor: "#FFFFFF",
    opacity: 0.3,
    borderRadius: 2.5,
    marginBottom: 10,
  },
});

export default TradingBuyScreen;
