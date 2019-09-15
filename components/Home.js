import React from "react";
import {
  ActivityIndicator,
  Button,
  Clipboard,
  FlatList,
  Image,
  Share,
  StyleSheet,
  Text,
  ScrollView,
  View,
  ImageBackground,
  TouchableOpacity
} from "react-native";
// import { ImagePicker } from "expo";
import uuid from "uuid";
import Environment from "../config/environment";
import firebase from "../config/firebase";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as Camera from "expo-camera";

const Clarifai = require("clarifai");
const clarifai = new Clarifai.App({
  apiKey: "73505ef373bd4ff5917d92d4aadfe1f9"
});
process.nextTick = setImmediate;

export default class App extends React.Component {
  state = {
    image: null,
    uploading: false,
    googleResponse: null
  };

  async componentDidMount() {
    await Permissions.askAsync(Permissions.CAMERA_ROLL);
    await Permissions.askAsync(Permissions.CAMERA);
  }

  render() {
    let { image } = this.state;

    return (
      <ImageBackground
        source={require("./images/blurify.png")}
        style={{ width: "100%", height: "100%" }}
      >
        <View style={styles.container}>
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
          >
            <View style={styles.getStartedContainer}>
              <View style={styles.logoContainer}>
                <Image
                  resizeMode="contain"
                  style={styles.logo}
                  source={require("./images/logo.png")}
                />
              </View>
            </View>

            <View style={styles.helpContainer}>
              <TouchableOpacity
                onPress={this._pickImage}
                style={{ margin: 20 }}
              >
                <View
                  style={{
                    backgroundColor: "#f48729",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 30,
                    padding: 10
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 10,
                      fontWeight: "100"
                    }}
                  >
                    Pick Image from Camera Roll
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={this._takePhoto}
                style={{ marginTop: 10, marginBottom: 10 }}
              >
                <View
                  style={{
                    backgroundColor: "#f48729",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 30,
                    padding: 10
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 10,
                      fontWeight: "100"
                    }}
                  >
                    Take Photo
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => this.props.navigation.navigate("AR_Camera")}
                style={{ margin: 20 }}
              >
                <View
                  style={{
                    backgroundColor: "#f48729",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 30,
                    padding: 10
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 10,
                      fontWeight: "100"
                    }}
                  >
                    Real Time Photo
                  </Text>
                </View>
              </TouchableOpacity>

              {this.state.googleResponse && (
                <FlatList
                  data={
                    this.state.googleResponse.responses[0].webDetection
                      .webEntities
                  }
                  //webDetection.webEntities[0]
                  extraData={this.state}
                  keyExtractor={this._keyExtractor}
                  renderItem={({ item }) => (
                    <Text>
                      {/* Item: {item.description}, {item.score} */}
                      Item: {item.description}
                    </Text>
                  )}
                />
              )}
              {this._maybeRenderImage()}
              {this._maybeRenderUploadingOverlay()}
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    );
  }

  organize = array => {
    return array.map(function(item, i) {
      return (
        <View key={i}>
          <Text>{item}</Text>
        </View>
      );
    });
  };

  _maybeRenderUploadingOverlay = () => {
    if (this.state.uploading) {
      return (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "rgba(0,0,0,0.4)",
              alignItems: "center",
              justifyContent: "center"
            }
          ]}
        >
          <ActivityIndicator color="#fff" animating size="large" />
        </View>
      );
    }
  };

  _maybeRenderImage = () => {
    let { image, googleResponse } = this.state;
    if (!image) {
      return;
    }

    return (
      <View
        style={{
          marginTop: 20,
          width: 250,
          borderRadius: 3,
          elevation: 2
        }}
      >
        <TouchableOpacity
          onPress={() => this.submitToGoogle()}
          style={{ margin: 20 }}
        >
          <View
            style={{
              backgroundColor: "black",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 30,
              padding: 10
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 10,
                fontWeight: "100"
              }}
            >
              Analyze
            </Text>
          </View>
        </TouchableOpacity>

        <View
          style={{
            borderTopRightRadius: 3,
            borderTopLeftRadius: 3,
            shadowColor: "rgba(0,0,0,1)",
            shadowOpacity: 0.2,
            shadowOffset: { width: 4, height: 4 },
            shadowRadius: 5,
            overflow: "hidden"
          }}
        >
          <Image source={{ uri: image }} style={{ width: 250, height: 250 }} />
        </View>
        <Text
          onPress={this._copyToClipboard}
          onLongPress={this._share}
          style={{ paddingVertical: 10, paddingHorizontal: 10 }}
        />

        {/* <Text>Raw JSON:</Text> */}

        {googleResponse && (
          <Text
            onPress={this._copyToClipboard}
            onLongPress={this._share}
            style={{ paddingVertical: 10, paddingHorizontal: 10 }}
          >
            {/* JSON.stringify(googleResponse.responses)} */}
          </Text>
        )}
      </View>
    );
  };

  //CODE FOR AR-CAMERA
  state = {
    hasCameraPermission: null,
    predictions: []
  };
  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCamlseraPermission: status === "granted" });
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

  //CODE FOR AR-CAMERA

  _keyExtractor = (item, index) => item.id;

  _renderItem = item => {
    <Text>response: {JSON.stringify(item)}</Text>;
  };

  _share = () => {
    Share.share({
      message: JSON.stringify(this.state.googleResponse.responses),
      title: "Check it out",
      url: this.state.image
    });
  };

  _copyToClipboard = () => {
    Clipboard.setString(this.state.image);
    alert("Copied to clipboard");
  };

  // _takePhoto = async () => {
  //   let pickerResult = await ImagePicker.launchCameraAsync({
  //     allowsEditing: true,
  //     aspect: [4, 3]
  //   });

  _takePhoto = async () => {
    let pickerResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3]
    });

    this._handleImagePicked(pickerResult);
  };

  _realTimePhoto = async () => {
    console.log("inside real time photo...");

    // () => this.props.navigation.navigate("AR_Camera");

    //old regular camera code

    // let pickerResult = await ImagePicker.launchCameraAsync({
    //   allowsEditing: true,
    //   aspect: [4, 3]
    // });

    // this._handleImagePicked(pickerResult);
  };

  _pickImage = async () => {
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3]
    });

    this._handleImagePicked(pickerResult);
  };

  _handleImagePicked = async pickerResult => {
    try {
      this.setState({ uploading: true });

      if (!pickerResult.cancelled) {
        uploadUrl = await uploadImageAsync(pickerResult.uri);
        this.setState({ image: uploadUrl });
      }
    } catch (e) {
      console.log(e);
      alert("Upload failed, sorry :(");
    } finally {
      this.setState({ uploading: false });
    }
  };

  submitToGoogle = async () => {
    try {
      this.setState({ uploading: true });
      let { image } = this.state;
      let body = JSON.stringify({
        requests: [
          {
            features: [
              { type: "LABEL_DETECTION", maxResults: 10 },
              { type: "LANDMARK_DETECTION", maxResults: 5 },
              { type: "FACE_DETECTION", maxResults: 5 },
              { type: "LOGO_DETECTION", maxResults: 5 },
              { type: "TEXT_DETECTION", maxResults: 5 },
              { type: "DOCUMENT_TEXT_DETECTION", maxResults: 5 },
              { type: "SAFE_SEARCH_DETECTION", maxResults: 5 },
              { type: "IMAGE_PROPERTIES", maxResults: 5 },
              { type: "CROP_HINTS", maxResults: 5 },
              { type: "WEB_DETECTION", maxResults: 5 }
            ],
            image: {
              source: {
                imageUri: image
              }
            }
          }
        ]
      });
      let response = await fetch(
        "https://vision.googleapis.com/v1/images:annotate?key=" +
          Environment["GOOGLE_CLOUD_VISION_API_KEY"],
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: body
        }
      );
      let responseJson = await response.json();
      // console.log(responseJson);
      this.setState({
        googleResponse: responseJson,
        uploading: false
      });
    } catch (error) {
      console.log(error);
    }
  };
}

async function uploadImageAsync(uri) {
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function() {
      resolve(xhr.response);
    };
    xhr.onerror = function(e) {
      console.log(e);
      reject(new TypeError("Network request failed"));
    };
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });

  const ref = firebase
    .storage()
    .ref()
    .child(uuid.v4());
  const snapshot = await ref.put(blob);

  blob.close();

  return await snapshot.ref.getDownloadURL();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 10
  },
  developmentModeText: {
    marginBottom: 20,
    color: "rgba(0,0,0,0.4)",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center"
  },
  contentContainer: {
    paddingTop: 30
  },

  getStartedContainer: {
    alignItems: "center",
    marginHorizontal: 50
  },

  getStartedText: {
    fontSize: 17,
    color: "rgba(96,100,109, 1)",
    lineHeight: 24,
    textAlign: "center"
  },

  helpContainer: {
    marginTop: 15,
    alignItems: "center"
  },
  logoContainer: {
    width: 150,
    height: 150,
    marginBottom: -100
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: -100
  }
});
