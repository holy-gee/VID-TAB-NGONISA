import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp
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

const uploadBtn = document.getElementById("upload-btn");
const showFormBtn = document.getElementById("show-upload-form");
const uploadSection = document.getElementById("upload-section");

showFormBtn.onclick = () => {
  uploadSection.style.display = "block";
};

uploadBtn.onclick = async () => {
  const password = document.getElementById("upload-password").value;
  if (password !== "dhogotheboss") {
    alert("Wrong password!");
    return;
  }

  const username = document.getElementById("username").value.trim();
  const videoUrl = document.getElementById("video-url").value.trim();
  const thumbnail = document.getElementById("thumbnail-url").value.trim();
  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("upload-category").value;

  if (!username || !videoUrl || !title) {
    alert("Username, Video URL and Title are required.");
    return;
  }

  try {
    await addDoc(collection(db, "videos"), {
      username,
      videoUrl,
      thumbnail,
      title,
      category,
      createdAt: serverTimestamp()
    });

    alert("Uploaded successfully!");
    uploadSection.style.display = "none";
    loadVideos();
  } catch (e) {
    console.error("Upload failed", e);
    alert("Upload failed.");
  }
};

const videoList = document.getElementById("video-list");

async function loadVideos() {
  videoList.innerHTML = "Loading videos...";
  const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  videoList.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();

    const card = document.createElement("div");
    card.className = "video-card";

    if (data.thumbnail) {
      const thumb = document.createElement("img");
      thumb.src = data.thumbnail;
      thumb.className = "video-thumb";
      card.appendChild(thumb);
    }

    const title = document.createElement("div");
    title.className = "video-title";
    title.textContent = data.title;
    card.appendChild(title);

    const uploader = document.createElement("div");
    uploader.className = "video-uploader";
    uploader.textContent = "By: " + data.username;
    card.appendChild(uploader);

    const category = document.createElement("div");
    category.className = "video-category";
    category.textContent = "Category: " + data.category;
    card.appendChild(category);

    const controls = document.createElement("div");
    controls.className = "video-controls";

    const playBtn = document.createElement("button");
    playBtn.textContent = "▶ Play";
    playBtn.onclick = () => {
      window.open(data.videoUrl, "_blank");
    };
    controls.appendChild(playBtn);

    card.appendChild(controls);
    videoList.appendChild(card);
  });
}

document.getElementById("search-box").addEventListener("input", () => {
  loadVideos();
});

document.getElementById("category-filter").addEventListener("change", () => {
  loadVideos();
});

loadVideos();