function setBottomNavActive(pageId) {
  const buttons = document.querySelectorAll('.bottomNavBtn');
  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === pageId);
  });
}



function ensureAppMenuOverlay() {
  let page = document.getElementById('menu');
  if (page) return page;

  page = document.createElement('div');
  page.id = 'menu';
  page.className = 'page appMenuPage';
  page.innerHTML = [
    '<div class="headerBar appMenuPageTitleBar">',
    '  <div></div>',
    '  <h3>Více</h3>',
    '  <div style="width:34px;"></div>',
    '</div>',
    '<div class="card appMenuPageCard">',
    '  <div class="appMenuBody" id="appMenuBody"></div>',
    '</div>'
  ].join('');

  document.body.appendChild(page);
  return page;
}

function hideAppMenu() {
  const page = document.getElementById('menu');
  if (!page) return;
  page.classList.remove('active');
}

function startMenuImport() {
  const input = document.getElementById('excelFile');
  if (!input) {
    alert('Import není připravený.');
    return;
  }
  app.pendingMenuImport = true;
  input.click();
}

const UI_PREFS_KEY = APP_KEY + ':uiPrefs';

function loadUiPrefs() {
  try {
    const raw = localStorage.getItem(UI_PREFS_KEY);
    if (!raw) return { compact: false, reduceMotion: false };
    const parsed = JSON.parse(raw);
    return {
      compact: !!parsed.compact,
      reduceMotion: !!parsed.reduceMotion
    };
  } catch (err) {
    console.warn(err);
    return { compact: false, reduceMotion: false };
  }
}

function saveUiPrefs(prefs) {
  const next = {
    compact: !!prefs.compact,
    reduceMotion: !!prefs.reduceMotion
  };
  try {
    localStorage.setItem(UI_PREFS_KEY, JSON.stringify(next));
  } catch (err) {
    console.warn(err);
  }
  return next;
}

function applyUiPrefs(prefs) {
  const next = saveUiPrefs(prefs || loadUiPrefs());
  document.body.classList.toggle('compactUI', !!next.compact);
  document.body.classList.toggle('reduceMotion', !!next.reduceMotion);
  if (typeof app !== 'undefined') {
    app.uiPrefs = next;
  }
  return next;
}

function toggleUiPref(key) {
  const current = loadUiPrefs();
  const next = { ...current, [key]: !current[key] };
  applyUiPrefs(next);
  return next;
}

function resetUiPrefs() {
  applyUiPrefs({ compact: false, reduceMotion: false });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => applyUiPrefs(loadUiPrefs()));
} else {
  applyUiPrefs(loadUiPrefs());
}

function buildAppHistoryHtml(versionText) {
  const sections = [
    {
      range: 'v.1(239)',
      title: 'Aktuální verze',
      lines: [
        'Spodní lišta je těsnější kolem ikon a poslední volba je užší.',
        'Dashboard má čistší horní řádek a srovnané stavové řádky.',
        'Statistiky ukazují více položek přehledně po řádcích.'
      ]
    },
    {
      range: 'v.1(238)–v.1(237)',
      title: 'Lišta a statistiky',
      lines: [
        'Spodní panel se ladil na výšku ikon.',
        'Ve statistikách se doplnil top 3 přehled a rozpad více jmen na řádky.'
      ]
    },
    {
      range: 'v.1(236)–v.1(234)',
      title: 'Dashboard a nastavení',
      lines: [
        'Dashboard dostal čistší vzhled a lepší karty.',
        'Přidalo se nastavení pro kompaktní režim a reset lokálních dat.'
      ]
    },
    {
      range: 'v.1(233)–v.1(231)',
      title: 'Rotace a rozpisy',
      lines: [
        'Rotace ukazuje směny pod sebou bez zbytečných štítků.',
        'Kalkulačky i rozpisy byly srovnané do přehlednějšího pořadí.'
      ]
    },
    {
      range: 'v.1(230)–v.1(228)',
      title: 'Panel a otevírací doby',
      lines: [
        'Spodní panel dostal glass efekt a přesnější výšku.',
        'Otevírací doby kantýny a jídelny mají lepší zobrazení a pořádek od pondělí.'
      ]
    },
    {
      range: 'v.1(227)–v.1(225)',
      title: 'Více a dashboard',
      lines: [
        'Menu „Více“ je samostatná stránka bez rušivých popisků.',
        'Dashboardové ikony a hodnoty se sjednotily do čistšího stylu.'
      ]
    },
    {
      range: 'v.1(224)–v.1(221)',
      title: 'Kalkulačky a rotace',
      lines: [
        'Kalkulačky dostaly nové ikony a svislé řazení.',
        'Rotace i statistiky se převedly na tiles.'
      ]
    },
    {
      range: 'v.1(215)–v.1(220)',
      title: 'Refaktorace a stabilita',
      lines: [
        'Čištění kódu, exportů a větší modularita.',
        'Příprava na další rozšíření dashboardu, statistik a menu.'
      ]
    },
    {
      range: 'v0.151–v0.157-rc',
      title: 'Velká refaktorace',
      lines: [
        'Nový základ projektu.',
        'Vyčištění starého kódu a stabilnější exporty.'
      ]
    },
    {
      range: 'v0.91–v0.150',
      title: 'Přechod na modernější architekturu',
      lines: [
        'Rozdělení logiky aplikace a čistší struktura.',
        'Lepší mobilní navigace, dashboard a PWA příprava.'
      ]
    },
    {
      range: 'v0.41–v0.90',
      title: 'Rotace, statistiky a vzhled',
      lines: [
        'Rozšíření rotací a statistik.',
        'Modernější dark styl, karty a mobilní ergonomie.'
      ]
    },
    {
      range: 'v0.01–v0.40',
      title: 'Začátek projektu',
      lines: [
        'První funkční základ aplikace.',
        'Základní navigace, první kalkulačky a jednoduchý dark vzhled.'
      ]
    }
  ];

  return [
    '<div class="appMenuHistory">',
    sections.map(section => [
      '<div class="appMenuHistoryGroup">',
      '  <div class="appMenuHistoryRange">' + escapeHtml(section.range) + '</div>',
      '  <div class="appMenuHistoryTitle">' + escapeHtml(section.title) + '</div>',
      '  <div class="appMenuHistoryList">' + section.lines.map(line => '<div class="appMenuHistoryItem">' + escapeHtml(line) + '</div>').join('') + '</div>',
      '</div>'
    ].join('')).join(''),
    '</div>'
  ].join('');
}

function openAppMenu(view) {
  const page = ensureAppMenuOverlay();
  const body = page.querySelector('#appMenuBody');
  const v = view || 'menu';

  const versionText = (typeof app !== 'undefined' && app.version) || (typeof APP_VERSION !== 'undefined' ? APP_VERSION : '');
  const contactName = 'Martin Špadrna';
  const contactPhone = 'Doplň telefonní číslo';
  const contactEmail = 'Doplň e-mail';

  if (body) {
    if (v === 'about') {
      body.innerHTML = [
        '<div class="appMenuCard">',
        '  <div class="appMenuCardTitle">O aplikaci</div>',
        '  <div class="appMenuVersion">' + escapeHtml(versionText || '—') + '</div>',
        '  <div class="appMenuText">',
        '    <div>Aktuální verze je nahoře, starší novinky jsou pod ní od nejnovějších po nejstarší.</div>',
        '    <div>Import i export zůstávají schované v menu, aby zbytek aplikace působil čistě.</div>',
        '  </div>',
        '  ' + buildAppHistoryHtml(versionText),
        '  <button type="button" class="appMenuAction appMenuBack" data-menu-back="1">Zpět</button>',
        '</div>'
      ].join('');
    } else if (v === 'contact') {
      body.innerHTML = [
        '<div class="appMenuCard">',
        '  <div class="appMenuCardTitle">Kontakt</div>',
        '  <div class="appMenuContactRow"><span>Jméno</span><b>' + escapeHtml(contactName) + '</b></div>',
        '  <div class="appMenuContactRow"><span>Telefon</span><b>' + escapeHtml(contactPhone) + '</b></div>',
        '  <div class="appMenuContactRow"><span>E-mail</span><b>' + escapeHtml(contactEmail) + '</b></div>',
        '  <button type="button" class="appMenuAction appMenuBack" data-menu-back="1">Zpět</button>',
        '</div>'
      ].join('');
    } else if (v === 'settings') {
      const prefs = loadUiPrefs();
      body.innerHTML = [
        '<div class="appMenuCard appMenuSettingsCard">',
        '  <div class="appMenuCardTitle">Nastavení</div>',
        '  <div class="appMenuText">',
        '    <div>Kompaktní režim a méně animací se ukládají jen do tohoto zařízení.</div>',
        '  </div>',
        '  <div class="appMenuSettingsList">',
        '    <button type="button" class="appMenuAction appMenuSettingBtn" data-ui-pref="compact">' + (prefs.compact ? '✓ ' : '') + 'Kompaktní režim</button>',
        '    <button type="button" class="appMenuAction appMenuSettingBtn" data-ui-pref="reduceMotion">' + (prefs.reduceMotion ? '✓ ' : '') + 'Méně animací</button>',
        '    <button type="button" class="appMenuAction appMenuSettingBtn" data-ui-reset="1">Obnovit výchozí nastavení</button>',
        '    <button type="button" class="appMenuAction appMenuSettingBtn" data-menu-action="reset-state">Smazat lokální data</button>',
        '  </div>',
        '  <button type="button" class="appMenuAction appMenuBack" data-menu-back="1">Zpět</button>',
        '</div>'
      ].join('');
    } else {
      body.innerHTML = [
        '<div class="appMenuGrid">',
        '  <button type="button" class="appMenuAction" data-menu-action="import">Import Excelu</button>',
        '  <button type="button" class="appMenuAction" data-menu-action="export">Export ZIP</button>',
        '  <button type="button" class="appMenuAction" data-menu-action="settings">Nastavení</button>',
        '  <button type="button" class="appMenuAction" data-menu-action="about">O aplikaci</button>',
        '  <button type="button" class="appMenuAction" data-menu-action="contact">Kontakt</button>',
        '</div>'
      ].join('');
    }

    body.querySelectorAll('[data-menu-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-menu-action');
        if (action === 'import') {
          startMenuImport();
        } else if (action === 'export') {
          document.getElementById('exportBtn')?.click();
        } else if (action === 'settings') {
          openAppMenu('settings');
        } else if (action === 'about') {
          openAppMenu('about');
        } else if (action === 'contact') {
          openAppMenu('contact');
        } else if (action === 'reset-state') {
          if (confirm('Smazat uložený stav aplikace?')) {
            try {
              localStorage.removeItem(APP_KEY);
              localStorage.removeItem('rotationBuild');
              localStorage.removeItem(UI_PREFS_KEY);
            } catch (err) {
              console.warn(err);
            }
            location.reload();
          }
        }
      });
    });

    body.querySelectorAll('[data-ui-pref]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-ui-pref');
        if (!key) return;
        toggleUiPref(key);
        openAppMenu('settings');
      });
    });

    body.querySelectorAll('[data-ui-reset]').forEach(btn => {
      btn.addEventListener('click', () => {
        resetUiPrefs();
        openAppMenu('settings');
      });
    });

    body.querySelectorAll('[data-menu-back]').forEach(btn => {
      btn.addEventListener('click', () => openAppMenu('menu'));
    });
  }

  return page;
}

function toggleAppMenu() {

  showPage('menu');
  openAppMenu('menu');
  setBottomNavActive('menu');
}

function showFoodSchedule(which) {
  if (typeof app !== 'undefined') {
    app.foodScheduleFocus = which === 'jidelna' ? 'jidelna' : 'kantyna';
  }
  if (typeof renderFoodScheduleModal === 'function') {
    renderFoodScheduleModal();
    const overlay = ensureFoodScheduleModal();
    overlay.classList.add('isVisible');
    document.body.classList.add('foodModalOpen');
    setBottomNavActive('home');
    return;
  }
  if (typeof renderFoodSchedulePage === 'function') {
    renderFoodSchedulePage();
  }
  showPage('jidlo');
  setBottomNavActive('home');
}

function showPage(id) {
  const modal = document.getElementById('foodScheduleModal');
  if (modal) {
    modal.classList.remove('isVisible');
    document.body.classList.remove('foodModalOpen');
  }
  const personModal = document.getElementById('personScheduleModal');
  if (personModal) {
    personModal.classList.remove('isVisible');
    document.body.classList.remove('personModalOpen');
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  if (id === 'menu') {
    openAppMenu('menu');
  }
  const el = document.getElementById(id);
  if (el) el.classList.add('active');

  if (id === 'rotace') {
    setRotaceView('names');
    renderRotace();
    setBottomNavActive('rotace');
  } else if (id === 'brusy') {
    renderBrusy();
    setBottomNavActive('kalkulacky');
  } else if (id === 'soustruhy') {
    renderSoustruhy();
    setBottomNavActive('kalkulacky');
  } else if (id === 'frezky' || id === 'jidlo') {
    if (id === 'jidlo' && typeof renderFoodSchedulePage === 'function') {
      renderFoodSchedulePage();
    }
    setBottomNavActive('home');
  } else if (id === 'kalkulacky') {
    setBottomNavActive('kalkulacky');
  } else if (id === 'home') {
    if (typeof updateDashboard === 'function') updateDashboard();
    if (typeof updateFoodTile === 'function') updateFoodTile();
    if (typeof updateEportalTile === 'function') updateEportalTile();
    setBottomNavActive('home');
  }
}

function openRotaceNames() {
  showPage('rotace');
  setRotaceView('names');
  setBottomNavActive('rotace');
}

function openRotaceMonths() {
  showPage('rotace');
  setRotaceView('months');
  setBottomNavActive('rozpisy');
}

function openRotaceStats() {
  showPage('rotace');
  setRotaceView('stats');
  setBottomNavActive('statistiky');
}

function openKalkulacky() {
  showPage('kalkulacky');
  setBottomNavActive('kalkulacky');
}

function setRotaceView(view) {
  app.rotationView = view;
  const namesPanel = document.getElementById('rotaceNamesPanel');
  const statsPanel = document.getElementById('rotaceStatsPanel');
  const monthsPanel = document.getElementById('rotaceMonthsPanel');
  const rotaceTitle = document.getElementById('rotacePageTitle');
  const tabNames = document.getElementById('tabNames');
  const tabStats = document.getElementById('tabStats');
  const tabMonths = document.getElementById('tabMonths');

  [namesPanel, statsPanel, monthsPanel].forEach(panel => panel && panel.classList.remove('active'));
  [tabNames, tabStats, tabMonths].forEach(tab => tab && (tab.style.outline = 'none'));

  if (rotaceTitle) {
    if (view === 'stats') {
      rotaceTitle.textContent = 'Statistiky';
    } else if (view === 'months') {
      rotaceTitle.textContent = 'Rozpisy';
    } else {
      rotaceTitle.textContent = 'Rotace';
    }
  }

  if (view === 'names') {
    namesPanel && namesPanel.classList.add('active');
    tabNames && (tabNames.style.outline = '3px solid #7CFF7C');
  } else if (view === 'stats') {
    statsPanel && statsPanel.classList.add('active');
    tabStats && (tabStats.style.outline = '3px solid #7CFF7C');
  } else {
    monthsPanel && monthsPanel.classList.add('active');
    tabMonths && (tabMonths.style.outline = '3px solid #7CFF7C');
  }
}


function hideFoodScheduleModal() {
  const overlay = document.getElementById('foodScheduleModal');
  if (!overlay) return;
  overlay.classList.remove('isVisible');
  document.body.classList.remove('foodModalOpen');
}

function ensureFoodScheduleModal() {
  let overlay = document.getElementById('foodScheduleModal');
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = 'foodScheduleModal';
  overlay.className = 'foodScheduleOverlay';
  overlay.innerHTML = [
    '<div class="foodScheduleModal" role="dialog" aria-modal="true" aria-labelledby="foodScheduleModalTitle">',
    '<button type="button" class="foodScheduleClose" aria-label="Zavřít">×</button>',
    '<div class="foodScheduleModalTitle" id="foodScheduleModalTitle"></div>',
    '<div class="foodScheduleModalBody" id="foodScheduleModalBody"></div>',
    '</div>'
  ].join('');

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) hideFoodScheduleModal();
  });

  overlay.querySelector('.foodScheduleClose')?.addEventListener('click', hideFoodScheduleModal);

  if (!document.body.dataset.foodModalKeydownBound) {
    document.body.dataset.foodModalKeydownBound = '1';
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') hideFoodScheduleModal();
    });
  }

  document.body.appendChild(overlay);
  return overlay;
}
