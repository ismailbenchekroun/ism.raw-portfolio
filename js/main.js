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

// Touch swipe
let touchStartX = 0;
document.getElementById('lightbox').addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].clientX;
}, { passive: true });
document.getElementById('lightbox').addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 48) dx < 0 ? lightboxNext() : lightboxPrev();
});
