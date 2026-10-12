/* ==========================================================================
   Agar & Oak: "What makes us different" label explorer
   Renders the sample labels from differences.js. Each printed line is a
   button; choosing it shows how we deliver that promise.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.getElementById("diff");
  if (!root || typeof DIFFERENCES === "undefined") return;

  var flags = typeof FLAGS !== "undefined" ? FLAGS : { njNurseryCertified: false, usdaPPQ526Permit: false };
  var survivalRate = typeof SURVIVAL_RATE !== "undefined" ? String(SURVIVAL_RATE).trim() : "";
  var labels = DIFFERENCES.labels;

  var els = {
    tabs: document.getElementById("diff-tabs"),
    panel: document.getElementById("diff-panel"),
    tag: document.getElementById("diff-tag"),
    detail: document.getElementById("diff-detail"),
    nav: document.getElementById("diff-nav"),
    extras: document.getElementById("diff-extras")
  };

  var state = {
    label: labels[0].id,
    chosen: {},                       // last chosen line per label
    tank: null
  };
  labels.forEach(function (l) { state.chosen[l.id] = l.features[0].id; });

  var packDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }
  function labelById(id) { return labels.filter(function (l) { return l.id === id; })[0]; }
  function tankFeature() {
    for (var i = 0; i < labels.length; i++) {
      for (var j = 0; j < labels[i].features.length; j++) {
        if (labels[i].features[j].tanks) return labels[i].features[j];
      }
    }
    return null;
  }
  function permitText(item) {
    var extra = flags.usdaPPQ526Permit ? item.afterPermit : item.beforePermit;
    return extra ? " " + extra : "";
  }
  // The survival line switches to the measured wording once SURVIVAL_RATE is set.
  function lineOf(f) { return survivalRate && f.lineMeasured ? f.lineMeasured.replace("{rate}", survivalRate) : f.line; }
  function bodyOf(f) { return survivalRate && f.bodyMeasured ? f.bodyMeasured.replace("{rate}", survivalRate) : f.body; }
  function fillLine(text) {
    return text.replace("{tank}", state.tank || "").replace("{date}", packDate);
  }

  var tf = tankFeature();
  if (tf) state.tank = tf.tanks[0];

  /* ---------- Tabs ---------- */
  function renderTabs() {
    els.tabs.textContent = "";
    labels.forEach(function (l) {
      var b = el("button", "diff-tab", l.tab);
      b.type = "button";
      b.id = "diff-tab-" + l.id;
      b.setAttribute("role", "tab");
      b.setAttribute("aria-controls", "diff-panel");
      var selected = l.id === state.label;
      b.setAttribute("aria-selected", String(selected));
      b.tabIndex = selected ? 0 : -1;
      b.addEventListener("click", function () { selectLabel(l.id, false); });
      els.tabs.appendChild(b);
    });
  }

  els.tabs.addEventListener("keydown", function (e) {
    var keys = { ArrowRight: 1, ArrowLeft: -1, Home: "first", End: "last" };
    if (!(e.key in keys)) return;
    e.preventDefault();
    var i = labels.map(function (l) { return l.id; }).indexOf(state.label);
    var k = keys[e.key];
    var next = k === "first" ? 0 : k === "last" ? labels.length - 1 : (i + k + labels.length) % labels.length;
    selectLabel(labels[next].id, true);
  });

  function selectLabel(id, focusTab) {
    state.label = id;
    renderTabs();
    renderPanel();
    els.panel.setAttribute("aria-labelledby", "diff-tab-" + id);
    if (focusTab) document.getElementById("diff-tab-" + id).focus();
  }

  /* ---------- Label ---------- */
  function renderTag(label) {
    els.tag.textContent = "";
    var head = el("div", "tag-head");
    var logo = el("img", "tag-logo");
    logo.src = "assets/img/logo.svg";
    logo.alt = "";
    logo.width = 30;
    logo.height = 30;
    head.appendChild(logo);
    var names = el("div");
    names.appendChild(el("p", "tag-kicker", label.kicker));
    names.appendChild(el("p", "tag-name", label.name));
    head.appendChild(names);
    els.tag.appendChild(head);

    var list = el("ol", "tag-lines");
    label.features.forEach(function (f, i) {
      var li = el("li");
      var b = el("button", "tag-line");
      b.type = "button";
      b.setAttribute("data-feature", f.id);
      b.setAttribute("aria-pressed", String(state.chosen[label.id] === f.id));
      b.appendChild(el("span", "tag-num", String(i + 1)));
      b.appendChild(el("span", "tag-text", fillLine(lineOf(f))));
      b.addEventListener("click", function () { choose(label, f.id, null); });
      li.appendChild(b);
      list.appendChild(li);
    });
    els.tag.appendChild(list);
    els.tag.appendChild(el("p", "tag-foot", "Agar & Oak · New Jersey"));
  }

  // Select a line; keep keyboard focus on whatever control the visitor used.
  function choose(label, featureId, navDir) {
    state.chosen[label.id] = featureId;
    renderTag(label);
    renderDetail(label);
    if (navDir) {
      var btn = els.nav.querySelector('[data-dir="' + navDir + '"]');
      if (btn && btn.disabled) btn = els.nav.querySelector('button:not(:disabled)');
      if (btn) btn.focus();
    } else {
      var line = els.tag.querySelector('[data-feature="' + featureId + '"]');
      if (line) line.focus();
    }
  }

  function renderNav(label, index) {
    els.nav.textContent = "";
    var count = label.features.length;
    var prev = el("button", "", "Previous");
    prev.type = "button";
    prev.setAttribute("data-dir", "prev");
    prev.disabled = index === 0;
    prev.addEventListener("click", function () { choose(label, label.features[index - 1].id, "prev"); });
    var next = el("button", "", "Next");
    next.type = "button";
    next.setAttribute("data-dir", "next");
    next.disabled = index === count - 1;
    next.addEventListener("click", function () { choose(label, label.features[index + 1].id, "next"); });
    els.nav.appendChild(prev);
    els.nav.appendChild(el("span", "detail-count", (index + 1) + " of " + count));
    els.nav.appendChild(next);
  }

  /* ---------- Detail ---------- */
  function renderDetail(label) {
    var index = 0;
    label.features.forEach(function (x, i) { if (x.id === state.chosen[label.id]) index = i; });
    var f = label.features[index];
    renderNav(label, index);
    els.detail.textContent = "";
    els.detail.appendChild(el("p", "detail-kicker", "How we deliver it"));
    els.detail.appendChild(el("h3", "detail-title", f.title));
    els.detail.appendChild(el("p", "detail-body", bodyOf(f) + permitText(f)));

    if (f.steps) {
      var ol = el("ol", "detail-steps");
      f.steps.forEach(function (s) { ol.appendChild(el("li", "", s)); });
      els.detail.appendChild(ol);
    }

    if (f.tanks) {
      var group = el("fieldset", "tank-pick");
      group.appendChild(el("legend", "", "Show the label for:"));
      var chips = el("div", "tank-chips");
      f.tanks.forEach(function (t) {
        var lab = el("label", "tank-chip");
        var input = el("input");
        input.type = "radio";
        input.name = "diff-tank";
        input.value = t;
        input.checked = t === state.tank;
        input.addEventListener("change", function () {
          state.tank = t;
          var line = els.tag.querySelector('[data-feature="' + f.id + '"] .tag-text');
          if (line) line.textContent = fillLine(lineOf(f));
        });
        lab.appendChild(input);
        lab.appendChild(el("span", "", t.charAt(0).toUpperCase() + t.slice(1)));
        chips.appendChild(lab);
      });
      group.appendChild(chips);
      els.detail.appendChild(group);
      appendLink("Not sure what your tank needs? Try the setup planner", "#planner");
    }
    if (f.id === "care") {
      var ask = el("button", "link-btn detail-link", "Ask the assistant how to plant out a jar");
      ask.type = "button";
      ask.setAttribute("data-open-chat", "");
      ask.setAttribute("data-chat-prompt", "How do I plant out a tissue-culture jar?");
      els.detail.appendChild(ask);
    }
    if (f.id === "ready") appendLink("See our rooted starter plants", "#plant-products");
    if (f.faq) appendLink("See what the guarantee covers", "#" + f.faq);
  }

  function appendLink(text, href) {
    var p = el("p", "detail-more");
    var a = el("a", "", text);
    a.href = href;
    p.appendChild(a);
    els.detail.appendChild(p);
  }

  function renderPanel() {
    var label = labelById(state.label);
    renderTag(label);
    renderDetail(label);
  }

  /* ---------- Extras ---------- */
  function renderExtras() {
    if (!els.extras || !DIFFERENCES.extras) return;
    els.extras.textContent = "";
    DIFFERENCES.extras.forEach(function (x) {
      var card = el("article", "extra");
      card.appendChild(el("h3", "", x.title));
      card.appendChild(el("p", "", x.body));
      var note = permitText(x).trim();
      if (note) card.appendChild(el("p", "extra-note", note));
      var b = el("button", "btn btn-invert", x.cta);
      b.type = "button";
      b.addEventListener("click", function () {
        if (window.AgarOak) window.AgarOak.inquireWith(x.subject, x.message);
      });
      card.appendChild(b);
      els.extras.appendChild(card);
    });
  }

  renderTabs();
  els.panel.setAttribute("aria-labelledby", "diff-tab-" + state.label);
  renderPanel();
  renderExtras();
})();
