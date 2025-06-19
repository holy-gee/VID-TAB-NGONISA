import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Navigation logic
document.querySelectorAll("nav button").forEach((btn) => {
  btn.onclick = () => {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById(btn.dataset.page).classList.add("active");
  };
});

// Group chat logic
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const chatBox = document.getElementById("chat-box");

chatForm.onsubmit = async (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  await addDoc(collection(db, "messages"), {
    text,
    timestamp: new Date()
  });
  messageInput.value = "";
};

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