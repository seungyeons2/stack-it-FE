import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { fetchWithHantuToken } from "../../utils/hantuToken";
import { fetchUserInfo } from "../../utils/user";
import { API_BASE_URL } from "../../utils/apiConfig";
import { fetchWithAuth } from "../../utils/token";
import { useTheme } from "../../utils/ThemeContext";

const TradingBuyScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const stock = route.params?.stock;
  const [quantity, setQuantity] = useState("1");
  const [currentPrice, setCurrentPrice] = useState(0);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await fetchUserInfo(navigation, (info) => {
        if (info?.id) setUserId(info.id);
      });
      await fetchCurrentPrice(stock?.symbol);
    };
    init();
  }, []);

  const fetchCurrentPrice = async (stockCode) => {
    if (!stockCode) {
      console.error("❌ 종목 코드가 없습니다.");
      setPriceLoading(false);
      return;
    }

    try {
      setPriceLoading(true);

      const result = await fetchWithHantuToken(
        `${API_BASE_URL}trading/stock_price/?stock_code=${stockCode}`
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      const data = result.data;

      if (data && data.current_price) {
        setCurrentPrice(data.current_price);
        console.log("✅ 현재가 업데이트:", data.current_price);
      } else {
        console.warn("⚠️ 현재가 API 응답 실패:", data);
        setCurrentPrice(
          typeof stock.price === "string"
            ? parseInt(stock.price.replace(/,/g, ""))
            : stock.price
        );
      }
    } catch (error) {
      console.error("❌ 현재가 조회 실패:", error);
      setCurrentPrice(
        typeof stock.price === "string"
          ? parseInt(stock.price.replace(/,/g, ""))
          : stock.price
      );
    } finally {
      setPriceLoading(false);
    }
  };

  const calculateTotal = () => {
    const qty = parseInt(quantity) || 0;
    return currentPrice * qty;
  };

  const handleBuy = async () => {
    console.log("💰 매수 주문 시작");

    if (!stock || !stock.name) {
      Alert.alert("오류", "주식 정보가 올바르지 않습니다.");
      return;
    }

    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      Alert.alert("오류", "올바른 수량을 입력해주세요.");
      return;
    }

    if (currentPrice <= 0) {
      Alert.alert("오류", "주식 가격 정보가 올바르지 않습니다.");
      return;
    }

    setLoading(true);

    try {
      const stockIdentifier = stock.symbol || stock.name;

      const orderData = {
        user_id: userId,
        stock_symbol: stockIdentifier,
        order_type: "buy",
        quantity: qty,
        price: currentPrice,
      };

      console.log("📡 매수 주문 데이터:", orderData);

      const response = await fetchWithAuth(
        `${API_BASE_URL}trading/trade/`,
        {
          method: "POST",
          body: JSON.stringify(orderData),
        },
        navigation
      );

      console.log("📬 매수 주문 응답 상태:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ 매수 주문 실패 응답:", errorText);
        Alert.alert("매수 실패", `서버 오류: ${response.status}`);
        return;
      }

      const result = await response.json();
      console.log("📬 매수 주문 응답 데이터:", result);

      if (result.status === "success") {
        Alert.alert(
          "매수 완료",
          result.message || `${stock.name} ${qty}주 매수가 완료되었습니다.`,
          [{ text: "확인", onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert("매수 실패", result.message || "매수 주문에 실패했습니다.");
      }
    } catch (error) {
      console.error("❌ 매수 주문 실패:", error);
      Alert.alert("요청 실패", "매수 주문 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (number) => {
    return number.toLocaleString();
  };

  const getChangeColor = (change) => {
    if (change > 0) return theme.status.up;
    if (change < 0) return theme.status.down;
    return theme.status.same;
  };

  const getChangeSymbol = (change) => {
    if (change > 0) return "▲";
    if (change < 0) return "▼";
    return "";
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backText, { color: theme.accent.primary }]}>
              {"<"}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.accent.primary }]}>
            매수
          </Text>
        </View>

        {/* 종목 정보 */}
        <View style={styles.stockRow}>
          <View style={styles.stockInfo}>
            <Text style={[styles.stockName, { color: theme.text.primary }]}>
              {stock?.name || "종목명 없음"}
            </Text>
            <Text style={[styles.stockCode, { color: theme.text.secondary }]}>
              ({stock?.symbol || "종목코드 없음"})
            </Text>
          </View>

          <View style={styles.priceBlock}>
            {priceLoading ? (
              <ActivityIndicator size="small" color={theme.accent.primary} />
            ) : (
              <>
                <Text style={[styles.priceText, { color: theme.text.primary }]}>
                  {formatNumber(currentPrice)}원
                </Text>
                {stock?.change !== undefined && (
                  <Text
                    style={[
                      styles.changeText,
                      { color: getChangeColor(stock.change) },
                    ]}
                  >
                    {getChangeSymbol(stock.change)}
                    {Math.abs(stock.change).toFixed(2)}%
                  </Text>
                )}
              </>
            )}
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border.medium }]} />

        {/* 현재 보유량 */}
        <View style={styles.infoSection}>
          <Text style={[styles.label, { color: theme.accent.light }]}>
            현재 보유량
          </Text>
          <Text style={[styles.value, { color: theme.text.primary }]}>
            {formatNumber(stock?.quantity || 0)}주
          </Text>
        </View>

        {/* 수량 입력 */}
        <View style={styles.infoSection}>
          <Text style={[styles.label, { color: theme.accent.light }]}>
            매수 수량
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.text.primary,
                color: theme.background.primary 
              }]}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              maxLength={6}
              placeholder="1"
              placeholderTextColor={theme.text.tertiary}
            />
            <Text style={[styles.unit, { color: theme.text.primary }]}>주</Text>
          </View>
        </View>

        {/* 총 금액 */}
        <View style={[styles.totalRow, { backgroundColor: theme.background.secondary }]}>
          <Text style={[styles.totalLabel, { color: theme.text.primary }]}>
            총 매수 금액
          </Text>
          <Text style={[styles.totalAmount, { color: theme.status.success }]}>
            {formatNumber(calculateTotal())}원
          </Text>
        </View>

        {/* 매수 버튼 */}
        <TouchableOpacity
          style={[
            styles.buyButton,
            { backgroundColor: theme.status.success },
            (loading || priceLoading) && styles.disabledButton
          ]}
          onPress={handleBuy}
          disabled={loading || priceLoading}
        >
          {loading ? (
            <ActivityIndicator color={theme.background.primary} />
          ) : (
            <Text style={[styles.buyButtonText, { color: theme.background.primary }]}>
              {formatNumber(parseInt(quantity) || 0)}주 매수하기
            </Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 40,
  },
  backText: {
    fontSize: 28,
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginRight: 43,
  },
  stockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  stockInfo: {
    flex: 1,
  },
  stockName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  stockCode: {
    fontSize: 14,
  },
  priceBlock: {
    alignItems: "flex-end",
  },
  priceText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  changeText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  infoSection: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 18,
    minWidth: 100,
    textAlign: "center",
    marginRight: 10,
  },
  unit: {
    fontSize: 18,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 40,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  totalLabel: {
    fontSize: 16,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
  },
  buyButton: {
    marginTop: "auto",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: "#A0A0A0",
  },
  buyButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default TradingBuyScreen;