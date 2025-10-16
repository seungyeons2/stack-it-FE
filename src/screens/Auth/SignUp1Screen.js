import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import CheckBoxChecked from '../../components/CheckBoxChecked';
import CheckBoxUnchecked from '../../components/CheckBoxUnchecked';
import { useTheme } from "../../utils/ThemeContext";

const SignUp1Screen = ({ navigation }) => {
  const { theme } = useTheme();
  
  const [agreements, setAgreements] = useState({
    all: false,
    required1: false,
    required6: false,
    optional2: false,
  });

  const [expandedStates, setExpandedStates] = useState({
    required1: false,
    required6: false,
    optional2: false,
  });

  const termsData = {
    required1: {
      title: '[필수] 두둑 이용 약관',
      content: `**제1조 (목적)**
이 약관은 햄듭니다(이하 "회사")가 제공하는 '두둑(Doodook)' 서비스의 이용조건 및 절차, 회사와 회원 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.

**제2조 (정의)**
"서비스"란 사용자가 가상의 자산을 활용해 투자 시뮬레이션을 경험하고, 금융학습 및 포트폴리오 분석 기능을 이용할 수 있는 플랫폼을 의미합니다.
"회원"이란 본 약관에 동의하고 서비스에 가입한 자를 의미합니다.
"AI 챗봇"이란 OpenAI 기반 투자 정보 응답 기능을 말하며, 정보 제공 목적에 한정됩니다.

**제3조 (약관의 효력 및 변경)**
본 약관은 서비스 초기화면 또는 설정 화면 등에 게시하여 공지함으로써 효력을 발생합니다.
회사는 필요 시 관련 법령을 위배하지 않는 범위에서 약관을 개정할 수 있으며, 변경 시 사전 고지합니다.

**제4조 (회원가입 및 이용 계약 체결)**
회원가입은 만 14세 이상인 자에 한해 가능합니다.
사용자는 본인의 이메일 주소를 통해 계정을 생성해야 하며, 허위 정보 입력 시 이용이 제한될 수 있습니다.
회원가입 시 시스템에서 제공하는 인증 절차(이메일 토큰, 코드 인증 등)를 완료해야 합니다.

**제5조 (서비스의 제공 및 기능)**
회사는 다음과 같은 기능을 제공합니다:
- 가상의 금액으로 매수/매도 가능한 투자 시뮬레이션 기능
- 가상 포트폴리오 관리 및 수익률 조회
- 관심 종목 저장 및 종목 검색 기능
- 투자 성향 분석 테스트
- AI 챗봇을 통한 투자 정보 안내 (OpenAI 기반)
- 학습 가이드 기능 및 단계별 콘텐츠
- 주가 변동 등 주요 이벤트에 대한 푸시 알림 제공
- 외부 API 연동: 한국투자증권 API, OpenAI API 등

**제6조 (서비스 이용 조건)**
서비스는 무료로 제공되며, 유료 기능은 현재 제공되지 않습니다.
투자 시뮬레이션은 실제 주식 투자나 금융 자산 운용과는 무관하며, 정보 제공 및 학습 목적으로만 활용되어야 합니다.
AI 챗봇의 응답은 참고용으로만 제공되며, 특정 종목에 대한 투자 권유 또는 금융 자문에 해당하지 않습니다.

**제7조 (회원의 의무)**
회원은 서비스 이용 시 관계 법령, 본 약관의 규정, 회사의 안내사항 등을 준수해야 합니다.
회원은 본인의 계정을 제3자에게 양도하거나 공유할 수 없습니다.
서비스의 기능을 부정하게 이용하거나, 시스템을 비정상적으로 접근·변조하는 행위는 금지됩니다.

**제8조 (개인정보의 수집 및 보호)**
회사는 회원가입 및 서비스 제공에 필요한 최소한의 개인정보를 수집합니다.
수집 항목: 이메일, 닉네임, 생년월일, 성별, 주소, 잔고, 튜토리얼 진행 여부 등
개인정보는 암호화 및 보안 조치를 통해 안전하게 관리되며, 자세한 내용은 별도의 [개인정보처리방침]에 따릅니다.

**제9조 (계정 해지 및 데이터 삭제)**
회원은 언제든지 앱 내 제공되는 탈퇴 기능을 통해 계정을 삭제할 수 있습니다.
회원 탈퇴 시 해당 계정과 관련된 모든 데이터는 즉시 삭제됩니다. 단, 관련 법령에 따른 예외 보관 항목은 제외합니다.

**제10조 (서비스 변경 및 종료)**
회사는 기능 개선, 시스템 유지보수, 외부 정책 변경 등에 따라 서비스의 일부 또는 전부를 변경·중단할 수 있습니다.
서비스 종료 시 사전 고지하며, 회원 데이터는 관련 법령에 따라 안전하게 처리됩니다.

**제11조 (책임의 한계)**
회사는 회원이 서비스 내 제공된 정보를 바탕으로 실제 투자 결정을 내린 경우, 그에 따른 손실에 대해 책임지지 않습니다.
외부 API(한국투자증권, OpenAI 등)로부터 제공되는 데이터의 정확성 및 실시간성은 보장되지 않을 수 있습니다.

**제12조 (지식재산권)**
서비스 내 콘텐츠, 소스코드, UI 등 모든 저작권은 회사에 귀속됩니다.
회원은 회사의 명시적 허락 없이 콘텐츠를 복제, 전송, 배포, 가공, 판매할 수 없습니다.

**제13조 (분쟁 해결 및 준거법)**
회사와 회원 간 발생한 분쟁에 대해 원만한 해결을 위해 성실히 협의합니다.
분쟁이 해결되지 않을 경우, 대한민국 법령을 적용하며, 민사소송의 관할 법원은 서울중앙지방법원으로 합니다.

**부칙**
본 약관은 2025년 9월 30일부터 시행됩니다.`
    },
    required6: {
      title: '[필수] 만 14세 이상입니다.',
      content: `본 서비스는 만 14세 이상의 사용자만 이용할 수 있습니다.

**확인 사항**
- 만 14세 미만의 경우 법정대리인의 동의가 필요합니다.
- 허위 연령 정보 입력 시 서비스 이용이 제한될 수 있습니다.

**관련 법령**
「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」에 따른 만 14세 미만 아동의 개인정보 처리 제한 규정을 준수합니다.`
    },
    optional2: {
      title: '[선택] 광고성 정보 수신 동의',
      content: `**광고성 정보 수신 목적**
두둑 서비스의 새로운 기능이나 공지사항 업데이트 등의 정보를 Push 알림으로 보내드립니다.

**수신 방법**
- 앱 푸시 알림

**수신 거부**
- 기기 내 설정 > 두둑 앱 권한 설정에서 Push 알림을 허용하지 않습니다.

**동의 거부 시 불이익**
광고성 정보 수신에 동의하지 않아도 두둑 서비스의 기본 기능 이용에는 전혀 영향이 없습니다.`
    }
  };

  const toggleAll = () => {
    const newState = !agreements.all;
    setAgreements({
      all: newState,
      required1: newState,
      required6: newState,
      optional2: newState,
    });
    setExpandedStates({
      required1: false,
      required6: false,
      optional2: false,
    });
  };
  
  const toggleExpanded = (key) => {
    setExpandedStates(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleAgreement = (key) => {
    setAgreements((prevAgreements) => {
      const newAgreements = { ...prevAgreements, [key]: !prevAgreements[key] };
      newAgreements.all =
        newAgreements.required1 &&
        newAgreements.required6 &&
        newAgreements.optional2;
      return newAgreements;
    });
  };
  
  const handleAgreeAndCollapse = (key) => {
    if (!agreements[key]) {
      toggleAgreement(key);
    }
    setExpandedStates(prev => ({ ...prev, [key]: false }));
  };

  const handleCheckboxPress = (key) => {
    toggleAgreement(key); 
    setExpandedStates(prev => ({ ...prev, [key]: false })); 
  };

  const renderFormattedContent = (content) => {
    const parts = content.split('**');
    return (
      <Text style={[styles.termsText, { color: theme.text.primary }]}>
        {parts.map((part, index) =>
          index % 2 === 1 ? (
            <Text key={index} style={{ fontWeight: 'bold' }}>
              {part}
            </Text>
          ) : (
            part
          )
        )}
      </Text>
    );
  };

  const renderTermsItem = (key) => {
    const term = termsData[key];
    const isExpanded = expandedStates[key];
    const isChecked = agreements[key];

    return (
      <View key={key} style={styles.termsContainer}>
        <View style={[
          styles.agreeItem, 
          isExpanded ? styles.agreeItemExpanded : {},
          { backgroundColor: theme.background.card }
        ]}>
          <TouchableOpacity onPress={() => handleCheckboxPress(key)}>
            {isChecked ? <CheckBoxChecked /> : <CheckBoxUnchecked />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => toggleExpanded(key)} style={styles.titleContainer}>
            <Text style={[styles.agreeText, { color: theme.text.primary }]}>{term.title}</Text>
            <Text style={[styles.expandIcon, { color: theme.text.secondary }]}>
              {isExpanded ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {isExpanded && (
          <View style={[styles.termsContent, { backgroundColor: theme.background.secondary }]}>
            <ScrollView 
              style={styles.termsScrollView}
              nestedScrollEnabled={true} 
            >
              {renderFormattedContent(term.content)}
            </ScrollView>
            <TouchableOpacity 
              style={[styles.agreeButton, { backgroundColor: theme.button.primary }]}
              onPress={() => handleAgreeAndCollapse(key)}
            >
              <Text style={[styles.agreeButtonText, { color: theme.background.primary }]}>동의하기</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };
  
  const allRequiredAgreed = agreements.required1 && agreements.required6;

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={[styles.backText, { color: theme.accent.primary }]}>{'<'}</Text>
      </TouchableOpacity>
      
      <Text style={[styles.title, { color: theme.accent.primary }]}>이용 약관에{"\n"}동의해 주세요</Text>
      
      <TouchableOpacity onPress={toggleAll} style={[
        styles.allAgree,
        { borderBottomColor: theme.accent.primary }
      ]}>
        {agreements.all ? <CheckBoxChecked /> : <CheckBoxUnchecked />}
        <Text style={[styles.allAgreeText, { color: theme.accent.primary }]}>전체 동의</Text>
      </TouchableOpacity>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {Object.keys(termsData).map(key => renderTermsItem(key))}
      </ScrollView>
      
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: allRequiredAgreed ? theme.button.primary : theme.text.disabled }
        ]}
        disabled={!allRequiredAgreed}
        onPress={() => navigation.navigate('SignUp2')}
      >
        <Text style={[styles.buttonText, { color: theme.background.primary }]}>동의하기</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 30, 
  },
  backButton: {
    position: 'absolute',
    top: 30,
    left: 30,
    zIndex: 10,
  },
  backText: {
    fontSize: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 90, 
    marginBottom: 20,
  },
  allAgree: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 2,
    marginBottom: 10,
  },
  allAgreeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  scrollView: {
    flex: 1, 
    marginBottom: 20,
  },
  termsContainer: {
    marginBottom: 10,
  },
  agreeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 15,
    paddingHorizontal: 15,
  },
  agreeItemExpanded: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  agreeText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  expandIcon: {
    fontSize: 12,
    marginLeft: 10,
  },
  termsContent: {
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  termsScrollView: {
    maxHeight: 200, 
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  termsText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 15,
  },
  agreeButton: {
    marginHorizontal: 15,
    marginVertical: 15,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  agreeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SignUp1Screen;