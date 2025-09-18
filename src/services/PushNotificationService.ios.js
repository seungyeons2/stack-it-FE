// src/services/PushNotificationService.ios.js
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../utils/apiConfig";

// ============================
// 내부 유틸
// ============================
async function getOrCreateDeviceId() {
  const KEY = "deviceId";
  let id = await AsyncStorage.getItem(KEY);
  if (id) return id;

  const rand = Math.random().toString(36).slice(2, 10);
  const stamp = Date.now().toString(36);
  const model = (Device.modelId || "ios").toString().replace(/[^a-zA-Z0-9_-]/g, "");
  id = `ios-${model}-${stamp}-${rand}`;
  await AsyncStorage.setItem(KEY, id);
  return id;
}

async function saveLocalToken(token) {
  try {
    await AsyncStorage.setItem("pushToken", token);
  } catch {}
}
async function loadLocalToken() {
  try {
    return (await AsyncStorage.getItem("pushToken")) || null;
  } catch {
    return null;
  }
}

// ============================
// 서버 API 연동 (/api/push-tokens)
// ============================
async function uploadTokenToServer(token) {
  try {
    const deviceId = await getOrCreateDeviceId();
    const accessToken = await AsyncStorage.getItem("accessToken"); // 🔑 로그인 토큰

    // 🚀 서버에 저장할 body (문자열 그대로 ExponentPushToken[...] 포함)
    const body = {
      token, // ExponentPushToken[...] 형태 그대로
      deviceId,
      platform: "ios",
    };

    const res = await fetch(`${API_BASE_URL}api/push-tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.warn("[Push] 등록 실패:", res.status, await res.text());
      return false;
    }

    console.log("[Push] 등록 성공:", body);
    await saveLocalToken(token);
    return true;
  } catch (e) {
    console.warn("[Push] 등록 오류:", e?.message || e);
    return false;
  }
}

async function deleteTokenFromServer(token) {
  try {
    const accessToken = await AsyncStorage.getItem("accessToken");
    const res = await fetch(`${API_BASE_URL}api/push-tokens`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ token }),
    });

    if (!res.ok) {
      console.warn("[Push] 해제 실패:", res.status, await res.text());
      return false;
    }

    console.log("[Push] 해제 성공:", token);
    return true;
  } catch (e) {
    console.warn("[Push] 해제 오류:", e?.message || e);
    return false;
  }
}

// ============================
// 퍼블릭 API
// ============================
function getProjectId() {
  return (
    (Constants.easConfig && Constants.easConfig.projectId) ||
    (Constants.expoConfig?.extra?.eas?.projectId) ||
    null
  );
}

async function ensurePermissions() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return "granted";

  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return status;
}

// 앱 시작 시 토큰 등록
export async function registerExpoPushToken() {
  try {
    if (Platform.OS !== "ios") return { success: true, skipped: "not_ios" };
    if (!Device.isDevice) return { success: true, skipped: "simulator" };

    const perm = await ensurePermissions();
    if (perm !== "granted") return { success: true, skipped: "perm_denied" };

    const projectId = getProjectId();
    if (!projectId) return { success: true, skipped: "no_project_id" };

    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });

    console.log("📢 [Push] ExpoPushToken:", expoPushToken);

    const uploaded = await uploadTokenToServer(expoPushToken);
    return { success: true, expoPushToken, uploaded };
  } catch (e) {
    console.warn("[Push][ERR] registerExpoPushToken:", e?.message || String(e));
    return { success: false, error: e?.message || String(e) };
  }
}

// 로그아웃/탈퇴 시 토큰 해제
export async function unregisterPushToken() {
  try {
    let token = await loadLocalToken();

    if (!token && Device.isDevice && Platform.OS === "ios") {
      const projectId = getProjectId();
      if (projectId) {
        const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
        token = data;
      }
    }

    if (!token) {
      console.warn("[Push] 해제 스킵: 로컬 토큰 없음");
      return false;
    }

    const ok = await deleteTokenFromServer(token);
    if (ok) {
      await AsyncStorage.removeItem("pushToken");
    }
    return ok;
  } catch (e) {
    console.warn("[Push] unregister 오류:", e?.message || e);
    return false;
  }
}

// 알림 리스너
export function setupNotificationListeners() {
  const recvSub = Notifications.addNotificationReceivedListener((n) => {
    console.log("[Push][recv]:", n);
  });
  const respSub = Notifications.addNotificationResponseReceivedListener((r) => {
    console.log("[Push][tap]:", r);
  });

  return () => {
    Notifications.removeNotificationSubscription(recvSub);
    Notifications.removeNotificationSubscription(respSub);
  };
}
