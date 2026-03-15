// SecureChain project "doctor" - quick static + API smoke tests.
// Run: node doctor.js
//
// This script avoids browser automation; it verifies:
// - Frontend handlers referenced in index.html exist in script.js (or inline)
// - Backend can start (if not already running) and core API flows work

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

const ROOT = __dirname;

const mustExist = [
  'index.html',
  'login.html',
  'style.css',
  'script.js',
  path.join('js', 'api.js'),
  path.join('js', 'login.js'),
  path.join('backend', 'server.js'),
  path.join('backend', 'package.json'),
];

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function parseEnvPort(envText) {
  const m = envText.match(/^\s*PORT\s*=\s*(\d+)\s*$/m);
  return m ? Number(m[1]) : null;
}

function getOnclickFunctionNames(htmlText) {
  const names = new Set();
  const re = /onclick="([^"]+)"/g;
  let m;
  while ((m = re.exec(htmlText)) !== null) {
    const code = m[1].trim();
    const fn = code.match(/^([A-Za-z_$][\w$]*)\s*\(/);
    if (!fn) continue;
    const name = fn[1];
    if (name === 'document' || name === 'window') continue;
    names.add(name);
  }
  return Array.from(names).sort();
}

function hasFunctionSource(source, name) {
  const patterns = [
    new RegExp(`\\bfunction\\s+${name}\\b`),
    new RegExp(`\\basync\\s+function\\s+${name}\\b`),
    new RegExp(`\\bwindow\\.${name}\\s*=`),
  ];
  return patterns.some((re) => re.test(source));
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (_) {}
  return { ok: res.ok, status: res.status, json, text };
}

async function waitForHealth(baseUrl, tries = 15) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetchJson(`${baseUrl}/health`, { method: 'GET' });
      if (r.ok) return r.json;
    } catch (_) {}
    await new Promise((r) => setTimeout(r, 500));
  }
  return null;
}

async function main() {
  console.log('SecureChain Doctor');
  console.log('cwd:', ROOT);
  console.log('node:', process.version);
  console.log('');

  // 1) File presence
  const missingFiles = mustExist.filter((p) => !exists(p));
  if (missingFiles.length) {
    console.error('FAIL: Missing required files:');
    for (const p of missingFiles) console.error('-', p);
    process.exitCode = 1;
    return;
  }
  console.log('OK: Required files present.');

  // 2) Frontend handler presence (static)
  const indexHtml = read('index.html');
  const scriptJs = read('script.js');
  const handlerNames = getOnclickFunctionNames(indexHtml);
  const handlerMissing = handlerNames.filter((name) => {
    return !hasFunctionSource(scriptJs, name) && !hasFunctionSource(indexHtml, name);
  });
  if (handlerMissing.length) {
    console.error('FAIL: Missing JS functions referenced by onclick in index.html:');
    for (const name of handlerMissing) console.error('-', name);
    process.exitCode = 1;
    return;
  }
  console.log(`OK: onclick handlers wired (${handlerNames.length}).`);

  // 3) Backend API smoke test
  let port = 3000;
  const envPath = path.join(ROOT, 'backend', '.env');
  if (fs.existsSync(envPath)) {
    const envText = fs.readFileSync(envPath, 'utf8');
    port = parseEnvPort(envText) || port;
  }

  const apiBase = `http://127.0.0.1:${port}/api`;

  let started = false;
  let child = null;
  let health = await waitForHealth(apiBase, 2);
  if (!health) {
    console.log('Backend not detected. Starting backend/server.js ...');
    started = true;
    child = spawn(process.execPath, [path.join(ROOT, 'backend', 'server.js')], {
      cwd: ROOT,
      stdio: 'inherit',
      windowsHide: true,
    });

    health = await waitForHealth(apiBase, 20);
    if (!health) {
      console.error('FAIL: Backend did not become healthy.');
      if (child) child.kill();
      process.exitCode = 1;
      return;
    }
  }
  console.log(`OK: Backend healthy (db=${health.database || 'unknown'}).`);

  const email = `doctor_${crypto.randomBytes(5).toString('hex')}@example.com`;
  const password = 'Password123!';

  const reg = await fetchJson(`${apiBase}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Doctor User', email, password }),
  });
  if (!reg.ok || !reg.json?.token) {
    console.error('FAIL: /auth/register failed:', reg.status, reg.json || reg.text);
    if (child && started) child.kill();
    process.exitCode = 1;
    return;
  }

  const token = reg.json.token;

  const form = new FormData();
  const payload = new Blob([`securechain-doctor ${Date.now()}`], { type: 'text/plain' });
  form.append('file', payload, 'doctor.txt');
  const up = await fetchJson(`${apiBase}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const hash = up.json?.file?.hash;
  if (!up.ok || !hash) {
    console.error('FAIL: /upload failed:', up.status, up.json || up.text);
    if (child && started) child.kill();
    process.exitCode = 1;
    return;
  }

  const verify = await fetchJson(`${apiBase}/verify/hash`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ hash }),
  });
  if (!verify.ok || verify.json?.verified !== true) {
    console.error('FAIL: /verify/hash failed:', verify.status, verify.json || verify.text);
    if (child && started) child.kill();
    process.exitCode = 1;
    return;
  }

  const files = await fetchJson(`${apiBase}/upload/myfiles`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  const firstId = Array.isArray(files.json) && files.json[0]?._id ? files.json[0]._id : null;
  if (!files.ok || !firstId) {
    console.error('FAIL: /upload/myfiles failed:', files.status, files.json || files.text);
    if (child && started) child.kill();
    process.exitCode = 1;
    return;
  }

  const receipt = await fetchJson(`${apiBase}/upload/${encodeURIComponent(firstId)}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!receipt.ok || receipt.json?.hash !== hash) {
    console.error('FAIL: /upload/:id receipt failed:', receipt.status, receipt.json || receipt.text);
    if (child && started) child.kill();
    process.exitCode = 1;
    return;
  }

  const report = await fetchJson(`${apiBase}/tools/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ type: 'performance', timeframe: '24h', format: 'json' }),
  });
  if (!report.ok || report.json?.success !== true) {
    console.error('FAIL: /tools/report failed:', report.status, report.json || report.text);
    if (child && started) child.kill();
    process.exitCode = 1;
    return;
  }

  console.log('OK: Backend core flows passed (auth, upload, verify, receipt, report).');

  if (child && started) {
    child.kill();
  }
}

main().catch((err) => {
  console.error('FAIL:', err);
  process.exitCode = 1;
});

