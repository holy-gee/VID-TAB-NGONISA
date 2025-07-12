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

const loginBtn = document.getElementById("login-btn");
const uploadBtn = document.getElementById("upload-btn");
const logoutBtn = document.getElementById("logout-btn");
const uploaderNameSpan = document.getElementById("uploader-name");
const uploadSection = document.getElementById("upload-section");
const loginSection = document.getElementById("login-section");
const uploaderInfo = document.getElementById("uploader-info");
const videosContainer = document.getElementById("videos-container");
const searchBtn = document.getElementById("search-btn");
const categoryFilter = document.getElementById("category-filter");

let loggedIn = false;

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
  uploadSection.style.display = "none";
  uploaderInfo.style.display = "none";
  loginSection.style.display = "flex";
};

uploadBtn.onclick = async () => {
  if (!loggedIn) return alert("Please log in first.");

  const username = document.getElementById("username-input").value.trim();
  const videoUrl = document.getElementById("video-url").value.trim();
  const thumbnailUrl = document.getElementById("thumbnail-url").value.trim();
  const title = document.getElementById("video-title").value.trim();
  const category = document.getElementById("video-category").value;

  if (!username || !videoUrl || !title) {
    return alert("Fill in username, video URL, and title.");
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

    alert("Video uploaded successfully!");
    loadAndRenderVideos();
  } catch (e) {
    console.error("Upload error", e);
    alert("Failed to upload video.");
  }
};

async function loadAndRenderVideos(searchTerm = "", category = "All") {
  videosContainer.innerHTML = "<p>Loading videos...</p>";

  let q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
  if (category !== "All") {
    q = query(collection(db, "videos"), where("category", "==", category), orderBy("createdAt", "desc"));
  }

  try {
    const querySnapshot = await getDocs(q);
    const videos = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      data.id = docSnap.id;
      videos.push(data);
    });

    videosContainer.innerHTML = "";
    videos.forEach((video) => {
      const card = createVideoCard(video);
      videosContainer.appendChild(card);
    });
  } catch (e) {
    console.error("Load error", e);
    videosContainer.innerHTML = "<p>Failed to load videos.</p>";
  }
}

function createVideoCard(video) {
  const div = document.createElement("div");
  div.className = "video-card";

  const img = document.createElement("img");
  img.className = "video-thumb";
  img.src = video.thumbnailUrl || "";
  div.appendChild(img);

  const playBtn = document.createElement("div");
  playBtn.className = "play-btn";
  playBtn.textContent = "▶️";
  playBtn.onclick = () => {
    window.open(video.videoUrl, "_blank");
  };
  div.appendChild(playBtn);

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

  const likeBtn = document.createElement("button");
  likeBtn.className = "like-btn";
  likeBtn.textContent = `Like (${video.likesCount || 0})`;
  likeBtn.onclick = async () => {
    const newCount = (video.likesCount || 0) + 1;
    likeBtn.textContent = `Like (${newCount})`;
    await updateDoc(doc(db, "videos", video.id), { likesCount: newCount });
    video.likesCount = newCount;
  };
  div.appendChild(likeBtn);

  const downloadBtn = document.createElement("button");
  downloadBtn.className = "download-btn";
  downloadBtn.textContent = "⬇️";
  let downloading = false;
  let done = false;

  downloadBtn.onclick = () => {
    if (done) return;
    if (!downloading) {
      downloadBtn.textContent = "Downloading... ⏸️";
      downloading = true;

      setTimeout(() => {
        downloadBtn.textContent = "✅ Downloaded";
        done = true;
      }, 3000);
    } else {
      downloadBtn.textContent = "⬇️";
      downloading = false;
    }
  };

  div.appendChild(downloadBtn);

  return div;
}

searchBtn.onclick = () => {
  const term = document.getElementById("search-input").value.trim();
  const cat = categoryFilter.value;
  loadAndRenderVideos(term, cat);
};

categoryFilter.onchange = () => {
  const term = document.getElementById("search-input").value.trim();
  const cat = categoryFilter.value;
  loadAndRenderVideos(term, cat);
};

loadAndRenderVideos();