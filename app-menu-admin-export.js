// RaK – admin export helpery oddělené od menu shellu.
try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('app-menu-admin-export.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}

function getRakAdminExportMetadataSnapshot(monthKey) {
  const permissionStatus = typeof adminPermissionStatusSnapshot === 'function'
    ? adminPermissionStatusSnapshot()
    : {};
  return {
    version: formatRakDisplayVersion(getRakCurrentAppVersion()),
    generatedAt: new Date().toLocaleString('cs-CZ'),
    activeAccountId: String(permissionStatus && permissionStatus.activeAccountId || '').trim(),
    roleLabel: String(permissionStatus && permissionStatus.roleLabel || 'nezjištěno').trim() || 'nezjištěno',
    unlocked: !!(permissionStatus && permissionStatus.unlocked),
    monthKey: String(monthKey || '').trim()
  };
}

function buildRakAdminExportMetadataLines(title, options = {}) {
  const meta = getRakAdminExportMetadataSnapshot(options.monthKey);
  const extraLines = Array.isArray(options.extraLines) ? options.extraLines : [];
  return [
    String(title || 'RaK - Admin export'),
    'Verze: ' + meta.version,
    'Vytvořeno: ' + meta.generatedAt,
    'Vytvořil admin účet: ' + (meta.activeAccountId || 'nezjištěn'),
    'Role exportu: ' + meta.roleLabel,
    'Admin odemčen: ' + (meta.unlocked ? 'ano' : 'ne')
  ].concat(extraLines.filter(Boolean));
}

const RAK_ADMIN_EXPORT_IMPORT_EXCEL_COPY_CONTRACT_V1139 = Object.freeze({
  version: '1.2 (1.155)',
  scope: 'administrace-export-import-rotation-excel-copy-layout',
  action: 'admin-download-rotation-excel',
  rule: 'Export / import používá stejný XLSX layout rozpisu jako generátor.'
});

const RAK_ADMIN_EXPORT_IMPORT_EXCEL_MONTH_GROUP_CONTRACT_V1140 = Object.freeze({
  version: '1.2 (1.155)',
  scope: 'administrace-export-import-rotation-excel-month-picker',
  action: 'admin-download-rotation-excel',
  rule: 'Výběr měsíce pro XLSX export je řazený chronologicky a skupinovaný podle roku, aby se nemíchaly stejné měsíce z různých roků.'
});

function buildRakRotationExcelExportMonthOptions(selectedMonthKey) {
  const selected = String(selectedMonthKey || '').trim();
  const keys = getAdminRotationMonthKeys().slice().sort((a, b) => {
    const diff = adminRotationMonthSortValue(a) - adminRotationMonthSortValue(b);
    return diff || a.localeCompare(b, 'cs');
  });
  if (!keys.length) return '<option value="">Není dostupný žádný měsíc</option>';
  const groups = new Map();
  keys.forEach((key) => {
    const parsed = typeof parseMonthKey === 'function' ? parseMonthKey(key) : null;
    const year = parsed && Number.isFinite(parsed.year) ? String(parsed.year) : 'Bez roku';
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year).push(key);
  });
  return Array.from(groups.entries()).map(([year, yearKeys]) => {
    const options = yearKeys.map((key) => '<option value="' + escapeHtml(key) + '"' + (key === selected ? ' selected' : '') + '>' + escapeHtml(key) + '</option>').join('');
    return '<optgroup label="Rok ' + escapeHtml(year) + '">' + options + '</optgroup>';
  }).join('');
}

function renderAdminExportImportStatus() {}
