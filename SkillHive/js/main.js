// --- Master Script for Skill Hive ---
document.addEventListener("DOMContentLoaded", () => {

  // --- 1. Pre-loader Logic (Runs First) ---
  const preloader = document.getElementById('preloader');
  if (preloader) {
      preloader.style.opacity = '0';
      setTimeout(() => { preloader.style.display = 'none'; }, 500);
  }

  // --- 2. Initialize Core Variables ---
  const htmlElement = document.documentElement;

  // --- 3. Theme Settings Logic ---
  const savedTheme = localStorage.getItem('skill-hive-theme') || 'theme-neptune';
  htmlElement.setAttribute('data-theme', savedTheme);

  const themeSwatches = document.querySelectorAll('.theme-swatch');
  themeSwatches.forEach(swatch => {
    if (swatch.dataset.theme === savedTheme) {
      swatch.classList.add('active');
    }
    swatch.addEventListener('click', () => {
      const selectedTheme = swatch.dataset.theme;
      htmlElement.setAttribute('data-theme', selectedTheme);
      localStorage.setItem('skill-hive-theme', selectedTheme);
      const currentActive = document.querySelector('.theme-swatch.active');
      if (currentActive) {
        currentActive.classList.remove('active');
      }
      swatch.classList.add('active');
    });
  });

  // --- 4. Dark Mode Logic ---
  const darkModeToggle = document.getElementById("darkModeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const savedDarkMode = localStorage.getItem("skill-hive-dark-mode");

  if (savedDarkMode === 'true') {
    htmlElement.setAttribute("data-bs-theme", 'dark');
    if (themeIcon) themeIcon.setAttribute("data-lucide", "sun");
  }

  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
      const isDark = htmlElement.getAttribute("data-bs-theme") === 'dark';
      const newTheme = isDark ? 'light' : 'dark';
      htmlElement.setAttribute("data-bs-theme", newTheme);
      localStorage.setItem("skill-hive-dark-mode", newTheme === 'dark');
      if (themeIcon) {
        themeIcon.setAttribute("data-lucide", newTheme === "dark" ? "sun" : "moon");
      }
      lucide.createIcons();
    });
  }

  // --- 5. Initialize Lucide Icons ---
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // --- 6. Page Transition Logic ---
  const pageWrapper = document.querySelector('.page-wrapper');
  if (pageWrapper) {
      document.querySelectorAll('a[href]:not([href^="#"]):not([data-bs-toggle])').forEach(link => {
        if (link.hostname === window.location.hostname) {
          link.addEventListener("click", event => {
            event.preventDefault();
            pageWrapper.classList.add("fade-out");
            setTimeout(() => { window.location.href = link.href; }, 500);
          });
        }
      });
  }

  // --- 7. Staggered Word Reveal for Main Headline ---
  const headline = document.querySelector('section.text-center h1');
  if (headline) {
    const text = headline.textContent;
    const words = text.split(' ');
    headline.innerHTML = '';
    words.forEach((word, index) => {
      const wordSpan = document.createElement('span');
      const wordWrapper = document.createElement('span');
      wordSpan.textContent = word;
      wordWrapper.className = 'word-wrapper';
      wordWrapper.style.animationDelay = `${index * 0.1}s`;
      wordWrapper.appendChild(wordSpan);
      headline.appendChild(wordWrapper);
      headline.appendChild(document.createTextNode(' '));
    });
  }

  // --- 8. Scroll to Reveal Logic ---
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  });
  document.querySelectorAll('.reveal-on-scroll').forEach(element => {
    scrollObserver.observe(element);
  });
  
});
const htmlEl = document.documentElement;
const bodyEl = document.body;
const newTheme = isDark ? "light" : "dark";
htmlEl.setAttribute("data-bs-theme", newTheme);
bodyEl.setAttribute("data-bs-theme", newTheme);
window.addEventListener("load", () => {
  setTimeout(() => {
    const loader = document.getElementById("loader");
    loader.style.opacity = 0; // fade out loader
    setTimeout(() => loader.style.display = "none", 500); // remove loader

    // show main content with fade-in
    const main = document.getElementById("mainContent");
    main.classList.remove("d-none");
    main.classList.add("fade-in");
  }, 1500); // loader duration
});
