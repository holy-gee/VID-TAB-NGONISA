import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBPdGAZT_U8xNBsU-S4NnC7WUQI8zM1LWI",
  authDomain: "vidfind-77a6a.firebaseapp.com",
  projectId: "vidfind-77a6a",
  storageBucket: "vidfind-77a6a.appspot.com",
  messagingSenderId: "813301438270",
  appId: "1:813301438270:web:2ebe4dec657167c5403e6f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const uploadSection = document.getElementById("upload-section");
const toggleUploadBtn = document.getElementById("toggle-upload");
const uploadBtn = document.getElementById("uploadBtn");

const videoList = document.getElementById("video-list");
const searchBtn = document.getElementById("searchBtn");

toggleUploadBtn.onclick = () => {
  uploadSection.style.display =
    uploadSection.style.display === "none" ? "block" : "none";
};

uploadBtn.onclick = async () => {
  const pass = document.getElementById("upload-password").value;
  if (pass !== "dhogotheboss") return alert("Wrong password");

  const username = document.getElementById("username").value.trim();
  const videoUrl = document.getElementById("video-url").value.trim();
  const thumbnailUrl = document.getElementById("thumbnail-url").value.trim();
  const title = document.getElementById("title").value.trim();

  if (!username || !videoUrl || !title) {
    return alert("Fill all fields!");
  }

  await addDoc(collection(db, "videos"), {
    username,
    videoUrl,
    thumbnailUrl,
    title,
    createdAt: new Date()
  });

  alert("Video uploaded!");
  loadVideos();
};

function createVideoCard(video) {
  const card = document.createElement("div");
  card.className = "video-card";

  if (video.thumbnailUrl) {
    const img = document.createElement("img");
    img.src = video.thumbnailUrl;
    card.appendChild(img);
  }

  const title = document.createElement("h3");
  title.innerText = video.title;
  card.appendChild(title);

  const uploader = document.createElement("p");
  uploader.innerText = "By " + video.username;
  card.appendChild(uploader);

  if (video.videoUrl.includes("youtube")) {
    const iframe = document.createElement("iframe");
    iframe.src = video.videoUrl.replace("watch?v=", "embed/");
    iframe.allowFullscreen = true;
    card.appendChild(iframe);
  } else {
    const vid = document.createElement("video");
    vid.src = video.videoUrl;
    vid.controls = true;
    card.appendChild(vid);
  }

  const downloadBtn = document.createElement("a");
  downloadBtn.href = video.videoUrl;
  downloadBtn.textContent = "Download";
  downloadBtn.className = "download-btn";
  downloadBtn.setAttribute("download", "");
  card.appendChild(downloadBtn);

  return card;
}

async function loadVideos(term = "") {
  videoList.innerHTML = "Loading...";
  const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  videoList.innerHTML = "";
  snap.forEach((doc) => {
    const data = doc.data();
    if (
      !term ||
      data.title.toLowerCase().includes(term.toLowerCase()) ||
      data.username.toLowerCase().includes(term.toLowerCase())
    ) {
      videoList.appendChild(createVideoCard(data));
    }
  });
}

searchBtn.onclick = () => {
  const term = document.getElementById("search").value;
  loadVideos(term);
};

loadVideos();