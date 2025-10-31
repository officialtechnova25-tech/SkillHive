// js/authHandler.js

document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();

  const token = localStorage.getItem("token");
  const userJSON = localStorage.getItem("user");
  const authLinks = document.getElementById("auth-links");
  const mainActionButtons = document.getElementById("main-action-buttons");
  const offcanvasAuthLinks = document.getElementById("offcanvas-auth-links");
  const adminLink = document.getElementById("adminPanelLink");

  // --- Logout Function ---
  const logout = () => {
    localStorage.clear();
    alert("You have been logged out.");
    window.location.href = "index.html";
  };

  if (token && userJSON) {
    const user = JSON.parse(userJSON);

    // ✅ Header for logged-in user
    if (authLinks) {
      authLinks.innerHTML = `
        <span class="navbar-text me-3">Hi, ${user.name}!</span>
        <a href="dashboard.html" class="btn btn-outline-primary me-2">Dashboard</a>
        <button id="logout-btn-header" class="btn btn-outline-danger">Logout</button>
      `;
      document.getElementById("logout-btn-header").addEventListener("click", logout);
    }

    // ✅ Main action buttons
    if (mainActionButtons) {
      mainActionButtons.innerHTML = `
        <a href="dashboard.html" class="btn btn-primary btn-lg me-2">Get Started</a>
        <a href="search.html" class="btn btn-secondary btn-lg">Browse Skills</a>
      `;
    }

    // ✅ Offcanvas auth links
    if (offcanvasAuthLinks) {
      offcanvasAuthLinks.innerHTML = `
        <hr/>
        <a href="#" id="logout-link-offcanvas" class="btn btn-outline-danger w-100">
          <i data-lucide="log-out"></i> Logout
        </a>
      `;
      document.getElementById("logout-link-offcanvas").addEventListener("click", logout);
      lucide.createIcons();
    }

    // ✅ Show Admin Panel if user is admin
    if (user.role && user.role.toLowerCase() === "admin") {
      if (adminLink) adminLink.style.display = "block";
    } else {
      if (adminLink) adminLink.style.display = "none";
    }

  } else {
    // ❌ Not logged in
    if (authLinks) {
      authLinks.innerHTML = `
        <a href="login.html" class="btn btn-light me-2">Login</a>
        <a href="signup.html" class="btn btn-primary">Sign Up</a>
      `;
    }

    if (mainActionButtons) {
      mainActionButtons.innerHTML = `
        <a href="signup.html" class="btn btn-primary btn-lg me-2">Get Started</a>
        <a href="search.html" class="btn btn-secondary btn-lg">Browse Skills</a>
      `;
    }

    if (offcanvasAuthLinks) {
      offcanvasAuthLinks.innerHTML = `
        <hr/>
        <div class="d-flex justify-content-center">
          <a href="login.html" class="btn btn-light me-2">Login</a>
          <a href="signup.html" class="btn btn-primary">Sign Up</a>
        </div>
      `;
    }

    if (adminLink) adminLink.style.display = "none";
  }

  // --- Theme Handling (Dark / Light Mode) ---
  const darkModeToggle = document.getElementById("darkModeToggle");
  const themeIcon = document.getElementById("themeIcon");
  const body = document.body;

  function loadParticles() {
    const particleColor = "#20c997";
    tsParticles.load("tsparticles", {
      fpsLimit: 60,
      background: { color: "transparent" },
      particles: {
        number: { value: 100, density: { enable: true, area: 800 } },
        color: { value: particleColor },
        shape: { type: "circle" },
        opacity: { value: { min: 0.1, max: 0.6 } },
        size: { value: { min: 1, max: 10 } },
        move: {
          enable: true,
          speed: 1.5,
          direction: "top",
          random: true,
          straight: false,
          outModes: { default: "out", top: "destroy" },
        },
      },
      interactivity: {
        events: { onHover: { enable: true, mode: "bubble" }, resize: true },
        modes: { bubble: { distance: 200, duration: 2, opacity: 1, size: 12 } },
      },
      detectRetina: true,
    });
  }

  const setTheme = (isDark) => {
    body.setAttribute("data-bs-theme", isDark ? "dark" : "light");
    themeIcon.setAttribute("data-lucide", isDark ? "sun" : "moon");
    lucide.createIcons();
    localStorage.setItem("darkMode", isDark ? "true" : "false");
    setTimeout(loadParticles, 50);
  };

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const savedTheme = localStorage.getItem("darkMode");
  const isInitiallyDark = savedTheme !== null ? savedTheme === "true" : prefersDark;
  setTheme(isInitiallyDark);

  if (darkModeToggle) {
    darkModeToggle.addEventListener("click", () => {
      const isCurrentlyDark = body.getAttribute("data-bs-theme") === "dark";
      setTheme(!isCurrentlyDark);
    });
  }
});
