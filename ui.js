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


function buildAppHistoryHtml(versionText) {
  const sections = [
    {
      range: 'v.1(226)',
      title: 'Aktuální verze',
      lines: [
        'Dashboard má nové ikonky, menší texty a světýlko u kantýny/jídelny.',
        'Rotace ukazuje směny pod sebou bez štítků.',
        'Kalkulačky jsou pod sebou s novými ikonami podle toku výroby.',
        'Spodní menu Více je nižší, užší a ikona je co nejužší.'
      ]
    },
    {
      range: 'v.1(221)',
      title: 'Více, dashboard a kalkulačky',
      lines: [
        'Přehlednější dashboard podle nového vzoru.',
        'Kalkulačky přepnuté na Soustruhy → Frézky → Brusy.',
        'Statistiky čistší, menu už jako samostatná stránka.'
      ]
    },
    {
      range: 'v.1(220)',
      title: 'Rotace a statistiky',
      lines: [
        'Rotace na tiles s krátkým přehledem pod jménem.',
        'QR modal po trojkliku.',
        'Statistiky doplněné o součet práce + absence.'
      ]
    },
    {
      range: 'v.1(219)',
      title: 'Menu přes tři tečky',
      lines: [
        'Spodní menu přesunuto do stránky Více.',
        'Import, export, nastavení, o aplikaci i kontakt na jednom místě.',
        'Verze schovaná jen do O aplikaci.'
      ]
    },
    {
      range: 'v.1(218)',
      title: 'Opravy a sjednocení',
      lines: [
        'Základ menu vyčištěný do jednodušší podoby.',
        'Vylepšená práce s importem a exportem.',
        'Doplněné menu položky pro správu aplikace.'
      ]
    },
    {
      range: 'v.1(217)',
      title: 'Nový základ aplikace',
      lines: [
        'Rotace jako tiles, rozpisy s automaticky vybraným měsícem.',
        'Statistiky jako tiles a dashboard po částech.',
        'Přechod na moderní floating iOS styl.'
      ]
    },
    {
      range: 'v0.211–v0.215',
      title: 'Aktuální vývojová větev',
      lines: [
        'Další sjednocování design systému.',
        'Úpravy dashboardu, statistik a rotací.',
        'Modernější ikony a mobilní rozložení.'
      ]
    },
    {
      range: 'v0.201–v0.210',
      title: 'App-like vzhled',
      lines: [
        'Floating prvky a spodní navigace.',
        'Dashboard podle moderních trendů.',
        'Lepší mobilní ergonomie a dlaždice sekcí.'
      ]
    },
    {
      range: 'v0.191–v0.200',
      title: 'Refaktorace a modernizace',
      lines: [
        'Čištění kódu a stabilnější export.',
        'Příprava na PWA chování.',
        'Modernější dashboard a struktura aplikace.'
      ]
    },
    {
      range: 'v0.181–v0.190',
      title: 'UX a mobilní ergonomie',
      lines: [
        'Lepší ovládání na telefonu.',
        'Úpravy textů, velikostí a mezer.',
        'Plynulejší animace a přechody.'
      ]
    },
    {
      range: 'v0.171–v0.180',
      title: 'Statistiky a rotace',
      lines: [
        'Přestavba statistik.',
        'Lepší zobrazení jmen a strojů.',
        'Zjednodušení rotací a klikání.'
      ]
    },
    {
      range: 'v0.158–v0.170',
      title: 'Nová generace UI',
      lines: [
        'Výrazně modernější dashboard.',
        'Nové ikony, karty a dark styl.',
        'Jasnější vizuální hierarchie.'
      ]
    },
    {
      range: 'v0.151–v0.157-rc',
      title: 'Velká refaktorace',
      lines: [
        'Nový základ projektu.',
        'Vyčištění starého kódu a modularita.',
        'Stabilnější exporty a buildy.'
      ]
    },
    {
      range: 'v0.141–v0.150',
      title: 'Vývoj směrem k aplikaci',
      lines: [
        'Lepší mobilní navigace.',
        'Úpravy spodního menu a přechodů.',
        'Optimalizace výkonu a ovládání.'
      ]
    },
    {
      range: 'v0.131–v0.140',
      title: 'Dashboard a přehledy',
      lines: [
        'Rozšíření dashboardu.',
        'Přehlednější dlaždice a rychlé informace.',
        'Lepší rozložení informací.'
      ]
    },
    {
      range: 'v0.121–v0.130',
      title: 'Moderní styl aplikace',
      lines: [
        'Glassmorphism vzhled.',
        'Plovoucí prvky a jemné animace.',
        'Sjednocení celé aplikace.'
      ]
    },
    {
      range: 'v0.111–v0.120',
      title: 'Stabilita systému',
      lines: [
        'Opravy kritických bugů.',
        'Safari safe-area a export.',
        'Lepší kompatibilita mobilních zařízení.'
      ]
    },
    {
      range: 'v0.101–v0.110',
      title: 'UI a použitelnost',
      lines: [
        'Přehlednější navigace.',
        'Úpravy dashboardu a ikon.',
        'Optimalizace pro menší displeje.'
      ]
    },
    {
      range: 'v0.91–v0.100',
      title: 'Přechod na modernější architekturu',
      lines: [
        'Začátek větší refaktorace.',
        'Rozdělení logiky aplikace.',
        'Čistší struktura kódu a příprava na další rozvoj.'
      ]
    },
    {
      range: 'v0.81–v0.90',
      title: 'Rozšíření funkcí',
      lines: [
        'Nové pomocné funkce.',
        'Vylepšení statistik a exportů.',
        'Stabilnější fungování aplikace.'
      ]
    },
    {
      range: 'v0.71–v0.80',
      title: 'Vzhled aplikace',
      lines: [
        'Výraznější dark mode styl.',
        'Modernější karty a panely.',
        'Lepší kontrast a čitelnost.'
      ]
    },
    {
      range: 'v0.61–v0.70',
      title: 'Mobilní optimalizace',
      lines: [
        'Lepší ovládání jednou rukou.',
        'Větší důraz na mobilní vzhled.',
        'Lepší responzivita a rozpadání layoutu.'
      ]
    },
    {
      range: 'v0.51–v0.60',
      title: 'Statistiky a data',
      lines: [
        'Rozšíření statistik.',
        'Lepší práce s výrobními daty.',
        'Opravy chyb v datech a načítání.'
      ]
    },
    {
      range: 'v0.41–v0.50',
      title: 'Rotace a směny',
      lines: [
        'Rozšíření sekce rotací.',
        'Lepší zobrazení směn a jmen.',
        'První verze statistik.'
      ]
    },
    {
      range: 'v0.31–v0.40',
      title: 'První větší redesign',
      lines: [
        'Modernější vzhled aplikace.',
        'Vylepšené dlaždice a karty.',
        'Lepší mezery, navigace a mobilní rozložení.'
      ]
    },
    {
      range: 'v0.21–v0.30',
      title: 'Rozšíření funkcí',
      lines: [
        'Přidání dalších výpočtů.',
        'Úpravy formulářů a validace.',
        'Přehlednější sekce aplikace.'
      ]
    },
    {
      range: 'v0.11–v0.20',
      title: 'Stabilizace základů',
      lines: [
        'Opravy prvních chyb v kalkulačkách.',
        'Lepší rozložení tlačítek a textů.',
        'První optimalizace výkonu.'
      ]
    },
    {
      range: 'v0.01–v0.10',
      title: 'Začátek projektu',
      lines: [
        'První funkční základ aplikace.',
        'Základní navigace mezi sekcemi.',
        'První verze kalkulaček a jednoduchý tmavý vzhled.'
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
      body.innerHTML = [
        '<div class="appMenuCard">',
        '  <div class="appMenuCardTitle">Nastavení</div>',
        '  <button type="button" class="appMenuAction" data-menu-action="reset-state">Vymazat uložený stav</button>',
        '  <div class="appMenuHint">Smaže uložené rozložení a lokální stav aplikace.</div>',
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
            } catch (err) {
              console.warn(err);
            }
            location.reload();
          }
        }
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
