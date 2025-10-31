// config.js created by apply-live-backend.ps1
(function () {
  const API_ORIGIN = "https://skillhive-backend-qdss.onrender.com";
  const API_BASE_URL = API_ORIGIN + "/api";
  if (typeof window !== "undefined") {
    window.API_ORIGIN = API_ORIGIN;
    window.API_BASE_URL = (window.location.hostname === "localhost")
      ? "http://localhost:5000/api"
      : API_BASE_URL;
    window.API_ORIGIN_USED = (window.location.hostname === "localhost")
      ? "http://localhost:5000"
      : API_ORIGIN;
  }
})();
