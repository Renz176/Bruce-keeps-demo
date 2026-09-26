const config = window.siteConfig || {};

const createPlaceholderSvg = (label = "YOUR PHOTO") => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#f9efe8" />
          <stop offset="100%" stop-color="#f2dfe4" />
        </linearGradient>
      </defs>
      <rect width="1200" height="1200" fill="url(#bg)"/>
      <rect x="50" y="50" width="1100" height="1100" rx="26" fill="none" stroke="#d9b6ad" stroke-width="8"/>
      <rect x="110" y="110" width="980" height="980" rx="18" fill="none" stroke="#f2dace" stroke-width="2"/>
      <text x="600" y="620" text-anchor="middle" fill="#6f4d4a" font-family="Georgia, serif" font-size="82" letter-spacing="8">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const getStoredPhoto = (index) => {
  try {
    return localStorage.getItem(`bruce-keeps-photo-${index}`);
  } catch (error) {
    return null;
  }
};

const setStoredPhoto = (index, value) => {
  try {
    localStorage.setItem(`bruce-keeps-photo-${index}`, value);
  } catch (error) {
    // Ignore localStorage failures in privacy-restricted browsers.
  }
};

const clearStoredPhoto = (index) => {
  try {
    localStorage.removeItem(`bruce-keeps-photo-${index}`);
  } catch (error) {
    // Ignore localStorage failures in privacy-restricted browsers.
  }
};

const safeText = (value, fallback) => (value && value.trim()) || fallback;

const setText = (selector, text) => {
  const target = document.querySelector(selector);
  if (target) target.textContent = text;
};

const applyBranding = () => {
  setText('[data-role="site-name"]', safeText(config.siteName, "BRUCE KEEPS"));
  setText(
    '[data-role="tagline"]',
    safeText(config.tagline, "Make your memories last forever."),
  );
  setText(
    '[data-role="couple-name"]',
    safeText(config.coupleName, "YOUR NAME"),
  );
  setText(
    '[data-role="partner-name"]',
    safeText(config.partnerName, "YOUR LOVE"),
  );
  setText(
    '[data-role="hero-subtitle"]',
    safeText(
      config.heroSubtitle,
      "Every moment with you is a memory worth keeping.",
    ),
  );
  const letterTextEl = document.getElementById("loveLetter");
  if (letterTextEl) {
    letterTextEl.textContent = safeText(
      config.letterText,
      `Dear You,\n\nEvery photo holds a memory, and every memory holds a story.\n\nThis little website is a collection of the moments that made our journey special.\n\nHere's to all the memories we've made and all the memories still waiting for us.\n\nWith love,\nYour Person ♡`,
    );
  }
};

const buildPhotoGallery = () => {
  const photoGrid = document.getElementById("photoGrid");
  if (!photoGrid) return;

  const photoPaths =
    config.photoPaths ||
    Array.from({ length: 12 }, (_, i) => `images/photo${i + 1}.jpg`);
  const photoCaptions =
    config.photoCaptions ||
    Array.from({ length: 12 }, (_, i) => `CAPTION ${i + 1}`);

  photoGrid.innerHTML = "";

  photoPaths.forEach((path, index) => {
    const article = document.createElement("article");
    article.className = "photo-card";
    article.style.setProperty(
      "--rot",
      `${(index % 2 === 0 ? 1 : -1) * (index % 4 === 0 ? 2 : 5)}deg`,
    );

    const frame = document.createElement("div");
    frame.className = "photo-frame";

    const img = document.createElement("img");
    img.className = "memory-photo";
    img.alt = photoCaptions[index] || "Memory photo";
    img.loading = "lazy";

    const placeholder = document.createElement("div");
    placeholder.className = "frame-placeholder";
    placeholder.textContent = "YOUR PHOTO";
    placeholder.setAttribute("aria-hidden", "true");

    const actions = document.createElement("div");
    actions.className = "photo-actions";

    const uploadLabel = document.createElement("label");
    uploadLabel.className = "upload-chip";
    uploadLabel.innerHTML = "<span>Add Photo</span>";

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.setAttribute("aria-label", `Upload photo ${index + 1}`);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-photo";
    removeButton.textContent = "Remove";

    uploadLabel.appendChild(fileInput);
    actions.appendChild(uploadLabel);
    actions.appendChild(removeButton);

    const caption = document.createElement("div");
    caption.className = "photo-caption";
    caption.textContent = photoCaptions[index] || "OUR MEMORY";

    const showPlaceholder = () => {
      img.style.display = "none";
      placeholder.style.display = "flex";
      removeButton.disabled = true;
    };

    const showImage = (src) => {
      img.src = src;
      img.style.display = "block";
      placeholder.style.display = "none";
      removeButton.disabled = false;
    };

    const savedImage = getStoredPhoto(index);
    if (savedImage) {
      showImage(savedImage);
    } else {
      img.src = path;
      img.style.display = "none";
      placeholder.style.display = "flex";
      removeButton.disabled = true;
    }

    img.addEventListener("error", () => {
      showPlaceholder();
      clearStoredPhoto(index);
    });

    img.addEventListener("load", () => {
      if (img.src) {
        placeholder.style.display = "none";
        img.style.display = "block";
      }
    });

    fileInput.addEventListener("change", (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target && loadEvent.target.result;
        if (!result) return;
        setStoredPhoto(index, result);
        showImage(result);
      };
      reader.readAsDataURL(file);
    });

    removeButton.addEventListener("click", () => {
      clearStoredPhoto(index);
      img.removeAttribute("src");
      img.style.display = "none";
      placeholder.style.display = "flex";
      removeButton.disabled = true;
      fileInput.value = "";
    });

    frame.appendChild(img);
    frame.appendChild(placeholder);
    frame.appendChild(actions);
    article.appendChild(frame);
    article.appendChild(caption);
    photoGrid.appendChild(article);
  });
};

const buildTimeline = () => {
  const timelineList = document.getElementById("timelineList");
  if (!timelineList) return;

  const items = config.timeline || [
    { title: "THE BEGINNING", text: "Where our story started." },
    {
      title: "THE FIRST MEMORY",
      text: "One of the moments we will always remember.",
    },
    { title: "MORE MEMORIES", text: "Every day became another story." },
    { title: "TO BE CONTINUED...", text: "Our story is still being written." },
  ];

  timelineList.innerHTML = items
    .map(
      (item, index) => `
      <article class="timeline-item">
        <div class="time-badge">${item.title}</div>
        <div class="timeline-copy">
          <p>${item.text}</p>
        </div>
      </article>
    `,
    )
    .join("");
};

const buildQR = () => {
  const qrContainer = document.getElementById("qrCode");
  const qrUploadInput = document.getElementById("customQrUpload");
  if (!qrContainer) return;

  const url = config.websiteURL || "https://example.com";
  const savedQr = localStorage.getItem("bruce-keeps-custom-qr");

  const renderGeneratedQR = () => {
    const encodedUrl = encodeURIComponent(url);
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodedUrl}&ecc=L`;

    qrContainer.innerHTML = `
      <img
        src="${qrImageUrl}"
        alt="QR code for ${url}"
        loading="lazy"
      />
    `;
  };

  const renderUploadedQR = (src) => {
    qrContainer.innerHTML = `<img src="${src}" alt="Custom QR code" />`;
  };

  if (savedQr) {
    renderUploadedQR(savedQr);
  } else {
    renderGeneratedQR();
  }

  if (qrUploadInput) {
    qrUploadInput.addEventListener("change", (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target && loadEvent.target.result;
        if (!result) return;
        localStorage.setItem("bruce-keeps-custom-qr", result);
        renderUploadedQR(result);
      };
      reader.readAsDataURL(file);
    });
  }
};

const createPetals = () => {
  const petalLayer = document.getElementById("petalLayer");
  if (!petalLayer) return;

  const petalCount = 24;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < petalCount; i += 1) {
    const petal = document.createElement("span");
    petal.className = "petal";

    const size = (Math.random() * 18 + 10).toFixed(2);
    const duration = (Math.random() * 16 + 10).toFixed(2);
    const delay = (Math.random() * 14).toFixed(2);
    const drift = (Math.random() * 120 - 60).toFixed(2);
    const angle = (Math.random() * 180).toFixed(2);
    const left = (Math.random() * 100).toFixed(2);

    petal.style.setProperty("--size", `${size}px`);
    petal.style.setProperty("--duration", `${duration}s`);
    petal.style.setProperty("--delay", `${delay}s`);
    petal.style.setProperty("--drift", `${drift}px`);
    petal.style.setProperty("--angle", `${angle}deg`);
    petal.style.left = `${left}%`;

    fragment.appendChild(petal);
  }

  petalLayer.appendChild(fragment);
};

const setupMenu = () => {
  const nav = document.getElementById("mainNav");
  const toggle = document.querySelector(".nav-toggle");
  if (!nav || !toggle) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
};

const setupRevealAnimations = () => {
  const sections = document.querySelectorAll(".reveal-section");
  if (!("IntersectionObserver" in window)) {
    sections.forEach((section) => section.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 },
  );

  sections.forEach((section) => observer.observe(section));
};

const setupMusicPlayer = () => {
  const musicPlayer = document.getElementById("musicPlayer");
  const musicToggle = document.getElementById("musicToggle");
  const volumeToggle = document.getElementById("volumeToggle");
  if (!musicPlayer || !musicToggle) return;

  const source = config.musicFile || "";
  const label = musicToggle.querySelector("span:last-child");

  if (!source || !source.trim()) {
    if (label) label.textContent = "Add our song";
    musicToggle.disabled = true;
    if (volumeToggle) volumeToggle.disabled = true;
    return;
  }

  musicPlayer.src = source;
  musicPlayer.autoplay = true;
  musicPlayer.loop = true;
  musicPlayer.muted = false;
  musicPlayer.volume = 0.7;

  const updateVolumeButton = () => {
    if (!volumeToggle) return;
    const isMuted = musicPlayer.muted;
    volumeToggle.classList.toggle("muted", isMuted);
    volumeToggle.setAttribute(
      "aria-label",
      isMuted ? "Unmute music" : "Mute music",
    );
    volumeToggle.innerHTML = isMuted
      ? '<span class="volume-icon">🔇</span>'
      : '<span class="volume-icon">🔊</span>';
  };

  const startPlayback = async () => {
    try {
      await musicPlayer.play();
      musicToggle.classList.add("playing");
      if (label) label.textContent = "Our Song";
    } catch (error) {
      console.warn("Music could not autoplay:", error);
      musicToggle.classList.remove("playing");
      if (label) label.textContent = "Tap to play";
    }
  };

  musicToggle.addEventListener("click", async () => {
    try {
      if (musicPlayer.paused) {
        await musicPlayer.play();
        musicToggle.classList.add("playing");
        if (label) label.textContent = "Our Song";
      } else {
        musicPlayer.pause();
        musicToggle.classList.remove("playing");
      }
    } catch (error) {
      console.warn("Music could not play:", error);
      musicToggle.classList.remove("playing");
      if (label) label.textContent = "Ready to play";
    }
  });

  if (volumeToggle) {
    volumeToggle.addEventListener("click", () => {
      musicPlayer.muted = !musicPlayer.muted;
      updateVolumeButton();
      if (!musicPlayer.muted && musicPlayer.paused) {
        musicPlayer.play();
        musicToggle.classList.add("playing");
      }
    });
  }

  musicPlayer.addEventListener("pause", () => {
    musicToggle.classList.remove("playing");
  });

  musicPlayer.addEventListener("error", () => {
    musicToggle.classList.remove("playing");
    if (label) label.textContent = "Add our song";
  });

  updateVolumeButton();
  startPlayback();
};

const applyColors = () => {
  const root = document.documentElement;
  const colors = (config.colors && config.colors) || {};
  const mapping = {
    rose: "--rose",
    dusty: "--dusty",
    blush: "--blush",
    cream: "--cream",
    paper: "--paper",
    brown: "--brown",
    gold: "--gold",
    ink: "--ink",
    shadow: "--shadow",
  };

  Object.entries(mapping).forEach(([key, cssVar]) => {
    if (colors[key]) {
      root.style.setProperty(cssVar, colors[key]);
    }
  });
};

applyColors();
applyBranding();
buildPhotoGallery();
buildTimeline();
buildQR();
createPetals();
setupMenu();
setupRevealAnimations();
setupMusicPlayer();
