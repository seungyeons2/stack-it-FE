// src/services/PushNotificationService.ios.js
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/apiConfig';
import { getNewAccessToken } from '../utils/token';

// iOS: 포그라운드에서도 배너/사운드/배지 표시
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const DEVICE_ID_KEY = 'deviceId';
const PUSH_TOKEN_KEY = 'pushToken';
const generateDeviceId = () =>
  `ios-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

export async function registerPushToken(navigation) {
  try {
    if (!Device.isDevice) {
      console.log('⚠️ 시뮬레이터에서는 푸시 알림이 제한될 수 있어요.');
    }

    // 권한 확인/요청
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('알림 권한이 필요합니다', '설정 > 알림에서 허용해 주세요.');
      return false;
    }

    // EAS projectId (Dev Client/빌드에서 자동 노출)
    const projectId =
      Constants?.easConfig?.projectId ??
      Constants?.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      console.warn('❌ projectId가 없습니다. app.json의 extra.eas.projectId를 확인하세요.');
      return false;
    }

    // Expo Push Token 발급 (ExponentPushToken[...])
    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log('🍎 Expo Push Token(iOS):', expoPushToken);

    // deviceId 준비
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = generateDeviceId();
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }

    // 서버 등록
    const ok = await sendTokenToServer(expoPushToken, deviceId, navigation);
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, expoPushToken);
    if (!ok) console.warn('⚠️ 서버 등록 실패(로컬 저장은 완료)');

    return true;
  } catch (e) {
    console.error('푸시 토큰 등록 실패:', e);
    return false;
  }
}

async function sendTokenToServer(token, deviceId, navigation) {
  try {
    const accessToken = await getNewAccessToken(navigation);
    if (!accessToken) {
      console.error('❌ 액세스 토큰 없음');
      return false;
    }

    const res = await fetch(`${API_BASE_URL}api/push-tokens/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        token,                 // ExponentPushToken[...]
        deviceId,
        platform: 'ios',       // iOS 고정
      }),
    });

    const ct = res.headers.get('content-type') || '';
    const json = ct.includes('application/json') ? await res.json().catch(() => null) : null;

    if (res.ok && json?.ok) {
      console.log('✅ 토큰 서버 등록 성공:', json.created ? '신규' : '기존');
      return true;
    } else {
      const text = !json ? (await res.text().catch(() => '')).slice(0, 200) : '';
      console.warn('❌ 서버 등록 실패:', res.status, json || text);
      return false;
    }
  } catch (e) {
    console.error('❌ 서버 전송 오류:', e);
    return false;
  }
}

export async function unregisterPushToken(navigation) {
  try {
    const stored = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    if (!stored) {
      console.log('📱 등록된 토큰 없음');
      return true;
    }
    const accessToken = await getNewAccessToken(navigation);

    const res = await fetch(`${API_BASE_URL}api/push-tokens/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ token: stored }),
    });

    await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
    console.log(res.ok ? '✅ 토큰 해제 완료' : '⚠️ 서버 해제 실패(로컬 제거 완료)');
    return true;
  } catch (e) {
    await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
    console.warn('토큰 해제 중 오류(로컬 제거 완료):', e);
    return true;
  }
}

export function setupNotificationListeners(navigation) {
  // 포그라운드 수신
  const subRecv = Notifications.addNotificationReceivedListener((n) => {
    console.log('📥(iOS) 포그라운드 수신:', n?.request?.content);
    // 필요 시: 공지 자동 이동 등
  });

  // 탭(백그라/종료 → 복귀)
  const subResp = Notifications.addNotificationResponseReceivedListener((r) => {
    const data = r?.notification?.request?.content?.data || {};
    console.log('👆(iOS) 알림 탭:', data);
    if (data?.screen && navigation?.navigate) {
      navigation.navigate(data.screen, data.params || {});
    } else if (data?.type === 'notice') {
      navigation?.navigate?.('NoticeScreen');
    }
  });

  // 콜드 스타트 딥링크 처리
  Notifications.getLastNotificationResponseAsync().then((initial) => {
    const data = initial?.notification?.request?.content?.data;
    if (data?.screen && navigation?.navigate) {
      navigation.navigate(data.screen, data.params || {});
    }
  });

  return () => {
    subRecv && Notifications.removeNotificationSubscription(subRecv);
    subResp && Notifications.removeNotificationSubscription(subResp);
  };
}
