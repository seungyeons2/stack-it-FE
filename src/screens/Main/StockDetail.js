import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";

const StockDetail = ({ route, navigation }) => {
  const { symbol, name } = route.params;
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // 한국투자 토큰 생성 및 주식 상세 정보 가져오는부분
  useEffect(() => {
    const fetchStockDetails = async () => {
      try {
        setLoading(true);
        
        // 1. 기존 토큰 삭제
        await fetch('http://127.0.0.1:8000/trade_hantu/destroy_access_token/', {
          method: 'POST'
        });
        
        // 2. 새 토큰 생성
        await fetch('http://127.0.0.1:8000/trade_hantu/issue_access_token/', {
          method: 'POST'
        });
        
        // 3. 현재가 조회
        const priceResponse = await fetch(
          `http://127.0.0.1:8000/trading/stock_price/?stock_code=${symbol}`
        );
        const priceData = await priceResponse.json();
        
        // 4. 전일대비 변동 정보 조회
        const changeResponse = await fetch(
          `http://127.0.0.1:8000/stocks/price_change/?stock_code=${symbol}`
        );
        const changeData = await changeResponse.json();
        
        // 데이터 설정
        if (priceData.status === "success" && changeData.status === "success") {
          setStockData({
            symbol: symbol,
            name: name,
            price: priceData.current_price.toLocaleString(),
            change: changeData.price_change_percentage.toFixed(2),
            changeStatus: changeData.change_status,
            priceChange: changeData.price_change.toLocaleString(),
            previousPrice: changeData.previous_price.toLocaleString(),
            // volume: "조회 중", 
            // marketCap: "조회 중", 
            // high52Week: "조회 중", 
            // low52Week: "조회 중", 
            currentDate: changeData.current_date,
            previousDate: changeData.previous_date,
          });
        } else {
          // API 오류 시 임시 데이터 설정
          setStockData({
            symbol: symbol,
            name: name,
            price: "0",
            change: "0.00",
            changeStatus: "none",
            priceChange: "0",
            previousPrice: "0",
            // volume: "조회 실패",
            // marketCap: "조회 실패", 
            // high52Week: "조회 실패",
            // low52Week: "조회 실패",
            currentDate: "",
            previousDate: "",
          });
        }
      } catch (error) {
        console.error("주식 상세 정보 불러오기 실패:", error);
        // 오류 시 임시 데이터
        setStockData({
          symbol: symbol,
          name: name,
          price: "0",
          change: "0.00",
          changeStatus: "none",
          priceChange: "0",
          previousPrice: "0",
        //   volume: "조회 실패",
        //   marketCap: "조회 실패", 
        //   high52Week: "조회 실패",
        //   low52Week: "조회 실패",
          currentDate: "",
          previousDate: "",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStockDetails();
  }, [symbol]);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // 즐겨찾기 관룐 -> 이거 구현되면 추가할예정
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F074BA" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* 🔙 뒤로 가기 버튼 */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name}</Text>
        <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
          {isFavorite ? (
            <Text style={styles.starIcon}>★</Text>
          ) : (
            <Text style={styles.starIcon}>☆</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.priceSection}>
          <Text style={styles.symbolText}>{symbol}</Text>
          <Text style={styles.priceText}>{stockData.price}원</Text>
          <Text
            style={[
              styles.changeText,
              stockData.changeStatus === "up" 
                ? styles.positiveChange 
                : stockData.changeStatus === "down"
                ? styles.negativeChange
                : styles.neutralChange,
            ]}
          >
            {stockData.change}% ({stockData.priceChange}원)
          </Text>
        </View>

        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartText}>차트가 이곳에 표시됩니다</Text>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>주요 지표</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>전일 종가 ({stockData.previousDate})</Text>
            <Text style={styles.statValue}>{stockData.previousPrice}원</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>현재가 ({stockData.currentDate})</Text>
            <Text style={styles.statValue}>{stockData.price}원</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>전일대비 변동</Text>
            <Text style={[
              styles.statValue, 
              stockData.changeStatus === "up" 
                ? styles.positiveChange 
                : stockData.changeStatus === "down"
                ? styles.negativeChange
                : null
            ]}>
              {stockData.priceChange}원 ({stockData.change}%)
            </Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>거래량</Text>
            <Text style={styles.statValue}>{stockData.volume}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>시가총액</Text>
            <Text style={styles.statValue}>{stockData.marketCap}</Text>
          </View>
          
          
          
        </View>

        <TouchableOpacity
          style={styles.tradeButton}
          onPress={() => navigation.navigate("StockTrade", { symbol, name })}
        >
          <Text style={styles.tradeButtonText}>이 주식 거래하기</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003340",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#003340",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#004455",
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: "#EFF1F5",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerTitle: {
    color: "#EFF1F5",
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
    color: "#F074BA",
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
    color: "#9ca3af",
    fontSize: 14,
    marginBottom: 8,
  },
  priceText: {
    color: "#EFF1F5",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
  },
  changeText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  positiveChange: {
    color: "#F074BA",
  },
  negativeChange: {
    color: "#60a5fa",
  },
  neutralChange: {
    color: "#9ca3af",
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: "#004455",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  chartText: {
    color: "#9ca3af",
  },
  statsContainer: {
    backgroundColor: "#004455",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#F074BA",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#003340",
  },
  statLabel: {
    color: "#9ca3af",
    fontSize: 14,
  },
  statValue: {
    color: "#EFF1F5",
    fontSize: 14,
    fontWeight: "500",
  },
  tradeButton: {
    backgroundColor: "#F074BA",
    padding: 16,
    borderRadius: 13,
    alignItems: "center",
    marginBottom: 32,
  },
  tradeButtonText: {
    color: "#EFF1F5",
    fontSize: 18,
    fontWeight: "900",
  },
});

export default StockDetail;