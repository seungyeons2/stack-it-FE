import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import { chatbotReply } from '../../utils/chatbotReply';
import SearchIcon from "../../assets/icons/search.svg";

// const ChatbotScreen = () => {
//   console.log('ChatbotScreen 렌더링');
//   return (
//     <View style={styles.container}>
//       <Text style={styles.text}>Chatbot Screen</Text>
//     </View>
//   );
// };

// const ChatbotScreen = () => {
//   return (
    
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//       keyboardVerticalOffset={70} // ✅ 이거 추가!
//     >
//       <ScrollView 
//       contentContainerStyle={styles.chatContainer}
//         keyboardShouldPersistTaps="handled" // ✅ 이거 추가!
//         >
//         <View style={styles.botMessage}>
//           <Text style={styles.botText}>안녕하세요! 무엇을 도와드릴까요?</Text>
//         </View>

//         <View style={styles.userMessage}>
//           <Text style={styles.userText}>ETF 투자가 뭐야?</Text>
//         </View>

//         <View style={styles.botMessage}>
//           <Text style={styles.botText}>
//             ETF 투자를 생각해보면, 이게 마치 쇼핑몰에서 장바구니에 여러 가지 상품을 담는 것과 비슷해요. ETF는 주식, 채권 등 다양한 자산으로 이루어져 있어요. 이걸 사는 것은 그 장바구니 전체를 한 번에 사는 것이랑 같아요. 그래서 요즘은 이런 ETF 투자를 많이 추천하는데, 그 이유는 한 번에 많은 종목의 주식을 사는 것보다 위험을 분산시킬 수 있기 때문이에요. 이렇게 해서 여러 종목의 주식을 한 번에 관리할 수 있어요!
//           </Text>
//         </View>

//         <View style={styles.userMessage}>
//           <Text style={styles.userText}>ETF 투자가 뭐야? ETF 투자가 뭐야?</Text>
//         </View>

//         <View style={styles.botMessage}>
//           <Text style={styles.botText}>
//             이랑 같아요. 그래서 요즘은 이런 ETF 투자를 많이 추천하는데, 그 이유는 한 번에 많은
//           </Text>
//         </View>
      
      
      
      
      
//       </ScrollView>

//       <View style={styles.inputBar}>
//         <TouchableOpacity style={styles.hashButton}>
//           <Text style={styles.hashText}>#</Text>
//         </TouchableOpacity>
//         <TextInput
//           style={styles.textInput}
//           placeholder="메시지를 입력하세요"
//           placeholderTextColor="#aaa"
//         />
//         <TouchableOpacity style={styles.searchButton}>
//           <Text style={styles.searchText}>🔍</Text>
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// };

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '안녕하세요! 무엇을 도와드릴까요?' },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef();
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
// const suggestions = [
//   "인기 주식", "AI 추천 종목", "장 초반 이슈", "대장주",
//   "어제의 급상승 10", "코스피/코스닥 상승률", "배당주 추천", "검색 급상승 종목"
// ];

const suggestions = [
  "주식 시작", "PER", "배당금", "우량주", "선물",
  "호가창", "분산투자가 왜 필요해?", "상장폐지",
  "코스피랑 코스닥 차이점", "공매도", "주식 거래 시간",
  "평단가", "매수&매도", "시가", "수수료", "ETF"
];

  // const suggestions = [
  // "ETF 투자가 뭐야?",
  // "삼성전자 주식 어때?",
  // "카카오 실적은 어때?",
  // "요즘 뜨는 산업 알려줘",
  // "AI 관련주 알려줘",
  // ];

const sendMessage = async () => {
  if (!input.trim()) return;

  const userMsg = { sender: 'user', text: input };
  const loadingMsg = { sender: 'bot', text: '...' };

  setMessages((prev) => [...prev, userMsg, loadingMsg]);
  setInput('');
  setLoading(true);

  setTimeout(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, 100);

  const reply = await chatbotReply(input);

  console.log("🤖 chatbotReply:", reply);
  console.log("📏 길이:", reply.length);

  setMessages((prev) => {
    const newMessages = [...prev];
    newMessages.pop(); // loading 메시지 제거
    return [...newMessages, { sender: 'bot', text: reply }];
  });

  setLoading(false);

  // 스크롤
  setTimeout(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, 100);
};



  return (
    <KeyboardAvoidingView
      style={styles.container}
      
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={70}
    >
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }} 
        contentContainerStyle={styles.chatContainer}
        keyboardShouldPersistTaps="handled"
      >
{messages.map((msg, index) => (
  <View
    key={index}
    style={msg.sender === 'user' ? styles.userMessage : styles.botMessage}
  >
    {msg.text === '...' && msg.sender === 'bot' ? (
      <ActivityIndicator size="small" color="#999" />
    ) : (
      <Text style={msg.sender === 'user' ? styles.userText : styles.botText}
      numberOfLines={0}         // ✅ 무제한 줄
      ellipsizeMode="tail"      // ✅ 잘리면 말줄임표로
      >
        {msg.text}
      </Text>
    )}
  </View>
))}

      </ScrollView>

{showSuggestions && (
  <View style={styles.suggestionContainer}>
    {suggestions.map((item, idx) => (
      <TouchableOpacity
        key={idx}
        onPress={() => {
          setInput(item);
          setShowSuggestions(false);
        }}
        style={styles.suggestionPill}
      >
        <Text style={styles.suggestionText}>{item}</Text>
      </TouchableOpacity>
    ))}
  </View>
)}
      <View style={styles.inputBar}>
        <TouchableOpacity
  style={[
  styles.hashButton,
  showSuggestions && styles.hashButtonActive
]}
  onPress={() => setShowSuggestions((prev) => !prev)}
>


  <Text style={styles.hashText}>#</Text>
</TouchableOpacity>





        <TextInput
          style={styles.textInput}
          placeholder="메시지를 입력하세요"
          placeholderTextColor="#aaa"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
        />
        {/* <TouchableOpacity style={styles.searchButton} onPress={sendMessage}> */}
          <TouchableOpacity onPress={sendMessage}>
          <SearchIcon width={24} height={24} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

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
    maxWidth: '80%', // ✅ 유동 크기 제한
    marginRight: 30, // ✅ 오른쪽 여백 추가
    //flexShrink: 1,   // ✅ 텍스트 넘칠 경우 줄이기 허용
    //flexWrap: 'wrap', // ✅ 텍스트 줄바꿈 허용
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
    maxWidth: '80%',
  },
  userText: {
    color: 'white',
    fontSize: 15,
  },
  inputBar: {
    position: 'absolute',
    bottom: 65,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 18,
    backgroundColor: '#003340',
    alignItems: 'center',
  },
  hashButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#D567A1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  hashButtonActive: {
  backgroundColor: '#738C93', // ✅ 눌렀을 때 조금 진한 핑크 예시
},

  hashText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },

  suggestionContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  bottom: 80,
  paddingHorizontal: 20,
  paddingTop: 20,
  paddingBottom: 20,
  gap: 8, // React Native >= 0.71
  backgroundColor: '#738C93',
},

suggestionPill: {
  backgroundColor: '#e5e5e5',
  paddingVertical: 8,
  paddingHorizontal: 10,
  borderRadius: 20,
  marginRight: 8,   
  marginBottom: 4,
  
},

suggestionText: {
  fontSize: 14,
  color: '#003340',
},

  textInput: {
    flex: 1,
    backgroundColor: '#3D5B66',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: 'white',
    fontSize: 15,
    marginRight: 8,
  },
  // searchButton: {
  //   padding: 8,
  // },
  searchText: {
    fontSize: 20,
    color: 'white',
  },
});

export default ChatbotScreen;