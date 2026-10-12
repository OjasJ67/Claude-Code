/* ==========================================================================
   Agar & Oak: Email Inquiry endpoint (Netlify Function, served at /api/inquiry)
   Emails each inquiry from the contact form to our Gmail inbox, with the
   visitor's address as Reply-To, so the visitor never leaves the page.
   Needs one environment variable in Netlify: GMAIL_APP_PASSWORD, a Google
   App Password for the EMAIL account in config.js (setup in README).
   The page only says "Sent" once Gmail has accepted the email.
   ========================================================================== */
import nodemailer from "nodemailer";
import configFile from "../../assets/js/config.js";

const { EMAIL } = configFile;

const LIMITS = { subject: 160, product: 120, name: 120, email: 200, businessName: 160, town: 120, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let transporter; // created on first use; reads GMAIL_APP_PASSWORD
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER || EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, "") // Google shows it in groups of four
      }
    });
  }
  return transporter;
}

// One line, trimmed and capped: header fields must never contain line breaks.
function field(data, key) {
  const value = String(data[key] || "").replace(/[\r\n]+/g, " ").trim();
  return value.slice(0, LIMITS[key] || 200);
}

// The page sends JSON-friendly replies; a plain form post (no JavaScript) gets a short page.
function reply(req, ok, error, status) {
  const wantsJson = (req.headers.get("accept") || "").includes("application/json");
  if (wantsJson) {
    return new Response(JSON.stringify(ok ? { ok: true } : { error }), {
      status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
    });
  }
  const text = ok
    ? "Thanks! Your inquiry was sent. We'll reply by email."
    : "Sorry, we couldn't send that. Please email " + EMAIL + " instead.";
  return new Response(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
      "<title>Agar &amp; Oak</title><p>" + text + '</p><p><a href="/#contact">Back to Agar &amp; Oak</a></p>',
    { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }
  );
}

export default async (req) => {
  if (req.method !== "POST") return reply(req, false, "method_not_allowed", 405);

  // Only accept inquiries from this site's own pages.
  const origin = req.headers.get("origin");
  if (origin && origin !== "null" && new URL(origin).host !== new URL(req.url).host) {
    return reply(req, false, "forbidden", 403);
  }

  let data;
  try {
    data = Object.fromEntries(new URLSearchParams(await req.text()));
  } catch {
    return reply(req, false, "bad_request", 400);
  }

  // Bots fill the hidden trap field; pretend it worked and send nothing.
  if (String(data["bot-field"] || "").trim()) return reply(req, true, null, 200);

  const email = field(data, "email");
  const message = String(data.message || "").replace(/\r\n?/g, "\n").trim().slice(0, LIMITS.message);
  if (!EMAIL_RE.test(email) || !message) return reply(req, false, "bad_request", 400);

  if (!process.env.GMAIL_APP_PASSWORD) {
    console.error("GMAIL_APP_PASSWORD is not set, so Email Inquiry can't send.");
    return reply(req, false, "not_configured", 503);
  }

  const name = field(data, "name");
  const subject = field(data, "subject") || "Website inquiry";
  const details = [
    ["Product", field(data, "product")],
    ["Name", name],
    ["Email", email],
    ["Shop", field(data, "businessName")],
    ["Town", field(data, "town")]
  ].filter((row) => row[1]).map((row) => row[0] + ": " + row[1]).join("\n");

  try {
    await getTransporter().sendMail({
      from: { name: "Agar & Oak website", address: process.env.GMAIL_USER || EMAIL },
      to: EMAIL,
      replyTo: name ? { name, address: email } : email,
      subject: "[Website] " + subject,
      text: message + "\n\n---\n" + details + "\n\nSent from the inquiry form on the Agar & Oak website. Reply to this email to answer them."
    });
    return reply(req, true, null, 200);
  } catch (error) {
    transporter = null; // start fresh next time (for example after the password changes)
    if (error && (error.code === "EAUTH" || error.responseCode === 535)) {
      console.error("Gmail rejected the login; check GMAIL_APP_PASSWORD (it must be a Google App Password).");
      return reply(req, false, "not_configured", 503);
    }
    console.error("Sending the inquiry email failed:", error && error.message);
    return reply(req, false, "send_failed", 502);
  }
};

export const config = { path: "/api/inquiry" };
