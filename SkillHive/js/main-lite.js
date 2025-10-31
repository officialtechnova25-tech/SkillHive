// --- Lightweight Master Script for Skill Hive ---
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
  
});