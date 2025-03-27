import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from 'react-native';

import { getNewAccessToken } from '../../utils/token';
import { fetchUserInfo } from '../../utils/user';
import { updateUserInfo } from '../../utils/user';


const EditUserInfoScreen = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const accessToken = await getNewAccessToken(navigation);
        if (!accessToken) {
          Alert.alert('인증 만료', '다시 로그인해주세요.');
          navigation.navigate('Login');
          return;
        }

        await fetchUserInfo(navigation, setUserInfo);
      } catch (err) {
        Alert.alert('오류', '사용자 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleEdit = (field, value) => {
    setEditingField(field);
    setEditValue(value);
  };

  const saveEdit = async () => {
    if (editingField) {
      const trimmed = editValue?.trim();
      if (trimmed === userInfo[editingField]) {
        // 값이 안 바뀌었으면 서버 요청 안 보냄
        setEditingField(null);
        return;
      }
  
      const success = await updateUserInfo(navigation, {
        [editingField]: trimmed,
      });
  
      if (success) {
        setUserInfo((prev) => ({
          ...prev,
          [editingField]: trimmed,
        }));
      } else {
        Alert.alert('수정 실패', '정보 수정 중 오류가 발생했습니다.');
      }
  
      setEditingField(null);
      setEditValue('');
      Keyboard.dismiss();
    }
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

      <View style={styles.profileSection}>
        <Image
          source={
            userInfo?.profileImage
              ? { uri: userInfo.profileImage }
              : require('../../assets/profile.png')
          }
          style={styles.profileImage}
        />
        <Text style={styles.userName}>{userInfo?.nickname || '개굴개굴 개구리'}</Text>
      </View>

      <ScrollView>
        {renderEditableItem('nickname', '닉네임', userInfo?.nickname)}
        {renderEditableItem('gender', '성별', userInfo?.gender === 'male' ? '남자' : userInfo?.gender === 'female' ? '여자' : '미등록')}
        {renderEditableItem('birthdate', '생일', userInfo?.birthdate)}
        {renderEditableItem('email', '이메일', userInfo?.email)}
        {renderEditableItem('address', '주소', userInfo?.address)}
      </ScrollView>
    </View>
  );

  function renderEditableItem(field, label, value) {
    const isEditing = editingField === field;

    return (
      <TouchableOpacity onPress={() => handleEdit(field, value)} activeOpacity={0.8}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>{label}:</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editValue}
              onChangeText={setEditValue}
              onBlur={saveEdit}
              onSubmitEditing={saveEdit}
              autoFocus
              returnKeyType="done"
            />
          ) : (
            <Text style={styles.infoValue}>{value || '미등록'}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
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
  profileSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#F074BA',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8C7CC',
    marginTop: 10,
  },
  infoBox: {
    backgroundColor: '#D4DDEF30',
    padding: 18,
    borderRadius: 10,
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 15,
    color: '#A9C4D3',
    marginBottom: 10,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 3,
  },
  input: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F074BA',
    paddingVertical: 4,
  },
});

export default EditUserInfoScreen;
