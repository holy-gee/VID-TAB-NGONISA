import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, query, orderBy, updateDoc, doc
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

const uploadBtn = document.getElementById("upload-btn");
const videosContainer = document.getElementById("videos-container");
const searchBtn = document.getElementById("search-btn");

function convertYoutubeToEmbed(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return "https://www.youtube.com/embed/" + match[2];
  }
  return url;
}

function createVideoCard(video) {
  const div = document.createElement("div");
  div.className = "video-card";

  if (video.thumbnailUrl) {
    const img = document.createElement("img");
    img.className = "video-thumb";
    img.src = video.thumbnailUrl;
    img.alt = video.title;
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

  const infoDiv = document.createElement("div");
  infoDiv.className = "video-info";
  infoDiv.textContent = video.title;
  div.appendChild(infoDiv);

  const usernameDiv = document.createElement("div");
  usernameDiv.className = "video-username";
  usernameDiv.textContent = "Uploaded by: " + video.username;
  div.appendChild(usernameDiv);

  const controls = document.createElement("div");
  controls.className = "video-controls";

  // Like button
  const likeBtn = document.createElement("button");
  likeBtn.className = "btn-like";
  likeBtn.textContent = `Like (${video.likesCount || 0})`;
  likeBtn.onclick = async () => {
    const newCount = (video.likesCount || 0) + 1;
    likeBtn.textContent = `Like (${newCount})`;
    try {
      await updateDoc(doc(db, "videos", video.id), { likesCount: newCount });
      video.likesCount = newCount;
    } catch (err) {
      alert("Failed to update like.");
      console.error(err);
    }
  };
  controls.appendChild(likeBtn);

  // Download button for direct URLs only
  if (
    !video.videoUrl.includes("youtube.com") &&
    !video.videoUrl.includes("youtu.be") &&
    video.videoUrl.match(/^https?:\/\//)
  ) {
    const downloadLink = document.createElement("a");
    downloadLink.href = video.videoUrl;
    downloadLink.download = "";
    downloadLink.target = "_blank";
    downloadLink.rel = "noopener noreferrer";
    downloadLink.className = "btn-download";
    downloadLink.textContent = "Download";
    controls.appendChild(downloadLink);
  }

  div.appendChild(controls);
  return div;
}

async function loadVideos(searchTerm = "") {
  videosContainer.innerHTML = "<p>Loading videos...</p>";

  const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));

  try {
    const querySnapshot = await getDocs(q);
    let videos = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      data.id = docSnap.id;
      videos.push(data);
    });

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      videos = videos.filter(
        (v) =>
          v.title.toLowerCase().includes(term) ||
          (v.username && v.username.toLowerCase().includes(term))
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
    videosContainer.innerHTML = "<p>Failed to load videos.</p>";
    console.error(err);
  }
}

uploadBtn.onclick = async () => {
  const password = document.getElementById("upload-password").value.trim();
  const username = document.getElementById("username-input").value.trim();
  const videoUrl = document.getElementById("video-url-input").value.trim();
  const thumbnailUrl = document.getElementById("thumbnail-url-input").value.trim();
  const title = document.getElementById("title-input").value.trim();

  if (password !== PASSWORD) {
    alert("Wrong upload password.");
    return;
  }
  if (!username || !videoUrl || !title) {
    alert("Please fill in Username, Video URL and Title.");
    return;
  }

  try {
    await addDoc(collection(db, "videos"), {
      username,
      videoUrl,
      thumbnailUrl,
      title,
      likesCount: 0,
      createdAt: new Date(),
    });
    alert("Video uploaded!");
    // Clear inputs
    document.getElementById("upload-password").value = "";
    document.getElementById("username-input").value = "";
    document.getElementById("video-url-input").value = "";
    document.getElementById("thumbnail-url-input").value = "";
    document.getElementById("title-input").value = "";

    loadVideos();
  } catch (err) {
    alert("Failed to upload video.");
    console.error(err);
  }
};

searchBtn.onclick = () => {
  const term = document.getElementById("search-input").value.trim();
  loadVideos(term);
};

loadVideos();