// Router and slide orchestration for Mission Intelligence.
// Manages the 7-slide flow, tab visibility, and CSS-based swoosh transitions.

(function () {
  'use strict';

  const TOTAL_SLIDES  = 7;
  const TRANSITION_MS = 600; // must match --transition-slide in tokens.css

  let currentSlide    = 1;
  let isTransitioning = false;

  const header = document.getElementById('app-header');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const tabs   = Array.from(document.querySelectorAll('.tab'));

  // ── Helpers ──────────────────────────────────────────────────────────────

  function getSlide(n) {
    return slides.find(s => +s.dataset.slide === n) || null;
  }

  function updateHeader(slideNum) {
    header.classList.toggle('hidden', slideNum === 1);
  }

  function updateTabs(slideNum) {
    tabs.forEach(t => t.classList.remove('active'));
    const active = tabs.find(t => +t.dataset.slide === slideNum);
    if (active) active.classList.add('active');
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  function goToSlide(target) {
    if (target === currentSlide || isTransitioning) return;
    if (target < 1 || target > TOTAL_SLIDES) return;

    isTransitioning = true;

    const from    = getSlide(currentSlide);
    const to      = getSlide(target);
    const forward = target > currentSlide;

    // For backward navigation the incoming slide must start on the LEFT.
    // CSS default (.slide without .active) positions it off-screen to the RIGHT,
    // so we override it once without a transition, then restore the transition.
    if (!forward) {
      to.style.transition = 'none';
      to.style.transform  = 'translateX(-100%)';
      to.getBoundingClientRect(); // force reflow so the browser registers the starting position
      to.style.transition = '';
    }

    // Kick off the swoosh: 'to' slides in to center, 'from' slides out.
    to.style.transform   = 'translateX(0)';
    from.style.transform = forward ? 'translateX(-100%)' : 'translateX(100%)';

    currentSlide = target;
    updateHeader(target);
    updateTabs(target);
    document.dispatchEvent(new CustomEvent('app:slide-changed', { detail: { to: target } }));

    setTimeout(() => {
      // Hand control back to CSS by transferring the .active class and clearing
      // all inline transforms. The .active rule keeps 'to' at translateX(0),
      // while 'from' reverts to the CSS default of translateX(100%).
      from.classList.remove('active');
      to.classList.add('active');

      to.style.transform = '';

      // Snap 'from' to its CSS resting position without an animated snap-back.
      from.style.transition = 'none';
      from.style.transform  = '';
      requestAnimationFrame(() => { from.style.transition = ''; });

      isTransitioning = false;
    }, TRANSITION_MS);
  }

  // ── Event bindings ───────────────────────────────────────────────────────

  tabs.forEach(tab => {
    tab.addEventListener('click', () => goToSlide(+tab.dataset.slide));
  });

  // Any click on slide 1 advances to the overview.
  const startSlide = getSlide(1);
  if (startSlide) {
    startSlide.addEventListener('click', () => goToSlide(2));
  }

  // ── Initialise ───────────────────────────────────────────────────────────

  // Slide 1 already has .active in the HTML; header already has .hidden.
  // Calling these ensures the JS state matches the DOM on load.
  updateHeader(1);

  // Expose router for slide components to call in later phases.
  window.APP_ROUTER = { goToSlide };

})();
