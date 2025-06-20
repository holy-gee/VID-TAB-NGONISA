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
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBPdGAZT_U8xNBsU-S4NnC7WUQI8zM1LWI",
  authDomain: "vidfind-77a6a.firebaseapp.com",
  projectId: "vidfind-77a6a",
  storageBucket: "vidfind-77a6a.appspot.com",
  messagingSenderId: "813301438270",
  appId: "1:813301438270:web:2ebe4dec657167c5403e6f"
};

const PASSWORD = "dhogotheboss";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM elements
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const uploadSection = document.getElementById("upload-section");
const loginSection = document.getElementById("login-section");
const uploaderInfo = document.getElementById("uploader-info");
const uploaderNameSpan = document.getElementById("uploader-name");

const usernameInput = document.getElementById("username-input");
const videoUrlInput = document.getElementById("video-url");
const thumbnailUrlInput = document.getElementById("thumbnail-url");
const videoTitleInput = document.getElementById("video-title");
const videoCategorySelect = document.getElementById("video-category");
const uploadBtn = document.getElementById("upload-btn");

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const categoryFilter = document.getElementById("category-filter");

const videosContainer = document.getElementById("videos-container");

// Auth flow
loginBtn.onclick = () => {
  const pass = document.getElementById("upload-password").value;
  if (pass === PASSWORD) {
    loginSection.style.display = "none";
    uploadSection.style.display = "flex";
    uploaderInfo.style.display = "block";
    uploaderNameSpan.textContent = "Uploader";
  } else {
    alert("Wrong password!");
  }
};

logoutBtn.onclick = () => {
  loginSection.style.display = "flex";
  uploadSection.style.display = "none";
  uploaderInfo.style.display = "none";
};

// Upload video
uploadBtn.onclick = async () => {
  const username = usernameInput.value.trim();
  const videoUrl = videoUrlInput.value.trim();
  const thumbnailUrl = thumbnailUrlInput.value.trim();
  const title = videoTitleInput.value.trim();
  const category = videoCategorySelect.value;

  if (!username || !videoUrl || !title) {
    alert("Please fill all required fields.");
    return;
  }

  try {
    await addDoc(collection(db, "videos"), {
      username,
      videoUrl,
      thumbnailUrl,
      title,
      category,
      likesCount: 0,
      createdAt: new Date()
    });

    usernameInput.value = "";
    videoUrlInput.value = "";
    thumbnailUrlInput.value = "";
    videoTitleInput.value = "";

    alert("Uploaded!");
    await loadAndRenderVideos();
  } catch (e) {
    console.error("Upload failed:", e);
    alert("Upload failed.");
  }
};

// Render all videos
async function loadAndRenderVideos(searchTerm = "", category = "All") {
  videosContainer.innerHTML = "Loading...";
  let q = query(collection(db, "videos"), orderBy("createdAt", "desc"));

  if (category !== "All") {
    q = query(collection(db, "videos"), where("category", "==", category), orderBy("createdAt", "desc"));
  }

  const snapshot = await getDocs(q);
  const results = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    data.id = docSnap.id;
    results.push(data);
  });

  // Filter search
  let filtered = results;
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    filtered = results.filter(
      v =>
        v.title.toLowerCase().includes(term) ||
        v.username.toLowerCase().includes(term) ||
        v.category.toLowerCase().includes(term)
    );
  }

  videosContainer.innerHTML = "";
  if (filtered.length === 0) {
    videosContainer.innerHTML = "<p>No videos found.</p>";
    return;
  }

  filtered.forEach(renderVideoCard);
}

function renderVideoCard(video) {
  const div = document.createElement("div");
  div.className = "video-card";

  const img = document.createElement("img");
  img.className = "video-thumb";
  img.src = video.thumbnailUrl || "";
  div.appendChild(img);

  const title = document.createElement("div");
  title.className = "video-title";
  title.textContent = video.title;
  div.appendChild(title);

  const uploader = document.createElement("div");
  uploader.className = "video-uploader";
  uploader.textContent = `By: ${video.username}`;
  div.appendChild(uploader);

  const category = document.createElement("div");
  category.className = "video-category";
  category.textContent = `Category: ${video.category}`;
  div.appendChild(category);

  const videoEl = document.createElement("video");
  videoEl.className = "video-thumb";
  videoEl.src = video.videoUrl;
  videoEl.controls = true;
  div.appendChild(videoEl);

  const controls = document.createElement("div");
  controls.className = "video-controls";

  const likeBtn = document.createElement("button");
  likeBtn.className = "like-btn";
  likeBtn.textContent = `Like (${video.likesCount || 0})`;
  likeBtn.onclick = async () => {
    const newCount = (video.likesCount || 0) + 1;
    likeBtn.textContent = `Like (${newCount})`;
    await updateDoc(doc(db, "videos", video.id), { likesCount: newCount });
  };
  controls.appendChild(likeBtn);

  const downloadBtn = document.createElement("button");
  downloadBtn.className = "download-btn";
  downloadBtn.textContent = "Download";
  downloadBtn.onclick = async () => {
    try {
      const res = await fetch(video.videoUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = video.title.replace(/\s+/g, "_") + ".mp4";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Download failed.");
    }
  };
  controls.appendChild(downloadBtn);

  div.appendChild(controls);
  videosContainer.appendChild(div);
}

// Search and filter
searchBtn.onclick = () => {
  const term = searchInput.value.trim();
  const cat = categoryFilter.value;
  loadAndRenderVideos(term, cat);
};

categoryFilter.onchange = () => {
  const term = searchInput.value.trim();
  const cat = categoryFilter.value;
  loadAndRenderVideos(term, cat);
};

// Initial load
loadAndRenderVideos();