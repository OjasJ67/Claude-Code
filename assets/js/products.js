/* Products. The site renders every card from this list.
   line:          "plants" | "crews" | "next" (what we're testing; no price, not for sale)
   purpose:       one sentence: what it's for
   price:         plants: the price (hidden while FLAGS.njNurseryCertified is false).
                  crews: the SHIPPED price
   pickupPrice:   crews only: NJ local pickup price
   priceUnit:     shown after the price ("per jar", "each" ...)
   status:        "available" | "coming-later" | "testing"
   wholesaleOnly: true = business inquiries only, quantity starts at minQty
   image:         swap the black "?" placeholder for your own photo (4:3 works best)

   Copy rules: no fertilizer/soil-amendment wording, no health or medicinal
   claims, no guarantees, no pest-free claims (say "grown in sterile culture",
   "no pesticides used" or "mite-checked"), species names only (no trademarked
   cultivar names).
   Cleanup crews: never Cubaris, Nesodillo or Merulanella (they need a USDA
   containment facility); once the permit arrives, ship only species named on it. */
const PRODUCTS = [
  // ---- Lab-grown plants ----
  {
    id: "cape-sundew-jar", line: "plants", name: "Cape sundew TC jar",
    purpose: "5–15 sundew plantlets on sterile gel, ready for you to plant out.",
    price: 20, priceUnit: "per jar", status: "available", wholesaleOnly: false, minQty: 1,
    image: "assets/img/placeholders/image-placeholder.svg"
  },
  {
    id: "venus-flytrap-jar", line: "plants", name: "Venus flytrap TC jar",
    purpose: "Lab-cloned flytrap plantlets, with no wild collection.",
    price: 25, priceUnit: "per jar", status: "available", wholesaleOnly: false, minQty: 1,
    image: "assets/img/placeholders/image-placeholder.svg"
  },
  {
    id: "sarracenia-jar", line: "plants", name: "Pitcher plant (Sarracenia) TC jar",
    purpose: "Young pitcher plants to grow on outdoors or in a bog garden.",
    price: 28, priceUnit: "per jar", status: "available", wholesaleOnly: false, minQty: 1,
    image: "assets/img/placeholders/image-placeholder.svg"
  },
  {
    id: "nepenthes-jar", line: "plants", name: "Tropical pitcher plant (Nepenthes) TC jar",
    purpose: "Slow-growing collector plants.",
    price: 40, priceUnit: "per jar", status: "coming-later", wholesaleOnly: false, minQty: 1,
    image: "assets/img/placeholders/image-placeholder.svg"
  },
  {
    id: "terrarium-cup", line: "plants", name: "Terrarium plant cup",
    purpose: "Fittonia, Peperomia and other vivarium plants, grown in sterile culture.",
    price: 15, priceUnit: "per cup", status: "available", wholesaleOnly: false, minQty: 1,
    image: "assets/img/placeholders/image-placeholder.svg"
  },
  {
    id: "rooted-starter", line: "plants", name: "Rooted starter plant",
    purpose: "One acclimated plant in a 2-inch pot, ready to grow.",
    price: 15, priceUnit: "each", status: "available", wholesaleOnly: false, minQty: 1,
    image: "assets/img/placeholders/image-placeholder.svg"
  },
  {
    id: "wholesale-plantlets", line: "plants", name: "Wholesale plantlets",
    purpose: "Bulk plantlets for nurseries and plant shops.",
    price: 2, priceUnit: "per plantlet", status: "available", wholesaleOnly: true, minQty: 25,
    image: "assets/img/placeholders/image-placeholder.svg"
  },

  // ---- Living cleanup crews ----
  {
    id: "common-isopods-10", line: "crews", name: "Common morph isopods (10)",
    purpose: "Hardy, fast-breeding cleanup crew: Dairy Cow (<i>Porcellio laevis</i>) or Powder Orange (<i>Porcellionides pruinosus</i>).",
    price: 20, pickupPrice: 15, priceUnit: "per 10", status: "available", wholesaleOnly: false, minQty: 1,
    image: "assets/img/placeholders/image-placeholder.svg"
  },
  {
    // Before shipping these out of state, check that Armadillidium klugii and
    // A. maculatum are both named on your USDA PPQ 526 permit.
    id: "premium-isopods-10", line: "crews", name: "Premium morph isopods (10)",
    purpose: "Colorful breeding stock: Magic Potion (<i>Armadillidium vulgare</i>), Zebra (<i>A. maculatum</i>), clown morphs (<i>A. klugii</i>).",
    price: 45, pickupPrice: 40, priceUnit: "per 10", status: "available", wholesaleOnly: false, minQty: 1,
    image: "assets/img/placeholders/image-placeholder.svg"
  },
  {
    id: "springtail-culture", line: "crews", name: "Springtail culture",
    purpose: "Tiny mold-eaters for any terrarium (<i>Folsomia candida</i>).",
    price: 18, pickupPrice: 12, priceUnit: "per culture", status: "available", wholesaleOnly: false, minQty: 1,
    image: "assets/img/placeholders/image-placeholder.svg"
  },
  {
    id: "cleanup-combo", line: "crews", name: "Cleanup-crew combo",
    purpose: "Springtails plus a hardy isopod, everything a new bioactive tank needs.",
    price: 40, pickupPrice: 32, priceUnit: "per combo", status: "available", wholesaleOnly: false, minQty: 1,
    image: "assets/img/placeholders/image-placeholder.svg"
  },
  {
    id: "feeder-pack-50", line: "crews", name: "Isopod feeder pack (50)",
    purpose: "Live food for small frogs and geckos.",
    price: 25, pickupPrice: 20, priceUnit: "per pack", status: "available", wholesaleOnly: false, minQty: 1,
    image: "assets/img/placeholders/image-placeholder.svg"
  },

  // ---- What we're testing next (not for sale; "I'd use this" collects interest) ----
  {
    id: "fruit-fly-cultures", line: "next", name: "Fruit fly cultures",
    purpose: "Flightless fruit flies for dart frogs, mantises and jumping spiders.",
    status: "testing", wholesaleOnly: false, minQty: 1,
    image: "assets/img/placeholders/image-placeholder.svg"
  },
  {
    id: "mushroom-cultures", line: "next", name: "Mushroom cultures",
    purpose: "Liquid cultures and grain spawn for gourmet mushrooms such as oyster, lion's mane and shiitake.",
    status: "testing", wholesaleOnly: false, minQty: 1,
    image: "assets/img/placeholders/image-placeholder.svg"
  },
  {
    id: "copepods-phytoplankton", line: "next", name: "Copepods and phytoplankton",
    purpose: "Live copepods and phytoplankton for reef tanks, available once our New Jersey aquatic farmer license is issued.",
    status: "testing", wholesaleOnly: false, minQty: 1,
    image: "assets/img/placeholders/image-placeholder.svg"
  }
];

// Lets the Netlify chat function read the product list. Ignored by browsers.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { PRODUCTS };
}
