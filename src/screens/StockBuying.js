import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const StockBuying = ({ route, navigation }) => {
  const { stock } = route.params;
  const [quantity, setQuantity] = useState(1);
  const totalPrice = quantity * parseInt(stock.price.replace(/,/g, ''));

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>{'<'}</Text>
      </TouchableOpacity>
      <Text style={styles.title}>매수</Text>
      <Text style={styles.stockName}>{stock.name}</Text>
      <Text style={styles.stockPrice}>{stock.price}원</Text>
      <Text style={styles.change}>▲ {stock.change}%</Text>
      <View style={styles.divider} />
      <Text style={styles.label}>현재 보유량</Text>
      <Text style={styles.quantityText}>{stock.volume}주</Text>

      <Text style={styles.label}>얼마나 매수할까요?</Text>
      <View style={styles.counterContainer}>
        <TouchableOpacity 
          style={styles.counterButton} 
          onPress={() => setQuantity(prev => Math.max(1, prev - 1))}
        >
          <Text style={styles.counterText}>-</Text>
        </TouchableOpacity>

        <Text style={styles.quantity}>{quantity} 주</Text>

        <TouchableOpacity 
          style={styles.counterButton} 
          onPress={() => setQuantity(prev => prev + 1)}
        >
          <Text style={styles.counterText}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.totalPrice}>총 -{totalPrice.toLocaleString()}원</Text>

      <TouchableOpacity
        style={styles.tradeButton}
        onPress={() => navigation.navigate('StockTrade')}
      >
        <Text style={styles.tradeButtonText}>매수하기</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#003340',
        // alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
      },
      backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
      },
      backText: {
        fontSize: 36,
        color: '#F074BA',
      },
    
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#F074BA',
        position: 'absolute',
        top: 150,
        left: 30,
      },
    
  stockName: {
    fontSize: 18,
    color: '#FFD1EB',
    marginBottom: 5,
  },
  stockPrice: {
    fontSize: 20,
    color: '#EFF1F5',
    fontWeight: 'bold',
  },
  change: {
    fontSize: 16,
    color: '#F074BA',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#4A5A60',
    width: '100%',
    marginVertical: 15,
  },
  label: {
    fontSize: 16,
    color: '#A5C9CA',
    marginBottom: 5,
  },
  quantityText: {
    fontSize: 18,
    color: '#EFF1F5',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  counterButton: {
    backgroundColor: '#6EE69E',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 15,
  },
  counterText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003340',
  },
  quantity: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD1EB',
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6EE69E',
    marginBottom: 30,
  },
  tradeButton: {
    backgroundColor: '#F074BA',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 10,
  },
  tradeButtonText: {
    color: '#003340',
    fontSize: 18,
    fontWeight: 'bold',
    alignItems: 'center',
    },
});

export default StockBuying;
