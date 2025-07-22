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

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    const data = JSON.parse(text);

    if (data.status === "success") {
      return data.message;
    } else {
      throw new Error(data.message || "알 수 없는 오류 발생");
    }
  } catch (err) {
    console.error("예수금 추가 실패:", err);
    throw err;
  }
};
