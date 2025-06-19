import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Page switching
const pages = document.querySelectorAll('.page');
const navButtons = document.querySelectorAll('nav button');
navButtons.forEach(btn => {
  btn.onclick = () => {
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(btn.dataset.page).classList.add('active');
  };
});

// Send message to Firestore
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const chatBox = document.getElementById("chat-box");

chatForm.onsubmit = async (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (!message) return;
  try {
    await addDoc(collection(db, "messages"), {
      text: message,
      timestamp: new Date()
    });
    messageInput.value = "";
  } catch (err) {
    alert("Failed to send message.");
    console.error(err);
  }
};

// Load messages in real-time
onSnapshot(collection(db, "messages"), (snapshot) => {
  chatBox.innerHTML = "";
  snapshot.docs
    .sort((a, b) => a.data().timestamp?.seconds - b.data().timestamp?.seconds)
    .forEach(doc => {
      const div = document.createElement("div");
      div.textContent = doc.data().text;
      chatBox.appendChild(div);
    });
});