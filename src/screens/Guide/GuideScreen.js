import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
//import { LearningProgressBar } from '../../components/LearningProgressBar';
import LearningProgressBar from '../../components/LearningProgressBar';

const GuideScreen = ({ navigation }) => {
  // const MenuButton = ({ label, onPress }) => (
  //   <TouchableOpacity style={styles.menuButton} onPress={onPress}>
  //     <View style={styles.menuRow}>
  //       <Text style={styles.menuText}>{label}</Text>
  //       <Icon name="chevron-right" size={20} color="#ffffff" />
  //       </View>
  //     </View>
  //   </TouchableOpacity>
  // );

    const UnClearButton = ({ label, onPress }) => (
      <TouchableOpacity style={styles.unclearButton} onPress={onPress}>
        <View style={styles.menuRow}>
          <Text style={styles.menuText}>{label}</Text>
          <Icon name="chevron-right" size={20} color="#ffffff" />
        </View>
      </TouchableOpacity>
    );

    const ClearButton = ({ label, onPress }) => (
      <TouchableOpacity style={styles.clearButton} onPress={onPress}>
        <View style={styles.menuRow}>
          <Text style={styles.menuText}>{label}</Text>
          <Icon name="chevron-right" size={20} color="#ffffff" />
        </View>
      </TouchableOpacity>
    );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧠 주식유형 검사하기</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.examButton}
          onPress={() => navigation.navigate('TypeExam')}
        >
          <Text style={styles.buttonText}>유형 검사하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resultButton}
          onPress={() => navigation.navigate('ExamResult')}
        >
          <Text style={styles.buttonText}>유형 결과 확인하기</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />
      <Text style={styles.title}>✏️ 주식 초보를 위한 학습가이드</Text>
      <ScrollView contentContainerStyle={styles.menuContainer} showsVerticalScrollIndicator={false}>
        <ClearButton label="1단계" onPress={() => navigation.navigate('GuideLevel1')} />
        <LearningProgressBar current={17} total={17} />
        <ClearButton label="2단계" onPress={() => navigation.navigate('GuideLevel2')} />
        <LearningProgressBar current={2} total={10} />
        <UnClearButton label="3단계" onPress={() => navigation.navigate('GuideLevel3')} />
        <LearningProgressBar current={0} total={10} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003340',
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  title: {
    color: "#EEEEEE",
    fontSize: 18,
    marginBottom: 20,
    marginLeft: 15,
    marginTop: 5,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  examButton: {
    flex: 1,
    backgroundColor: '#6EE69EE0',
    paddingVertical: 110,
    borderRadius: 15,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'flex-end', // 텍스트 아래 정렬
    paddingBottom: 16,
  },
  resultButton: {
    flex: 1,
    backgroundColor: '#F074BAE0',
    paddingVertical: 110,
    borderRadius: 15,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'flex-end', // 텍스트 아래 정렬
    paddingBottom: 16,
  },
  buttonText: {
    fontFamily: 'Times New Roman',
    color: '#EFF1F5',
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#4A5A60',
    marginVertical: 20,
  },
  menuContainer: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#D4DDEF60',
    padding: 15,
    borderRadius: 15,
    marginTop: 10,
    marginBottom: 10,
    marginHorizontal: 10,
  },
  unclearButton: {
    backgroundColor: '#D4DDEF20',
    padding: 15,
    borderRadius: 15,
    marginTop: 10,

    marginBottom: 10,
    marginHorizontal: 10,
  },
  menuText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },

  
});

export default GuideScreen;
