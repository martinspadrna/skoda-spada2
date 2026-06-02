// RaK 1.2 (1.109) – zobrazení changelogu aplikace.

(function () {
  const CHANGELOG_URL = 'CHANGELOG.md';

  function parseChangelogMarkdown(text) {
    const sections = [];
    const lines = String(text || '').split(/\r?\n/);
    let current = null;

    for (const rawLine of lines) {
      const line = String(rawLine || '').trimEnd();
      const heading = line.match(/^##\s+(.+)$/);
      if (heading) {
        if (current && (current.range || (current.lines && current.lines.length))) {
          sections.push(current);
        }
        const range = heading[1].trim();
        current = {
          range,
          title: range,
          lines: []
        };
        continue;
      }

      if (!current) continue;
      const bullet = line.match(/^[-*]\s+(.+)$/);
      if (bullet) {
        current.lines.push(bullet[1].trim());
      } else if (line.trim() && !/^#/.test(line.trim())) {
        current.lines.push(line.trim());
      }
    }

    if (current && (current.range || (current.lines && current.lines.length))) {
      sections.push(current);
    }

    return sections.filter((section) => section && (section.range || (section.lines && section.lines.length)));
  }

  async function loadChangelog() {
    try {
      const res = await fetch(CHANGELOG_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      window.APP_CHANGELOG_TEXT = text;
      window.APP_CHANGELOG_SECTIONS = parseChangelogMarkdown(text);
      return window.APP_CHANGELOG_SECTIONS;
    } catch (err) {
      console.warn('[Rotace] Changelog load failed', err);
      if (!Array.isArray(window.APP_CHANGELOG_SECTIONS)) {
        window.APP_CHANGELOG_SECTIONS = [];
      }
      return window.APP_CHANGELOG_SECTIONS;
    }
  }

  window.APP_CHANGELOG_URL = CHANGELOG_URL;
  window.APP_CHANGELOG_READY = loadChangelog();
})();
