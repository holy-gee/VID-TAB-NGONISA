import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
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
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBJf9Im_7p9HBUNyUaW6Rj2AQC__4PoAjA",
  authDomain: "movie-tab-a8ba3.firebaseapp.com",
  projectId: "movie-tab-a8ba3",
  storageBucket: "movie-tab-a8ba3.appspot.com",
  messagingSenderId: "514632371740",
  appId: "1:514632371740:web:0dcb53bfe34ed5b71b59d9"
};

const PASSWORD = "dhogotheboss";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const uploadBtn = document.getElementById("upload-btn");
const searchBtn = document.getElementById("search-btn");
const categoryFilter = document.getElementById("category-filter");

const uploaderNameSpan = document.getElementById("uploader-name");
const uploadSection = document.getElementById("upload-section");
const uploaderInfo = document.getElementById("uploader-info");
const loginSection = document.getElementById("login-section");
const videosContainer = document.getElementById("videos-container");

let loggedIn = false;
let currentUploader = "";

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

logoutBtn.onclick = () => {
  loggedIn = false;
  loginSection.style.display = "flex";
  uploadSection.style.display = "none";
  uploaderInfo.style.display = "none";
};

uploadBtn.onclick = async () => {
  if (!loggedIn) {
    alert("Enter password first!");
    return;
  }

  const username = document.getElementById("username-input").value.trim();
  const videoUrl = document.getElementById("video-url").value.trim();
  const thumbnailUrl = document.getElementById("thumbnail-url").value.trim();
  const title = document.getElementById("video-title").value.trim();
  const category = document.getElementById("video-category").value;

  if (!username || !videoUrl || !title) {
    alert("Fill in all required fields.");
    return;
  }

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

    document.getElementById("username-input").value = "";
    document.getElementById("video-url").value = "";
    document.getElementById("thumbnail-url").value = "";
    document.getElementById("video-title").value = "";
    document.getElementById("video-category").value = "All";

    alert("Uploaded!");
    await loadAndRenderVideos();
  } catch (err) {
    console.error(err);
    alert("Failed to upload.");
  }
};

function convertYoutubeToEmbed(url) {
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([\w-]{11})/;
  const match = url.match(regExp);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

async function loadAndRenderVideos(searchTerm = "", category = "All") {
  videosContainer.innerHTML = "<p>Loading...</p>";

  let q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
  if (category !== "All") {
    q = query(collection(db, "videos"), where("category", "==", category), orderBy("createdAt", "desc"));
  }

  try {
    const snapshot = await getDocs(q);
    let videos = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      data.id = doc.id;
      videos.push(data);
    });

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      videos = videos.filter(v =>
        v.title.toLowerCase().includes(term) ||
        v.username?.toLowerCase().includes(term) ||
        v.category.toLowerCase().includes(term)
      );
    }

    if (videos.length === 0) {
      videosContainer.innerHTML = "<p>No videos found.</p>";
      return;
    }

    videosContainer.innerHTML = "";
    videos.forEach(v => {
      const el = createVideoCard(v);
      videosContainer.appendChild(el);
    });

  } catch (err) {
    console.error(err);
    videosContainer.innerHTML = "<p>Error loading videos.</p>";
  }
}

function createVideoCard(video) {
  const div = document.createElement("div");
  div.className = "video-card";

  let thumb;

  if (video.thumbnailUrl) {
    thumb = document.createElement("img");
    thumb.src = video.thumbnailUrl;
    thumb.className = "video-thumb";
    div.appendChild(thumb);
  } else if (video.videoUrl.includes("youtube")) {
    const iframe = document.createElement("iframe");
    iframe.src = convertYoutubeToEmbed(video.videoUrl);
    iframe.className = "video-thumb";
    iframe.allow = "autoplay; encrypted-media";
    iframe.allowFullscreen = true;
    div.appendChild(iframe);
  } else {
    const vid = document.createElement("video");
    vid.src = video.videoUrl;
    vid.className = "video-thumb";
    vid.controls = true;
    div.appendChild(vid);
  }

  // Center play button
  const playBtn = document.createElement("div");
  playBtn.className = "play-btn";
  playBtn.innerHTML = "▶";
  playBtn.onclick = () => {
    if (thumb && thumb.tagName === "IMG") {
      thumb.style.display = "none";
    }
    const vid = document.createElement("video");
    vid.src = video.videoUrl;
    vid.controls = true;
    vid.autoplay = true;
    vid.className = "video-thumb";
    div.insertBefore(vid, playBtn);
    playBtn.remove();
  };
  div.appendChild(playBtn);

  const title = document.createElement("div");
  title.className = "video-title";
  title.textContent = video.title;
  div.appendChild(title);

  const uploader = document.createElement("div");
  uploader.className = "video-uploader";
  uploader.textContent = "By: " + video.username;
  div.appendChild(uploader);

  const category = document.createElement("div");
  category.className = "video-category";
  category.textContent = "Category: " + video.category;
  div.appendChild(category);

  const likeBtn = document.createElement("button");
  likeBtn.textContent = `Like (${video.likesCount || 0})`;
  likeBtn.onclick = async () => {
    const newLikes = (video.likesCount || 0) + 1;
    likeBtn.textContent = `Like (${newLikes})`;
    await updateDoc(doc(db, "videos", video.id), { likesCount: newLikes });
  };
  div.appendChild(likeBtn);

  if (
    video.videoUrl.startsWith("http") &&
    !video.videoUrl.includes("youtube")
  ) {
    const downloadBtn = document.createElement("button");
    downloadBtn.className = "download-btn";
    downloadBtn.innerHTML = "⬇";
    let isDownloading = false;

    downloadBtn.onclick = () => {
      if (isDownloading) return;
      isDownloading = true;
      downloadBtn.textContent = "⏳ Downloading...";
      const a = document.createElement("a");
      a.href = video.videoUrl;
      a.download = "";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        downloadBtn.textContent = "✅ Downloaded";
      }, 2000);
    };

    div.appendChild(downloadBtn);
  }

  return div;
}

searchBtn.onclick = () => {
  const searchTerm = document.getElementById("search-input").value.trim();
  const cat = categoryFilter.value;
  loadAndRenderVideos(searchTerm, cat);
};

categoryFilter.onchange = () => {
  const searchTerm = document.getElementById("search-input").value.trim();
  const cat = categoryFilter.value;
  loadAndRenderVideos(searchTerm, cat);
};

// Load on start
loadAndRenderVideos();