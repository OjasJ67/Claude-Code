/* ==========================================================================
   Agar & Oak: chat assistant
   Answers come from, in order of preference:
   1. an AI backend the page provides (window.AGAR_CHAT_BACKEND), if any;
   2. the AI endpoint in config.js (CHAT_ENDPOINT), if set;
   3. instant answers from assistant.js, which work anywhere with no network.
   If an AI answer fails, the visitor still gets the instant answer.
   main.js loads this file (and assistant.js) the first time someone opens the chat.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.getElementById("chat");
  if (!root || typeof ASSISTANT === "undefined") return;

  var els = {
    launcher: document.getElementById("chat-launcher"),
    panel: document.getElementById("chat-panel"),
    close: document.getElementById("chat-close"),
    mode: document.getElementById("chat-mode"),
    log: document.getElementById("chat-log"),
    suggest: document.getElementById("chat-suggest"),
    form: document.getElementById("chat-form"),
    input: document.getElementById("chat-input"),
    human: document.getElementById("chat-human")
  };

  var SUGGESTIONS = [
    "How do I buy?",
    "Which cleanup crew do I need?",
    "What is tissue culture?",
    "Can you ship cleanup crews?",
    "What do your guarantees cover?"
  ];
  var MAX_TURNS = 10;

  var ctx = {
    products: typeof PRODUCTS !== "undefined" ? PRODUCTS : [],
    flags: typeof FLAGS !== "undefined" ? FLAGS : { njNurseryCertified: false, usdaPPQ526Permit: false },
    email: typeof EMAIL !== "undefined" ? EMAIL : "",
    phoneDisplay: typeof PHONE_DISPLAY !== "undefined" ? PHONE_DISPLAY : (typeof PHONE !== "undefined" ? PHONE : ""),
    differences: typeof DIFFERENCES !== "undefined" ? DIFFERENCES : null,
    survivalRate: typeof SURVIVAL_RATE !== "undefined" ? SURVIVAL_RATE : ""
  };

  var turns = [];          // the conversation sent to the AI: [{role, content}]
  var lastQuestion = "";
  var busy = false;
  var greeted = false;
  var aiOff = false;       // set when the AI backend says it can't serve this visitor

  /* ---------- AI backends ---------- */
  function endpointBackend(url) {
    return {
      label: "AI assistant · can make mistakes",
      ask: function (history) {
        return fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history })
        }).then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            if (res.ok && data.reply) return data.reply;
            var err = new Error(data.error || "http_" + res.status);
            // Not configured or not found: stop trying for this visit.
            err.permanent = res.status === 404 || res.status === 503 || res.status === 405;
            throw err;
          });
        });
      }
    };
  }

  function backend() {
    if (aiOff) return null;
    if (window.AGAR_CHAT_BACKEND) return window.AGAR_CHAT_BACKEND;
    if (typeof CHAT_ENDPOINT !== "undefined" && CHAT_ENDPOINT) return endpointBackend(CHAT_ENDPOINT);
    return null;
  }

  function setModeLabel() {
    var b = backend();
    els.mode.textContent = b ? b.label : "Instant answers from our FAQ";
  }

  /* ---------- Rendering ---------- */
  function cleanText(t) {
    // Answers are shown as plain text; drop stray Markdown emphasis and headings.
    return String(t).replace(/\*\*(.+?)\*\*/g, "$1").replace(/^#+\s*/gm, "").trim();
  }

  function addMessage(role, content, extraClass) {
    var div = document.createElement("div");
    div.className = "msg " + (role === "user" ? "msg-user" : "msg-bot") + (extraClass ? " " + extraClass : "");
    div.textContent = content;
    els.log.appendChild(div);
    els.log.scrollTop = els.log.scrollHeight;
    return div;
  }

  function renderSuggestions() {
    els.suggest.textContent = "";
    SUGGESTIONS.forEach(function (q) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = q;
      b.addEventListener("click", function () { ask(q); });
      els.suggest.appendChild(b);
    });
  }

  /* ---------- Asking ---------- */
  function ask(question) {
    question = String(question || "").trim();
    if (!question || busy) return;
    busy = true;
    lastQuestion = question;
    els.suggest.textContent = "";
    addMessage("user", question);
    els.input.value = "";

    var instant = ASSISTANT.answerOffline(question, ctx);
    var b = backend();
    if (!b) {
      addMessage("bot", instant.text);
      busy = false;
      return;
    }

    var bubble = addMessage("bot", "Thinking…", "msg-wait");
    var history = turns.concat([{ role: "user", content: question }]).slice(-MAX_TURNS);
    if (history[0].role !== "user") history.shift();

    Promise.resolve()
      .then(function () {
        // The AI briefing is only needed where the page talks to the AI itself (the preview).
        var prompt = typeof ASSISTANT_PROMPT !== "undefined" ? ASSISTANT_PROMPT.build(ASSISTANT, ctx) : "";
        return b.ask(history, prompt, function (partial) {
          bubble.classList.remove("msg-wait");
          bubble.textContent = cleanText(partial);
        });
      })
      .then(function (reply) {
        reply = cleanText(reply);
        if (!reply) throw new Error("empty");
        bubble.classList.remove("msg-wait");
        bubble.textContent = reply;
        turns.push({ role: "user", content: question }, { role: "assistant", content: reply });
        turns = turns.slice(-MAX_TURNS);
      })
      .catch(function (err) {
        if (err && err.permanent) { aiOff = true; setModeLabel(); }
        bubble.classList.remove("msg-wait");
        bubble.textContent = instant.text;
      })
      .then(function () {
        busy = false;
        els.log.scrollTop = els.log.scrollHeight;
      });
  }

  /* ---------- Open / close ---------- */
  function open(prompt) {
    els.panel.hidden = false;
    els.launcher.setAttribute("aria-expanded", "true");
    if (!greeted) {
      greeted = true;
      addMessage("bot", "Hi! I answer general questions about our lab-grown plants, cleanup crews, shipping and how buying works. What would you like to know?");
      renderSuggestions();
    }
    if (prompt) els.input.value = prompt;
    els.input.focus();
  }

  function close() {
    els.panel.hidden = true;
    els.launcher.setAttribute("aria-expanded", "false");
    els.launcher.focus();
  }

  els.launcher.addEventListener("click", function () { open(); });
  els.close.addEventListener("click", close);
  els.panel.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { e.stopPropagation(); close(); }
  });
  els.form.addEventListener("submit", function (e) {
    e.preventDefault();
    ask(els.input.value);
  });

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-open-chat]");
    if (!trigger) return;
    e.preventDefault();
    open(trigger.getAttribute("data-chat-prompt") || "");
  });

  els.human.addEventListener("click", function () {
    if (!window.AgarOak) return;
    els.panel.hidden = true;
    els.launcher.setAttribute("aria-expanded", "false");
    window.AgarOak.inquireWith(
      "Question from the website",
      "Hi Agar & Oak, I have a question: " + lastQuestion + "\n\nThanks,\n[your name]"
    );
  });

  setModeLabel();
  root.hidden = false;
  window.AgarChat = { open: open };
})();
