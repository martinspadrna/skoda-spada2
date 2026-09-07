// RaK v1.5.16 – těžké exportní knihovny se načtou až při skutečném použití.
(function installRakExternalDependencyLoader() {
  'use strict';

  const DEPENDENCIES = Object.freeze({
    xlsx: Object.freeze({
      global: 'XLSX',
      src: 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
      integrity: 'sha384-vtjasyidUo0kW94K5MXDXntzOJpQgBKXmE7e2Ga4LG0skTTLeBi97eFAXsqewJjw'
    }),
    jszip: Object.freeze({
      global: 'JSZip',
      src: 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',
      integrity: 'sha384-+mbV2IY1Zk/X1p/nWllGySJSUN8uMs+gUAN10Or95UBH0fpj6GfKgPmgC5EXieXG'
    })
  });
  const pending = new Map();
  const replayGuard = new WeakSet();

  function mark(name, status, src) {
    try { if (typeof window.rakNoteExternalDependency === 'function') window.rakNoteExternalDependency(name, status, src); } catch (_) {}
  }

  function ready(name) {
    const dep = DEPENDENCIES[name];
    return !!(dep && window[dep.global]);
  }

  function ensure(name) {
    const dep = DEPENDENCIES[name];
    if (!dep) return Promise.reject(new Error('Neznámá závislost: ' + name));
    if (ready(name)) return Promise.resolve(window[dep.global]);
    if (pending.has(name)) return pending.get(name);

    const promise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-rak-external-dep="' + name + '"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(window[dep.global]), { once:true });
        existing.addEventListener('error', () => reject(new Error('Knihovna ' + name + ' se nenačetla.')), { once:true });
        return;
      }
      const script = document.createElement('script');
      script.src = dep.src;
      script.integrity = dep.integrity;
      script.crossOrigin = 'anonymous';
      script.async = true;
      script.dataset.rakExternalDep = name;
      mark(name, 'loading', dep.src);
      script.onload = () => {
        if (!ready(name)) {
          mark(name, 'failed', dep.src);
          reject(new Error('Knihovna ' + name + ' se načetla bez očekávaného API.'));
          return;
        }
        mark(name, 'loaded', dep.src);
        resolve(window[dep.global]);
      };
      script.onerror = () => {
        mark(name, 'failed', dep.src);
        reject(new Error('Knihovna ' + name + ' se nepodařila stáhnout.'));
      };
      document.head.appendChild(script);
    }).finally(() => pending.delete(name));
    pending.set(name, promise);
    return promise;
  }

  async function ensureMany(names) {
    return Promise.all(Array.from(new Set(names)).map(ensure));
  }

  function neededForElement(el) {
    if (!el) return [];
    const haystack = [
      el.id,
      el.getAttribute && el.getAttribute('data-action'),
      el.getAttribute && el.getAttribute('data-menu-action'),
      el.getAttribute && el.getAttribute('data-admin-action'),
      el.getAttribute && el.getAttribute('data-rotation-action'),
      el.textContent
    ].map((value) => String(value || '').toLowerCase()).join(' ');

    const needs = [];
    if (/excel|xlsx|import/.test(haystack) || el.id === 'importBtn') needs.push('xlsx');
    if (/zip|zdroj|záloh.*aplik|backup.*app/.test(haystack) || el.id === 'exportBtn') needs.push('jszip');
    return needs;
  }

  function showError(error) {
    const message = error && error.message ? error.message : 'Exportní knihovnu se nepodařilo načíst.';
    try {
      if (typeof window.showToast === 'function') window.showToast(message);
      else alert(message);
    } catch (_) {}
  }

  // U klikacích akcí knihovnu načteme v capture fázi a původní klik zopakujeme až poté.
  document.addEventListener('click', (event) => {
    const target = event.target && event.target.closest ? event.target.closest('button,a,[data-action],[data-menu-action],[data-admin-action]') : null;
    if (!target || replayGuard.has(target)) return;
    const needs = neededForElement(target).filter((name) => !ready(name));
    if (!needs.length) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    target.disabled = true;
    void ensureMany(needs).then(() => {
      replayGuard.add(target);
      try { target.click(); }
      finally { setTimeout(() => replayGuard.delete(target), 0); }
    }).catch(showError).finally(() => { target.disabled = false; });
  }, true);

  // Import souboru může být spuštěný i přímou změnou hidden file inputu.
  document.addEventListener('change', (event) => {
    const input = event.target;
    if (!input || input.id !== 'excelFile' || ready('xlsx') || input.dataset.rakXlsxReplay === '1') return;
    event.stopPropagation();
    event.stopImmediatePropagation();
    void ensure('xlsx').then(() => {
      input.dataset.rakXlsxReplay = '1';
      try { input.dispatchEvent(new Event('change', { bubbles:true })); }
      finally { delete input.dataset.rakXlsxReplay; }
    }).catch(showError);
  }, true);

  window.ensureRakExternalDependency = ensure;
  window.ensureRakExternalDependencies = ensureMany;
  window.getRakExternalDependencyStatus = function () {
    return {
      xlsx: ready('xlsx') ? 'ready' : (pending.has('xlsx') ? 'loading' : 'idle'),
      jszip: ready('jszip') ? 'ready' : (pending.has('jszip') ? 'loading' : 'idle')
    };
  };
})();
