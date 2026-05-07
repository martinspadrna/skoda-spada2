function syncBottomNav(activePageId) {
  const pageId = activePageId || document.querySelector('.page.active')?.id || 'home';
  const navId = pageId === 'rotace' && app.rotationView === 'stats' ? 'stats' : pageId;

  document.querySelectorAll('.bottomNavItem').forEach(btn => {
    const isActive = btn.dataset.nav === navId;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
}

function renderHomeDashboard(lines) {
  const shiftSummary = document.getElementById('homeShiftSummary');
  const shiftTeam = document.getElementById('homeShiftTeam');
  const shiftCountdown = document.getElementById('homeShiftCountdown');
  const payrollSummary = document.getElementById('homePayrollSummary');
  const machineSummary = document.getElementById('homeMachineSummary');
  const linesText = Array.isArray(lines) && lines.length
    ? lines.join('\n')
    : (document.getElementById('shiftTime')?.innerText || '');

  if (shiftSummary) {
    shiftSummary.textContent = linesText || 'Aktuálně se načítá směna…';
  }

  const now = new Date();
  const active = typeof getActiveShiftNow === 'function' ? getActiveShiftNow(now) : null;
  const dState = typeof getTeamShiftState === 'function' ? getTeamShiftState(now, 'D') : null;
  const payrollText = typeof getPayrollTileText === 'function' ? getPayrollTileText(now) : '💸 Výplata: —';
  const machineText = (app && app.machine ? app.machine : 'TBKR01') + ' / ' + (app && app.prog ? app.prog : 'AD');

  if (shiftTeam) {
    shiftTeam.textContent = active ? ('Směna ' + active.team + (active.label ? ' (' + active.label + ')' : '')) : 'Bez směny';
  }

  if (shiftCountdown) {
    shiftCountdown.textContent = active && active.end ? formatDuration(active.end - now) : (dState && dState.next ? formatDuration(dState.next.start - now) : '—');
  }

  if (payrollSummary) {
    payrollSummary.textContent = payrollText.replace(/^💸\s*/, '');
  }

  if (machineSummary) {
    machineSummary.textContent = machineText;
  }
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  if (id === 'rotace') {
    renderRotace();
  }
  if (id === 'brusy') {
    renderBrusy();
  }
  if (id === 'soustruhy') {
    renderSoustruhy();
  }
  if (id === 'home') {
    if (typeof updateFoodTile === 'function') updateFoodTile();
    if (typeof updateEportalTile === 'function') updateEportalTile();
    if (typeof renderHomeDashboard === 'function') renderHomeDashboard();
  }
  syncBottomNav(id);
}

function setRotaceView(view) {
  app.rotationView = view;
  const namesPanel = document.getElementById('rotaceNamesPanel');
  const statsPanel = document.getElementById('rotaceStatsPanel');
  const monthsPanel = document.getElementById('rotaceMonthsPanel');
  const tabNames = document.getElementById('tabNames');
  const tabStats = document.getElementById('tabStats');
  const tabMonths = document.getElementById('tabMonths');

  [namesPanel, statsPanel, monthsPanel].forEach(panel => panel && panel.classList.remove('active'));
  [tabNames, tabStats, tabMonths].forEach(tab => tab && (tab.style.outline = 'none'));

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

  syncBottomNav('rotace');
}
