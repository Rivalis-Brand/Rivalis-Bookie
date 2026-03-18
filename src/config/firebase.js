import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBm-gqy26kezSnU4MdcWrcuWoX7Yg_Y34U",
  authDomain: "rivalis-fitness-reimagined.firebaseapp.com",
  projectId: "rivalis-fitness-reimagined",
  storageBucket: "rivalis-fitness-reimagined.firebasestorage.app",
  messagingSenderId: "87398106759",
  appId: "1:87398106759:web:a18f1c8da03534e127da22"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
