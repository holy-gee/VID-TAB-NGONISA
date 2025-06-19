// app.js
import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  deleteDoc,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const PASSWORD = "dhogotheboss";
const DELETE_ALLOWED_USERNAME = "Takunda";

const uploadPasswordInput = document.getElementById("upload-password");
const usernameInput = document.getElementById("username");
const videoUrlInput = document.getElementById("video-url");
const thumbnailUrlInput = document.getElementById("thumbnail-url");
const titleInput = document.getElementById("title");
const categorySelect = document.getElementById("upload-category");
const descriptionInput = document.getElementById("description");
const uploadBtn = document.getElementById("upload-btn");

const searchBox = document.getElementById("search-box");
const categoryFilter = document.getElementById("category-filter");
const videoList = document.getElementById("video-list");

let loggedIn = false;
let currentUploader = "";

// Upload video handler
uploadBtn.onclick = async () => {
  if (uploadPasswordInput.value !== PASSWORD) {
    alert("Incorrect upload password.");
    return;
  }
  const username = usernameInput.value.trim();
  const videoUrl = videoUrlInput.value.trim();
  const thumbnailUrl = thumbnailUrlInput.value.trim();
  const title = titleInput.value.trim();
  const category = categorySelect.value;
  const description = descriptionInput.value.trim();

  if (!username || !videoUrl || !title) {
    alert("Please fill username, video URL, and title.");
    return;
  }

  try {
    await addDoc(collection(db, "videos"), {
      username,
      videoUrl,
      thumbnailUrl,
      title,
      category,
      description,
      likesCount: 0,
      createdAt: new Date(),
    });

    alert("Video uploaded!");
    // Clear inputs
    usernameInput.value = "";
    videoUrlInput.value = "";
    thumbnailUrlInput.value = "";
    titleInput.value = "";
    descriptionInput.value = "";
    uploadPasswordInput.value = "";
    categorySelect.value = "Kids";

    // Reload videos
    loadAndRenderVideos();
  } catch (e) {
    console.error(e);
    alert("Failed to upload video.");
  }
};

// Utility: Convert YouTube URL to embed URL
function convertYoutubeToEmbed(url) {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return "https://www.youtube.com/embed/" + match[2];
  }
  return url;
}

// Create a video card element
function createVideoCard(video) {
  const card = document.createElement("div");
  card.className = "video-card";

  // Thumbnail or video player
  if (video.thumbnailUrl) {
    const img = document.createElement("img");
    img.className = "video-thumb";
    img.src = video.thumbnailUrl;
    card.appendChild(img);
  } else if (
    video.videoUrl.includes("youtube.com") ||
    video.videoUrl.includes("youtu.be")
  ) {
    const iframe = document.createElement("iframe");
    iframe.className = "video-thumb";
    iframe.src = convertYoutubeToEmbed(video.videoUrl);
    iframe.width = "100%";
    iframe.height = "170";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    card.appendChild(iframe);
  } else {
    const vid = document.createElement("video");
    vid.className = "video-thumb";
    vid.src = video.videoUrl;
    vid.controls = true;
    card.appendChild(vid);
  }

  const title = document.createElement("div");
  title.className = "video-title";
  title.textContent = video.title;
  card.appendChild(title);

  if (video.description) {
    const desc = document.createElement("div");
    desc.className = "video-description";
    desc.textContent = video.description;
    card.appendChild(desc);
  }

  const meta = document.createElement("div");
  meta.className = "video-meta";
  meta.textContent = `By ${video.username} | Category: ${video.category}`;
  card.appendChild(meta);

  const actions = document.createElement("div");
  actions.className = "video-actions";

  // Like button
  const likeBtn = document.createElement("button");
  likeBtn.textContent = `Like (${video.likesCount || 0})`;
  likeBtn.onclick = async () => {
    const newLikes = (video.likesCount || 0) + 1;
    try {
      await updateDoc(doc(db, "videos", video.id), { likesCount: newLikes });
      video.likesCount = newLikes;
      likeBtn.textContent = `Like (${newLikes})`;
    } catch {
      alert("Failed to update like.");
    }
  };
  actions.appendChild(likeBtn);

  // Download button if direct URL
  if (
    !video.videoUrl.includes("youtube.com") &&
    !video.videoUrl.includes("youtu.be") &&
    video.videoUrl.match(/^https?:\/\//)
  ) {
    const downloadLink = document.createElement("a");
    downloadLink.href = video.videoUrl;
    downloadLink.textContent = "Download";
    downloadLink.download = "";
    downloadLink.target = "_blank";
    downloadLink.className = "download-btn";
    downloadLink.style.padding = "0.4rem 0.8rem";
    downloadLink.style.backgroundColor = "#900";
    downloadLink.style.color = "white";
    downloadLink.style.borderRadius = "5px";
    downloadLink.style.textDecoration = "none";
    downloadLink.style.marginLeft = "0.3rem";
    actions.appendChild(downloadLink);
  }

  // Delete button - only if username matches and password entered
  if (
    usernameInput.value.trim() === DELETE_ALLOWED_USERNAME &&
    uploadPasswordInput.value === PASSWORD
  ) {
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.style.backgroundColor = "#b00";
    deleteBtn.style.marginLeft = "0.3rem";
    deleteBtn.onclick = async () => {
      if (confirm("Delete this video?")) {
        try {
          await deleteDoc(doc(db, "videos", video.id));
          alert("Deleted