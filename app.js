import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  increment,
  where,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBPdGAZT_U8xNBsU-S4NnC7WUQI8zM1LWI",
  authDomain: "vidfind-77a6a.firebaseapp.com",
  projectId: "vidfind-77a6a",
  storageBucket: "vidfind-77a6a.appspot.com",
  messagingSenderId: "813301438270",
  appId: "1:813301438270:web:2ebe4dec657167c5403e6f",
  measurementId: "G-N4NTHY2230",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const videoFeed = document.getElementById("video-feed");
const searchBox = document.getElementById("search-box");
const searchBtn = document.getElementById("search-btn");
const categorySelect = document.getElementById("category-select");
const showUploadBtn = document.getElementById("show-upload-btn");
const uploadSection = document.getElementById("upload-section");
const uploadPasswordInput = document.getElementById("upload-password");
const uploadForm = document.getElementById("upload-form");
const uploaderNameInput = document.getElementById("uploader-name");
const videoUrlInput = document.getElementById("video-url");
const videoDescriptionInput = document.getElementById("video-description");
const thumbnailUrlInput = document.getElementById("thumbnail-url");
const videoCategorySelect = document.getElementById("video-category");
const uploadBtn = document.getElementById("upload-btn");
const videoCardTemplate = document.getElementById("video-card-template");

let allVideos = [];

// Ask for current username for delete permission
const currentUser = prompt("Enter your username (for delete permission):") || "";

// Show upload form with password
showUploadBtn.addEventListener("click", () => {
  uploadSection.classList.remove("hidden");
});

// Verify password and show form
uploadPasswordInput.addEventListener("keyup", () => {
  if (uploadPasswordInput.value === "dhogotheboss") {
    uploadForm.classList.remove("hidden");
  } else {
    uploadForm.classList.add("hidden");
  }
});

function getYouTubeID(url) {
  const regExp =
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?.+&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function renderVideos(videos) {
  videoFeed.innerHTML = "";
  if (videos.length === 0) {
    videoFeed.textContent = "No videos found.";
    return;
  }
  videos.forEach((video) => {
    const clone = videoCardTemplate.content.cloneNode(true);
    const videoDisplay = clone.querySelector(".video-display");
    const videoTitle = clone.querySelector(".video-title");
    const videoDesc = clone.querySelector(".video-description");
    const videoUploader = clone.querySelector(".video-uploader");
    const likeBtn = clone.querySelector(".like-btn");
    const likeCount = clone.querySelector(".like-count");
    const commentBtn = clone.querySelector(".comment-btn");
    const commentCountSpan = clone.querySelector(".comment-count");
    const commentsSection = clone.querySelector(".comments-section");
    const commentsList = clone.querySelector(".comments-list");
    const commentInput = clone.querySelector(".comment-input");
    const commentSubmitBtn = clone.querySelector(".comment-submit-btn");
    const downloadBtn = clone.querySelector(".download-btn");
    const videoActions = clone.querySelector(".video-actions");

    // Setup video player
    const ytID = getYouTubeID(video.videoUrl);
    if (ytID) {
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube.com/embed/${ytID}`;
      iframe.frameBorder = "0";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      videoDisplay.appendChild(iframe);
      downloadBtn.style.display = "none"; // No direct download from YouTube
    } else if (video.videoUrl.endsWith(".mp4")) {
      const videoElem = document.createElement("video");
      videoElem.controls = true;
      videoElem.src = video.videoUrl;
      videoDisplay.appendChild(videoElem);
      downloadBtn.href = video.videoUrl;
      downloadBtn.style.display = "inline-block";
    } else {
      // fallback: show thumbnail clickable to open link
      const img = document.createElement("img");
      img.src = video.thumbnail || "";
      img.alt = "Video thumbnail";
      img.style.cursor = "pointer";
      img.addEventListener("click", () => window.open(video.videoUrl, "_blank"));
      videoDisplay.appendChild(img);
      downloadBtn.href = video.videoUrl;
      downloadBtn.style.display = "inline-block";
    }

    videoTitle.textContent = video.description || "Untitled";
    videoDesc.textContent = video.description || "";
    videoUploader.textContent = "Uploader: " + video.uploader;

    likeCount.textContent = video.likesCount || 0;

    likeBtn.addEventListener("click", async () => {
      try {
        const likeRef = doc(db, "videos", video.id);
        await updateDoc(likeRef, { likesCount: increment(1) });
      } catch (err) {
        console.error("Like error", err);
      }
    });

    commentCountSpan.textContent = 0;

    commentBtn.addEventListener("click", () => {
      commentsSection.classList.toggle("hidden");
      if (!commentsSection.classList.contains("hidden")) {
        loadComments(video.id, commentsList, commentCountSpan);
      }
    });

    commentSubmitBtn.addEventListener("click", async () => {
      const text = commentInput.value.trim();
      if (!text) return alert("Enter a comment!");
      try {
        await addDoc(collection(db, "videos", video.id, "comments"), {
          text,
          createdAt: new Date(),
        });
        commentInput.value = "";
        loadComments(video.id, commentsList, commentCountSpan);
      } catch (err) {
        console.error("Comment error", err);
      }
    });

    // Add Delete button if uploader matches currentUser
    if (video.uploader === currentUser) {
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.style.background = "#800";
      deleteBtn.style.marginLeft = "auto";
      deleteBtn.addEventListener("click", async () => {
        if (confirm("Are you sure you want to delete this video?")) {
          try {
            await deleteDoc(doc(db, "videos", video.id));
            alert("Video deleted!");
          } catch (err) {
            alert("Delete failed: " + err.message);
          }
        }
      });
      videoActions.appendChild(deleteBtn);
    }

    videoFeed.appendChild(clone);
  });
}

async function loadComments(videoId, container, countSpan) {
  const commentsCol = collection(db, "videos", videoId, "comments");
  const commentsSnap = await getDocs(query(commentsCol, orderBy("createdAt", "desc")));
  container.innerHTML = "";
  commentsSnap.forEach((doc) => {
    const data = doc.data();
    const commentEl = document.createElement("div");
    commentEl.textContent = data.text;
    commentEl.style.borderBottom = "1px solid #400000";
    commentEl.style.padding = "0.3rem 0";
    container.appendChild(commentEl);
  });
  countSpan.textContent = commentsSnap.size;
}

async function fetchVideos(searchTerm = "", category = "") {
  const videosCol = collection(db, "videos");

  let q;
  if (category) {
    q = query(videosCol, where("category", "==", category), orderBy("createdAt", "desc"));
  } else {
    q = query(videosCol, orderBy("createdAt", "desc"));
  }

  onSnapshot(q, (snapshot) => {
    allVideos = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      allVideos.push({
        id: doc.id,
        ...data,
      });
    });

    // Filter by search term
    if (searchTerm.trim() !== "") {
      const filtered = allVideos.filter(
        (v) =>
          (v.description && v.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (v.uploader && v.uploader.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      renderVideos(filtered);
    } else {
      renderVideos(allVideos);
    }
  });
}

searchBtn.addEventListener("click", () => {
  fetchVideos(searchBox.value, categorySelect.value);
});

categorySelect.addEventListener("change", () => {
  fetchVideos(searchBox.value, categorySelect.value);
});

uploadBtn.addEventListener("click", async () => {
  const uploader = uploaderNameInput.value.trim();
  const videoUrl = videoUrlInput.value.trim();
  const description = videoDescriptionInput.value.trim();
  let thumbnail = thumbnailUrlInput.value.trim();
  const category = videoCategorySelect.value;

  if (!uploader || !videoUrl || !description || !category) {
    alert("Please fill all required fields!");
    return;
  }

  // Auto thumbnail for YouTube if none given
  if (!thumbnail) {
    const ytId = getYouTubeID(videoUrl);
    if (ytId) thumbnail = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
  }

  try {
    await addDoc(collection(db, "videos"), {
      uploader,
      videoUrl,
      description,
      thumbnail,
      category,
      createdAt: new Date(),
      likesCount: 0,
    });
    alert("Video uploaded successfully!");
    uploaderNameInput.value = "";
    videoUrlInput.value = "";
    videoDescriptionInput.value = "";
    thumbnailUrlInput.value = "";
    videoCategorySelect.value = "";
    uploadPasswordInput.value = "";
    uploadForm.classList.add("hidden");
    uploadSection.classList.add("hidden");
  } catch (err) {
    alert("Error uploading video: " + err.message);
  }
});

fetchVideos();