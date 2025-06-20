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
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBPdGAZT_U8xNBsU-S4NnC7WUQI8zM1LWI",
  authDomain: "vidfind-77a6a.firebaseapp.com",
  projectId: "vidfind-77a6a",
  storageBucket: "vidfind-77a6a.appspot.com",
  messagingSenderId: "813301438270",
  appId: "1:813301438270:web:2ebe4dec657167c5403e6f",
  measurementId: "G-N4NTHY2230",
};

const PASSWORD = "dhogotheboss";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const loginSection = document.getElementById("login-section");
const loginBtn = document.getElementById("login-btn");
const uploadSection = document.getElementById("upload-section");
const uploaderInfo = document.getElementById("uploader-info");
const uploaderNameSpan = document.getElementById("uploader-name");
const logoutBtn = document.getElementById("logout-btn");

const usernameInput = document.getElementById("username-input");
const videoUrlInput = document.getElementById("video-url");
const thumbnailUrlInput = document.getElementById("thumbnail-url");
const videoTitleInput = document.getElementById("video-title");
const videoCategorySelect = document.getElementById("video-category");
const uploadBtn = document.getElementById("upload-btn");

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const categoryFilter = document.getElementById("category-filter");

const videosContainer = document.getElementById("videos-container");

let loggedIn = false;
let currentUploader = "";

// Login
loginBtn.onclick = () => {
  const pass = document.getElementById("upload-password").value;
  if (pass === PASSWORD) {
    loggedIn = true;
    loginSection.style.display = "none";
    uploadSection.style.display = "flex";
    uploaderInfo.style.display = "block";
    currentUploader = "";
  } else {
    alert("Wrong password!");
  }
};

// Logout
logoutBtn.onclick = () => {
  loggedIn = false;
  uploadSection.style.display = "none";
  uploaderInfo.style.display = "none";
  loginSection.style.display = "flex";
  currentUploader = "";
};

// Upload video
uploadBtn.onclick = async () => {
  if (!loggedIn) {
    alert("You must enter the password to upload.");
    return;
  }
  const username = usernameInput.value.trim();
  const videoUrl = videoUrlInput.value.trim();
  const thumbnailUrl = thumbnailUrlInput.value.trim();
  const title = videoTitleInput.value.trim();
  const category = videoCategorySelect.value;

  if (!username || !videoUrl || !title) {
    alert("Please fill in username, video URL, and title.");
    return;
  }

  currentUploader = username;
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

    // Clear inputs
    usernameInput.value = "";
    videoUrlInput.value = "";
    thumbnailUrlInput.value = "";
    videoTitleInput.value = "";
    videoCategorySelect.value = "All";

    alert("Video uploaded successfully!");
    await loadAndRenderVideos();
  } catch (err) {
    console.error("Error uploading video:", err);
    alert("Failed to upload video.");
  }
};

// Convert YouTube URL to embed URL
function convertYoutubeToEmbed(url) {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return "https://www.youtube.com/embed/" + match[2];
  }
  return url;
}

// Render videos to DOM
async function loadAndRenderVideos(searchTerm = "", category = "All") {
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
    const videos = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      data.id = docSnap.id;
      videos.push(data);
    });

    // Filter by search term if any
    let filtered = videos;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = videos.filter(
        (v) =>
          v.title.toLowerCase().includes(term) ||
          v.category.toLowerCase().includes(term) ||
          (v.username && v.username.toLowerCase().includes(term))
      );
    }

    if (filtered.length === 0) {
      videosContainer.innerHTML = "<p>No videos found.</p>";
      return;
    }

    videosContainer.innerHTML = "";
    filtered.forEach((video) => {
      const card = createVideoCard(video);
      videosContainer.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading videos:", err);
    videosContainer.innerHTML = "<p>Failed to load videos.</p>";
  }
}

// Create video card element
function createVideoCard(video) {
  const div = document.createElement("div");
  div.className = "video-card";

  if (video.thumbnailUrl) {
    const img = document.createElement("img");
    img.className = "video-thumb";
    img.src = video.thumbnailUrl;
    div.appendChild(img);
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
    div.appendChild(iframe);
  } else {
    const videoEl = document.createElement("video");
    videoEl.className = "video-thumb";
    videoEl.src = video.videoUrl;
    videoEl.controls = true;
    div.appendChild(videoEl);
  }

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

  // Controls container
  const controls = document.createElement("div");
  controls.className = "video-controls";

  // Like button
  const likeBtn = document.createElement("button");
  likeBtn.className = "like-btn";
  likeBtn.textContent = `Like (${video.likesCount || 0})`;
  likeBtn.onclick = async () => {
    const newCount = (video.likesCount || 0) + 1;
    likeBtn.textContent = `Like (${newCount})`;
    try {
      await updateDoc(doc(db, "videos", video.id), { likesCount: newCount });
      video.likesCount = newCount; // update local
    } catch (err) {
      console.error("Failed to update likes:", err);
      alert("Failed to like video.");
    }
  };
  controls.appendChild(likeBtn);

  // Download button for direct links only (not embedded YouTube)
  if (
    !video.videoUrl.includes("youtube.com") &&
    !video.videoUrl.includes("youtu.be") &&
    video.videoUrl.match(/^https?:\/\//)
  ) {
    const downloadBtn = document.createElement("button");
    downloadBtn.className = "download-btn";
    downloadBtn.textContent = "Download";
    controls.appendChild(downloadBtn);

    // Download status indicator
    const statusDiv = document.createElement("div");
    statusDiv.className = "download-status";
    statusDiv.style.display = "none";
    controls.appendChild(statusDiv);

    const outerCircle = document.createElement("div");
    outerCircle.className = "outer-circle";
    statusDiv.appendChild(outerCircle);

    const progressCircle = document.createElement("div");
    progressCircle.className = "progress-circle";
    statusDiv.appendChild(progressCircle);

    const fill = document.createElement("div");
    fill.className = "fill";
    progressCircle.appendChild(fill);

    // Download button click event
    downloadBtn.onclick = () => {
      statusDiv.style.display = "inline-block";
      downloadBtn.disabled = true;

      downloadVideoWithProgress(video.videoUrl, fill)
        .then(() => {
          alert("Download completed!");
          statusDiv.style.display = "none";
          downloadBtn.disabled = false;
        })
        .catch((e) => {
          alert("Download failed!");
          console.error(e);
          statusDiv.style.display = "none";
          downloadBtn.disabled = false;
        });
    };
  }

  div.appendChild(controls);

  return div;
}

// Download video with progress animation & saving file
async function downloadVideoWithProgress(url, fillElem) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");

      const contentLength = response.headers.get("content-length");
      if (!contentLength) {
        // No content-length header, just download directly
        const blob = await response.blob();
        saveBlob(blob, extractFilename(url));
        resolve();
        return;
      }

      const total = parseInt(contentLength, 10);
      let loaded = 0;

      const reader = response.body.getReader();
      const chunks = [];

      function updateProgress() {
        const percent = loaded / total;
        fillElem.style.transform = `rotate(${percent * 360}deg)`;
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        updateProgress();
      }

      const blob = new Blob(chunks);
      saveBlob(blob, extractFilename(url));
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

// Save Blob as file to user device
function saveBlob(blob, filename) {
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Extract filename from URL
function extractFilename(url) {
  try {
    const pathname = new URL(url).pathname;
    const name = pathname.substring(pathname.lastIndexOf("/") + 1);
    return name || "downloaded_video";
  } catch {
    return "downloaded_video";
  }
}

// Search button click
searchBtn.onclick = () => {
  const term = searchInput.value.trim();
  const cat = categoryFilter.value;
  loadAndRenderVideos(term, cat);
};

// Category filter change
categoryFilter.onchange = () => {
  const term = searchInput.value.trim();
  const cat = categoryFilter.value;
  loadAndRenderVideos(term, cat);
};

// Initial load
loadAndRenderVideos();