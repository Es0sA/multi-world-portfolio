/* Shared by the hub and every world: the commission tab and modal, and the
   sample marker style. Plain script, no build step. */
(function () {
  var EMAIL = "esosaosaretin@gmail.com";
  var WORLDS = [
    { id: "terminal-office", file: "terminal-office.html", name: "Terminal Office", job: "Developer", tier: "Regular", c: "93,255,138" },
    { id: "cpu-and-monitor", file: "cpu-and-monitor.html", name: "CPU and Monitor", job: "Developer", tier: "Crazy", c: "255,157,77" },
    { id: "circuit-city", file: "circuit-city.html", name: "Circuit City", job: "Developer", tier: "Beyond", c: "77,166,255" },
    { id: "gallery-wall", file: "gallery-wall.html", name: "Gallery Wall", job: "Designer", tier: "Regular", c: "240,240,240" },
    { id: "sketchbook", file: "sketchbook-explosion.html", name: "Sketchbook Explosion", job: "Designer", tier: "Crazy", c: "255,216,77" },
    { id: "paint-universe", file: "paint-universe.html", name: "Paint Universe", job: "Designer", tier: "Beyond", c: "255,111,216" },
    { id: "comic-page", file: "comic-page.html", name: "Comic Page", job: "Illustrator and Comic Artist", tier: "Regular", c: "255,77,109" },
    { id: "pop-up-book", file: "pop-up-book.html", name: "Pop-Up Book", job: "Illustrator and Comic Artist", tier: "Crazy", c: "180,140,255" },
    { id: "ink-dimension", file: "ink-dimension.html", name: "Ink Dimension", job: "Illustrator and Comic Artist", tier: "Beyond", c: "154,163,184" }
  ];
  var KEY = "cas-last-world";
  var file = (location.pathname.split("/").pop() || "").toLowerCase();
  var here = WORLDS.filter(function (w) { return w.file === file; })[0] || null;
  var pick = here;
  if (here) { try { sessionStorage.setItem(KEY, here.id); } catch (e) {} }
  else {
    try { var id = sessionStorage.getItem(KEY); pick = WORLDS.filter(function (w) { return w.id === id; })[0] || null; } catch (e) {}
  }
  var accent = (here || pick || { c: "124,244,255" }).c;
  var isHub = !here;

  var css = document.createElement("style");
  css.textContent =
    ".smp-tag{display:inline-block;font:700 9px/1 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;padding:3px 6px;border:1px dashed currentColor;border-radius:2px;vertical-align:middle;opacity:.9}" +
    ".smp-legend{font:12px/1.4 system-ui,sans-serif;opacity:.85}" +
    ".smp-legend .smp-tag{margin-right:6px}" +
    "#cm-tab{position:fixed;right:0;top:42%;z-index:8000;writing-mode:vertical-rl;padding:14px 8px;font:700 11px/1 system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#fff;background:rgba(8,10,20,.88);border:1px solid rgb(var(--cm,124,244,255));border-right:0;border-radius:10px 0 0 10px;cursor:pointer;box-shadow:0 0 18px rgba(var(--cm,124,244,255),.35);-webkit-tap-highlight-color:transparent}" +
    "@media (max-width:700px){#cm-tab.hub{position:absolute;top:238px;left:50%;right:auto;transform:translateX(-50%)}#cm-tab{writing-mode:horizontal-tb;top:64px;right:12px;padding:7px 12px;border:1px solid rgb(var(--cm,124,244,255));border-radius:999px;font-size:11px;letter-spacing:.12em}}" +
    "#cm-tab:hover{background:rgb(var(--cm,124,244,255));color:#05060c}" +
    "#cm-back{position:fixed;inset:0;z-index:9000;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(2,3,10,.78);-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px)}" +
    "#cm-back.on{display:flex}" +
    "#cm-card{width:100%;max-width:420px;max-height:92vh;overflow:auto;padding:22px;border-radius:16px;background:#0b0f1f;color:#e8ecf8;border:1px solid rgb(var(--cm,124,244,255));font:15px/1.5 system-ui,sans-serif;box-shadow:0 0 50px rgba(var(--cm,124,244,255),.25)}" +
    "#cm-card h2{font:600 21px/1.25 system-ui,sans-serif;margin:0 0 6px}" +
    "#cm-card p{margin:0 0 12px;color:#9aa4c4;font-size:13px}" +
    "#cm-card label{display:block;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#9aa4c4;margin:12px 0 4px}" +
    "#cm-card select,#cm-card input,#cm-card textarea{width:100%;padding:10px;font:16px system-ui,sans-serif;color:#e8ecf8;background:#05070f;border:1px solid #2a3356;border-radius:8px}" +
    "#cm-card textarea{min-height:70px;resize:vertical}" +
    "#cm-card .cm-row{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}" +
    "#cm-card .cm-row a,#cm-card .cm-row button{flex:1;min-width:120px;padding:11px 14px;text-align:center;text-decoration:none;font:600 14px system-ui,sans-serif;border-radius:999px;border:1px solid rgb(var(--cm,124,244,255));background:transparent;color:#e8ecf8;cursor:pointer}" +
    "#cm-card .cm-row .cm-go{background:rgb(var(--cm,124,244,255));color:#05060c}";
  document.head.appendChild(css);
  document.documentElement.style.setProperty("--cm", accent);

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  var tab = document.createElement("button");
  tab.id = "cm-tab"; if (isHub) tab.className = "hub"; tab.type = "button"; tab.textContent = "Commission this";
  tab.setAttribute("aria-haspopup", "dialog");
  var back = document.createElement("div");
  back.id = "cm-back";
  var opts = WORLDS.map(function (w) {
    return '<option value="' + w.id + '"' + (pick && pick.id === w.id ? " selected" : "") + ">" + esc(w.job + ": " + w.name + " (" + w.tier + ")") + "</option>";
  }).join("");
  back.innerHTML =
    '<div id="cm-card" role="dialog" aria-modal="true" aria-labelledby="cm-h">' +
    '<h2 id="cm-h">Want a portfolio like this?</h2>' +
    "<p>This site is a demo of what I can build for you. Pick the world closest to your work. Your own projects replace the sample content.</p>" +
    '<label for="cm-w">World</label><select id="cm-w">' + opts + "</select>" +
    '<label for="cm-n">Your name</label><input id="cm-n" autocomplete="name">' +
    '<label for="cm-m">About your work</label><textarea id="cm-m" placeholder="What you do, and a link if you have one"></textarea>' +
    '<div class="cm-row"><a class="cm-go" id="cm-send" href="#">Write the email</a><button type="button" id="cm-x">Close</button></div></div>';

  function link() {
    var w = WORLDS.filter(function (x) { return x.id === document.getElementById("cm-w").value; })[0];
    var n = document.getElementById("cm-n").value.trim(), m = document.getElementById("cm-m").value.trim();
    var body = "Hi Esosa,\n\nI would like a portfolio like " + w.name + " (" + w.tier + " " + w.job + " world).\n\n" +
      (n ? "My name: " + n + "\n" : "") + (m ? "My work: " + m + "\n" : "") + "\nThanks";
    return "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Portfolio commission: " + w.name) + "&body=" + encodeURIComponent(body);
  }
  function open() {
    if (pick) document.getElementById("cm-w").value = pick.id;
    back.classList.add("on"); document.getElementById("cm-w").focus();
  }
  function close() { back.classList.remove("on"); tab.focus(); }
  function ready() {
    document.body.appendChild(tab); document.body.appendChild(back);
    tab.addEventListener("click", open);
    document.getElementById("cm-x").addEventListener("click", close);
    back.addEventListener("click", function (e) { if (e.target === back) close(); });
    document.getElementById("cm-send").addEventListener("click", function () { this.setAttribute("href", link()); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && back.classList.contains("on")) close(); });
    window.openCommission = open;
    /* hide the tab while any viewer, lightbox or dialog is open, restore it after */
    var OPEN = "#lb.open,#viewer.open,#dossier.open,#parts.open,#dlg.on,#notice:not([hidden])";
    function sync() { tab.style.display = document.querySelector(OPEN) ? "none" : ""; }
    new MutationObserver(sync).observe(document.body, { attributes: true, subtree: true, attributeFilter: ["class", "hidden"] });
    sync();
  }
  if (document.body) ready(); else document.addEventListener("DOMContentLoaded", ready);
})();
