/* =============================================
   ISM.RAW — MAIN JS
   ============================================= */

// === NAV HIDE ON SCROLL DOWN / SHOW ON SCROLL UP ===
(function () {
  const navEl = document.querySelector('nav');
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > lastY && y > 80) {
      navEl.classList.add('nav--hidden');
    } else {
      navEl.classList.remove('nav--hidden');
    }
    lastY = y;
  }, { passive: true });
})();

// === DARK MODE ===
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeLabel  = document.getElementById('themeLabel');

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  if (themeLabel) themeLabel.textContent = theme === 'dark' ? 'Light' : 'Dark';
}
function toggleTheme() {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', next);
  applyTheme(next);
}

const saved = localStorage.getItem('theme');
applyTheme(saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

// === SCROLL REVEAL ===
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.07, rootMargin: '0px 0px -32px 0px' });

document.querySelectorAll('.fade-in, .reveal').forEach(el => observer.observe(el));

// === IMAGE LOADED STATE (shimmer cleanup) ===
document.querySelectorAll('img').forEach(img => {
  if (img.complete) img.classList.add('loaded');
  else img.addEventListener('load', () => img.classList.add('loaded'));
});

// === MOBILE NAV ===
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobileMenu');

function toggleMobileMenu() {
  const open = mobileMenu.classList.contains('open');
  open ? closeMobileMenu() : openMobileMenu();
}
function openMobileMenu() {
  mobileMenu.classList.add('open');
  hamburger.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  if (hamburger) hamburger.classList.remove('open');
  document.body.style.overflow = '';
}

// === GALLERY PICKER ===
const galleryPicker = document.getElementById('galleryPicker');

function openGalleryPicker() {
  closeMobileMenu();
  galleryPicker.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeGalleryPicker() {
  galleryPicker.classList.remove('open');
  document.body.style.overflow = '';
}

// Click backdrop to close
galleryPicker.addEventListener('click', e => {
  if (e.target === galleryPicker) closeGalleryPicker();
});

// === KEYBOARD ===
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeLightbox();
    closeGalleryPicker();
    closeMobileMenu();
  }
  if (!document.getElementById('lightbox').classList.contains('open')) return;
  if (e.key === 'ArrowLeft')  lightboxPrev();
  if (e.key === 'ArrowRight') lightboxNext();
});

// === LIGHTBOX ===
let currentIndex = 0;
let photos = [];

function openLightbox(index) {
  if (typeof galleryPhotos === 'undefined') return;
  photos = galleryPhotos;
  currentIndex = index;
  showLightboxPhoto(currentIndex);
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function showLightboxPhoto(i) {
  const p = photos[i];
  const img = document.getElementById('lightboxImg');
  img.src = p.src;
  img.alt = p.caption || '';
  document.getElementById('lightboxCaption').textContent = p.caption || '';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}
function lightboxPrev() {
  currentIndex = (currentIndex - 1 + photos.length) % photos.length;
  showLightboxPhoto(currentIndex);
}
function lightboxNext() {
  currentIndex = (currentIndex + 1) % photos.length;
  showLightboxPhoto(currentIndex);
}

// Backdrop close
document.getElementById('lightbox').addEventListener('click', function(e) {
  if (e.target === this) closeLightbox();
});

// === ABOUT PAGE: SCROLL-DRIVEN PORTRAIT → NAME ANIMATION ===
(function () {
  const stage = document.getElementById('aboutScrollStage');
  if (!stage || window.innerWidth <= 768) return;

  const portraitImg = document.getElementById('aboutPortraitImg');
  const namePanel   = document.getElementById('aboutNamePanel');
  const nudge       = document.getElementById('aboutScrollNudge');

  function ease(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function update() {
    const stageTop  = stage.getBoundingClientRect().top + window.scrollY;
    const scrollable = stage.offsetHeight - window.innerHeight;
    const raw = (window.scrollY - stageTop) / scrollable;
    const p  = Math.max(0, Math.min(1, raw));

    // Dead zone: first 15% of scroll — portrait just breathes
    const animP = Math.max(0, (p - 0.15) / 0.85);
    const e = ease(animP);

    // Portrait clips in from the right edge (full → 3/4 width)
    portraitImg.style.clipPath = `inset(0 ${25 * e}% 0 0)`;

    // Name panel slides in from right, fades in
    namePanel.style.transform  = `translateX(${(1 - e) * 100}%)`;
    namePanel.style.opacity    = Math.max(0, (animP - 0.2) / 0.5);

    // Scroll nudge fades out as name panel arrives
    nudge.style.opacity = 1 - e;
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// === GALLERY INTRO SCROLL FADE ===
(function () {
  const intro = document.getElementById('galleryIntro');
  if (!intro) return;

  function update() {
    const h = intro.offsetHeight;
    const progress = Math.min(1, window.scrollY / (h * 0.6));
    intro.style.opacity = 1 - progress;
    intro.style.transform = `translateY(${-progress * 32}px)`;
    intro.style.pointerEvents = progress >= 1 ? 'none' : '';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// === LIGHTBOX TOUCH: SWIPE + PINCH-TO-ZOOM + DOUBLE-TAP ===
(function () {
  const lightbox  = document.getElementById('lightbox');
  const imgWrap   = lightbox.querySelector('.lightbox-img-wrap');
  const img       = document.getElementById('lightboxImg');

  let scale       = 1;
  let minScale    = 1;
  let maxScale    = 4;
  let originX     = 0; // transform origin offset
  let originY     = 0;
  let panX        = 0;
  let panY        = 0;

  // pinch state
  let lastPinchDist  = null;
  let pinchMidX      = 0;
  let pinchMidY      = 0;

  // swipe state
  let touchStartX    = 0;
  let touchStartY    = 0;
  let swipeBlocked   = false; // blocked when zoomed in

  // double-tap state
  let lastTap        = 0;

  function applyTransform() {
    img.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
    img.style.transformOrigin = '50% 50%';
  }

  function resetZoom() {
    scale = 1; panX = 0; panY = 0;
    img.style.transition = 'transform 0.3s ease';
    applyTransform();
    setTimeout(() => img.style.transition = '', 300);
  }

  // clamp pan so image never leaves the viewport
  function clampPan() {
    const rect   = imgWrap.getBoundingClientRect();
    const iW     = rect.width  * scale;
    const iH     = rect.height * scale;
    const maxPX  = Math.max(0, (iW  - rect.width)  / 2);
    const maxPY  = Math.max(0, (iH  - rect.height) / 2);
    panX = Math.min(maxPX, Math.max(-maxPX, panX));
    panY = Math.min(maxPY, Math.max(-maxPY, panY));
  }

  function getDist(t) {
    const dx = t[0].clientX - t[1].clientX;
    const dy = t[0].clientY - t[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function getMid(t) {
    return {
      x: (t[0].clientX + t[1].clientX) / 2,
      y: (t[0].clientY + t[1].clientY) / 2
    };
  }

  // Reset zoom whenever a new photo loads
  const origShow = showLightboxPhoto;
  window.showLightboxPhoto = function(i) {
    origShow(i);
    scale = 1; panX = 0; panY = 0;
    img.style.transition = '';
    applyTransform();
  };

  lightbox.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      // pinch start
      lastPinchDist = getDist(e.touches);
      const mid = getMid(e.touches);
      pinchMidX = mid.x;
      pinchMidY = mid.y;
      swipeBlocked = true;
    } else if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      swipeBlocked = scale > 1;

      // double-tap to zoom
      const now = Date.now();
      if (now - lastTap < 280) {
        e.preventDefault();
        if (scale > 1) {
          resetZoom();
        } else {
          scale = 2.5;
          // zoom towards tap point
          const rect = imgWrap.getBoundingClientRect();
          panX = (rect.width  / 2 - (e.touches[0].clientX - rect.left)) * (scale - 1) / scale;
          panY = (rect.height / 2 - (e.touches[0].clientY - rect.top )) * (scale - 1) / scale;
          clampPan();
          img.style.transition = 'transform 0.25s ease';
          applyTransform();
          setTimeout(() => img.style.transition = '', 250);
        }
      }
      lastTap = now;
    }
  }, { passive: false });

  lightbox.addEventListener('touchmove', e => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = getDist(e.touches);
      const mid  = getMid(e.touches);

      if (lastPinchDist !== null) {
        const delta = dist / lastPinchDist;
        const newScale = Math.min(maxScale, Math.max(minScale, scale * delta));

        // adjust pan to keep pinch midpoint stable
        const rect = imgWrap.getBoundingClientRect();
        const cx = mid.x - rect.left - rect.width  / 2;
        const cy = mid.y - rect.top  - rect.height / 2;
        panX = cx - (cx - panX) * (newScale / scale);
        panY = cy - (cy - panY) * (newScale / scale);
        scale = newScale;
        clampPan();
        applyTransform();
      }
      lastPinchDist = dist;

    } else if (e.touches.length === 1 && scale > 1) {
      // pan while zoomed
      e.preventDefault();
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;
      panX += dx; panY += dy;
      clampPan();
      applyTransform();
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: false });

  lightbox.addEventListener('touchend', e => {
    lastPinchDist = null;

    // snap back to minScale if under-pinched
    if (scale < 1) {
      resetZoom();
      return;
    }

    // swipe to navigate only when not zoomed
    if (!swipeBlocked && e.changedTouches.length === 1) {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
        resetZoom();
        dx < 0 ? lightboxNext() : lightboxPrev();
      }
    }
  }, { passive: true });
})();
