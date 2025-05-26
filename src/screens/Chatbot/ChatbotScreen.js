import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

// const ChatbotScreen = () => {
//   console.log('ChatbotScreen 렌더링');
//   return (
//     <View style={styles.container}>
//       <Text style={styles.text}>Chatbot Screen</Text>
//     </View>
//   );
// };

const ChatbotScreen = () => {
  return (
    
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={70} // ✅ 이거 추가!
    >
      <ScrollView 
      contentContainerStyle={styles.chatContainer}
        keyboardShouldPersistTaps="handled" // ✅ 이거 추가!
        >
        <View style={styles.botMessage}>
          <Text style={styles.botText}>안녕하세요! 무엇을 도와드릴까요?</Text>
        </View>

        <View style={styles.userMessage}>
          <Text style={styles.userText}>ETF 투자가 뭐야?</Text>
        </View>

        <View style={styles.botMessage}>
          <Text style={styles.botText}>
            ETF 투자를 생각해보면, 이게 마치 쇼핑몰에서 장바구니에 여러 가지 상품을 담는 것과 비슷해요. ETF는 주식, 채권 등 다양한 자산으로 이루어져 있어요. 이걸 사는 것은 그 장바구니 전체를 한 번에 사는 것이랑 같아요. 그래서 요즘은 이런 ETF 투자를 많이 추천하는데, 그 이유는 한 번에 많은 종목의 주식을 사는 것보다 위험을 분산시킬 수 있기 때문이에요. 이렇게 해서 여러 종목의 주식을 한 번에 관리할 수 있어요!
          </Text>
        </View>

        <View style={styles.userMessage}>
          <Text style={styles.userText}>ETF 투자가 뭐야? ETF 투자가 뭐야?</Text>
        </View>

        <View style={styles.botMessage}>
          <Text style={styles.botText}>
            이랑 같아요. 그래서 요즘은 이런 ETF 투자를 많이 추천하는데, 그 이유는 한 번에 많은
          </Text>
        </View>
      
      
      
      
      
      </ScrollView>

      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.hashButton}>
          <Text style={styles.hashText}>#</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder="메시지를 입력하세요"
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchText}>🔍</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#003340',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 30,
//   },
//   text: {
//     color: '#F074BA',
//     fontSize: 24,
//   }
// });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003340',
  },
  chatContainer: {
    flexGrow: 1, // ✅ 이 줄 추가!
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  botMessage: {
    backgroundColor: '#E0E6E7',
    borderRadius: 10,
    padding: 12,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  botText: {
    color: '#222',
    fontSize: 15,
    lineHeight: 22,
  },
  userMessage: {
    backgroundColor: '#D567A1',
    borderRadius: 10,
    padding: 12,
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  userText: {
    color: 'white',
    fontSize: 15,
  },
  inputBar: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#003340',
    alignItems: 'center',
  },
  hashButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D567A1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  hashText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#3D5B66',
    borderRadius: 18,
    paddingHorizontal: 15,
    paddingVertical: 8,
    color: 'white',
    fontSize: 15,
    marginRight: 8,
  },
  searchButton: {
    padding: 8,
  },
  searchText: {
    fontSize: 20,
    color: 'white',
  },
});

export default ChatbotScreen;