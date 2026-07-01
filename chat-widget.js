/* ============================================================
   CredPayZ — On-site Chat Widget  ("Talk to us")
   Bottom-LEFT launcher. Chats on your site via Gemini backend.
   No dependencies. Paste-and-go.

   >>> SETUP: paste your Apps Script Web App URL below (BACKEND_URL).
   Until you do, the bot runs in a basic offline mode that
   always offers WhatsApp + Call so you never miss a customer.
============================================================ */
(function () {
  "use strict";

  var CONFIG = {
    // ▼▼▼  PASTE YOUR APPS SCRIPT WEB APP URL HERE (between the quotes)  ▼▼▼
    BACKEND_URL: "https://script.google.com/macros/s/AKfycbyd5I7R21h35mibDNuMIR2h-CKWWPEZ8Z1muirti-NLRlw_iTneNNMiLvAciP1jJ3W0/exec",
    // ▲▲▲  e.g. "https://script.google.com/macros/s/AKfy.../exec"        ▲▲▲

    WHATSAPP: "919911312139",          // Primary WhatsApp (prompt: share 9911312139 first)
    PHONE: "+919911312139",            // Primary call number

    // Inquiry form (mirrors your website form) -------------------
    // Same Google Sheet your website enquiry form already uses:
    SHEET_URL: "https://script.google.com/macros/s/AKfycbx83l6hvt9dRhnFeaJlmmLTuZ7qYKuR5so0lrRoxHNtCHmaixPltNZpO6pF43PPvEKr/exec",
    // Number the form's WhatsApp message opens (matches your website form):
    FORM_WHATSAPP: "919911312139",
    // -----------------------------------------------------------

    BOT_NAME: "CredPayZ Assistant",
    GREETING: "Hello! 👋 Welcome to CredPayZ. We help you turn your credit card limit into cash, pay your credit card bills, and do card-to-card transfers — safely and fast. How can I help you today? 😊",
    QUICK_REPLIES: [
      "Pay my credit card bill",
      "Transfer card limit to bank",
      "Card-to-card transfer",
      "What are your charges?"
    ]
  };

  // ---------- styles ----------
  var css = `
  .cpz-launch{position:fixed;left:22px;bottom:22px;z-index:9998;display:flex;align-items:center;gap:10px;
    background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;border:none;cursor:pointer;
    padding:13px 18px 13px 14px;border-radius:50px;font-family:'Inter',system-ui,sans-serif;font-size:14px;font-weight:600;
    box-shadow:0 10px 30px rgba(124,58,237,.4);transition:transform .25s ease,box-shadow .25s ease}
  .cpz-launch:hover{transform:translateY(-2px);box-shadow:0 14px 38px rgba(124,58,237,.5)}
  .cpz-launch svg{width:22px;height:22px;flex-shrink:0}
  .cpz-launch .cpz-dot{position:absolute;top:8px;left:34px;width:9px;height:9px;border-radius:50%;background:#22c55e;border:2px solid #fff;
    animation:cpzPulse 2s infinite}
  @keyframes cpzPulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.6)}50%{box-shadow:0 0 0 6px rgba(34,197,94,0)}}
  .cpz-launch.cpz-hide{transform:scale(0);opacity:0;pointer-events:none}

  .cpz-panel,.cpz-panel *{box-sizing:border-box;max-width:100%}.cpz-panel button,.cpz-panel a,.cpz-panel textarea{margin:0}
  .cpz-panel{position:fixed;left:22px;bottom:22px;z-index:9999;width:370px;max-width:calc(100vw - 28px);height:560px;max-height:calc(100vh - 40px);overflow:hidden;
    background:#fff;border-radius:20px;box-shadow:0 24px 70px rgba(26,16,51,.28);display:flex;flex-direction:column;overflow:hidden;
    font-family:'Inter',system-ui,sans-serif;opacity:0;transform:translateY(20px) scale(.98);pointer-events:none;
    transition:opacity .28s ease,transform .28s ease}
  .cpz-panel.cpz-open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}

  .cpz-head{background:linear-gradient(135deg,#5b21b6,#7c3aed);color:#fff;padding:16px 18px;display:flex;align-items:center;gap:12px}
  .cpz-av{width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .cpz-av svg{width:22px;height:22px}
  .cpz-htext b{display:block;font-family:'Space Grotesk','Inter',sans-serif;font-size:15px;font-weight:700;line-height:1.2}
  .cpz-htext span{font-size:12px;opacity:.85;display:flex;align-items:center;gap:5px}
  .cpz-htext span::before{content:'';width:7px;height:7px;border-radius:50%;background:#22c55e;display:inline-block}
  .cpz-x{margin-left:auto;background:none;border:none;color:#fff;font-size:22px;cursor:pointer;opacity:.85;line-height:1;padding:4px}
  .cpz-x:hover{opacity:1}

  .cpz-body{flex:1;overflow-y:auto;overflow-x:hidden;padding:18px;background:#f7f5ff;display:flex;flex-direction:column;gap:12px}
  .cpz-msg{max-width:82%;padding:11px 14px;border-radius:14px;font-size:13.5px;line-height:1.55;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:anywhere}
  .cpz-msg.bot{background:#fff;color:#2b1d4d;border:1px solid rgba(124,58,237,.12);border-bottom-left-radius:4px;align-self:flex-start;box-shadow:0 2px 8px rgba(124,58,237,.05)}
  .cpz-msg.user{background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;border-bottom-right-radius:4px;align-self:flex-end}
  .cpz-typing{align-self:flex-start;background:#fff;border:1px solid rgba(124,58,237,.12);border-radius:14px;border-bottom-left-radius:4px;padding:13px 16px;display:flex;gap:5px}
  .cpz-typing span{width:7px;height:7px;border-radius:50%;background:#c4b5fd;animation:cpzBlink 1.4s infinite both}
  .cpz-typing span:nth-child(2){animation-delay:.2s}.cpz-typing span:nth-child(3){animation-delay:.4s}
  @keyframes cpzBlink{0%,80%,100%{opacity:.3}40%{opacity:1}}

  .cpz-chips{display:flex;flex-wrap:wrap;gap:8px;padding:0 18px 4px;width:100%;max-width:100%;box-sizing:border-box}
  .cpz-chip{max-width:100%;white-space:normal;background:#fff;border:1px solid rgba(124,58,237,.25);color:#6d28d9;font-size:12px;font-weight:600;
    padding:7px 12px;border-radius:20px;cursor:pointer;transition:all .2s;font-family:inherit}
  .cpz-chip:hover{background:#7c3aed;color:#fff;border-color:#7c3aed}

  .cpz-cta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:8px 18px 0;width:100%;max-width:100%}
  .cpz-cta a{min-width:0;text-align:center;text-decoration:none;font-size:12px;font-weight:700;padding:9px 4px;border-radius:10px;color:#fff;display:flex;align-items:center;justify-content:center;gap:5px;white-space:nowrap;overflow:hidden}
  .cpz-cta a svg{width:15px;height:15px}
  .cpz-cta .wa{background:#16a34a}.cpz-cta .call{background:#e08600}.cpz-cta .form{background:#7c3aed}

  .cpz-foot{padding:12px 14px;background:#fff;border-top:1px solid rgba(124,58,237,.1);display:grid;grid-template-columns:minmax(0,1fr) 42px;gap:8px;align-items:end;width:100%;max-width:100%;overflow:hidden}
  .cpz-input{width:100%;min-width:0;border:1px solid rgba(124,58,237,.2);border-radius:22px;padding:11px 15px;font-size:16px;font-family:inherit;
    resize:none;max-height:90px;outline:none;color:#1a1033;line-height:1.4}
  .cpz-input:focus{border-color:#7c3aed}
  .cpz-send{width:42px;height:42px;flex-shrink:0;border:none;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#6d28d9);
    color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s}
  .cpz-send:hover{transform:scale(1.08)}.cpz-send:disabled{opacity:.5;cursor:default;transform:none}
  .cpz-send svg{width:19px;height:19px}
  .cpz-note{font-size:10.5px;color:#8b7aa8;text-align:center;padding:6px 0 9px;background:#fff}

  /* in-chat inquiry form */
  .cpz-form{align-self:stretch;background:#fff;border:1px solid rgba(124,58,237,.18);border-radius:14px;padding:14px;box-shadow:0 4px 16px rgba(124,58,237,.08)}
  .cpz-form h4{margin:0 0 3px;font-family:'Space Grotesk','Inter',sans-serif;font-size:14px;color:#5b21b6}
  .cpz-form p.s{margin:0 0 12px;font-size:11.5px;color:#8b7aa8;line-height:1.4}
  .cpz-form label{display:block;font-size:11.5px;font-weight:600;color:#4c3a6b;margin:10px 0 4px}
  .cpz-form input[type=text],.cpz-form input[type=tel],.cpz-form select{width:100%;box-sizing:border-box;border:1px solid rgba(124,58,237,.22);border-radius:9px;padding:9px 11px;font-size:13px;font-family:inherit;color:#1a1033;outline:none;background:#faf9ff}
  .cpz-form input:focus,.cpz-form select:focus{border-color:#7c3aed}
  .cpz-form .opt{display:flex;align-items:flex-start;gap:7px;font-size:12px;color:#3a2a55;margin:5px 0;font-weight:500;cursor:pointer}
  .cpz-form .opt input{margin-top:2px;flex-shrink:0}
  .cpz-words{font-size:11px;color:#7c3aed;font-weight:600;margin-top:4px;min-height:14px}
  .cpz-form-submit{width:100%;margin-top:14px;border:none;border-radius:10px;background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff;font-weight:700;font-size:13px;padding:12px;cursor:pointer;font-family:inherit}
  .cpz-form-submit:hover{filter:brightness(1.07)}.cpz-form-submit:disabled{opacity:.6}
  .cpz-form-note{font-size:10.5px;color:#9b8bb5;margin-top:9px;text-align:center;line-height:1.4}

  @media(max-width:480px){
    .cpz-panel{left:0;right:0;bottom:0;top:auto;width:auto;max-width:100%;height:85dvh;max-height:100dvh;border-radius:18px 18px 0 0}
    .cpz-launch{left:16px;bottom:16px}
    .cpz-cta a{font-size:11.5px;padding:9px 4px;gap:4px}
    .cpz-cta a svg{width:13px;height:13px}
  }`;

  // ---------- inject ----------
  var styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  var ICON_HEADSET = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14v-2a9 9 0 0118 0v2"/><path d="M21 16a2 2 0 01-2 2h-1v-6h1a2 2 0 012 2z"/><path d="M3 16a2 2 0 002 2h1v-6H5a2 2 0 00-2 2z"/><path d="M19 18v1a3 3 0 01-3 3h-4"/></svg>';

  var launcher = document.createElement("button");
  launcher.className = "cpz-launch";
  launcher.setAttribute("aria-label", "Talk to us");
  launcher.innerHTML = '<span class="cpz-dot"></span>' + ICON_HEADSET + '<span>Talk to us</span>';
  document.body.appendChild(launcher);

  var panel = document.createElement("div");
  panel.className = "cpz-panel";
  panel.innerHTML =
    '<div class="cpz-head">' +
      '<div class="cpz-av">' + ICON_HEADSET + '</div>' +
      '<div class="cpz-htext"><b>' + CONFIG.BOT_NAME + '</b><span>Online · replies in seconds</span></div>' +
      '<button class="cpz-x" aria-label="Close">&times;</button>' +
    '</div>' +
    '<div class="cpz-body" id="cpzBody"></div>' +
    '<div class="cpz-chips" id="cpzChips"></div>' +
    '<div class="cpz-cta">' +
      '<a class="form" id="cpzFormBtn" href="javascript:void(0)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h4"/></svg>Form</a>' +
      '<a class="wa" href="https://wa.me/' + CONFIG.WHATSAPP + '" target="_blank" rel="noopener"><svg viewBox="0 0 32 32" fill="currentColor"><path d="M16 3C9 3 3.5 8.5 3.5 15.5c0 2.4.7 4.7 1.9 6.7L3 29l7-1.8c1.9 1 4 1.6 6 1.6 7 0 12.5-5.5 12.5-12.5S23 3 16 3z"/></svg>WhatsApp</a>' +
      '<a class="call" href="tel:' + CONFIG.PHONE + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.6A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.4-1.2a2 2 0 012.1-.4c.9.3 1.8.6 2.7.7a2 2 0 011.7 2z"/></svg>Call</a>' +
    '</div>' +
    '<div class="cpz-foot">' +
      '<textarea class="cpz-input" id="cpzInput" rows="1" placeholder="Type your message…"></textarea>' +
      '<button class="cpz-send" id="cpzSend" aria-label="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg></button>' +
    '</div>' +
    '<div class="cpz-note">Powered by CredPayZ · For verification, please call or WhatsApp us</div>';
  document.body.appendChild(panel);

  var body = panel.querySelector("#cpzBody");
  var chips = panel.querySelector("#cpzChips");
  var input = panel.querySelector("#cpzInput");
  var sendBtn = panel.querySelector("#cpzSend");

  // ---------- state (persists while browsing pages in one session) ----------
  // Unique ID for this conversation (groups all its messages into one row in the log)
  var SID = (function () {
    try {
      var s = sessionStorage.getItem("cpz_sid");
      if (!s) { s = "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); sessionStorage.setItem("cpz_sid", s); }
      return s;
    } catch (e) { return "c" + Date.now(); }
  })();

  var history = [];
  try {
    var saved = sessionStorage.getItem("cpz_chat");
    if (saved) history = JSON.parse(saved);
  } catch (e) {}

  function save() {
    try { sessionStorage.setItem("cpz_chat", JSON.stringify(history)); } catch (e) {}
  }

  function addBubble(role, text) {
    var d = document.createElement("div");
    d.className = "cpz-msg " + (role === "user" ? "user" : "bot");
    d.textContent = text;
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
  }

  function renderChips() {
    chips.innerHTML = "";
    if (history.length > 1) { chips.style.display = "none"; return; }
    chips.style.display = "flex";
    CONFIG.QUICK_REPLIES.forEach(function (q) {
      var c = document.createElement("button");
      c.className = "cpz-chip";
      c.textContent = q;
      c.onclick = function () { send(q); };
      chips.appendChild(c);
    });
  }

  function renderAll() {
    body.innerHTML = "";
    if (history.length === 0) {
      history.push({ role: "bot", text: CONFIG.GREETING });
    }
    history.forEach(function (m) { addBubble(m.role, m.text); });
    renderChips();
  }

  var typingEl = null;
  function showTyping() {
    typingEl = document.createElement("div");
    typingEl.className = "cpz-typing";
    typingEl.innerHTML = "<span></span><span></span><span></span>";
    body.appendChild(typingEl);
    body.scrollTop = body.scrollHeight;
  }
  function hideTyping() { if (typingEl) { typingEl.remove(); typingEl = null; } }

  // ---------- offline fallback (used if no backend / error) ----------
  function offlineReply(text) {
    var t = text.toLowerCase();
    if (/(rate|price|charge|percent|%|fee|cost|bill)/.test(t))
      return "Our charges depend on the amount and type (one-time or monthly rotation). For bill payment it starts at just 0.8%. For the best rate for your case, tap WhatsApp or Call below on 9911312139 / 8588886883. 🙏";
    if (/(office|location|address|where|visit)/.test(t))
      return "We have 2 offices in Ghaziabad: (1) Ansal Tanushree, Near Mahagunpuram, Mehrauli, NH24. (2) Shop UG15, Esquire Market, Ruchira Sapphire, Jaipuria Sunrise Greens, NH24. You're welcome to visit! 📍 Or reach us on 9911312139 / 8588886883.";
    if (/(safe|secure|trust|legit|genuine|legal)/.test(t))
      return "100% genuine and safe! 🛡️ We have 2 visitable offices in Ghaziabad, 150+ happy clients, and ₹50 Crore+ handled. Card details are never stored. Reach us on 9911312139 / 8588886883.";
    if (/(service|do you|offer|help|what)/.test(t))
      return "We help with: paying your credit card bill on time, card-to-bank transfers, card-to-card transfers, and POS swipe (office or digital). Which one do you need? You can also WhatsApp us below. 😊";
    return "Thanks for your message! For a quick, accurate answer please tap WhatsApp or Call below on 9911312139 / 8588886883 — our team will assist you right away. 🙏";
  }

  // ---------- in-chat inquiry form (mirrors website form) ----------
  function fmtAmt(v) {
    var n = parseInt((v || "").replace(/[^0-9]/g, ""));
    if (!n) return "";
    var s = n.toLocaleString("en-IN");
    var w = "";
    if (n >= 10000000) w = (n / 10000000).toFixed(2).replace(/\.00$/, "") + " Crore";
    else if (n >= 100000) w = (n / 100000).toFixed(2).replace(/\.00$/, "") + " Lakh";
    else if (n >= 1000) w = (n / 1000).toFixed(1).replace(/\.0$/, "") + " Thousand";
    return "₹ " + s + (w ? "  (" + w + ")" : "");
  }

  var formShown = false;
  function showForm() {
    if (formShown) { // already there — just scroll to it
      var ex = body.querySelector(".cpz-form");
      if (ex) ex.scrollIntoView({ behavior: "smooth" });
      return;
    }
    formShown = true;
    chips.style.display = "none";
    var card = document.createElement("div");
    card.className = "cpz-form";
    card.innerHTML =
      '<h4>Credit Card Service Enquiry</h4>' +
      '<p class="s">Share your requirement and our team will send you the best pricing.</p>' +
      '<label>Name *</label><input type="text" id="cf-name" placeholder="Your full name">' +
      '<label>Phone Number *</label><input type="tel" id="cf-phone" placeholder="10-digit mobile number">' +
      '<label>Required Amount (₹)</label><input type="text" id="cf-amount" placeholder="Amount you need">' +
      '<div class="cpz-words" id="cf-words"></div>' +
      '<label>What best describes your requirement?</label>' +
      '<label class="opt"><input type="radio" name="cf-req" value="Need this amount only this time"><span>I need this amount only this time</span></label>' +
      '<label class="opt"><input type="radio" name="cf-req" value="Monthly rotation (Credit Card to Credit Card)"><span>Monthly rotation (Credit Card → Credit Card)</span></label>' +
      '<label class="opt"><input type="radio" name="cf-req" value="Monthly rotation (Credit Card to Bank Account)"><span>Monthly rotation (Credit Card → Bank Account)</span></label>' +
      '<label>Location</label><input type="text" id="cf-location" placeholder="Your area / city">' +
      '<label>How do you currently rotate it?</label>' +
      '<label class="opt"><input type="checkbox" name="cf-rot" value="CRED Rent Payments"><span>CRED Rent Payments</span></label>' +
      '<label class="opt"><input type="checkbox" name="cf-rot" value="PhonePe"><span>PhonePe</span></label>' +
      '<label class="opt"><input type="checkbox" name="cf-rot" value="Bank Transfer"><span>Bank Transfer</span></label>' +
      '<label class="opt"><input type="checkbox" name="cf-rot" value="Another vendor does the same"><span>Another vendor does the same</span></label>' +
      '<label class="opt"><input type="checkbox" name="cf-rot" value="Other"><span>Other</span></label>' +
      '<input type="text" id="cf-other" placeholder="Other — please specify" style="margin-top:6px">' +
      '<label>At what % are you currently doing this?</label>' +
      '<input type="text" id="cf-price" placeholder="e.g. 1.5%">' +
      '<button class="cpz-form-submit" id="cf-submit">Submit · Send on WhatsApp →</button>' +
      '<div class="cpz-form-note">🔒 100% safe & confidential. Used only to offer you the best pricing.</div>';
    body.appendChild(card);
    body.scrollTop = body.scrollHeight;

    card.querySelector("#cf-amount").addEventListener("input", function () {
      card.querySelector("#cf-words").textContent = fmtAmt(this.value);
    });
    card.querySelector("#cf-submit").onclick = function () { submitForm(card, this); };
  }

  function submitForm(card, btn) {
    var name = card.querySelector("#cf-name").value.trim();
    var phone = card.querySelector("#cf-phone").value.trim();
    var amount = card.querySelector("#cf-amount").value.trim();
    var location = card.querySelector("#cf-location").value.trim();
    var price = card.querySelector("#cf-price").value.trim();
    var other = card.querySelector("#cf-other").value.trim();
    var req = Array.prototype.slice.call(card.querySelectorAll('input[name="cf-req"]:checked')).map(function (r) { return r.value; }).join(", ");
    var rotate = Array.prototype.slice.call(card.querySelectorAll('input[name="cf-rot"]:checked')).map(function (r) { return r.value; }).join(", ");

    if (!name) { alert("Please enter your name."); return; }
    if (!phone || phone.replace(/\D/g, "").length < 10) { alert("Please enter a valid 10-digit mobile number."); return; }

    // Build the same WhatsApp message format as the website form
    var msg = "Hello CredPayZ! \uD83D\uDC4B\n\n*Enquiry Form Submission*\n\n";
    msg += "*Name:* " + name + "\n*Phone:* " + phone;
    if (amount) msg += "\n*Amount Required:* \u20B9" + amount;
    if (req) msg += "\n*Requirement:* " + req;
    if (location) msg += "\n*Location:* " + location;
    if (rotate) msg += "\n*Current Rotation Method:* " + rotate;
    if (other) msg += "\n*Other:* " + other;
    if (price) msg += "\n*Current % Rate:* " + price;
    msg += "\n\nPlease get back to me with the best pricing. \uD83D\uDE4F";

    btn.textContent = "✅ Sending...";
    btn.disabled = true;

    // Save to the SAME Google Sheet (fire-and-forget, no-cors)
    if (CONFIG.SHEET_URL) {
      fetch(CONFIG.SHEET_URL, {
        method: "POST", mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ name: name, phone: phone, amount: amount, requirement: req, location: location, rotation: rotate, rate: price, other: other, source: "Website Chatbot" })
      }).catch(function () {});
    }

    // Open WhatsApp with details pre-filled
    setTimeout(function () {
      window.open("https://wa.me/" + CONFIG.FORM_WHATSAPP + "?text=" + encodeURIComponent(msg), "_blank");
    }, 500);

    card.querySelector(".cpz-form-note").innerHTML = "✅ Details received! Opening WhatsApp… If it doesn't open, message us at +91 " + CONFIG.FORM_WHATSAPP.slice(2);
    var ack = "Thank you, " + name + "! ✅ I've shared your details with our team and opened WhatsApp for you. We'll get back with the best pricing shortly. 🙏";
    addBubble("bot", ack);
    history.push({ role: "bot", text: ack });
    save();
  }

  // ---------- send ----------
  // Detects the [SHOW_FORM] signal from the AI, strips it, shows the form.
  function deliverBotReply(reply) {
    var wantsForm = /\[SHOW_FORM\]/i.test(reply);
    reply = reply.replace(/\[SHOW_FORM\]/ig, "").trim();
    if (reply) {
      addBubble("bot", reply);
      history.push({ role: "bot", text: reply });
      save();
    }
    if (wantsForm) showForm();
  }

  // Offline interest detection (used only when no backend connected)
  function offlineWantsForm(text) {
    return /(interested|proceed|book|sign me|fill.*form|send.*form|yes please|want to|go ahead|chahiye|kaise|apply)/i.test(text);
  }

  var busy = false;
  function send(text) {
    text = (text || input.value || "").trim();
    if (!text || busy) return;
    input.value = "";
    input.style.height = "auto";
    addBubble("user", text);
    history.push({ role: "user", text: text });
    save();
    renderChips();
    busy = true; sendBtn.disabled = true;
    showTyping();

    if (!CONFIG.BACKEND_URL) {
      setTimeout(function () {
        hideTyping();
        if (offlineWantsForm(text)) {
          var r = "Great! Let me get a few quick details so our team can share the best pricing for you. 👇";
          addBubble("bot", r);
          history.push({ role: "bot", text: r });
          save();
          showForm();
        } else {
          var r2 = offlineReply(text);
          addBubble("bot", r2);
          history.push({ role: "bot", text: r2 });
          save();
        }
        busy = false; sendBtn.disabled = false;
      }, 700);
      return;
    }

    // text/plain avoids a CORS preflight so Apps Script can reply (body is still JSON)
    fetch(CONFIG.BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ messages: history, sessionId: SID, page: (location.pathname || "/") })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        hideTyping();
        deliverBotReply((data && data.reply) ? data.reply : offlineReply(text));
      })
      .catch(function () {
        hideTyping();
        deliverBotReply(offlineReply(text));
      })
      .then(function () { busy = false; sendBtn.disabled = false; });
  }

  // ---------- open / close ----------
  function open() {
    panel.classList.add("cpz-open");
    launcher.classList.add("cpz-hide");
    if (body.childElementCount === 0) renderAll();
    setTimeout(function () { input.focus(); }, 300);
  }
  function close() {
    panel.classList.remove("cpz-open");
    launcher.classList.remove("cpz-hide");
  }

  launcher.onclick = open;
  panel.querySelector(".cpz-x").onclick = close;
  panel.querySelector("#cpzFormBtn").onclick = function () { showForm(); };
  sendBtn.onclick = function () { send(); };
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  });
  input.addEventListener("input", function () {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 90) + "px";
  });

  renderAll();
})();
