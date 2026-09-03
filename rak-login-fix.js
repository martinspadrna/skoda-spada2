// RaK DEV – safety fix for the login splash.
// Prevents the legacy profile menu observer from creating an infinite mutation loop.
(function installRakLoginFix() {
  try {
    // The previous menu observer rewrites innerHTML on every mutation it creates itself.
    // Replace the renderer with an idempotent version before the observer fires again.
    if (typeof window.rakUserProfileEnsureMenuBox === 'function') {
      window.rakUserProfileEnsureMenuBox = function safeEnsureMenuBox(body) {
        if (!body || !body.insertBefore) return;
        let box = document.getElementById('rakUserProfileBox');
        const profile = typeof window.rakUserProfileGet === 'function' ? window.rakUserProfileGet() : null;
        const nextHtml = profile
          ? `<div class="rakUserProfileBoxTitle">Přihlášený uživatel</div><div class="rakUserProfileBoxName">${typeof window.rakUserProfileEscape === 'function' ? window.rakUserProfileEscape(profile.fullName) : String(profile.fullName || '')}</div><div class="rakUserProfileBoxNumber">Osobní číslo: ${typeof window.rakUserProfileEscape === 'function' ? window.rakUserProfileEscape(profile.accountNumber) : String(profile.accountNumber || '')}</div><div class="rakUserProfileBoxActions"><button type="button" id="rakUserProfileChange">Změnit účet</button><button type="button" id="rakUserProfileLogout">Odhlásit</button></div>`
          : `<div class="rakUserProfileBoxTitle">Uživatel</div><div class="rakUserProfileBoxName">Nikdo není přihlášen</div><div class="rakUserProfileBoxActions"><button type="button" id="rakUserProfileLogin">Přihlásit</button></div>`;
        if (!box) {
          box = document.createElement('div');
          box.id = 'rakUserProfileBox';
          box.className = 'rakUserProfileBox';
          box.innerHTML = nextHtml;
          body.insertBefore(box, body.firstChild || null);
        } else if (box.innerHTML !== nextHtml) {
          box.innerHTML = nextHtml;
        }
        const change = box.querySelector('#rakUserProfileChange');
        const logout = box.querySelector('#rakUserProfileLogout');
        const login = box.querySelector('#rakUserProfileLogin');
        if (change) change.onclick = () => window.rakUserProfileOpenLogin && window.rakUserProfileOpenLogin(profile && profile.accountNumber || '');
        if (logout) logout.onclick = () => {
          if (typeof window.rakUserProfileClear === 'function') window.rakUserProfileClear();
          box.remove();
          if (typeof window.installRakLoginSplash === 'function') window.installRakLoginSplash();
        };
        if (login) login.onclick = () => window.installRakLoginSplash && window.installRakLoginSplash();
      };
    }

    // The legacy bootstrap schedules its old login overlay after 250 ms.
    // Route that call to the new splash so the two login UIs cannot race each other.
    if (typeof window.rakUserProfileOpenLogin === 'function') {
      const legacyOpenLogin = window.rakUserProfileOpenLogin;
      window.rakUserProfileOpenLogin = function routedOpenLogin(prefill) {
        if (typeof window.installRakLoginSplash === 'function') {
          const existing = typeof window.rakUserProfileGet === 'function' ? window.rakUserProfileGet() : null;
          if (!existing) {
            const overlay = window.installRakLoginSplash();
            const input = overlay && overlay.querySelector ? overlay.querySelector('#rakUserLoginAccountNumber') : document.getElementById('rakUserLoginAccountNumber');
            if (input) {
              const value = String(prefill || '').replace(/\D/g, '');
              input.value = value.length > 4 ? value.slice(-4) : value;
              try { input.focus(); input.select(); } catch (err) {}
            }
            return overlay;
          }
        }
        return legacyOpenLogin(prefill);
      };
    }
  } catch (err) {
    console.warn('RaK login safety fix failed', err);
  }
})();
