# Agar & Oak website

A one-page site (plus a privacy page) for Agar & Oak: lab-grown plants and living cleanup crews.
Plain HTML, CSS and JavaScript. No build step, no cookies, no analytics, and no payments.

## Run it

- **On your computer:** double-click `index.html`.
- **Deploy:** upload the whole folder as-is to Netlify, Cloudflare Pages or GitHub Pages.

## Edit the content (you never need to touch the layout)

| File | What it holds |
| --- | --- |
| `assets/js/config.js` | Email, phone, Instagram, the two legal flags, the survey link, site address, survival rate and the chat setting |
| `assets/js/products.js` | Every product card: name, one-line purpose, prices, status, and the "What we're testing next" items |
| `assets/js/stats.js` | The big statistics and where each one appears |
| `assets/js/references.js` | The numbered reference list (stats and biology claims link here) |
| `assets/js/differences.js` | "What makes us different": every line on the two sample labels, what it means, and the subscription and display-jar offers |
| `assets/js/assistant.js` | The chat assistant's instant answers |
| `assets/js/assistant-prompt.js` | The briefing the AI gets (only used when AI answers are on) |
| `assets/js/planner.js` | The setup planner: which products it suggests for each setup and size |

### Legal flags (`config.js`)

- `njNurseryCertified`: while `false`, plants are waitlist only. No plant price appears anywhere on the site (cards,
  planner, inquiry form, messages, chat), and plant buttons read "Join the waitlist". Set it to `true` once the NJ Dept.
  of Agriculture nursery certificate arrives: prices come back and buttons read "Buy now".
- `usdaPPQ526Permit`: while `false`, cleanup crews show pickup prices and "NJ local pickup only", and shipping is
  disabled in the inquiry form. Set it to `true` once the USDA permit arrives: shipped prices and "Ships to the lower 48 states" appear.

The "Do you ship?" and "Can you ship cleanup crews?" FAQ answers, the cleanup-crew label and the For shops small print
update from these flags automatically.

### Other settings (`config.js`)

- `SURVEY_URL`: your Google Forms link. It drives the "Take the 1-minute survey" button and the survey pop-up; set it to `""` to hide both.
- `SURVEY_POPUP_SECONDS`: how long after the page opens the survey pop-up appears (20 by default). `0` turns the pop-up off.
  It shows once per visit, never while someone is typing or using the chat, and not at all if they already opened the survey.
- `SITE_URL`: your site's full address. Used for link previews (`og:url` and full image links).
- `SURVIVAL_RATE`: your measured 4-week survival rate, like `"94%"`. Until then the plant label says "posted once measured".

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

  The AI is briefed from the same files as the website (products, prices, flags, selling points, FAQ), so it stays in sync. If the AI is ever unavailable, visitors still get the instant answer.
  The chat's code only downloads the first time someone opens the chat, so it doesn't slow the page down.
  The endpoint is public, so set a monthly spend limit in the Anthropic Console.

## TODO before launch

- [ ] Photos are in `assets/img/products/` (one per product) and `assets/img/photos/` (the two "What we make" cards); the link-preview image is `assets/img/og-image.png` (1200 × 630). Swap any of them for your own photos of your actual products when you have them.
- [ ] `SITE_URL` in `config.js`: set it once you have an address. Link-preview crawlers don't run JavaScript, so also uncomment the `og:url` tag in `index.html` and use full `https://` links in the `og:image` and `twitter:image` tags.
- [ ] Before shipping premium isopods out of state, check that *Armadillidium klugii* and *A. maculatum* are both named on your USDA permit.
- [ ] `assets/js/config.js`: add `INSTAGRAM` if you have one.
- [ ] Check the promises in `differences.js` before launch, especially the two guarantees (30 days on rooted starter plants; replacing a starter culture that crashes in its first month), the springtail subscription and display jars, and the QR care-video card.
- [ ] Optional: switch on AI chat answers (see "Chat assistant" above).
- [ ] `privacy.html`: update the "Last updated" date whenever you change the page.

## Copy rules (keep these when editing)

- Never call a product a fertilizer, plant food, soil amendment or soil improver.
- No medical or health claims about any plant, mushroom or other product.
- Never claim products are free of pests. Plants: "grown in sterile culture" or "no pesticides used". Cleanup crews: "mite-checked".
- No product-effect guarantees: say "helps control mold". The only guarantees are the two in the FAQ "What do your guarantees cover?".
- Don't describe species as "USDA-approved". Once the permit arrives, say you ship only species named on your USDA permit.
- Species names only; no patented or trademarked cultivar names.
- Cleanup crews: never Cubaris, Nesodillo or Merulanella (they need a USDA containment facility).
- No street address anywhere on the site; "North Brunswick, New Jersey" is as specific as it gets.
