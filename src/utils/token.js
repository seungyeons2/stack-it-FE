import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "./apiConfig";

// 저장된 토큰 가져오기
const getStoredAccessToken = async () => {
  try {
    const accessToken = await AsyncStorage.getItem("accessToken");
    return accessToken;
  } catch (error) {
    console.error("❌ 저장된 토큰 가져오기 실패:", error);
    return null;
  }
};

const refreshAccessToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem("refreshToken");

    if (!refreshToken) {
      console.log("📍 Refresh Token이 없음");
      return null;
    }

    console.log("🔄 Refresh Token으로 새 Access Token 요청");

    //  /api/token/refresh/ -> /sessions
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      console.log("❌ Refresh Token 갱신 실패:", response.status);
      return null;
    }

    const responseData = await response.json();

    if (responseData.status === "success" && responseData.data) {
      const { access, refresh, has_completed_tutorial } = responseData.data;

      await AsyncStorage.setItem("accessToken", access);
      if (refresh) {
        await AsyncStorage.setItem("refreshToken", refresh);
      }

      // + 튜토리얼 완료 여부
      await AsyncStorage.setItem(
        "hasCompletedTutorial",
        has_completed_tutorial.toString()
      );

      console.log("✅ Access Token 갱신 완료");
      return access;
    } else {
      console.log("❌ 응답 형식 오류:", responseData);
      return null;
    }
  } catch (error) {
    console.error("❌ Refresh Token 갱신 실패:", error);
    return null;
  }
};

const loginForNewToken = async (navigation) => {
  try {
    const email = await AsyncStorage.getItem("userEmail");
    const password = await AsyncStorage.getItem("userPassword");

    if (!email || !password) {
      console.error("❌ 저장된 로그인 정보 없음");
      if (navigation) {
        navigation.navigate("Login");
      }
      return null;
    }

    console.log("🔄 새로운 로그인으로 토큰 요청");

    // /api/token/ -> /sessions
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.LOGIN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      console.error("❌ 로그인 실패");
      if (navigation) {
        navigation.navigate("Login");
      }
      return null;
    }

    const responseData = await response.json();

    if (responseData.status === "success" && responseData.data) {
      const { access, refresh, has_completed_tutorial } = responseData.data;

      await AsyncStorage.setItem("accessToken", access);
      await AsyncStorage.setItem("refreshToken", refresh);

      // 튜토리얼 완료 여부
      await AsyncStorage.setItem(
        "hasCompletedTutorial",
        has_completed_tutorial.toString()
      );

      console.log("✅ 새 토큰 발급 및 저장 완료");
      return access;
    } else {
      console.log("❌ 응답 형식 오류:", responseData);
      return null;
    }
  } catch (error) {
    console.error("❌ 새 토큰 발급 실패:", error);
    if (navigation) {
      navigation.navigate("Login");
    }
    return null;
  }
};

// 메인 토큰 가져오기 함수
export const getNewAccessToken = async (navigation) => {
  try {
    // 1. 저장된 토큰이 있으면 사용
    let accessToken = await getStoredAccessToken();
    if (accessToken) {
      console.log("✅ 저장된 Access Token 사용");
      return accessToken;
    }

    // 2. 토큰이 없으면 Refresh Token으로 갱신 시도
    console.log("📍 저장된 Access Token이 없음, Refresh 시도");
    accessToken = await refreshAccessToken();
    if (accessToken) {
      return accessToken;
    }

    // 3. Refresh도 실패하면 새로운 로그인
    console.log("📍 Refresh Token도 실패, 새 로그인 시도");
    accessToken = await loginForNewToken(navigation);
    return accessToken;
  } catch (error) {
    console.error("❌ 토큰 획득 실패:", error);
    if (navigation) {
      navigation.navigate("Login");
    }
    return null;
  }
};

// 로그아웃 시 토큰 정리
export const clearTokens = async () => {
  try {
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    await AsyncStorage.removeItem("hasCompletedTutorial"); // 튜토리얼 여부도 정맇
    console.log("✅ 토큰 정리 완료");
  } catch (error) {
    console.error("❌ 토큰 정리 실패:", error);
  }
};

// 401 에러가 나면 자동으로 토큰 갱신
export const fetchWithAuth = async (url, options = {}, navigation = null) => {
  try {
    // 일단은 현재 토큰으로 요청
    let accessToken = await getStoredAccessToken();

    if (!accessToken) {
      // 토큰이 없으면 새로 발급
      accessToken = await getNewAccessToken(navigation);
      if (!accessToken) {
        throw new Error("토큰 발급 실패");
      }
    }

    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    // 401 에러면 토큰 갱신 후 재시도
    if (response.status === 401) {
      console.log("📍 401 에러 감지, 토큰 갱신 시도");

      accessToken = await refreshAccessToken();
      if (!accessToken) {
        // Refresh도 실패하면 새 로그인
        accessToken = await loginForNewToken(navigation);
        if (!accessToken) {
          throw new Error("토큰 갱신 실패");
        }
      }

      // 새 토큰으로 재시도
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
    }

    return response;
  } catch (error) {
    console.error("❌ 인증 API 호출 실패:", error);
    throw error;
  }
};

// + 튜토리얼 완료 여부 확인
export const getHasCompletedTutorial = async () => {
  try {
    const hasCompleted = await AsyncStorage.getItem("hasCompletedTutorial");
    return hasCompleted === "true";
  } catch (error) {
    console.error("❌ 튜토리얼 완료 여부 확인 실패:", error);
    return false;
  }
};

// + 튜토리얼 완료 상태 업데이트
export const setHasCompletedTutorial = async (completed) => {
  try {
    await AsyncStorage.setItem("hasCompletedTutorial", completed.toString());
    console.log(`✅ 튜토리얼 완료 상태 업데이트: ${completed}`);
  } catch (error) {
    console.error("❌ 튜토리얼 완료 상태 업데이트 실패:", error);
  }
};
