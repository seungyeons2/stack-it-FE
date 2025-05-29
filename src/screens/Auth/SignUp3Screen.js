import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";

const SignUp3Screen = ({ navigation, route }) => {
  const { email, id } = route.params;

  const handleComplete = () => {
    Alert.alert("가입을 축하합니다!", "회원님의 두둑한 지갑을 응원합니다 👏", [
      {
        text: "돈 모으러 가기",
        onPress: () => navigation.replace("Login"),
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Text style={styles.backText}>{"<"}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>이메일 인증 완료</Text>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.label}>
        가입을 축하합니다!
              </Text>
            {/* <Text style={styles.label2}>
      회원님의 두둑한 모의투자를 응원합니다 👏
      </Text> */}

      <TouchableOpacity style={styles.button} onPress={handleComplete}>
        <Text style={styles.buttonText}>로그인하러 가기</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#003340",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backText: {
    fontSize: 36,
    color: "#F074BA",
  },

  // title: {
  //   fontSize: 24,
  //   fontWeight: "bold",
  //   color: "#F074BA",
  //   marginBottom: 20,
  //   textAlign: "center",
  // },

    title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F074BA",
    position: "absolute",
    top: 150,
    left: 30,
  },
  label: {
    fontSize: 28,
    color: "#FFFFFF",
    alignSelf: "center",
    marginTop: 10,
    textAlign: "center",
  },

    label2: {
    fontSize: 20,
    color: "#E5E5E5",
    alignSelf: "center",
    marginTop: 10,
    textAlign: "center",
  },

    emoji: {
    fontSize: 180,
    marginBottom: 30,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#F074BA",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 80,
  },
  buttonDisabled: {
    backgroundColor: "#d3d3d3",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 10,
    paddingHorizontal: 10,
  },
});

export default SignUp3Screen;
