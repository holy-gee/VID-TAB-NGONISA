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
  appId: "1:813301438270:web:2ebe4dec657167c5403e6f",
  measurementId: "G-N4NTHY2230",
};

const PASSWORD = "dhogotheboss";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM references
const loginSection = document.getElementById("login-section");
const loginBtn = document.getElementById("login-btn");
const uploadSection = document.getElementById("upload-section");
const uploaderInfo = document.getElementById("uploader-info");
const uploaderNameSpan = document.getElementById("uploader-name");
const logoutBtn = document.getElementById("logout-btn");

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

let loggedIn = false;
let currentUploader = "";

// Login
loginBtn.onclick = () => {
  const pass = document.getElementById("upload-password").value;
  if (pass === PASSWORD) {
    loggedIn = true;
    loginSection.style.display = "none";
    uploadSection.style.display = "flex";
    uploaderInfo.style.display = "block";
  } else {
    alert("Wrong password!");
  }
};

// Logout
logoutBtn.onclick = () => {
  loggedIn = false;
  uploadSection.style.display = "none";
  uploaderInfo.style.display = "none";
  loginSection.style.display = "flex";
  currentUploader = "";
};

// Upload video
uploadBtn.onclick = async () => {
  if (!loggedIn) return alert("Enter password to upload");

  const username = usernameInput.value.trim();
  const videoUrl = videoUrlInput.value.trim();
  const thumbnailUrl = thumbnailUrlInput.value.trim();
  const title = videoTitleInput.value.trim();
  const category = videoCategorySelect.value;

  if (!username || !videoUrl || !title) {
    alert("Fill username, video URL and title.");
    return;
  }

  currentUploader = username;
  uploaderNameSpan.textContent = username;

  try {
    await addDoc(collection(db, "videos"), {
      username,
      videoUrl,
      thumbnailUrl,
      title,
      category,
      likesCount: 0,
      createdAt: new Date(),
    });

    usernameInput.value = "";
    videoUrlInput.value = "";
    thumbnailUrlInput.value = "";
    videoTitleInput.value = "";
    videoCategorySelect.value = "All";

    alert("✅ Video uploaded!");
    await loadAndRenderVideos();
  } catch (err) {
    alert("❌ Upload failed");
    console.error(err);
  }
};

// Convert YouTube link to embed
function convertYoutubeToEmbed(url) {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return "https://www.youtube.com/embed/" + match[2];
  }
  return url;
}

// Load and render all videos
async function loadAndRenderVideos(searchTerm = "", category = "All") {
  videosContainer.innerHTML = "<p>Loading...</p>";

  let q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
  if (category !== "All") {
    q = query(
      collection(db, "videos"),
      where("category", "==", category),
      orderBy("createdAt", "desc")
    );
  }

  try {
    const querySnapshot = await getDocs(q);
    const videos = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      data.id = docSnap.id;
      videos.push(data);
    });

    let filtered = videos;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = videos.filter(
        (v) =>
          v.title.toLowerCase().includes(term) ||
          v.category.toLowerCase().includes(term) ||
          (v.username && v.username.toLowerCase().includes(term))
      );
    }

    videosContainer.innerHTML =
      filtered.length === 0 ? "<p>No videos found.</p>" : "";

    filtered.forEach((video) => {
      const card = createVideoCard(video);
      videosContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading:", err);
    videosContainer.innerHTML = "<p>Failed to load videos.</p>";
  }
}

// Create video card
function createVideoCard(video) {
  const div = document.createElement("div");
  div.className = "video-card";

  if (video.thumbnailUrl) {
    const img = document.createElement("img");
    img.className = "video-thumb";
    img.src = video.thumbnailUrl;
    div.appendChild(img);
  } else if (
    video.videoUrl.includes("youtube.com") ||
    video.videoUrl.includes("youtu.be")
  ) {
    const iframe = document.createElement("iframe");
    iframe.width = "100%";
    iframe.height = "170";
    iframe.src = convertYoutubeToEmbed(video.videoUrl);
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    div.appendChild(iframe);
  } else {
    const videoEl = document.createElement("video");
    videoEl.className = "video-thumb";
    videoEl.src = video.videoUrl;
    videoEl.controls = true;
    div.appendChild(videoEl);
  }

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
  category.textContent = "Category: " + video.category;
  div.appendChild(category);

  // Controls
  const controls = document.createElement("div");
  controls.className = "video-controls";

  const likeBtn = document.createElement("button");
  likeBtn.className = "like-btn";
  likeBtn.textContent = `Like (${video.likesCount || 0})`;
  likeBtn.onclick = async () => {
    const newCount = (video.likesCount || 0) + 1;
    likeBtn.textContent = `Like (${newCount})`;
    try {
      await updateDoc(doc(db, "videos", video.id), { likesCount: newCount });
    } catch (err) {
      alert("Failed to like");
    }
  };
  controls.appendChild(likeBtn);

  // Play button
  const playBtn = document.createElement("button");
  playBtn.className = "like-btn";
  playBtn.textContent = "▶ Play";
  playBtn.onclick = () => {
    window.open(video.videoUrl, "_blank");
  };
  controls.appendChild(playBtn);

  // Download button
  if (
    !video.videoUrl.includes("youtube.com") &&
    !video.videoUrl.includes("youtu.be")
  ) {
    const downloadBtn = document.createElement("a");
    downloadBtn.className = "download-btn";
    downloadBtn.href = video.videoUrl;
    downloadBtn.download = "";
    downloadBtn.textContent = "⬇ Download";
    downloadBtn.onclick = () => {
      setTimeout(() => {
        alert("✅ Downloaded to your files");
      }, 3000); // Wait a bit for download to start
    };
    controls.appendChild(downloadBtn);
  }

  div.appendChild(controls);
  return div;
}

// Events
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