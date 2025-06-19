// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  updateDoc,
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase config (replace with your own!)
const firebaseConfig = {
  apiKey: "AIzaSyBPdGAZT_U8xNBsU-S4NnC7WUQI8zM1LWI",
  authDomain: "vidfind-77a6a.firebaseapp.com",
  projectId: "vidfind-77a6a",
  storageBucket: "vidfind-77a6a.appspot.com",
  messagingSenderId: "813301438270",
  appId: "1:813301438270:web:2ebe4dec657167c5403e6f",
  measurementId: "G-N4NTHY2230",
};

const UPLOAD_PASSWORD = "dhogotheboss";
const DELETE_ALLOWED_USERNAME = "Takunda";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const searchBox = document.getElementById("search-box");
const searchBtn = document.getElementById("search-btn");
const categoryFilter = document.getElementById("category-filter");

const videosContainer = document.getElementById("videos-container");

const uploadSection = document.getElementById("upload-section");
const showUploadBtn = document.getElementById("show-upload-btn");
const uploadPasswordInput = document.getElementById("upload-password");
const usernameInput = document.getElementById("username");
const videoUrlInput = document.getElementById("video-url");
const thumbnailUrlInput = document.getElementById("thumbnail-url");
const titleInput = document.getElementById("title");
const uploadCategorySelect = document.getElementById("upload-category");
const uploadBtn = document.getElementById("upload-btn");

let loggedIn = false;
let currentUploader = "";

// Show/hide upload section button
showUploadBtn.onclick = () => {
  if (uploadSection.style.display === "none" || uploadSection.style.display === "") {
    uploadSection.style.display = "block";
    showUploadBtn.textContent = "Hide Upload Section";
  } else {
    uploadSection.style.display = "none";
    showUploadBtn.textContent = "Show Upload Section";
  }
};

// Upload video handler
uploadBtn.onclick = async () => {
  const pass = uploadPasswordInput.value.trim();
  if (pass !== UPLOAD_PASSWORD) {
    alert("Wrong upload password!");
    return;
  }

  const username = usernameInput.value.trim();
  const videoUrl = videoUrlInput.value.trim();
  const thumbnailUrl = thumbnailUrlInput.value.trim();
  const title = titleInput.value.trim();
  const category = uploadCategorySelect.value;

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
      likesCount: 0,
      createdAt: new Date(),
    });

    alert("Video uploaded successfully!");

    // Clear inputs
    usernameInput.value = "";
    videoUrlInput.value = "";
    thumbnailUrlInput.value = "";
    titleInput.value = "";
    uploadPasswordInput.value = "";

    // Refresh list
    loadAndRenderVideos();
  } catch (err) {
    console.error("Upload error:", err);
    alert("Failed to upload video.");
  }
};

// Convert YouTube URL to embed URL
function convertYoutubeToEmbed(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return "https://www.youtube.com/embed/" + match[2];
  }
  return url;
}

// Load and render videos from Firestore with optional search & category filter
async function loadAndRenderVideos() {
  const searchTerm = searchBox.value.trim().toLowerCase();
  const category = categoryFilter.value;

  videosContainer.innerHTML = "<p>Loading videos...</p>";

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
    let videos = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      data.id = docSnap.id;
      videos.push(data);
    });

    // Filter by search term
    if (searchTerm) {
      videos = videos.filter(
        (v) =>
          v.title.toLowerCase().includes(searchTerm) ||
          v.username.toLowerCase().includes(searchTerm) ||
          v.category.toLowerCase().includes(searchTerm)
      );
    }

    if (videos.length === 0) {
      videosContainer.innerHTML = "<p>No videos found.</p>";
      return;
    }

    videosContainer.innerHTML = "";
    videos.forEach((video) => {
      videosContainer.appendChild(createVideoCard(video));
    });
  } catch (err) {
    console.error("Error loading videos:", err);
    videosContainer.innerHTML = "<p>Failed to load videos.</p>";
  }
}

// Create a video card element
function createVideoCard(video) {
  const card = document.createElement("div");
  card.className = "video-card";

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
    iframe.width = "100%";
    iframe.height = "170";
    iframe.src = convertYoutubeToEmbed(video.videoUrl);
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    card.appendChild(iframe);
  } else {
    const videoEl = document.createElement("video");
    videoEl.className = "video-thumb";
    videoEl.src = video.videoUrl;
    videoEl.controls = true;
    card.appendChild(videoEl);
  }

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

  // Controls container
  const controls = document.createElement("div");
  controls.className = "video-controls";

  // Like button
  const likeBtn = document.createElement("button");
  likeBtn.className = "like-btn";
  likeBtn.textContent = `Like (${video.likesCount || 0})`;
  likeBtn.onclick = async () => {
    const newLikes = (video.likesCount || 0) + 1;
    try {
      await updateDoc(doc(db, "videos", video.id), { likesCount: newLikes });
      video.likesCount = newLikes;
      likeBtn.textContent = `Like (${newLikes})`;
    } catch (err) {
      alert("Failed to like video.");
      console.error(err);
    }
  };
  controls.appendChild(likeBtn);

  // Download button only for direct video URLs (not YouTube)
  if (
    !video.videoUrl.includes("youtube.com") &&
    !video.videoUrl.includes("youtu.be") &&
    /^https?:\/\//.test(video.videoUrl)
  ) {
    const downloadBtn = document.createElement("a");
    downloadBtn.className = "download-btn";
    downloadBtn.href = video.videoUrl;
    downloadBtn.target = "_blank";
    downloadBtn.download = "";
    downloadBtn.textContent = "Download";
    controls.appendChild(downloadBtn);
  }

  // Delete button only for uploader with correct password
  if (loggedIn && currentUploader === DELETE_ALLOWED_USERNAME) {
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = async () => {
      if (!confirm("Delete this video?")) return;
      try {
        await deleteDoc(doc(db, "videos", video.id));
        alert("Video deleted.");
        loadAndRenderVideos();
      } catch (err) {
        alert("Failed to delete video.");
        console.error(err);
      }
    };
    controls.appendChild(deleteBtn);
  }

  card.appendChild(controls);

  return card;
}

// Search button event
searchBtn.onclick = () => {
  loadAndRenderVideos();
};

// Category filter event
categoryFilter.onchange = () => {
  loadAndRenderVideos();
};

// Load videos on page load
loadAndRenderVideos();