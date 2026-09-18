let lightPosts = [];
let darkPosts = [];
let currentPosts = [];
let currentIndex = 0;
let isGuiHidden = false;

const rerollSound = new Audio("https://actions.google.com/sounds/v1/water_exploration/water_drop.ogg");
rerollSound.volume = 0.5;

const LOCAL_FALLBACKS = {
  dark: {
    path: "./assets/Wallpaper/Fallback_Wallpaper_Dark.gif",
    artist: "makrustic",
    sourceUrl: "https://danbooru.donmai.us/posts?tags=makrustic"
  },
  light: {
    path: "./assets/Wallpaper/Fallback_Wallpaper_Light.gif",
    artist: "makrustic",
    sourceUrl: "https://danbooru.donmai.us/posts?tags=makrustic"
  }
};

function setFallbackWallpaper() {
  const isDark = document.body.classList.contains("darkMode");
  const choice = isDark ? LOCAL_FALLBACKS.dark : LOCAL_FALLBACKS.light;

  document.body.style.backgroundImage = `url('${choice.path}')`;
  document.body.classList.add("hasWallpaper");

  const sourceText = document.getElementById("sourceText");
  const postCountInfo = document.getElementById("postCountInfo");

  if (sourceText) sourceText.textContent = `Art by ${choice.artist}`;
  if (postCountInfo) {
    postCountInfo.innerHTML = `<a href="${choice.sourceUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration: underline;">Offline Mode (${isDark ? "Dark" : "Light"})</a>`;
  }
}

async function fetchWallpapers(theme) {
  try {
    const timeTag = theme === "dark" ? "night" : "day";
    const url = `https://safebooru.donmai.us/posts.json?limit=100&tags=scenery+${timeTag}+ratio:16:9`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network request failed");

    const data = await response.json();

    const filtered = data.filter(post => {
      const isHighRes = post.image_width >= 1920 && post.image_height >= 1080;
      return isHighRes && post.file_url; 
    });

    if (theme === "dark") {
      darkPosts = filtered;
    } else {
      lightPosts = filtered;
    }
  } catch (error) {
    console.error(`Failed to fetch ${theme} wallpaper:`, error);
  }
}

async function initWallpapers() {
  await Promise.all([fetchWallpapers("light"), fetchWallpapers("dark")]);
  updateThemeWallpapers();
}

function updateThemeWallpapers() {
  const isDark = document.body.classList.contains("darkMode");
  currentPosts = isDark ? darkPosts : lightPosts;

  if (currentPosts.length > 0) {
    currentIndex = Math.floor(Math.random() * currentPosts.length);
    applyWallpaper();
  } else {
    document.body.style.backgroundImage = "none";
    document.body.classList.remove("hasWallpaper");
  }
}

function applyWallpaper(animate = false) {
  if (currentPosts.length === 0) return;
  const post = currentPosts[currentIndex];
  const imageUrl = post.file_url;

  const updateUI = () => {
    document.body.style.backgroundImage = `url('${imageUrl}')`;
    document.body.classList.add("hasWallpaper");
    
    const sourceText = document.getElementById("sourceText");
    const postCountInfo = document.getElementById("postCountInfo");
    const themeStr = document.body.classList.contains("darkMode") ? "Dark" : "Light";

    if (sourceText && postCountInfo) {
      sourceText.innerHTML = `Image from <i class="fa-solid fa-image"></i> Safebooru`;
      postCountInfo.innerHTML = `HD ${themeStr} Mode #${currentIndex + 1} of ${currentPosts.length} • <a href="https://safebooru.donmai.us/posts/${post.id}" target="_blank" style="color:#fff; text-decoration:underline;">View Original</a>`;
    }
    
    setTimeout(() => {
      document.body.classList.remove("is-changing-wallpaper");
    }, 100);
  };

  if (animate) {
    document.body.classList.add("is-changing-wallpaper");
    
    const img = new Image();
    img.onload = () => {
      setTimeout(updateUI, 600);
    };
    img.onerror = updateUI;
    img.src = imageUrl;
  } else {
    updateUI();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle.querySelector("i");
  const rerollBtn = document.getElementById("rerollBtn");
  const rerollIcon = rerollBtn ? rerollBtn.querySelector("i") : null;
  const hideGuiBtn = document.getElementById("hideGuiBtn");
  const wallpaperControls = document.getElementById("wallpaperControls");

  initWallpapers();

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("darkMode");
    if (document.body.classList.contains("darkMode")) {
      themeIcon.className = "fa-solid fa-moon";
    } else {
      themeIcon.className = "fa-solid fa-sun";
    }
    updateThemeWallpapers();
  });

  if (rerollBtn) {
    rerollBtn.addEventListener("click", () => {
      rerollSound.currentTime = 0;
      rerollSound.play().catch(e => console.log("Audio play prevented"));
      
      if (currentPosts.length > 0) {
        currentIndex = (currentIndex + 1) % currentPosts.length;
        applyWallpaper(true);
      } else {
        const currentTheme = document.body.classList.contains("darkMode") ? "dark" : "light";
        fetchWallpapers(currentTheme).then(() => applyWallpaper(true));
      }
    });
  }

  if (hideGuiBtn && wallpaperControls) {
    hideGuiBtn.addEventListener("click", () => {
      isGuiHidden = !isGuiHidden;
      if (isGuiHidden) {
        wallpaperControls.classList.add("hiddenMode");
        hideGuiBtn.innerHTML = 'show gui <i class="fa-solid fa-eye"></i>';
      } else {
        wallpaperControls.classList.remove("hiddenMode");
        hideGuiBtn.innerHTML = 'hide gui <i class="fa-solid fa-eye-slash"></i>';
      }
    });
  }
});

function openModal(url, type, title) {
  const modal = document.getElementById("projectModal");
  const modalTitle = document.getElementById("modalTitle");
  const iframe = document.getElementById("projectIframe");
  const imgPreview = document.getElementById("projectImgPreview");

  modalTitle.textContent = title;

  if (type === "iframe") {
    iframe.src = url;
    iframe.style.display = "block";
    imgPreview.style.display = "none";
  } else {
    imgPreview.src = url;
    imgPreview.style.display = "block";
    iframe.style.display = "none";
  }

  modal.classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("projectModal");
  const closeBtn = document.getElementById("closeModalBtn");

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.remove("active");
      document.getElementById("projectIframe").src = "";
    });
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active");
        document.getElementById("projectIframe").src = "";
      }
    });
  }
});