import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from './firebase-config.js';

const PASSWORD = "dhogotheboss";
let currentUser = null;

// DOM Elements
const uploadBtn = document.getElementById("upload-btn");
const uploadForm = document.getElementById("upload-form");
const toggleUploadBtn = document.getElementById("toggle-upload-btn");
const searchBox = document.getElementById("search-box");
const categoryFilter = document.getElementById("category-filter");
const videoList = document.getElementById("video-list");

// Toggle Upload Form
toggleUploadBtn.onclick = () => {
  const pass = prompt("Enter upload password:");
  if (pass === PASSWORD) {
    uploadForm.style.display = uploadForm.style.display === "block" ? "none" : "block";
  } else {
    alert("Incorrect password!");
  }
};

// Upload Video
uploadBtn.onclick = async () => {
  const username = document.getElementById("username").value.trim();
  const videoUrl = document.getElementById("video-url").value.trim();
  const thumbnailUrl = document.getElementById("thumbnail-url").value.trim();
  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("upload-category").value;

  if (!username || !videoUrl || !title) {
    alert("Please fill in username, video URL, and title.");
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
      subscribers: 0,
      comments: [],
      createdAt: Timestamp.now()
    });
    alert("Video uploaded successfully!");
    loadVideos();
  } catch (e) {
    console.error("Upload failed:", e);
    alert("Error uploading video.");
  }
};

// Load Videos
async function loadVideos(searchTerm = "", category = "All") {
  videoList.innerHTML = "<p>Loading videos...</p>";

  let q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  let videos = [];

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    data.id = docSnap.id;
    videos.push(data);
  });

  // Filter
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    videos = videos.filter(v =>
      v.title.toLowerCase().includes(term) ||
      v.username.toLowerCase().includes(term) ||
      v.category.toLowerCase().includes(term)
    );
  }

  if (category !== "All") {
    videos = videos.filter(v => v.category === category);
  }

  // Render
  if (videos.length === 0) {
    videoList.innerHTML = "<p>No videos found.</p>";
  } else {
    videoList.innerHTML = "";
    videos.forEach(renderVideo);
  }
}

function renderVideo(video) {
  const div = document.createElement("div");
  div.className = "video-card";

  const title = document.createElement("h3");
  title.textContent = video.title;

  const uploader = document.createElement("p");
  uploader.textContent = `By ${video.username}`;

  const thumb = document.createElement("img");
  thumb.src = video.thumbnailUrl || "https://via.placeholder.com/320x180.png?text=No+Thumbnail";

  const iframe = document.createElement("iframe");
  iframe.src = convertYoutube(video.videoUrl);
  iframe.width = "100%";
  iframe.height = "180";
  iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
  iframe.allowFullscreen = true;

  const likeBtn = document.createElement("button");
  likeBtn.textContent = `👍 Like (${video.likes || 0})`;
  likeBtn.onclick = async () => {
    const newCount = (video.likes || 0) + 1;
    await updateDoc(doc(db, "videos", video.id), { likes: newCount });
    likeBtn.textContent = `👍 Like (${newCount})`;
  };

  const subBtn = document.createElement("button");
  subBtn.textContent = `🔔 Subscribe (${video.subscribers || 0})`;
  subBtn.onclick = async () => {
    const newSub = (video.subscribers || 0) + 1;
    await updateDoc(doc(db, "videos", video.id), { subscribers: newSub });
    subBtn.textContent = `🔔 Subscribe (${newSub})`;
  };

  const commentInput = document.createElement("input");
  commentInput.placeholder = "Add a comment...";
  const commentBtn = document.createElement("button");
  commentBtn.textContent = "💬 Comment";
  commentBtn.onclick = async () => {
    const comment = commentInput.value.trim();
    if (!comment) return;
    const updatedComments = [...(video.comments || []), comment];
    await updateDoc(doc(db, "videos", video.id), { comments: updatedComments });
    commentInput.value = "";
    alert("Comment added.");
  };

  const downloadBtn = document.createElement("a");
  downloadBtn.textContent = "⬇️ Download";
  downloadBtn.href = video.videoUrl;
  downloadBtn.download = "";
  downloadBtn.target = "_blank";

  div.append(title, uploader, iframe, likeBtn, subBtn, commentInput, commentBtn, downloadBtn);
  videoList.appendChild(div);
}

// Convert YouTube link to embed
function convertYoutube(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

// Event Listeners
searchBox.oninput = () => {
  loadVideos(searchBox.value, categoryFilter.value);
};
categoryFilter.onchange = () => {
  loadVideos(searchBox.value, categoryFilter.value);
};

// Initial Load
loadVideos();