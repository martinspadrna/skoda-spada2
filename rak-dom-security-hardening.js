// RaK 1.2 (1.100) – DOM/security hardening read-only návrhy.
(function setupRakDomSecurityHardening() {
  const started = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  const VERSION = '1.2 (1.100)';
  const MODE = 'dom-security-hardening-readonly-v923';

  try {
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-dom-security-hardening.js', 'loading', { source: 'index' });
    }
  } catch (err) {}

  function nowIso() {
    try { return new Date().toISOString(); } catch (err) { return ''; }
  }

  function safeString(value, fallback) {
    try {
      const text = String(value ?? '').trim();
      return text || String(fallback || '');
    } catch (err) {
      return String(fallback || '');
    }
  }

  function readDiag(alias, fallbackGlobalName) {
    try {
      if (window.RaK && window.RaK.diagnostics && typeof window.RaK.diagnostics.readWithFallback === 'function') {
        const value = window.RaK.diagnostics.readWithFallback(alias, fallbackGlobalName);
        if (value) return value;
      }
    } catch (err) {}
    try {
      if (window.RaK && window.RaK.diagnostics && typeof window.RaK.diagnostics.read === 'function') {
        const value = window.RaK.diagnostics.read(alias);
        if (value) return value;
      }
    } catch (err) {}
    try {
      const fn = window[String(fallbackGlobalName || '')];
      return typeof fn === 'function' ? fn() : null;
    } catch (err) {
      return { ok: false, error: safeString(err && err.message ? err.message : err, 'diag error') };
    }
  }

  function getDomSurface() {
    return readDiag('appSecDomSurface', 'getRakAppSecDomInjectionSurfaceHealth') || { staticInventory: [] };
  }

  function getAppSecClosure() {
    return readDiag('appSecPrivacyClosure', 'getRakAppSecPrivacyClosureHealth') || null;
  }

  const SAFE_HELPER_POLICY = [
    {
      id: 'dom-helper-text',
      helper: 'textContent / createTextNode',
      when: 'Všechny nové jednoduché textové výstupy, jména, stroje, měsíce, procenta a stavové hlášky.',
      rule: 'Nepoužívat innerHTML pro čistý text. Text patří do textContent.',
      regressionRisk: 'low',
      verify: 'DOM smoke + otevření stránky s diakritikou a speciálními znaky.'
    },
    {
      id: 'dom-helper-html-template',
      helper: 'escapeHtml() + kontrolovaný template',
      when: 'Stávající větší šablony, které se teď hromadně skládají jako HTML.',
      rule: 'Neměnit hromadně. Každý dynamický segment musí projít escapeHtml nebo whitelist formatterem.',
      regressionRisk: 'medium',
      verify: 'Regression test pro jméno/stroj/report se znaky < > & " \' a běžný mobilní průchod.'
    },
    {
      id: 'dom-helper-url',
      helper: 'safe URL allowlist',
      when: 'href/src/window.open a externí odkazy.',
      rule: 'Povolit jen známé https cíle a interní relativní URL; doplnit noopener,noreferrer.',
      regressionRisk: 'medium',
      verify: 'Klik ePortal/jídelníček/export a kontrola, že se neotevírá neznámý protokol.'
    },
    {
      id: 'dom-helper-event',
      helper: 'data-action registry',
      when: 'Nové klikací prvky v UI.',
      rule: 'Nepřidávat inline onclick. Nové akce jdou přes existující data-action/handler vrstvu.',
      regressionRisk: 'low',
      verify: 'DOM/action registry smoke bez duplicitních handlerů.'
    }
  ];

  const HARDENING_CANDIDATES = [
    {
      id: 'DOM-HARDEN-001',
      file: 'stats.js',
      area: 'Statistiky / grafy / tooltipy',
      currentRisk: 'Dynamické hodnoty jsou relativně malé, ale grafy a legendy generují HTML.',
      smallestSafeStep: 'Při další změně statistik převést popisky bodů a legendu na textContent nebo explicitní escapeHtml helper.',
      priority: 'P2',
      regressionRisk: 'low',
      verify: 'Otevřít statistiky, změnit rok, kliknout na bod obsazenosti a zkontrolovat měsíc/procento.'
    },
    {
      id: 'DOM-HARDEN-002',
      file: 'games-arcade.js',
      area: 'Herní obrazovky / score / leaderboard',
      currentRisk: 'Největší počet innerHTML a insertAdjacentHTML sinků, část z nich zobrazuje jména hráčů.',
      smallestSafeStep: 'Nejdřív izolovat render jména/skóre do jednoho escape formatteru; neměnit celé herní šablony naráz.',
      priority: 'P1-review',
      regressionRisk: 'medium',
      verify: 'Top score, profil, Piškvorky AI, online Piškvorky a Lodě na mobilu.'
    },
    {
      id: 'DOM-HARDEN-003',
      file: 'ui.js',
      area: 'Hlavní UI / modaly / diagnostika',
      currentRisk: 'Velké centrální renderovací místo s více HTML šablonami.',
      smallestSafeStep: 'Nové diagnostické řádky přidávat přes textContent nebo přes escapeHtml pro hodnoty z runtime.',
      priority: 'P2',
      regressionRisk: 'medium',
      verify: 'Diagnostika, nastavení, profil, report chyby a navigace.'
    },
    {
      id: 'DOM-HARDEN-004',
      file: 'qr.js',
      area: 'QR / sdílení / modaly',
      currentRisk: 'QR modal pracuje s payloady, které se kopírují a zobrazují.',
      smallestSafeStep: 'Před úpravou QR přidat safeText/safeUrl wrapper pro každé zobrazení payloadu.',
      priority: 'P2',
      regressionRisk: 'medium',
      verify: 'QR karta, zobrazení, zavření modalu, kopírování a offline režim.'
    },
    {
      id: 'DOM-HARDEN-005',
      file: 'dashboard.js',
      area: 'Externí odkazy / ePortal / jídelníček',
      currentRisk: 'Nízký počet sinků, ale externí odkazy jsou bezpečnostně citlivější než text.',
      smallestSafeStep: 'Při další úpravě dashboardu držet allowlist URL a vynutit rel=noopener noreferrer.',
      priority: 'P2',
      regressionRisk: 'low',
      verify: 'Klik na ePortal, jídelníček, kantýna/jídelna detail a nedělní přesčas guard.'
    }
  ];

  function summarizeSurface(surface) {
    const inventory = Array.isArray(surface && surface.staticInventory) ? surface.staticInventory : [];
    const byFile = inventory.reduce((acc, item) => {
      const file = safeString(item && item.file, 'unknown');
      acc[file] = (acc[file] || 0) + Number(item && item.count || 0);
      return acc;
    }, {});
    return {
      ok: !!(surface && surface.ok !== false),
      staticSinkCount: Number(surface && surface.staticSinkCount || 0),
      targetBlankWithoutNoopener: Number(surface && surface.targetBlankWithoutNoopener || 0),
      inlineScriptCount: Number(surface && surface.inlineScriptCount || 0),
      byFile,
      topFiles: Object.keys(byFile).sort((a, b) => byFile[b] - byFile[a]).slice(0, 5).map(file => ({ file, sinkCount: byFile[file] }))
    };
  }

  window.getRakDomSafeHelperPolicy = function getRakDomSafeHelperPolicy() {
    return {
      ok: true,
      mode: 'dom-safe-helper-policy-v923',
      version: safeString(window.APP_VERSION || VERSION),
      checkedAt: nowIso(),
      readOnly: true,
      noMutation: true,
      helperCount: SAFE_HELPER_POLICY.length,
      helpers: SAFE_HELPER_POLICY,
      rule: 'Tato vrstva jen popisuje bezpečné použití helperů. Nepřepisuje DOM, nehookuje sinky a nemění render.'
    };
  };

  window.getRakDomSecurityHardeningPlan = function getRakDomSecurityHardeningPlan() {
    const surface = getDomSurface();
    const summary = summarizeSurface(surface);
    return {
      ok: true,
      mode: MODE,
      version: safeString(window.APP_VERSION || VERSION),
      checkedAt: nowIso(),
      readOnly: true,
      noMutation: true,
      source: 'appsec-dom-surface + ruční priorita po souborech',
      staticSinkCount: summary.staticSinkCount,
      targetBlankWithoutNoopener: summary.targetBlankWithoutNoopener,
      inlineScriptCount: summary.inlineScriptCount,
      topFiles: summary.topFiles,
      candidateCount: HARDENING_CANDIDATES.length,
      p1ReviewCount: HARDENING_CANDIDATES.filter(item => /^P1/.test(item.priority)).length,
      candidates: HARDENING_CANDIDATES,
      nextSafeStep: 'Nejdřív games-arcade.js jen na formattery jmen/skóre; žádný hromadný rewrite šablon.'
    };
  };

  window.getRakDomSecurityHardeningClosureHealth = function getRakDomSecurityHardeningClosureHealth() {
    const plan = window.getRakDomSecurityHardeningPlan();
    const policy = window.getRakDomSafeHelperPolicy();
    const appSecClosure = getAppSecClosure();
    const elapsedMs = Math.round(((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()) - started);
    return {
      ok: !!(plan && policy && plan.ok && policy.ok),
      mode: 'dom-security-hardening-closure-v923',
      version: safeString(window.APP_VERSION || VERSION),
      checkedAt: nowIso(),
      phase: 'phase L DOM/security hardening plan',
      phasePercent: 100,
      readOnly: true,
      noMutation: true,
      dbSchemaChanges: false,
      policyChanges: false,
      onlineFlowChanges: false,
      renderChanges: false,
      appSecClosureOk: !!(appSecClosure && appSecClosure.ok),
      candidateCount: Number(plan && plan.candidateCount || 0),
      p1ReviewCount: Number(plan && plan.p1ReviewCount || 0),
      helperCount: Number(policy && policy.helperCount || 0),
      elapsedMs,
      nextStep: 'Další bezpečný krok: vybrat jednu konkrétní sink skupinu, ideálně jména/skóre v games-arcade.js, a převést ji na escape/text helper s regresním testem.'
    };
  };

  try {
    if (window.RaK && window.RaK.diagnostics && typeof window.RaK.diagnostics.register === 'function') {
      window.RaK.diagnostics.register('domSafeHelperPolicy', window.getRakDomSafeHelperPolicy);
      window.RaK.diagnostics.register('domSecurityHardeningPlan', window.getRakDomSecurityHardeningPlan);
      window.RaK.diagnostics.register('domSecurityHardeningClosure', window.getRakDomSecurityHardeningClosureHealth);
    }
  } catch (err) {}

  try {
    const ended = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    if (typeof window.rakMarkModuleReady === 'function') {
      window.rakMarkModuleReady('rak-dom-security-hardening.js', 'loaded', { source: 'index', durationMs: Math.max(0, Math.round(ended - started)) });
    }
  } catch (err) {}
})();
