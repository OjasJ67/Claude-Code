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
  function isNext(p) { return p && p.line === "next"; }
  // Plants are waitlist-only, with no prices shown, until the nursery certificate arrives.
  function isWaitlist(p) { return p && p.line === "plants" && !flags.njNurseryCertified; }
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
    } else if (isNext(p)) {
      price = null;
      badges.push({ text: "Testing · not for sale yet", cls: "badge-muted" });
      cta = "I'd use this";
    } else if (!flags.njNurseryCertified) {
      price = null;
      badges.push({ text: p.status === "coming-later" ? "Coming later · taking inquiries" : "Waitlist · taking inquiries", cls: p.status === "coming-later" ? "badge-muted" : "" });
      cta = "Join the waitlist";
    } else {
      price = p.price;
      if (p.status === "coming-later") {
        badges.push({ text: "Coming later · taking inquiries", cls: "badge-muted" });
        cta = "Reserve: inquire";
      } else {
        badges.push({ text: "Available", cls: "badge-solid" });
        cta = "Buy now";
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
          '<img class="product-img" src="' + escapeHtml(p.image || "") + '" width="400" height="300" loading="lazy" alt="' + escapeHtml(p.name) + '">' +
          '<div class="product-body">' +
            '<h3 id="' + titleId + '">' + escapeHtml(p.name) + "</h3>" +
            '<p class="product-purpose">' + p.purpose + "</p>" +
            '<div class="product-foot">' +
              (info.price != null ? '<p class="price">' + money(info.price) + ' <span class="price-unit">' + escapeHtml(info.unit) + "</span></p>" : "") +
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

    var ship = $("#faq-ship-crews");
    if (ship) {
      ship.textContent = flags.usdaPPQ526Permit
        ? "Yes, to the lower 48 states. We ship only species named on our USDA permit."
        : "Not yet. Cleanup crews are New Jersey pickup only until our USDA permit is issued.";
    }
    var shopsNote = $("#shops-note");
    if (shopsNote) shopsNote.hidden = flags.usdaPPQ526Permit;
  }

  /* ---------- Buttons and links that depend on settings ---------- */
  function applySettings() {
    // "What we make": plant button follows the nursery flag.
    $$("[data-plant-cta] [data-cta-label]").forEach(function (span) {
      span.textContent = flags.njNurseryCertified ? "Shop now" : "Join the waitlist";
    });
    // Survey button only when a survey link is set.
    var surveyUrl = typeof SURVEY_URL !== "undefined" ? String(SURVEY_URL).trim() : "";
    var surveyRow = $("#survey-row");
    if (surveyRow) {
      surveyRow.hidden = !surveyUrl;
      if (surveyUrl) $("#survey-link").href = surveyUrl;
    }
    // Link previews: full addresses from SITE_URL.
    var siteUrl = typeof SITE_URL !== "undefined" ? String(SITE_URL).trim() : "";
    if (siteUrl) {
      try {
        var og = $('meta[property="og:url"]');
        if (!og) {
          og = document.createElement("meta");
          og.setAttribute("property", "og:url");
          document.head.appendChild(og);
        }
        og.setAttribute("content", siteUrl);
        $$('meta[property="og:image"], meta[name="twitter:image"]').forEach(function (m) {
          m.setAttribute("content", new URL(m.getAttribute("content"), siteUrl).href);
        });
      } catch (e) { /* not a valid address yet */ }
    }
  }

  // A link to an FAQ item opens it.
  function openDetails(id) {
    var d = id && document.getElementById(id);
    if (d && d.tagName === "DETAILS") d.open = true;
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (a) openDetails(a.getAttribute("href").slice(1));
  });

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
    email: $("#inquiry-email"),
    emailError: $("#email-error"),
    message: $("#inquiry-message"),
    messageError: $("#message-error"),
    subject: $("#inquiry-subject"),
    regenerate: $("#regenerate"),
    chip: $("#inquiry-chip"),
    chipText: $("#chip-text"),
    chipChange: $("#chip-change"),
    send: $("#send-email"),
    sendLabel: $("#send-email-label"),
    sms: $("#send-sms"),
    call: $("#send-call"),
    status: $("#send-status"),
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
    var groups = { plants: "Lab-grown plants", crews: "Living cleanup crews", next: "Testing next (not for sale yet)" };
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
    if (isNext(p)) {
      return "Hi Agar & Oak,\n\n" +
        "I'd be interested in " + p.name.charAt(0).toLowerCase() + p.name.slice(1) +
        ". I'd buy about [how many] every [how often], and I'd expect to pay about [price].\n\n" +
        "Thanks,\n" + (state.name.trim() || "[your name and shop]");
    }
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
    if (isWaitlist(p)) {
      return "Hi Agar & Oak,\n\n" +
        "I'd like to join the waitlist for the " + p.name + ". Quantity: " + state.qty + ".\n" +
        "I'd prefer " + how + ".\n" +
        "Could you let me know when it's available?\n\n" +
        "Thanks,\n" + name;
    }
    return "Hi Agar & Oak,\n\n" +
      "I'm interested in the " + p.name + " (" + money(priceFor(p, state.delivery)) + " " + p.priceUnit + "). Quantity: " + state.qty + ".\n" +
      "I'd prefer " + how + ".\n" +
      "Could you let me know availability and next steps?\n\n" +
      "Thanks,\n" + name;
  }

  function currentSubject() {
    var p = productById(state.productId);
    return state.subject ||
      (isNext(p) ? "Interest: " : isWaitlist(p) ? "Waitlist: " : "Inquiry: ") + (p ? p.name : "General question");
  }

  function mailtoHref() {
    return "mailto:" + EMAIL + "?subject=" + encodeURIComponent(currentSubject()) + "&body=" + encodeURIComponent(els.message.value);
  }

  function updateSendLinks() {
    els.subject.value = currentSubject();
    if (hasConfig) {
      els.sms.href = "sms:" + PHONE + "?&body=" + encodeURIComponent(els.message.value);
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

    // Quantity and delivery only apply to products we sell now.
    els.orderFields.hidden = !p || isNext(p);
    els.product.value = state.productId;

    // Wholesale
    els.business.checked = isBusiness(p);
    els.business.disabled = !!(p && p.wholesaleOnly);
    els.businessFields.hidden = !isBusiness(p);

    // Summary chip
    if (p) {
      els.chipText.textContent = p.name + " · " +
        (isNext(p) ? "testing" : isWaitlist(p) ? "waitlist" : money(priceFor(p, state.delivery)));
      els.chipChange.href = isNext(p) ? "#next-products" : isCrew(p) ? "#crew-products" : "#plant-products";
      els.chip.hidden = false;
    } else {
      els.chip.hidden = true;
    }

    // Message
    if (opts.force) {
      state.edited = false;
      setError(els.message, els.messageError, "");
      showStatus("", "");
    }
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
  function inquireWith(subject, message, opts) {
    state.productId = "";
    if (opts && opts.business) state.business = true;
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

  var sampleBtn = $("#request-sample");
  if (sampleBtn) {
    sampleBtn.addEventListener("click", function () {
      inquireWith("Free sample request",
        "Hi Agar & Oak,\n\nI'm writing from [shop] in [town, state]. We'd like a free sample of [product] to try.\n\nThanks,\n[your name]",
        { business: true });
    });
  }

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
    if (!els.messageError.hidden) setError(els.message, els.messageError, "");
    state.edited = els.message.value !== buildMessage();
    els.regenerate.hidden = !state.edited;
    updateSendLinks();
  });

  els.regenerate.addEventListener("click", function () {
    state.subject = "";
    render({ force: true });
    els.message.focus();
  });

  /* ---------- Email Inquiry ----------
     Sends the form to Netlify Forms, which emails it to us, so the visitor stays on the page.
     A page can supply its own sender as window.AGAR_INQUIRY_SENDER (the preview does).
     If sending fails, the visitor gets a link to send the same message from their email app. */
  var fromSite = typeof EMAIL_FROM_SITE === "undefined" || EMAIL_FROM_SITE;
  var sending = false;
  var SEND_LABEL = els.sendLabel.textContent;

  function setError(input, box, text) {
    box.textContent = text || "";
    box.hidden = !text;
    var ids = (input.getAttribute("aria-describedby") || "").split(" ").filter(function (id) { return id && id !== box.id; });
    if (text) { ids.push(box.id); input.setAttribute("aria-invalid", "true"); } else { input.removeAttribute("aria-invalid"); }
    input.setAttribute("aria-describedby", ids.join(" "));
  }

  function showStatus(kind, text, withMailto) {
    els.status.className = "send-status" + (kind ? " is-" + kind : "");
    els.status.textContent = text;
    if (withMailto && hasConfig) {
      els.status.appendChild(document.createTextNode(" "));
      var a = document.createElement("a");
      a.href = mailtoHref();
      a.textContent = "Send it from your email app instead";
      els.status.appendChild(a);
      els.status.appendChild(document.createTextNode(", or use Text Inquiry or Call."));
    }
  }

  // Put their name into a pre-written sign-off, then check nothing is left to fill in.
  function checkMessage() {
    var name = state.name.trim();
    if (name) els.message.value = els.message.value.replace(/\[your name(?: and shop)?\]/g, name);
    var text = els.message.value.trim();
    if (!text || (!productById(state.productId) && text === buildMessage().trim())) return "Add your question to the message.";
    if (/\[[^\]\n]+\]/.test(text)) return "Fill in or delete the parts in [square brackets] first.";
    return "";
  }

  function netlifySend(data) {
    var body = Object.keys(data).map(function (k) { return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]); }).join("&");
    return fetch(form.getAttribute("action") || "/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body
    }).then(function (res) {
      if (!res.ok) throw new Error("http_" + res.status);
      return {};
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (sending) return;
    if (!fromSite) { if (hasConfig) window.location.href = mailtoHref(); return; }

    var email = els.email.value.trim();
    var emailProblem = !email ? "Enter your email so we can reply." :
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Check your email address: it should look like name@example.com." : "";
    var messageProblem = checkMessage();
    setError(els.email, els.emailError, emailProblem);
    setError(els.message, els.messageError, messageProblem);
    if (emailProblem || messageProblem) {
      showStatus("", "");
      (emailProblem ? els.email : els.message).focus();
      return;
    }

    var p = productById(state.productId);
    var data = {
      "form-name": form.getAttribute("name"),
      "bot-field": form.querySelector('[name="bot-field"]').value,
      subject: currentSubject(),
      product: p ? p.name : "General question",
      name: state.name.trim(),
      email: email,
      message: els.message.value
    };
    if (isBusiness(p)) { data.businessName = state.businessName.trim(); data.town = state.town.trim(); }

    sending = true;
    els.send.setAttribute("aria-disabled", "true");
    els.sendLabel.textContent = "Sending…";
    showStatus("", "Sending your inquiry…");
    (window.AGAR_INQUIRY_SENDER || netlifySend)(data).then(function () {
      state.subject = "";
      render({ force: true }); // a fresh message, so a second tap doesn't send it twice
      showStatus("ok", "Sent. Thanks! We'll reply to " + email + ".");
    }, function () {
      showStatus("error", "Sorry, we couldn't send that from the website.", true);
    }).then(function () {
      sending = false;
      els.send.removeAttribute("aria-disabled");
      els.sendLabel.textContent = SEND_LABEL;
    });
  });

  els.email.addEventListener("input", function () { if (!els.emailError.hidden) setError(els.email, els.emailError, ""); });

  /* ---------- Chat assistant: loaded the first time someone opens it ---------- */
  var chatRoot = $("#chat");
  var chatLoading = null;
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var tag = document.createElement("script");
      tag.src = src;
      tag.onload = resolve;
      tag.onerror = reject;
      document.body.appendChild(tag);
    });
  }
  function loadChat() {
    if (!chatLoading) {
      // Skip whatever already loaded, so a retry never runs a file twice.
      chatLoading = (typeof ASSISTANT === "undefined" ? loadScript("assets/js/assistant.js") : Promise.resolve())
        .then(function () { return window.AgarChat ? null : loadScript("assets/js/chat.js"); });
    }
    return chatLoading;
  }
  if (chatRoot) {
    chatRoot.hidden = false;
    document.addEventListener("click", function (e) {
      if (window.AgarChat) return; // chat.js handles clicks once it has loaded
      var trigger = e.target.closest("#chat-launcher, [data-open-chat]");
      if (!trigger) return;
      e.preventDefault();
      trigger.setAttribute("aria-busy", "true");
      loadChat().then(function () {
        trigger.removeAttribute("aria-busy");
        if (window.AgarChat) window.AgarChat.open(trigger.getAttribute("data-chat-prompt") || "");
      }, function () {
        trigger.removeAttribute("aria-busy");
        chatLoading = null; // let the next click try again
      });
    });
  }

  /* ---------- Setup planner: its code loads as the section comes near ---------- */
  var plannerRoot = $("#planner");
  var plannerLoading = null;
  var plannerLoaded = false;
  function loadPlanner() {
    if (!plannerLoading) {
      plannerLoading = loadScript("assets/js/planner.js").then(function () { plannerLoaded = true; },
        function () { plannerLoading = null; });
    }
    return plannerLoading;
  }
  if (plannerRoot) {
    // A tap on "Ask about this kit" that beats the download still goes through.
    plannerRoot.addEventListener("click", function (e) {
      var btn = e.target.closest("#planner-inquire");
      if (!btn || plannerLoaded) return;
      loadPlanner().then(function () { if (plannerLoaded) btn.click(); });
    });
    if ("IntersectionObserver" in window) {
      var plannerWatch = new IntersectionObserver(function (entries) {
        if (!entries.some(function (en) { return en.isIntersecting; })) return;
        plannerWatch.disconnect();
        loadPlanner();
      }, { rootMargin: "800px 0px" });
      plannerWatch.observe(plannerRoot);
    } else {
      loadPlanner();
    }
  }

  /* ---------- Survey pop-up: once per page load, after SURVEY_POPUP_SECONDS ---------- */
  function setupSurveyPopup() {
    var pop = $("#survey-pop");
    var url = typeof SURVEY_URL !== "undefined" ? String(SURVEY_URL).trim() : "";
    var secs = typeof SURVEY_POPUP_SECONDS !== "undefined" ? Number(SURVEY_POPUP_SECONDS) : 20;
    if (!pop || !url || !(secs > 0) || typeof pop.showModal !== "function") return;
    var go = $("#survey-pop-go");
    go.href = url;
    var answered = false; // skip the pop-up if they already opened the survey
    var lastFocus = null;
    document.addEventListener("click", function (e) {
      if (e.target.closest("#survey-link, #survey-pop-go")) answered = true;
    });
    // Don't interrupt someone who is typing or using the chat; try again shortly.
    function busy() {
      var a = document.activeElement;
      var chat = $("#chat-panel");
      return (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) || (chat && !chat.hidden);
    }
    function open() {
      if (answered) return;
      if (busy()) { window.setTimeout(open, 10000); return; }
      lastFocus = document.activeElement;
      pop.showModal();
    }
    pop.addEventListener("click", function (e) {
      // A click outside the card (on the backdrop) or on a close button closes it.
      if (e.target === pop || e.target.closest("[data-close]")) pop.close();
    });
    go.addEventListener("click", function () { window.setTimeout(function () { pop.close(); }, 0); });
    pop.addEventListener("close", function () {
      if (lastFocus && lastFocus.focus && lastFocus !== document.body) lastFocus.focus({ preventScroll: true });
    });
    window.setTimeout(open, secs * 1000);
  }

  /* ---------- Boot ---------- */
  fillContact();
  renderReferences();
  renderStats();
  renderProducts();
  renderShippingFaq();
  applySettings();
  setupSurveyPopup();
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
    openDetails(target && target.id);
    if (target) {
      target.scrollIntoView({ block: "start" });
      if (target.id === "contact" && fromUrl) els.heading.focus({ preventScroll: true });
    }
  }

})();
