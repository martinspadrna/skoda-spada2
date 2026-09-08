#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(root, 'qr.js');
const runtimePath = path.join(root, 'qr-runtime.generated.js');
const dataPath = path.join(root, 'qr-data.generated.js');
const source = fs.readFileSync(sourcePath, 'utf8');
const lines = source.split('\n');

if (lines.length < 3 || !/^const\s+PERSON_QR_CODES\s*=/.test(lines[1] || '')) {
  throw new Error('qr.js nemá očekávaný PERSON_QR_CODES na druhém řádku');
}

const dataLine = lines[1];
let runtime = [lines[0], ...lines.slice(2)].join('\n');

runtime = runtime.replace(
  'return PERSON_QR_CODES[normalizePersonQrKey(name)] || null;',
  'return (window.PERSON_QR_CODES || {})[normalizePersonQrKey(name)] || null;'
);

runtime = runtime.replace(
  'function showPersonQrModal(name) {',
  `async function showPersonQrModal(name) {\n  try {\n    await ensurePersonQrDataLoaded();\n  } catch (err) {\n    console.warn('RaK QR data se nepodařilo načíst', err);\n    alert('QR kódy se nepodařilo načíst. Zkus to prosím znovu.');\n    return;\n  }`
);

const lazyLoader = `\n// QR SVG data jsou záměrně mimo kritický start aplikace.\nlet __rakPersonQrDataPromise = null;\nfunction ensurePersonQrDataLoaded() {\n  if (window.PERSON_QR_CODES && Object.keys(window.PERSON_QR_CODES).length) {\n    return Promise.resolve(window.PERSON_QR_CODES);\n  }\n  if (__rakPersonQrDataPromise) return __rakPersonQrDataPromise;\n  __rakPersonQrDataPromise = new Promise((resolve, reject) => {\n    const existing = document.querySelector('script[data-rak-qr-data]');\n    if (existing) {\n      existing.addEventListener('load', () => resolve(window.PERSON_QR_CODES || {}), { once: true });\n      existing.addEventListener('error', () => reject(new Error('qr-data.generated.js load failed')), { once: true });\n      return;\n    }\n    const script = document.createElement('script');\n    script.src = 'qr-data.generated.js?v=' + encodeURIComponent(String(window.RAK_PWA_BUILD || window.APP_VERSION || '1.5'));\n    script.async = true;\n    script.dataset.rakQrData = '1';\n    script.onload = () => resolve(window.PERSON_QR_CODES || {});\n    script.onerror = () => {\n      __rakPersonQrDataPromise = null;\n      reject(new Error('qr-data.generated.js load failed'));\n    };\n    document.head.appendChild(script);\n  });\n  return __rakPersonQrDataPromise;\n}\nif (typeof window !== 'undefined') window.ensurePersonQrDataLoaded = ensurePersonQrDataLoaded;\n`;

runtime = runtime.replace(lines[0], lines[0] + lazyLoader);

const data = [
  '// Generated from qr.js by tools/split-qr-runtime.mjs. Do not edit manually.',
  dataLine.replace(/^const\s+PERSON_QR_CODES\s*=/, 'window.PERSON_QR_CODES =')
].join('\n') + '\n';

fs.writeFileSync(runtimePath, runtime, 'utf8');
fs.writeFileSync(dataPath, data, 'utf8');

const originalBytes = Buffer.byteLength(source);
const runtimeBytes = Buffer.byteLength(runtime);
const dataBytes = Buffer.byteLength(data);
console.log(`[split-qr-runtime] qr.js ${originalBytes} B -> runtime ${runtimeBytes} B + lazy data ${dataBytes} B`);
