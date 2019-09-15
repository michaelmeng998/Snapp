import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  CameraRoll
} from "react-native";
import * as takeSnapshotAsync from "expo";
import * as Permissions from "expo-permissions";
import * as ImageManipulator from "expo-image-manipulator";
import { Camera } from "expo-camera";
import * as FileSystem from "expo-file-system";

const Clarifai = require("clarifai");

const clarifai = new Clarifai.App({
  apiKey: "73505ef373bd4ff5917d92d4aadfe1f9"
});
process.nextTick = setImmediate;

export default class App extends React.Component {
  static navigationOptions = {
    headerStyle: { backgroundColor: "#ffb88c" },
    headerTitleStyle: { color: "black" }
  };
  state = {
    hasCameraPermission: null,
    predictions: [],
    localPath: null,
    cameraRollPath: null
  };
  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === "granted" });
  }
  capturePhoto = async () => {
    if (this.camera) {
      let photo = await this.camera.takePictureAsync();
      console.log("captured");
      return photo.uri;
    }
  };
  resize = async photo => {
    let manipulatedImage = await ImageManipulator.manipulateAsync(
      photo,
      [{ resize: { height: 300, width: 300 } }],
      { base64: true }
    );
    return manipulatedImage.base64;
  };
  predict = async photo => {
    let predictions = await clarifai.models.predict(
      { id: "hand-gesture" },
      photo,
      { minValue: 0.7 }
    );
    console.log("predicted");
    return predictions;
  };

  objectDetection = async () => {
    //need to send screenshot to google from here
    let photo = await this.capturePhoto();
    let resized = await this.resize(photo);
    let predictions = await this.predict(resized);
    // let predictions = await this.predict(photo);
    this.setState({ predictions: predictions.outputs[0].data.concepts });

    //code for saving screenshot to camera gallery
    console.log("Save to camera roll....");
    this.downloadAsync;
    this._saveToCameraRollAsync;

    //code for saving screenshot if confidence level is above a certain threshold
    console.log("Computed confidence levels:...");
    // console.log(predictions.outputs[0]);
    if (predictions.outputs[0].data.concepts[0].value > 0.85) {
      console.log("Confidence level is above 0.85 and is: ");
      console.log(predictions.outputs[0].data.concepts[0].value);
    }
  };

  //code to save image to disk and then to camera roll
  _downloadAsync = async () => {
    console.log("Saved to disk....");
    let result = await FileSystem.downloadAsync(
      predictions.outputs[0].data.concepts.uri,
      FileSystem.documentDirectory +
        predictions.outputs[0].data.concepts.value +
        "pic.png"
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

  render() {
    const { hasCameraPermission, predictions } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      //   this.takeScreenshot();
      return (
        <View style={{ flex: 1 }}>
          <Camera
            ref={ref => {
              this.camera = ref;
            }}
            style={{ flex: 1 }}
            type={this.state.type}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "transparent",
                flexDirection: "column",
                justifyContent: "flex-end"
              }}
            >
              <View
                style={{
                  flex: 1,
                  alignSelf: "flex-start",
                  alignItems: "center"
                }}
              >
                {/* <FlatList
                  data={predictions.map(prediction => ({
                    key: `${prediction.name} ${prediction.value}`
                  }))}
                  renderItem={({ item }) => (
                    <Text
                      style={{ paddingLeft: 15, color: "white", fontSize: 20 }}
                    >
                      {item.key}
                    </Text>
                  )}
                /> */}
              </View>
              <TouchableOpacity
                style={{
                  flex: 0.1,
                  alignItems: "center",
                  backgroundColor: "#ffb88c",
                  height: "10%"
                }}
                onPress={this.objectDetection}
              >
                <Text style={{ fontSize: 30, color: "black", padding: 15 }}>
                  {" "}
                  Detect Objects{" "}
                </Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      );
    }
  }
}
