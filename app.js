import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBJf9Im_7p9HBUNyUaW6Rj2AQC__4PoAjA",
  authDomain: "movie-tab-a8ba3.firebaseapp.com",
  projectId: "movie-tab-a8ba3",
  storageBucket: "movie-tab-a8ba3.appspot.com",
  messagingSenderId: "514632371740",
  appId: "1:514632371740:web:0dcb53bfe34ed5b71b59d9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const videoContainer = document.getElementById("video-container");
const fullBtn = document.getElementById("full-btn");
const shortsBtn = document.getElementById("shorts-btn");
const shortsPlayer = document.getElementById("shorts-player");
const shortsIframe = document.getElementById("shorts