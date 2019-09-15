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
  View
} from "react-native";
import uuid from "uuid";
import Environment from "./config/environment";
import firebase from "./config/firebase";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";

import Home from "./components/Home";
import Landing from "./components/Landing";
import AR_Camera from "./components/AR_Camera";

import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";
import { AR } from "expo";

const Clarifai = require("clarifai");

const clarifai = new Clarifai.App({
  apiKey: "73505ef373bd4ff5917d92d4aadfe1f9"
});
process.nextTick = setImmediate;

const RootStack = createStackNavigator({
  Landing: Landing,
  Home: Home,
  AR_Camera: AR_Camera
});

export const Apps = createAppContainer(RootStack);

export default class App extends React.Component {
  render() {
    return <Apps />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
