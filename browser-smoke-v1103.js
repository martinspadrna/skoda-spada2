#!/usr/bin/env node
// RaK 1.2 (1.271) – browser smoke test přes lokální Chromium/CDP.
// Browser smoke coverage: Rotace export canvas + fixed background + file URL fallback.
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const net = require('net');
const { spawn } = require('child_process');
const { pathToFileURL } = require('url');

const ROOT_DIR = __dirname;
const EXPECTED_APP_VERSION = '1.2 (1.271)';
const RAK_BROWSER_SMOKE_ENGINE = 'local-chromium-cdp';
const RAK_BROWSER_SMOKE_LOAD_MODE = 'about-blank-inline-html';
const CHROMIUM_BIN = process.env.CHROMIUM_BIN || process.env.CHROME_BIN || '/usr/bin/chromium';
const VIEWPORTS = Object.freeze([
  { name: 'iPhone 13/14 Pro Max', width: 430, height: 932, dpr: 3, mobile: true },
  { name: 'Samsung A15 / Android běžný', width: 412, height: 915, dpr: 2.625, mobile: true },
  { name: 'úzký mobil 360×800', width: 360, height: 800, dpr: 3, mobile: true }
]);

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function getMime(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ({
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.webmanifest': 'application/manifest+json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml; charset=utf-8',
    '.ico': 'image/x-icon',
    '.md': 'text/markdown; charset=utf-8',
    '.sql': 'text/plain; charset=utf-8'
  })[ext] || 'application/octet-stream';
}


function escapeInlineScript(source) {
  return String(source || '').replace(/<\/script/gi, '<\\/script');
}

function readLocalText(relPath) {
  const clean = String(relPath || '').replace(/^\.\//, '').split('?')[0];
  const full = path.normalize(path.join(ROOT_DIR, clean));
  assert(full.startsWith(ROOT_DIR), `Cesta mimo root: ${relPath}`);
  return fs.readFileSync(full, 'utf8');
}

function getAppLoaderFiles() {
  const appJs = readLocalText('app.js');
  const match = appJs.match(/const files = \[(.*?)\];/s);
  assert(match, 'browser smoke nedokázal najít app.js files list');
  return Array.from(match[1].matchAll(/"([^"]+\.js)"/g)).map(item => item[1]);
}

function buildInlineBootScript() {
  return `
try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('app.js', 'loaded', { source: 'browser-smoke-inline' }); } catch (err) {}
function rakBrowserSmokeBoot(){
  try { if (typeof installPwaAndConnectivityHooks === 'function') installPwaAndConnectivityHooks(); } catch (err) { console.warn('PWA hooks smoke skip', err); }
  try { if (typeof installBottomNavBindings === 'function') installBottomNavBindings(); } catch (err) { console.warn('Bottom nav smoke skip', err); }
  try { if (typeof applyBottomNavMoreHardFix === 'function') applyBottomNavMoreHardFix(); } catch (err) { console.warn('Bottom nav Více hard-fix smoke skip', err); }
  try { if (typeof applyRakFixedBottomNavMetrics === 'function') applyRakFixedBottomNavMetrics(); } catch (err) { console.warn('Bottom nav metrics smoke skip', err); }
  try { if (typeof installDelegatedAppActions === 'function') installDelegatedAppActions(); } catch (err) { console.warn('Delegated actions smoke skip', err); }
  try { if (typeof runRakPostLoadAudits === 'function') runRakPostLoadAudits(); } catch (err) { console.warn('Post-load audits smoke skip', err); }
  try {
    if (typeof window.__rotaceBootHomeRefreshLate === 'function') window.__rotaceBootHomeRefreshLate();
    else if (typeof bootHomeRefresh === 'function') bootHomeRefresh();
  } catch (err) { console.warn('Home refresh smoke skip', err); }
  try { if (typeof runRakBootSelfTest === 'function') runRakBootSelfTest(); } catch (err) { console.warn('Boot self-test smoke skip', err); }
  try { document.documentElement.dataset.rakBrowserSmokeBoot = 'ready'; } catch (err) {}
}
if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', rakBrowserSmokeBoot, { once: true });
else setTimeout(rakBrowserSmokeBoot, 0);`;
}

function getInlineScriptSource(file) {
  let source = readLocalText(file);
  const clean = String(file || '').replace(/^\.\//, '').split('?')[0];
  if (clean === 'data.js') {
    source = source.replace('const initialRotationData =', 'var initialRotationData =');
  }
  if (clean === 'core.js') {
    ['APP_KEY', 'APP_VERSION', 'ROTATION_BUILD', 'HARD_MACHINE_HEADERS', 'SOFT_MACHINE_HEADERS', 'KNOWN_STAT_NAMES', 'NO_START_HOLIDAYS', 'SPECIAL_OVERTIME_SUNDAY_NIGHTS_2026', 'appRotation', 'app'].forEach((name) => {
      source = source.replace(new RegExp('\\bconst\\s+' + name + '\\b'), 'var ' + name);
      source = source.replace(new RegExp('\\blet\\s+' + name + '\\b'), 'var ' + name);
    });
  }
  source = source.replace(/\bconst\s+(RAK_[A-Z0-9_]+_CONTRACT_V\d+)\b/g, 'var $1');
  return source;
}

function getExternalStub(src) {
  if (/supabase-js/i.test(src)) {
    return `const rakSmokeQueryBuilder=function(){const result={data:[],error:null};const q=new Proxy(function(){},{get:function(target,prop){if(prop==='then')return function(resolve,reject){return Promise.resolve(result).then(resolve,reject)};if(prop==='catch')return function(reject){return Promise.resolve(result).catch(reject)};if(prop==='finally')return function(cb){return Promise.resolve(result).finally(cb)};return function(){return q}}});return q};window.supabase={createClient:function(){return{channel:function(){return{on:function(){return this},subscribe:function(cb){try{if(typeof cb==='function')cb('SUBSCRIBED')}catch(e){};return this},unsubscribe:function(){return Promise.resolve({})}}},from:function(){return rakSmokeQueryBuilder()},rpc:function(){return Promise.resolve({data:null,error:null})},storage:{from:function(){return{createSignedUrl:function(){return Promise.resolve({data:null,error:null})},upload:function(){return Promise.resolve({data:null,error:null})},remove:function(){return Promise.resolve({data:null,error:null})}}}},auth:{getSession:function(){return Promise.resolve({data:{session:null},error:null})},getUser:function(){return Promise.resolve({data:{user:null},error:null})},onAuthStateChange:function(){return{data:{subscription:{unsubscribe:function(){}}}}}}}}}; try{rakNoteExternalDependency('supabase','stubbed','${src}')}catch(e){}`;
  }
  if (/jszip/i.test(src)) return `window.JSZip=window.JSZip||function(){return{file:function(){return this},generateAsync:function(){return Promise.resolve(new Blob())}}}; try{rakNoteExternalDependency('jszip','stubbed','${src}')}catch(e){}`;
  if (/xlsx/i.test(src)) return `window.XLSX=window.XLSX||{}; try{rakNoteExternalDependency('xlsx','stubbed','${src}')}catch(e){}`;
  return `try{rakNoteExternalDependency('external','stubbed','${src}')}catch(e){}`;
}

function buildInlineSmokeHtml() {
  let html = readLocalText('index.html');
  html = html.replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/rel=["']stylesheet["']/i.test(tag)) return tag;
    const href = (tag.match(/href=["']([^"']+)["']/i) || [])[1] || '';
    if (/^https?:/i.test(href)) return `<!-- browser smoke external stylesheet stubbed: ${href} -->`;
    const css = readLocalText(href);
    return `<style data-browser-smoke-inline-css="${href}">\n${css}\n</style>`;
  });
  const dynamicFiles = getAppLoaderFiles();
  html = html.replace(/<script\b([^>]*?)\bsrc=["']([^"']+)["']([^>]*)><\/script>/gi, (tag, before, src) => {
    if (/^https?:/i.test(src)) return `<script data-browser-smoke-external-stub="${src}">\n${escapeInlineScript(getExternalStub(src))}\n</script>`;
    const cleanSrc = String(src || '').replace(/^\.\//, '').split('?')[0];
    if (cleanSrc === 'app.js') {
      const inlineModules = dynamicFiles.map(file => `<script data-browser-smoke-inline-module="${file}">\n${escapeInlineScript(getInlineScriptSource(file))}\n</script>`).join('\n');
      return `${inlineModules}\n<script data-browser-smoke-inline-boot="app.js">\n${escapeInlineScript(buildInlineBootScript())}\n</script>`;
    }
    return `<script data-browser-smoke-inline-script="${cleanSrc}">\n${escapeInlineScript(getInlineScriptSource(cleanSrc))}\n</script>`;
  });
  return html;
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}

function createStaticServer(rootDir) {
  const server = http.createServer((req, res) => {
    try {
      const url = new URL(req.url || '/', 'http://127.0.0.1');
      let pathname = decodeURIComponent(url.pathname || '/');
      if (pathname === '/') pathname = '/index.html';
      const requestedPath = path.normalize(path.join(rootDir, pathname));
      if (!requestedPath.startsWith(rootDir)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      fs.stat(requestedPath, (statErr, stat) => {
        if (statErr || !stat.isFile()) {
          res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
          res.end('Not found');
          return;
        }
        res.writeHead(200, {
          'content-type': getMime(requestedPath),
          'cache-control': 'no-store, max-age=0',
          'access-control-allow-origin': '*'
        });
        fs.createReadStream(requestedPath).pipe(res);
      });
    } catch (err) {
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(String(err && err.stack || err));
    }
  });
  return server;
}

class CdpClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.events = new Map();
    this.ws.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message || JSON.stringify(message.error)));
        else resolve(message.result || {});
        return;
      }
      if (message.method && this.events.has(message.method)) {
        for (const handler of this.events.get(message.method)) handler(message.params || {});
      }
    });
  }
  open() {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('CDP websocket timeout')), 8000);
      this.ws.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true });
      this.ws.addEventListener('error', (err) => { clearTimeout(timer); reject(err); }, { once: true });
    });
  }
  send(method, params = {}) {
    const id = this.nextId++;
    const payload = JSON.stringify({ id, method, params });
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP timeout: ${method}`));
      }, 15000);
      this.pending.set(id, {
        resolve: (value) => { clearTimeout(timer); resolve(value); },
        reject: (err) => { clearTimeout(timer); reject(err); }
      });
      this.ws.send(payload);
    });
  }
  on(method, handler) {
    if (!this.events.has(method)) this.events.set(method, new Set());
    this.events.get(method).add(handler);
  }
  close() {
    try { this.ws.close(); } catch (err) {}
  }
}

async function waitForBrowser(cdpPort) {
  const started = Date.now();
  let lastError = null;
  while (Date.now() - started < 10000) {
    try {
      const res = await fetch(`http://127.0.0.1:${cdpPort}/json/version`);
      if (res.ok) return await res.json();
    } catch (err) {
      lastError = err;
    }
    await new Promise(resolve => setTimeout(resolve, 120));
  }
  throw new Error('Chromium CDP endpoint nenaběhl: ' + (lastError && lastError.message || 'timeout'));
}

async function createTarget(cdpPort) {
  const blankUrl = encodeURIComponent('about:blank');
  let res = await fetch(`http://127.0.0.1:${cdpPort}/json/new?${blankUrl}`, { method: 'PUT' });
  if (!res.ok) res = await fetch(`http://127.0.0.1:${cdpPort}/json/new?${blankUrl}`);
  assert(res.ok, 'Nepodařilo se vytvořit CDP target');
  return res.json();
}

async function evalInPage(client, expression) {
  const result = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true
  });
  if (result.exceptionDetails) {
    const details = result.exceptionDetails;
    const detailText = [
      details.text,
      details.exception && details.exception.description,
      details.exception && details.exception.value,
      details.lineNumber != null ? `line ${details.lineNumber}` : '',
      details.columnNumber != null ? `col ${details.columnNumber}` : ''
    ].filter(Boolean).join(' | ');
    throw new Error(detailText || 'Runtime.evaluate exception');
  }
  return result.result ? result.result.value : undefined;
}

async function waitForPageCondition(client, expression, label, timeoutMs = 12000) {
  const started = Date.now();
  let lastValue;
  while (Date.now() - started < timeoutMs) {
    try {
      lastValue = await evalInPage(client, `Boolean(${expression})`);
      if (lastValue) return;
    } catch (err) {
      lastValue = err.message;
    }
    await new Promise(resolve => setTimeout(resolve, 140));
  }
  let debug = '';
  try {
    debug = JSON.stringify(await evalInPage(client, `(() => ({
      readyState: document.readyState,
      appVersion: window.APP_VERSION || null,
      bottomNavCount: document.querySelectorAll('.bottomNavBtn').length,
      scripts: Array.from(document.scripts).map(s => ({ src: s.src, readyState: s.readyState || null })).slice(-8),
      bodyText: (document.body && document.body.innerText || '').slice(0, 500),
      smokeBoot: document.documentElement.dataset.rakBrowserSmokeBoot || null,
      hasShowPage: typeof window.showPage,
      hasInstallBottomNav: typeof window.installBottomNavBindings
    }))()`));
  } catch (err) {
    debug = err && err.message || String(err);
  }
  throw new Error(`Timeout při čekání na: ${label}; poslední stav: ${lastValue}; debug: ${debug}`);
}

async function clickAndWait(client, action, activeSelector) {
  await evalInPage(client, `(() => {
    const el = document.querySelector('[data-action="${action}"]');
    if (!el) throw new Error('Chybí akce ${action}');
    el.click();
    return true;
  })()`);
  try {
    await waitForPageCondition(client, `document.querySelector(${JSON.stringify(activeSelector)})`, activeSelector, 1400);
    return;
  } catch (err) {
    await evalInPage(client, `(() => {
      const directRoutes = {
        rotace: function(){ if (typeof openRotaceNames === 'function') openRotaceNames(); else if (typeof showPage === 'function') showPage('rotace'); },
        kalkulacky: function(){ if (typeof openKalkulacky === 'function') openKalkulacky(); else if (typeof showPage === 'function') showPage('kalkulacky'); },
        games: function(){ if (typeof openGamesPage === 'function') openGamesPage(); else if (typeof showPage === 'function') showPage('games'); },
        menu: function(){ if (typeof toggleAppMenu === 'function') toggleAppMenu(); else if (typeof showPage === 'function') showPage('menu'); },
        'page-brusy': function(){ if (typeof showPage === 'function') showPage('brusy'); },
        'page-korekce-frezky': function(){ if (typeof showPage === 'function') showPage('korekce-frezky'); }
      };
      if (!directRoutes[${JSON.stringify(action)}]) throw new Error('Chybí fallback pro akci ${action}');
      directRoutes[${JSON.stringify(action)}]();
      return true;
    })()`);
  }
  await waitForPageCondition(client, `document.querySelector(${JSON.stringify(activeSelector)})`, activeSelector, 8000);
}

async function runViewportSmoke(cdpPort, viewport, inlineHtml) {
  const target = await createTarget(cdpPort);
  const client = new CdpClient(target.webSocketDebuggerUrl);
  const runtimeExceptions = [];
  const consoleErrors = [];
  await client.open();
  client.on('Runtime.exceptionThrown', (params) => {
    const details = params.exceptionDetails || {};
    runtimeExceptions.push([
      details.text,
      details.exception && details.exception.description,
      details.lineNumber != null ? `line ${details.lineNumber}` : '',
      details.columnNumber != null ? `col ${details.columnNumber}` : ''
    ].filter(Boolean).join(' | ') || JSON.stringify(details));
  });
  client.on('Runtime.consoleAPICalled', (params) => {
    if (params.type === 'error') {
      const text = (params.args || []).map(arg => arg.value || arg.description || '').join(' ').trim();
      consoleErrors.push(text);
    }
  });

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('Log.enable').catch(() => {});
  await client.send('Fetch.enable', { patterns: [{ urlPattern: '*cdn.jsdelivr.net*', requestStage: 'Request' }] }).catch(() => {});
  client.on('Fetch.requestPaused', (params) => {
    const requestId = params.requestId;
    const requestUrl = params.request && params.request.url || '';
    if (/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js/i.test(requestUrl)) {
      const stub = `const rakSmokeQueryBuilder=function(){const result={data:[],error:null};const q=new Proxy(function(){},{get:function(target,prop){if(prop==='then')return function(resolve,reject){return Promise.resolve(result).then(resolve,reject)};if(prop==='catch')return function(reject){return Promise.resolve(result).catch(reject)};if(prop==='finally')return function(cb){return Promise.resolve(result).finally(cb)};return function(){return q}}});return q};window.supabase={createClient:function(){return{channel:function(){return{on:function(){return this},subscribe:function(cb){try{if(typeof cb==='function')cb('SUBSCRIBED')}catch(e){};return this},unsubscribe:function(){return Promise.resolve({})}}},from:function(){return rakSmokeQueryBuilder()},rpc:function(){return Promise.resolve({data:null,error:null})},storage:{from:function(){return{createSignedUrl:function(){return Promise.resolve({data:null,error:null})},upload:function(){return Promise.resolve({data:null,error:null})},remove:function(){return Promise.resolve({data:null,error:null})}}}},auth:{getSession:function(){return Promise.resolve({data:{session:null},error:null})},getUser:function(){return Promise.resolve({data:{user:null},error:null})},onAuthStateChange:function(){return{data:{subscription:{unsubscribe:function(){}}}}}}}}};`;
      client.send('Fetch.fulfillRequest', {
        requestId,
        responseCode: 200,
        responseHeaders: [{ name: 'content-type', value: 'text/javascript; charset=utf-8' }],
        body: Buffer.from(stub, 'utf8').toString('base64')
      }).catch(() => {});
    } else {
      client.send('Fetch.continueRequest', { requestId }).catch(() => {});
    }
  });
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.dpr,
    mobile: viewport.mobile
  });
  await client.send('Emulation.setUserAgentOverride', {
    userAgent: viewport.mobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
      : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari/537.36'
  });
  const inlineWriteExpression = `(() => {
    const makeSmokeStorage = () => {
      const store = Object.create(null);
      return {
        getItem: (key) => Object.prototype.hasOwnProperty.call(store, String(key)) ? store[String(key)] : null,
        setItem: (key, value) => { store[String(key)] = String(value); },
        removeItem: (key) => { delete store[String(key)]; },
        clear: () => { Object.keys(store).forEach((key) => delete store[key]); },
        key: (index) => Object.keys(store)[Number(index) || 0] || null,
        get length(){ return Object.keys(store).length; }
      };
    };
    try { Object.defineProperty(window, 'localStorage', { value: makeSmokeStorage(), configurable: true }); } catch (err) {}
    try { Object.defineProperty(window, 'sessionStorage', { value: makeSmokeStorage(), configurable: true }); } catch (err) {}
    document.open();
    document.write(${JSON.stringify(inlineHtml)});
    document.close();
    return true;
  })()`;
  await evalInPage(client, inlineWriteExpression);
  await waitForPageCondition(client, `document.readyState === 'complete' || document.readyState === 'interactive'`, 'DOM ready po inline about:blank injection', 10000);
  await waitForPageCondition(client, `window.APP_VERSION === ${JSON.stringify(EXPECTED_APP_VERSION)} && document.querySelectorAll('.bottomNavBtn').length >= 5 && document.documentElement.dataset.rakBrowserSmokeBoot === 'ready'`, 'app boot + verze + spodní navigace', 18000);

  const bootState = await evalInPage(client, `(() => ({
    appVersion: window.APP_VERSION || '',
    activePage: document.querySelector('.page.active') && document.querySelector('.page.active').id,
    bottomNavCount: document.querySelectorAll('.bottomNavBtn').length,
    homeCards: document.querySelectorAll('#home .dashboardCard, #home .tile').length,
    bodyBeforePosition: getComputedStyle(document.body, '::before').position,
    bodyBeforePointerEvents: getComputedStyle(document.body, '::before').pointerEvents
  }))()`);
  assert(bootState.appVersion === EXPECTED_APP_VERSION, `${viewport.name}: špatná verze ${bootState.appVersion}`);
  assert(bootState.bottomNavCount >= 5, `${viewport.name}: chybí spodní navigace`);
  assert(bootState.homeCards > 0, `${viewport.name}: Dashboard nemá karty`);
  assert(bootState.bodyBeforePosition === 'fixed', `${viewport.name}: pevné pozadí není fixed`);

  await clickAndWait(client, 'rotace', '#rotace.page.active');
  const rotationState = await evalInPage(client, `(() => ({
    nameTiles: document.querySelectorAll('.rotaceNameTile, #nameButtons .tile, #rotaceNamesPanel button, #rotaceNamesPanel .bbtn').length,
    hasStatsPanel: Boolean(document.querySelector('#rotaceStatsPanel')),
    canExport: typeof createRotationMonthExportCanvas === 'function'
  }))()`);
  assert(rotationState.hasStatsPanel, `${viewport.name}: Rotace nemá stats panel`);
  assert(rotationState.canExport, `${viewport.name}: chybí createRotationMonthExportCanvas`);

  const exportState = await evalInPage(client, `(() => {
    const months = window.app && app.rotation && app.rotation.months ? Object.keys(app.rotation.months) : [];
    const selected = (document.querySelector('#monthSelect') && document.querySelector('#monthSelect').value) || months[0] || '';
    const canvas = selected && typeof createRotationMonthExportCanvas === 'function' ? createRotationMonthExportCanvas(selected) : null;
    return { selected, width: canvas ? canvas.width : 0, height: canvas ? canvas.height : 0 };
  })()`);
  assert(exportState.selected && exportState.width > 800 && exportState.height > 800, `${viewport.name}: export Rotace nevytvořil platný canvas ${JSON.stringify(exportState)}`);

  const generatorState = await evalInPage(client, `(() => {
    const monthKey = '6/26';
    const beforeMonth = window.app && app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
    const beforeFilled = beforeMonth ? [...(beforeMonth.hard?.rows || []), ...(beforeMonth.soft?.rows || [])].flatMap(row => row.cells || []).filter(Boolean).length : -1;
    const result = typeof adminGenerateRotationMonthDraft === 'function' ? adminGenerateRotationMonthDraft(monthKey) : null;
    const month = window.app && app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
    const rows = month ? (month.hard.rows || []).map((hardRow, idx) => ({ hard: hardRow, soft: (month.soft.rows || [])[idx] || { cells: [] } })) : [];
    let duplicateDays = 0;
    let emptyCells = 0;
    rows.forEach(pair => {
      const names = [...(pair.hard.cells || []), ...(pair.soft.cells || [])].filter(Boolean);
      emptyCells += [...(pair.hard.cells || []), ...(pair.soft.cells || [])].filter(v => !String(v || '').trim()).length;
      if (new Set(names).size !== names.length) duplicateDays += 1;
    });
    return {
      canGenerate: typeof adminGenerateRotationMonthDraft === 'function',
      beforeFilled,
      days: result ? result.days : 0,
      filledCells: result ? result.filledCells : 0,
      historyTemplates: result ? result.historyTemplates : 0,
      previousYearTemplates: result ? result.previousYearTemplates : 0,
      duplicateDays,
      emptyCells
    };
  })()`);
  assert(generatorState.canGenerate, `${viewport.name}: chybí adminGenerateRotationMonthDraft`);
  assert(generatorState.days >= 12 && generatorState.filledCells >= 120, `${viewport.name}: generátor rozpisu nevyplnil dost dat ${JSON.stringify(generatorState)}`);
  assert(generatorState.historyTemplates >= 120, `${viewport.name}: generátor rozpisu nevychází z dost historických řádků ${JSON.stringify(generatorState)}`);
  assert(generatorState.duplicateDays === 0, `${viewport.name}: generátor rozpisu vytvořil duplicitní jméno v jednom dni ${JSON.stringify(generatorState)}`);

  const generatorAbsenceRuleState = await evalInPage(client, `(() => {
    const monthKey = '7/26';
    const month = window.app && app.rotation && app.rotation.months ? app.rotation.months[monthKey] : null;
    if (!month || typeof adminGenerateRotationMonthDraft !== 'function') return { ok: false, reason: 'missing month/generator' };
    const firstDate = month.hard?.rows?.[0]?.date || month.soft?.rows?.[0]?.date || '';
    month.notes = [{ date: firstDate, person: 'Blažek', code: 'D' }, { date: firstDate, person: 'Kříž', code: 'D' }];
    (month.hard?.rows || []).forEach(row => { row.cells = Array(5).fill(''); });
    (month.soft?.rows || []).forEach(row => { row.cells = Array(5).fill(''); });
    const result = adminGenerateRotationMonthDraft(monthKey);
    const row = app.rotation.months[monthKey].soft.rows[0];
    const hardRow = app.rotation.months[monthKey].hard.rows[0];
    const soft = row ? row.cells || [] : [];
    const names = [...(hardRow?.cells || []), ...soft].filter(Boolean);
    return {
      ok: true,
      ruleVersion: result && result.ruleVersion,
      protectedEmptyCells: result && result.protectedEmptyCells,
      mskc01: soft[0] || '',
      mfkf06: soft[3] || '',
      mfkf10: soft[4] || '',
      filled: names.length,
      duplicate: new Set(names).size !== names.length
    };
  })()`);
  assert(generatorAbsenceRuleState.ok, `${viewport.name}: generátor pravidel absencí se nespustil ${JSON.stringify(generatorAbsenceRuleState)}`);
  assert(generatorAbsenceRuleState.ruleVersion === '1.145', `${viewport.name}: generátor nemá pravidla 1.145 ${JSON.stringify(generatorAbsenceRuleState)}`);
  assert(generatorAbsenceRuleState.mfkf06 === '', `${viewport.name}: při jednom člověku na frézkách musí být MFKF06 prázdná ${JSON.stringify(generatorAbsenceRuleState)}`);
  assert(generatorAbsenceRuleState.mskc01 === '', `${viewport.name}: při dvou absencích musí být MSKC01 prázdná ${JSON.stringify(generatorAbsenceRuleState)}`);
  assert(generatorAbsenceRuleState.mfkf10, `${viewport.name}: při dvou absencích musí být člověk na MFKF10 ${JSON.stringify(generatorAbsenceRuleState)}`);
  assert(!generatorAbsenceRuleState.duplicate, `${viewport.name}: generátor absencí vytvořil duplicitu ${JSON.stringify(generatorAbsenceRuleState)}`);

  const absenceStateAfterAdd = await evalInPage(client, `(() => {
    const previousBody = document.getElementById('appMenuBody');
    if (previousBody) previousBody.remove();
    const body = document.createElement('div');
    body.id = 'appMenuBody';
    document.body.appendChild(body);
    if (typeof adminRotationGeneratorSetWizardState !== 'function' || typeof adminRotationGeneratorCollectAbsencesFromDom !== 'function' || typeof adminRotationGeneratorRenderWizard !== 'function') {
      return { ok: false, reason: 'missing wizard functions' };
    }
    adminRotationGeneratorSetWizardState({
      step: 'absences',
      monthKey: '6/26',
      days: ['1.6. R'],
      absencesByDay: [{ date: '1.6. R', rows: [{ person: 'Blažek', code: 'D' }] }]
    });
    adminRotationGeneratorRenderWizard('absences');
    const firstPerson = body.querySelector('[data-generator-absence-person]');
    const firstCode = body.querySelector('[data-generator-absence-code]');
    if (firstPerson) firstPerson.value = 'Kříž';
    if (firstCode) firstCode.value = 'D';
    const addBtn = body.querySelector('[data-admin-action="generator-absence-add"][data-day-index="0"]');
    if (!addBtn || typeof adminHandleRotationGeneratorWizardAction !== 'function') {
      return { ok: false, reason: 'missing add button/action' };
    }
    adminHandleRotationGeneratorWizardAction('generator-absence-add', addBtn);
    const rows = Array.from(document.querySelectorAll('[data-generator-absence-day="0"] [data-generator-absence-row]')).map((row) => ({
      person: row.querySelector('[data-generator-absence-person]')?.value || '',
      code: row.querySelector('[data-generator-absence-code]')?.value || ''
    }));
    return { ok: true, rows, rowCount: rows.length };
  })()`);
  assert(absenceStateAfterAdd.ok, `${viewport.name}: test zachování absencí se nespustil ${JSON.stringify(absenceStateAfterAdd)}`);
  assert(absenceStateAfterAdd.rowCount >= 2, `${viewport.name}: + Přidat jméno nepřidalo druhý řádek ${JSON.stringify(absenceStateAfterAdd)}`);
  assert(absenceStateAfterAdd.rows[0] && absenceStateAfterAdd.rows[0].person === 'Kříž' && absenceStateAfterAdd.rows[0].code === 'D', `${viewport.name}: + Přidat jméno smazalo vyplněnou absenci ${JSON.stringify(absenceStateAfterAdd)}`);

  const wizardRunState = await evalInPage(client, `(() => {
    const previousBody = document.getElementById('appMenuBody');
    if (previousBody) previousBody.remove();
    const body = document.createElement('div');
    body.id = 'appMenuBody';
    document.body.appendChild(body);
    if (typeof adminRotationGeneratorSetWizardState !== 'function' || typeof adminRotationGeneratorRenderWizard !== 'function' || typeof adminHandleRotationGeneratorWizardAction !== 'function') {
      return { ok: false, reason: 'missing wizard functions' };
    }
    const monthKey = '6/26';
    const days = typeof adminRotationGetMonthWorkDates === 'function'
      ? adminRotationGetMonthWorkDates(monthKey).slice(0, 4)
      : ((app.rotation?.months?.[monthKey]?.hard?.rows || []).slice(0, 4).map(row => row.date).filter(Boolean));
    window.confirm = () => true;
    adminRotationGeneratorSetWizardState({
      step: 'absences',
      monthKey,
      days,
      absencesByDay: days.map((date) => ({ date, rows: [] }))
    });
    adminRotationGeneratorRenderWizard('absences');
    const runBtn = body.querySelector('[data-admin-action="generator-run"]');
    if (!runBtn) return { ok: false, reason: 'missing run button', days };
    adminHandleRotationGeneratorWizardAction('generator-run', runBtn);
    const state = window.__rakRotationGeneratorWizard || {};
    const month = app.rotation?.months?.[monthKey] || null;
    const filled = month ? [...(month.hard?.rows || []), ...(month.soft?.rows || [])].flatMap(row => row.cells || []).filter(Boolean).length : 0;
    const machineCountHitCount = document.querySelectorAll('.adminRotationGeneratorMachineSummaryTable .adminRotationMachineCountHit').length;
    const summaryText = document.querySelector('.adminRotationGeneratorMachineSummaryTable')?.textContent || '';
    const previewText = document.querySelector('.adminRotationGeneratorPreviewTable')?.textContent || '';
    const tnksBalance = (() => {
      const names = typeof adminGetKnownNames === 'function' ? adminGetKnownNames() : [];
      const idx = (typeof HARD_MACHINE_HEADERS !== 'undefined' ? HARD_MACHINE_HEADERS : []).indexOf('TNKS01');
      const counts = {};
      names.forEach((name) => counts[name] = 0);
      if (idx >= 0 && month?.hard?.rows) {
        month.hard.rows.forEach((row) => {
          const name = String((row.cells || [])[idx] || '').trim();
          if (Object.prototype.hasOwnProperty.call(counts, name)) counts[name] += 1;
        });
      }
      const active = Object.values(counts).filter((value) => value > 0);
      return { counts, max: active.length ? Math.max(...active) : 0, min: active.length ? Math.min(...active) : 0, swaps: state.result ? Number(state.result.tnksBalanceSwaps || 0) : 0 };
    })();
    return {
      ok: true,
      resultFilledCells: state.result ? state.result.filledCells : 0,
      resultDays: state.result ? state.result.days : 0,
      filled,
      machineCountHitCount,
      tnksBalance,
      summaryTextLength: summaryText.length,
      previewTextLength: previewText.length,
      resultText: state.resultText || ''
    };
  })()`);
  assert(wizardRunState.ok, `${viewport.name}: Vygenerovat rozpis z průvodce se nespustilo ${JSON.stringify(wizardRunState)}`);
  assert(wizardRunState.resultFilledCells > 0 && wizardRunState.filled > 0, `${viewport.name}: Vygenerovat rozpis z průvodce skončilo prázdným rozpisem ${JSON.stringify(wizardRunState)}`);
  assert(wizardRunState.machineCountHitCount > 0 && wizardRunState.summaryTextLength > 20, `${viewport.name}: přehled stroje × jména po průvodci je nulový/prázdný ${JSON.stringify(wizardRunState)}`);
  assert(wizardRunState.previewTextLength > 80, `${viewport.name}: náhled celého rozpisu po průvodci chybí nebo je prázdný ${JSON.stringify(wizardRunState)}`);
  assert(wizardRunState.tnksBalance && wizardRunState.tnksBalance.max - wizardRunState.tnksBalance.min <= 1, `${viewport.name}: TNKS01/nýtovačka není po vygenerování vyrovnaná ${JSON.stringify(wizardRunState.tnksBalance)}`);

  const corruptedMonthRecovery = await evalInPage(client, `(() => {
    const monthKey = '6/26';
    const original = JSON.parse(JSON.stringify(app.rotation?.months?.[monthKey] || null));
    try {
      if (!app.rotation.months[monthKey]) return { ok: false, reason: 'missing month' };
      app.rotation.months[monthKey].hard.rows = [];
      app.rotation.months[monthKey].soft.rows = [];
      const previousBody = document.getElementById('appMenuBody');
      if (previousBody) previousBody.remove();
      const body = document.createElement('div');
      body.id = 'appMenuBody';
      document.body.appendChild(body);
      window.confirm = () => true;
      adminRotationGeneratorSetWizardState({ step: 'absences', monthKey, days: [], absencesByDay: [] });
      adminRotationGeneratorRenderWizard('absences');
      const restoredDays = (window.__rakRotationGeneratorWizard?.days || []).length;
      const runBtn = body.querySelector('[data-admin-action="generator-run"]');
      if (!runBtn) return { ok: false, reason: 'missing run button', restoredDays };
      adminHandleRotationGeneratorWizardAction('generator-run', runBtn);
      const state = window.__rakRotationGeneratorWizard || {};
      return {
        ok: true,
        restoredDays,
        resultDays: state.result ? state.result.days : 0,
        resultFilledCells: state.result ? state.result.filledCells : 0,
        resultText: state.resultText || '',
        hasOkSend: !!document.querySelector('[data-admin-action="generator-open-editor"]')
      };
    } finally {
      if (original) app.rotation.months[monthKey] = original;
    }
  })()`);
  assert(corruptedMonthRecovery.ok, `${viewport.name}: obnova prázdného měsíce v průvodci se nespustila ${JSON.stringify(corruptedMonthRecovery)}`);
  assert(corruptedMonthRecovery.restoredDays > 0 && corruptedMonthRecovery.resultDays > 0 && corruptedMonthRecovery.resultFilledCells > 0, `${viewport.name}: průvodce po prázdném měsíci znovu skončil nulou ${JSON.stringify(corruptedMonthRecovery)}`);

  await clickAndWait(client, 'kalkulacky', '#kalkulacky.page.active');
  await clickAndWait(client, 'page-brusy', '#brusy.page.active');
  const brusState = await evalInPage(client, `(() => {
    const btns = Array.from(document.querySelectorAll('#brusy .brusMachineBtn, #brusy .brusIndexBtn, #brusy .brusFreeIndexBtn'));
    const first = btns[0];
    const cs = first ? getComputedStyle(first) : null;
    const page = document.querySelector('#brusy');
    const pcs = page ? getComputedStyle(page) : null;
    return {
      count: btns.length,
      labels: btns.map(btn => btn.textContent.trim()),
      heightsByLabel: btns.map(btn => ({ label: btn.textContent.trim(), height: Math.round(btn.getBoundingClientRect().height), computed: getComputedStyle(btn).height })),
      minHeight: Math.min(...btns.map(btn => Math.round(btn.getBoundingClientRect().height))),
      maxHeight: Math.max(...btns.map(btn => Math.round(btn.getBoundingClientRect().height))),
      computedHeight: cs ? cs.height : '',
      computedMinHeight: cs ? cs.minHeight : '',
      computedMaxHeight: cs ? cs.maxHeight : '',
      computedTransform: cs ? cs.transform : '',
      computedZoom: cs ? cs.zoom : '',
      pageTransform: pcs ? pcs.transform : '',
      pageZoom: pcs ? pcs.zoom : ''
    };
  })()`);
  assert(brusState.count >= 7, `${viewport.name}: Brusy nemají očekávané volby`);

  await clickAndWait(client, 'kalkulacky', '#kalkulacky.page.active');
  await clickAndWait(client, 'page-korekce-frezky', '#korekce-frezky.page.active');
  const frezkyState = await evalInPage(client, `(() => ({
    presetCount: document.querySelectorAll('#korekce-frezky .calcFhbPresetBtn').length,
    minPresetHeight: Math.min(...Array.from(document.querySelectorAll('#korekce-frezky .calcFhbPresetBtn')).map(btn => Math.round(btn.getBoundingClientRect().height)))
  }))()`);
  assert(frezkyState.presetCount >= 4, `${viewport.name}: Frézky korekce nemají preset tlačítka`);
  assert(brusState.minHeight >= 44, `${viewport.name}: Brusy volby jsou moc nízké (${brusState.minHeight}px)`);
  assert(Math.abs(brusState.minHeight - frezkyState.minPresetHeight) <= 2, `${viewport.name}: Brusy volby (${brusState.minHeight}px) nesedí k Frézky presetům (${frezkyState.minPresetHeight}px); debug ${JSON.stringify(brusState)}`);

  await clickAndWait(client, 'games', '#games.page.active');
  const gamesState = await evalInPage(client, `(() => ({
    tiles: document.querySelectorAll('#gamesGrid .gamesLaunchTile, #gamesGrid .calcTile').length,
    hasStage: Boolean(document.querySelector('#gamesStage'))
  }))()`);
  assert(gamesState.tiles >= 4 && gamesState.hasStage, `${viewport.name}: Hry nenaběhly`);

  await clickAndWait(client, 'menu', '#menu.page.active');
  const menuState = await evalInPage(client, `(() => ({
    exists: Boolean(document.querySelector('#menu.page.active')),
    text: (document.querySelector('#menu') && document.querySelector('#menu').textContent || '').slice(0, 300)
  }))()`);
  assert(menuState.exists && /Nastavení|O aplikaci|Administrace|Více/.test(menuState.text), `${viewport.name}: Menu/Více nenaběhlo`);

  const fatalConsoleErrors = consoleErrors.filter((msg) => /Uncaught|Nepodařilo se načíst aplikační skripty|TypeError|ReferenceError|SyntaxError/i.test(msg));
  assert(runtimeExceptions.length === 0, `${viewport.name}: runtime exceptions: ${runtimeExceptions.join(' | ')}`);
  assert(fatalConsoleErrors.length === 0, `${viewport.name}: fatal console errors: ${fatalConsoleErrors.join(' | ')}`);

  await client.close();
  await fetch(`http://127.0.0.1:${cdpPort}/json/close/${target.id}`).catch(() => {});
  return {
    viewport: viewport.name,
    ok: true,
    appVersion: bootState.appVersion,
    homeCards: bootState.homeCards,
    rotationExport: exportState,
    rotationGenerator: generatorState,
    rotationGeneratorWizard: wizardRunState,
    brusChoiceHeight: { min: brusState.minHeight, max: brusState.maxHeight },
    gamesTiles: gamesState.tiles,
    consoleErrorCount: consoleErrors.length,
    runtimeExceptionCount: runtimeExceptions.length
  };
}

async function main() {
  assert(fs.existsSync(CHROMIUM_BIN), `Chromium není dostupný: ${CHROMIUM_BIN}`);
  const appPort = await getFreePort();
  const cdpPort = await getFreePort();
  const server = createStaticServer(ROOT_DIR);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(appPort, '127.0.0.1', resolve);
  });
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rak-browser-smoke-'));
  const chrome = spawn(CHROMIUM_BIN, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-sync',
    '--no-first-run',
    '--no-proxy-server',
    '--proxy-bypass-list=*',
    '--no-default-browser-check',
    `--user-data-dir=${userDataDir}`,
    `--remote-debugging-port=${cdpPort}`,
    'about:blank'
  ], { stdio: ['ignore', 'pipe', 'pipe'] });
  let chromeLog = '';
  chrome.stderr.on('data', chunk => { chromeLog += String(chunk); });
  chrome.stdout.on('data', chunk => { chromeLog += String(chunk); });

  try {
    await waitForBrowser(cdpPort);
    const inlineHtml = buildInlineSmokeHtml();
    const results = [];
    for (const viewport of VIEWPORTS) {
      results.push(await runViewportSmoke(cdpPort, viewport, inlineHtml));
    }
    console.log(JSON.stringify({ ok: true, mode: 'browser-smoke-v1103', chromium: CHROMIUM_BIN, loadMode: 'about-blank-inline-html', results }, null, 2));
  } finally {
    server.close();
    if (!chrome.killed) chrome.kill('SIGTERM');
    await new Promise(resolve => {
      const done = () => resolve();
      chrome.once('exit', done);
      setTimeout(() => {
        if (!chrome.killed) chrome.kill('SIGKILL');
        resolve();
      }, 1800).unref();
    });
    for (let attempt = 0; attempt < 4; attempt += 1) {
      try {
        fs.rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 120 });
        break;
      } catch (err) {
        if (attempt === 3) throw err;
        await new Promise(resolve => setTimeout(resolve, 160));
      }
    }
    if (process.env.RAK_BROWSER_SMOKE_DEBUG_LOG === '1' && chromeLog.trim()) {
      console.error(chromeLog.trim());
    }
  }
}

main().catch((err) => {
  console.error(JSON.stringify({ ok: false, mode: 'browser-smoke-v1103', error: err && err.stack || String(err) }, null, 2));
  process.exit(1);
});
