(function () {
  if (window.__oc) return;
  window.__oc = true;

  const host = document.createElement("div");
  host.style.cssText = "all:initial;position:fixed;top:14px;right:14px;z-index:2147483647;";
  const sh = host.attachShadow({ mode: "open" });

  sh.innerHTML = `
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .card { width: 150px; background: #0f1226; border-radius: 12px; overflow: hidden; border: 1px solid #232855; box-shadow: 0 10px 30px rgba(0,0,0,.45); }
    .top { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 11px 9px 6px; }
    .title { color: #fff; font-weight: 700; font-size: 13px; }
    .x { flex: none; width: 18px; height: 18px; border: none; border-radius: 6px; cursor: pointer; background: #232855; color: #9aa0c0; font-size: 11px; line-height: 1; display: flex; align-items: center; justify-content: center; transition: background .15s, color .15s; }
    .x:hover { background: #ff7a8a; color: #fff; }
    .btn { display: block; width: calc(100% - 20px); margin: 4px 10px 8px; border: none; cursor: pointer; color: #fff; font-weight: 700; font-size: 12px; padding: 9px; border-radius: 9px; background: linear-gradient(135deg, #7c5cff, #4a8bff); transition: filter .15s, transform .08s; }
    .btn:hover { filter: brightness(1.1); }
    .btn:active { transform: translateY(1px); }
    .btn:disabled { opacity: .6; cursor: default; }
    .credit { text-align: center; font-size: 8px; color: #5a5f80; padding: 0 0 7px; letter-spacing: .4px; }
    .dot { display: none; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; border: 1px solid #232855; background: linear-gradient(135deg, #7c5cff, #4a8bff); color: #fff; font-size: 16px; align-items: center; justify-content: center; box-shadow: 0 6px 16px rgba(0,0,0,.4); transition: filter .15s, transform .08s; }
    .dot:hover { filter: brightness(1.15); }
    .dot:active { transform: translateY(1px); }
    :host(.hidden) .card { display: none; }
    :host(.hidden) .dot { display: flex; }
  </style>
  <div class="card">
    <div class="top">
      <div class="title">Ome.tv Cleaner</div>
      <button class="x" id="x">✕</button>
    </div>
    <button class="btn" id="b">Clean</button>
    <div class="credit">By PyroMan_FB</div>
  </div>
  <div class="dot" id="d">↻</div>`;

  function mount() {
    if (!document.body) { setTimeout(mount, 80); return; }
    if (!host.parentNode) document.body.appendChild(host);
  }
  mount();

  const b = sh.getElementById("b");
  const x = sh.getElementById("x");
  const d = sh.getElementById("d");

  chrome.storage.local.get("h", (r) => { if (r.h) host.classList.add("hidden"); });

  x.addEventListener("click", () => { host.classList.add("hidden"); chrome.storage.local.set({ h: true }); });
  d.addEventListener("click", () => { host.classList.remove("hidden"); chrome.storage.local.set({ h: false }); });

  b.addEventListener("click", () => {
    b.disabled = true;
    b.textContent = "Czekaj…";
    chrome.runtime.sendMessage({ type: "RESET" }, () => {});
  });
})();
