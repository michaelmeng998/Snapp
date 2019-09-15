import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  ImageBackground,
  TouchableOpacity
} from "react-native";

export default class Landing extends React.Component {
  render() {
    return (
      <ImageBackground
        source={require("./images/blurify.png")}
        style={{ width: "100%", height: "100%" }}
      >
        <View style={styles.loginContainer}>
          <Image
            resizeMode="contain"
            style={styles.logo}
            source={require("./images/logo.png")}
          />

          <TouchableOpacity
            onPress={() => this.props.navigation.navigate("Home")}
            style={{ marginBottom: 300 }}
          >
            <View
              style={{
                backgroundColor: "#f48729",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 15,
                padding: 15
              }}
            >
              <Text
                style={{
                  color: "black",
                  fontSize: 20,
                  fontWeight: "200"
                }}
              >
                Snap Now!
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }
}

//   const styles = StyleSheet.create({
//     container: {
//   flex: 1,
//   backgroundColor: "#fff",
//   alignItems: "center",
//   justifyContent: "center"
//     }
//   });

// define your styles
const styles = StyleSheet.create({
  //   container: {
  //     flex: 1,
  //     backgroundColor: "#fff",
  //     alignItems: "center",
  //     justifyContent: "center"
  //   },
  loginContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    resizeMode: "contain"
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: -100
  }
});
