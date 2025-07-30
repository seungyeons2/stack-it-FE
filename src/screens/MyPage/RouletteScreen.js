import React, { useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
  Platform,
  Alert,
  ImageBackground,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import { increaseBalance } from '../../utils/point';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.75;
const BORDER_WIDTH = 12;
const TOTAL_SIZE = WHEEL_SIZE + BORDER_WIDTH * 2;
const RADIUS = WHEEL_SIZE / 2;
const SEGMENTS = 8;
const SEGMENT_ANGLE = 360 / SEGMENTS;

// const prizes = [
//   '₩100,000',
//   '₩50,000',
//   '₩30,000',
//   '₩200,000',
//   '₩75,000',
//   '₩30,000',
//   '₩150,000',
//   '₩80,000',
// ];

const prizes = [
  '10 만원',
  '5 만원',
  '3 만원',
  '20 만원',
  '30 만원',
  '3 만원',
  '15 만원',
  '8 만원',
];


// 무지개 8색 팔레트
// const segmentColors = [
//   '#FF3B30', // 빨강
//   '#FF9500', // 주황
//   '#FFCC00', // 노랑
//   '#34C759', // 초록
//   '#5AC8FA', // 청록
//   '#007AFF', // 파랑
//   '#5856D6', // 보라
//   '#FF2D95', // 분홍
// ];
const segmentColors = [
  '#335696D0', // 빨강
  '#003340D0', // 주황
  '#335696D0', // 노랑
  '#003340D0', // 초록
  '#335696D0', // 청록
  '#003340D0', // 파랑
  '#335696D0', // 보라
  '#003340D0', // 분홍
];

// SVG 헬퍼 함수
const polarToCartesian = (cx, cy, r, angleDeg) => {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
};
const describeArc = (cx, cy, r, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M${start.x},${start.y} A${r},${r} 0 ${largeArc} 0 ${end.x},${end.y} L${cx},${cy} Z`;
};

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export default function RouletteScreen({ navigation }) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [spinning, setSpinning] = useState(false);
  const barHeight = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

  const spinWheel = () => {
    if (spinning) return;
    setSpinning(true);
    const rounds = Math.floor(Math.random() * 3) + 3;
    const idx = Math.floor(Math.random() * SEGMENTS);
    const deg = rounds * 360 + idx * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;

    Animated.timing(spinAnim, {
      toValue: deg,
      duration: 3500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      const final = deg % 360;
      const selected = SEGMENTS - Math.floor(final / SEGMENT_ANGLE) - 1;
      const prize = prizes[selected];
      const amount = parseInt(prize.replace(/[₩,]/g, ''), 10) * 10000;

      increaseBalance(navigation, amount)
        .then(msg => Alert.alert('축하합니다! 🎉', `${prize} 당첨!\n${msg}`))
        .catch(() => Alert.alert('오류', '룰렛은 하루에 한 번!\n내일 다시 시도해보세요.'))
        //.catch(() => Alert.alert('오류', '포인트 적립에 실패했습니다.'))
        .finally(() => {
          setSpinning(false);
          spinAnim.setValue(final);
        });
    });
  };

  const rotate = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ImageBackground
      source={require('../../assets/rainbow.png')}
      style={styles.background}
      imageStyle={styles.image}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <SafeAreaView style={styles.safeArea}>
        {/* 헤더 */}
        <View style={[styles.header, { paddingTop: barHeight }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>돌려돌려 돌림판</Text>
        </View>

        {/* 룰렛 */}
        <View style={styles.wheelWrapper}>
          <View style={styles.pinTop}>
            <Icon name="map-pin" size={56} color="#FFDC4F" />
          </View>
          {/* {[0, 90, 180, 270].map((angle, i) => (
            <View
              key={i}
              style={[
                styles.accentLine,
                { transform: [{ rotate: `${angle}deg` }] },
              ]}
            />
          ))} */}
          <View style={styles.wheelBorder} />
          <AnimatedSvg
            width={WHEEL_SIZE}
            height={WHEEL_SIZE}
            style={[styles.wheel, { transform: [{ rotate }] }]}
          >
            <G>
              {prizes.map((label, i) => {
                const start = i * SEGMENT_ANGLE;
                const end = start + SEGMENT_ANGLE;
                const path = describeArc(RADIUS, RADIUS, RADIUS, start, end);
                const fill = segmentColors[i];
                const mid = start + SEGMENT_ANGLE / 2;
                const angleRad = ((mid - 90) * Math.PI) / 180;
                const tx = RADIUS + RADIUS * 0.65 * Math.cos(angleRad);
                const ty = RADIUS + RADIUS * 0.65 * Math.sin(angleRad);
                return (
                  <G key={i}>
                    <Path d={path} fill={fill} />
                    <SvgText
                      x={tx}
                      y={ty}
                      fill="#FFFFFF"
                      fontSize="14"
                      fontWeight="bold"
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      transform={`rotate(${mid} ${tx} ${ty})`}
                    >
                      {label}
                    </SvgText>
                  </G>
                );
              })}
            </G>
          </AnimatedSvg>
          <TouchableOpacity
            style={[styles.centerButton, spinning && styles.disabled]}
            onPress={spinWheel}
            disabled={spinning}
          >
            <Text style={styles.centerText}>
              {spinning ? '돌리는 중...' : 'START'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  image: {
    resizeMode: 'cover',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 10,
  },
  backText: {
    fontSize: 36,
    color: '#F074BA',
  },
  title: {
    flex: 1,
    textAlign: 'center',
        top: 5,
    color: '#FFF',
    fontSize: 24,
    fontWeight: '600',
  },
  wheelWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinTop: {
    position: 'absolute',
    top: -(56 / 2) - BORDER_WIDTH + 160,
    zIndex: 5,
  },
  accentLine: {
    position: 'absolute',
    width: 2,
    height: WHEEL_SIZE * 0.5,
    backgroundColor: '#FFF',
    zIndex: 3,
  },
  wheelBorder: {
    position: 'absolute',
    width: TOTAL_SIZE,
    height: TOTAL_SIZE,
    borderRadius: TOTAL_SIZE / 2,
    borderWidth: BORDER_WIDTH,
    //borderColor: '#F074BA',
    borderColor: '#FFFFFFC0',
    zIndex: 1,
  },
  wheel: {
    position: 'absolute',
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    zIndex: 2,
  },
  centerButton: {
    position: 'absolute',
    width: WHEEL_SIZE * 0.4,
    height: WHEEL_SIZE * 0.4,
    borderRadius: (WHEEL_SIZE * 0.4) / 2,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  centerText: {
    color: '#003340',
    fontSize: 18,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
});
