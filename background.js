const DOMAIN = "ome.tv";
const URL = "https://ome.tv/";
const ORIGINS = ["https://ome.tv", "http://ome.tv", "https://www.ome.tv", "http://www.ome.tv"];

function isOme(d) {
  d = (d || "").toLowerCase().replace(/^\./, "");
  return d === "ome.tv" || d === "www.ome.tv";
}
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function ri(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

const ID = [
  { ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36", p: "Win32", s: "Windows", wv: "Google Inc. (NVIDIA)", wr: pick(["ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)", "ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 Direct3D11 vs_5_0 ps_5_0, D3D11)", "ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 Ti Direct3D11 vs_5_0 ps_5_0, D3D11)"]), sc: [[1920, 1080], [2560, 1440], [1366, 768]] },
  { ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36", p: "Win32", s: "Windows", wv: "Google Inc. (Intel)", wr: pick(["ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)", "ANGLE (Intel, Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)"]), sc: [[1920, 1080], [1536, 864], [1366, 768]] },
  { ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36", p: "Win32", s: "Windows", wv: "Google Inc. (AMD)", wr: pick(["ANGLE (AMD, AMD Radeon RX 580 Direct3D11 vs_5_0 ps_5_0, D3D11)", "ANGLE (AMD, AMD Radeon RX 6600 XT Direct3D11 vs_5_0 ps_5_0, D3D11)"]), sc: [[1920, 1080], [2560, 1440]] },
  { ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36", p: "MacIntel", s: "macOS", wv: "Google Inc. (Apple)", wr: pick(["ANGLE (Apple, ANGLE Metal Renderer: Apple M1, Unspecified Version)", "ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)"]), sc: [[1680, 1050], [2560, 1600], [1440, 900]] },
  { ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36", p: "MacIntel", s: "macOS", wv: "Google Inc. (Intel Inc.)", wr: "ANGLE (Intel Inc., Intel(R) Iris(TM) Plus Graphics OpenGL Engine)", sc: [[1680, 1050], [1440, 900]] }
];

function gen() {
  const id = pick(ID);
  const sc = pick(id.sc);
  const m = (id.ua.match(/Chrome\/(\d+)/) || [, "137"])[1];
  return {
    ua: id.ua, av: id.ua.replace("Mozilla/", ""), p: id.p, v: "Google Inc.",
    hc: pick([4, 6, 8, 8, 12, 16]), dm: pick([4, 8, 8, 16]), sc, cd: 24,
    wv: id.wv, wr: id.wr, cs: ri(1, 2147483647), as: ri(1, 2147483647),
    cu: `"Google Chrome";v="${m}", "Chromium";v="${m}", "Not_A Brand";v="8"`, sp: id.s, cm: m
  };
}

const RS = 100;
const RT = ["main_frame", "sub_frame", "xmlhttprequest", "image", "script", "stylesheet", "font", "websocket", "media", "ping", "other"];

async function setHeaders(fp) {
  const all = await chrome.declarativeNetRequest.getDynamicRules();
  const rem = all.filter((r) => r.id >= RS && r.id < RS + 50).map((r) => r.id);
  if (rem.length) await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: rem });
  if (!fp) return;
  const hl = [
    { header: "User-Agent", operation: "set", value: fp.ua },
    { header: "sec-ch-ua", operation: "set", value: fp.cu },
    { header: "sec-ch-ua-mobile", operation: "set", value: "?0" },
    { header: "sec-ch-ua-platform", operation: "set", value: `"${fp.sp}"` }
  ];
  await chrome.declarativeNetRequest.updateDynamicRules({ addRules: hl.map((h, i) => ({ id: RS + i, priority: 1, action: { type: "modifyHeaders", requestHeaders: [h] }, condition: { urlFilter: "||ome.tv", resourceTypes: RT } })) });
}

async function clearCookies() {
  const stores = await chrome.cookies.getAllCookieStores();
  for (const s of stores) {
    const c = await chrome.cookies.getAll({ domain: DOMAIN, storeId: s.id });
    for (const k of c) {
      const sch = k.secure ? "https" : "http";
      const h = k.domain.replace(/^\./, "");
      try { await chrome.cookies.remove({ url: `${sch}://${h}${k.path}`, name: k.name, storeId: s.id }); } catch (e) {}
    }
  }
}

async function clearData() {
  await chrome.browsingData.remove({ origins: ORIGINS }, { appcache: true, cache: true, cookies: true, fileSystems: true, formData: true, indexedDB: true, localStorage: true, pluginData: true, serviceWorkers: true, webSQL: true });
}

async function clearPage(id) {
  await chrome.scripting.executeScript({
    target: { tabId: id },
    func: () => {
      try { localStorage.clear(); } catch (e) {}
      try { sessionStorage.clear(); } catch (e) {}
      try { if (indexedDB.databases) indexedDB.databases().then((d) => d.forEach((x) => indexedDB.deleteDatabase(x.name))); } catch (e) {}
      try { if (window.caches) caches.keys().then((k) => k.forEach((x) => caches.delete(x))); } catch (e) {}
      try { if (navigator.serviceWorker) navigator.serviceWorker.getRegistrations().then((r) => r.forEach((x) => x.unregister())); } catch (e) {}
    }
  });
}

async function reset() {
  const fp = gen();
  await chrome.storage.local.set({ fingerprint: fp });
  try { await setHeaders(fp); } catch (e) {}
  await clearCookies();
  try { await clearData(); } catch (e) {}
  const tabs = await chrome.tabs.query({ url: ["*://ome.tv/*", "*://www.ome.tv/*"] });
  for (const t of tabs) {
    try { await clearPage(t.id); await chrome.tabs.reload(t.id); } catch (e) {}
  }
  return { ok: true };
}

chrome.action.onClicked.addListener(async () => {
  const tabs = await chrome.tabs.query({ url: ["*://ome.tv/*", "*://www.ome.tv/*"] });
  if (tabs.length) {
    const t = tabs[0];
    await chrome.tabs.update(t.id, { active: true });
    if (t.windowId !== undefined) try { await chrome.windows.update(t.windowId, { focused: true }); } catch (e) {}
    return;
  }
  await chrome.tabs.create({ url: URL, active: true });
});

function isUrl(u) { return /^https?:\/\/(www\.)?ome\.tv\//.test(u || ""); }

const guard = new Map();
chrome.webNavigation.onCommitted.addListener(async (d) => {
  if (!isUrl(d.url)) return;
  const k = `${d.tabId}|${d.frameId}`;
  const n = Date.now();
  if (guard.has(k) && n - guard.get(k) < 2000) return;
  guard.set(k, n);
  let { fingerprint: fp } = await chrome.storage.local.get("fingerprint");
  if (!fp) { fp = gen(); await chrome.storage.local.set({ fingerprint: fp }); try { await setHeaders(fp); } catch (e) {} }
  try {
    await chrome.scripting.executeScript({
      target: { tabId: d.tabId, frameIds: [d.frameId] },
      world: "MAIN", injectImmediately: true, func: spoof, args: [fp]
    });
  } catch (e) {}
});

function spoof(fp) {
  const def = (o, p, v) => { try { Object.defineProperty(o, p, { get: () => v, configurable: true }); } catch (e) {} };
  def(navigator, "userAgent", fp.ua);
  def(navigator, "appVersion", fp.av);
  def(navigator, "platform", fp.p);
  def(navigator, "vendor", fp.v);
  def(navigator, "hardwareConcurrency", fp.hc);
  try { def(navigator, "deviceMemory", fp.dm); } catch (e) {}
  try { def(navigator, "webdriver", false); } catch (e) {}
  def(screen, "width", fp.sc[0]);
  def(screen, "height", fp.sc[1]);
  def(screen, "availWidth", fp.sc[0]);
  def(screen, "availHeight", fp.sc[1] - 40);
  def(screen, "colorDepth", fp.cd);
  def(screen, "pixelDepth", fp.cd);
  let s = (fp.cs >>> 0) || 1;
  function r() { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }
  function noise(c) {
    try {
      if (c.width <= 0 || c.height <= 0) return;
      if (c.width > 280 || c.height > 280) return;
      const x = c.getContext("2d", { willReadFrequently: true });
      if (!x) return;
      const id = x.getImageData(0, 0, c.width, c.height);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) if (r() < 0.03) { const ch = i + Math.floor(r() * 3); d[ch] = (d[ch] + (r() < 0.5 ? 1 : 255)) % 256; }
      x.putImageData(id, 0, 0);
    } catch (e) {}
  }
  try { const o = HTMLCanvasElement.prototype.toDataURL; HTMLCanvasElement.prototype.toDataURL = function () { noise(this); return o.apply(this, arguments); }; } catch (e) {}
  try { const o = HTMLCanvasElement.prototype.toBlob; HTMLCanvasElement.prototype.toBlob = function () { noise(this); return o.apply(this, arguments); }; } catch (e) {}
  const sg = (o) => function (p) { try { if (p === 37445) return fp.wv; if (p === 37446) return fp.wr; } catch (e) {} return o.apply(this, arguments); };
  try { if (window.WebGLRenderingContext) WebGLRenderingContext.prototype.getParameter = sg(WebGLRenderingContext.prototype.getParameter); } catch (e) {}
  try { if (window.WebGL2RenderingContext) WebGL2RenderingContext.prototype.getParameter = sg(WebGL2RenderingContext.prototype.getParameter); } catch (e) {}
  window.__oc = true;
}

chrome.runtime.onMessage.addListener((m, s, r) => {
  if (m.type === "RESET") { reset().then(r); return true; }
});

chrome.runtime.onInstalled.addListener(async () => {
  const { fingerprint: fp } = await chrome.storage.local.get("fingerprint");
  const u = fp || gen();
  if (!fp) await chrome.storage.local.set({ fingerprint: u });
  try { await setHeaders(u); } catch (e) {}
});
