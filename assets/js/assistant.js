/* ==========================================================================
   Agar & Oak: chat assistant knowledge
   One source of truth for the chat assistant:
   - the browser uses it for instant answers (no AI, no network), and
   - assistant-prompt.js uses it to brief the AI.
   Edit the answers here; keep them short and within the copy rules in README.
   ========================================================================== */

const ASSISTANT = (function () {
  "use strict";

  /* Instant answers. `keys` are words or phrases that point to this answer;
     longer, more specific phrases count for more. */
  const ASSISTANT_FAQ = [
    {
      id: "buy",
      keys: ["buy", "order", "purchase", "pay", "payment", "checkout", "cart", "reserve", "how do i get"],
      answer: "Tap Buy now (or Reserve) on any product. We write a message for you, and you send it by email or text. We reply personally to confirm availability, price and pickup or shipping. No payment is taken on this website."
    },
    {
      id: "price",
      keys: ["price", "prices", "cost", "how much", "cheap", "expensive"],
      answer: function (ctx) {
        if (!ctx.flags.njNurseryCertified) {
          return "Cleanup crews start at $" + minPrice(ctx.products, "crews", ctx.flags) + (ctx.flags.usdaPPQ526Permit ? "" : " (pickup price)") +
            ". Plants are waitlist only, with no prices until our nursery certificate is issued. Ask me about a specific product, like \"How much is the springtail culture?\"";
        }
        return "Prices are on each product card. Plants run from $" + minPrice(ctx.products, "plants", ctx.flags) +
          " and cleanup crews from $" + minPrice(ctx.products, "crews", ctx.flags) +
          ". Ask me about a specific product, like \"How much is the Venus flytrap jar?\"";
      }
    },
    {
      id: "shipping",
      keys: ["ship", "shipping", "deliver", "delivery", "mail", "pickup", "pick up", "local", "send it"],
      answer: function (ctx) { return shippingText(ctx.flags); }
    },
    {
      id: "remote",
      keys: ["hawaii", "alaska", "puerto rico", "territory", "territories", "guam"],
      answer: "We can't send cleanup crews to Hawaii, Alaska or U.S. territories."
    },
    {
      id: "legal",
      keys: ["legal", "allowed", "permit", "usda", "law", "regulation", "illegal", "cubaris", "ship cleanup crews", "ship crews", "ship isopods", "ship springtails"],
      answer: function (ctx) {
        return (ctx.flags.usdaPPQ526Permit
          ? "Yes, to the lower 48 states. We ship only species named on our USDA permit."
          : "Not yet. Cleanup crews are New Jersey pickup only until our USDA permit is issued.") +
          " We never sell Cubaris, Nesodillo or Merulanella, which need a USDA containment facility.";
      }
    },
    {
      id: "jar",
      keys: ["how long", "last in the jar", "in the jar", "when to plant", "tc jar", "shelf life"],
      answer: "Tissue-culture plantlets last about 2–4 months in the jar. Plant them out within that window, or ask us and we'll walk you through it."
    },
    {
      id: "plantout",
      keys: ["plant out", "planting out", "deflask", "take out of the jar", "acclimate", "acclimatize", "acclimation", "transplant", "pot up", "humidity dome"],
      answer: "To plant out a jar, rinse the gel off the plantlets, plant them in moist mix under a humidity dome, and open the vents a little more each day over 2–4 weeks. Carnivorous plants go in peat and perlite, watered with distilled water."
    },
    {
      id: "water",
      keys: ["water", "watering", "tap water", "distilled", "rain water", "rainwater"],
      answer: "Water carnivorous plants with distilled or rain water only; minerals in tap water harm them over time. Every plant's care card includes this reminder."
    },
    {
      id: "different",
      keys: ["different", "difference", "unique", "why you", "why choose", "why should", "better than", "stand out", "compared", "competitor", "clean bioactive", "what makes", "special"],
      answer: "Clean bioactive: sterile lab-grown plants and mite-checked cleanup crews from one source. Our plants come out of sterile jars and are grown without pesticides. For the cleanup crews, leaf litter is frozen or baked, new stock is quarantined for 30 days, and every culture is checked with a hand lens before it goes out. Cultures are labeled by tank type with an exact count, size class and pack date. Explore the sample labels in the \"What makes us different\" section."
    },
    {
      id: "guarantee",
      keys: ["guarantee", "guaranteed", "warranty", "refund", "replace", "replacement", "died", "dies", "crash", "crashed", "live arrival"],
      answer: "Rooted starter plants: if a plant dies within 30 days of pickup or delivery and you followed the care card, send us a photo and we'll replace or refund it. Cleanup-crew starter cultures: if a culture crashes within 30 days, send a photo and we'll replace it. Tissue-culture jars and wholesale orders aren't covered. Email or text us to make a claim."
    },
    {
      id: "subscription",
      keys: ["subscription", "subscribe", "restock", "restocks", "recurring", "monthly", "biweekly", "every two weeks", "every month"],
      answer: function (ctx) {
        return "We offer a springtail subscription: monthly or every-two-weeks restocks for dart frog and gecko keepers, who use springtails as food. " +
          (ctx.flags.usdaPPQ526Permit ? "It ships to the lower 48 states." : "It's available in New Jersey now, and by mail once our USDA permit arrives.") +
          " Tap \"Ask about a subscription\" in the \"What makes us different\" section to set one up.";
      }
    },
    {
      id: "display",
      keys: ["display jar", "display jars", "shop display", "store display", "counter"],
      answer: "For shops we make display jars: a sealed mason jar with moss and a living springtail colony for your counter, so customers can watch the animals move. Tap \"Ask about display jars\" in the \"What makes us different\" section for pricing."
    },
    {
      id: "pesticides",
      keys: ["pesticide", "insecticide", "sprayed", "spray", "chemicals", "safe for frogs", "plants safe", "neonicotinoid"],
      answer: "We never spray pesticides on our plants."
    },
    {
      id: "tc",
      keys: ["tissue culture", "tissue-culture", "lab-grown", "lab grown", "clone", "cloned", "agar", "sterile", "micropropagation"],
      answer: "Tissue culture grows a whole new plant from a tiny piece of a parent plant, on sterile gel in a sealed jar. The plantlets are identical to the parent, grown in sterile culture, and never taken from the wild. One clean parent plant can supply hundreds of plantlets."
    },
    {
      id: "pests",
      keys: ["pest", "pests", "bugs", "gnat", "gnats", "mites", "hitchhiker"],
      answer: "Our plants are grown in sterile culture in sealed jars, with no pesticides used, and our cleanup crews are mite-checked before they go out."
    },
    {
      id: "crews",
      keys: ["springtail", "springtails", "isopod", "isopods", "cleanup crew", "clean up crew", "what do they eat", "bioactive", "mold", "mould"],
      answer: "Springtails are tiny soil animals and isopods are small land-dwelling crustaceans. In a bioactive terrarium they eat mold, waste and dead leaves, which helps keep the enclosure clean without chemicals. They breed on their own, so a small starter culture grows into a steady crew."
    },
    {
      id: "safe",
      keys: ["safe", "pets", "pet", "harm", "eat my plants", "eat plants", "frog", "gecko", "reptile"],
      answer: "Cleanup crews eat decay, mold and waste rather than healthy living plants, and they're widely kept alongside small frogs, geckos and other reptiles. Tell us what you keep and we'll suggest a good match."
    },
    {
      id: "which",
      keys: ["which crew", "which cleanup crew", "which isopod", "what do i need", "do i need", "how many", "recommend", "best for", "starter kit", "setup", "set up", "new tank", "enclosure"],
      answer: "Try the setup planner on this page: pick your setup and size, and it suggests a starting cleanup crew and plants with prices. You can send the list to us in one tap."
    },
    {
      id: "wholesale",
      keys: ["wholesale", "bulk", "shop", "store", "nursery", "business", "resell", "reseller"],
      answer: "We sell wholesale plantlets to nurseries and plant shops, starting at 25. Tick \"I'm buying for a shop or business\" in the contact form and we'll send our wholesale sheet and availability."
    },
    {
      id: "contact",
      keys: ["contact", "email", "phone", "call", "text", "talk to", "reach", "human", "person"],
      answer: function (ctx) { return "You can email us at " + ctx.email + " or call or text " + ctx.phoneDisplay + ". The contact form at the bottom of the page writes the message for you."; }
    },
    {
      id: "where",
      keys: ["where are you", "location", "located", "new jersey", "nj", "address", "visit"],
      answer: "We're Agar & Oak LLC in North Brunswick, New Jersey. We don't list a street address; we arrange pickup details personally when you inquire."
    },
    {
      id: "wild",
      keys: ["wild", "poach", "poaching", "endangered", "conservation", "wilmington"],
      answer: "None of our plants or animals are taken from the wild. The Venus flytrap's only wild range is a 75-mile radius around Wilmington, NC, and poaching it has been a felony there since 2014 (NC State CNR, 2021). Lab-grown plants are a clean alternative."
    }
  ];

  /* Words that point to a specific product (by id). */
  const ASSISTANT_PRODUCT_KEYS = {
    "cape-sundew-jar": ["cape sundew", "sundew", "drosera"],
    "venus-flytrap-jar": ["venus flytrap", "flytrap", "fly trap", "dionaea"],
    "sarracenia-jar": ["sarracenia", "pitcher plant", "trumpet pitcher"],
    "nepenthes-jar": ["nepenthes", "tropical pitcher"],
    "terrarium-cup": ["terrarium cup", "terrarium plant", "fittonia", "peperomia", "vivarium plant"],
    "rooted-starter": ["rooted starter", "starter plant", "potted plant", "2-inch pot"],
    "wholesale-plantlets": ["wholesale plantlet", "bulk plantlet"],
    "common-isopods-10": ["common isopod", "common morph", "dairy cow", "powder orange", "porcellio laevis", "porcellionides"],
    "premium-isopods-10": ["premium isopod", "premium morph", "magic potion", "zebra isopod", "clown", "armadillidium"],
    "springtail-culture": ["springtail culture", "folsomia", "buy springtails"],
    "cleanup-combo": ["combo", "cleanup-crew combo", "cleanup crew combo"],
    "feeder-pack-50": ["feeder", "feeders", "live food", "feeder pack"],
    "fruit-fly-cultures": ["fruit fly", "fruit flies", "drosophila", "flightless"],
    "mushroom-cultures": ["mushroom", "mushrooms", "oyster", "lion's mane", "shiitake", "grain spawn", "liquid culture"],
    "copepods-phytoplankton": ["copepod", "copepods", "phytoplankton", "reef"]
  };

  // Topics that only give general background; more specific topics win ties.
  var BROAD = ["price", "buy", "crews", "tc", "which"];

  function shippingText(flags) {
    var crews = flags.usdaPPQ526Permit
      ? "Cleanup crews ship to the lower 48 states, or you can pick up locally in New Jersey."
      : "Cleanup crews are New Jersey local pickup only for now, until our USDA shipping permit arrives.";
    var plants = flags.njNurseryCertified
      ? "Plants can be picked up in New Jersey; ask about shipping to your state and we'll confirm."
      : "Plants are on a waitlist while our New Jersey nursery certificate is pending; we'll confirm pickup or shipping when they're ready.";
    return crews + " " + plants + " We can't send cleanup crews to Hawaii, Alaska or U.S. territories.";
  }

  function shownPrice(p, flags) {
    if (p.line !== "crews") return p.price;
    return flags.usdaPPQ526Permit ? p.price : p.pickupPrice;
  }

  function minPrice(products, line, flags) {
    var prices = products.filter(function (p) { return p.line === line && !p.wholesaleOnly; })
      .map(function (p) { return shownPrice(p, flags); });
    return Math.min.apply(null, prices);
  }

  function plainText(html) { return String(html).replace(/<[^>]+>/g, ""); }

  function productStatus(p, flags) {
    if (p.line === "crews") {
      return flags.usdaPPQ526Permit ? "ships to the lower 48 states or local pickup" : "New Jersey local pickup only for now";
    }
    if (p.line === "next") return "still in testing and not for sale yet";
    if (!flags.njNurseryCertified) return "waitlist only; we'll post prices once our nursery certificate is issued";
    if (p.status === "coming-later") return "coming later; we're taking inquiries";
    return "available";
  }

  // Whether a product's price may be shown (plants stay unpriced until the nursery certificate).
  function hasPrice(p, flags) {
    if (p.line === "next") return false;
    return p.line !== "plants" || flags.njNurseryCertified;
  }

  function productAnswer(p, flags) {
    if (p.line === "next") {
      return p.name + ": " + plainText(p.purpose) + " We're " + productStatus(p, flags) +
        ". Tap \"I'd use this\" in \"What we're testing next\" to tell us what you'd buy.";
    }
    var price = hasPrice(p, flags)
      ? "$" + shownPrice(p, flags) + " " + p.priceUnit + (p.line === "crews" && !flags.usdaPPQ526Permit ? " (pickup price)" : "") + ", "
      : "";
    var extra = p.wholesaleOnly ? " Wholesale only, minimum " + p.minQty + "." : "";
    var status = productStatus(p, flags);
    if (!price) status = status.charAt(0).toUpperCase() + status.slice(1);
    return p.name + ": " + plainText(p.purpose) + " " + price + status + "." + extra +
      " Tap its button on the page to send us a ready-made message.";
  }

  /* Instant answer, used when AI answers are off or unavailable.
     ctx = { products, flags, email, phoneDisplay }. Returns { text, matched }. */
  function answerOffline(question, ctx) {
    var q = " " + String(question).toLowerCase().replace(/[^a-z0-9&'\- ]+/g, " ").replace(/\s+/g, " ") + " ";
    // Phrases match anywhere; single words match whole words (plural "s" allowed).
    var has = function (k) {
      if (k.indexOf(" ") !== -1) return q.indexOf(k) !== -1;
      return q.indexOf(" " + k + " ") !== -1 || q.indexOf(" " + k + "s ") !== -1;
    };
    var weight = function (k) { return k.indexOf(" ") !== -1 ? 3 : 2; };

    // Specific product mentioned?
    var bestProduct = null, bestProductScore = 0;
    Object.keys(ASSISTANT_PRODUCT_KEYS).forEach(function (id) {
      ASSISTANT_PRODUCT_KEYS[id].forEach(function (k) {
        var s = has(k) ? weight(k) + 1 : 0;
        if (s > bestProductScore) { bestProductScore = s; bestProduct = id; }
      });
    });

    var best = null, bestScore = 0;
    ASSISTANT_FAQ.forEach(function (entry) {
      var s = 0, seen = {};
      entry.keys.forEach(function (k) {
        var stem = k.replace(/s$/, "");
        if (has(k) && !seen[stem]) { seen[stem] = true; s += weight(k); }
      });
      // On a tie, a specific topic (legal, shipping...) beats a broad one.
      if (s > 0 && BROAD.indexOf(entry.id) === -1) s += 0.5;
      if (s > bestScore) { bestScore = s; best = entry; }
    });

    // A named product wins over broad topics like price or "how do I buy".
    var generic = !best || BROAD.indexOf(best.id) !== -1;
    if (bestProduct && (generic || bestProductScore >= bestScore)) {
      var p = ctx.products.filter(function (x) { return x.id === bestProduct; })[0];
      if (p) return { text: productAnswer(p, ctx.flags), matched: true };
    }
    if (best && bestScore >= 2) {
      return { text: typeof best.answer === "function" ? best.answer(ctx) : best.answer, matched: true };
    }
    return {
      text: "I don't have a ready answer for that one. Tap \"Ask us directly\" below and we'll reply personally, or email " + ctx.email + ".",
      matched: false
    };
  }


  return {
    FAQ: ASSISTANT_FAQ,
    answerOffline: answerOffline,
    // Helpers shared with assistant-prompt.js
    shippingText: shippingText,
    shownPrice: shownPrice,
    hasPrice: hasPrice,
    productStatus: productStatus,
    plainText: plainText
  };
})();

// Lets the Netlify chat function use the same knowledge. Ignored by browsers.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { ASSISTANT };
}
