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
  deleteDoc
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
const uploadBtn = document.getElementById("upload-btn");
const videoList = document.getElementById("video-list");
const categoryFilter = document.getElementById("category-filter");
const searchBox = document.getElementById("search-box");

uploadBtn.onclick = async () => {
  const password = document.getElementById("upload-password").value;
  const username = document.getElementById("username").value.trim();
  const url = document.getElementById("video-url").value.trim();
  const thumb = document.getElementById("thumbnail-url").value.trim();
  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("upload-category").value;
  const description = document.getElementById("description").value.trim();

  if (password !== PASSWORD) return alert("Wrong password.");
  if (!username || !url || !title) return alert("Missing required fields.");

  await addDoc(collection(db, "videos"), {
    username,
    videoUrl: url,
    thumbnailUrl: thumb,
    title,
    category,
    description,
    likesCount: 0,
    createdAt: new Date()
  });

  alert("Video uploaded!");
  loadVideos();
};

function convertYoutubeToEmbed(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? "https://www.youtube.com/embed/" + match[2]
    : url;
}

async function loadVideos() {
  videoList.innerHTML = "";
  const term = searchBox.value.toLowerCase();
  const category = categoryFilter.value;

  let q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  let videos = [...preloadedVideos]; // preloadedVideos from videos.js
  snapshot.forEach(doc => {
    const data = doc.data();
    data.id = doc.id;
    videos.push(data);
  });

  // Filter
  if (category !== "All") {
    videos = videos.filter(v => v.category === category);
  }
  if (term) {
    videos = videos.filter(
      v =>
        v.title.toLowerCase().includes(term) ||
        v.category.toLowerCase().includes(term) ||
        (v.username && v.username.toLowerCase().includes(term))
    );
  }

  if (videos.length === 0) {
    videoList.innerHTML = "<p>No videos found.</p>";
    return;
  }

  videos.forEach(renderVideo);
}

function renderVideo(video) {
  const card = document.createElement("div");
  card.className = "video-card";

  const thumb = document.createElement("img");
  thumb.className = "video-thumb";
  thumb.src = video.thumbnailUrl || "";
  if (thumb.src) card.appendChild(thumb);

  const title = document.createElement("div");
  title.className = "video-title";
  title.textContent = video.title;
  card.appendChild(title);

  const uploader = document.createElement("div");
  uploader.className = "video-uploader";
  uploader.textContent = "By: " + video.username;
  card.appendChild(uploader);

  const category = document.createElement("div");
  category.className = "video-category";
  category.textContent = "Category: " + video.category;
  card.appendChild(category);

  const frame = document.createElement("iframe");
  frame.width = "100%";
  frame.height = "180";
  frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  frame.allowFullscreen = true;
  frame.src = convertYoutubeToEmbed(video.videoUrl);
  card.appendChild(frame);

  const controls = document.createElement("div");
  controls.className = "video-controls";

  const like = document.createElement("button");
  like.className = "like-btn";
  like.textContent = `Like (${video.likesCount || 0})`;
  like.onclick = async () => {
    const newCount = (video.likesCount || 0) + 1;
    like.textContent = `Like (${newCount})`;
    await updateDoc(doc(db, "videos", video.id), { likesCount: newCount });
  };
  controls.appendChild(like);

  if (video.videoUrl.startsWith("http")) {
    const download = document.createElement("a");
    download.className = "download-btn";
    download.href = video.videoUrl;
    download.textContent = "Download";
    download.download = "";
    download.target = "_blank";
    controls.appendChild(download);
  }

  if (video.username === "Takunda") {
    const del = document.createElement("button");
    del.className = "delete-btn";
    del.textContent = "Delete";
    del.onclick = async () => {
      if (confirm("Delete this video?")) {
        await deleteDoc(doc(db, "videos", video.id));
        loadVideos();
      }
    };
    controls.appendChild(del);
  }

  card.appendChild(controls);
  videoList.appendChild(card);
}

// Search listeners
searchBox.oninput = loadVideos;
categoryFilter.onchange = loadVideos;

// Initial load
loadVideos();