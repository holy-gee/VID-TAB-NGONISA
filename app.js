import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBJf9Im_7p9HBUNyUaW6Rj2AQC__4PoAjA",
  authDomain: "movie-tab-a8ba3.firebaseapp.com",
  projectId: "movie-tab-a8ba3",
  storageBucket: "movie-tab-a8ba3.appspot.com",
  messagingSenderId: "514632371740",
  appId: "1:514632371740:web:0dcb53bfe34ed5b71b59d9"
};

const PASSWORD = "dhogotheboss";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const videoContainer = document.getElementById("video-container");
const fullBtn = document.getElementById("full-btn");
const shortsBtn = document.getElementById("shorts-btn");
const shortsPlayer = document.getElementById("shorts-player");
const shortsIframe = document.getElementById("shorts-iframe");
const prevShort = document.getElementById("prev-short");
const nextShort = document.getElementById("next-short");
const closeShort = document.getElementById("close-short");

const loginSection = document.getElementById("login-section");
const loginBtn = document.getElementById("login-btn");
const uploadSection = document.getElementById("upload-section");
const uploaderInfo = document.getElementById("uploader-info");
const uploaderNameSpan = document.getElementById("uploader-name");
const logoutBtn = document.getElementById("logout-btn");

const usernameInput = document.getElementById("username-input");
const videoUrlInput = document.getElementById("video-url");
const videoTitleInput = document.getElementById("video-title");
const videoCategorySelect = document.getElementById("video-category");
const uploadBtn = document.getElementById("upload-btn");

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

let loggedIn = false;
let currentUploader = "";
let shortsVideos = [];
let currentShortIndex = 0;

loginBtn.onclick = () => {
  const pass = document.getElementById("upload-password").value;
  if (pass === PASSWORD) {
    loggedIn = true;
    loginSection.style.display = "none";
    uploadSection.style.display = "block";
    uploaderInfo.style.display = "block";
    currentUploader = "";
  } else {
    alert("Wrong password!");
  }
};

logoutBtn.onclick = () => {
  loggedIn = false;
  uploadSection.style.display = "none";
  uploaderInfo.style.display = "none";
  loginSection.style.display = "block";
  currentUploader = "";
};

uploadBtn.onclick = async () => {
  if (!loggedIn) {
    alert("You must enter the password to upload.");
    return;
  }

  const username = usernameInput.value.trim();
  const videoUrl = videoUrlInput.value.trim();
  const title = videoTitleInput.value.trim();
  const category = videoCategorySelect.value;

  if (!username || !videoUrl || !title) {
    alert("Please fill in username, video URL, and title.");
    return;
  }

  currentUploader = username;
  uploaderNameSpan.textContent = username;

  try {
    await addDoc(collection(db, "youtubeVideos"), {
      username,
      link: videoUrl,
      title,
      category,
      likesCount: 0,
      createdAt: new Date()
    });

    usernameInput.value = "";
    videoUrlInput.value = "";
    videoTitleInput.value = "";
    videoCategorySelect.value = "Full";

    alert("Video uploaded successfully!");
    loadVideos("Full");

  } catch (err) {
    console.error("Error uploading video:", err);
    alert("Failed to upload video.");
  }
};

searchBtn.onclick = async () => {
  const term = searchInput.value.trim().toLowerCase();
  const snapshot = await getDocs(query(collection(db, "youtubeVideos"), orderBy("createdAt", "desc")));

  videoContainer.innerHTML = "";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (
      data.title.toLowerCase().includes(term) ||
      data.username.toLowerCase().includes(term) ||
      data.category.toLowerCase().includes(term)
    ) {
      const card = createVideoCard(docSnap);
      videoContainer.appendChild(card);
    }
  });
};

fullBtn.onclick = () => loadVideos("Full");
shortsBtn.onclick = () => openShorts();

async function loadVideos(category) {
  videoContainer.innerHTML = "<p>Loading...</p>";
  shortsPlayer.style.display = "none";
  videoContainer.style.display = "flex";

  const q = query(collection(db, "youtubeVideos"), where("category", "==", category), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  videoContainer.innerHTML = "";

  snapshot.forEach(docSnap => {
    const card = createVideoCard(docSnap);
    videoContainer.appendChild(card);
  });
}

function createVideoCard(docSnap) {
  const data = docSnap.data();
  const div = document.createElement("div");
  div.className = "video-card";

  // Thumbnail
  const thumb = document.createElement("img");
  thumb.className = "video-thumb";
  thumb.src = `https://img.youtube.com/vi/${getYouTubeID(data.link)}/hqdefault.jpg`;
  div.appendChild(thumb);

  // Play button
  const playBtn = document.createElement("button");
  playBtn.className = "play-btn";
  playBtn.textContent = "▶";
  playBtn.onclick = () => {
    thumb.outerHTML = `<iframe width="100%" height="170" src="${data.link.replace("watch?v=", "embed/")}" frameborder="0" allowfullscreen></iframe>`;
    playBtn.remove();
  };
  div.appendChild(playBtn);

  const title = document.createElement("div");
  title.className = "video-title";
  title.textContent = data.title;
  div.appendChild(title);

  const uploader = document.createElement("div");
  uploader.className = "video-uploader";
  uploader.textContent = "By: " + data.username;
  div.appendChild(uploader);

  const likeBtn = document.createElement("button");
  likeBtn.className = "like-btn";
  likeBtn.textContent = `Like (${data.likesCount || 0})`;
  likeBtn.onclick = async () => {
    const newCount = (data.likesCount || 0) + 1;
    likeBtn.textContent = `Like (${newCount})`;
    try {
      await updateDoc(doc(db, "youtubeVideos", docSnap.id), { likesCount: newCount });
      data.likesCount = newCount;
    } catch (err) {
      console.error("Failed to update likes:", err);
      alert("Failed to like video.");
    }
  };
  div.appendChild(likeBtn);

  return div;
}

function getYouTubeID(url) {
  const regExp = /^.*(youtu.be\/|v\/|embed\/|watch\?v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

async function openShorts() {
  const q = query(collection(db, "youtubeVideos"), where("category", "==", "Shorts"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  shortsVideos = [];
  snapshot.forEach(docSnap => shortsVideos.push(docSnap.data().link));

  if (shortsVideos.length === 0) {
    alert("No Shorts found!");
    return;
  }

  currentShortIndex = 0;
  showShort();
}

function showShort() {
  videoContainer.style.display = "none";
  shortsPlayer.style.display = "flex";
  shortsIframe.src = shortsVideos[currentShortIndex].replace("watch?v=", "embed/");
}

prevShort.onclick = () => {
  if (currentShortIndex > 0) {
    currentShortIndex--;
    showShort();
  }
};

nextShort.onclick = () => {
  if (currentShortIndex < shortsVideos.length - 1) {
    currentShortIndex++;
    showShort();
  }
};

closeShort.onclick = () => {
  shortsPlayer.style.display = "none";
  videoContainer.style.display = "flex";
  shortsIframe.src = "";
};