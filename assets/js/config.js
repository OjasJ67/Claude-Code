/* ==========================================================================
   Agar & Oak: owner settings
   Edit the values below. Nothing else on the site needs to change.
   ========================================================================== */

// Contact details used by every "Buy now" button, the contact section and privacy page.
const EMAIL = "AgarOakContact@gmail.com";
const PHONE = "+17328237221";            // E.164 format for tel: and sms: links (no spaces)
const PHONE_DISPLAY = "+1 732-823-7221"; // how the number is shown on the page
const INSTAGRAM = "";                    // a handle ("agarandoak") or full URL; leave "" to hide it

// Legal flags. Flip to true as each license arrives.
const FLAGS = {
  njNurseryCertified: false, // NJ Dept. of Agriculture nursery certificate
  usdaPPQ526Permit: false    // USDA permit to ship isopods/springtails out of state
};

// Chat assistant. Leave "" for instant answers from the site's FAQ (works anywhere).
// After deploying to Netlify with an ANTHROPIC_API_KEY set, change to "/api/chat"
// for AI answers (see README).
const CHAT_ENDPOINT = "";

// Lets the Netlify chat function read these settings. Ignored by browsers.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { EMAIL, PHONE, PHONE_DISPLAY, INSTAGRAM, FLAGS, CHAT_ENDPOINT };
}
