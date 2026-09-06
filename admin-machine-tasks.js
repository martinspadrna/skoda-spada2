// Správa denních úkolů podle stroje. Nastavení se ukládá do stejné chráněné
// administrátorské vrstvy machine_settings jako ostatní provozní nastavení.
(function installAdminMachineTasks() {
  'use strict';

  const KEY = 'ROTATION_MACHINE_TASKS_SETTINGS';
  const CATEGORY = 'rotation_machine_tasks_settings';
  const ORDER = ['TNKS01', 'TPKW01', 'TPKW02', 'TBKR01', 'TBKR07', 'MSKC01', 'MSKC02', 'MSKC03', 'MSKC04', 'MFKF06', 'MFKF10'];

  function esc(value) { return typeof escapeHtml === 'function' ? escapeHtml(String(value == null ? '' : value)) : String(value == null ? '' : value); }
  function settingsJson(row) {
    if (row && row.settings_json && typeof row.settings_json === 'object') return row.settings_json;
    try { return row && row.settings_json ? JSON.parse(String(row.settings_json)) : {}; } catch (err) { return {}; }
  }
  function isSettingsRow(row) {
    const json = settingsJson(row);
    return String(row && row.category || '') === CATEGORY
      || String(row && row.machine_key || '') === KEY
      || String(json.stored_category || '') === CATEGORY
      || String(json.admin_settings_key || '') === KEY;
  }
  function cleanTask(value) {
    const source = value && typeof value === 'object' ? value : {};
    const label = String(source.label || '').trim().slice(0, 160);
    const place = String(source.place || '').trim().slice(0, 60);
    return label ? { label, place } : null;
  }
  function cleanList(value) {
    const list = Array.isArray(value) ? value : [];
    return list.map(cleanTask).filter(Boolean).slice(0, 12);
  }
  function cloneList(value) { return cleanList(value).map((item) => ({ label: item.label, place: item.place })); }
  function defaultFor(machine) {
    const base = window.RAK_ROTATION_MACHINE_TASKS && window.RAK_ROTATION_MACHINE_TASKS[machine] || [];
    const shifts = window.RAK_ROTATION_MACHINE_SHIFT_TASKS && window.RAK_ROTATION_MACHINE_SHIFT_TASKS[machine] || {};
    return { base: cloneList(base), R: cloneList(shifts.R), N: cloneList(shifts.N) };
  }
  function normalize(source) {
    const raw = source && typeof source === 'object' ? source : {};
    const rawTasks = raw.tasks && typeof raw.tasks === 'object' ? raw.tasks : {};
    const tasks = {};
    ORDER.forEach((machine) => {
      const defaults = defaultFor(machine);
      const custom = rawTasks[machine] && typeof rawTasks[machine] === 'object' ? rawTasks[machine] : null;
      tasks[machine] = custom
        ? { base: cleanList(custom.base), R: cleanList(custom.R), N: cleanList(custom.N) }
        : defaults;
    });
    return { type: CATEGORY, tasks };
  }
  function getSettings() {
    const rows = typeof app !== 'undefined' && app && Array.isArray(app.machineSettingsRows) ? app.machineSettingsRows : [];
    const row = rows.find(isSettingsRow);
    return normalize(row ? settingsJson(row) : null);
  }
  function tasksForMachine(machine, shift) {
    const settings = getSettings();
    const record = settings.tasks[String(machine || '').trim().toUpperCase()] || { base: [], R: [], N: [] };
    const normalizedShift = /^N/i.test(String(shift || '')) || /NOČN/i.test(String(shift || '')) ? 'N' : (/^R/i.test(String(shift || '')) || /RANN/i.test(String(shift || '')) ? 'R' : '');
    return cloneList(record.base).concat(cloneList(record[normalizedShift] || []));
  }
  function taskLines(value) {
    return cleanList(value).map((item) => item.label + (item.place ? ' @ ' + item.place : '')).join('\n');
  }
  function parseLines(value) {
    return String(value || '').split(/\r?\n/).map((line) => {
      const parts = line.split(/\s+@\s+/);
      return cleanTask({ label: parts.shift() || '', place: parts.join(' @ ') });
    }).filter(Boolean).slice(0, 12);
  }
  function buildHtml() {
    const settings = getSettings();
    const rows = ORDER.map((machine) => {
      const item = settings.tasks[machine] || { base: [], R: [], N: [] };
      return [
        '<tr data-machine-task-row="' + esc(machine) + '">',
        '<td><b>' + esc(machine) + '</b></td>',
        '<td><textarea class="appMenuTextarea" rows="2" data-machine-task-base placeholder="např. Kontrola měřidel @ KP518">' + esc(taskLines(item.base)) + '</textarea></td>',
        '<td><textarea class="appMenuTextarea" rows="2" data-machine-task-r placeholder="jen ranní směna">' + esc(taskLines(item.R)) + '</textarea></td>',
        '<td><textarea class="appMenuTextarea" rows="2" data-machine-task-n placeholder="jen noční směna">' + esc(taskLines(item.N)) + '</textarea></td>',
        '</tr>'
      ].join('');
    }).join('');
    return [
      '<div class="appMenuSettingsList">',
      '<div class="smallText">Jeden úkol napiš na samostatný řádek. Místnost nebo KP přidej za <b>@</b>, například <b>Kontrola měřidel @ KP518</b>. Prázdné pole znamená žádný úkol.</div>',
      '<div class="tableWrap appMenuTableWrap uMt12"><table class="appMenuTable appMenuAdminTable adminMachineTasksTable">',
      '<thead><tr><th>Stroj</th><th>Vždy</th><th>Ranní</th><th>Noční</th></tr></thead><tbody>' + rows + '</tbody>',
      '</table></div></div>'
    ].join('');
  }
  function readFromDom(root) {
    const scope = root && root.querySelectorAll ? root : document;
    const tasks = {};
    scope.querySelectorAll('[data-machine-task-row]').forEach((row) => {
      const machine = String(row.getAttribute('data-machine-task-row') || '').trim().toUpperCase();
      if (!ORDER.includes(machine)) return;
      tasks[machine] = {
        base: parseLines(row.querySelector('[data-machine-task-base]')?.value),
        R: parseLines(row.querySelector('[data-machine-task-r]')?.value),
        N: parseLines(row.querySelector('[data-machine-task-n]')?.value)
      };
    });
    return normalize({ tasks });
  }
  function makeRow(settings) {
    const safe = normalize(settings);
    return {
      machine_key: KEY, machine_code: 'ROTATION', machine_index: 'daily-tasks', label: 'Úkoly podle stroje', category: CATEGORY,
      cycle_time: '', speed: '', dress_time: '', dress_count: '',
      settings_json: Object.assign({ machine: 'ROTATION', index: 'daily-tasks', stored_category: CATEGORY, admin_settings_key: KEY }, safe)
    };
  }
  function mergeRows(settings) {
    const base = typeof app !== 'undefined' && app && Array.isArray(app.machineSettingsRows) ? app.machineSettingsRows : [];
    return base.filter((row) => !isSettingsRow(row)).concat(makeRow(settings));
  }

  window.RAK_ROTATION_MACHINE_TASKS_SETTINGS_KEY = KEY;
  window.getRotationMachineTaskSettings = getSettings;
  window.getRotationMachineTasksForMachine = tasksForMachine;
  window.buildAdminMachineTasksSettingsHtml = buildHtml;
  window.readAdminMachineTasksSettingsFromDom = readFromDom;
  window.mergeAdminMachineTasksSettingsRows = mergeRows;
})();
