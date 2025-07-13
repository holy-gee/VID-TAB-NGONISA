// Sample Pexels videos data with real signed URLs and thumbnails
const videos = [
  {
    title: "Cinematic City Drive",
    videoUrl: "https://player.vimeo.com/external/406388508.sd.mp4?s=1d282a622a1d146dbf86b89583b9a57f2abda4e8&profile_id=164&oauth2_token_id=57447761",
    thumbnailUrl: "https://images.pexels.com/photos/1433055/pexels-photo-1433055.jpeg",
  },
  {
    title: "Epic Mountains",
    videoUrl: "https://player.vimeo.com/external/399366269.sd.mp4?s=53e686eeb7a94a52ea1e1dd350c1613bbf52f184&profile_id=164&oauth2_token_id=57447761",
    thumbnailUrl: "https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg",
  },
  {
    title: "Movie Scene Night",
    videoUrl: "https://player.vimeo.com/external/321183671.sd.mp4?s=f8e551a4a4c1cb267f6d6ed9e01e0e6763a69ea9&profile_id=164&oauth2_token_id=57447761",
    thumbnailUrl: "https://images.pexels.com/photos/3211836/pexels-photo-3211836.jpeg",
  },
  {
    title: "Vintage Film Style",
    videoUrl: "https://player.vimeo.com/external/263203496.sd.mp4?s=9c98142315dd4d2f60176bf55f0240df1e2095c4&profile_id=164&oauth2_token_id=57447761",
    thumbnailUrl: "https://images.pexels.com/photos/2632035/pexels-photo-2632035.jpeg",
  },
  {
    title: "Dramatic Sunset Scene",
    videoUrl: "https://player.vimeo.com/external/307839458.sd.mp4?s=8cfc36a02fdd69a4319a0e75a54b7f1ad2f3c57e&profile_id=164&oauth2_token_id=57447761",
    thumbnailUrl: "https://images.pexels.com/photos/3078395/pexels-photo-3078395.jpeg",
  },
];

// Get carousel container
const carousel = document.getElementById('video-carousel');

function createVideoCard(video) {
  const card = document.createElement('div');
  card.classList.add('video-card');

  // Thumbnail div with background image
  const thumbnail = document.createElement('div');
  thumbnail.classList.add('video-thumbnail');
  thumbnail.style.backgroundImage = `url('${video.thumbnailUrl}')`;

  // Play button overlay
  const playBtn = document.createElement('button');
  playBtn.classList.add('play-btn');
  playBtn.setAttribute('aria-label', 'Play Video');
  playBtn.textContent = '▶';

  // Download button
  const downloadBtn = document.createElement('button');
  downloadBtn.classList.add('download-btn');
  downloadBtn.setAttribute('aria-label', 'Download Video');
  downloadBtn.textContent = '⬇';
  downloadBtn.dataset.url = video.videoUrl;

  // Append buttons to thumbnail
  thumbnail.appendChild(playBtn);
  card.appendChild(thumbnail);
  card.appendChild(downloadBtn);

  // Play button click event
  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    // Open video in new tab - can be replaced with modal playback
    window.open(video.videoUrl, '_blank');
  });

  // Download button click event
  downloadBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
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

// Render all video cards into carousel
videos.forEach(video => {
  const card = createVideoCard(video);
  carousel.appendChild(card);
});