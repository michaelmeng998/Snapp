//environment.js
var environments = {
  staging: {
    FIREBASE_API_KEY: "AIzaSyCmxxn-bgZdRRmNS9bRp3B-O4g5g-Tjq9g",
    FIREBASE_AUTH_DOMAIN: "snapp-8bb07.firebaseapp.com",
    FIREBASE_DATABASE_URL: "https://snapp-8bb07.firebaseio.com",
    FIREBASE_PROJECT_ID: "snapp-8bb07",
    FIREBASE_STORAGE_BUCKET: "snapp-8bb07.appspot.com",
    FIREBASE_MESSAGING_SENDER_ID: "220065967264",
    GOOGLE_CLOUD_VISION_API_KEY: "AIzaSyDFtLbIWMfDOmQxEHsRW33KPoO8ZPAXdKM"
  },
  production: {
    // Warning: This file still gets included in your native binary and is not a secure way to store secrets if you build for the app stores. Details: https://github.com/expo/expo/issues/83
  }
};

function getReleaseChannel() {
  let releaseChannel = Expo.Constants.manifest.releaseChannel;
  if (releaseChannel === undefined) {
    return "staging";
  } else if (releaseChannel === "staging") {
    return "staging";
  } else {
    return "staging";
  }
}
function getEnvironment(env) {
  console.log("Release Channel: ", getReleaseChannel());
  return environments[env];
}
var Environment = getEnvironment(getReleaseChannel());
export default Environment;
