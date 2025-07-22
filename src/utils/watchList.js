import { fetchWithAuth } from "./token";
import { API_BASE_URL } from "./apiConfig";

// 관심주식 가져오기
export const fetchWatchlist = async (navigation) => {
  try {
    console.log("⭐ 관심주식 목록 조회 시작");

    const response = await fetchWithAuth(
      `${API_BASE_URL}watchlist/list/`,
      {
        method: "GET",
      },
      navigation
    );

    const text = await response.text();
    console.log("관심주식 목록 응답:", text);

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    const data = JSON.parse(text);

    if (data.status === "success" && Array.isArray(data.watchlist)) {
      console.log("✅ 관심주식 목록 조회 성공:", data.watchlist.length + "개");
      return { success: true, watchlist: data.watchlist };
    } else {
      console.warn("⚠️ 예상치 못한 응답 형식:", data);
      return { success: false, watchlist: [] };
    }
  } catch (error) {
    console.error("❌ 관심주식 목록 조회 실패:", error);
    return { success: false, watchlist: [] };
  }
};

// 관심주식 추가

export const addToWatchlist = async (navigation, stockCode) => {
  try {
    console.log("⭐ 관심주식 추가 요청:", stockCode);

    const response = await fetchWithAuth(
      `${API_BASE_URL}watchlist/add/?stock_code=${stockCode}`,
      {
        method: "POST",
      },
      navigation
    );

    const text = await response.text();
    console.log("관심주식 추가 응답:", text);

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    const data = JSON.parse(text);

    if (data.status === "success") {
      console.log("✅ 관심주식 추가 성공:", data.message);
      return { success: true, message: data.message };
    } else {
      console.warn("⚠️ 관심주식 추가 실패:", data.message);
      return {
        success: false,
        message: data.message || "추가에 실패했습니다.",
      };
    }
  } catch (error) {
    console.error("❌ 관심주식 추가 실패:", error);
    return {
      success: false,
      message: error.message || "네트워크 오류가 발생했습니다.",
    };
  }
};

// 관심주식 삭제

export const removeFromWatchlist = async (navigation, stockCode) => {
  try {
    console.log("🗑️ 관심주식 제거 요청:", stockCode);

    const response = await fetchWithAuth(
      `${API_BASE_URL}watchlist/remove/?stock_code=${stockCode}`,
      {
        method: "DELETE",
      },
      navigation
    );

    const text = await response.text();
    console.log("관심주식 제거 응답:", text);

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    const data = JSON.parse(text);

    if (data.status === "success") {
      console.log("✅ 관심주식 제거 성공:", data.message);
      return { success: true, message: data.message };
    } else {
      console.warn("⚠️ 관심주식 제거 실패:", data.message);
      return {
        success: false,
        message: data.message || "제거에 실패했습니다.",
      };
    }
  } catch (error) {
    console.error("❌ 관심주식 제거 실패:", error);
    return {
      success: false,
      message: error.message || "네트워크 오류가 발생했습니다.",
    };
  }
};

// 관심종목 여부 확인

export const isInWatchlist = async (navigation, stockCode) => {
  try {
    const result = await fetchWatchlist(navigation);

    if (result.success) {
      const isFound = result.watchlist.some(
        (item) => item.symbol === stockCode
      );
      return isFound;
    }

    return false;
  } catch (error) {
    console.error("❌ 관심주식 확인 실패:", error);
    return false;
  }
};
