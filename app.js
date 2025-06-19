import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const videoList = document.getElementById("video-list");
const uploadBtn = document.getElementById("upload-btn");
const passwordField = document.getElementById("upload-password");

const UPLOAD_PASSWORD = "dhogotheboss";

// Upload Video
uploadBtn.onclick = async () => {
  const username = document.getElementById("username").value.trim();
  const videoUrl = document.getElementById("video-url").value.trim();
  const thumbnail = document.getElementById("thumbnail-url").value.trim();
  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("upload-category").value;
  const description = document.getElementById("description").value.trim();
  const password = passwordField.value;

  if (password !== UPLOAD_PASSWORD) {
    alert("Incorrect password.");
    return;
  }

  if (!username || !videoUrl || !title) {
    alert("Please fill in all required fields.");
    return;
  }

  try {
    await addDoc(collection(db, "videos"), {
      username,
      videoUrl,
      thumbnail,
      title,
      category,
      description,
      createdAt: new Date()
    });
    alert("Video uploaded!");
    loadVideos();
  } catch (err) {
    console.error("Upload error:", err);
    alert("Failed to upload video.");
  }
};

// Load Videos
async function loadVideos() {
  videoList.innerHTML = "";
  const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach((docSnap) => {
    const video = docSnap.data();
    const card = document.createElement("div");
    card.className = "video-card";

    // Thumbnail or embedded video
    if (video.thumbnail) {
      const img = document.createElement("img");
      img.src = video.thumbnail;
      card.appendChild(img);
    } else if (video.videoUrl.includes("youtube.com") || video.videoUrl.includes("youtu.be")) {
      const iframe = document.createElement("iframe");
      iframe.src = convertToEmbed(video.videoUrl);
      iframe.frameBorder = "0";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      card.appendChild(iframe);
    } else {
      const vid = document.createElement("video");
      vid.src = video.videoUrl;
      vid.controls = true;
      card.appendChild(vid);
    }

    const title = document.createElement("h3");
    title.textContent = video.title;
    card.appendChild(title);

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `By: ${video.username} | ${video.category}`;
    card.appendChild(meta);

    videoList.appendChild(card);
  });
}

function convertToEmbed(url) {
  const regExp = /^.*(?:youtu.be\/|v\/|watch\?v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[1]
    ? `https://www.youtube.com/embed/${match[1]}`
    : url;
}

// Filters
document.getElementById("search-box").oninput = loadVideos;
document.getElementById("category-filter").onchange = loadVideos;

loadVideos();