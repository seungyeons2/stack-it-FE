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
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Svg, { G, Path, Text as SvgText, Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { increaseBalance } from '../../utils/point';

const { width, height } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.8;
const BORDER_WIDTH = 8;
const TOTAL_SIZE = WHEEL_SIZE + BORDER_WIDTH * 2;
const RADIUS = WHEEL_SIZE / 2;
const SEGMENTS = 8;
const SEGMENT_ANGLE = 360 / SEGMENTS;

const prizes = [
  { amount: '10만원', value: 100000, display: '10만' },
  { amount: '5만원', value: 50000, display: '5만' },
  { amount: '3만원', value: 30000, display: '3만' },
  { amount: '20만원', value: 200000, display: '20만' },
  { amount: '30만원', value: 300000, display: '30만' },
  { amount: '3만원', value: 30000, display: '3만' },
  { amount: '15만원', value: 150000, display: '15만' },
  { amount: '8만원', value: 80000, display: '8만' },
];

// 세련된 그라데이션 색상 팔레트
const segmentColors = [
  '#F074BA', // 메인 핑크
  '#335696', // 메인 블루
  '#FF6B9D', // 밝은 핑크
  '#4A90E2', // 밝은 블루
  '#E91E63', // 진한 핑크
  '#2196F3', // 진한 블루
  '#FF8A80', // 코랄 핑크
  '#64B5F6', // 스카이 블루
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
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [spinning, setSpinning] = useState(false);
  const barHeight = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

  // 펄스 애니메이션 효과
  React.useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (!spinning) pulse();
      });
    };
    pulse();
  }, [spinning]);

  const spinWheel = async () => {
    if (spinning) return;
    setSpinning(true);
    
    // 펄스 애니메이션 중지
    pulseAnim.setValue(1);
    
    const rounds = Math.floor(Math.random() * 3) + 4; // 4-6바퀴
    const idx = Math.floor(Math.random() * SEGMENTS);
    const deg = rounds * 360 + idx * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;

    Animated.timing(spinAnim, {
      toValue: deg,
      duration: 4000, // 4초로 늘림
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // 부드러운 이징
      useNativeDriver: true,
    }).start(async () => {
      const final = deg % 360;
      const selected = SEGMENTS - Math.floor(final / SEGMENT_ANGLE) - 1;
      const prize = prizes[selected];
      
      try {
        const msg = await increaseBalance(navigation, prize.value);
        // 성공 시
        Alert.alert('🎉 축하합니다!', `${prize.amount} 당첨!\n\n${msg}`, [
          { text: '확인', style: 'default' }
        ]);
      } catch (error) {
        // 모든 에러를 조용히 처리
        Alert.alert(
          '⏰ 오늘의 기회 소진', 
          '룰렛은 하루에 한 번만 도전 가능합니다.\n내일 다시 도전해보세요! 🍀', 
          [{ text: '확인', style: 'default' }]
        );
      } finally {
        setSpinning(false);
        spinAnim.setValue(final);
      }
    });
  };

  const rotate = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      
      {/* 배경 그라데이션 */}
      <View style={styles.backgroundGradient} />
      
      <SafeAreaView style={styles.safeArea}>
        {/* 헤더 */}
        <View style={[styles.header, { paddingTop: barHeight }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="chevron-left" size={28} color="#EFF1F5" />
          </TouchableOpacity>
          <Text style={styles.title}>데일리 룰렛</Text>
          <View style={styles.headerRight} />
        </View>

        {/* 부제목 */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>매일 한 번의 특별한 기회</Text>
          <Text style={styles.description}>운을 시험해보세요! 🍀</Text>
        </View>

        {/* 룰렛 컨테이너 */}
        <View style={styles.wheelContainer}>
          {/* 외부 장식 링 */}
          <View style={styles.outerRing} />
          
          {/* 포인터 */}
          <View style={styles.pointerContainer}>
            <View style={styles.pointer} />
            <View style={styles.pointerShadow} />
          </View>

          {/* 룰렛 휠 */}
          <Animated.View 
            style={[
              styles.wheelWrapper,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <View style={styles.wheelBorder} />
            <AnimatedSvg
              width={WHEEL_SIZE}
              height={WHEEL_SIZE}
              style={[styles.wheel, { transform: [{ rotate }] }]}
            >
              <Defs>
                {segmentColors.map((color, index) => (
                  <RadialGradient
                    key={index}
                    id={`gradient${index}`}
                    cx="50%"
                    cy="50%"
                    r="50%"
                  >
                    <Stop offset="0%" stopColor={color} stopOpacity="1" />
                    <Stop offset="100%" stopColor={color} stopOpacity="0.8" />
                  </RadialGradient>
                ))}
              </Defs>
              <G>
                {prizes.map((prize, i) => {
                  const start = i * SEGMENT_ANGLE;
                  const end = start + SEGMENT_ANGLE;
                  const path = describeArc(RADIUS, RADIUS, RADIUS - 2, start, end);
                  const fill = `url(#gradient${i})`;
                  const mid = start + SEGMENT_ANGLE / 2;
                  const angleRad = ((mid - 90) * Math.PI) / 180;
                  const tx = RADIUS + RADIUS * 0.7 * Math.cos(angleRad);
                  const ty = RADIUS + RADIUS * 0.7 * Math.sin(angleRad);
                  
                  return (
                    <G key={i}>
                      <Path d={path} fill={fill} stroke="#FFFFFF" strokeWidth="2" />
                      <SvgText
                        x={tx}
                        y={ty - 5}
                        fill="#FFFFFF"
                        fontSize="16"
                        fontWeight="bold"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        transform={`rotate(${mid} ${tx} ${ty})`}
                      >
                        {prize.display}
                      </SvgText>
                      <SvgText
                        x={tx}
                        y={ty + 10}
                        fill="#FFFFFF"
                        fontSize="12"
                        fontWeight="normal"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        transform={`rotate(${mid} ${tx} ${ty})`}
                        opacity="0.9"
                      >
                        원
                      </SvgText>
                    </G>
                  );
                })}
              </G>
            </AnimatedSvg>

            {/* 중앙 버튼 */}
            <TouchableOpacity
              style={[styles.centerButton, spinning && styles.centerButtonDisabled]}
              onPress={spinWheel}
              disabled={spinning}
              activeOpacity={0.8}
            >
              <View style={styles.centerButtonInner}>
                {spinning ? (
                  <>
                    <MaterialIcon name="sync" size={32} color="#003340" />
                    <Text style={styles.centerButtonText}>돌리는 중...</Text>
                  </>
                ) : (
                  <>
                    <MaterialIcon name="play-arrow" size={36} color="#003340" />
                    <Text style={styles.centerButtonText}>START</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* 하단 정보 */}
        <View style={styles.bottomInfo}>
          <View style={styles.infoCard}>
            <MaterialIcon name="info-outline" size={20} color="#F074BA" />
            <Text style={styles.infoText}>하루 한 번 무료로 도전 가능</Text>
          </View>
          <View style={styles.infoCard}>
            <MaterialIcon name="stars" size={20} color="#F074BA" />
            <Text style={styles.infoText}>최대 30만원까지 획득</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003340',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
    backgroundColor: '#003340',
    opacity: 0.95,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
    marginTop: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 241, 245, 0.1)',
    borderRadius: 22,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EFF1F5',
    textAlign: 'center',
  },
  headerRight: {
    width: 44,
  },
  subtitleContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 18,
    color: '#F074BA',
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: 'rgba(239, 241, 245, 0.8)',
    fontWeight: '400',
  },
  wheelContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerRing: {
    position: 'absolute',
    width: TOTAL_SIZE + 20,
    height: TOTAL_SIZE + 20,
    borderRadius: (TOTAL_SIZE + 20) / 2,
    borderWidth: 3,
    borderColor: 'rgba(240, 116, 186, 0.3)',
    backgroundColor: 'rgba(240, 116, 186, 0.05)',
  },
  pointerContainer: {
    position: 'absolute',
    top: -25,
    zIndex: 10,
  },
  pointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 40,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#F074BA',
  },
  pointerShadow: {
    position: 'absolute',
    top: 2,
    left: -13,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 13,
    borderRightWidth: 13,
    borderBottomWidth: 36,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(0, 0, 0, 0.2)',
    zIndex: -1,
  },
  wheelWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelBorder: {
    position: 'absolute',
    width: TOTAL_SIZE,
    height: TOTAL_SIZE,
    borderRadius: TOTAL_SIZE / 2,
    borderWidth: BORDER_WIDTH,
    borderColor: '#EFF1F5',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  wheel: {
    position: 'absolute',
  },
  centerButton: {
    position: 'absolute',
    width: WHEEL_SIZE * 0.35,
    height: WHEEL_SIZE * 0.35,
    borderRadius: (WHEEL_SIZE * 0.35) / 2,
    backgroundColor: '#EFF1F5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  centerButtonDisabled: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  centerButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonText: {
    color: '#003340',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  bottomInfo: {
    paddingHorizontal: 30,
    paddingBottom: 30,
    marginTop: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 241, 245, 0.05)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#F074BA',
  },
  infoText: {
    color: '#EFF1F5',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 12,
  },
});