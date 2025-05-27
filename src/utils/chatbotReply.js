// utils/fetchChatbotReply.js
export const chatbotReply = async (message) => {
  try {
    const response = await fetch("http://43.200.211.76:8000/api/v1/ai-chatbot/chat/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error("서버 응답 오류");
    }

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error("Chatbot API 오류:", error);
    return "죄송합니다. 응답을 가져오지 못했어요.";
  }
};
