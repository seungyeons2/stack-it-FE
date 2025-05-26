// FAQScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

const dummyFaqs = [
  {
    id: 1,
    question: '초기 투자 금액은 얼마인가요?',
    answer: '초기 자산은 기본적으로 100만 원으로 설정되어 있으며, 학습 탭과 햄햄이네 해바라기씨 농장의 기능을 통해서 예수금을 얻으실 수 있습니다.',
  },
  {
    id: 2,
    question: '실시간 주가를 사용하나요?',
    answer: '한국투자증권에서 제공하는 api를 통해 실시간 데이터를 제공됩니다.',
  },
  {
    id: 3,
    question: '매매는 언제든지 가능한가요?',
    answer: '거래는 실제 주식 시장 시간과 달리 항상 가능합니다. 장 외 시간에도 즉시 주문하실 수 있습니다.',
  },
  {
    id: 4,
    question: '매수와 매도 방법이 궁금해요.',
    answer: '종목을 검색한 후, 매수 또는 매도 버튼을 눌러 수량을 입력하고 주문을 실행하면 됩니다.',
  },
    {
    id: 5,
    question: '모의 투자는 실제 돈이 드나요?',
    answer: '아니요! 모의 투자는 가상의 자산을 활용하는 시뮬레이션으로, 실제 돈이 들지 않습니다.',
  },
  {
    id: 6,
    question: '모의 투자로 수익이 나면 현금으로 받을 수 있나요?',
    answer: '모의 투자는 학습용 기능이기 때문에 실제 수익이나 손실은 발생하지 않으며, 현금으로 교환되지 않습니다.',
  },
//   {
//     id: 7,
//     question: '랭킹은 어떻게 계산되나요?',
//     answer: '랭킹은 전체 사용자 중 수익률을 기준으로 실시간 집계되며, 일/주/월 단위로 확인할 수 있습니다.',
//   },
];


const FAQScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const loadFaqs = async () => {
      setLoading(true);
      try {
        // const res = await fetch('https://your-api/faq');
        // const data = await res.json();
        setFaqs(dummyFaqs);
      } catch (e) {
        console.error('FAQ 로딩 실패:', e);
      } finally {
        setLoading(false);
      }
    };
    loadFaqs();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#F074BA" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>{'<'}</Text>
      </TouchableOpacity>
      <Text style={styles.title}>자주 묻는 질문</Text>
      <ScrollView contentContainerStyle={styles.scroll}>
        {faqs.map((faq) => (
          <TouchableOpacity
            key={faq.id}
            onPress={() => toggleExpand(faq.id)}
            style={styles.faqBox}
          >
            <Text style={styles.faqQuestion}>{faq.question}</Text>
            {expandedId === faq.id && (
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default FAQScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003340',
    paddingHorizontal: 30,
    paddingTop: 60,
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
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scroll: {
    paddingBottom: 30,
  },
  faqBox: {
    backgroundColor: '#D4DDEF30',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  faqQuestion: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  faqAnswer: {
    marginTop: 10,
    color: '#EEEEEE',
    fontSize: 15,
    lineHeight: 22,
  },
});
