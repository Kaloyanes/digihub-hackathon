import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Config from "react-native-config";

const firebaseConfig = {
  apiKey: Config.API_KEY,
  authDomain: Config.AUTH_DOMAIN,
  projectId: Config.PROJECT_ID,
  storageBucket: Config.STORAGE_BUCKET,
  messagingSenderId: Config.MESSAGING_SENDER_ID,
  appId: Config.APP_ID,
  measurementId: Config.MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth }