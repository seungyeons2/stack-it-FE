import React, { useState, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";

const TradingSellScreen = ({ route, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [userHoldings, setUserHoldings] = useState(0);
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
    fetchUserHoldings();
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

  // 사용자 보유 주식 수량 조회
  const fetchUserHoldings = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");

      if (!accessToken) {
        console.error("액세스 토큰이 없습니다.");
        navigation.navigate("Login");
        return;
      }

      console.log("사용 중인 액세스 토큰:", accessToken);

      // 실제 API 엔드포인트로 수정 필요
      const response = await fetch(
        `https://port-0-doodook-backend-lyycvlpm0d9022e4.sel4.cloudtype.app/stocks/holdings/${stockInfo.id}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("응답 상태:", response.status);

      // 토큰 만료 처리
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
            return fetchUserHoldings();
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

      try {
        const data = await response.json();
        console.log("보유 주식 데이터:", data);

        // 실제 API 응답 구조에 맞게 조정 필요
        let holdings = 0;

        if (data?.status === "success" && data?.data?.quantity !== undefined) {
          holdings = data.data.quantity;
        } else if (data?.quantity !== undefined) {
          holdings = data.quantity;
        } else {
          // API 응답 대신 route.params에서 전달된 값 사용
          holdings = parseInt(stockInfo.currentHolding);
        }

        setUserHoldings(holdings);
      } catch (parseError) {
        console.error("JSON 파싱 오류:", parseError);
        // 오류 시 기본값 사용
        setUserHoldings(parseInt(stockInfo.currentHolding));
      }
    } catch (error) {
      console.error("보유 주식 불러오기 실패:", error);
      // 오류 시 기본값 사용
      setUserHoldings(parseInt(stockInfo.currentHolding));
    }
  };

  const [quantity, setQuantity] = useState("1");

  // 수량에 따른 총액 계산 (콤마 제거 후 계산)
  const calculateTotal = () => {
    const priceWithoutComma = stockInfo.price.replace(/,/g, "");
    const total = parseInt(priceWithoutComma) * parseInt(quantity || 0);
    return total.toLocaleString();
  };

  // 양수 표시를 위한 색상
  const totalColor = "#F074BA"; // 분홍색 (양수)
  const totalAmount = `+${calculateTotal()}원`;

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
          <Text style={styles.headerTitle}>매도</Text>
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

        {/* 매도할 수량 */}
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>얼마나 매도할까요?</Text>
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

        {/* 매도하기 버튼 */}
        <TouchableOpacity
          style={styles.sellButton}
          onPress={() => {
            // 매도 처리 로직 구현
            alert(`${quantity}주 매도가 완료되었습니다.`);
            navigation.goBack();
          }}
        >
          <Text style={styles.sellButtonText}>매도하기</Text>
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
  sellButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 20,
  },
  sellButtonText: {
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

export default TradingSellScreen;
