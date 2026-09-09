// RaK – běžné stránky menu oddělené od admin shellu.
try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('app-menu-pages.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}

function renderAppMenuAboutPage(body, versionText) {
      const devBuildLine = window.RAK_DEV_BUILD
        ? '  <div class="appMenuText">Testovací build: ' + escapeHtml(String(window.RAK_DEV_BUILD)) + '</div>'
        : '';
      body.innerHTML = [
        '<div class="appMenuCard">',
        '  <div class="appMenuCardTitle">O aplikaci</div>',
        '  <div class="appMenuVersion">' + escapeHtml(formatRakDisplayVersion(versionText)) + '</div>',
        devBuildLine,
        '  ' + buildAppHistoryHtml(versionText),
        '  <button type="button" class="appMenuAction appMenuBack" data-menu-back="1">Zpět</button>',
        '</div>'
      ].join('');
      if (typeof renderThemeSettingsCards === 'function') {
        try { renderThemeSettingsCards(); } catch (err) {}
      }
    
}

function renderAppMenuContactPage(body, versionText) {
      bindAppMenuHandlers(body);
      body.innerHTML = [
        '<div class="appMenuCard">',
        '  <div class="appMenuCardTitle">Kontakt</div>',
        '',
        '  <div class="appMenuContactRow"><span>Jméno</span><b>' + escapeHtml(contact.name) + '</b></div>',
        '  <div class="appMenuContactRow"><span>Telefon</span>' + (contactPhoneHref ? '<a class="appMenuContactLink" href="' + escapeHtml(contactPhoneHref) + '">' + escapeHtml(contact.phone) + '</a>' : '<b>' + escapeHtml(contact.phone) + '</b>') + '</div>',
        '  <div class="appMenuContactRow"><span>E-mail</span>' + (contactEmailHref ? '<a class="appMenuContactLink" href="' + escapeHtml(contactEmailHref) + '">' + escapeHtml(contact.email) + '</a>' : '<b>' + escapeHtml(contact.email) + '</b>') + '</div>',
        '  <button type="button" class="appMenuAction appMenuBack" data-menu-back="1">Zpět</button>',
        '</div>'
      ].join('');
    
}

function renderAppMenuSettingsPage(body, versionText) {
      bindAppMenuHandlers(body);
      const profileCard = buildGamesProfileSettingsHtml();
      const privacyCard = [
        '<details class="appMenuCard appMenuSettingsCard">',
        '  <summary class="appMenuCardTitle">Soukromí a data</summary>',
        '  <div class="appMenuText">RaK nepoužívá reklamní cookies ani rutinní sledování používání.</div>',
        '  <div class="appMenuText smallText">V tomto zařízení zůstává jen profil pro zapamatování přihlášení (jméno a osobní číslo), nastavení a poslední data potřebná pro práci bez internetu. Profil smažeš tlačítkem Odhlásit.</div>',
        '  <div class="appMenuText smallText">Pracovní data se synchronizují do RaK databáze. Pokud odešleš report chyby, přidá se k němu verze aplikace a základní technické údaje nutné k opravě.</div>',
        '</details>'
      ].join('');
      const performanceCard = typeof buildRakDevicePerformanceSettingsHtml === 'function' ? buildRakDevicePerformanceSettingsHtml() : '';
      const themeCards = buildThemeSystemSettingsHtml();
      body.innerHTML = [
        profileCard,
        privacyCard,
        performanceCard,
        themeCards,
        '<button type="button" class="appMenuAction appMenuBack appMenuStandaloneBack" data-menu-back="1">Zpět</button>'
      ].join('');
      if (typeof gamesRenderAccountChips === 'function') {
        try { gamesRenderAccountChips(); } catch (err) {}
      }
      if (typeof renderGamesProfileStatus === 'function') {
        try { renderGamesProfileStatus(); } catch (err) {}
      }
      if (typeof renderThemeSettingsCards === 'function') {
        try { renderThemeSettingsCards(); } catch (err) {}
      }
    
}
