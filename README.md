# Agar & Oak website

A one-page site (plus a privacy page) for Agar & Oak: lab-grown plants and living cleanup crews.
Plain HTML, CSS and JavaScript. No build step, no cookies, no analytics, and no payments.

## Run it

- **On your computer:** double-click `index.html`.
- **Deploy:** upload the whole folder as-is to Netlify, Cloudflare Pages or GitHub Pages.

## Edit the content (you never need to touch the layout)

| File | What it holds |
| --- | --- |
| `assets/js/config.js` | Email, phone, Instagram, and the two legal flags |
| `assets/js/products.js` | Every product card: name, one-line purpose, prices, status |
| `assets/js/stats.js` | The big statistics and where each one appears |
| `assets/js/references.js` | The numbered reference list (stats and biology claims link here) |

### Legal flags (`config.js`)

- `njNurseryCertified`: while `false`, plant cards read "Waitlist · taking inquiries" with a "Reserve: inquire" button.
  Set it to `true` once the NJ Dept. of Agriculture nursery certificate arrives: cards switch to "Available" and "Buy now".
- `usdaPPQ526Permit`: while `false`, cleanup crews show pickup prices and "NJ local pickup only", and shipping is
  disabled in the inquiry form. Set it to `true` once the USDA permit arrives: shipped prices and "Ships to the lower 48 states" appear.

The "Do you ship?" FAQ answer updates from these flags automatically.

### How "Buy now" works

Each product button fills in a message for that product and jumps to the contact form at the bottom.
The visitor sends it from their own email or text app. Links like `index.html?product=venus-flytrap-jar#contact`
open the form with that product already chosen.

## TODO before launch

- [ ] `assets/js/config.js`: replace `EMAIL` and `PHONE` with your real details (and add `INSTAGRAM` if you have one).
- [ ] Product photos: swap the placeholders in `assets/img/placeholders/` for your own 4:3 photos and update each product's `image` in `products.js`.
- [ ] `index.html`, About section: replace "TODO: 2–3 sentences about you and why you started this."
- [ ] `privacy.html`: fill in the "Last updated" date.

## Copy rules (keep these when editing)

- Never call a product a fertilizer, plant food, soil amendment or soil improver.
- No medical or health claims about any plant.
- No guarantees: say "helps control mold" and "grown in sterile culture".
- Species names only; no patented or trademarked cultivar names.
- Cleanup crews: only species USDA allows without a containment facility (never Cubaris, Nesodillo or Merulanella).
