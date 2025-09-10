// // src/services/PushNotificationService.ios.js
// import { Platform } from "react-native";
// import * as Device from "expo-device";
// import * as Notifications from "expo-notifications";
// import Constants from "expo-constants";

// export function setupNotificationListeners() {
//   const recvSub = Notifications.addNotificationReceivedListener((n) => {
//     console.log("[Push][recv]:", n);
//   });
//   const respSub = Notifications.addNotificationResponseReceivedListener((r) => {
//     console.log("[Push][tap]:", r);
//   });

//   return () => {
//     Notifications.removeNotificationSubscription(recvSub);
//     Notifications.removeNotificationSubscription(respSub);
//   };
// }

// function getProjectId() {
//   return (
//     (Constants.easConfig && Constants.easConfig.projectId) ||
//     (Constants.expoConfig?.extra?.eas?.projectId) ||
//     null
//   );
// }

// async function ensurePermissions() {
//   const { status: existing } = await Notifications.getPermissionsAsync();
//   if (existing === "granted") return "granted";

//   const { status } = await Notifications.requestPermissionsAsync({
//     ios: { allowAlert: true, allowBadge: true, allowSound: true },
//   });
//   return status;
// }

// export async function registerExpoPushToken() {
//   try {
//     if (Platform.OS !== "ios") throw new Error("iOS only");
//     if (!Device.isDevice) throw new Error("실기기 필요");

//     const perm = await ensurePermissions();
//     if (perm !== "granted") throw new Error("알림 권한 거부됨");

//     const projectId = getProjectId();
//     if (!projectId) throw new Error("EAS projectId 없음");

//     const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });

//     console.log("📢 [Push] ExpoPushToken:", expoPushToken);

//     return { success: true, expoPushToken }; // DB에 그대로 저장 (ExponentPushToken[...] 형태)
//   } catch (e) {
//     const msg = e?.message || String(e);
//     console.warn("[Push][ERR] registerExpoPushToken:", msg);
//     return { success: false, error: msg };
//   }
// }

//export const registerPushToken = registerExpoPushToken;


// src/services/PushNotificationService.ios.js
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

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

function getProjectId() {
  return (
    (Constants.easConfig && Constants.easConfig.projectId) ||
    (Constants.expoConfig?.extra?.eas?.projectId) ||
    null
  );
}

function pushEnabledByFlag() {
  // .env or app.json에서 끌 수 있게 (기본: 켬)
  // .env: EXPO_PUBLIC_PUSH_ENABLED=0  → 비활성화
  const v = process.env.EXPO_PUBLIC_PUSH_ENABLED;
  if (v === "0" || v === "false") return false;

  // app.json의 featureFlags도 지원 (선택)
  const ff = Constants.expoConfig?.extra?.featureFlags;
  if (ff && ff.pushEnabled === false) return false;
  return true;
}

async function ensurePermissions() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return "granted";
  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return status;
}

export async function registerExpoPushToken() {
  try {
    if (Platform.OS !== "ios") return { success: true, skipped: "not_ios" };

    // ⚠️ 시뮬레이터/플래그면 "바로 스킵" — 절대 throw 하지 않음
    if (!pushEnabledByFlag()) {
      console.log("[Push] skipped by flag");
      return { success: true, skipped: "flag" };
    }
    if (!Device.isDevice) {
      console.log("[Push] simulator: skip push token");
      return { success: true, skipped: "simulator" };
    }

    const perm = await ensurePermissions();
    if (perm !== "granted") return { success: true, skipped: "perm_denied" };

    const projectId = getProjectId();
    if (!projectId) return { success: true, skipped: "no_project_id" };

    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log("📢 [Push] ExpoPushToken:", expoPushToken);
    return { success: true, expoPushToken };
  } catch (e) {
    console.warn("[Push][ERR] registerExpoPushToken:", e?.message || String(e));
    // 실패해도 전체 앱 흐름은 막지 않음
    return { success: false, error: e?.message || String(e) };
  }
}

// 기존 호출부 호환
export const registerPushToken = registerExpoPushToken;

// (선택) 초기화 편의 함수: 핸들러만 설정하고, 토큰 등록은 백그라운드로
export function initializeNotifications() {
  console.log("[Push] initializeNotifications: start");

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  // 절대 await 하지 말 것! → 화면/네비게이션이 이걸 기다리면 '막힌 느낌'이 남
  registerExpoPushToken().then((res) => {
    if (res?.skipped) console.log("[Push] token register skipped:", res.skipped);
  }).catch((e) => {
    console.warn("[Push] token register error:", e);
  });
}
