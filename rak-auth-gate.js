// RaK DEV – tvrdy UI gate: bez prihlaseneho profilu neni aplikace dostupna ani viditelna.
(function () {
  'use strict';

  const PROFILE_KEY = 'rotace_kalkulacky:user_profile_v1';

  function validProfile(profile) {
    return !!(profile && typeof profile === 'object' && String(profile.accountNumber || '').trim() && String(profile.fullName || '').trim());
  }

  function storedProfile() {
    try {
      if (typeof window.rakUserProfileGet === 'function') return window.rakUserProfileGet();
      return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
    } catch (err) {
      return null;
    }
  }

  function setState(unlocked) {
    try { document.documentElement.dataset.rakAuthState = unlocked ? 'unlocked' : 'locked'; } catch (err) {}
  }

  function ensureLoginScreen() {
    if (validProfile(storedProfile())) return;
    setState(false);
    if (document.getElementById('rakUserLoginOverlay')) return;
    if (typeof window.installRakLoginSplash === 'function') {
      try { window.installRakLoginSplash(); } catch (err) {}
    }
  }

  function wrap(name, after) {
    const original = window[name];
    if (typeof original !== 'function' || original.__rakAuthGateWrapped) return;
    const wrapped = function () {
      const result = original.apply(this, arguments);
      try { after(result); } catch (err) {}
      return result;
    };
    wrapped.__rakAuthGateWrapped = true;
    window[name] = wrapped;
  }

  wrap('rakUserProfileWrite', (result) => {
    if (result === true && validProfile(storedProfile())) setState(true);
    else setState(validProfile(storedProfile()));
  });
  wrap('rakUserProfileApplyToRuntime', () => setState(validProfile(storedProfile())));
  wrap('rakUserProfileClear', () => {
    setState(false);
    setTimeout(ensureLoginScreen, 0);
  });

  window.addEventListener('storage', (event) => {
    if (!event || event.key !== PROFILE_KEY) return;
    if (validProfile(storedProfile())) setState(true);
    else ensureLoginScreen();
  });

  if (validProfile(storedProfile())) setState(true);
  else setState(false);

  window.rakAuthGateEnsureLogin = ensureLoginScreen;
  window.rakAuthGateIsUnlocked = () => validProfile(storedProfile());
})();