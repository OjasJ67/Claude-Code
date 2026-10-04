# Agar & Oak website

A one-page site (plus a privacy page) for Agar & Oak: lab-grown plants and living cleanup crews.
Plain HTML, CSS and JavaScript. No build step, no cookies, no analytics, and no payments.

## Run it

- **On your computer:** double-click `index.html`.
- **Deploy:** upload the whole folder as-is to Netlify, Cloudflare Pages or GitHub Pages.

## Edit the content (you never need to touch the layout)

| File | What it holds |
| --- | --- |
| `assets/js/config.js` | Email, phone, Instagram, the two legal flags, and the chat setting |
| `assets/js/products.js` | Every product card: name, one-line purpose, prices, status |
| `assets/js/stats.js` | The big statistics and where each one appears |
| `assets/js/references.js` | The numbered reference list (stats and biology claims link here) |
| `assets/js/assistant.js` | What the chat assistant knows: its instant answers and the AI's briefing |
| `assets/js/planner.js` | The setup planner: which products it suggests for each setup and size |

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

## Chat assistant

The "Ask a question" button opens a chat that answers general questions.

- **Out of the box** it gives instant answers from `assets/js/assistant.js`. These work on any host and send nothing anywhere.
- **AI answers (optional, Netlify only):**
  1. Deploy the folder to Netlify (it reads `netlify.toml` and installs the one dependency in `package.json`; the site itself still has no build step).
  2. In Netlify, go to Site configuration → Environment variables and add `ANTHROPIC_API_KEY` with a key from console.anthropic.com.
  3. In `assets/js/config.js`, set `CHAT_ENDPOINT = "/api/chat"` and redeploy.

  The AI is briefed from the same files as the website (products, prices, flags, FAQ), so it stays in sync. If the AI is ever unavailable, visitors still get the instant answer.
  The endpoint is public, so set a monthly spend limit in the Anthropic Console.

## TODO before launch

- [ ] `assets/js/config.js`: add `INSTAGRAM` if you have one.
- [ ] Photos: every black "?" box is a placeholder. Product photos: set each product's `image` in `products.js`. The two "What we make" photos: change the `src` of the two `img-slot` images in `index.html`.
- [ ] Optional: switch on AI chat answers (see "Chat assistant" above).
- [ ] `index.html`, About section: replace "TODO: 2–3 sentences about you and why you started this."
- [ ] `privacy.html`: fill in the "Last updated" date.

## Copy rules (keep these when editing)

- Never call a product a fertilizer, plant food, soil amendment or soil improver.
- No medical or health claims about any plant.
- No guarantees: say "helps control mold" and "grown in sterile culture".
- Species names only; no patented or trademarked cultivar names.
- Cleanup crews: only species USDA allows without a containment facility (never Cubaris, Nesodillo or Merulanella).
