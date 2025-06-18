const PASSWORD = "dhogotheboss";

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

const videosContainer = document.getElementById("videos-container");

let loggedIn = false;
let currentUploader = "";

// Load saved videos from localStorage or empty array
function loadVideosFromStorage() {
  const videos = localStorage.getItem("videos");
  return videos ? JSON.parse(videos) : [];
}

// Save videos to localStorage
function saveVideosToStorage(videos) {
  localStorage.setItem("videos", JSON.stringify(videos));
}

// Render videos to DOM, filter by search term if provided
function renderVideos(searchTerm = "") {
  const videos = loadVideosFromStorage();
  videosContainer.innerHTML = "";

  const filtered = videos.filter((video) => {
    const term = searchTerm.toLowerCase();
    return (
      video.title.toLowerCase().includes(term) ||
      video.category.toLowerCase().includes(term)
    );
  });

  if (filtered.length === 0) {
    videosContainer.innerHTML = "<p>No videos found.</p>";
    return;
  }

  filtered.forEach((video) => {
    const card = createVideoCard(video);
    videosContainer.appendChild(card);
  });
}

// Create single video card DOM element
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
  title.textContent = video.title + " (by " + video.username + ")";
  div.appendChild(title);

  const category = document.createElement("div");
  category.className = "video-category";
  category.textContent = "Category: " + video.category;
  div.appendChild(category);

  // Like button & local like count
  const likeBtn = document.createElement("button");
  likeBtn.className = "like-btn";

  // Likes stored in video object in localStorage
  if (!video.likes) video.likes = 0;
  likeBtn.textContent = `Like (${video.likes})`;
  likeBtn.onclick = () => {
    video.likes++;
    likeBtn.textContent = `Like (${video.likes})`;
    updateVideoLikes(video);
  };
  div.appendChild(likeBtn);

  return div;
}

function updateVideoLikes(updatedVideo) {
  let videos = loadVideosFromStorage();
  videos = videos.map((v) => (v.id === updatedVideo.id ? updatedVideo : v));
  saveVideosToStorage(videos);
}

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

// Login button event
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

// Logout button event
logoutBtn.onclick = () => {
  loggedIn = false;
  uploadSection.style.display = "none";
  uploaderInfo.style.display = "none";
  loginSection.style.display = "flex";
  currentUploader = "";
};

// Upload video button event
uploadBtn.onclick = () => {
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

  // Save current uploader name to header
  currentUploader = username;
  uploaderNameSpan.textContent = username;

  // Create video object
  const video = {
    id: Date.now().toString(),
    username,
    videoUrl,
    thumbnailUrl,
    title,
    category,
    likes: 0,
  };

  // Save to localStorage
  const videos = loadVideosFromStorage();
  videos.unshift(video);
  saveVideosToStorage(videos);

  // Clear inputs
  usernameInput.value = "";
  videoUrlInput.value = "";
  thumbnailUrlInput.value = "";
  videoTitleInput.value = "";
  videoCategorySelect.value = "All";

  // Render videos again
  renderVideos();
};

// Search button event
searchBtn.onclick = () => {
  const term = searchInput.value.trim();
  renderVideos(term);
};

// Initial load
renderVideos();