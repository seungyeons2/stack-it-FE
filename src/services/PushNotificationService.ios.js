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
    if (Platform.OS !== "ios") throw new Error("iOS only");
    if (!Device.isDevice) throw new Error("실기기 필요");

    const perm = await ensurePermissions();
    if (perm !== "granted") throw new Error("알림 권한 거부됨");

    const projectId = getProjectId();
    if (!projectId) throw new Error("EAS projectId 없음");

    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });

    console.log("📢 [Push] ExpoPushToken:", expoPushToken);

    return { success: true, expoPushToken }; // DB에 그대로 저장 (ExponentPushToken[...] 형태)
  } catch (e) {
    const msg = e?.message || String(e);
    console.warn("[Push][ERR] registerExpoPushToken:", msg);
    return { success: false, error: msg };
  }
}
