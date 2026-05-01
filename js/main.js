/* =============================================
   ISM.RAW — MAIN JS
   Dark mode, scroll animations, lightbox, mobile nav
   ============================================= */

// === DARK MODE ===
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeLabel = document.getElementById('themeLabel');

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  if (themeLabel) themeLabel.textContent = theme === 'dark' ? 'Light' : 'Dark';
}

function toggleTheme() {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', next);
  applyTheme(next);
}

// Load saved theme or detect system preference
const saved = localStorage.getItem('theme');
if (saved) {
  applyTheme(saved);
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  applyTheme('dark');
}

if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

// === SCROLL REVEAL ===
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-in, .reveal').forEach(el => observer.observe(el));

// === MOBILE NAV ===
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

function toggleMobileMenu() {
  const isOpen = mobileMenu.classList.contains('open');
  if (isOpen) {
    closeMobileMenu();
  } else {
    mobileMenu.classList.add('open');
    hamburger.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  if (hamburger) hamburger.classList.remove('open');
  document.body.style.overflow = '';
}

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeMobileMenu();
    closeLightbox();
  }
});

// === LIGHTBOX ===
let currentIndex = 0;
let photos = [];

// Gallery photos are injected per-page as `galleryPhotos`
function openLightbox(index) {
  if (typeof galleryPhotos === 'undefined') return;
  photos = galleryPhotos;
  currentIndex = index;
  showLightboxPhoto(currentIndex);
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function showLightboxPhoto(index) {
  const photo = photos[index];
  document.getElementById('lightboxImg').src = photo.src;
  document.getElementById('lightboxImg').alt = photo.caption || '';
  document.getElementById('lightboxCaption').textContent = photo.caption || '';
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

// Click outside image to close
document.getElementById('lightbox').addEventListener('click', function(e) {
  if (e.target === this) closeLightbox();
});

// Keyboard nav for lightbox
document.addEventListener('keydown', e => {
  if (!document.getElementById('lightbox').classList.contains('open')) return;
  if (e.key === 'ArrowLeft') lightboxPrev();
  if (e.key === 'ArrowRight') lightboxNext();
});

// Touch swipe for lightbox
let touchStartX = 0;
document.getElementById('lightbox').addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].clientX;
});
document.getElementById('lightbox').addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) {
    dx < 0 ? lightboxNext() : lightboxPrev();
  }
});
