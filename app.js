// Your actual Firebase config from vidfind-77a6a
const firebaseConfig = {
  apiKey: "AIzaSyBG1-7PWLC9b1WDGCq6X18giISqlOfdQGA",
  authDomain: "vidfind-77a6a.firebaseapp.com",
  projectId: "vidfind-77a6a",
  storageBucket: "vidfind-77a6a.appspot.com",
  messagingSenderId: "813664632960",
  appId: "1:813664632960:web:15d2a4e1dcbd9437d5990d"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const carousel = document.getElementById('video-carousel');
const searchInput = document.getElementById('search-input');
const titleInput = document.getElementById('title-input');
const videoUrlInput = document.getElementById('video-url-input');
const thumbnailUrlInput = document.getElementById('thumbnail-url-input');
const uploadBtn = document.getElementById('upload-btn');

function createVideoCard(video) {
  const card = document.createElement('div');
  card.classList.add('video-card');

  const thumbnail = document.createElement('div');
  thumbnail.classList.add('video-thumbnail');
  thumbnail.style.backgroundImage = `url('${video.thumbnailUrl}')`;

  const playBtn = document.createElement('button');
  playBtn.classList.add('play-btn');
  playBtn.textContent = '▶';

  const downloadBtn = document.createElement('button');
  downloadBtn.classList.add('download-btn');
  downloadBtn.textContent = '⬇';
  downloadBtn.dataset.url = video.videoUrl;

  thumbnail.appendChild(playBtn);
  card.appendChild(thumbnail);
  card.appendChild(downloadBtn);

  // Play video in modal
  playBtn.addEventListener('click', () => {
    const modal = document.getElementById('video-modal');
    const modalVideo = document.getElementById('modal-video');

    modalVideo.src = video.videoUrl;
    modal.style.display = 'block';
  });

  // Download video
  downloadBtn.addEventListener('click', async () => {
    const url = downloadBtn.dataset.url;

    downloadBtn.disabled = true;
    downloadBtn.textContent = '⏳';

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network error');
      const blob = await response.blob();

      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = url.split('/').pop();
      document.body.appendChild(a);
      a.click();
      a.remove();

      downloadBtn.textContent = '✅';
    } catch {
      downloadBtn.textContent = '❌';
    } finally {
      setTimeout(() => {
        downloadBtn.disabled = false;
        downloadBtn.textContent = '⬇';
      }, 3000);
    }
  });

  return card;
}

async function loadVideosFromFirestore() {
  const snapshot = await db.collection("videos").get();
  const firestoreVideos = snapshot.docs.map(doc => doc.data());

  carousel.innerHTML = '';
  firestoreVideos
    .filter(video => video.title.toLowerCase().includes(searchInput.value.toLowerCase()))
    .forEach(video => {
      const card = createVideoCard(video);
      carousel.appendChild(card);
    });
}

searchInput.addEventListener('input', () => {
  loadVideosFromFirestore();
});

uploadBtn.addEventListener('click', async () => {
  const title = titleInput.value.trim();
  const videoUrl = videoUrlInput.value.trim();
  const thumbnailUrl = thumbnailUrlInput.value.trim();

  if (!title || !videoUrl || !thumbnailUrl) {
    alert("Please fill all fields!");
    return;
  }

  try {
    await db.collection("videos").add({ title, videoUrl, thumbnailUrl });
    alert("Movie uploaded successfully!");

    titleInput.value = "";
    videoUrlInput.value = "";
    thumbnailUrlInput.value = "";

    loadVideosFromFirestore();
  } catch (error) {
    console.error("Error uploading movie:", error);
    alert("Failed to upload movie.");
  }
});

// Modal close logic
document.getElementById('close-modal').addEventListener('click', () => {
  const modal = document.getElementById('video-modal');
  const modalVideo = document.getElementById('modal-video');

  modal.style.display = 'none';
  modalVideo.pause();
  modalVideo.src = '';
});

// Initial load
loadVideosFromFirestore();