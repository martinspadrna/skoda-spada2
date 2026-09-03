// RaK DEV – animated personal-number login splash.
// Uses the existing RaK app icon as the canonical logo asset; no replacement logo is generated.
(function installRakLoginSplashModule() {
  const STYLE_ID = 'rak-login-splash-style-v2';
  const OVERLAY_ID = 'rakUserLoginOverlay';
  const LOGO_SRC = 'assets/app-icons/icon-1024.png';
  let installed = false;

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${OVERLAY_ID}.rakLoginSplash{
        position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;
        overflow:auto;padding:clamp(24px,5vh,54px) 20px calc(24px + env(safe-area-inset-bottom));
        box-sizing:border-box;background:#050a0a;color:#eef7ff;
        font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        opacity:1;transform:none;
      }
      #${OVERLAY_ID}.rakLoginSplash.rakLoginSplashLeaving{pointer-events:none;animation:rakSplashFadeOut .95s ease forwards}
      #${OVERLAY_ID}.rakLoginSplash.rakLoginSplashError .rakSplashPanel{animation:rakLoginPanelShake .46s cubic-bezier(.36,.07,.19,.97)}
      .rakSplashInner{width:min(460px,100%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;text-align:center}
      .rakSplashLogoStage{position:relative;width:min(72vw,300px);aspect-ratio:1;display:grid;place-items:center;filter:drop-shadow(0 0 16px rgba(124,255,124,.22))}
      .rakSplashLogoWrap{position:relative;width:100%;height:100%;display:grid;place-items:center;animation:rakCrabFloat 3.8s ease-in-out infinite;transform-origin:center bottom}
      .rakSplashLogo,.rakSplashLogoHalf{position:absolute;width:100%;height:100%;object-fit:contain;display:block}
      .rakSplashLogo{animation:rakCrabGlow 2.7s ease-in-out infinite}
      .rakSplashLogoHalf{opacity:0;pointer-events:none}
      .rakSplashLogoHalf--left{clip-path:inset(0 50% 0 0)}
      .rakSplashLogoHalf--right{clip-path:inset(0 0 0 50%)}
      .rakSplashLogoStage.rakSplashError .rakSplashLogoWrap{animation:rakCrabReject .62s cubic-bezier(.36,.07,.19,.97)}
      .rakSplashLogoStage.rakSplashError .rakSplashLogo{animation:rakCrabErrorGlow .62s ease-in-out}
      .rakSplashLogoStage.rakSplashSuccess .rakSplashLogo{animation:rakCrabSuccess .55s ease-in-out forwards}
      .rakSplashLogoStage.rakSplashSplitting .rakSplashLogo{opacity:0}
      .rakSplashLogoStage.rakSplashSplitting .rakSplashLogoHalf{opacity:1}
      .rakSplashLogoStage.rakSplashSplitting .rakSplashLogoHalf--left{animation:rakCrabSplitLeft .82s cubic-bezier(.2,.8,.2,1) forwards}
      .rakSplashLogoStage.rakSplashSplitting .rakSplashLogoHalf--right{animation:rakCrabSplitRight .82s cubic-bezier(.2,.8,.2,1) forwards}
      .rakSplashClawTear{position:absolute;left:50%;top:48%;width:5px;height:0;border-radius:99px;background:#c8ffc8;box-shadow:0 0 8px #7cff7c,0 0 22px #7cff7c;opacity:0;transform:translate(-50%,-50%) rotate(-12deg);pointer-events:none}
      .rakSplashClawTear::before,.rakSplashClawTear::after{content:"";position:absolute;left:50%;top:0;width:3px;height:0;border-radius:99px;background:#7cff7c;box-shadow:0 0 10px #7cff7c}
      .rakSplashClawTear::before{transform:translateX(-50%) rotate(28deg);transform-origin:top center}
      .rakSplashClawTear::after{transform:translateX(-50%) rotate(-28deg);transform-origin:top center}
      .rakSplashLogoStage.rakSplashSplitting .rakSplashClawTear{animation:rakClawTear .52s ease-out forwards}
      .rakSplashLogoStage.rakSplashError .rakSplashClawTear{animation:rakClawRefuse .55s ease-out forwards}
      .rakSplashTitle{margin:0;font-size:27px;line-height:1.1;letter-spacing:-.02em}
      .rakSplashText{margin:8px 0 18px;font-size:14px;line-height:1.45;opacity:.72}
      .rakSplashPanel{width:min(420px,100%);box-sizing:border-box;padding:22px;border:1px solid rgba(124,255,124,.18);border-radius:24px;background:linear-gradient(180deg,rgba(16,28,27,.94),rgba(8,16,16,.97));box-shadow:0 24px 80px rgba(0,0,0,.48),0 0 40px rgba(124,255,124,.05)}
      .rakSplashLabel{display:block;text-align:left;margin:0 0 7px;font-size:13px;font-weight:750}
      .rakSplashInput{width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.15);border-radius:14px;background:#050c0c;color:#fff;padding:14px 15px;font-size:19px;outline:none;letter-spacing:.04em}
      .rakSplashInput::placeholder{color:rgba(255,255,255,.32);letter-spacing:.01em}
      .rakSplashInput:focus{border-color:rgba(124,255,124,.72);box-shadow:0 0 0 4px rgba(124,255,124,.09)}
      .rakSplashStatus{min-height:20px;margin-top:9px;font-size:13px;line-height:1.35;opacity:.72;text-align:left}
      .rakSplashStatus.isError{color:#ffbaba;opacity:1}
      .rakSplashButton{width:100%;margin-top:12px;border:0;border-radius:14px;padding:14px 16px;background:#7cff7c;color:#071009;font-size:15px;font-weight:850;cursor:pointer;box-shadow:0 8px 26px rgba(124,255,124,.14);transition:transform .16s ease,box-shadow .16s ease,opacity .16s ease}
      .rakSplashButton:active{transform:scale(.985)}
      .rakSplashButton:disabled{opacity:.55;cursor:wait}
      .rakSplashPrivacy{margin-top:11px;font-size:10.5px;line-height:1.4;opacity:.4}
      @keyframes rakCrabFloat{0%,100%{transform:translateY(0) rotate(0deg) scale(1)}25%{transform:translateY(-5px) rotate(-1deg) scale(1.008)}50%{transform:translateY(1px) rotate(.7deg) scale(1)}75%{transform:translateY(-3px) rotate(-.6deg) scale(1.006)}}
      @keyframes rakCrabGlow{0%,100%{filter:drop-shadow(0 0 7px rgba(124,255,124,.18))}50%{filter:drop-shadow(0 0 23px rgba(124,255,124,.48))}}
      @keyframes rakCrabReject{0%,100%{transform:translateX(0) rotate(0)}12%{transform:translateX(-8px) rotate(-2deg)}28%{transform:translateX(9px) rotate(2deg)}44%{transform:translateX(-7px) rotate(-1.7deg)}60%{transform:translateX(6px) rotate(1.4deg)}76%{transform:translateX(-3px) rotate(-.7deg)}}
      @keyframes rakCrabErrorGlow{0%,100%{filter:drop-shadow(0 0 7px rgba(124,255,124,.18))}20%{filter:drop-shadow(0 0 30px rgba(255,100,100,.8))}38%{filter:drop-shadow(0 0 5px rgba(124,255,124,.08))}55%{filter:drop-shadow(0 0 24px rgba(255,100,100,.55))}}
      @keyframes rakLoginPanelShake{0%,100%{transform:translateX(0)}15%{transform:translateX(-7px)}30%{transform:translateX(7px)}45%{transform:translateX(-5px)}60%{transform:translateX(5px)}75%{transform:translateX(-2px)}}
      @keyframes rakCrabSuccess{0%{transform:scale(1) rotate(0)}45%{transform:scale(1.08) rotate(-2deg);filter:drop-shadow(0 0 30px rgba(124,255,124,.7))}100%{transform:scale(1.02) rotate(0);filter:drop-shadow(0 0 14px rgba(124,255,124,.25))}}
      @keyframes rakCrabSplitLeft{0%{transform:translateX(0) rotate(0);opacity:1}100%{transform:translateX(-115%) rotate(-5deg);opacity:0}}
      @keyframes rakCrabSplitRight{0%{transform:translateX(0) rotate(0);opacity:1}100%{transform:translateX(115%) rotate(5deg);opacity:0}}
      @keyframes rakClawTear{0%{height:0;opacity:0}22%{height:30px;opacity:1}100%{height:120px;opacity:0;transform:translate(-50%,-50%) rotate(-12deg) scaleX(1.5)}}
      @keyframes rakClawRefuse{0%{height:0;opacity:0}30%{height:52px;opacity:.9}100%{height:72px;opacity:0;transform:translate(-50%,-50%) rotate(8deg)}}
      @keyframes rakSplashFadeOut{0%{opacity:1}100%{opacity:0}}
      @media (prefers-reduced-motion:reduce){.rakSplashLogoWrap,.rakSplashLogo,.rakSplashPanel{animation:none!important}.rakSplashLogoStage.rakSplashSplitting .rakSplashLogoHalf{animation:none!important;opacity:0!important}.rakLoginSplashLeaving{animation:none!important;opacity:0!important}}
      @media (max-height:680px){.rakSplashLogoStage{width:min(52vw,190px)}.rakSplashInner{gap:10px}.rakSplashPanel{padding:17px}.rakSplashTitle{font-size:23px}.rakSplashText{margin-bottom:12px}}
    `;
    document.head.appendChild(style);
  }

  function buildOverlay() {
    let overlay = document.getElementById(OVERLAY_ID);
    if (overlay) overlay.remove();
    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.className = 'rakLoginSplash';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
      <div class="rakSplashInner">
        <div class="rakSplashLogoStage" id="rakSplashLogoStage" aria-hidden="true">
          <div class="rakSplashLogoWrap">
            <img class="rakSplashLogo" src="${LOGO_SRC}" alt="">
            <img class="rakSplashLogoHalf rakSplashLogoHalf--left" src="${LOGO_SRC}" alt="">
            <img class="rakSplashLogoHalf rakSplashLogoHalf--right" src="${LOGO_SRC}" alt="">
            <span class="rakSplashClawTear" aria-hidden="true"></span>
          </div>
        </div>
        <div class="rakSplashPanel">
          <h2 class="rakSplashTitle">Přihlášení</h2>
          <p class="rakSplashText">Zadej poslední 4 čísla svého osobního čísla.</p>
          <label class="rakSplashLabel" for="rakUserLoginAccountNumber">Poslední 4 čísla OS</label>
          <input class="rakSplashInput" id="rakUserLoginAccountNumber" inputmode="numeric" autocomplete="off" maxlength="4" minlength="4" placeholder="Poslední 4 čísla OS">
          <div class="rakSplashStatus" id="rakUserLoginStatus" aria-live="polite"></div>
          <button class="rakSplashButton" id="rakUserLoginSubmit" type="button">Přihlásit do RaK</button>
          <div class="rakSplashPrivacy">RaK použije poslední 4 čísla pouze k nalezení odpovídajícího účtu.</div>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    const input = overlay.querySelector('#rakUserLoginAccountNumber');
    const submit = overlay.querySelector('#rakUserLoginSubmit');
    if (input) input.addEventListener('input', () => { input.value = input.value.replace(/\D/g, '').slice(0, 4); });
    if (input) input.addEventListener('keydown', (event) => { if (event.key === 'Enter' && submit) submit.click(); });
    if (input) setTimeout(() => { try { input.focus(); } catch (err) {} }, 120);
    if (submit) submit.addEventListener('click', () => { void submitLogin(); });
    return overlay;
  }

  function setStatus(message, isError) {
    const status = document.getElementById('rakUserLoginStatus');
    if (!status) return;
    status.textContent = String(message || '');
    status.classList.toggle('isError', !!isError);
  }

  async function submitLogin() {
    const overlay = document.getElementById(OVERLAY_ID);
    const input = overlay && overlay.querySelector('#rakUserLoginAccountNumber');
    const submit = overlay && overlay.querySelector('#rakUserLoginSubmit');
    const stage = document.getElementById('rakSplashLogoStage');
    const raw = String(input && input.value || '').trim();
    const accountNumber = raw.replace(/\D/g, '');
    if (!/^\d{4}$/.test(accountNumber)) {
      if (stage) stage.classList.remove('rakSplashError');
      void stage?.offsetWidth;
      if (stage) stage.classList.add('rakSplashError');
      if (overlay) overlay.classList.add('rakLoginSplashError');
      setStatus('Zadej přesně poslední 4 čísla osobního čísla.', true);
      return;
    }
    if (submit) submit.disabled = true;
    if (stage) stage.classList.remove('rakSplashError');
    if (overlay) overlay.classList.remove('rakLoginSplashError');
    setStatus('Ověřuji osobní číslo…', false);
    try {
      if (typeof rakUserProfileLookup !== 'function') throw new Error('lookup unavailable');
      const result = await rakUserProfileLookup(accountNumber);
      if (!result || !result.ok) {
        if (stage) { stage.classList.remove('rakSplashError'); void stage.offsetWidth; stage.classList.add('rakSplashError'); }
        if (overlay) { overlay.classList.remove('rakLoginSplashError'); void overlay.offsetWidth; overlay.classList.add('rakLoginSplashError'); }
        setStatus(result && result.reason === 'not-found' ? 'Tahle poslední 4 čísla nebyla nalezena.' : result && result.reason === 'ambiguous' ? 'Tahle poslední 4 čísla nejsou jednoznačná. Obrať se na správce.' : 'Účet se teď nepodařilo ověřit. Zkus to prosím znovu.', true);
        return;
      }
      if (typeof rakUserProfileWrite === 'function') rakUserProfileWrite(result);
      if (typeof rakUserProfileApplyToRuntime === 'function') rakUserProfileApplyToRuntime(result);
      if (stage) {
        stage.classList.add('rakSplashSuccess');
        setTimeout(() => stage.classList.add('rakSplashSplitting'), 360);
      }
      setStatus('Hotovo. Vítej v RaK.', false);
      if (submit) submit.textContent = 'Vstupuji…';
      setTimeout(() => {
        const current = document.getElementById(OVERLAY_ID);
        if (!current) return;
        current.classList.add('rakLoginSplashLeaving');
        setTimeout(() => {
          const latest = document.getElementById(OVERLAY_ID);
          if (latest) latest.remove();
          if (typeof rakUserProfileRefreshMenu === 'function') rakUserProfileRefreshMenu();
          try { if (typeof forceHomeRefresh === 'function') forceHomeRefresh(); } catch (err) {}
        }, 850);
      }, 760);
    } catch (err) {
      if (stage) { stage.classList.remove('rakSplashError'); void stage.offsetWidth; stage.classList.add('rakSplashError'); }
      if (overlay) { overlay.classList.remove('rakLoginSplashError'); void overlay.offsetWidth; overlay.classList.add('rakLoginSplashError'); }
      setStatus('Účet se teď nepodařilo ověřit. Zkus to prosím znovu.', true);
    } finally {
      if (submit && !submit.textContent.includes('Vstupuji')) submit.disabled = false;
    }
  }

  function install() {
    if (installed) return;
    installed = true;
    ensureStyle();
    if (typeof rakUserProfileGet !== 'function' || rakUserProfileGet()) return;
    buildOverlay();
  }

  window.installRakLoginSplash = install;
})();
