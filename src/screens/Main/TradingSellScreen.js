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
import { fetchUserInfo } from "../../utils/user";
import { API_BASE_URL } from "../../utils/apiConfig";
import { fetchWithHantuToken } from "../../utils/hantuToken";
import { fetchWithAuth } from "../../utils/token";
import { useTheme } from "../../utils/ThemeContext";

const TradingSellScreen = ({ route, navigation }) => {
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
      if (!result.success) throw new Error(result.error);
      const data = result.data;
      if (data.current_price) {
        setCurrentPrice(data.current_price);
      } else {
        setCurrentPrice(
          typeof stock.price === "string"
            ? parseInt(stock.price.replace(/,/g, ""))
            : stock.price
        );
      }
    } catch (e) {
      console.error("❌ 현재가 조회 실패:", e);
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

  const handleSell = async () => {
    console.log("💸 매도 주문 시작");

    if (!userId) {
      Alert.alert("오류", "사용자 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (!stock || !stock.name) {
      Alert.alert("오류", "주식 정보가 올바르지 않습니다.");
      return;
    }

    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      Alert.alert("오류", "올바른 수량을 입력해주세요.");
      return;
    }

    const ownedQty = parseInt(stock.quantity) || 0;
    if (qty > ownedQty) {
      Alert.alert(
        "매도 실패",
        `보유 수량(${ownedQty}주)보다 많이 매도할 수 없습니다.`
      );
      return;
    }

    if (currentPrice <= 0) {
      Alert.alert("오류", "주식 가격 정보가 올바르지 않습니다.");
      return;
    }

    setLoading(true);

    try {
      const stockIdentifier = stock.symbol;

      const orderData = {
        user_id: userId,
        stock_symbol: stockIdentifier,
        order_type: "sell",
        quantity: qty,
        price: currentPrice,
      };

      console.log("📡 매도 주문 데이터:", orderData);

      const response = await fetchWithAuth(
        `${API_BASE_URL}trading/trade/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        },
        navigation
      );

      console.log("📬 매도 주문 응답 상태:", response.status);

      const text = await response.text();
      let result;
      try { result = JSON.parse(text); } catch { result = { message: text }; }
      console.log("📬 매도 주문 응답 데이터:", result);

      if (!response.ok) {
        console.error("❌ 매도 주문 실패 응답:", result);
        Alert.alert("매도 실패", result?.detail || result?.message || `서버 오류: ${response.status}`);
        return;
      }

      if (result.status === "success") {
        Alert.alert(
          "매도 완료",
          result.message || `${stock.name} ${qty}주 매도가 완료되었습니다.`,
          [{ text: "확인", onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert("매도 실패", result.message || "매도 주문에 실패했습니다.");
      }
    } catch (error) {
      console.error("❌ 매도 주문 실패:", error);
      Alert.alert("요청 실패", "매도 주문 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (number) => number.toLocaleString();
  
  const getChangeColor = (change) => {
    if (change > 0) return theme.status.up;
    if (change < 0) return theme.status.down;
    return theme.status.same;
  };
  
  const getChangeSymbol = (change) => (change > 0 ? "▲" : change < 0 ? "▼" : "");

  const maxSellQuantity = parseInt(stock?.quantity) || 0;

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
            매도
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
                  <Text style={[styles.changeText, { color: getChangeColor(stock.change) }]}>
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
            {formatNumber(maxSellQuantity)}주
          </Text>
        </View>

        {/* 평균 단가 정보 */}
        {stock?.average_price && (
          <View style={styles.infoSection}>
            <Text style={[styles.label, { color: theme.accent.light }]}>
              평균 단가
            </Text>
            <Text style={[styles.value, { color: theme.text.primary }]}>
              {formatNumber(stock.average_price)}원
            </Text>
          </View>
        )}

        {/* 수량 입력 */}
        <View style={styles.infoSection}>
          <Text style={[styles.label, { color: theme.accent.light }]}>
            매도 수량
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
            <TouchableOpacity
              style={[styles.maxButton, { backgroundColor: theme.background.secondary }]}
              onPress={() => setQuantity(maxSellQuantity.toString())}
            >
              <Text style={[styles.maxButtonText, { color: theme.text.primary }]}>
                전체
              </Text>
            </TouchableOpacity>
          </View>
          {maxSellQuantity > 0 && (
            <Text style={[styles.maxInfo, { color: theme.text.secondary }]}>
              최대 {formatNumber(maxSellQuantity)}주까지 매도 가능
            </Text>
          )}
        </View>

        {/* 총 금액 */}
        <View style={[styles.totalRow, { backgroundColor: theme.background.secondary }]}>
          <Text style={[styles.totalLabel, { color: theme.text.primary }]}>
            총 매도 금액
          </Text>
          <Text style={[styles.totalAmount, { color: theme.button.primary }]}>
            {formatNumber(calculateTotal())}원
          </Text>
        </View>

        {/* 예상 손익 */}
        {stock?.average_price && (
          <View style={[styles.profitRow, { backgroundColor: theme.background.card }]}>
            <Text style={[styles.profitLabel, { color: theme.text.primary }]}>
              예상 손익
            </Text>
            <Text
              style={[
                styles.profitAmount,
                { color: currentPrice - stock.average_price >= 0 ? theme.status.success : theme.button.primary },
              ]}
            >
              {currentPrice - stock.average_price >= 0 ? "+" : ""}
              {formatNumber((currentPrice - stock.average_price) * (parseInt(quantity) || 0))}원
            </Text>
          </View>
        )}

        {/* 매도 버튼 */}
        <TouchableOpacity
          style={[
            styles.sellButton,
            { backgroundColor: theme.button.primary },
            (loading || priceLoading || maxSellQuantity === 0 || !userId) && styles.disabledButton,
          ]}
          onPress={handleSell}
          disabled={loading || priceLoading || maxSellQuantity === 0 || !userId}
        >
          {loading ? (
            <ActivityIndicator color={theme.background.primary} />
          ) : maxSellQuantity === 0 ? (
            <Text style={[styles.sellButtonText, { color: theme.background.primary }]}>
              매도할 주식이 없습니다
            </Text>
          ) : (
            <Text style={[styles.sellButtonText, { color: theme.background.primary }]}>
              {formatNumber(parseInt(quantity) || 0)}주 매도하기
            </Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 30 },
  safeArea: { flex: 1, paddingHorizontal: 30, paddingTop: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 30, marginTop: 40 },
  backText: { fontSize: 28, marginRight: 15 },
  title: { fontSize: 20, fontWeight: "bold", flex: 1, textAlign: "center", marginRight: 43 },
  stockRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  stockInfo: { flex: 1 },
  stockName: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  stockCode: { fontSize: 14 },
  priceBlock: { alignItems: "flex-end" },
  priceText: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  changeText: { fontSize: 14, fontWeight: "bold" },
  divider: { height: 1, marginVertical: 20 },
  infoSection: { marginBottom: 25 },
  label: { fontSize: 16, marginBottom: 8 },
  value: { fontSize: 18, fontWeight: "bold" },
  inputRow: { flexDirection: "row", alignItems: "center" },
  input: { borderRadius: 10, paddingHorizontal: 15, paddingVertical: 12, fontSize: 18, minWidth: 100, textAlign: "center", marginRight: 10 },
  unit: { fontSize: 18, marginRight: 10 },
  maxButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  maxButtonText: { fontSize: 14, fontWeight: "bold" },
  maxInfo: { fontSize: 12, marginTop: 5 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 15, paddingVertical: 15, paddingHorizontal: 20, borderRadius: 10 },
  totalLabel: { fontSize: 16 },
  totalAmount: { fontSize: 20, fontWeight: "bold" },
  profitRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 30, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 },
  profitLabel: { fontSize: 14 },
  profitAmount: { fontSize: 16, fontWeight: "bold" },
  sellButton: { marginTop: "auto", borderRadius: 12, paddingVertical: 16, alignItems: "center", marginBottom: 30 },
  disabledButton: { backgroundColor: "#A0A0A0" },
  sellButtonText: { fontSize: 18, fontWeight: "bold" },
});

export default TradingSellScreen;