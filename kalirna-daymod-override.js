// RaK 1.6 development hotfix – denní výjimka „Odešel na kalírnu“ se promítne
// do osobního přehledu Rotace, Home karty a úkolu bez změny zdrojového rozpisu.
(function installRakKalirnaDayModOverride() {
  'use strict';

  if (window.__rakKalirnaDayModOverrideInstalled) return;
  window.__rakKalirnaDayModOverrideInstalled = true;

  const KALIRNA_TARGET = 'Kalírna';
  const KALIRNA_TASK = 'Tak tam hlavně nedělej ostudu.';

  function normalizeName(value) {
    return String(value || '').trim().toLocaleLowerCase('cs-CZ');
  }

  function normalizeShift(value) {
    const text = String(value || '').trim();
    try {
      if (typeof window.normalizeShiftText === 'function') return String(window.normalizeShiftText(text) || '').trim().toUpperCase();
    } catch (err) {}
    return text.replace(/\s+/g, ' ').trim().toUpperCase();
  }

  function parseDayModDate(value) {
    const raw = String(value || '').trim();
    try {
      if (typeof window.parseDateToken === 'function') {
        const parsed = window.parseDateToken(raw);
        if (parsed) return parsed;
      }
    } catch (err) {}
    const match = /^(\d{1,2})\.(\d{1,2})\.\s*(.*)$/.exec(raw);
    return match ? { day: Number(match[1]), month: Number(match[2]), shift: String(match[3] || '').trim() } : null;
  }

  function monthKeyYear(monthKey) {
    try {
      if (typeof window.parseMonthKey === 'function') {
        const parsed = window.parseMonthKey(monthKey);
        if (parsed && parsed.year) return Number(parsed.year);
      }
    } catch (err) {}
    const match = /^(\d{1,2})\/(\d{2,4})$/.exec(String(monthKey || '').trim());
    if (!match) return null;
    const rawYear = Number(match[2]);
    return rawYear < 100 ? 2000 + rawYear : rawYear;
  }

  function findKalirnaOutMod(personName, entry) {
    if (!entry || entry.absence) return null;
    const rotation = window.app && window.app.rotation;
    const months = rotation && rotation.months;
    if (!months) return null;

    const entryDate = new Date(entry.sortDate || '');
    if (Number.isNaN(entryDate.getTime())) return null;
    const wantedName = normalizeName(personName);
    const wantedShift = normalizeShift(entry.shift);

    for (const [monthKey, month] of Object.entries(months)) {
      if (monthKeyYear(monthKey) !== entryDate.getFullYear()) continue;
      const mods = month && Array.isArray(month.dayMods) ? month.dayMods : [];
      for (const mod of mods) {
        if (!mod || mod.type !== 'kalirnaOut') continue;
        if (normalizeName(mod.person) !== wantedName) continue;
        const parsed = parseDayModDate(mod.date);
        if (!parsed) continue;
        if (Number(parsed.day) !== entryDate.getDate() || Number(parsed.month) !== entryDate.getMonth() + 1) continue;
        const modShift = normalizeShift(parsed.shift);
        if (wantedShift && modShift && wantedShift !== modShift) continue;
        return mod;
      }
    }
    return null;
  }

  function patchPersonScheduleEntries() {
    const original = window.getPersonScheduleEntries;
    if (typeof original !== 'function' || original.__rakKalirnaDayModPatched) return false;

    function wrappedGetPersonScheduleEntries(name) {
      const model = original.apply(this, arguments);
      if (!model || !Array.isArray(model.entries)) return model;
      const entries = model.entries.map((entry) => {
        if (!findKalirnaOutMod(name, entry)) return entry;
        return Object.assign({}, entry, { target: KALIRNA_TARGET, kalirnaOut: true });
      });
      return Object.assign({}, model, { entries });
    }

    wrappedGetPersonScheduleEntries.__rakKalirnaDayModPatched = true;
    wrappedGetPersonScheduleEntries.__rakOriginal = original;
    window.getPersonScheduleEntries = wrappedGetPersonScheduleEntries;
    return true;
  }

  function patchRotationTasks() {
    const original = window.getRotationMachineTasksForAssignment;
    if (typeof original !== 'function' || original.__rakKalirnaDayModPatched) return false;

    function wrappedGetRotationMachineTasksForAssignment(value, shift) {
      if (/kal[ií]rn/i.test(String(value || ''))) {
        return { machine: KALIRNA_TARGET, tasks: [{ label: KALIRNA_TASK, place: '' }] };
      }
      return original.apply(this, arguments);
    }

    wrappedGetRotationMachineTasksForAssignment.__rakKalirnaDayModPatched = true;
    wrappedGetRotationMachineTasksForAssignment.__rakOriginal = original;
    window.getRotationMachineTasksForAssignment = wrappedGetRotationMachineTasksForAssignment;
    return true;
  }

  function patchDashboardHero() {
    const original = window.buildDashboardPersonalHeroHtml;
    if (typeof original !== 'function' || original.__rakKalirnaDayModPatched) return false;

    function wrappedBuildDashboardPersonalHeroHtml() {
      const html = String(original.apply(this, arguments) || '');
      return html
        .replace('Dnes jsi na Kalírna.', 'Dnes jdeš na kalírnu.')
        .replace('Příští směnu jdeš na Kalírna.', 'Příští směnu jdeš na kalírnu.');
    }

    wrappedBuildDashboardPersonalHeroHtml.__rakKalirnaDayModPatched = true;
    wrappedBuildDashboardPersonalHeroHtml.__rakOriginal = original;
    window.buildDashboardPersonalHeroHtml = wrappedBuildDashboardPersonalHeroHtml;
    return true;
  }

  function installAvailablePatches() {
    patchPersonScheduleEntries();
    patchRotationTasks();
    patchDashboardHero();
  }

  installAvailablePatches();
  [100, 350, 1000, 3000, 8000, 15000].forEach((delay) => setTimeout(installAvailablePatches, delay));
  document.addEventListener('click', installAvailablePatches, true);
  window.addEventListener('pageshow', installAvailablePatches);
  window.addEventListener('focus', installAvailablePatches);

  window.rakKalirnaDayModOverrideRefresh = installAvailablePatches;
})();
