#!/usr/bin/env node
/**
 * npm run setup
 *
 * Interactive script that writes (or updates) the VITE_CHAT_API_URL
 * variable in .env.local so the chat widget knows where to send requests.
 *
 * Usage:
 *   npm run setup
 *
 * Non-interactive (CI / scripting):
 *   CHAT_API_URL=https://my-project.vercel.app/api/chat/query npm run setup
 */

import { createInterface } from 'readline/promises';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const ENV_FILE = join(process.cwd(), '.env.local');
const VAR_NAME = 'VITE_CHAT_API_URL';

// ── helpers ──────────────────────────────────────────────────────────────────

function isValidUrl(s) {
  try {
    const u = new URL(s);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

async function readEnvFile() {
  if (!existsSync(ENV_FILE)) return {};
  const text = await readFile(ENV_FILE, 'utf8');
  const vars = {};
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx < 0) continue;
    vars[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return vars;
}

async function writeEnvFile(vars) {
  const lines = Object.entries(vars).map(([k, v]) => `${k}=${v}`);
  await writeFile(ENV_FILE, lines.join('\n') + '\n', 'utf8');
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌳  Family tree — chat API setup\n');

  // Allow non-interactive use via env
  let apiUrl = process.env.CHAT_API_URL?.trim() ?? '';

  if (!apiUrl) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    apiUrl = (
      await rl.question(
        `Enter the full API URL (e.g. https://your-project.vercel.app/api/chat/query):\n> `
      )
    ).trim();
    rl.close();
  }

  if (!apiUrl) {
    console.error('✗  No URL entered. Aborting.');
    process.exit(1);
  }

  if (!isValidUrl(apiUrl)) {
    console.error(`✗  "${apiUrl}" does not look like a valid URL. Aborting.`);
    process.exit(1);
  }

  const vars = await readEnvFile();
  const previous = vars[VAR_NAME];
  vars[VAR_NAME] = apiUrl;
  await writeEnvFile(vars);

  if (previous && previous !== apiUrl) {
    console.log(`✓  Updated ${VAR_NAME}\n    ${previous}\n  → ${apiUrl}`);
  } else if (!previous) {
    console.log(`✓  Set ${VAR_NAME}=${apiUrl}`);
  } else {
    console.log(`✓  ${VAR_NAME} is already set to ${apiUrl} (no change)`);
  }

  console.log(`\n   Written to: ${ENV_FILE}`);
  console.log('   Run  npm run dev  to start the dev server with the new setting.\n');
}

main().catch(err => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
