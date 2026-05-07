const EXPORT_SOURCE_IDS = {
  "app.js": "src-app-js",
  "core.js": "src-core-js",
  "qr.js": "src-qr-js",
  "payroll.js": "src-payroll-js",
  "stats.js": "src-stats-js",
  "soustruhy.js": "src-soustruhy-js",
  "brusy.js": "src-brusy-js",
  "rotace.js": "src-rotace-js",
  "ui.js": "src-ui-js",
  "export.js": "src-export-js",
  "app-init.js": "src-app-init-js",
  "data.js": "src-data-js",
  "styles.css": "src-styles-css",
  "styles-base.css": "src-styles-base-css",
  "styles-layout.css": "src-styles-layout-css",
  "styles-theme.css": "src-styles-theme-css",
  "styles-responsive.css": "src-styles-responsive-css",
  "styles-modal.css": "src-styles-modal-css"
};

const SOURCE_CACHE = window.__ROTACE_SOURCE_CACHE__ || (window.__ROTACE_SOURCE_CACHE__ = {});

function primeSourceCache() {
  for (const [file, id] of Object.entries(EXPORT_SOURCE_IDS)) {
    const el = document.getElementById(id);
    if (el && el.textContent) {
      SOURCE_CACHE[file] = el.textContent.replace(/^\s+|\s+$/g, "");
    }
  }
}

primeSourceCache();

async function readExportText(relativePath) {
  if (SOURCE_CACHE[relativePath]) {
    return SOURCE_CACHE[relativePath];
  }

  const id = EXPORT_SOURCE_IDS[relativePath];
  const embedded = id ? document.getElementById(id) : null;
  if (embedded && embedded.textContent) {
    const text = embedded.textContent.replace(/^\s+|\s+$/g, "");
    SOURCE_CACHE[relativePath] = text;
    return text;
  }

  const response = await fetch(new URL(relativePath, window.location.href).toString(), { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Nepodařilo se načíst ${relativePath} (${response.status})`);
  }
  const text = await response.text();
  SOURCE_CACHE[relativePath] = text;
  return text;
}

async function exportCurrentHtml() {
  if (typeof JSZip === "undefined") {
    alert("Export ZIP není dostupný, nenačetla se knihovna JSZip.");
    return;
  }

  try {
    const jsFiles = [
      "app.js",
      "core.js",
      "qr.js",
      "payroll.js",
      "stats.js",
      "soustruhy.js",
      "brusy.js",
      "rotace.js",
      "ui.js",
      "export.js",
      "app-init.js"
    ];

    const cssFiles = [
      "styles.css",
      "styles-base.css",
      "styles-layout.css",
      "styles-theme.css",
      "styles-responsive.css",
      "styles-modal.css"
    ];

    const stylesSource = await readExportText("styles.css");
    const cssSources = {};
    for (const file of cssFiles.slice(1)) {
      cssSources[file] = await readExportText(file);
    }

    const moduleSources = {};
    for (const file of jsFiles) {
      moduleSources[file] = await readExportText(file);
    }

    const pages = [...document.querySelectorAll(".page")];
    const previousActive = pages.find(p => p.classList.contains("active"))?.id || "home";
    pages.forEach(p => p.classList.remove("active"));
    const home = document.getElementById("home");
    if (home) home.classList.add("active");

    const clone = document.documentElement.cloneNode(true);
    const indexText = `<!DOCTYPE html>
${clone.outerHTML}`;

    pages.forEach(p => p.classList.remove("active"));
    const restore = document.getElementById(previousActive);
    if (restore) restore.classList.add("active");

    const zip = new JSZip();
    zip.file("index.html", indexText);
    zip.file("styles.css", stylesSource);
    for (const file of cssFiles.slice(1)) {
      zip.file(file, cssSources[file]);
    }
    zip.file("data.js", `const initialRotationData = ${JSON.stringify(app.rotation)};
`);
    for (const file of jsFiles) {
      zip.file(file, moduleSources[file]);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rotace_v.0193-rc.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error(err);
    alert("Export ZIP se nepovedl: " + (err && err.message ? err.message : err));
  }
}

document.getElementById("exportBtn")?.addEventListener("click", () => {
  exportCurrentHtml();
});
