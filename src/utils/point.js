import { fetchWithAuth } from "./token";
import { API_BASE_URL } from "./apiConfig";

export const increaseBalance = async (navigation, amount) => {
  try {
    console.log("💰 예수금 추가 요청:", amount);

    const response = await fetchWithAuth(
      `${API_BASE_URL}point/increase_balance/`,
      {
        method: "POST",
        body: JSON.stringify({ amount }),
      },
      navigation
    );

    const text = await response.text();
    console.log("예수금 추가 응답 본문:", text);

    // 400 에러(이미 사용함)의 경우 조용히 처리
    if (response.status === 400) {
      console.log("⏰ 룰렛 이미 사용함 - 하루 한 번 제한");
      // throw 하지 말고 Promise.reject로 조용히 처리
      return Promise.reject("already_used_today");
    }

    if (!response.ok) {
      console.log(`❌ API 호출 실패: ${response.status}`);
      return Promise.reject(`API 호출 실패: ${response.status}`);
    }

    const data = JSON.parse(text);

    if (data.status === "success") {
      return data.message;
    } else {
      console.log("❌ 서버 에러:", data.message);
      return Promise.reject(data.message || "알 수 없는 오류 발생");
    }
  } catch (err) {
    // 네트워크 에러나 기타 에러도 조용히 처리
    console.log("예수금 추가 실패 (조용히 처리):", err.message || err);
    
    // JSON 파싱 에러나 네트워크 에러의 경우
    if (err.message && err.message.includes('JSON')) {
      return Promise.reject("parsing_error");
    }
    
    // 기타 에러의 경우
    return Promise.reject("network_error");
  }
};