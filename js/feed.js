document.addEventListener("DOMContentLoaded", () => {
  const feedContainer = document.getElementById("feedContainer");
  const trapScreen = document.getElementById("trapScreen");
  const countdownText = document.getElementById("countdown-text");

  let scrollCount = 0;
  let isTrapped = false;
  let isGlobalMuted = true;

  // videos 
  const videoFiles = [
    "assets/video's/Bruno Mars - The Lazy Song (Official Music Video).mp4",
    "assets/video's/KILLER PETER 127 -- Gelo speed tadeus.mp4",
    "assets/video's/Shrek dancing.mp4",
    "assets/video's/_Soda Pop_ Official Lyric Video _ KPop Demon Hunters _ Sony Animation.mp4",
    "assets/video's/lowkeymess1 - 7622735953026764046.mp4",
    "assets/video's/Best nature whatsapp status__village nature__ video %23shorts %23nature %23viral %23trending.mp4",
    "assets/video's/Switzerland_ The Land of Pure Nature.mp4"
  ];


  // Shuffle array logic for non-repeating playlist
  function shuffleArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  let shuffledVideos = shuffleArray(videoFiles);
  let currentVideoIndex = 0;

  function generatePosts(num) {
    for (let i = 0; i < num; i++) {
      const post = document.createElement("div");
      post.className = "feed-post";

      // Re-shuffle the playlist if we run out of videos
      if (currentVideoIndex >= shuffledVideos.length) {
          shuffledVideos = shuffleArray(videoFiles);
          currentVideoIndex = 0;
      }

      const randomVideo = shuffledVideos[currentVideoIndex];
      currentVideoIndex++;

      post.innerHTML = `
            <div class="post-video">
                <video class="tiktik-video" src="${randomVideo}" loop ${isGlobalMuted ? 'muted' : ''} playsinline></video>
                <div class="sound-toggle"><i class='bx ${isGlobalMuted ? 'bx-volume-mute' : 'bx-volume-full'}'></i></div>
            </div>
            <div class="post-actions">
                <i class='bx bxs-heart'></i>
                <i class='bx bxs-message-rounded-dots'></i>
                <i class='bx bxs-share'></i>
            </div>
        `;
      feedContainer.appendChild(post);
    }
  }


  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target.querySelector('video');


      if (entry.isIntersecting && !isTrapped) {


        if (video) {
          video.muted = isGlobalMuted;
          video.play().catch(e => {
            console.log("Autoplay prevented:", e);
            video.muted = true;
            isGlobalMuted = true;

            const icons = document.querySelectorAll('.sound-toggle i');
            icons.forEach(icon => icon.className = 'bx bx-volume-mute');
            video.play();
          });
        }

        if (!entry.target.dataset.viewed) {
          entry.target.dataset.viewed = "true";
          scrollCount++;
          console.log("Posts viewed:", scrollCount);

          if (feedContainer.children.length - scrollCount < 3) {
            generateObservedPosts(3);
          }


          if (scrollCount >= 6) {
            triggerTrap();
          }
        }
      } else {

        if (video) video.pause();
      }
    });
  }, { threshold: 0.6 });

  function generateObservedPosts(num) {
    generatePosts(num);
    const newPosts = feedContainer.querySelectorAll('.feed-post:not(.observed)');
    newPosts.forEach(post => {
      observer.observe(post);
      post.classList.add('observed');
    });
  }

  feedContainer.innerHTML = '';
  generateObservedPosts(5);

  feedContainer.addEventListener("click", (e) => {
    if (e.target.closest('.post-actions')) return;

    isGlobalMuted = !isGlobalMuted;

    const videos = document.querySelectorAll('.tiktik-video');
    videos.forEach(vid => {
      vid.muted = isGlobalMuted;
    });

    const icons = document.querySelectorAll('.sound-toggle i');
    icons.forEach(icon => {
      icon.className = isGlobalMuted ? 'bx bx-volume-mute' : 'bx bx-volume-full';
    });
  });

  function triggerTrap() {
    if (isTrapped) return;
    isTrapped = true;

    trapScreen.style.display = "flex";

    document.body.style.overflow = "hidden";

    let count = 10;
    countdownText.innerText = `(${count}s)`;

    const interval = setInterval(() => {
      count--;
      countdownText.innerText = `(${count}s)`;

      if (count <= 0) {
        clearInterval(interval);
        window.location.href = "focus.html";
      }
    }, 1000);
  }

  // Hamburger menu logic
  const menuIcon = document.getElementById("menu-icon");
  const menuItems = document.querySelector(".menu-items");
  if(menuIcon && menuItems) {
      menuIcon.addEventListener("click", () => {
        menuItems.classList.toggle("active");
        if (menuItems.classList.contains("active")) {
          menuIcon.classList.replace("bx-menu", "bx-x");
        } else {
          menuIcon.classList.replace("bx-x", "bx-menu");
        }
      });
  }
});
