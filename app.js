import { db } from './firebase-config.js';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const PASSWORD = "dhogotheboss";
const uploadSection = document.getElementById("upload-section");
const showUploadBtn = document.getElementById("show-upload");
const uploadBtn = document.getElementById("upload-btn");

const username = document.getElementById("username");
const videoUrl = document.getElementById("video-url");
const thumbUrl = document.getElementById("thumbnail-url");
const title = document.getElementById("title");
const category = document.getElementById("video-category");

const searchBox = document.getElementById("search-box");
const filter = document.getElementById("category-filter");
const videoList = document.getElementById("video-list");

showUploadBtn.onclick = () => {
  const pass = document.getElementById("upload-password").value;
  if (pass === PASSWORD) {
    uploadSection.style.display = "block";
  } else {
    alert("Wrong password!");
  }
};

uploadBtn.onclick = async () => {
  if (!username.value || !videoUrl.value || !title.value) {
    alert("Fill all required fields");
    return;
  }

  await addDoc(collection(db, "kids_videos"), {
    username: username.value,
    videoUrl: videoUrl.value,
    thumbnailUrl: thumbUrl.value,
    title: title.value,
    category: category.value,
    createdAt: new Date()
  });

  username.value = "";
  videoUrl.value = "";
  thumbUrl.value = "";
  title.value = "";
  category.value = "Cartoons";

  loadVideos();
};

function isYouTubeLink(link) {
  return link.includes("youtube.com") || link.includes("youtu.be");
}

function toEmbed(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

async function loadVideos() {
  const q = query(collection(db, "kids_videos"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  const term = searchBox.value.toLowerCase();
  const selected = filter.value;

  videoList.innerHTML = "";
  querySnapshot.forEach(doc => {
    const vid = doc.data();

    if (
      (term && !vid.title.toLowerCase().includes(term) && !vid.username.toLowerCase().includes(term)) ||
      (selected !== "All" && vid.category !== selected)
    ) {
      return;
    }

    const card = document.createElement("div");
    card.className = "video-card";

    if (vid.thumbnailUrl) {
      const img = document.createElement("img");
      img.src = vid.thumbnailUrl;
      card.appendChild(img);
    }

    const title = document.createElement("h3");
    title.textContent = vid.title;
    card.appendChild(title);

    const uploader = document.createElement("p");
    uploader.textContent = "By: " + vid.username;
    card.appendChild(uploader);

    if (isYouTubeLink(vid.videoUrl)) {
      const iframe = document.createElement("iframe");
      iframe.src = toEmbed(vid.videoUrl);
      card.appendChild(iframe);
    } else {
      const videoEl = document.createElement("video");
      videoEl.src = vid.videoUrl;
      videoEl.controls = true;
      card.appendChild(videoEl);
    }

    videoList.appendChild(card);
  });
}

searchBox.oninput = loadVideos;
filter.onchange = loadVideos;

loadVideos();