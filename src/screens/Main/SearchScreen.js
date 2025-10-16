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
import { useTheme } from "../../utils/ThemeContext";

const SearchScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [autoCompleteResults, setAutoCompleteResults] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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

  const fetchSearchResults = async (query) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/stock/search/?query=${query}`
      );
      const data = await response.json();

      if (data.results) {
        setSearchResults(data.results);
      } else if (Array.isArray(data)) {
        setSearchResults(data);
      } else {
        console.error("예상치 못한 데이터 형식:", data);
        setSearchResults([]);
      }

      setHasSearched(true);
      setAutoCompleteResults([]);
    } catch (error) {
      console.error("검색 API 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("검색어 변경:", searchQuery);
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        console.log("자동완성 API 호출 시도:", searchQuery);
        fetchAutoComplete(searchQuery);
      }
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSelectAutoComplete = (item) => {
    setSearchQuery(item.name);
    fetchSearchResults(item.name);
  };

  const handleSelectStock = (item) => {
    navigation.navigate("StockDetail", {
      symbol: item.symbol,
      name: item.name,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={[styles.backText, { color: theme.accent.primary }]}>{"<"}</Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: theme.background.secondary,
            color: theme.text.primary 
          }]}
          placeholder="주식명 또는 종목코드 검색"
          placeholderTextColor={theme.text.tertiary}
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
            <Text style={[styles.clearButtonText, { color: theme.text.tertiary }]}>
              ✕
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent.primary} />
        </View>
      )}

      {!hasSearched && autoCompleteResults.length > 0 && (
        <Text style={{ color: theme.text.primary }}>
          결과 수: {autoCompleteResults.length}
        </Text>
      )}

      {!hasSearched && autoCompleteResults.length > 0 && (
        <View style={[styles.resultsContainer, { flex: 1, maxHeight: "70%" }]}>
          <Text style={[styles.resultTitle, { color: theme.accent.primary }]}>
            추천 검색어
          </Text>
          <FlatList
            data={autoCompleteResults}
            keyExtractor={(item) => item.symbol}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.resultItem, { 
                  backgroundColor: theme.background.card,
                  borderBottomColor: theme.background.secondary 
                }]}
                onPress={() => handleSelectAutoComplete(item)}
              >
                <Text style={[styles.itemName, { color: theme.text.primary }]}>
                  {item.name}
                </Text>
                <Text style={[styles.itemSymbol, { color: theme.text.tertiary }]}>
                  {item.symbol}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {hasSearched && searchResults.length > 0 && (
        <View style={[styles.resultsContainer, { flex: 1 }]}>
          <Text style={[styles.resultTitle, { color: theme.accent.primary }]}>
            검색 결과
          </Text>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.symbol}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.resultItem, { 
                  backgroundColor: theme.background.card,
                  borderBottomColor: theme.background.secondary 
                }]}
                onPress={() => handleSelectStock(item)}
              >
                <Text style={[styles.itemName, { color: theme.text.primary }]}>
                  {item.name}
                </Text>
                <Text style={[styles.itemSymbol, { color: theme.text.tertiary }]}>
                  {item.symbol}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {hasSearched && searchResults.length === 0 && !loading && (
        <View style={styles.noResultsContainer}>
          <Text style={[styles.noResultsText, { color: theme.text.tertiary }]}>
            검색 결과가 없습니다.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 24,
    fontWeight: "bold",
  },
  searchInput: {
    flex: 1,
    borderRadius: 13,
    padding: 12,
    fontSize: 16,
  },
  clearButton: {
    position: "absolute",
    right: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: {
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
    borderRadius: 10,
    padding: 10,
    zIndex: 10,
  },
  resultTitle: {
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
    marginBottom: 4,
    borderRadius: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
  },
  itemSymbol: {
    fontSize: 14,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 16,
  },
});

export default SearchScreen;