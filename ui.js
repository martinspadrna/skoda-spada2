function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
  if (id === "rotace") {
    renderRotace();
  }
  if (id === "brusy") {
    renderBrusy();
  }
  if (id === "soustruhy") {
    renderSoustruhy();
  }
  if (id === "home") {
    if (typeof updateFoodTile === "function") updateFoodTile();
    if (typeof updateEportalTile === "function") updateEportalTile();
  }
}

function setRotaceView(view) {
  app.rotationView = view;
  const namesPanel = document.getElementById("rotaceNamesPanel");
  const statsPanel = document.getElementById("rotaceStatsPanel");
  const monthsPanel = document.getElementById("rotaceMonthsPanel");
  const tabNames = document.getElementById("tabNames");
  const tabStats = document.getElementById("tabStats");
  const tabMonths = document.getElementById("tabMonths");

  [namesPanel, statsPanel, monthsPanel].forEach(panel => panel && panel.classList.remove("active"));
  [tabNames, tabStats, tabMonths].forEach(tab => tab && (tab.style.outline = "none"));

  if (view === "names") {
    namesPanel && namesPanel.classList.add("active");
    tabNames && (tabNames.style.outline = "3px solid #7CFF7C");
  } else if (view === "stats") {
    statsPanel && statsPanel.classList.add("active");
    tabStats && (tabStats.style.outline = "3px solid #7CFF7C");
  } else {
    monthsPanel && monthsPanel.classList.add("active");
    tabMonths && (tabMonths.style.outline = "3px solid #7CFF7C");
  }
}
