// RaK DEV – login splash v3
// Canonical RaK neon-crab logo from the repository. Visual-first login experience.
(function () {
  const OVERLAY_ID = 'rakUserLoginOverlay';
  const STYLE_ID = 'rak-login-splash-style-v3';
  const LOGO = 'assets/app-icons/icon-1024.png';
  let active = false;

  function style() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
      #${OVERLAY_ID}.rakSplash{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;overflow:hidden;background:#030707;color:#eefcf1;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      #${OVERLAY_ID}.rakSplash:before{content:"";position:absolute;inset:-20%;background:radial-gradient(circle at 50% 36%,rgba(124,255,124,.105),transparent 25%),radial-gradient(circle at 50% 60%,rgba(124,255,124,.035),transparent 45%);pointer-events:none}
      .rakSplashNoise{position:absolute;inset:0;opacity:.035;background-image:linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px);background-size:42px 42px;mask-image:linear-gradient(to bottom,transparent,#000 20%,#000 80%,transparent)}
      .rakSplashContent{position:relative;width:min(390px,calc(100vw - 36px));display:flex;flex-direction:column;align-items:center;text-align:center;gap:22px;padding:24px 0}
      .rakSplashBrand{position:relative;width:min(72vw,285px);aspect-ratio:1;display:grid;place-items:center;animation:rakFloat 4.5s ease-in-out infinite}
      .rakSplashBrand:before{content:"";position:absolute;width:72%;height:42%;border-radius:50%;background:rgba(124,255,124,.10);filter:blur(38px);animation:rakAura 3s ease-in-out infinite}
      .rakSplashLogo{position:relative;width:100%;height:100%;object-fit:contain;display:block;filter:drop-shadow(0 0 8px rgba(124,255,124,.25)) drop-shadow(0 0 30px rgba(124,255,124,.12));animation:rakGlow 3s ease-in-out infinite}
      .rakSplashBrand.error{animation:rakReject .62s cubic-bezier(.36,.07,.19,.97)}
      .rakSplashBrand.error .rakSplashLogo{animation:rakErrorGlow .62s ease-out}
      .rakSplashBrand.success .rakSplashLogo{animation:rakCharge .55s ease-in forwards}
      .rakSplashSplit{position:absolute;inset:0;pointer-events:none;opacity:0}
      .rakSplashSplit img{position:absolute;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 0 15px rgba(124,255,124,.5))}
      .rakSplashSplit .left{clip-path:inset(0 50% 0 0)}.rakSplashSplit .right{clip-path:inset(0 0 0 50%)}
      .rakSplashBrand.splitting .rakSplashLogo{opacity:0}.rakSplashBrand.splitting .rakSplashSplit{opacity:1}
      .rakSplashBrand.splitting .left{animation:rakLeft .72s cubic-bezier(.15,.8,.2,1) forwards}.rakSplashBrand.splitting .right{animation:rakRight .72s cubic-bezier(.15,.8,.2,1) forwards}
      .rakSplashCore{position:absolute;left:50%;top:50%;width:3px;height:0;background:#caffca;box-shadow:0 0 8px #7cff7c,0 0 24px #7cff7c;opacity:0;transform:translate(-50%,-50%);border-radius:10px}
      .rakSplashBrand.splitting .rakSplashCore{animation:rakCore .55s ease-out forwards}
      .rakSplashPanel{width:100%;box-sizing:border-box;padding:25px 23px 21px;border:1px solid rgba(124,255,124,.17);border-radius:26px;background:linear-gradient(145deg,rgba(15,27,24,.94),rgba(6,13,13,.97));box-shadow:0 30px 90px rgba(0,0,0,.52),inset 0 1px rgba(255,255,255,.045);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);animation:rakPanelIn .55s .08s both}
      .rakSplashPanel.error{animation:rakPanelReject .48s cubic-bezier(.36,.07,.19,.97)}
      .rakSplashHeading{margin:0;font-size:26px;line-height:1.1;letter-spacing:-.035em;font-weight:800}
      .rakSplashHint{margin:7px 0 20px;font-size:13px;line-height:1.45;color:rgba(238,252,241,.58)}
      .rakSplashInput{display:block;width:100%;height:58px;box-sizing:border-box;border:1px solid rgba(255,255,255,.13);border-radius:16px;background:rgba(0,0,0,.28);color:#f4fff5;text-align:center;font-size:26px;font-weight:750;letter-spacing:.30em;padding:0 18px 0 25px;outline:none;transition:border-color .2s,box-shadow .2s,background .2s}
      .rakSplashInput::placeholder{font-size:14px;letter-spacing:.02em;font-weight:500;color:rgba(255,255,255,.25)}
      .rakSplashInput:focus{border-color:rgba(124,255,124,.65);background:rgba(124,255,124,.035);box-shadow:0 0 0 4px rgba(124,255,124,.08),0 0 28px rgba(124,255,124,.06)}
      .rakSplashStatus{height:19px;margin-top:9px;font-size:12px;color:rgba(238,252,241,.48);line-height:19px}.rakSplashStatus.error{color:#ffaaa9}
      .rakSplashButton{width:100%;height:50px;border:0;border-radius:15px;background:#7cff7c;color:#061006;font-size:14px;font-weight:850;cursor:pointer;box-shadow:0 10px 30px rgba(124,255,124,.13);transition:transform .15s,filter .15s,box-shadow .15s}
      .rakSplashButton:hover{filter:brightness(1.04);box-shadow:0 12px 34px rgba(124,255,124,.2)}.rakSplashButton:active{transform:scale(.985)}.rakSplashButton:disabled{opacity:.55;cursor:wait}
      .rakSplashFoot{margin-top:13px;font-size:10px;color:rgba(238,252,241,.29);line-height:1.4}
      #${OVERLAY_ID}.leaving .rakSplashContent{animation:rakContentOut .62s ease forwards}#${OVERLAY_ID}.leaving{animation:rakOverlayOut .72s ease forwards}
      @keyframes rakFloat{0%,100%{transform:translateY(0) rotate(0)}25%{transform:translateY(-7px) rotate(-.7deg)}50%{transform:translateY(1px) rotate(.45deg)}75%{transform:translateY(-4px) rotate(-.35deg)}}
      @keyframes rakAura{0%,100%{transform:scale(.9);opacity:.65}50%{transform:scale(1.08);opacity:1}}
      @keyframes rakGlow{0%,100%{filter:drop-shadow(0 0 7px rgba(124,255,124,.2)) drop-shadow(0 0 25px rgba(124,255,124,.1))}50%{filter:drop-shadow(0 0 15px rgba(124,255,124,.42)) drop-shadow(0 0 42px rgba(124,255,124,.16))}}
      @keyframes rakReject{0%,100%{transform:translateX(0) rotate(0)}12%{transform:translateX(-10px) rotate(-2deg)}26%{transform:translateX(10px) rotate(2deg)}40%{transform:translateX(-8px) rotate(-1.5deg)}55%{transform:translateX(7px) rotate(1.2deg)}72%{transform:translateX(-3px)}}
      @keyframes rakErrorGlow{0%,100%{filter:drop-shadow(0 0 8px rgba(124,255,124,.18))}25%{filter:drop-shadow(0 0 32px rgba(255,80,80,.9))}48%{filter:drop-shadow(0 0 5px rgba(124,255,124,.08))}70%{filter:drop-shadow(0 0 25px rgba(255,90,90,.55))}}
      @keyframes rakPanelReject{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(2px)}}
      @keyframes rakCharge{0%{transform:scale(1)}45%{transform:scale(1.12);filter:drop-shadow(0 0 35px rgba(124,255,124,.75))}100%{transform:scale(1.02)}}
      @keyframes rakLeft{to{transform:translateX(-120%) rotate(-6deg);opacity:0}}@keyframes rakRight{to{transform:translateX(120%) rotate(6deg);opacity:0}}
      @keyframes rakCore{0%{height:0;opacity:0}25%{height:35%;opacity:1}100%{height:110%;opacity:0}}
      @keyframes rakPanelIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}@keyframes rakContentOut{to{transform:scale(1.025);opacity:0}}@keyframes rakOverlayOut{to{opacity:0}}
      @media(max-height:700px){.rakSplashContent{gap:10px}.rakSplashBrand{width:min(48vh,210px)}.rakSplashPanel{padding:18px 19px}.rakSplashHint{margin-bottom:13px}.rakSplashInput{height:52px}.rakSplashButton{height:46px}}
      @media(prefers-reduced-motion:reduce){.rakSplashBrand,.rakSplashLogo,.rakSplashPanel{animation:none!important}.rakSplashSplit{display:none!important}}
    `;
    document.head.appendChild(s);
  }

  function build() {
    const old=document.getElementById(OVERLAY_ID); if(old)old.remove();
    const overlay=document.createElement('div'); overlay.id=OVERLAY_ID; overlay.className='rakSplash'; overlay.setAttribute('role','dialog'); overlay.setAttribute('aria-modal','true');
    overlay.innerHTML=`<div class="rakSplashNoise"></div><div class="rakSplashContent">
      <div class="rakSplashBrand" id="rakSplashBrand" aria-hidden="true"><img class="rakSplashLogo" src="${LOGO}" alt=""><div class="rakSplashSplit"><img class="left" src="${LOGO}" alt=""><img class="right" src="${LOGO}" alt=""></div><span class="rakSplashCore"></span></div>
      <div class="rakSplashPanel" id="rakSplashPanel"><h1 class="rakSplashHeading">Přihlášení</h1><p class="rakSplashHint">Zadej poslední 4 číslice osobního čísla.</p><input class="rakSplashInput" id="rakUserLoginAccountNumber" inputmode="numeric" autocomplete="off" maxlength="4" minlength="4" placeholder="4 číslice" aria-label="Poslední 4 číslice osobního čísla"><div class="rakSplashStatus" id="rakUserLoginStatus" aria-live="polite"></div><button class="rakSplashButton" id="rakUserLoginSubmit" type="button">Pokračovat</button><div class="rakSplashFoot">Číslo slouží pouze k nalezení tvého účtu v RaK.</div></div>
    </div>`;
    document.body.appendChild(overlay);
    const input=overlay.querySelector('#rakUserLoginAccountNumber'), button=overlay.querySelector('#rakUserLoginSubmit');
    input?.addEventListener('input',()=>{input.value=input.value.replace(/\D/g,'').slice(0,4)}); input?.addEventListener('keydown',e=>{if(e.key==='Enter')button?.click()}); button?.addEventListener('click',submit); setTimeout(()=>input?.focus(),120); return overlay;
  }
  function status(text,error){const el=document.getElementById('rakUserLoginStatus');if(!el)return;el.textContent=text||'';el.classList.toggle('error',!!error)}
  async function submit(){
    const overlay=document.getElementById(OVERLAY_ID), input=overlay?.querySelector('#rakUserLoginAccountNumber'), button=overlay?.querySelector('#rakUserLoginSubmit'), brand=document.getElementById('rakSplashBrand'), panel=document.getElementById('rakSplashPanel');
    const last4=String(input?.value||'').replace(/\D/g,''); const reject=msg=>{brand?.classList.remove('error');panel?.classList.remove('error');void brand?.offsetWidth;void panel?.offsetWidth;brand?.classList.add('error');panel?.classList.add('error');status(msg,true)};
    if(!/^\d{4}$/.test(last4)){reject('Zadej 4 číslice.');return} if(button)button.disabled=true;status('Ověřuji…',false);
    try{if(typeof rakUserProfileLookup!=='function')throw new Error('lookup unavailable');const result=await rakUserProfileLookup(last4);if(!result?.ok){reject(result?.reason==='not-found'?'Účet nebyl nalezen.':result?.reason==='ambiguous'?'Číslo není jednoznačné. Obrať se na správce.':'Ověření se nepodařilo. Zkus to znovu.');return}if(typeof rakUserProfileWrite==='function')rakUserProfileWrite(result);if(typeof rakUserProfileApplyToRuntime==='function')rakUserProfileApplyToRuntime(result);brand?.classList.add('success');setTimeout(()=>brand?.classList.add('splitting'),330);setTimeout(()=>overlay?.classList.add('leaving'),470);setTimeout(()=>{overlay?.remove();active=false;try{if(typeof rakUserProfileRefreshMenu==='function')rakUserProfileRefreshMenu()}catch(e){}},780)}catch(e){reject('Ověření se nepodařilo. Zkus to znovu.')}finally{if(button)button.disabled=false}
  }
  function install(prefill=''){style();if(active)return document.getElementById(OVERLAY_ID);active=true;const overlay=build();const input=overlay?.querySelector('#rakUserLoginAccountNumber'),digits=String(prefill||'').replace(/\D/g,'');if(input)input.value=digits.length>4?digits.slice(-4):digits;return overlay}
  window.installRakLoginSplash=install; window.rakLoginSplashOpen=install;
})();
