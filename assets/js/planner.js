/* ==========================================================================
   Agar & Oak: setup planner
   Suggests a starting kit from products.js for a setup type and size.
   Edit KITS to change what gets suggested; quantities are starting points.
   ========================================================================== */
(function () {
  "use strict";

  var form = document.getElementById("planner-form");
  if (!form || typeof PRODUCTS === "undefined") return;

  var flags = typeof FLAGS !== "undefined" ? FLAGS : { njNurseryCertified: false, usdaPPQ526Permit: false };

  var SETUPS = {
    tropical: "tropical vivarium",
    arid: "dry or desert setup",
    plants: "plant-only terrarium",
    carnivorous: "carnivorous plant setup"
  };

  // Why each product is in a kit (short, within the copy rules).
  var WHY = {
    "cleanup-combo": "Springtails plus a hardy isopod: a complete starter crew.",
    "springtail-culture": "Tiny mold-eaters that help keep the surface clean.",
    "common-isopods-10": "A hardy, fast-breeding crew for waste and dead leaves.",
    "terrarium-cup": "Fittonia, Peperomia or similar vivarium plants, grown in sterile culture.",
    "rooted-starter": "An acclimated plant in a 2-inch pot, ready to grow.",
    "feeder-pack-50": "Live food for small frogs and geckos.",
    "venus-flytrap-jar": "Lab-cloned flytrap plantlets.",
    "cape-sundew-jar": "5–15 sundew plantlets on sterile gel.",
    "sarracenia-jar": "Young pitcher plants to grow on outdoors or in a bog garden."
  };

  // [productId, quantity] for each setup and size.
  var KITS = {
    tropical: {
      small: [["cleanup-combo", 1], ["terrarium-cup", 1]],
      medium: [["cleanup-combo", 1], ["springtail-culture", 1], ["terrarium-cup", 2], ["rooted-starter", 1]],
      large: [["cleanup-combo", 1], ["springtail-culture", 1], ["common-isopods-10", 1], ["terrarium-cup", 3], ["rooted-starter", 2]]
    },
    arid: {
      small: [["common-isopods-10", 1]],
      medium: [["common-isopods-10", 1], ["springtail-culture", 1]],
      large: [["common-isopods-10", 2], ["springtail-culture", 1]]
    },
    plants: {
      small: [["terrarium-cup", 1], ["springtail-culture", 1]],
      medium: [["terrarium-cup", 2], ["rooted-starter", 1], ["springtail-culture", 1]],
      large: [["terrarium-cup", 3], ["rooted-starter", 2], ["springtail-culture", 1], ["common-isopods-10", 1]]
    },
    carnivorous: {
      small: [["venus-flytrap-jar", 1], ["cape-sundew-jar", 1]],
      medium: [["venus-flytrap-jar", 1], ["cape-sundew-jar", 1], ["springtail-culture", 1]],
      large: [["venus-flytrap-jar", 1], ["cape-sundew-jar", 1], ["sarracenia-jar", 1]]
    }
  };

  // What the visitor learns about how the kit works, per setup.
  var LEARN = {
    tropical: [
      "Springtails feed on mold and fungal growth on the surface.",
      "Isopods break down dead leaves and waste, and prefer decaying leaves over fresh ones.",
      "Both breed in the tank, so a small start grows into a steady crew."
    ],
    arid: [
      "Isopods break down waste and plant litter and boost microbial activity in the substrate.",
      "Springtails need moisture, so they live in the damp corner.",
      "A small culture breeds into a self-sustaining crew."
    ],
    plants: [
      "Humid, closed tanks often grow mold. Springtails feed on fungal growth and help control it.",
      "Tissue-culture plants are grown in sterile culture, with no pesticides used."
    ],
    carnivorous: [
      "Carnivorous plants evolved in poor soils, and in the lab they multiply best on diluted medium.",
      "Each jar holds identical plantlets cloned from one clean parent and grown in sterile culture.",
      "Plant them out within about 2–4 months of getting the jar."
    ]
  };

  var els = {
    food: document.getElementById("planner-food"),
    summary: document.getElementById("planner-summary"),
    kit: document.getElementById("planner-kit"),
    note: document.getElementById("planner-note"),
    learn: document.getElementById("planner-learn"),
    inquire: document.getElementById("planner-inquire"),
    ask: document.querySelector("#planner-result [data-open-chat]")
  };

  function product(id) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
    return null;
  }
  // Plants have no published price until the nursery certificate arrives.
  function priced(p) { return p.line !== "plants" || flags.njNurseryCertified; }
  function unitPrice(p) {
    if (p.line !== "crews") return p.price;
    return flags.usdaPPQ526Permit ? p.price : p.pickupPrice;
  }
  function value(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : "";
  }
  function text(tag, cls, content) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    el.textContent = content;
    return el;
  }

  var current = null;

  function compute() {
    var setup = value("setup") || "tropical";
    var size = value("size") || "medium";
    var animals = setup === "tropical" || setup === "arid";
    var food = animals && value("food") === "yes";

    var items = KITS[setup][size].slice();
    if (food) items.push(["feeder-pack-50", 1]);

    var lines = items.map(function (pair) {
      var p = product(pair[0]);
      return p ? { p: p, qty: pair[1], priced: priced(p), total: priced(p) ? unitPrice(p) * pair[1] : 0 } : null;
    }).filter(Boolean);

    var total = lines.reduce(function (sum, l) { return sum + l.total; }, 0);
    var hasCrews = lines.some(function (l) { return l.p.line === "crews"; });
    var hasPlants = lines.some(function (l) { return l.p.line === "plants"; });
    var allPriced = lines.every(function (l) { return l.priced; });

    var notes = [];
    if (setup === "arid") notes.push("Our plants suit humid setups, so this kit leaves them out. Keep one corner damp for the crew.");
    if (hasPlants && !flags.njNurseryCertified) notes.push("Plants: waitlist only, no prices until our nursery certificate is issued.");
    if (hasCrews && !flags.usdaPPQ526Permit) notes.push("Cleanup crews are New Jersey local pickup only for now, so prices shown are pickup prices.");

    return { setup: setup, size: size, animals: animals, lines: lines, total: total, allPriced: allPriced, notes: notes };
  }

  function render() {
    var k = compute();
    current = k;
    els.food.hidden = !k.animals;

    var count = k.lines.reduce(function (n, l) { return n + l.qty; }, 0);
    var cost = k.allPriced ? ", about $" + k.total
      : k.total > 0 ? ", about $" + k.total + " for the cleanup crew"
      : "";
    els.summary.textContent = "For a " + k.size + " " + SETUPS[k.setup] + ": " + count + " item" + (count === 1 ? "" : "s") + cost + ".";

    els.kit.textContent = "";
    k.lines.forEach(function (l) {
      var li = document.createElement("li");
      li.appendChild(text("span", "kit-qty", l.qty + "×"));
      li.appendChild(text("span", "kit-name", l.p.name));
      li.appendChild(text("span", "kit-price", l.priced ? "$" + l.total : "Waitlist"));
      li.appendChild(text("span", "kit-why", WHY[l.p.id] || ""));
      els.kit.appendChild(li);
    });

    els.note.textContent = k.notes.join(" ");

    els.learn.textContent = "";
    LEARN[k.setup].forEach(function (t) { els.learn.appendChild(text("li", "", t)); });

    if (els.ask) els.ask.setAttribute("data-chat-prompt", "What should I know about starting a " + k.size + " " + SETUPS[k.setup] + "?");
  }

  function kitMessage(k) {
    var list = k.lines.map(function (l) {
      return "- " + l.qty + " × " + l.p.name + (l.priced ? " ($" + unitPrice(l.p) + " " + l.p.priceUnit + ")" : " (waitlist)");
    }).join("\n");
    var totalLine = k.allPriced ? "Estimated total: $" + k.total + ".\n"
      : k.total > 0 ? "Estimated total for the cleanup crew: $" + k.total + ".\n"
      : "";
    return "Hi Agar & Oak,\n\n" +
      "I used the setup planner for a " + k.size + " " + SETUPS[k.setup] + ". I'm interested in:\n" +
      list + "\n" +
      totalLine +
      "Could you let me know availability and next steps?\n\n" +
      "Thanks,\n[your name]";
  }

  form.addEventListener("change", render);
  form.addEventListener("submit", function (e) { e.preventDefault(); });
  els.inquire.addEventListener("click", function () {
    if (!current || !window.AgarOak) return;
    window.AgarOak.inquireWith("Setup planner: " + current.size + " " + SETUPS[current.setup], kitMessage(current));
  });

  render();
})();
