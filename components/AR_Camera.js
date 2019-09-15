import React from "react";
import { Text, View, TouchableOpacity, FlatList } from "react-native";
import * as Permissions from "expo-permissions";
import * as ImageManipulator from "expo-image-manipulator";
import { Camera } from "expo-camera";

const Clarifai = require("clarifai");

const clarifai = new Clarifai.App({
  apiKey: "73505ef373bd4ff5917d92d4aadfe1f9"
});
process.nextTick = setImmediate;

export default class App extends React.Component {
  state = {
    hasCameraPermission: null,
    predictions: []
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
      photo
    );
    console.log("predicted");
    return predictions;
  };
  objectDetection = async () => {
    let photo = await this.capturePhoto();
    let resized = await this.resize(photo);
    let predictions = await this.predict(resized);
    // let predictions = await this.predict(photo);
    this.setState({ predictions: predictions.outputs[0].data.concepts });
  };

  render() {
    const { hasCameraPermission, predictions } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
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
                <FlatList
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
                />
              </View>
              <TouchableOpacity
                style={{
                  flex: 0.1,
                  alignItems: "center",
                  backgroundColor: "blue",
                  height: "10%"
                }}
                onPress={this.objectDetection}
              >
                <Text style={{ fontSize: 30, color: "white", padding: 15 }}>
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
