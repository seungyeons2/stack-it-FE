// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

// const SignUp3Screen = ({ navigation }) => {
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [verificationCode, setVerificationCode] = useState('');
//   const [isVerified, setIsVerified] = useState(false);
//   const [sentCode, setSentCode] = useState(null); // 서버에서 발송된 코드

//   // ✅ 인증번호 전송
//   const handleSendCode = () => {
//     if (phoneNumber.length >= 10) {
//       const generatedCode = '123ABC'; // 실제 서버에서는 랜덤 생성
//       setSentCode(generatedCode);
//       console.log(`인증번호 발송: ${generatedCode}`);
//     } else {
//       alert('올바른 전화번호를 입력하세요.');
//     }
//   };

//   // ✅ 인증번호 확인
//   const handleVerifyCode = () => {
//     if (verificationCode === sentCode) {
//       setIsVerified(true);
//     } else {
//       alert('인증번호가 올바르지 않습니다.');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* 🔙 뒤로 가기 버튼 */}
//       <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//         <Text style={styles.backText}>{'<'}</Text>
//       </TouchableOpacity>

//       {/* 🏷 타이틀 */}
//       <Text style={styles.title}>전화번호를 입력해주세요.</Text>

//       {/* 📞 전화번호 입력 */}
//       <Text style={styles.label}>전화번호</Text>
//       <View style={styles.inputContainer}>
//         <TextInput
//           style={styles.input}
//           placeholder="010-1234-5678"
//           placeholderTextColor="#ccc"
//           keyboardType="phone-pad"
//           value={phoneNumber}
//           onChangeText={setPhoneNumber}
//         />
//         <TouchableOpacity style={styles.sendButton} onPress={handleSendCode}>
//           <Text style={styles.sendButtonText}>전송</Text>
//         </TouchableOpacity>
//       </View>

//       {/* 🔢 인증번호 입력 */}
//       <Text style={styles.label}>인증번호</Text>
//       <View style={styles.inputContainer}>
//         <TextInput
//           style={styles.input}
//           placeholder="인증번호 입력"
//           placeholderTextColor="#ccc"
//           value={verificationCode}
//           onChangeText={setVerificationCode}
//         />
//         <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyCode}>
//           <Text style={styles.verifyButtonText}>확인</Text>
//         </TouchableOpacity>
//       </View>

//       {/* ✅ 인증 성공 메시지 */}
//       {isVerified && <Text style={styles.successText}>인증 완료!</Text>}

//       {/* 🎉 완료 버튼 */}
//       <TouchableOpacity
//         style={[styles.completeButton, isVerified ? styles.activeButton : styles.disabledButton]}
//         disabled={!isVerified}
//       >
//         <Text style={styles.completeButtonText}>완료</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// // ✅ 스타일 정의
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#003340',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 30,
//   },

//   // 🔙 뒤로 가기 버튼
//   backButton: {
//     position: 'absolute',
//     top: 50,
//     left: 20,
//     zIndex: 10,
//   },
//   backText: {
//     fontSize: 36,
//     color: '#F074BA',
//   },

//   // 🏷 타이틀
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#F074BA',
//     position: 'absolute',
//     top: 150,
//     left: 30,
//   },

//   // 🏷 라벨
//   label: {
//     fontSize: 16,
//     color: '#F074BA',
//     alignSelf: 'flex-start',
//     marginTop: 10,
//     marginBottom: 10,
//   },

//   // 📞 입력 필드 스타일
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '100%',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     backgroundColor: '#f9f9f9',
//     marginBottom: 10,
//     paddingHorizontal: 10,
//   },
//   input: {
//     flex: 1,
//     height: 50,
//     fontSize: 16,
//     color: 'black',
//   },

//   // 📨 인증번호 전송 버튼
//   sendButton: {
//     width: 60,
//     height: 35,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#CCCDD0',
//     borderRadius: 16,
//     marginLeft: 10,
//   },
//   sendButtonText: {
//     fontSize: 14,
//     color: 'black',
//   },

//   // ✅ 인증번호 확인 버튼
//   verifyButton: {
//     width: 60,
//     height: 35,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#CCCDD0',
//     borderRadius: 16,
//     marginLeft: 10,
//   },
//   verifyButtonText: {
//     fontSize: 14,
//     color: 'black',
//   },

//   // 🎉 인증 완료 메시지
//   successText: {
//     fontSize: 14,
//     color: 'lightgreen',
//     marginBottom: 15,
//   },

//   // 🎉 완료 버튼
//   completeButton: {
//     width: '100%',
//     height: 50,
//     borderRadius: 8,
//     alignItems: 'center',
//     justifyContent: 'center',
//     position: 'absolute',
//     bottom: 80,
//   },

//   // ✅ 활성화된 버튼 (핑크)
//   activeButton: {
//     backgroundColor: '#F074BA',
//   },

//   // 🚫 비활성화된 버튼 (연핑크)
//   disabledButton: {
//     backgroundColor: '#F8C7CC',
//   },

//   completeButtonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });

// export default SignUp3Screen;
