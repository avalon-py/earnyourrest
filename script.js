(function () {
  "use strict";

  var KEY = "earnyourrest.v1";
  var $ = function (id) { return document.getElementById(id); };

  var panels = {
    setup: $("setup"),
    gate: $("gate"),
    rest: $("rest-panel"),
    reflect: $("reflect"),
    history: $("history")
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
    renderCount();
  }

  function renderCount() {
    var n = state.log.length;
    $("count").textContent = n === 0
      ? "No earned rests yet."
      : n + (n === 1 ? " rest earned so far." : " rests earned so far.");
  }

  function fmtDate(ts) {
    try {
      return new Date(ts).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
    } catch (e) {
      return new Date(ts).toString();
    }
  }

  function openHistory() {
    Object.keys(panels).forEach(function (k) { panels[k].hidden = (k !== "history"); });
    renderHistory();
  }

  function renderHistory() {
    var n = state.log.length;
    var withNotes = state.log.filter(function (e) { return e.note; }).length;
    $("history-summary").textContent = n === 0
      ? "Nothing here yet. Finish a cycle and it will show up."
      : n + (n === 1 ? " earned rest" : " earned rests") + ", " + withNotes +
        (withNotes === 1 ? " reflection" : " reflections") + ". Newest first.";
    $("history-actions").hidden = (n === 0);

    var ul = $("history-list");
    ul.innerHTML = "";
    for (var i = n - 1; i >= 0; i--) {
      ul.appendChild(historyItem(state.log[i], i));
    }
  }

  function historyItem(e, index) {
    var li = document.createElement("li");

    var d = document.createElement("div");
    d.className = "h-date";
    d.textContent = e.ts ? fmtDate(e.ts) : "";
    li.appendChild(d);

    var p = document.createElement("div");
    p.className = "h-pair";
    var b = document.createElement("b");
    b.textContent = e.work;
    var arrow = document.createElement("span");
    arrow.className = "h-arrow";
    arrow.textContent = " → ";
    p.appendChild(b);
    p.appendChild(arrow);
    p.appendChild(document.createTextNode(e.rest));
    li.appendChild(p);

    var note = document.createElement("p");
    note.className = "h-note" + (e.note ? "" : " none");
    note.textContent = e.note ? e.note : "No reflection";
    li.appendChild(note);

    var del = document.createElement("button");
    del.type = "button";
    del.className = "h-del";
    del.textContent = "Delete";
    del.addEventListener("click", function () {
      if (!window.confirm("Delete this entry?")) return;
      state.log.splice(index, 1);
      save();
      renderCount();
      renderHistory();
    });
    li.appendChild(del);

    return li;
  }

  function exportText() {
    var lines = ["Earn Your Rest: history", ""];
    for (var i = state.log.length - 1; i >= 0; i--) {
      var e = state.log[i];
      lines.push(fmtDate(e.ts));
      lines.push("Finished: " + e.work);
      lines.push("Rested: " + e.rest);
      lines.push("Reflection: " + (e.note || "(none)"));
      lines.push("");
    }
    var blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "earn-your-rest-history.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  $("history-open").addEventListener("click", openHistory);
  $("history-back").addEventListener("click", function () { show(state.step); });
  $("export").addEventListener("click", exportText);
  $("clear").addEventListener("click", function () {
    if (!window.confirm("Delete your whole history? This can't be undone.")) return;
    state.log = [];
    save();
    renderCount();
    renderHistory();
  });

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