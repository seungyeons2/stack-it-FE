import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SearchIcon from '../../assets/icons/search.svg';
import { getNewAccessToken } from '../utils/token';

const StockTradeScreen = ({ navigation }) => {
  const [portfolioData, setPortfolioData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = async () => {
    console.log("📥 포트폴리오 요청 시작");
  
    const accessToken = await getNewAccessToken();
    const userId = await AsyncStorage.getItem('userId');
  
    console.log("🔐 가져온 Access Token:", accessToken);
    console.log("👤 저장된 userId:", userId);
  
    if (!accessToken || !userId) {
      console.error("❌ AccessToken 또는 userId 없음. 요청 중단.");
      return;
    }
  
    const url = `https://port-0-doodook-backend-lyycvlpm0d9022e4.sel4.cloudtype.app/trading/portfolio/4${userId}/`;
    console.log("📡 요청 URL:", url);
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      console.log("📬 응답 상태 코드:", response.status);
  
      const responseText = await response.text(); // 일단 text로 받아서 로그로 찍기
      console.log("📦 응답 본문:\n", responseText);
  
      const result = JSON.parse(responseText);
  
      if (result?.status !== "success" || !Array.isArray(result.portfolio)) {
        console.warn("⚠️ 응답 구조가 예상과 다릅니다:", result);
        return;
      }
  
      const parsedData = result.portfolio.map((item, index) => ({
        id: index + 1,
        name: item.stock_code,
        price: item.current_price.toLocaleString(),
        change: item.profit_rate.toFixed(2),
        volume: `${item.quantity}주`,
      }));
  
      console.log("✅ 파싱된 포트폴리오 데이터:", parsedData);
  
      setPortfolioData(parsedData);
    } catch (error) {
      console.error("❌ 포트폴리오 요청 실패:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const searchStocks = async () => {
    if (!searchText.trim()) return;

    try {
      const response = await fetch(
        `https://port-0-doodook-backend-lyycvlpm0d9022e4.sel4.cloudtype.app/api/stock/search/?query=${encodeURIComponent(searchText.trim())}`
      );

      const result = await response.json();

      const parsed = result.map((item, index) => ({
        id: index + 1,
        name: item.name || item.stock_code,
        price: item.current_price?.toLocaleString() || '0',
        change: item.change_rate?.toFixed(2) || '0.00',
        volume: item.volume ? `${item.volume.toLocaleString()}주` : '0주',
      }));

      setSearchResults(parsed);
    } catch (error) {
      console.error('❌ 주식 검색 실패:', error);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>주식 거래하기</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 내 포트폴리오 */}
        <Text style={styles.sectionTitle}>현재 보유 주식</Text>
        <View style={styles.divider} />

        {portfolioData.map(stock => (
          <View key={stock.id}>
            <View style={styles.stockItem}>
              <View style={styles.stockInfo}>
                <Text style={styles.stockName}>{stock.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.stockPrice}>{stock.price}원</Text>
                  <Text style={[
                    styles.stockChange,
                    parseFloat(stock.change) < 0 && { color: '#00BFFF' }
                  ]}>
                    {parseFloat(stock.change) >= 0 ? '▲' : '▼'}
                    {Math.abs(parseFloat(stock.change)).toFixed(2)}%
                  </Text>
                </View>
                <Text style={styles.stockVolume}>보유 수량: {stock.volume}</Text>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.buyButton}
                  onPress={() => navigation.navigate('TradingBuy', { stock })}
                >
                  <Text style={styles.buyText}>매수</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sellButton}
                  onPress={() => navigation.navigate('TradingSell', { stock })}
                >
                  <Text style={styles.sellText}>매도</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.divider} />
          </View>
        ))}

        {/* 전체 주식 검색 */}
        <Text style={styles.sectionTitle}>전체 주식</Text>
        <View style={styles.divider} />

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="주식명 검색"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={searchStocks}
          >
            <SearchIcon width={24} height={24} fill="#003340" />
          </TouchableOpacity>
        </View>

        {searchResults.length > 0 && (
          <>
            <View style={styles.divider} />
            {searchResults.map(stock => (
              <View key={stock.id}>
                <View style={styles.stockItem}>
                  <View style={styles.stockInfo}>
                    <Text style={styles.stockName}>{stock.name}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.stockPrice}>{stock.price}원</Text>
                      <Text style={[
                        styles.stockChange,
                        parseFloat(stock.change) < 0 && { color: '#00BFFF' }
                      ]}>
                        {parseFloat(stock.change) >= 0 ? '▲' : '▼'}
                        {Math.abs(parseFloat(stock.change)).toFixed(2)}%
                      </Text>
                    </View>
                    <Text style={styles.stockVolume}>거래량: {stock.volume}</Text>
                  </View>

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.buyButton}
                      onPress={() => navigation.navigate('TradingBuy', { stock })}
                    >
                      <Text style={styles.buyText}>매수</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.sellButton}
                      onPress={() => navigation.navigate('TradingSell', { stock })}
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#003340',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 20,
    zIndex: 10,
  },
  backText: {
    fontSize: 36,
    color: '#F074BA',
  },
  scrollView: {
    flex: 1,
    marginTop: 70,
    marginBottom: 20,
    maxHeight: 1000,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F074BA',
    textAlign: 'center',
    top: 10,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFD1EB',
    fontWeight: 'bold',
    marginBottom: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#4A5A60',
    marginVertical: 10,
  },
  stockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  stockInfo: {
    flex: 1,
  },
  stockName: {
    fontSize: 16,
    color: '#EFF1F5',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockPrice: {
    fontSize: 18,
    color: '#EFF1F5',
    fontWeight: 'bold',
    marginRight: 10,
  },
  stockChange: {
    fontSize: 16,
    color: '#F074BA',
    fontWeight: 'bold',
  },
  stockVolume: {
    fontSize: 14,
    color: '#EFF1F5',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  buyButton: {
    backgroundColor: '#6EE69E',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  buyText: {
    color: '#003340',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sellButton: {
    backgroundColor: '#F074BA',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  sellText: {
    color: '#003340',
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF1F5',
    borderRadius: 15,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 15,
    marginTop: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    backgroundColor: '#EFF1F5',
    borderRadius: 13,
    padding: 10,
    marginRight: 10,
  },
  searchButton: {
    padding: 5,
  },
});

export default StockTradeScreen;
