// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your Firebase config (replace with yours)
const firebaseConfig = {
  apiKey: "AIzaSyBPdGAZT_U8xNBsU-S4NnC7WUQI8zM1LWI",
  authDomain: "vidfind-77a6a.firebaseapp.com",
  projectId: "vidfind-77a6a",
  storageBucket: "vidfind-77a6a.appspot.com",
  messagingSenderId: "813301438270",
  appId: "1:813301438270:web:2ebe4dec657167c5403e6f",
  measurementId: "G-N4NTHY2230",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Navigation buttons
const homeBtn = document.getElementById("nav-home");
const chatBtn = document.getElementById("nav-chat");
const adsBtn = document.getElementById("nav-ads");
const buyBtn = document.getElementById("nav-buy");

// Page containers
const homePage = document.getElementById("page-home");
const chatPage = document.getElementById("page-chat");
const adsPage = document.getElementById("page-ads");
const buyPage = document.getElementById("page-buy");

// Chat elements
const messagesContainer = document.getElementById("messages");
const chatForm = document.getElementById("chat-form");
const chatUsername = document.getElementById("chat-username");
const chatMessage = document.getElementById("chat-message");

// Buy Codes elements
const buyForm = document.getElementById("buy-form");
const buyerName = document.getElementById("buyer-name");
const buyerEmail = document.getElementById("buyer-email");
const buyerMessage = document.getElementById("buyer-message");

// Helper: switch pages
function showPage(page) {
  [homePage, chatPage, adsPage, buyPage].forEach((p) =>
    p.classList.remove("active")
  );
  page.classList.add("active");
}

// Initial page
showPage(homePage);

// Nav event listeners
homeBtn.onclick = () => showPage(homePage);
chatBtn.onclick = () => showPage(chatPage);
adsBtn.onclick = () => showPage(adsPage);
buyBtn.onclick = () => showPage(buyPage);

// Load embedded YouTube ads (3 videos)
const adsVideos = [
  "https://www.youtube.com/embed/4kzyW3vN8DQ", // replace with your video URLs
  "https://www.youtube.com/embed/kXYiU_JCYtU",
  "https://www.youtube.com/embed/hLQl3WQQoQ0",
];
const adsContainer = document.getElementById("ads-videos");
adsVideos.forEach((url) => {
  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  iframe.allowFullscreen = true;
  adsContainer.appendChild(iframe);
});

// Chat: Listen for new messages
const messagesRef = collection(db, "messages");
const messagesQuery = query(messagesRef, orderBy("createdAt"));
onSnapshot(messagesQuery, (snapshot) => {
  messagesContainer.innerHTML = ""; // Clear existing
  snapshot.forEach((doc) => {
    const data = doc.data();
    const p = document.createElement("p");
    p.textContent = `${data.username}: ${data.message}`;
    messagesContainer.appendChild(p);
  });
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

// Chat: Send message
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = chatUsername.value.trim();
  const message = chatMessage.value.trim();
  if (!username || !message) {
    alert("Please enter username and message.");
    return;
  }
  try {
    await addDoc(messagesRef, {
      username,
      message,
      createdAt: serverTimestamp(),
    });
    chatMessage.value = "";
  } catch (err) {
    console.error("Error sending message:", err);
    alert("Failed to send message.");
  }
});

// Buy Codes: on submit opens mailto: with info
buyForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = buyerName.value.trim();
  const email = buyerEmail.value.trim();
  const msg = buyerMessage.value.trim();
  if (!name || !email || !msg) {
    alert("Please fill all fields.");
    return;
  }
  const subject = encodeURIComponent("Code Purchase Inquiry");
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nMessage:\n${msg}`
  );
  window.location.href = `mailto:takundangonisa7@gmail.com?subject=${subject}&body=${body}`;
});