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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const videoFeed = document.getElementById("video-feed");
const searchBox = document.getElementById("search-box");
const searchBtn = document.getElementById("search-btn");
const uploadBtn = document.getElementById("upload-btn");
const showUploadBtn = document.getElementById("show-upload-btn");
const uploadSection = document.getElementById("upload-section");
const uploadPasswordInput = document.getElementById("upload-password");
const uploadForm = document.getElementById("upload-form");

const uploaderNameInput = document.getElementById("uploader-name");
const videoUrlInput = document.getElementById("video-url");
const videoDescriptionInput = document.getElementById("video-description");
const thumbnailUrlInput = document.getElementById("thumbnail-url");

const videoCardTemplate = document.getElementById("video-card-template");

let allVideos = [];

showUploadBtn.addEventListener("click", () => {
  const pwd = prompt("Enter password to upload video:");
  if (pwd === "dhogotheboss") {
    uploadSection.classList.remove("hidden");
    uploadForm.classList.remove("hidden");
  } else {
    alert("Wrong password! Access denied.");
  }
});

uploadBtn.addEventListener("click", async () => {
  const uploader = uploaderNameInput.value.trim();
  const videoUrl = videoUrlInput.value.trim();
  const description = videoDescriptionInput.value.trim();
  const thumbnail = thumbnailUrlInput.value.trim();

  if (!uploader || !videoUrl || !description || !thumbnail) {
    alert("Please fill all required fields!");
    return;
  }

  try {
    await addDoc(collection(db, "videos"), {
      uploader,
      videoUrl,
      description,
      thumbnail,
      createdAt: new Date(),
      likesCount: 0,
    });
    alert("Video uploaded successfully!");
    uploaderNameInput.value = "";
    videoUrlInput.value = "";
    videoDescriptionInput.value = "";
    thumbnailUrlInput.value = "";
    uploadSection.classList.add("hidden");
    uploadForm.classList.add("hidden");
  } catch (err) {
    alert("Error uploading video: " + err.message);
  }
});

function renderVideos(videos) {
  videoFeed.innerHTML = "";
  if (videos.length === 0) {
    videoFeed.textContent = "No videos found.";
    return;
  }
  videos.forEach((video) => {
    const clone = videoCardTemplate.content.cloneNode(true);

    clone.querySelector(".video-thumb").src = video.thumbnail;
    clone.querySelector(".video-thumb").alt = video.description || "Video thumbnail";
    clone.querySelector(".video-title").textContent = video.description || "No description";
    clone.querySelector(".video-description").textContent = video.description || "";
    clone.querySelector(".video-uploader").textContent = "Uploader: " + video.uploader;

    const likeBtn = clone.querySelector(".like-btn");
    const likeCount = clone.querySelector(".like-count");
    likeCount.textContent = video.likesCount || 0;

    likeBtn.addEventListener("click", async () => {
      const likeDocRef = doc(db, "videos", video.id);
      try {
        await updateDoc(likeDocRef, {
          likesCount: increment(1),
        });
      } catch (err) {
        console.error("Like error", err);
      }
    });

    const commentBtn = clone.querySelector(".comment-btn");
    const commentsSection = clone.querySelector(".comments-section");
    const commentsList = clone.querySelector(".comments-list");
    const commentInput = clone.querySelector(".comment-input");
    const commentSubmitBtn = clone.querySelector(".comment-submit-btn");
    const commentCountSpan = clone.querySelector(".comment-count");

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

    clone.querySelector(".play-btn").addEventListener("click", () => {
      window.open(video.videoUrl, "_blank");
    });

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

function fetchVideos(searchTerm = "") {
  const videosCol = collection(db, "videos");
  const q = query(videosCol, orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    allVideos = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      allVideos.push({
        id: doc.id,
        ...data,
      });
    });

    if (searchTerm.trim() !== "") {
      const filtered = allVideos.filter((v) =>
        v.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.uploader.toLowerCase().includes(searchTerm.toLowerCase())
      );
      renderVideos(filtered);
    } else {
      renderVideos(allVideos);
    }
  });
}

searchBtn.addEventListener("click", () => {
  fetchVideos(searchBox.value);
});

fetchVideos();