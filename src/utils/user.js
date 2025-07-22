import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchWithAuth } from "./token";
import { API_BASE_URL } from "./apiConfig";

// 사용자 정보를 불러와 setUserInfo에 설정해주는 함수
export const fetchUserInfo = async (navigation, setUserInfo) => {
  try {
    console.log("👤 사용자 정보 조회 시작");

    const response = await fetchWithAuth(
      `${API_BASE_URL}users/me/`,
      {
        method: "GET",
      },
      navigation
    );

    console.log("응답 상태:", response.status);
    const text = await response.text();
    console.log("응답 본문:", text);

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    try {
      const data = JSON.parse(text);
      console.log("응답에서 사용자 정보 찾음");

      console.log(`사용자 ID: ${data.id}`);
      console.log(`닉네임: ${data.nickname}`);
      console.log(`이메일: ${data.email}`);
      console.log(`성별: ${data.gender || "(미입력)"}`);
      console.log(`생일: ${data.birthdate || "(미입력)"}`);
      console.log(`주소: ${data.address || "(미입력)"}`);

      setUserInfo(data);
    } catch (jsonErr) {
      console.error("JSON 파싱 실패:", jsonErr);
      setUserInfo(null);
    }
  } catch (err) {
    console.error("사용자 정보 요청 실패:", err);
    setUserInfo(null);
  }
};

// 사용자 정보 수정 함수
export const updateUserInfo = async (navigation, updatedFields) => {
  try {
    console.log("🔧 수정 요청 보낼 필드:", updatedFields);

    const response = await fetchWithAuth(
      `${API_BASE_URL}users/me/`,
      {
        method: "PATCH",
        body: JSON.stringify(updatedFields),
      },
      navigation
    );

    console.log("🔧 수정 응답 상태:", response.status);
    const text = await response.text();
    console.log("🔧 수정 응답 본문:", text);

    if (response.ok) {
      return true; // 성공
    } else {
      return false; // 실패
    }
  } catch (err) {
    console.error("사용자 정보 수정 실패:", err);
    return false;
  }
};
