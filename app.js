import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  where,
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

// HTML elements
const uploadForm = document.getElementById("uploadForm");
const videoList = document.getElementById("videoList");
const searchInput = document.getElementById("searchInput");

// Upload video handler
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
      likes: 0,
      subscriptions: 0,
    });
    uploadForm.reset();
  } catch (error) {
    console.error("Error uploading video:", error);
    alert("Upload failed. Try again.");
  }
});

// Render video cards
function renderVideos(videos) {
  videoList.innerHTML = "";

  if (videos.length === 0) {
    videoList.innerHTML = "<p>No videos found.</p>";
    return;
  }

  videos.forEach((doc) => {
    const video = doc.data();

    const card = document.createElement("div");
    card.className = "video-card";

    card.innerHTML = `
      <img src="${video.thumbnailURL}" alt="${video.title}" class="thumbnail" />
      <h3>${video.title}</h3>
      <video controls src="${video.videoURL}" class="video-player"></video>
    `;

    videoList.appendChild(card);
  });
}

// Listen for videos with optional search filter
function listenForVideos(filter = "") {
  let q;

  if (filter) {
    // Create range for simple prefix search
    const end = filter.replace(/.$/, (c) => String.fromCharCode(c.charCodeAt(0) + 1));
    q = query(
      videosCol,
      where("title", ">=", filter),
      where("title", "<", end),
      orderBy("title")
    );
  } else {
    q = query(videosCol, orderBy("timestamp", "desc"));
  }

  // Unsubscribe previous listener if any
  if (window.unsubscribeVideos) window.unsubscribeVideos();

  window.unsubscribeVideos = onSnapshot(q, (snapshot) => {
    renderVideos(snapshot.docs);
  });
}

// Search input event listener
searchInput.addEventListener("input", (e) => {
  const searchTerm = e.target.value.trim().toLowerCase();
  listenForVideos(searchTerm);
});

// Initial load: listen for all videos
listenForVideos();