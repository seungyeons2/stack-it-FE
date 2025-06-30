import { getNewAccessToken } from "./token";
import { API_BASE_URL } from "./apiConfig";

/**
 * 관심 주식 목록 가져오기 함수
 */
export const fetchFavoriteStocks = async (navigation) => {
  try {
    const accessToken = await getNewAccessToken(navigation);
    if (!accessToken) {
      console.error("액세스 토큰이 없습니다.");
      return [];
    }

    console.log("관심 주식 목록 요청 완료");

    // 조회 API  [[[수정예정]]]
    const response = await fetch(`${API_BASE_URL}stocks/favorites/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    // 일단 로그만 출력.  [[[수정예정]]]
    console.log("🔍 [가상 API] 관심 주식 조회 API 호출됨");

    // 목데이터 [[[수정예정]]]
    const mockFavoriteStocks = [
      {
        id: 1,
        name: "뱅가드 토탈 미국 주식 ETF",
        symbol: "VTI",
        price: "429,710",
        change: "+0.03",
        isFavorite: true,
      },
      {
        id: 2,
        name: "스포티파이 테크놀로지",
        symbol: "SPOT",
        price: "692,438",
        change: "+0.75",
        isFavorite: true,
      },
    ];

    console.log("관심 주식 목록 조회 성공:", mockFavoriteStocks.length + "개");
    return mockFavoriteStocks;
  } catch (error) {
    console.error("관심 주식 목록 요청 실패:", error);
    return [];
  }
};

/**
 * 관심 주식 등록 함수
 */
export const addToFavorites = async (navigation, stockInfo) => {
  try {
    const accessToken = await getNewAccessToken(navigation);
    if (!accessToken) {
      console.error("액세스 토큰이 없습니다.");
      return false;
    }

    console.log("⭐ 관심 주식 등록 요청 완료!");
    console.log("종목:", stockInfo);

    //  [[[수정예정]]]
    const response = await fetch(`${API_BASE_URL}stocks/favorites/add/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stock_symbol: stockInfo.symbol,
        stock_name: stockInfo.name,
      }),
    });

    // 로그 [[[수정예정]]]
    console.log("🔍 [가상 API] 관심 주식 등록 API 호출됨");

    console.log("관심 주식 등록 성공:", stockInfo.name);
    return true;
  } catch (error) {
    console.error("관심 주식 등록 실패:", error);
    return false;
  }
};

/**
 * 관심 주식 해제 함수
 */
export const removeFromFavorites = async (navigation, stockInfo) => {
  try {
    const accessToken = await getNewAccessToken(navigation);
    if (!accessToken) {
      console.error("❌ 액세스 토큰이 없습니다.");
      return false;
    }

    console.log("관심 주식 해제 요청 완료!");
    console.log("종목 정보:", stockInfo);

    //  [[[수정예정]]]
    const response = await fetch(`${API_BASE_URL}stocks/favorites/remove/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stock_symbol: stockInfo.symbol,
      }),
    });

    // 로그  [[[수정예정]]]
    console.log("🔍 [가상 API] 관심 주식 해제 API 호출됨");
    console.log("관심 주식 해제 성공:", stockInfo.name);
    return true;
  } catch (error) {
    console.error("관심 주식 해제 실패:", error);
    return false;
  }
};
