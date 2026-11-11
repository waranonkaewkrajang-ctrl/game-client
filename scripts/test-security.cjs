/* eslint-disable @typescript-eslint/no-require-imports -- plain CommonJS test script run with `node` */
// Offline regression tests for the frontend security helpers (lib/safe-html, lib/safe-url, lib/safe-json).
// sanitizeHtml needs a real DOM and is covered by the browser test; here it must refuse to run server-side.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function load(file, overrides = {}) {
  const filename = path.resolve(__dirname, '..', file);
  const mod = new Module(filename, module);
  mod.filename = filename;
  mod.paths = module.paths;
  const original = mod.require.bind(mod);
  mod.require = id => Object.hasOwn(overrides, id) ? overrides[id] : original(id);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  mod._compile(source, filename);
  return mod.exports;
}

const html = load('lib/safe-html.ts', { dompurify: { addHook() {}, sanitize: () => { throw new Error('must not run without a DOM'); } } });
const url = load('lib/safe-url.ts');
const json = load('lib/safe-json.ts');

test('escapeHtml neutralises markup and quotes, keeps plain text', () => {
  assert.equal(html.escapeHtml('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  assert.equal(html.escapeHtml("a&b'c"), 'a&amp;b&#39;c');
  assert.equal(html.escapeHtml('กสิกรไทย 123-4-56789-0'), 'กสิกรไทย 123-4-56789-0');
  assert.equal(html.escapeHtml(undefined), '');
  assert.equal(html.escapeHtml(2.5), '2.5');
});

test('safeImageSrc allows http(s) and site paths only', () => {
  assert.equal(html.safeImageSrc('https://admintg289.sbs/uploads/a.png'), 'https://admintg289.sbs/uploads/a.png');
  assert.equal(html.safeImageSrc('/uploads/a.png'), '/uploads/a.png');
  assert.equal(html.safeImageSrc('javascript:alert(1)'), '');
  assert.equal(html.safeImageSrc('data:image/svg+xml,<svg onload=alert(1)>'), '');
  assert.equal(html.safeImageSrc('//evil.example/a.png'), '');
  assert.equal(html.safeImageSrc('https://x.test/a.png" onerror="alert(1)'), 'https://x.test/a.png%22%20onerror=%22alert(1)');
  assert.equal(html.safeImageSrc(null), '');
});

test('sanitizeHtml returns nothing on the server instead of raw markup', () => {
  assert.equal(html.sanitizeHtml('<b>x</b>'), '');
  assert.equal(html.sanitizeHtml(null), '');
});

test('externalHttpUrl / internalPath', () => {
  assert.equal(url.externalHttpUrl('https://line.me/ti/p/abc'), 'https://line.me/ti/p/abc');
  assert.equal(url.externalHttpUrl('http://example.com'), 'http://example.com'); // returned unchanged, not normalised
  const launch = 'https://game.example/play?token=a|b^c&lang=th&cb=https://site/x y';
  assert.equal(url.externalHttpUrl(launch), launch); // provider launch URLs must not be re-encoded
  assert.equal(url.externalHttpUrl('  https://x.test/a  '), 'https://x.test/a');
  assert.equal(url.externalHttpUrl('javascript:alert(1)'), null);
  assert.equal(url.externalHttpUrl(' JAVASCRIPT:alert(1)'), null);
  assert.equal(url.externalHttpUrl('data:text/html,x'), null);
  assert.equal(url.externalHttpUrl('/lobby'), null);
  assert.equal(url.internalPath('/promotions?x=1'), '/promotions?x=1');
  assert.equal(url.internalPath('//evil.example'), null);
  assert.equal(url.internalPath('/\\evil.example'), null);
  assert.equal(url.internalPath('javascript:alert(1)'), null);
  assert.equal(url.internalPath('/a\nb'), null);
  assert.equal(url.internalPath(42), null);
});

test('openConfiguredLink opens http(s) without opener, routes paths, ignores the rest', () => {
  const opened = []; const routed = [];
  global.window = { open: (...args) => opened.push(args) };
  try {
    url.openConfiguredLink('https://x.test/a', p => routed.push(p));
    url.openConfiguredLink('/wallet', p => routed.push(p));
    url.openConfiguredLink('javascript:alert(1)', p => routed.push(p));
    url.openConfiguredLink('//evil.example', p => routed.push(p));
    url.openConfiguredLink(null, p => routed.push(p));
  } finally { delete global.window; }
  assert.deepEqual(opened, [['https://x.test/a', '_blank', 'noopener,noreferrer']]);
  assert.deepEqual(routed, ['/wallet']);
});

test('readStoredJSON / readStoredUsername survive corrupted storage', () => {
  const store = new Map();
  global.localStorage = { getItem: k => (store.has(k) ? store.get(k) : null) };
  try {
    assert.equal(json.readStoredUsername(), null);
    store.set('user_data', 'undefined');
    assert.equal(json.readStoredUsername(), null);
    store.set('user_data', '{"username":');
    assert.equal(json.readStoredUsername(), null);
    store.set('user_data', '"text"');
    assert.equal(json.readStoredUsername(), null);
    store.set('user_data', '{"username":42}');
    assert.equal(json.readStoredUsername(), null);
    store.set('user_data', '{"username":"demo_user","id":7}');
    assert.equal(json.readStoredUsername(), 'demo_user');
    store.set('seen_popups', 'null');
    assert.deepEqual(json.readStoredJSON('seen_popups', []), []);
    store.set('seen_popups', '[1,2]');
    assert.deepEqual(json.readStoredJSON('seen_popups', []), [1, 2]);
  } finally { delete global.localStorage; }
  global.localStorage = { getItem() { throw new Error('SecurityError'); } };
  try { assert.equal(json.readStoredUsername(), null); } finally { delete global.localStorage; }
});
