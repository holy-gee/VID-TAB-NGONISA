import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDRhXwcTvmUtAfb-Hs3MSqAQrrRt7FRImc",
  authDomain: "vidfind-77a6a.firebaseapp.com",
  projectId: "vidfind-77a6a",
  storageBucket: "vidfind-77a6a.appspot.com",
  messagingSenderId: "1019926274133",
  appId: "1:1019926274133:web:3be9e7200a6674e234f948",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const videosCol = collection(db, "videos");

// Elements
const uploadForm = document.getElementById("uploadForm");
const videoList = document.getElementById("videoList");
const searchInput = document.getElementById("searchInput");

// Upload video
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = uploadForm.title.value.trim();
  const videoURL = uploadForm.videoURL.value.trim();
  const thumbnailURL = uploadForm.thumbnailURL.value.trim();

  if (!title || !videoURL || !thumbnailURL) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    await addDoc(videosCol, {
      title,
      videoURL,
      thumbnailURL,
      timestamp: new Date(),
    });
    uploadForm.reset();
  } catch (error) {
    console.error("Error uploading video:", error);
    alert("Upload failed. Try again.");
  }
});

// Extract YouTube video ID
function extractYouTubeID(url) {
  const regExp = /(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match && match[1] ? match[1] : "";
}

// Render videos
function renderVideos(videos) {
  videoList.innerHTML = "";

  if (videos.length === 0) {
    videoList.innerHTML = "<p>No videos found.</p>";
    return;
  }

  videos.forEach((doc) => {
    const video = doc.data();
    const videoID = extractYouTubeID(video.videoURL);

    if (!videoID) return; // Skip if no valid YouTube ID

    const container = document.createElement("div");
    container.className = "tiktok-video-container";

    container.innerHTML = `
      <div class="iframe-wrapper">
        <iframe
          src="https://www.youtube.com/embed/${videoID}?autoplay=1&mute=1&loop=1&playlist=${videoID}"
          frameborder="0"
          allow="autoplay; encrypted-media"
          allowfullscreen
          class="yt-iframe"
        ></iframe>
        <div class="video-overlay">
          <h3>${video.title}</h3>
        </div>
      </div>
    `;

    videoList.appendChild(container);
  });
}

// Listen for videos
function listenForVideos(filter = "") {
  let q = query(videosCol, orderBy("timestamp", "desc"));

  if (window.unsubscribeVideos) window.unsubscribeVideos();

  window.unsubscribeVideos = onSnapshot(q, (snapshot) => {
    let filteredDocs = snapshot.docs;

    if (filter) {
      filteredDocs = filteredDocs.filter((doc) =>
        doc.data().title.toLowerCase().includes(filter)
      );
    }

    renderVideos(filteredDocs);
  });
}

// Search
searchInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.trim().toLowerCase();
  listenForVideos(searchTerm);
});

// Initial load
listenForVideos();