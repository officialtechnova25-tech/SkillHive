document.addEventListener("DOMContentLoaded", () => {
  const skillsContainer = document.querySelector("#userSkills");
  const usernameDisplay = document.querySelector("#usernameDisplay");
  const loadingScreen = document.querySelector("#loadingScreen");

  // Fetch stored user info & skills
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const storedSkills = JSON.parse(localStorage.getItem("skills")) || [];

  // 🧠 Show username
  if (storedUser && storedUser.name) {
    usernameDisplay.textContent = storedUser.name;
  } else {
    usernameDisplay.textContent = "Guest";
  }

  // 🎯 Display skills
  if (storedSkills.length > 0) {
    skillsContainer.innerHTML = storedSkills
      .map(
        (s) => `
        <div class="skill-card">
          <span class="skill-name">${s.name || s}</span>
          <span class="skill-level">${s.level || "Beginner"}</span>
        </div>
      `
      )
      .join("");
  } else {
    skillsContainer.innerHTML = `<p>No skills added yet. Update your profile to get started!</p>`;
  }

  // 🌟 Add fade-out + redirect
  setTimeout(() => {
    loadingScreen.classList.add("fade-out");
  }, 2500); // fade-out starts after 2.5 sec

  setTimeout(() => {
    window.location.href = "profile.html";
  }, 3500); // redirect after fade-out completes (3.5 sec)
});
