import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const uploadSection = document.getElementById("upload-section");
const uploadBtn = document.getElementById("upload-btn");
const videoList = document.getElementById("video-list");
const searchBox = document.getElementById("search-box");
const categoryFilter = document.getElementById("category-filter");

const PASSWORD = "dhogotheboss";

uploadSection.style.display = "none";

document.getElementById("upload-btn").onclick = async () => {
  const password = document.getElementById("upload-password").value;
  if (password !== PASSWORD) {
    alert("Incorrect password!");
    return;
  }

  const username = document.getElementById("username").value.trim();
  const videoUrl = document.getElementById("video-url").value.trim();
  const thumbnailUrl = document.getElementById("thumbnail-url").value.trim();
  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("upload-category").value;

  if (!username || !videoUrl || !title) {
    alert("Please fill in all required fields.");
    return;
  }

  try {
    await addDoc(collection(db, "videos"), {
      username,
      videoUrl,
      thumbnailUrl,
      title,
      category,
      likes: 0,
      comments: [],
      subscribers: [],
      saved: [],
      createdAt: Date.now()
    });
    alert("Video uploaded!");
    loadVideos();
  } catch (err) {
    alert("Upload failed: " + err.message);
  }
};

function createVideoCard(videoData, docId) {
  const div = document.createElement("div");
  div.className = "video-card";

  const preview = document.createElement("div");

  if (videoData.thumbnailUrl) {
    const img = document.createElement("img");
    img.src = videoData.thumbnailUrl;
    img.className = "video-thumb";
    preview.appendChild(img);
  } else {
    const iframe = document.createElement("iframe");
    iframe.src = convertYoutube(videoData.videoUrl);
    iframe.width = "100%";
    iframe.height = "170";
    iframe.allowFullscreen = true;
    preview.appendChild(iframe);
  }

  const playBtn = document.createElement("div");
  playBtn.className = "play-overlay";
  playBtn.textContent = "▶";
  preview.appendChild(playBtn);
  div.appendChild(preview);

  const title = document.createElement("div");
  title.className = "video-title";
  title.textContent = videoData.title;
  div.appendChild(title);

  const uploader = document.createElement("div");
  uploader.className = "video-uploader";
  uploader.textContent = "Uploaded by: " + videoData.username;
  div.appendChild(uploader);

  const cat = document.createElement("div");
  cat.className = "video-category";
  cat.textContent = "Category: " + videoData.category;
  div.appendChild(cat);

  const controls = document.createElement("div");
  controls.className = "video-controls";

  const likeBtn = document.createElement("button");
  likeBtn.textContent = `👍 ${videoData.likes}`;
  likeBtn.onclick = async () => {
    await updateDoc(doc(db, "videos", docId), {
      likes: videoData.likes + 1
    });
    loadVideos();
  };
  controls.appendChild(likeBtn);

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "💾 Save";
  controls.appendChild(saveBtn);

  const subBtn = document.createElement("button");
  subBtn.textContent = "🔔 Subscribe";
  controls.appendChild(subBtn);

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑️ Delete";
  deleteBtn.onclick = async () => {
    const currentUser = document.getElementById("username").value.trim();
    if (currentUser === videoData.username) {
      await deleteDoc(doc(db, "videos", docId));
      alert("Video deleted.");
      loadVideos();
    } else {
      alert("Only uploader can delete this video.");
    }
  };
  controls.appendChild(deleteBtn);

  div.appendChild(controls);

  const commentSection = document.createElement("div");
  commentSection.className = "comment-section";
  const textarea = document.createElement("textarea");
  textarea.placeholder = "Leave a comment";
  const commentBtn = document.createElement("button");
  commentBtn.textContent = "Post";

  commentBtn.onclick = () => {
    alert("Comment feature coming soon.");
  };

  commentSection.appendChild(textarea);
  commentSection.appendChild(commentBtn);
  div.appendChild(commentSection);

  return div;
}

function convertYoutube(url) {
  const regex = /(?:youtube\.com.*(?:\\?|&)v=|youtu\.be\/)([^&\n]+)/;
  const match = url.match(regex);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
}

async function loadVideos() {
  videoList.innerHTML = "Loading...";
  const snap = await getDocs(query(collection(db, "videos"), orderBy("createdAt", "desc")));
  videoList.innerHTML = "";
  const term = searchBox.value.trim().toLowerCase();
  const category = categoryFilter.value;

  snap.forEach((docSnap) => {
    const data = docSnap.data();
    if (
      (category === "All" || data.category === category) &&
      (data.title.toLowerCase().includes(term) || data.username.toLowerCase().includes(term))
    ) {
      const card = createVideoCard(data, docSnap.id);
      videoList.appendChild(card);
    }
  });
}

searchBox.oninput = () => loadVideos();
categoryFilter.onchange = () => loadVideos();

loadVideos();