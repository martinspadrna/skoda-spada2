// RaK 1.5.9 – Brusy/FHB: zjednodušené popisky, výrazné indexy a spolehlivé ignorování prázdných polí.
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

  function blankResultKeys() {
    const result = new Set();
    const slots = [
      ['brus157_c1_left', 'C1|vlevo'],
      ['brus157_c1_right', 'C1|vpravo'],
      ['brus157_c2_left', 'C2|vlevo'],
      ['brus157_c2_right', 'C2|vpravo']
    ];
    slots.forEach(([id, key]) => {
      const input = document.getElementById(id);
      if (!input || String(input.value || '').trim() === '') result.add(key);
    });
    return result;
  }

  function pruneBlankResults(blankKeys) {
    if (!blankKeys || !blankKeys.size) return;
    document.querySelectorAll('#korekce-brusy .brus157ResultSide').forEach((card) => {
      const label = String(card.querySelector('.brus157ResultTop > span')?.textContent || '').trim();
      const m = /^(C1|C2)\s*·\s*FHB\s*(vlevo|vpravo)$/i.exec(label);
      if (!m) return;
      const key = m[1].toUpperCase() + '|' + m[2].toLowerCase();
      if (blankKeys.has(key)) card.remove();
    });
  }

  // Původní výpočet převádí Number('') na 0. Před výpočtem si proto zapamatujeme
  // skutečně prázdná pole a po vyrenderování výsledku jejich karty vždy odstraníme.
  // Funguje to i na iOS, kde se pořadí capture handlerů může lišit.
  window.addEventListener('click', (event) => {
    const target = event.target && event.target.closest ? event.target.closest('#brus157Evaluate') : null;
    if (!target) return;
    const blanks = blankResultKeys();
    window.__rakBrusFhbBlankKeys = blanks;
    queueMicrotask(() => pruneBlankResults(blanks));
    setTimeout(() => pruneBlankResults(blanks), 0);
    setTimeout(() => pruneBlankResults(blanks), 50);
  }, true);

  installStyles();
  removeDevelopmentBadge();
  cleanResultText();

  const observer = new MutationObserver(() => {
    removeDevelopmentBadge();
    cleanResultText();
    pruneBlankResults(window.__rakBrusFhbBlankKeys);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
