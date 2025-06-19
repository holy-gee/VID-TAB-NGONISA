import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBPdGAZT_U8xNBsU-S4NnC7WUQI8zM1LWI",
  authDomain: "vidfind-77a6a.firebaseapp.com",
  projectId: "vidfind-77a6a",
  storageBucket: "vidfind-77a6a.appspot.com",
  messagingSenderId: "813301438270",
  appId: "1:813301438270:web:2ebe4dec657167c5403e6f",
};

const PASSWORD = "dhogotheboss";
const DELETE_USERNAME = "Takunda";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const videoList = document.getElementById("video-list");
const uploadBtn = document.getElementById("upload-btn");
const searchBox = document.getElementById("search-box");
const categoryFilter = document.getElementById("category-filter");

function createVideoCard(video, isFromFirebase = false, firebaseId = "") {
  const card = document.createElement("div");
  card.className = "video-card";

  const thumb = document.createElement("img");
  thumb.src = video.thumbnailUrl || `https://img.youtube.com/vi/${extractYouTubeId(video.videoUrl)}/hqdefault.jpg`;
  card.appendChild(thumb);

  const iframe = document.createElement("iframe");
  iframe.src = convertToEmbed(video.videoUrl);
  iframe.allowFullscreen = true;
  card.appendChild(iframe);

  const title = document.createElement("h3");
  title.textContent = video.title;
  card.appendChild(title);

  const meta = document.createElement("p");
  meta.innerText = `By: ${video.username} | ${video.category}`;
  card.appendChild(meta);

  const like = document.createElement("button");
  like.textContent = "Like ❤️";
  like.onclick = () => alert("Like added!");
  card.appendChild(like);

  if (video.username === DELETE_USERNAME && isFromFirebase) {
    const del = document.createElement("button");
    del.textContent = "Delete";
    del.onclick = async () => {
      await deleteDoc(doc(db, "videos", firebaseId));
      alert("Deleted!");
      loadVideos();
    };
    card.appendChild(del);
  }

  return card;
}

function extractYouTubeId(url) {
  const reg = /(?:youtube\.com.*(?:\/|v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(reg);
  return match ? match[1] : "";
}

function convertToEmbed(url) {
  const id = extractYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : url;
}

async function loadVideos() {
  videoList.innerHTML = "";

  // Add preloaded
  let filtered = window.preloadedVideos;
  const term = searchBox.value.toLowerCase();
  const cat = categoryFilter.value;

  if (term) {
    filtered = filtered.filter(v => 
      v.title.toLowerCase().includes(term) || 
      v.username.toLowerCase().includes(term) ||
      v.category.toLowerCase().includes(term)
    );
  }
  if (cat !== "All") {
    filtered = filtered.filter(v => v.category === cat);
  }

  filtered.forEach(v => {
    const card = createVideoCard(v);
    videoList.appendChild(card);
  });

  // Fetch from Firebase
  const q = query(collection(db, "videos"), orderBy("title"));
  const snaps = await getDocs(q);
  snaps.forEach(docSnap => {
    const data = docSnap.data();
    const card = createVideoCard(data, true, docSnap.id);
    videoList.appendChild(card);
  });
}

uploadBtn.onclick = async () => {
  const pass = document.getElementById("upload-password").value;
  if (pass !== PASSWORD) return alert("Wrong password!");

  const videoUrl = document.getElementById("video-url").value.trim();
  const thumbnailUrl = document.getElementById("thumbnail-url").value.trim();
  const title = document.getElementById("title").value.trim();
  const username = document.getElementById("username").value.trim();
  const description = document.getElementById("description").value.trim();
  const category = document.getElementById("upload-category").value;

  if (!videoUrl || !title || !username) return alert("Missing fields");

  await addDoc(collection(db, "videos"), {
    videoUrl,
    thumbnailUrl,
    title,
    username,
    description,
    category
  });

  alert("Video uploaded!");
  loadVideos();
};

// Search
searchBox.oninput = () => loadVideos();
categoryFilter.onchange = () => loadVideos();

// Initial load
loadVideos();