// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// --- Firebase config ---
// Replace these config values with your Firebase project config from console.firebase.google.com
const firebaseConfig = {
  apiKey: "AIzaSyBPdGAZT_U8xNBsU-S4NnC7WUQI8zM1LWI",
  authDomain: "vidfind-77a6a.firebaseapp.com",
  projectId: "vidfind-77a6a",
  storageBucket: "vidfind-77a6a.appspot.com",
  messagingSenderId: "813301438270",
  appId: "1:813301438270:web:2ebe4dec657167c5403e6f",
  measurementId: "G-N4NTHY2230",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// DOM elements
const signInBtn = document.getElementById("sign-in-btn");
const signOutBtn = document.getElementById("sign-out-btn");
const userInfoDiv = document.getElementById("user-info");
const userNameSpan = document.getElementById("user-name");
const userPicImg = document.getElementById("user-pic");

const navButtons = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");

const videosList = document.getElementById("videos-list");
const shortsList = document.getElementById("shorts-list");
const myVideosList = document.getElementById("my-videos-list");
const savedVideosList = document.getElementById("saved-videos-list");

const likesCountSpan = document.getElementById("likes-count");
const commentsCountSpan = document.getElementById("comments-count");
const subscribersCountSpan = document.getElementById("subscribers-count");

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

const uploadForm = document.getElementById("upload-form");

// Template for video card
const videoCardTemplate = document.getElementById("video-card-template");

// Current user info
let currentUser = null;
let currentUserData = null; // Firestore user doc data

// Utility: show page by id
function showPage(pageId) {
  pages.forEach((p) => {
    p.classList.toggle("active", p.id === pageId);
  });
  navButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === pageId);
  });
}

// Sign in function
signInBtn.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    currentUser = result.user;
    await createUserDocIfNotExists(currentUser);
    renderUserInfo();
    loadHomeVideos();
    showPage("page-home");
  } catch (error) {
    alert("Sign in failed: " + error.message);
  }
});

// Sign out function
signOutBtn.addEventListener("click", async () => {
  await signOut(auth);
  currentUser = null;
  currentUserData = null;
  renderUserInfo();
  showPage("page-home");
  clearVideoLists();
});

// Render user info UI
function renderUserInfo() {
  if (currentUser) {
    signInBtn.style.display = "none";
    userInfoDiv.classList.remove("hidden");
    userNameSpan.textContent = currentUser.displayName || currentUser.email;
    userPicImg.src = currentUser.photoURL || "https://via.placeholder.com/36";
  } else {
    signInBtn.style.display = "inline-block";
    userInfoDiv.classList.add("hidden");
    userNameSpan.textContent = "";
    userPicImg.src = "";
  }
}

// Listen auth state changes
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    await createUserDocIfNotExists(currentUser);
    renderUserInfo();
    loadHomeVideos();
    showPage("page-home");
  } else {
    currentUser = null;
    currentUserData = null;
    renderUserInfo();
    showPage("page-home");
    clearVideoLists();
  }
});

// Create user document if doesn't exist
async function createUserDocIfNotExists(user) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDocs(query(collection(db, "users"), where("__name__", "==", user.uid)));
  if (userSnap.empty) {
    await addDoc(collection(db, "users"), {
      uid: user.uid,
      username: user.displayName || "NoName",
      subscribers: [],
      savedVideos: [],
      likesReceived: 0,
      commentsReceived: 0,
    });
  } else {
    // Fetch current user data for dashboard
    currentUserData = userSnap.docs[0].data();
  }
}

// Clear all video lists UI
function clearVideoLists() {
  videosList.innerHTML = "";
  shortsList.innerHTML = "";
  myVideosList.innerHTML = "";
  savedVideosList.innerHTML = "";
}

// Nav buttons click
navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!currentUser && btn.dataset.page !== "home") {
      alert("Please sign in to access this page.");
      return;
    }
    showPage(`page-${btn.dataset.page}`);
    if (btn.dataset.page === "home") {
      loadHomeVideos();
    } else if (btn.dataset.page === "shorts") {
      loadShorts();
    } else if (btn.dataset.page === "upload") {
      uploadForm.reset();
    } else if (btn.dataset.page === "dashboard") {
      loadUserDashboard();
    }
  });
});

// Load home videos (all videos)
async function loadHomeVideos(searchTerm = "") {
  clearVideoLists();
  const videosCol = collection(db, "videos");
  let q = query(videosCol, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  let videos = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // Filter videos if searchTerm is provided
  if (searchTerm.trim()) {
    videos = filterVideosByTwoWords(videos, searchTerm);
  }

  videos.forEach((video) => {
    const card = createVideoCard(video);
    videosList.appendChild(card);
  });
}

// Load shorts videos (duration <= 60 seconds)
async function loadShorts() {
  clearVideoLists();
  const videosCol = collection(db, "videos");
  let q = query(videosCol, where("durationSeconds", "<=", 60), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  const shorts = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  shorts.forEach((video) => {
    const card = createVideoCard(video);
    shortsList.appendChild(card);
  });
}

// Filter videos by matching at least 2 words from search
function filterVideosByTwoWords(videos, searchTerm) {
  const words = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length < 2)
    return videos.filter(
      (v) =>
        v.title?.toLowerCase().includes(words[0]) ||
        v.description?.toLowerCase().includes(words[0])
    );

  return videos.filter((video) => {
    let matchCount = 0;
    for (const word of words) {
      if (
        video.title?.toLowerCase().includes(word) ||
        video.description?.toLowerCase().includes(word)
      ) {
        matchCount++;
        if (matchCount >= 2) return true;
      }
    }
    return false;
  });
}

// Create video card element from video data
function createVideoCard(video) {
  const clone = videoCardTemplate.content.cloneNode(true);
  const card = clone.querySelector(".video-card");

  // Video thumbnail or embed
  const thumbContainer = clone.querySelector(".video-thumb-container");

  // If YouTube link, embed iframe, else use img for thumbnail
  if (video.videoUrl.includes("youtube.com") || video.videoUrl.includes("youtu.be")) {
    const videoId = extractYouTubeID(video.videoUrl);
    const iframe = document.createElement("iframe");
    iframe.width = "100%";
    iframe.height = "160";
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    thumbContainer.appendChild(iframe);
  } else {
    // Direct video or thumbnail image
    if (video.thumbnailUrl) {
      const img = document.createElement("img");
      img.src = video.thumbnailUrl;
      img.alt = video.title;
      thumbContainer.appendChild(img);
    } else {
      const videoEl = document.createElement("video");
      videoEl.src = video.videoUrl;
      videoEl.controls = true;
      videoEl.style.width = "100%";
      videoEl.style.height = "160px";
      thumbContainer.appendChild(videoEl);
    }
  }

  clone.querySelector(".video-title").textContent = video.title || "No title";
  clone.querySelector(".video-description").textContent = video.description || "";
  clone.querySelector(".video-uploader").textContent = video.uploaderName || "Unknown";
  clone.querySelector(".video-category").textContent = video.category || "None";

  // Like count
  const likeCountSpan = clone.querySelector(".like-count");
  likeCountSpan.textContent = video.likesCount || 0;

  // Comment count
  const commentCountSpan = clone.querySelector(".comment-count");
  commentCountSpan.textContent = video.commentsCount || 0;

  // Like button
  const likeBtn = clone.querySelector(".like-btn");
  likeBtn.addEventListener("click", async () => {
    if (!currentUser) {
      alert("Please sign in to like videos.");
      return;
    }
    await toggleLike(video.id);
    // Update UI likes count after toggling
    const updatedLikes = await getLikesCount(video.id);
    likeCountSpan.textContent = updatedLikes;
  });

  // Comments toggle button
  const commentToggleBtn = clone.querySelector(".comment-toggle-btn");
  const commentsSection = clone.querySelector(".comments-section");
  const commentsList = clone.querySelector(".comments-list");
  const commentInput = clone.querySelector(".comment-input");
  const commentSubmitBtn = clone.querySelector(".comment-submit-btn");

  commentToggleBtn.addEventListener("click", () => {
    commentsSection.classList.toggle("hidden");
    if (!commentsSection.classList.contains("hidden")) {
      loadComments(video.id, commentsList);
    }
  });

  commentSubmitBtn.addEventListener("click", async () => {
    if (!currentUser) {
      alert("Please sign in to comment.");
      return;
    }
    const text = commentInput.value.trim();
    if (!text) return;
    await addComment(video.id, text);
    commentInput.value = "";
    loadComments(video.id, commentsList);
  });

  // Subscribe button
  const subscribeBtn = clone.querySelector(".subscribe-btn");
  subscribeBtn.textContent = "Subscribe";
  subscribeBtn.addEventListener("click", async () => {
    if (!currentUser) {
      alert("Please sign in to subscribe.");
      return;
    }
    if (video.uploaderUID === currentUser.uid) {
      alert("You cannot subscribe to yourself.");
      return;
    }
    const isSubscribed = await checkIfSubscribed(video.uploaderUID);
    if (isSubscribed) {
      await unsubscribeFromUser(video.uploaderUID);
      subscribeBtn.textContent = "Subscribe";
    } else {
      await subscribeToUser(video.uploaderUID);
      subscribeBtn.textContent = "Unsubscribe";
    }
  });

  // Save for later button
  const saveBtn = clone.querySelector(".save-btn");
  saveBtn.textContent = "Save for Later";
  saveBtn.addEventListener("click", async () => {
    if (!currentUser) {
      alert("Please sign in to save videos.");
      return;
    }
    await saveVideoForLater(video.id);
    alert("Video saved for later.");
  });

  // Delete button (only visible for videos uploaded by current user)
  const deleteBtn = clone.querySelector(".delete-btn");
  if (currentUser && video.uploaderUID === currentUser.uid) {
    deleteBtn.classList.remove("hidden");
    deleteBtn.addEventListener("click", async () => {
      if (confirm("Are you sure you want to delete this video?")) {
        await deleteDoc(doc(db, "videos", video.id));
        alert("Video deleted.");
        loadUserDashboard();
      }
    });
  }

  return clone;
}

// Extract YouTube video ID from URL
function extractYouTubeID(url) {
  const regExp = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|embed)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

// Load comments for a video
async function loadComments(videoId, commentsListEl) {
  commentsListEl.innerHTML = "Loading comments...";
  const commentsCol = collection(db, "videos", videoId, "comments");
  const q = query(commentsCol, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  commentsListEl.innerHTML = "";
  if (snapshot.empty) {
    commentsListEl.textContent = "No comments yet.";
    return;
  }
  snapshot.forEach((doc) => {
    const c = doc.data();
    const p = document.createElement("p");
    p.textContent = `${c.userName || "Anon"}: ${c.text}`;
    commentsListEl.appendChild(p);
  });
}

// Add comment to video
async function addComment(videoId, text) {
  const commentsCol = collection(db, "videos", videoId, "comments");
  await addDoc(commentsCol, {
    text,
    userId: currentUser.uid,
    userName: currentUser.displayName,
    createdAt: new Date(),
  });

  // Optionally increment comments count on video doc
  const videoRef = doc(db, "videos", videoId);
  await updateDoc(videoRef, {
    commentsCount: arrayUnion(1), // just increment by 1 (Firestore does not support increment with arrayUnion)
  });
}

// Toggle like for video
async function toggleLike(videoId) {
  const videoRef = doc(db, "videos", videoId);
  // Fetch current likes array from video
  // For simplicity, store likesCount and users who liked (complexity grows)
  // Here we only simulate increment likesCount
  const videoSnap = await getDocs(query(collection(db, "videos"), where("__name__", "==", videoId)));
  if (videoSnap.empty) return;

  // TODO: Implement user-specific likes (not done here for brevity)
  // Just increment likesCount by 1
  const videoDoc = videoSnap.docs[0];
  const likesCount = videoDoc.data().likesCount || 0;
  await updateDoc(videoRef, { likesCount: likesCount + 1 });
}

// Get likes count for video
async function getLikesCount(videoId) {
  const videoRef = doc(db, "videos", videoId);
  const videoSnap = await getDocs(query(collection(db, "videos"), where("__name__", "==", videoId)));
  if (videoSnap.empty) return 0;
  return videoSnap.docs[0].data().likesCount || 0;
}

// Subscribe to a user (uploader)
async function subscribeToUser(uploaderUID) {
  const userRef = doc(db, "users", uploaderUID);
  await updateDoc(userRef, {
    subscribers: arrayUnion(currentUser.uid),
  });
}

// Unsubscribe from user
async function unsubscribeFromUser(uploaderUID) {
  const userRef = doc(db, "users", uploaderUID);
  await updateDoc(userRef, {
    subscribers: arrayRemove(currentUser.uid),
  });
}

// Check if current user subscribed to uploader
async function checkIfSubscribed(uploaderUID) {
  const userRef = doc(db, "users", uploaderUID);
  const snap = await getDocs(query(collection(db, "users"), where("__name__", "==", uploaderUID)));
  if (snap.empty) return false;
  const data = snap.docs[0].data();
  return data.subscribers && data.subscribers.includes(currentUser.uid);
}

// Save video for later
async function saveVideoForLater(videoId) {
  const userRef = doc(db, "users", currentUser.uid);
  await updateDoc(userRef, {
    savedVideos: arrayUnion(videoId),
  });
}

// Load user dashboard data
async function loadUserDashboard() {
  if (!currentUser) return;
  clearVideoLists();
  // Load user stats (likes, comments, subscribers)
  const userRef = doc(db, "users", currentUser.uid);
  const userSnap = await getDocs(query(collection(db, "users"), where("__name__", "==", currentUser.uid)));
  if (userSnap.empty) return;
  const userData = userSnap.docs[0].data();

  likesCountSpan.textContent = userData.likesReceived || 0;
  commentsCountSpan.textContent = userData.commentsReceived || 0;
  subscribersCountSpan.textContent = userData.subscribers ? userData.subscribers.length : 0;

  // Load user uploaded videos
  const q = query(collection(db, "videos"), where("uploaderUID", "==", currentUser.uid), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  myVideosList.innerHTML = "";
  snapshot.forEach((doc) => {
    const video = { id: doc.id, ...doc.data() };
    const card = createVideoCard(video);
    myVideosList.appendChild(card);
  });

  // Load saved videos
  savedVideosList.innerHTML = "";
  if (userData.savedVideos && userData.savedVideos.length > 0) {
    for (const vidId of userData.savedVideos) {
      const videoDoc = await getDocs(query(collection(db, "videos"),