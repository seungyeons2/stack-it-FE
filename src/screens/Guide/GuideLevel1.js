import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const levels = [
  { id: 1, type: 'start' },
  { id: 2, type: 'done' },
  { id: 3, type: 'done' },
  { id: 4, type: 'chest' },
  { id: 5, type: 'locked' },
  { id: 6, type: 'locked' },
];

const GuideLevel1 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>{'<'}</Text>
      </TouchableOpacity>
      <Text style={styles.title}>1단계</Text>

      <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>
        {levels.map((item, index) => {
          const isLeft = index % 2 === 0;
          return (
            <View key={index} style={[styles.stepContainer, isLeft ? styles.left : styles.right]}>
              <View style={styles.circleWrapper}>
                <View style={[styles.circle, circleStyle(item.type)]}>
                  {item.type === 'start' && <Text style={styles.startText}>START</Text>}
                  {item.type === 'done' && <Icon name="check" size={24} color="#fff" />}
                  {item.type === 'chest' && <Icon name="gift" size={24} color="#fff" />}
                  {item.type === 'locked' && <Icon name="lock" size={24} color="#fff" />}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const circleStyle = (type) => {
  switch (type) {
    case 'start': return { backgroundColor: '#F8B5D4' };
    case 'done': return { backgroundColor: '#F074BA' };
    case 'chest': return { backgroundColor: '#FFD700' };
    case 'locked': return { backgroundColor: '#AAAAAA' };
    default: return { backgroundColor: '#ccc' };
  }
};

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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F074BA',
    //justifyContent: 'center',
    //alignItems: 'center',
    //position: 'absolute',
    //top: 100,
    //left: 30,
  },
  scrollView: {
    marginTop: 150,
    paddingBottom: 60,
  },
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 12,
    width: '100%',
  },
  left: {
    justifyContent: 'flex-start',
    paddingLeft: '10%',
  },
  right: {
    justifyContent: 'flex-end',
    paddingRight: '10%',
  },
  circleWrapper: {
    alignItems: 'center',
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default GuideLevel1;