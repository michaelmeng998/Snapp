import React, { Component } from "react";
import { CameraRoll, Button, Image, View, StyleSheet } from "react-native";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";

const webUrl =
  "https://stancarey.files.wordpress.com/2013/03/futurama-fry-should-i-lol-or-roflmao.jpg";

export default class App extends Component {
  state = {
    localPath: null,
    cameraRollPath: null
  };

  render() {
    return (
      <View style={styles.container}>
        <Image source={{ uri: webUrl }} style={{ width: 200, height: 200 }} />
        {this.state.localPath ? null : (
          <Button onPress={this._downloadAsync} title="Save to disk" />
        )}
        {this.state.localPath && !this.state.cameraRollPath ? (
          <Button
            onPress={this._saveToCameraRollAsync}
            title="Save to camera roll"
          />
        ) : null}
        {this.state.localPath && this.state.cameraRollPath ? (
          <Button
            onPress={this._openImageGalleryAsync}
            title="Open camera roll"
          />
        ) : null}
      </View>
    );
  }

  _downloadAsync = async () => {
    console.log("Saved to disk....");
    let result = await FileSystem.downloadAsync(
      webUrl,
      FileSystem.documentDirectory + "lol.jpg"
    );
    this.setState({ localPath: result.uri });
  };

  _saveToCameraRollAsync = async () => {
    console.log("Saved to CAMERA ROLL....");

    try {
      let result = await CameraRoll.saveToCameraRoll(
        this.state.localPath,
        "photo"
      );
      alert(JSON.stringify(result));
      this.setState({ cameraRollPath: result });
    } catch (e) {
      alert(JSON.stringify(e));
    }
  };

  _openImageGalleryAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3]
    });

    console.log(result);
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Constants.statusBarHeight,
    backgroundColor: "#ecf0f1"
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#34495e"
  }
});
