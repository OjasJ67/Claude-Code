/* ==========================================================================
   Agar & Oak: rendering and inquiry logic
   Reads config.js, references.js, stats.js and products.js (classic scripts,
   so the site works when index.html is opened straight from disk).
   ========================================================================== */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var hasConfig = typeof EMAIL !== "undefined";
  var flags = typeof FLAGS !== "undefined" ? FLAGS : { njNurseryCertified: false, usdaPPQ526Permit: false };
  var products = typeof PRODUCTS !== "undefined" ? PRODUCTS : [];
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Small helpers ---------- */
  function money(n) { return "$" + (Number.isInteger(n) ? n : n.toFixed(2)); }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function productById(id) {
    for (var i = 0; i < products.length; i++) if (products[i].id === id) return products[i];
    return null;
  }
  function isCrew(p) { return p && p.line === "crews"; }
  function canShip(p) { return !isCrew(p) || flags.usdaPPQ526Permit; }
  // Crews: shipped price only once the USDA permit is in; otherwise pickup price.
  function priceFor(p, delivery) {
    if (!isCrew(p)) return p.price;
    return flags.usdaPPQ526Permit && delivery === "shipping" ? p.price : p.pickupPrice;
  }
  function scrollToEl(el) { el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }); }

  /* ---------- Contact details, year, Instagram ---------- */
  function fillContact() {
    if (!hasConfig) return;
    $$('[data-contact="email"]').forEach(function (a) { a.href = "mailto:" + EMAIL; a.textContent = EMAIL; });
    $$('[data-contact="phone"]').forEach(function (a) { a.href = "tel:" + PHONE; a.textContent = typeof PHONE_DISPLAY !== "undefined" ? PHONE_DISPLAY : PHONE; });
    var ig = $('[data-contact="instagram"]');
    var igItem = $('[data-contact="instagram-item"]');
    if (ig && igItem && INSTAGRAM) {
      var handle = INSTAGRAM.replace(/^@/, "");
      ig.href = /^https?:\/\//.test(handle) ? handle : "https://www.instagram.com/" + encodeURIComponent(handle) + "/";
      ig.textContent = /^https?:\/\//.test(handle) ? "Instagram" : "@" + handle;
      igItem.hidden = false;
    }
  }
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Mobile menu ---------- */
  var toggle = $(".nav-toggle");
  var nav = $("#site-nav");
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", function () { setOpen(toggle.getAttribute("aria-expanded") !== "true"); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
    });
  }

  /* ---------- References ---------- */
  function refLinks(nums) {
    return nums.map(function (n) {
      return '<a href="#ref-' + n + '" aria-label="Reference ' + n + '">' + n + "</a>";
    }).join(",");
  }
  function renderReferences() {
    var list = $("#ref-list");
    if (!list || typeof REFERENCES === "undefined") return;
    list.innerHTML = REFERENCES.map(function (r, i) {
      var link = r.url
        ? ' <a href="' + escapeHtml(r.url) + '" target="_blank" rel="noopener">' + escapeHtml(r.url) +
          '<span class="sr-only"> (opens in a new tab)</span></a>'
        : "";
      return '<li id="ref-' + (i + 1) + '">' + r.html + link + "</li>";
    }).join("");
  }

  /* ---------- Stats ---------- */
  function renderStats() {
    if (typeof STATS === "undefined") return;
    $$("[data-stats]").forEach(function (grid) {
      var place = grid.getAttribute("data-stats");
      var items = STATS.filter(function (s) { return s.placement === place; });
      if (place === "band") items = items.slice(0, 6);
      grid.innerHTML = items.map(function (s) {
        var len = s.value.length;
        var lenAttr = len > 4 ? ' data-len style="--len:' + len + '"' : "";
        return '<figure class="stat' + (place === "band" ? "" : " stat-single") + '">' +
          '<span class="stat-value"' + lenAttr + ">" + escapeHtml(s.value) + "</span>" +
          '<figcaption><p class="stat-label">' + s.label + "</p>" +
          '<p class="stat-source">Source: ' + s.source + " <sup>" + refLinks(s.refs) + "</sup></p></figcaption>" +
          "</figure>";
      }).join("");
    });
  }

  /* ---------- Product cards ---------- */
  function cardInfo(p) {
    var badges = [];
    var cta;
    var note = "";
    var price;
    var unit = p.priceUnit;
    if (isCrew(p)) {
      cta = "Buy now";
      if (flags.usdaPPQ526Permit) {
        badges.push({ text: "Ships to the lower 48 states", cls: "badge-solid" });
        price = p.price;
        unit += ", shipped";
      } else {
        badges.push({ text: "NJ local pickup only", cls: "" });
        price = p.pickupPrice;
        unit += ", pickup";
      }
      note = "Not available to Hawaii, Alaska or U.S. territories.";
    } else {
      price = p.price;
      if (p.status === "coming-later") {
        badges.push({ text: "Coming later · taking inquiries", cls: "badge-muted" });
        cta = "Reserve: inquire";
      } else if (flags.njNurseryCertified) {
        badges.push({ text: "Available", cls: "badge-solid" });
        cta = "Buy now";
      } else {
        badges.push({ text: "Waitlist · taking inquiries", cls: "" });
        cta = "Reserve: inquire";
      }
    }
    if (p.wholesaleOnly) badges.push({ text: "Wholesale · min " + p.minQty, cls: "badge-muted" });
    return { badges: badges, cta: cta, note: note, price: price, unit: unit };
  }

  function renderProducts() {
    $$("[data-line]").forEach(function (grid) {
      var line = grid.getAttribute("data-line");
      grid.innerHTML = products.filter(function (p) { return p.line === line; }).map(function (p) {
        var info = cardInfo(p);
        var titleId = "p-" + p.id;
        return '<li><article class="product" aria-labelledby="' + titleId + '">' +
          '<img class="product-img" src="' + escapeHtml(p.image || "") + '" width="400" height="300" loading="lazy" alt="Photo coming soon: ' + escapeHtml(p.name) + '">' +
          '<div class="product-body">' +
            '<h3 id="' + titleId + '">' + escapeHtml(p.name) + "</h3>" +
            '<p class="product-purpose">' + p.purpose + "</p>" +
            '<div class="product-foot">' +
              '<p class="price">' + money(info.price) + ' <span class="price-unit">' + escapeHtml(info.unit) + "</span></p>" +
              '<ul class="badges">' + info.badges.map(function (b) {
                return '<li class="badge ' + b.cls + '">' + escapeHtml(b.text) + "</li>";
              }).join("") + "</ul>" +
              (info.note ? '<p class="product-note">' + info.note + "</p>" : "") +
              '<button type="button" class="btn" data-product="' + escapeHtml(p.id) + '">' + escapeHtml(info.cta) +
                '<span class="sr-only">: ' + escapeHtml(p.name) + "</span></button>" +
            "</div>" +
          "</div>" +
        "</article></li>";
      }).join("");
    });
  }

  /* ---------- FAQ: shipping answer driven by flags ---------- */
  function renderShippingFaq() {
    var el = $("#faq-shipping");
    if (!el) return;
    var crews = flags.usdaPPQ526Permit
      ? "Cleanup crews ship to the lower 48 states, or you can pick up locally in New Jersey."
      : "Cleanup crews are New Jersey local pickup only for now, until our USDA shipping permit arrives.";
    var plants = flags.njNurseryCertified
      ? "Plants can be picked up in New Jersey; ask about shipping to your state and we'll confirm."
      : "Plants are on a waitlist while our New Jersey nursery certificate is pending; we'll confirm pickup or shipping when they're ready.";
    el.textContent = crews + " " + plants + " We can't send cleanup crews to Hawaii, Alaska or U.S. territories.";
  }

  /* ======================================================================
     Inquiry flow
     ====================================================================== */
  var form = $("#inquiry-form");
  if (!form) { fillContact(); return; }

  var els = {
    product: $("#inquiry-product"),
    qty: $("#inquiry-qty"),
    qtyHint: $("#qty-hint"),
    orderFields: $("#order-fields"),
    shipping: $("#delivery-shipping"),
    shippingNote: $("#shipping-note"),
    business: $("#inquiry-business"),
    businessFields: $("#business-fields"),
    businessName: $("#inquiry-business-name"),
    town: $("#inquiry-town"),
    month: $("#inquiry-month"),
    name: $("#inquiry-name"),
    message: $("#inquiry-message"),
    regenerate: $("#regenerate"),
    chip: $("#inquiry-chip"),
    chipText: $("#chip-text"),
    chipChange: $("#chip-change"),
    email: $("#send-email"),
    sms: $("#send-sms"),
    call: $("#send-call"),
    copy: $("#copy-message"),
    status: $("#copy-status"),
    heading: $("#contact-title")
  };

  var state = {
    productId: "",
    qty: 1,
    delivery: "pickup",
    business: false,
    name: "",
    businessName: "",
    town: "",
    month: "",
    edited: false, // true once the visitor types in the message box
    subject: ""    // custom email subject (planner kits, chat questions)
  };

  function fillProductSelect() {
    var groups = { plants: "Lab-grown plants", crews: "Living cleanup crews" };
    Object.keys(groups).forEach(function (line) {
      var og = document.createElement("optgroup");
      og.label = groups[line];
      products.filter(function (p) { return p.line === line; }).forEach(function (p) {
        var o = document.createElement("option");
        o.value = p.id;
        o.textContent = p.name;
        og.appendChild(o);
      });
      els.product.appendChild(og);
    });
  }

  function minQty(p) { return p && p.wholesaleOnly ? (p.minQty || 25) : 1; }
  // Wholesale-only products always use the business template.
  function isBusiness(p) { return state.business || !!(p && p.wholesaleOnly); }

  function buildMessage() {
    var p = productById(state.productId);
    var name = state.name.trim() || "[your name]";
    if (!p) return "Hi Agar & Oak, I have a question: \n\n";
    if (isBusiness(p)) {
      return "Hi Agar & Oak,\n\n" +
        "I'm writing from " + (state.businessName.trim() || "[your shop]") +
        " in " + (state.town.trim() || "[town]") +
        ". We'd like wholesale pricing for " + state.qty + " of the " + p.name +
        ", ideally by " + (state.month.trim() || "[month]") + ".\n" +
        "Could you send your wholesale sheet and availability?\n\n" +
        "Thanks,\n" + name;
    }
    var how = state.delivery === "shipping" ? "shipping" : "local pickup";
    return "Hi Agar & Oak,\n\n" +
      "I'm interested in the " + p.name + " (" + money(priceFor(p, state.delivery)) + " " + p.priceUnit + "). Quantity: " + state.qty + ".\n" +
      "I'd prefer " + how + ".\n" +
      "Could you let me know availability and next steps?\n\n" +
      "Thanks,\n" + name;
  }

  function updateSendLinks() {
    var p = productById(state.productId);
    var subject = state.subject || "Inquiry: " + (p ? p.name : "General question");
    var body = els.message.value;
    if (hasConfig) {
      els.email.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      els.sms.href = "sms:" + PHONE + "?&body=" + encodeURIComponent(body);
      els.call.href = "tel:" + PHONE;
    }
  }

  // Sync every control from state, then regenerate the message unless the visitor edited it.
  function render(opts) {
    opts = opts || {};
    var p = productById(state.productId);

    // Quantity limits
    var min = minQty(p);
    state.qty = Math.max(min, Math.min(50, parseInt(state.qty, 10) || min));
    els.qty.min = min;
    els.qty.value = state.qty;
    els.qtyHint.textContent = min > 1 ? "Wholesale minimum is " + min + ", up to 50." : "1 to 50.";
    $$(".stepper-btn").forEach(function (b) {
      var step = parseInt(b.getAttribute("data-step"), 10);
      b.disabled = step < 0 ? state.qty <= min : state.qty >= 50;
    });

    // Pickup vs shipping
    var shipOk = !p || canShip(p);
    els.shipping.disabled = !shipOk;
    els.shippingNote.hidden = shipOk;
    if (!shipOk) state.delivery = "pickup";
    $$('input[name="delivery"]').forEach(function (r) { r.checked = r.value === state.delivery; });

    // Product-only fields are hidden for a general question
    els.orderFields.hidden = !p;
    els.product.value = state.productId;

    // Wholesale
    els.business.checked = isBusiness(p);
    els.business.disabled = !!(p && p.wholesaleOnly);
    els.businessFields.hidden = !isBusiness(p);

    // Summary chip
    if (p) {
      els.chipText.textContent = p.name + " · " + money(priceFor(p, state.delivery));
      els.chipChange.href = p.line === "crews" ? "#crew-products" : "#plant-products";
      els.chip.hidden = false;
    } else {
      els.chip.hidden = true;
    }

    // Message
    if (opts.force) state.edited = false;
    if (!state.edited) els.message.value = buildMessage();
    els.regenerate.hidden = !state.edited;
    updateSendLinks();
  }

  function setUrl(id) {
    if (!window.history || !history.replaceState) return;
    var url = window.location.pathname + (id ? "?product=" + encodeURIComponent(id) : "") + "#contact";
    try { history.replaceState(null, "", url); } catch (e) { /* file:// in some browsers */ }
  }

  function selectProduct(id, opts) {
    opts = opts || {};
    var p = productById(id);
    state.productId = p ? p.id : "";
    state.subject = "";
    if (p && state.qty < minQty(p)) state.qty = minQty(p);
    if (p && !canShip(p)) state.delivery = "pickup";
    render({ force: opts.force });
    setUrl(state.productId);
  }

  function goToContact() {
    var section = $("#contact");
    scrollToEl(section);
    // Move keyboard focus without a second jump.
    els.heading.focus({ preventScroll: true });
  }

  // Prefill the form with a ready-made message (used by the setup planner and the chat).
  function inquireWith(subject, message) {
    state.productId = "";
    render({ force: true });
    state.subject = subject;
    state.edited = true;
    els.message.value = message;
    els.regenerate.hidden = false;
    updateSendLinks();
    setUrl("");
    goToContact();
  }
  window.AgarOak = { inquireWith: inquireWith };

  /* ---------- Events ---------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-product]");
    if (!btn) return;
    // A product button is a fresh choice: write a new message for it.
    state.qty = 1;
    selectProduct(btn.getAttribute("data-product"), { force: true });
    goToContact();
  });

  els.chipChange.addEventListener("click", function (e) {
    var target = $(els.chipChange.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    scrollToEl(target);
    var firstBtn = $('[data-product="' + state.productId + '"]') || target;
    firstBtn.focus({ preventScroll: true });
  });

  els.product.addEventListener("change", function () {
    selectProduct(els.product.value);
  });

  els.qty.addEventListener("change", function () { state.qty = els.qty.value; render(); });
  $$(".stepper-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      state.qty = (parseInt(state.qty, 10) || 1) + parseInt(b.getAttribute("data-step"), 10);
      render();
    });
  });

  $$('input[name="delivery"]').forEach(function (r) {
    r.addEventListener("change", function () { if (r.checked) { state.delivery = r.value; render(); } });
  });

  els.business.addEventListener("change", function () {
    state.business = els.business.checked;
    render();
  });

  [["name", els.name], ["businessName", els.businessName], ["town", els.town], ["month", els.month]].forEach(function (pair) {
    pair[1].addEventListener("input", function () { state[pair[0]] = pair[1].value; render(); });
  });

  els.message.addEventListener("input", function () {
    state.edited = els.message.value !== buildMessage();
    els.regenerate.hidden = !state.edited;
    updateSendLinks();
  });

  els.regenerate.addEventListener("click", function () {
    state.subject = "";
    render({ force: true });
    els.message.focus();
  });

  // Copy message, with a fallback for older browsers and file:// pages.
  els.copy.addEventListener("click", function () {
    var text = els.message.value;
    var done = function () {
      els.status.textContent = "Copied";
      window.clearTimeout(done.t);
      done.t = window.setTimeout(function () { els.status.textContent = ""; }, 4000);
    };
    var fallback = function () {
      els.message.focus();
      els.message.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      if (ok) done(); else els.status.textContent = "Select the message and copy it by hand.";
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  });

  form.addEventListener("submit", function (e) { e.preventDefault(); });

  /* ---------- Boot ---------- */
  fillContact();
  renderReferences();
  renderStats();
  renderProducts();
  renderShippingFaq();
  fillProductSelect();

  var params = new URLSearchParams(window.location.search);
  var fromUrl = params.get("product");
  if (fromUrl && productById(fromUrl)) {
    selectProduct(fromUrl, { force: true });
  } else {
    render({ force: true });
  }

  // Content above #contact was just rendered, so re-apply any #hash jump.
  if (window.location.hash) {
    var target = document.getElementById(window.location.hash.slice(1));
    if (target) {
      target.scrollIntoView({ block: "start" });
      if (target.id === "contact" && fromUrl) els.heading.focus({ preventScroll: true });
    }
  }

})();
