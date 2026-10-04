/* Statistics. Use exactly as published; never round differently.
   value:     shown huge
   label:     shown under the number (simple HTML like <i> is allowed)
   source:    short citation text shown under the label
   refs:      reference numbers from references.js
   placement: "band" (stats band, max 6), "plants" or "crews" */
const STATS = [
  {
    value: "15.8",
    label: "plantlets from a single shoot in 8 weeks of culture (<i>Drosera intermedia</i>)",
    source: "Grevenstuk et al. 2010",
    refs: [5],
    placement: "band"
  },
  {
    value: "20",
    label: "new shoots from one Venus flytrap explant on half-strength MS medium (20.44 average)",
    source: "Vu et al. 2015",
    refs: [6],
    placement: "band"
  },
  {
    value: "~100%",
    label: "of lab-rooted Venus flytraps survived transplanting to pots",
    source: "Jang et al. 2003",
    refs: [4],
    placement: "band"
  },
  {
    value: "75 mi",
    label: "the only wild range of the Venus flytrap: a 75-mile radius around Wilmington, NC. Poaching has been a felony there since 2014",
    source: "NC State CNR 2021",
    refs: [13],
    placement: "plants"
  },
  {
    value: "3,710",
    label: "known species of land-dwelling isopods",
    source: "Sfenthourakis &amp; Taiti 2015",
    refs: [9],
    placement: "band"
  },
  {
    value: "100,000",
    label: "springtails per square meter of soil, at the high end",
    source: "Field Studies Council; Hopkin 1997",
    refs: [12, 11],
    placement: "band"
  },
  {
    value: "40+ yrs",
    label: "that the springtail <i>Folsomia candida</i> has been a standard soil test organism",
    source: "Fountain &amp; Hopkin 2005",
    refs: [10],
    placement: "band"
  },
  {
    value: "6 million",
    label: "U.S. households keep reptiles, the core market for cleanup crews",
    source: "APPA 2025",
    refs: [14],
    placement: "crews"
  }
];
