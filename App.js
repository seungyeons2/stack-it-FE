// App.js
import "react-native-gesture-handler";
import React, { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import StackNavigator from "./src/navigation/StackNavigator";

// Push 서비스 (Promise 체인 버전)
import {
  setupNotificationListeners,
  registerExpoPushToken,
} from "./src/services/PushNotificationService";

// ============================================
// 전역 Notification Handler (iOS 포그라운드 배너/리스트/사운드/배지)
// ============================================
console.log("[Push] setNotificationHandler: init");
Notifications.setNotificationHandler({
  handleNotification: async () => {
    console.log("[Push] handleNotification called (foreground display enabled)");
    return {
      // 최신 Expo SDK 권장 플래그
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

  // 로컬 디버그용 리스너(수신/탭 로그)
  const localListeners = useRef({ received: null, response: null });

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

      if (!navigationRef.current) {
        console.log("[Push] navigationRef not ready yet");
        // 굳이 필요하진 않지만, 네비 객체를 쓰려면 준비될 때까지 대기
      }

      // ===== 권한 =====
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

      console.log("[Push] setupNotificationListeners() 호출");
      const serviceCleanup = setupNotificationListeners?.();
      cleanupRef.current = serviceCleanup;

      // 추가: 로컬 로그 리스너
      try {
        if (!localListeners.current.received) {
          localListeners.current.received =
            Notifications.addNotificationReceivedListener((n) => {
              try {
                console.log("[Push][recv] (fg) notification:", JSON.stringify(n, null, 2));
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

      // ===== Expo Push Token 발급 (로그만) =====
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

      // ===== 로컬 알림 한 번(핸들러 점검) =====
      try {
        console.log("[Push] schedule local test notification (immediate)");
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "🔔 로컬 테스트",
            body: "배너가 보이면 handler OK",
            data: { _debug: "local_test" },
            sound: "default",
          },
          trigger: null,
        });
      } catch (e) {
        console.log("[Push][ERR] schedule local test failed:", e?.message || e);
      }

      console.log("[Push] initializeNotifications: done");
    };

    // 네비 ref가 잡히도록 약간 지연 후 초기화
    timer = setTimeout(initializeNotifications, 500);

    return () => {
      clearTimeout(timer);
      try {
        cleanupRef.current?.(); // 서비스 리스너 해제
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
