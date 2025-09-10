import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { API_BASE_URL } from "../../utils/apiConfig";

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [autoCompleteResults, setAutoCompleteResults] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 자동완성 API 호출 함수
  const fetchAutoComplete = async (query) => {
    if (query.length === 0) {
      setAutoCompleteResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/stock/autocomplete/?query=${query}`
      );
      const data = await response.json();

      // results 배열이 있는지 확인하고 처리
      if (data.results) {
        setAutoCompleteResults(data.results);
      } else if (Array.isArray(data)) {
        setAutoCompleteResults(data);
      } else {
        console.error("예상치 못한 데이터 형식:", data);
        setAutoCompleteResults([]);
      }

      console.log("자동완성 결과:", autoCompleteResults);
    } catch (error) {
      console.error("자동완성 API 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  // 검색 API 호출 함수
  const fetchSearchResults = async (query) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/stock/search/?query=${query}`
      );
      const data = await response.json();

      // results 배열이 있는지 확인하고 처리
      if (data.results) {
        setSearchResults(data.results);
      } else if (Array.isArray(data)) {
        setSearchResults(data);
      } else {
        console.error("예상치 못한 데이터 형식:", data);
        setSearchResults([]);
      }

      setHasSearched(true);
      setAutoCompleteResults([]); // 자동완성 결과 초기화
    } catch (error) {
      console.error("검색 API 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  // 검색어 변경 시 자동완성 결과 요청
  useEffect(() => {
    console.log("검색어 변경:", searchQuery);
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        console.log("자동완성 API 호출 시도:", searchQuery);
        fetchAutoComplete(searchQuery);
      }
    }, 800); // 800ms 디바운스 *** 추후 늘릴수도..?

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // 자동완성 항목 선택 시 호출함
  const handleSelectAutoComplete = (item) => {
    setSearchQuery(item.name);
    fetchSearchResults(item.name);
  };

  // 이건 검색 결과 항목 선택 시 호출함
  const handleSelectStock = (item) => {
    // 선택한 주식의 상세 화면으로
    navigation.navigate("StockDetail", {
      symbol: item.symbol,
      name: item.name,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* 🔙 뒤로 가기 버튼 */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>{"<"}</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="주식명 또는 종목코드 검색"
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus={true}
          onSubmitEditing={() => fetchSearchResults(searchQuery)}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setSearchQuery("");
              setAutoCompleteResults([]);
            }}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F074BA" />
        </View>
      )}

      {/* 로그찍어본것 */}
      {!hasSearched && autoCompleteResults.length > 0 && (
        <Text style={{ color: "#FFF" }}>
          결과 수: {autoCompleteResults.length}
        </Text>
      )}

      {/* 자동완성 결과 */}
      {!hasSearched && autoCompleteResults.length > 0 && (
        <View style={[styles.resultsContainer, { flex: 1, maxHeight: "70%" }]}>
          <Text style={styles.resultTitle}>추천 검색어</Text>
          <FlatList
            data={autoCompleteResults}
            keyExtractor={(item) => item.symbol}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleSelectAutoComplete(item)}
              >
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemSymbol}>{item.symbol}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* 검색 결과*/}
      {hasSearched && searchResults.length > 0 && (
        <View style={[styles.resultsContainer, { flex: 1 }]}>
          <Text style={styles.resultTitle}>검색 결과</Text>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.symbol}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleSelectStock(item)}
              >
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemSymbol}>{item.symbol}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {hasSearched && searchResults.length === 0 && !loading && (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>검색 결과가 없습니다.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003340",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 16,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  backText: {
    color: "#EFF1F5",
    fontSize: 24,
    fontWeight: "bold",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#004455",
    borderRadius: 13,
    padding: 12,
    color: "#EFF1F5",
    fontSize: 16,
  },
  clearButton: {
    position: "absolute",
    right: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: {
    color: "#9ca3af",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  resultsContainer: {
    flex: 1,
    marginTop: 8,
    //backgroundColor: '#004455',
    borderRadius: 10,
    padding: 10,
    zIndex: 10,
  },
  resultTitle: {
    color: "#F074BA",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#004455",
    backgroundColor: "#002530",
    marginBottom: 4,
    borderRadius: 8,
  },
  itemName: {
    color: "#EFF1F5",
    fontSize: 16,
    fontWeight: "500",
  },
  itemSymbol: {
    color: "#9ca3af",
    fontSize: 14,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noResultsText: {
    color: "#9ca3af",
    fontSize: 16,
  },
});

export default SearchScreen;
