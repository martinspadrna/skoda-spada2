const EXPORT_SOURCE_IDS = {
  "app.js": "src-app-js",
  "core.js": "src-core-js",
  "lifecycle.js": "src-lifecycle-js",
  "qr.js": "src-qr-js",
  "payroll.js": "src-payroll-js",
  "stats.js": "src-stats-js",
  "dashboard.js": "src-dashboard-js",
  "soustruhy.js": "src-soustruhy-js",
  "brusy.js": "src-brusy-js",
  "rotace.js": "src-rotace-js",
  "changelog.js": "src-changelog-js",
  "ui.js": "src-ui-js",
  "games-arcade.js": "src-games-arcade-js",
  "export.js": "src-export-js",
  "app-init.js": "src-app-init-js",
  "data.js": "src-data-js",
  "styles.css": "src-styles-css",
  "styles-base.css": "src-styles-base-css",
  "styles-layout.css": "src-styles-layout-css",
  "styles-theme.css": "src-styles-theme-css",
  "styles-responsive.css": "src-styles-responsive-css",
  "styles-modal.css": "src-styles-modal-css",
  "styles-inline-legacy.css": "src-styles-inline-legacy-css",
  "styles-calc-panels.css": "src-styles-calc-panels-css",
  "styles-games.css": "src-styles-games-css",
  "styles-overrides.css": "src-styles-overrides-css",
  "supabase-config.js": "src-supabase-config-js",
  "supabase-bridge.js": "src-supabase-bridge-js",
  "CHANGELOG.md": "src-changelog-md",
  "manifest.webmanifest": "src-manifest-webmanifest",
  "sw.js": "src-sw-js",
  "supabase_rpc_hardening_v827.sql": "src-supabase-rpc-hardening-v827-sql",
  "icon-16.png": "src-icon-16-png",
  "icon-32.png": "src-icon-32-png",
  "icon-180.png": "src-icon-180-png",
  "icon-192.png": "src-icon-192-png",
  "icon-512.png": "src-icon-512-png",
  "icon-1024.png": "src-icon-1024-png"
};

const SOURCE_CACHE = window.__ROTACE_SOURCE_CACHE__ || (window.__ROTACE_SOURCE_CACHE__ = {});

const EXPORT_BINARY_FILES = new Set([
  'icon-16.png',
  'icon-32.png',
  'icon-180.png',
  'icon-192.png',
  'icon-512.png',
  'icon-1024.png',
  'assets/dashboard-icons/calendar.png',
  'assets/dashboard-icons/dovolena.png',
  'assets/dashboard-icons/eportal.png',
  'assets/dashboard-icons/hourglass.png',
  'assets/dashboard-icons/jidelna.png',
  'assets/dashboard-icons/jidelnilistek.png',
  'assets/dashboard-icons/kantyna.png',
  'assets/dashboard-icons/vyplata.png',
  'assets/nav-icons/games-gray.png',
  'assets/nav-icons/games-green.png',
  'assets/nav-icons/home-gray.png',
  'assets/nav-icons/home-green.png',
  'assets/nav-icons/kalkulacky-gray.png',
  'assets/nav-icons/kalkulacky-green.png',
  'assets/nav-icons/rotace-gray.png',
  'assets/nav-icons/rotace-green.png',
  'assets/nav-icons/rozpisy-gray.png',
  'assets/nav-icons/rozpisy-green.png',
  'assets/nav-icons/statistiky-gray.png',
  'assets/nav-icons/statistiky-green.png',
  'assets/help/frezky-konicita-help.png',
  'assets/help/frezky-fhb-help.png',
  'assets/help/soustruhy-vrtaky-x-help.png'
]);

function primeSourceCache() {
  // Keep the cache empty here so exports always read the current files first.
}

primeSourceCache();

function setRakExportStatus(text, isError) {
  const status = document.getElementById('rakExcelImportStatus') || document.getElementById('adminOnlineSaveStatus');
  if (!status) return;
  status.textContent = text || '';
  status.classList.toggle('isError', !!isError);
}


async function readExportText(relativePath) {
  if (SOURCE_CACHE[relativePath]) {
    return SOURCE_CACHE[relativePath];
  }

  try {
    const response = await fetch(new URL(relativePath, window.location.href).toString(), { cache: 'no-store' });
    if (response.ok) {
      const text = await response.text();
      SOURCE_CACHE[relativePath] = text;
      return text;
    }
  } catch (err) {
    console.warn(err);
  }

  const id = EXPORT_SOURCE_IDS[relativePath];
  const embedded = id ? document.getElementById(id) : null;
  if (embedded && embedded.textContent) {
    const text = embedded.textContent.replace(/^\s+|\s+$/g, '');
    SOURCE_CACHE[relativePath] = text;
    return text;
  }

  throw new Error(`Nepodařilo se načíst ${relativePath}`);
}

async function readExportBinary(relativePath) {
  try {
    const response = await fetch(new URL(relativePath, window.location.href).toString(), { cache: 'no-store' });
    if (response.ok) {
      return await response.arrayBuffer();
    }
  } catch (err) {
    console.warn(err);
  }
  throw new Error(`Nepodařilo se načíst ${relativePath}`);
}

async function exportCurrentHtml() {
  if (typeof JSZip === "undefined") {
    setRakExportStatus("Export ZIP není dostupný, nenačetla se knihovna JSZip.", true);
    alert("Export ZIP není dostupný, nenačetla se knihovna JSZip.");
    return;
  }

  try {
    setRakExportStatus("Připravuju ZIP build…", false);
    const jsFiles = [
      'app.js',
      'core.js',
      'lifecycle.js',
      'qr.js',
      'payroll.js',
      'stats.js',
      'dashboard.js',
      'soustruhy.js',
      'brusy.js',
      'rotace.js',
      'changelog.js',
      'ui.js',
      'games-arcade.js',
      'export.js',
      'app-init.js',
      'supabase-config.js',
      'supabase-bridge.js'
    ];

    const textFiles = [
      'styles.css',
      'styles-base.css',
      'styles-layout.css',
      'styles-theme.css',
      'styles-responsive.css',
      'styles-modal.css',
      'styles-inline-legacy.css',
      'styles-calc-panels.css',
      'styles-games.css',
      'styles-overrides.css',
      'CHANGELOG.md',
      'manifest.webmanifest',
      'sw.js',
      'data.js',
      'supabase_rpc_hardening_v827.sql'
    ];

    const binaryFiles = [
      'icon-16.png',
      'icon-32.png',
      'icon-180.png',
      'icon-192.png',
      'icon-512.png',
      'icon-1024.png',
      'assets/dashboard-icons/calendar.png',
      'assets/dashboard-icons/dovolena.png',
      'assets/dashboard-icons/eportal.png',
      'assets/dashboard-icons/hourglass.png',
      'assets/dashboard-icons/jidelna.png',
      'assets/dashboard-icons/jidelnilistek.png',
      'assets/dashboard-icons/kantyna.png',
      'assets/dashboard-icons/vyplata.png',
      'assets/nav-icons/games-gray.png',
      'assets/nav-icons/games-green.png',
      'assets/nav-icons/home-gray.png',
      'assets/nav-icons/home-green.png',
      'assets/nav-icons/kalkulacky-gray.png',
      'assets/nav-icons/kalkulacky-green.png',
      'assets/nav-icons/rotace-gray.png',
      'assets/nav-icons/rotace-green.png',
      'assets/nav-icons/rozpisy-gray.png',
      'assets/nav-icons/rozpisy-green.png',
      'assets/nav-icons/statistiky-gray.png',
      'assets/nav-icons/statistiky-green.png',
      'assets/help/frezky-konicita-help.png',
      'assets/help/frezky-fhb-help.png',
      'assets/help/soustruhy-vrtaky-x-help.png'
    ];

    const stylesSource = await readExportText('styles.css');
    const cssSources = {};
    for (const file of textFiles.filter((file) => file.startsWith('styles-'))) {
      cssSources[file] = await readExportText(file);
    }

    const moduleSources = {};
    for (const file of jsFiles) {
      moduleSources[file] = await readExportText(file);
    }

    const textSources = {};
    for (const file of textFiles.filter((file) => !file.startsWith('styles-') && file !== 'data.js')) {
      textSources[file] = await readExportText(file);
    }

    const binarySources = {};
    for (const file of binaryFiles) {
      binarySources[file] = await readExportBinary(file);
    }

    let indexText = '';
    try {
      indexText = await readExportText('index.html');
    } catch (indexErr) {
      console.warn('Export fallback: index.html se nepodařilo načíst jako zdroj, používám DOM kopii.', indexErr);
      const pages = [...document.querySelectorAll(".page")];
      const previousActive = pages.find(p => p.classList.contains("active"))?.id || "home";
      pages.forEach(p => p.classList.remove("active"));
      const home = document.getElementById("home");
      if (home) home.classList.add("active");
      indexText = `<!DOCTYPE html>
${document.documentElement.cloneNode(true).outerHTML}`;
      pages.forEach(p => p.classList.remove("active"));
      const restore = document.getElementById(previousActive);
      if (restore) restore.classList.add("active");
    }

    const zip = new JSZip();
    zip.file('index.html', indexText);
    zip.file('styles.css', stylesSource);
    for (const file of textFiles.filter((file) => file.startsWith('styles-'))) {
      zip.file(file, cssSources[file]);
    }
    zip.file('data.js', `const initialRotationData = ${JSON.stringify(app.rotation)};
`);
    for (const file of jsFiles) {
      zip.file(file, moduleSources[file]);
    }
    for (const file of Object.keys(textSources)) {
      if (file === 'styles.css' || file.startsWith('styles-')) continue;
      zip.file(file, textSources[file]);
    }
    for (const file of binaryFiles) {
      zip.file(file, binarySources[file]);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const versionText = String(window.APP_VERSION || '').trim();
    const versionMatch = versionText.match(/v\.(\d+)\.(\d+)\s*\((\d+)\)/i);
    const versionSuffix = versionMatch ? `${versionMatch[1]}_${versionMatch[2]}_${versionMatch[3]}` : 'current';
    a.download = `RaK_v${versionSuffix}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setRakExportStatus("ZIP export spuštěný: " + a.download, false);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error(err);
    setRakExportStatus("Export ZIP se nepovedl: " + (err && err.message ? err.message : err), true);
    alert("Export ZIP se nepovedl: " + (err && err.message ? err.message : err));
  }
}
window.exportCurrentHtml = exportCurrentHtml;

async function triggerRakZipExport() {
  return exportCurrentHtml();
}
window.triggerRakZipExport = triggerRakZipExport;

document.getElementById("exportBtn")?.addEventListener("click", () => {
  exportCurrentHtml();
});
