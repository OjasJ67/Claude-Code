/* ==========================================================================
   Agar & Oak: "What makes us different"
   The two sample labels in that section, line by line. Each `line` is what's
   printed on the label; tapping it shows `title`, `body` and any `steps`.
   - {tank} and {date} in a line are filled in by the page.
   - `beforePermit` / `afterPermit` are added to `body` depending on
     FLAGS.usdaPPQ526Permit in config.js.
   The chat assistant reads this file too, so its answers stay in sync.
   Copy rules: no guarantees beyond the two replacement guarantees below,
   no health claims, no fertilizer wording, species names only.
   ========================================================================== */
const DIFFERENCES = {
  labels: [
    {
      id: "plant",
      tab: "Plant tag",
      kicker: "Rooted starter plant",
      name: "Cape sundew",
      features: [
        {
          id: "sterile",
          line: "Lab-grown in sterile culture",
          title: "Clean from the jar",
          body: "Our plants come out of sterile jars, so they don't bring gnats, mites or other hitchhikers into your tank."
        },
        {
          id: "pesticides",
          line: "Grown without pesticides · vivarium-safe",
          title: "Vivarium-safe",
          body: "We never spray pesticides. Many store plants are treated with insecticides, which can harm frogs and isopods."
        },
        {
          id: "ready",
          line: "Rooted and hardened · 30-day guarantee",
          title: "Ready to grow",
          body: "Rooted starter plants are established and hardened to room humidity and windowsill light before they leave us, and they come with a 30-day guarantee."
        },
        {
          id: "survival",
          line: "4-week survival rate: lab-tested",
          title: "Proven survival",
          body: "We test every change to our lab methods on half our jars first, then count how many plants are still alive four weeks after leaving the jar. That real number goes on the label."
        },
        {
          id: "fit",
          line: "Beginner pick · no winter dormancy",
          title: "Matched to you",
          body: "We point beginners to easy windowsill plants like the Cape sundew, which needs no winter dormancy, and terrarium builders to compact plants that fit a tank."
        },
        {
          id: "care",
          line: "Care card inside: scan for video",
          title: "Care included",
          body: "Every plant comes with a care card: a QR code to a short care video, a reminder to water carnivorous plants with distilled or rain water only, and a note on winter care."
        }
      ]
    },
    {
      id: "crew",
      tab: "Cleanup crew label",
      kicker: "Isopod starter culture",
      name: "Common morph isopods",
      features: [
        {
          id: "tank",
          line: "For: {tank}",
          title: "Sold by tank type",
          body: "We label cultures by the animal they're for, so you don't need to know species names.",
          tanks: ["dart frogs", "crested geckos", "leopard geckos"]
        },
        {
          id: "clean",
          line: "Pest-free · mite-checked",
          title: "The same clean standard",
          body: "Our cleanup crews meet the same standard as our plants:",
          steps: [
            "Leaf litter and wood are frozen for 48 hours, or baked, before use.",
            "New stock is quarantined for 30 days.",
            "Every culture is checked with a hand lens before it goes out."
          ]
        },
        {
          id: "count",
          line: "10 isopods · juveniles · packed {date}",
          title: "Counted and graded",
          body: "Every culture lists its exact count, its size class (juvenile or adult) and the date it was packed."
        },
        {
          id: "usda",
          line: "USDA-allowed species · ID verified",
          title: "Compliance on the box",
          body: "We only breed species that USDA allows to be kept and moved without a containment facility, and every culture's species ID is verified.",
          beforePermit: "Once our USDA permit is issued, its number goes on the box too.",
          afterPermit: "Our USDA permit number is printed on every box."
        },
        {
          id: "guarantee",
          line: "30-day colony guarantee",
          title: "30-day colony guarantee",
          body: "If a starter culture crashes in its first month, we replace it."
        }
      ]
    }
  ],

  // Offers shown under the labels, each with an "Ask about it" button.
  extras: [
    {
      id: "subscription",
      title: "Springtail subscription",
      body: "Monthly or every-two-weeks restocks for dart frog and gecko keepers, who use springtails as food.",
      beforePermit: "Available in New Jersey now, and by mail once our USDA permit arrives.",
      afterPermit: "Ships to the lower 48 states.",
      cta: "Ask about a subscription",
      subject: "Springtail subscription",
      message: "Hi Agar & Oak,\n\nI'm interested in a springtail subscription (monthly or every two weeks). Could you tell me the price and how pickup or delivery works?\n\nThanks,\n[your name]"
    },
    {
      id: "display",
      title: "Shop display jars",
      body: "A sealed mason jar with moss and a living springtail colony for your store counter, so customers can watch the animals move.",
      cta: "Ask about display jars",
      subject: "Shop display jars",
      message: "Hi Agar & Oak,\n\nI'm writing from [your shop] in [town]. We're interested in springtail display jars for our counter. Could you send pricing and availability?\n\nThanks,\n[your name]"
    }
  ]
};

// Lets the Netlify chat function read this file. Ignored by browsers.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { DIFFERENCES };
}
