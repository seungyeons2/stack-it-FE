// App.js
import "react-native-gesture-handler";
import React, { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import StackNavigator from "./src/navigation/StackNavigator";

// Push 서비스
import {
  setupNotificationListeners,
  registerExpoPushToken,
} from "./src/services/PushNotificationService";

const SHOW_WELCOME_ON_LAUNCH = true;

// ============================================
// 전역 Notification Handler
// ============================================
console.log("[Push] setNotificationHandler: init");
Notifications.setNotificationHandler({
  handleNotification: async () => {
    console.log("[Push] handleNotification called (foreground display enabled)");
    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

export default function App() {
  const navigationRef = useRef(null);
  const cleanupRef = useRef(null);
  const localListeners = useRef({ received: null, response: null });
  const shownWelcomeRef = useRef(false);

  useEffect(() => {
    let timer;

    const initializeNotifications = async () => {
      console.log("[Push] initializeNotifications: start");
      console.log("[Push] Platform:", Platform.OS);

      if (Platform.OS !== "ios") {
        console.log("[Push] (skipped) iOS 전용 로직. 현재:", Platform.OS);
        return;
      }

      if (!Device.isDevice) {
        console.log("[Push][WARN] 시뮬레이터는 원격 푸시 수신 불가. 실기기 필요.");
        return;
      }

      // ===== 권한 확인 =====
      try {
        const existing = await Notifications.getPermissionsAsync();
        console.log("[Push] permissions(existing):", existing?.status, existing);
        if (existing.status !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync({
            ios: { allowAlert: true, allowSound: true, allowBadge: true },
          });
          console.log("[Push] permission after request:", status);
          if (status !== "granted") {
            console.warn("[Push] permission denied; skip token");
            return;
          }
        }
      } catch (e) {
        console.log("[Push][ERR] getPermissionsAsync failed:", e?.message || e);
        return;
      }

      // ===== 리스너 등록 =====
      console.log("[Push] setupNotificationListeners() 호출");
      const serviceCleanup = setupNotificationListeners?.();
      cleanupRef.current = serviceCleanup;

      try {
        if (!localListeners.current.received) {
          localListeners.current.received =
            Notifications.addNotificationReceivedListener((n) => {
              try {
                console.log(
                  "[Push][recv] (fg) notification:",
                  JSON.stringify(n, null, 2)
                );
              } catch {
                console.log("[Push][recv] (fg) notification received");
              }
            });
        }
        if (!localListeners.current.response) {
          localListeners.current.response =
            Notifications.addNotificationResponseReceivedListener((r) => {
              try {
                console.log("[Push][tap] response:", JSON.stringify(r, null, 2));
              } catch {
                console.log("[Push][tap] notification tapped");
              }
            });
        }
      } catch (e) {
        console.log("[Push][ERR] add listeners failed:", e?.message || e);
      }

      // ===== 토큰 발급 + 서버 업서트 =====
      try {
        console.log("[Push] registerExpoPushToken() 호출");
        const res = await registerExpoPushToken();
        console.log("[Push] registerExpoPushToken() result:", res);

        if (res?.success && res?.expoPushToken) {
          console.log("✅ [Push] ExpoPushToken:", res.expoPushToken);
        } else {
          console.warn("❌ [Push] Expo 토큰 발급 실패:", res?.error);
        }
      } catch (e) {
        console.warn("[Push][ERR] registerExpoPushToken error:", e?.message || e);
      }

      // ===== 환영 배너 =====
      if (SHOW_WELCOME_ON_LAUNCH && !shownWelcomeRef.current) {
        shownWelcomeRef.current = true;
        try {
          const now = new Date();
          const time = new Intl.DateTimeFormat("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          }).format(now);
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "👋 환영합니다!",
              body: `${time} 접속했습니다.`,
              data: { _meta: "welcome" },
              sound: "default",
            },
            trigger: null,
          });
        } catch (e) {
          console.log("[Push][ERR] schedule welcome failed:", e?.message || e);
        }
      }

      console.log("[Push] initializeNotifications: done");
    };

    timer = setTimeout(initializeNotifications, 500);

    return () => {
      clearTimeout(timer);
      try {
        cleanupRef.current?.();
      } catch {}
      try {
        if (localListeners.current.received) {
          Notifications.removeNotificationSubscription(localListeners.current.received);
          localListeners.current.received = null;
        }
        if (localListeners.current.response) {
          Notifications.removeNotificationSubscription(localListeners.current.response);
          localListeners.current.response = null;
        }
      } catch {}
      console.log("[Push] cleanup completed");
    };
  }, []);

  return (
    <NavigationContainer
      ref={(r) => {
        navigationRef.current = r;
        if (r) console.log("[Nav] navigationRef ready");
      }}
    >
      <StackNavigator />
    </NavigationContainer>
  );
}
