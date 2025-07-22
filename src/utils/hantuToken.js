import { API_BASE_URL } from './apiConfig';

let isTokenRefreshing = false;
let tokenRefreshPromise = null;
let lastTokenTime = null;

const TOKEN_EXPIRY_HOURS = 6;
const TOKEN_REFRESH_MARGIN_MINUTES = 30; // 만료 30분 전에 미리 갱신

/**
 * 토큰이 만료되었는지 확인
 */
const isTokenExpired = () => {
  if (!lastTokenTime) return true;
  
  const now = new Date();
  const tokenAge = (now - lastTokenTime) / (1000 * 60 * 60); // 시간 단위
  const shouldRefresh = tokenAge >= (TOKEN_EXPIRY_HOURS - TOKEN_REFRESH_MARGIN_MINUTES / 60);
  
  console.log(`🕐 토큰 나이: ${tokenAge.toFixed(2)}시간, 갱신 필요: ${shouldRefresh}`);
  return shouldRefresh;
};

/**
 * 한국투자증권 토큰을 갱신하는 함수
 */
export const refreshHantuToken = async () => {
  // 이미 토큰 갱신 중이면 기다림
  if (isTokenRefreshing && tokenRefreshPromise) {
    console.log('🔄 이미 토큰 갱신 중... 대기');
    return await tokenRefreshPromise;
  }

  isTokenRefreshing = true;
  
  tokenRefreshPromise = (async () => {
    try {
      console.log('🔄 한국투자 토큰 갱신 시작');

      // 1. 기존 토큰 삭제 (GET 방식)
      console.log('🗑️ 기존 토큰 삭제 중...');
      const destroyResponse = await fetch(
        `${API_BASE_URL}trade_hantu/destroy_access_token/`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!destroyResponse.ok) {
        console.warn('⚠️ 토큰 삭제 실패, 계속 진행:', destroyResponse.status);
      } else {
        console.log('✅ 기존 토큰 삭제 완료');
      }

      // 잠시 대기 (API 제한 방지)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 2. 새 토큰 생성 (GET 방식)
      console.log('🔑 새 토큰 생성 중...');
      const issueResponse = await fetch(
        `${API_BASE_URL}trade_hantu/issue_access_token/`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!issueResponse.ok) {
        throw new Error(`토큰 생성 실패: ${issueResponse.status}`);
      }

      // 성공하면 시간 기록
      lastTokenTime = new Date();
      console.log('✅ 새 한국투자 토큰 생성 완료 at', lastTokenTime.toISOString());
      
      return { success: true, timestamp: lastTokenTime };
    } catch (error) {
      console.error('❌ 한국투자 토큰 갱신 실패:', error);
      return { success: false, error: error.message };
    } finally {
      isTokenRefreshing = false;
      tokenRefreshPromise = null;
    }
  })();

  return await tokenRefreshPromise;
};

/**
 * 한국투자 API 호출 시 토큰 오류를 자동으로 처리하는 래퍼 함수
 */
export const fetchWithHantuToken = async (url, options = {}, maxRetries = 2) => {
  // 토큰이 만료되었으면 미리 갱신
  if (isTokenExpired()) {
    console.log('⏰ 토큰 만료 예정, 미리 갱신');
    await refreshHantuToken();
  }

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 한국투자 API 호출 시도 ${attempt + 1}/${maxRetries + 1}: ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // 응답 확인
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.warn(`⚠️ JSON이 아닌 응답:`, text.substring(0, 100));
          return { success: true, data: { message: text } };
        }

        const data = await response.json();
        
        // 한국투자 API 특유의 오류 코드 확인
        if (data.rt_cd === '1') {
          // 토큰 관련 오류
          if (data.msg1?.includes('토큰') || data.msg1?.includes('token')) {
            throw new Error(`한국투자 토큰 오류: ${data.msg1}`);
          }
          // 기타 오류
          throw new Error(`한국투자 API 오류: ${data.msg1} (${data.msg_cd})`);
        }
        
        return { success: true, data };
      } else {
        // HTTP 오류
        let errorMessage = `HTTP 오류: ${response.status}`;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage += ` - ${JSON.stringify(errorData)}`;
          } else {
            const errorText = await response.text();
            errorMessage += ` - ${errorText.substring(0, 200)}`;
          }
        } catch (parseError) {
          errorMessage += ` (응답 파싱 불가)`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error(`❌ 시도 ${attempt + 1} 실패:`, error.message);
      lastError = error;

      // 토큰 관련 오류이고 재시도 가능한 경우
      const isTokenError = error.message.includes('토큰') || 
                          error.message.includes('token') ||
                          error.message.includes('만료');
      
      if (attempt < maxRetries && isTokenError) {
        console.log('🔄 토큰 오류 감지, 토큰 갱신 후 재시도');
        
        const refreshResult = await refreshHantuToken();
        if (!refreshResult.success) {
          console.error('❌ 토큰 갱신 실패, 재시도 중단');
          break;
        }
        
        // 토큰 갱신 후 잠시 대기
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      
      // 재시도 불가능한 오류이거나 최대 시도 횟수 도달
      break;
    }
  }

  return { success: false, error: lastError?.message || '알 수 없는 오류' };
};

/**
 * 앱 시작 시 토큰을 미리 갱신하는 함수
 */
export const initializeHantuToken = async () => {
  console.log('🚀 앱 시작: 한국투자 토큰 초기화');
  
  try {
    const result = await refreshHantuToken();
    if (result.success) {
      console.log('✅ 한국투자 토큰 초기화 완료');
    } else {
      console.warn('⚠️ 한국투자 토큰 초기화 실패:', result.error);
    }
    return result;
  } catch (error) {
    console.error('❌ 토큰 초기화 중 예외 발생:', error);
    return { success: false, error: error.message };
  }
};

/**
 * OAuth 토큰 상태 확인 (선택사항)
 */
export const checkOAuthToken = async () => {
  try {
    console.log('🔍 OAuth 토큰 상태 확인');
    
    const response = await fetch(
      `${API_BASE_URL}trade_hantu/oauth_token/`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (response.ok) {
      console.log('✅ OAuth 토큰 상태 정상');
      return { success: true };
    } else {
      console.warn('⚠️ OAuth 토큰 상태 이상:', response.status);
      return { success: false, status: response.status };
    }
  } catch (error) {
    console.error('❌ OAuth 토큰 확인 실패:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 주기적으로 토큰을 갱신하는 함수
 * 6시간마다 자동 갱신 (실제로는 5.5시간마다)
 */
export const scheduleTokenRefresh = () => {
  const intervalMinutes = (TOKEN_EXPIRY_HOURS - 0.5) * 60; // 5.5시간
  console.log(`⏰ ${intervalMinutes}분마다 토큰 갱신 스케줄 설정`);
  
  return setInterval(async () => {
    console.log('⏰ 정기 토큰 갱신 시작');
    await refreshHantuToken();
  }, intervalMinutes * 60 * 1000);
};

/**
 * 토큰 상태 정보 반환
 */
export const getTokenStatus = () => {
  if (!lastTokenTime) {
    return { hasToken: false, age: null, expired: true };
  }
  
  const age = (new Date() - lastTokenTime) / (1000 * 60 * 60); // 시간 단위
  const expired = age >= TOKEN_EXPIRY_HOURS;
  
  return {
    hasToken: true,
    age: age.toFixed(2),
    expired,
    lastRefresh: lastTokenTime.toISOString()
  };
}; 