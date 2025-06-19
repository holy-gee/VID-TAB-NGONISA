import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  deleteDoc,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from "./firebase-config.js";

// Constants
const UPLOAD_PASSWORD = "dhogotheboss";
const DELETE_ALLOWED_USERNAME = "Takunda";

// DOM Elements
const uploadSection = document.getElementById("upload-section");
const uploadBtn = document.getElementById("upload-btn");
const videoList = document.getElementById("video-list");
const searchBox = document.getElementById("search-box");
const categoryFilter = document.getElementById("category-filter");

const uploadPasswordInput = document.getElementById("upload-password");
const usernameInput = document.getElementById("username");
const videoUrlInput = document.getElementById("video-url");
const thumbnailUrlInput = document.getElementById("thumbnail-url");
const titleInput = document.getElementById("title");
const uploadCategorySelect = document.getElementById("upload-category");

// Track upload form visibility & user logged in (password accepted)
let canUpload = false;

// Show/hide upload section toggle
const toggleUploadSection = () => {
  if (uploadSection.style.display === "flex") {
    uploadSection.style.display = "none";
    canUpload = false;
  } else {
    // Prompt for password
    const pass = prompt("Enter upload password:");
    if (pass === UPLOAD_PASSWORD) {
      uploadSection.style.display = "flex";
      canUpload = true;
    } else {
      alert("Incorrect password.");
      canUpload = false;
    }
  }
};

// Initial hide upload section
uploadSection.style.display = "none";

// Add event listener on header upload button (dynamically create)
const header = document.querySelector("header");
const uploadToggleBtn = document.createElement("button");
uploadToggleBtn.textContent = "Upload Video";
uploadToggleBtn.style.marginLeft = "1rem";
uploadToggleBtn.onclick = toggleUploadSection;
header.appendChild(uploadToggleBtn);

// Upload video
uploadBtn.onclick = async () => {
  if (!canUpload) {
    alert("You must enter the correct password to upload.");
    return;
  }

  const username = usernameInput.value.trim();
  const videoUrl = videoUrlInput.value.trim();
  const thumbnailUrl = thumbnailUrlInput.value.trim();
  const title = titleInput.value.trim();
  const category = uploadCategorySelect.value;

  if (!username || !videoUrl || !title) {
    alert("Please fill in username, video URL, and video title.");
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
    uploadCategorySelect.value = "Kids";

    // Refresh list
    loadAndRenderVideos();
  } catch (err) {
    console.error("Upload failed:", err);
    alert("Failed to upload video.");
  }
};

// Convert YouTube link to embed URL
const convertYoutubeToEmbed = (url) => {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return "https://www.youtube.com/embed/" + match[2];
  }
  return url;
};

// Render videos to page
const loadAndRenderVideos = async () => {
  videoList.innerHTML = "<p>Loading videos...</p>";

  try {
    let q = query(collection(db, "videos"), orderBy("createdAt", "desc"));

    // Filter by category
    const category = categoryFilter.value;
    if (category !== "All") {
      q = query(
        collection(db, "videos"),
        where("category", "==", category),
        orderBy("createdAt", "desc")
      );
    }

    // Get videos
    const snapshot = await getDocs(q);
    let videos = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      data.id = docSnap.id;
      videos.push(data);
    });

    // Filter by search term
    const searchTerm = searchBox.value.trim().toLowerCase();
    if (searchTerm) {
      videos = videos.filter(
        (v) =>
          v.title.toLowerCase().includes(searchTerm) ||
          v.category.toLowerCase().includes(searchTerm) ||
          v.username.toLowerCase().includes(searchTerm)
      );
    }

    if (videos.length === 0) {
      videoList.innerHTML = "<p>No videos found.</p>";
      return;
    }

    // Clear container
    videoList.innerHTML = "";

    // Add videos
    videos.forEach((video) => {
      const card = createVideoCard(video);
      videoList.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load videos:", err);
    videoList.innerHTML = "<p>Failed to load videos.</p>";
  }
};

// Create video card element
const createVideoCard = (video) => {
  const div = document.createElement("div");
  div.className = "video-card";

  // Thumbnail or embedded video
  if (video.thumbnailUrl) {
    const img = document.createElement("img");
    img.src = video.thumbnailUrl;
    img.alt = video.title;
    img.className = "video-thumb";
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
    videoEl.controls = true;
    videoEl.className = "video-thumb";
    videoEl.src = video.videoUrl;
    div.appendChild(videoEl);
  }

  // Title
  const titleDiv = document.createElement("div");
  titleDiv.className = "video-title";
  titleDiv.textContent = video.title;
  div.appendChild(titleDiv);

  // Info: username and category
  const infoDiv = document.createElement("div");
  infoDiv.className = "video-info";
  infoDiv.textContent = `By: ${video.username} | Category: ${video.category}`;
  div.appendChild(infoDiv);

  // Controls: like, download
  const controls = document.createElement("div");
  controls.className = "video-controls";

  // Like button
  const likeBtn = document.createElement("button");
  likeBtn.textContent = `Like (${video.likesCount || 0})`;
  likeBtn.onclick = async () => {
    const newCount = (video.likesCount || 0) + 1;
    try {
      await updateDoc(doc(db, "videos", video.id), { likesCount: newCount });
      likeBtn.textContent = `Like (${newCount})`;
      video.likesCount = newCount;
    } catch (err) {
      alert("Failed to like video.");
      console.error(err);
    }
  };
  controls.appendChild(likeBtn);

  // Download button for direct links only
  if (
    !video.videoUrl.includes("youtube.com") &&
    !video.videoUrl.includes("youtu.be") &&
    video.videoUrl.match(/^https?:\/\//)
  ) {
    const downloadLink = document.createElement("a");
    downloadLink.href = video.videoUrl;
    downloadLink.target = "_blank";
    downloadLink.textContent = "Download";
    downloadLink.className = "download-btn";
    downloadLink.setAttribute("download", "");
    controls.appendChild(downloadLink);
  }

  div.appendChild(controls);

  return div;
};

// Event listeners
searchBox.addEventListener("input", loadAndRenderVideos);
categoryFilter.addEventListener("change", loadAndRenderVideos);

// Initial load
loadAndRenderVideos();