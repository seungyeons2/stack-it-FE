// screens/TutorialScreen.js
import React, { useState } from "react";
import {
  View,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  StatusBar,
} from "react-native";

// 10장 예시: 실제 경로/파일명에 맞춰 바꿔주세요
const IMAGES = [
  require("../../assets/tutorial/tutorial-1.png"),
  require("../../assets/tutorial/tutorial-2.png"),
  require("../../assets/tutorial/tutorial-3.png"),
  require("../../assets/tutorial/tutorial-4.png"),
  require("../../assets/tutorial/tutorial-5.png"),
  require("../../assets/tutorial/tutorial-6.png"),
  require("../../assets/tutorial/tutorial-6(2).png"),
  require("../../assets/tutorial/tutorial-7.png"),
  require("../../assets/tutorial/tutorial-8.png"),
  require("../../assets/tutorial/tutorial-9.png"),
  require("../../assets/tutorial/tutorial-10.png"),
  require("../../assets/tutorial/tutorial-11.png"),
  require("../../assets/tutorial/tutorial-12.png"),
  require("../../assets/tutorial/tutorial-13.png"), 
  require("../../assets/tutorial/tutorial-14.png"),
  require("../../assets/tutorial/tutorial-15.png"),
  require("../../assets/tutorial/tutorial-16.png"),
  require("../../assets/tutorial/tutorial-17.png"),
  require("../../assets/tutorial/tutorial-18.png"),
  require("../../assets/tutorial/tutorial-19.png"),
  require("../../assets/tutorial/tutorial-20.png"),
  require("../../assets/tutorial/tutorial-21.png"),
  require("../../assets/tutorial/tutorial-22.png"),
];

export default function TutorialScreen({ navigation }) {
  const [idx, setIdx] = useState(0);
  const { width, height } = useWindowDimensions();

  const src = IMAGES[idx];
  const asset = Image.resolveAssetSource(src); // 원본 크기
  const aspect = asset?.width && asset?.height ? asset.width / asset.height : 1;

  // 가로는 기기 폭에 맞춤, 세로는 비율 유지
  const imgWidth = width;
  const imgHeight = imgWidth / aspect;

  // 위아래 여백을 조금 두고(상하 48px), 화면을 넘기지 않도록 제한
  const maxHeight = Math.max(0, height - 0);
  const finalHeight = Math.min(imgHeight, maxHeight);

  const onNext = () => {
    if (idx < IMAGES.length - 1) setIdx(idx + 1);
    else navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#003340" />
      <Pressable style={styles.full} onPress={onNext}>
        <Image
          source={src}
          resizeMode="contain"
          style={{ width: imgWidth, height: finalHeight, alignSelf: "center" }}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#003340",
  },
  full: {
    flex: 1,
    justifyContent: "center", // 세로 중앙
    alignItems: "center",      // 가로 중앙
  },
});
