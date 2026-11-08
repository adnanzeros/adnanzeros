// Runs before the page paints, so the intro never flashes when it should be skipped.
// Keep the session key in sync with IntroOverlay.jsx.
try {
  var introSkipped =
    window.location.pathname !== '/' ||
    window.sessionStorage.getItem('adnanzeros-intro-completed-v5');
  if (introSkipped) {
    document.documentElement.setAttribute('data-intro-completed', '');
  }
} catch (error) {
  // Storage can be unavailable; the intro will play on the home page.
}
