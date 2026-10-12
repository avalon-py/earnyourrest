(function () {
  "use strict";

  var KEY = "earnyourrest.v1";
  var $ = function (id) { return document.getElementById(id); };

  var panels = {
    setup: $("setup"),
    gate: $("gate"),
    rest: $("rest-panel"),
    reflect: $("reflect")
  };

  // state: { step, work, rest, log: [{work, rest, note, ts}] }
  var state = load();

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && typeof s === "object") {
          s.log = Array.isArray(s.log) ? s.log : [];
          s.step = s.step || "setup";
          return s;
        }
      }
    } catch (e) { /* storage unavailable: run in memory */ }
    return { step: "setup", work: "", rest: "", log: [] };
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  function show(step) {
    state.step = step;
    Object.keys(panels).forEach(function (k) { panels[k].hidden = (k !== step); });
    $("gate-work").textContent = state.work;
    $("gate-rest").textContent = state.rest;
    $("rest-name").textContent = state.rest;
    if (step === "gate") {
      $("reward-box").classList.add("locked");
      $("lock-icon").hidden = false;
    }
    save();
    renderLog();
  }

  function renderLog() {
    var n = state.log.length;
    $("count").textContent = n === 0
      ? "No earned rests yet."
      : n + (n === 1 ? " rest earned so far." : " rests earned so far.");

    var ul = $("log");
    ul.innerHTML = "";
    state.log.slice(-5).reverse().forEach(function (e) {
      var li = document.createElement("li");
      var b = document.createElement("b");
      b.textContent = e.work;
      li.appendChild(b);
      li.appendChild(document.createTextNode(" → " + e.rest));
      if (e.note) {
        var br = document.createElement("br");
        li.appendChild(br);
        li.appendChild(document.createTextNode("“" + e.note + "”"));
      }
      ul.appendChild(li);
    });
  }

  function reset() {
    state.work = "";
    state.rest = "";
    $("work").value = "";
    $("rest").value = "";
    $("note").value = "";
    show("setup");
  }

  $("lock").addEventListener("click", function () {
    var w = $("work").value.trim();
    var r = $("rest").value.trim();
    if (!w) { $("work").focus(); return; }
    if (!r) { $("rest").focus(); return; }
    state.work = w;
    state.rest = r;
    show("gate");
  });

  $("done").addEventListener("click", function () {
    var box = $("reward-box");
    box.classList.remove("locked");
    $("lock-icon").hidden = true;
    show("rest");
  });

  $("reset").addEventListener("click", reset);

  $("rest-over").addEventListener("click", function () { show("reflect"); });

  function finish(note) {
    state.log.push({ work: state.work, rest: state.rest, note: note, ts: Date.now() });
    reset();
  }

  $("save").addEventListener("click", function () { finish($("note").value.trim()); });
  $("skip").addEventListener("click", function () { finish(""); });

  // Enter key moves through the setup fields
  $("work").addEventListener("keydown", function (e) { if (e.key === "Enter") $("rest").focus(); });
  $("rest").addEventListener("keydown", function (e) { if (e.key === "Enter") $("lock").click(); });

  // Restore a session in progress
  $("work").value = state.step === "setup" ? state.work : "";
  $("rest").value = state.step === "setup" ? state.rest : "";
  if (state.step !== "setup" && (!state.work || !state.rest)) state.step = "setup";
  if (state.step === "rest" || state.step === "reflect") {
    $("reward-box").classList.remove("locked");
    $("lock-icon").hidden = true;
  }
  show(state.step);
})();