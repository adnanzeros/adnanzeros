try {
  if (window.sessionStorage.getItem("adnanzeros-intro-completed-v5")) {
    document.documentElement.setAttribute("data-intro-completed", "");
  }
} catch (error) {
  console.warn("Intro session storage is unavailable; the intro will play.", error);
}
