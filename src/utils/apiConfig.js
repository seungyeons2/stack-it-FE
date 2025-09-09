export const API_BASE_URL =
  "https://port-0-doodook-backend-lyycvlpm0d9022e4.sel4.cloudtype.app/";

// API 엔드포인트 정의
export const API_ENDPOINTS = {
  // 인증 관련
  LOGIN: "sessions/", // api/token/ -> sessions/
  //TOKEN_REFRESH: "api/token/refresh/",
  LOGOUT: "logout/",

  // 사용자 관련
  USER_ME: "users/me/",
  USER_ACCOUNT: "users/account/",
  USER_DELETE: "users/delete/",

  // 주식 검색 관련
  STOCK_AUTOCOMPLETE: "api/stock/autocomplete/",
  STOCK_SEARCH: "api/stock/search/",

  // 주식 가격 관련
  STOCK_PRICE: "trading/stock_price/", // ?stock_code={code}
  PRICE_CHANGE: "stocks/price_change/", // ?stock_code={code}
  DAILY_STOCK_PRICE: "stocks/daily_stock_price/", // ?stock_code={code}&start_date={date}&end_date={date}

  // 거래 관련
  PORTFOLIO: "trading/portfolio/",
  TRADE: "trading/trade/",

  // 자산 관련
  ASSET_SUMMARY: "api/asset/summary/",

  // 관심주식 관련
  WATCHLIST_LIST: "watchlist/list/",
  WATCHLIST_ADD: "watchlist/add/", // ?stock_code={code}
  WATCHLIST_REMOVE: "watchlist/remove/", // ?stock_code={code}

  // MBTI 관련
  MBTI_QUESTIONS: "mbti/questions/",
  MBTI_RESULT: "mbti/result/",
  MBTI_RESULT_DETAIL: "mbti/result/detail/",
  MBTI_RECOMMENDATIONS: "mbti/result/recommendations/",

  // 학습 가이드 관련
  GUIDES: "api/guides/", // {id}/
  ADVANCED_GUIDES: "api/advanced-guides/", // {id}/

  // 진행도 관련
  PROGRESS_LEVEL: "progress/level/", // {level}/
  PROGRESS_LEVEL_CONTENT: "progress/level/{level}/content/",
  PROGRESS_COMPLETE: "progress/complete/", // {level}/{content_index}/

  // 챗봇 관련
  CHATBOT: "api/v1/ai-chatbot/chat/",

  // 포인트 관련
  INCREASE_BALANCE: "point/increase_balance/",

  // 한국투자 토큰 관련
  HANTU_DESTROY_TOKEN: "trade_hantu/destroy_access_token/",
  HANTU_ISSUE_TOKEN: "trade_hantu/issue_access_token/",

  //푸시 토큰 관련
  PUSH_TOKENS: "api/push-tokens",

  // 공지/알림 전송 테스트
  ALERT_SEND: "alert/send/", // 뒤에 <id>/ 붙여서 사용
};

// 공통 fetch 함수
export const fetchAPI = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`📡 API 요청: ${url}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`⚠️ API 오류 (${endpoint}):`, error);
    return { success: false, error: error.message };
  }
};

// 인증이 필요한 API 호출을 위한 함수
export const fetchAuthAPI = async (endpoint, accessToken, options = {}) => {
  return fetchAPI(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });
};
