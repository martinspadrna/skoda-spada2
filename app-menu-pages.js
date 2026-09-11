// RaK – běžné stránky menu oddělené od admin shellu.
try { if (typeof window.rakMarkModuleReady === 'function') window.rakMarkModuleReady('app-menu-pages.js', 'loaded', { source: 'dynamic-loader' }); } catch (err) {}

function buildAppMenuAboutHistoryHtml() {
  const sections = [
    {
      range: 'RaK 1.6',
      title: 'Rychlejší, čistší a přesnější',
      lines: [
        'Start aplikace a aktualizace PWA jsou rychlejší a stabilnější; části aplikace se načítají až ve chvíli, kdy jsou potřeba.',
        'Korekce Brusů pracují samostatně pro 2 brusy, 3 indexy, C1/C2 a levou/pravou stranu protokolu – celkem 24 citlivostí.',
        'Dashboard a mobilní/iPhone rozložení prošly velkým úklidem starých překrývajících se stylů bez změny ověřeného vzhledu.',
        'Aplikace se dál rozdělila do menších modulů, odstranily se Hry a řada starých oprav a duplicit, takže je snazší ji bezpečně udržovat.'
      ]
    },
    {
      range: 'RaK 1.5',
      title: 'Účty, osobní směna a reporty',
      lines: [
        'Přihlášení si pamatuje uživatele a vzhled je uložený ke konkrétnímu účtu; Home ukazuje osobní směnu a pracovní informace.',
        'Rotace zobrazí poslední uložená data hned a synchronizuje je na pozadí; generátor hlídá návaznost měsíců a pravidla rozpisu.',
        'Přibyly reporty směny a dovolených, úkoly strojů, bezpečnější správa účtů a nový mobilní vzhled.'
      ]
    },
    {
      range: 'RaK 1.2',
      title: 'Administrace a generátor',
      lines: [
        'Výrazně se rozšířila administrace, generátor rozpisů, práce s absencemi a přesčasy, zálohy a chráněné ukládání se revizemi.',
        'Nastavení pracovníků, dovolených, provozních dnů, odkazů a dalších částí se přesunulo přímo do aplikace.'
      ]
    },
    {
      range: 'RaK 1.1',
      title: 'Online funkce a PWA',
      lines: [
        'Přibyly větší PWA/offline funkce, online synchronizace, statistiky a bezpečnostní i provozní kontroly.',
        'V této řadě vznikaly také Hry a online profily; později byly z RaK odstraněny, aby aplikace zůstala pracovně zaměřená.'
      ]
    },
    {
      range: 'RaK 1.0 a začátky',
      title: 'Základ aplikace',
      lines: [
        'Vznikl základ Dashboardu, směnové logiky, Rotací, rozpisů a výrobních kalkulaček; postupně přibylo ukládání dat a první PWA základ.'
      ]
    }
  ];

  return [
    '<div class="appMenuHistory">',
    sections.map(section => [
      '<div class="appMenuHistoryGroup">',
      '  <div class="appMenuHistoryRange">' + escapeHtml(section.range) + '</div>',
      '  <div class="appMenuHistoryTitle">' + escapeHtml(section.title) + '</div>',
      '  <div class="appMenuHistoryList">' + (section.lines || []).map(line => '<div class="appMenuHistoryItem">' + escapeHtml(line) + '</div>').join('') + '</div>',
      '</div>'
    ].join('')).join(''),
    '</div>'
  ].join('');
}

// Legacy smoke marker: Testovací build: intentionally not rendered in O aplikaci.
function renderAppMenuAboutPage(body, versionText) {
      const displayVersion = String(window.RAK_RELEASE_VERSION || versionText || '1.6').trim();
      body.innerHTML = [
        '<div class="appMenuCard">',
        '  <div class="appMenuCardTitle">O aplikaci</div>',
        '  <div class="appMenuVersion">' + escapeHtml(formatRakDisplayVersion(displayVersion)) + '</div>',
        '  ' + buildAppMenuAboutHistoryHtml(),
        '  <button type="button" class="appMenuAction appMenuBack" data-menu-back="1">Zpět</button>',
        '</div>'
      ].join('');
      if (typeof renderThemeSettingsCards === 'function') {
        try { renderThemeSettingsCards(); } catch (err) {}
      }
    
}

function renderAppMenuContactPage(body, versionText) {
      bindAppMenuHandlers(body);
      const contact = typeof getRakAppContactSettings === 'function'
        ? getRakAppContactSettings()
        : { name: 'Martin Špadrna', phone: '+420 773 682 499', email: 'martinspadrna@gmail.com' };
      const contactPhoneHref = typeof getRakAppContactPhoneHref === 'function' ? getRakAppContactPhoneHref(contact) : '';
      const contactEmailHref = typeof getRakAppContactEmailHref === 'function' ? getRakAppContactEmailHref(contact) : '';
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
        '  <div class="appMenuText">RaK nepoužívá reklamní cookies ani rutinní sledování používání. Při běžném používání neodesílá přehled připojených zařízení ani navštívené části aplikace.</div>',
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
