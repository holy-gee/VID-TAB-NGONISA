import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  where,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBPdGAZT_U8xNBsU-S4NnC7WUQI8zM1LWI",
  authDomain: "vidfind-77a6a.firebaseapp.com",
  projectId: "vidfind-77a6a",
  storageBucket: "vidfind-77a6a.appspot.com",
  messagingSenderId: "813301438270",
  appId: "1:813301438270:web:2ebe4dec657167c5403e6f",
};

const PASSWORD = "dhogotheboss";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Elements
const tabs = document.querySelectorAll(".tab");
const sections = {
  online: document.getElementById("online-section"),
  offline: document.getElementById("offline-section"),
};
const uploadBtn = document.getElementById("upload-btn");
const toggleUpload = document.getElementById("toggle-upload");
const uploadSection = document.getElementById("upload-section");
const videosContainer = document.getElementById("videos-container");
const searchInput = document.getElementById("search");
const categoryFilter = document.getElementById("category-filter");

let currentUploader = "";

// Show correct tab
tabs.forEach(tab => {
  tab.onclick = () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    Object.values(sections).forEach(sec => sec.classList.add("hidden"));
    sections[tab.dataset.tab].classList.remove("hidden");
    if (tab.dataset.tab === "online") loadVideos();
    if (tab.dataset.tab === "offline") loadSavedVideos();
  };
});

toggleUpload.onclick = () => {
  uploadSection.classList.toggle("hidden");
};

uploadBtn.onclick = async () => {
  const pass = document.getElementById("password").value.trim();
  const username = document.getElementById("username").value.trim();
  const videoUrl = document.getElementById("video-url").value.trim();
  const thumbUrl = document.getElementById("thumb-url").value.trim();
  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value;

  if (pass !== PASSWORD) return alert("Wrong password!");
  if (!username || !videoUrl || !title) return alert("Fill all required fields.");

  await addDoc(collection(db, "videos"), {
    username,
    videoUrl,
    thumbUrl,
    title,
    category,
    likes: 0,
    subs: 0,
    comments: [],
    createdAt: new Date(),
  });

  alert("Video uploaded!");
  uploadSection.classList.add("hidden");
  loadVideos();
};

searchInput.oninput = () => {
  loadVideos();
};

categoryFilter.onchange = () => {
  loadVideos();
};

async function loadVideos() {
  videosContainer.innerHTML = "<p>Loading...</p>";
  let q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);

  let videos = [];
  querySnapshot.forEach(doc => {
    const data = doc.data();
    data.id = doc.id;
    videos.push(data);
  });

  const searchTerm = searchInput.value.toLowerCase();
  const category = categoryFilter.value;

  if (category !== "All") {
    videos = videos.filter(v => v.category === category);
  }

  if (searchTerm) {
    videos = videos.filter(
      v =>
        v.title.toLowerCase().includes(searchTerm) ||
        v.username.toLowerCase().includes(searchTerm)
    );
  }

  if (videos.length === 0) {
    videosContainer.innerHTML = "<p>No videos found.</p>";
    return;
  }

  videosContainer.innerHTML = "";
  videos.forEach(renderVideo);
}

function renderVideo(video) {
  const card = document.createElement("div");
  card.className = "video-card";

  const thumb = document.createElement("img");
  thumb.className = "video-thumb";
  thumb.src = video.thumbUrl;
  card.appendChild(thumb);

  const info = document.createElement("div");
  info.className = "video-info";

  const title = document.createElement("div");
  title.className = "video-title";
  title.textContent = video.title;
  info.appendChild(title);

  const uploader = document.createElement("div");
  uploader.className = "video-uploader";
  uploader.textContent = `By: ${video.username}`;
  info.appendChild(uploader);

  const category = document.createElement("div");
  category.className = "video-category";
  category.textContent = `Category: ${video.category}`;
  info.appendChild(category);

  const actions = document.createElement("div");
  actions.className = "video-actions";

  const likeBtn = document.createElement("button");
  likeBtn.textContent = `❤️ Like (${video.likes})`;
  likeBtn.onclick = async () => {
    const ref = doc(db, "videos", video.id);
    await updateDoc(ref, { likes: video.likes + 1 });
    loadVideos();
  };

  const subBtn = document.createElement("button");
  subBtn.textContent = `🔔 Subscribe (${video.subs})`;
  subBtn.onclick = async () => {
    const ref = doc(db, "videos", video.id);
    await updateDoc(ref, { subs: video.subs + 1 });
    loadVideos();
  };

  const commentBtn = document.createElement("button");
  commentBtn.textContent = "💬 Comment";
  commentBtn.onclick = () => {
    const comment = prompt("Write your comment:");
    if (comment) {
      const ref = doc(db, "videos", video.id);
      updateDoc(ref, {
        comments: [...(video.comments || []), comment],
      });
    }
  };

  const playBtn = document.createElement("button");
  playBtn.textContent = "▶️ Play";
  playBtn.onclick = () => {
    const player = document.createElement("video");
    player.controls = true;
    player.src = video.videoUrl;
    player.style.width = "100%";
    card.innerHTML = "";
    card.appendChild(player);
  };

  const downloadBtn = document.createElement("button");
  downloadBtn.textContent = "⬇️ Download";
  downloadBtn.onclick = () => {
    const indicator = document.createElement("div");
    indicator.className = "download-indicator";
    card.appendChild(indicator);

    const link = document.createElement("a");
    link.href = video.videoUrl;
    link.download = "";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    card.removeChild(indicator);
  };

  actions.append(likeBtn, subBtn, commentBtn, playBtn, downloadBtn);
  info.appendChild(actions);
  card.appendChild(info);
  videosContainer.appendChild(card);
}

// Offline support (if required in future)
function loadSavedVideos() {
  const container = document.getElementById("saved-videos-container");
  container.innerHTML = "<p>Saved videos will appear here (not yet implemented).</p>";
}

// Load first time
loadVideos();