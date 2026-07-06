// Keyboard navigation for Mission Intelligence.
// Overview (Folie 2): number keys 1–5 jump to mission slides 3–7.
// Mission slides (Folien 3–7): arrow keys cycle through pins (flyTo + tile opens).

(function () {
  'use strict';

  const SLIDE_FOR_NUMBER  = { '1': 3, '2': 4, '3': 5, '4': 6, '5': 7 };
  const MISSION_FOR_SLIDE = { 3: 'climate', 4: 'cities', 5: 'cancer', 6: 'soil', 7: 'water' };

  let _currentSlide = 1;

  document.addEventListener('app:slide-changed', e => { _currentSlide = e.detail.to; });

  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const key = e.key;

    // F-Taste: Vollbild umschalten (auf jeder Folie)
    if (key === 'f' || key === 'F') {
      e.preventDefault();
      APP_FULLSCREEN.toggle();
      return;
    }

    // Coverfolie: Pfeil rechts → Übersicht
    if (_currentSlide === 1 && key === 'ArrowRight') {
      e.preventDefault();
      APP_ROUTER.goToSlide(2);
      return;
    }

    // Folien 2–7: Zahlentasten 1–5 → Missionsfolie
    if (_currentSlide >= 2 && SLIDE_FOR_NUMBER[key]) {
      e.preventDefault();
      APP_ROUTER.goToSlide(SLIDE_FOR_NUMBER[key]);
      return;
    }

    // Missionsfolien: Pfeiltasten → Pin-Navigation
    const missionKey = MISSION_FOR_SLIDE[_currentSlide];
    if (missionKey) {
      if (key === 'ArrowRight' || key === 'ArrowDown') {
        e.preventDefault();
        APP_MISSION_NAV.navigatePin(missionKey, 1);
      } else if (key === 'ArrowLeft' || key === 'ArrowUp') {
        e.preventDefault();
        APP_MISSION_NAV.navigatePin(missionKey, -1);
      }
    }
  });

})();
