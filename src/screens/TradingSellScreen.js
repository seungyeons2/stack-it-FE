// TradingSellScreen.js
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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Header = ({ navigation }) => (
  <View style={styles.header}>
    <TouchableOpacity
      style={styles.backButton}
      onPress={() => navigation.goBack()}
    >
      <Text style={styles.backText}>{"<"}</Text>
    </TouchableOpacity>
    <Text style={styles.headerTitle}>매도</Text>
  </View>
);

const StockInfo = ({ stockInfo }) => (
  <View style={styles.stockInfoContainer}>
    <Text style={styles.stockName}>{stockInfo.name}</Text>
    <View style={styles.priceContainer}>
      <Text style={styles.stockPrice}>{stockInfo.price}원</Text>
      <Text style={styles.stockChange}>
        ▲{stockInfo.change.replace("+", "")}%
      </Text>
    </View>
  </View>
);

const HoldingInfo = ({ currentHolding }) => (
  <View style={styles.holdingContainer}>
    <Text style={styles.holdingLabel}>현재 보유량</Text>
    <Text style={styles.holdingValue}>{currentHolding}</Text>
  </View>
);

const QuantitySelector = ({ quantity, setQuantity }) => (
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
);

const TotalAmountDisplay = ({ totalAmount, totalColor }) => (
  <View style={styles.totalContainer}>
    <Text style={styles.totalLabel}>총</Text>
    <Text style={[styles.totalAmount, { color: totalColor }]}> 
      {totalAmount}
    </Text>
  </View>
);

const TradingSellScreen = ({ route, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [userHoldings, setUserHoldings] = useState(0);
  const [authenticated, setAuthenticated] = useState(false);
  const [quantity, setQuantity] = useState("1");

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

  const tokenUrl =
    "https://port-0-doodook-backend-lyycvlpm0d9022e4.sel4.cloudtype.app/api/token/";

  const getNewAccessToken = async () => {
    try {
      const email = await AsyncStorage.getItem("userEmail");
      const password = await AsyncStorage.getItem("userPassword");
      if (!email || !password) {
        navigation.navigate("Login");
        return null;
      }
      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error("Token fetch failed");
      const data = await response.json();
      await AsyncStorage.setItem("accessToken", data.access);
      return data.access;
    } catch (error) {
      console.error("Token error:", error);
      return null;
    }
  };

  const verifyAuthentication = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (!accessToken) {
        navigation.navigate("Login");
        return;
      }
      setAuthenticated(true);
    } catch (error) {
      console.error("Auth error:", error);
      navigation.navigate("Login");
    }
  };

  const fetchUserHoldings = async () => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (!accessToken) {
        navigation.navigate("Login");
        return;
      }
      const response = await fetch(
        `https://port-0-doodook-backend-lyycvlpm0d9022e4.sel4.cloudtype.app/stocks/holdings/${stockInfo.id}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 401) {
        const newToken = await getNewAccessToken();
        if (newToken) {
          return fetchUserHoldings();
        } else {
          navigation.navigate("Login");
          return;
        }
      }
      const data = await response.json();
      let holdings = 0;
      if (data?.status === "success" && data?.data?.quantity !== undefined) {
        holdings = data.data.quantity;
      } else if (data?.quantity !== undefined) {
        holdings = data.quantity;
      } else {
        holdings = parseInt(stockInfo.currentHolding);
      }
      setUserHoldings(holdings);
    } catch (error) {
      setUserHoldings(parseInt(stockInfo.currentHolding));
    }
  };

  const calculateTotal = () => {
    const priceWithoutComma = stockInfo.price.replace(/,/g, "");
    const total = parseInt(priceWithoutComma) * parseInt(quantity || 0);
    return total.toLocaleString();
  };

  const totalColor = "#F074BA";
  const totalAmount = `+${calculateTotal()}원`;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <SafeAreaView style={styles.safeArea}>
        <Header navigation={navigation} />
        <StockInfo stockInfo={stockInfo} />
        <View style={styles.divider} />
        <HoldingInfo currentHolding={stockInfo.currentHolding} />
        <QuantitySelector quantity={quantity} setQuantity={setQuantity} />
        <TotalAmountDisplay totalAmount={totalAmount} totalColor={totalColor} />
        <TouchableOpacity
          style={styles.sellButton}
          onPress={() => {
            alert(`${quantity}주 매도가 완료되었습니다.`);
            navigation.goBack();
          }}
        >
          <Text style={styles.sellButtonText}>매도하기</Text>
        </TouchableOpacity>
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
