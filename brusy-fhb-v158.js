// RaK 1.5.8 – Brusy/FHB: zjednodušené popisky, výrazné indexy a prázdná pole nejsou nula.
(function installBrusFhbV158() {
  'use strict';

  function installStyles() {
    if (document.getElementById('brus-fhb-v158-styles')) return;
    const style = document.createElement('style');
    style.id = 'brus-fhb-v158-styles';
    style.textContent = `
/* Zbytečné pomocné popisky pryč – zůstává jen to, co je potřeba pro zadání korekce. */
html body #korekce-brusy .brus157Intro > span,
html body #korekce-brusy .brus157Warning,
html body #korekce-brusy .brus157KpoSide > small,
html body #korekce-brusy .brus157Measure > small,
html body #korekce-brusy .brus157ResultTop > b,
html body #korekce-brusy .brus157Movement{
  display:none !important;
}
html body #korekce-brusy .brus157Card{gap:10px !important;}
html body #korekce-brusy .brus157KpoSide{gap:2px !important;}
html body #korekce-brusy .brus157Measure{gap:5px !important;}

/* Indexy přesně podle hlavní kalkulačky Brusů. */
html body #korekce-brusy .brus157ChoiceGroup[data-brus157-select="index"] .brus157Choice.index-ad{
  background:linear-gradient(145deg,#067dff 0%,#00aaff 100%) !important;
  border-color:#b3efff !important;
  color:#fff !important;
  text-shadow:0 1px 1px #003d8f,0 0 20px #bdeeff !important;
  box-shadow:0 10px 26px rgba(0,0,0,.30),0 0 30px rgba(0,164,255,.72),inset 0 1px 0 rgba(255,255,255,.54) !important;
}
html body #korekce-brusy .brus157ChoiceGroup[data-brus157-select="index"] .brus157Choice.index-ae{
  background:linear-gradient(145deg,#00b966 0%,#00ee87 100%) !important;
  border-color:#b5ffe0 !important;
  color:#fff !important;
  text-shadow:0 1px 1px #00562f,0 0 20px #c7ffdd !important;
  box-shadow:0 10px 26px rgba(0,0,0,.30),0 0 30px rgba(0,237,135,.68),inset 0 1px 0 rgba(255,255,255,.54) !important;
}
html body #korekce-brusy .brus157ChoiceGroup[data-brus157-select="index"] .brus157Choice.index-ah{
  background:linear-gradient(145deg,#ffe12b 0%,#ffae00 52%,#f55c00 100%) !important;
  border-color:#fff0ad !important;
  color:#fff !important;
  text-shadow:0 1px 1px #943000,0 0 20px #fff0a5 !important;
  box-shadow:0 10px 26px rgba(0,0,0,.30),0 0 32px rgba(255,163,0,.76),inset 0 1px 0 rgba(255,255,255,.54) !important;
}
html body #korekce-brusy .brus157ChoiceGroup[data-brus157-select="index"] .brus157Choice.isActive{
  outline:3px solid rgba(255,255,255,.98) !important;
  outline-offset:3px !important;
  transform:translateY(-1px) !important;
}
`;
    document.head.appendChild(style);
  }

  function removeDevelopmentBadge() {
    document.querySelectorAll('.calcTileText .calcDevBadge').forEach((badge) => {
      const parent = badge.closest('.calcTileText');
      if (parent && /Brusy/i.test(parent.textContent || '')) badge.remove();
    });
  }

  function cleanResultText() {
    document.querySelectorAll('#korekce-brusy .brus157Meta').forEach((meta) => {
      const phrase = ' · hodnota už je v pásmu, ale korekce ji posune blíž středu';
      if ((meta.textContent || '').includes(phrase)) {
        meta.textContent = (meta.textContent || '').replace(phrase, '');
      }
    });
  }

  // V původní 1.5.7 Number('') vracelo 0, takže prázdné pole se vyhodnotilo jako skutečná nula.
  // Zachytíme klik už na window capture, prázdná pole na dobu výpočtu označíme nečíselně a hned poté vrátíme zpět.
  window.addEventListener('click', (event) => {
    const target = event.target && event.target.closest ? event.target.closest('#brus157Evaluate') : null;
    if (!target) return;
    const changed = [];
    document.querySelectorAll('#korekce-brusy input[id^="brus157_"]').forEach((input) => {
      if (String(input.value || '').trim() === '') {
        changed.push(input);
        input.value = '__RAK_EMPTY__';
      }
    });
    if (changed.length) {
      queueMicrotask(() => changed.forEach((input) => {
        if (input.value === '__RAK_EMPTY__') input.value = '';
      }));
    }
  }, true);

  installStyles();
  removeDevelopmentBadge();
  cleanResultText();

  const observer = new MutationObserver(() => {
    removeDevelopmentBadge();
    cleanResultText();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
