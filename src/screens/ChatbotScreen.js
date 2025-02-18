import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChatbotScreen = () => {
  console.log('ChatbotScreen 렌더링');
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Chatbot Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003340',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  text: {
    color: '#F074BA',
    fontSize: 24,
  }
});

export default ChatbotScreen;