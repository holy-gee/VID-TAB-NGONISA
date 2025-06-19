import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// DOM elements
const uploadBtn = document.getElementById("upload-btn");
const titleInput = document.getElementById("title");
const videoUrlInput = document.getElementById("video-url");
const thumbnailUrlInput = document.getElementById("thumbnail-url");
const usernameInput = document.getElementById("username");
const groupSection = document.getElementById("group-chat");
const adSection = document.getElementById("ads-section");
const codeList = document.getElementById("code-list");
const buySection = document.getElementById("buy-section");
const messageBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const sendMsg = document.getElementById("send-msg");

// Upload advertisement
uploadBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const videoUrl = videoUrlInput.value.trim();
  const thumbnailUrl = thumbnailUrlInput.value.trim();
  const username = usernameInput.value.trim();

  if (!title || !videoUrl || !username) {
    alert("Please fill in all required fields.");
    return;
  }

  try {
    await addDoc(collection(db, "ads"), {
      title,
      videoUrl,
      thumbnailUrl,
      username,
      createdAt: Timestamp.now()
    });
    alert("Advertisement uploaded!");
    titleInput.value = "";
    videoUrlInput.value = "";
    thumbnailUrlInput.value = "";
    usernameInput.value = "";
    loadAds();
  } catch (err) {
    console.error("Error uploading ad:", err);
    alert("Error uploading advertisement.");
  }
});

// Load advertisements
async function loadAds() {
  const q = query(collection(db, "ads"), orderBy("createdAt", "desc"));
  const adsSnapshot = await getDocs(q);

  adSection.innerHTML = "";
  adsSnapshot.forEach((doc) => {
    const data = doc.data();
    const card = document.createElement("div");
    card.className = "ad-card";

    card.innerHTML = `
      <h4>${data.title}</h4>
      <p>By: ${data.username}</p>
      <iframe src="${convertYoutube(data.videoUrl)}" frameborder="0" allowfullscreen></iframe>
    `;

    adSection.appendChild(card);
  });
}

// YouTube embed converter
function convertYoutube(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}`
    : url;
}

// Send message
sendMsg.addEventListener("click", async () => {
  const text = chatInput.value.trim();
  if (!text) return;

  await addDoc(collection(db, "messages"), {
    text,
    createdAt: Timestamp.now()
  });

  chatInput.value = "";
  loadMessages();
});

// Load group chat messages
async function loadMessages() {
  const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
  const msgs = await getDocs(q);

  messageBox.innerHTML = "";
  msgs.forEach((doc) => {
    const msg = document.createElement("p");
    msg.textContent = doc.data().text;
    messageBox.appendChild(msg);
  });
}

loadAds();
loadMessages();