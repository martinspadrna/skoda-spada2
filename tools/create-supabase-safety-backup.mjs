import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const projectUrl = String(process.env.RAK_SUPABASE_URL || '').replace(/\/$/, '');
const publishableKey = String(process.env.RAK_SUPABASE_PUBLISHABLE_KEY || '');
const legacyAdminPin = String(process.env.RAK_LEGACY_ADMIN_PIN || '');

if (!projectUrl || !publishableKey) {
  throw new Error('RAK_SUPABASE_URL and RAK_SUPABASE_PUBLISHABLE_KEY are required.');
}

const headers = {
  apikey: publishableKey,
  Authorization: `Bearer ${publishableKey}`
};

async function readTable(table) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const response = await fetch(`${projectUrl}/rest/v1/${table}?select=*`, {
      headers: { ...headers, Range: `${from}-${from + 999}` }
    });
    if (!response.ok) {
      return { error: `${response.status} ${await response.text()}`, rows };
    }
    const page = await response.json();
    rows.push(...page);
    if (page.length < 1000) return { rows };
  }
}

async function readRotationBackups() {
  if (!legacyAdminPin) return { error: 'RAK_LEGACY_ADMIN_PIN was not provided.', rows: [] };
  const response = await fetch(`${projectUrl}/rest/v1/rpc/rak_admin_list_rotation_backups`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_admin_pin: legacyAdminPin, p_limit: 100 })
  });
  if (!response.ok) return { error: `${response.status} ${await response.text()}`, rows: [] };
  return { rows: await response.json() };
}

const tables = [
  'announcements',
  'machine_settings',
  'rotation_state',
  'rotation_months',
  'rotation_entries',
  'game_accounts',
  'game_invites',
  'game_sessions',
  'game_stats',
  'game_ui_settings',
  'bug_reports',
  'gomoku_wins'
];

const backup = {
  type: 'rak-pre-security-migration-backup',
  createdAt: new Date().toISOString(),
  projectRef: new URL(projectUrl).hostname.split('.')[0],
  tables: {}
};

for (const table of tables) backup.tables[table] = await readTable(table);
backup.rotationBackups = await readRotationBackups();

const stamp = backup.createdAt.replace(/[:.]/g, '-');
const outputPath = path.join(os.tmpdir(), `RaK-pre-security-${stamp}.json`);
await fs.writeFile(outputPath, JSON.stringify(backup, null, 2), { mode: 0o600 });

const counts = Object.fromEntries(tables.map((table) => [table, backup.tables[table].rows.length]));
console.log(JSON.stringify({ outputPath, counts, rotationBackups: backup.rotationBackups.rows.length }));
