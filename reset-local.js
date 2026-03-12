// ── reset-local.js ───────────────────────────────────────────────────────────
// Yeh script sab kuch wapas localhost par set kar deta hai
// Usage: node reset-local.js
// ─────────────────────────────────────────────────────────────────────────────

import fs     from 'fs';
import path   from 'path';
import dotenv from 'dotenv';

dotenv.config();

const ENV_FILE    = path.resolve('.env');
const API_JS_FILE = path.resolve('client/src/services/api.js');

// ── 1. .env reset ────────────────────────────────────────────────────────────
if (fs.existsSync(ENV_FILE)) {
  let env = fs.readFileSync(ENV_FILE, 'utf8');

  env = env.replace(
    /CLEARBOOKS_REDIRECT_URI=.*/,
    'CLEARBOOKS_REDIRECT_URI=http://localhost:5000/auth/callback'
  );
  env = env.replace(
    /FRONTEND_URL=.*/,
    'FRONTEND_URL=http://localhost:5173'
  );

  fs.writeFileSync(ENV_FILE, env);
  console.log('✅ .env reset to localhost');
} else {
  console.warn('⚠️  .env file nahi mili');
}

// ── 2. api.js reset ──────────────────────────────────────────────────────────
if (fs.existsSync(API_JS_FILE)) {
  let api = fs.readFileSync(API_JS_FILE, 'utf8');
  api = api.replace(
    /const API_BASE_URL\s*=\s*["'].*["']/,
    `const API_BASE_URL = "http://localhost:5000"`
  );
  fs.writeFileSync(API_JS_FILE, api);
  console.log('✅ client/src/services/api.js reset to localhost');
} else {
  console.warn('⚠️  api.js nahi mila');
}

console.log('\n🟢 Sab kuch localhost par wapas set ho gaya!');
console.log('   Ab normal: node server.js + cd client && npm run dev\n');