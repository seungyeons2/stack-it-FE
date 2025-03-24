// utils/account.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getNewAccessToken } from "./auth";

export const fetchUserBalance = async (setUserBalance, navigation) => {
  try {
    const accessToken = await AsyncStorage.getItem("accessToken");
    if (!accessToken) {
      console.error("액세스 토큰이 없습니다.");
      navigation.navigate("Login");
      return;
    }

    const response = await fetch("https://port-0-doodook-backend-lyycvlpm0d9022e4.sel4.cloudtype.app/users/account/", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      const newToken = await getNewAccessToken();
      if (newToken) return fetchUserBalance(setUserBalance, navigation);
      navigation.navigate("Login");
      return;
    }

    const text = await response.text();
    const data = JSON.parse(text);
    let balance = 0;

    if (data?.status === "success" && data?.data?.balance !== undefined) {
      balance = data.data.balance;
    } else if (data?.balance !== undefined) {
      balance = data.balance;
    }

    setUserBalance(Number(balance));
  } catch (error) {
    console.error("잔고 불러오기 실패:", error);
  }
};
