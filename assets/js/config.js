/* ==========================================================================
   Agar & Oak: owner settings
   Edit the values below. Nothing else on the site needs to change.
   ========================================================================== */

// Contact details used by every "Buy now" button, the contact section and privacy page.
const EMAIL = "AgarAndOak@gmail.com";
const PHONE = "+17328237221";            // E.164 format for tel: and sms: links (no spaces)
const PHONE_DISPLAY = "+1 732-823-7221"; // how the number is shown on the page
const INSTAGRAM = "";                    // a handle ("agarandoak") or full URL; leave "" to hide it

// true: "Email Inquiry" sends the message from this page through Netlify Forms, and the
// visitor stays on the site (turn on form detection and an email notification in Netlify,
// see README). false: it opens the visitor's own email app instead.
const EMAIL_FROM_SITE = true;

// Legal flags. Flip to true as each license arrives.
const FLAGS = {
  njNurseryCertified: false, // NJ Dept. of Agriculture nursery certificate
  usdaPPQ526Permit: false    // USDA permit to ship isopods/springtails out of state
};

// Links and numbers that aren't ready yet. Leave "" until you have them.
const SURVEY_URL = "https://forms.gle/LbjYci4FycCzMYqG7"; // your Google Forms survey; "" hides the survey button and pop-up
const SURVEY_POPUP_SECONDS = 20; // seconds before the survey pop-up appears; 0 turns the pop-up off
const SITE_URL = "";      // the site's full address, e.g. "https://agarandoak.com/" (used for link previews)
const SURVIVAL_RATE = ""; // your measured 4-week survival rate, e.g. "94%"; the plant label says "posted once measured" until then

// Chat assistant. Leave "" for instant answers from the site's FAQ (works anywhere).
// After deploying to Netlify with an ANTHROPIC_API_KEY set, change to "/api/chat"
// for AI answers (see README).
const CHAT_ENDPOINT = "";

// Lets the Netlify chat function read these settings. Ignored by browsers.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { EMAIL, PHONE, PHONE_DISPLAY, INSTAGRAM, EMAIL_FROM_SITE, FLAGS, SURVEY_URL, SURVEY_POPUP_SECONDS, SITE_URL, SURVIVAL_RATE, CHAT_ENDPOINT };
}
