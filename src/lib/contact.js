const DEFAULT_TO = "asadnanzeros@gmail.com";
const BLOCKED_DIAL = new Set(["972"]);

const esc = value =>
  String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
const oneLine = value => String(value).replace(/[\r\n]+/g, " ").trim();

export async function sendContact(body) {
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const message = String(body.message || "").trim();
  const dial = String(body.dialCode || "").replace(/\D/g, "");
  const phone = String(body.phone || "").replace(/\D/g, "").replace(/^0+/, "");

  if (body.website) return { status: 200, body: { ok: true } };
  if (!name || name.length > 80)
    return { status: 400, body: { error: "Please enter your name." } };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120)
    return { status: 400, body: { error: "Please enter a valid email." } };
  if (!/^\d{1,4}$/.test(dial) || BLOCKED_DIAL.has(dial))
    return { status: 400, body: { error: "Please choose a valid country code." } };
  if (phone.length < 6 || dial.length + phone.length > 15)
    return { status: 400, body: { error: "Please enter a valid WhatsApp number." } };
  if (message.length < 5 || message.length > 3000)
    return {
      status: 400,
      body: { error: "Message must be 5 to 3000 characters." },
    };

  const apiKey = (process.env.RESEND_API_KEY || "").trim();
  const to = (process.env.CONTACT_TO || DEFAULT_TO).trim();
  const from = (
    process.env.CONTACT_FROM || "Portfolio <onboarding@resend.dev>"
  ).trim();
  const isDev = !process.env.VERCEL;
  if (!apiKey) {
    console.error(
      "[contact] RESEND_API_KEY is missing. Add it to .env.local (local) or Vercel env vars.",
    );
    return {
      status: 500,
      body: {
        error: isDev
          ? "RESEND_API_KEY missing in .env.local"
          : "Server is not configured yet.",
      },
    };
  }

  const whatsapp = `+${dial}${phone}`;
  const waLink = `https://wa.me/${dial}${phone}`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `New message from ${oneLine(name).slice(0, 80)}`,
        text: `Name: ${name}\nEmail: ${email}\nWhatsApp: ${whatsapp}\nChat: ${waLink}\n\n${message}`,
        html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#111">
  <h2 style="margin:0 0 12px">New portfolio message</h2>
  <p><b>Name:</b> ${esc(name)}<br>
  <b>Email:</b> <a href="mailto:${esc(email)}">${esc(email)}</a><br>
  <b>WhatsApp:</b> <a href="${esc(waLink)}">${esc(whatsapp)}</a></p>
  <p style="white-space:pre-wrap;border-left:3px solid #ccc;padding-left:12px">${esc(message)}</p>
</div>`,
      }),
    });

    if (!response.ok) {
      const detail = await response.json().catch(() => ({}));
      console.error("[contact] Resend rejected the email:", response.status, detail);
      const hint = detail.message || `HTTP ${response.status}`;
      return {
        status: 502,
        body: {
          error: isDev
            ? `Resend error: ${hint}`
            : "Could not send. Try again later.",
        },
      };
    }
    return { status: 200, body: { ok: true } };
  } catch (error) {
    console.error("[contact] request failed:", error);
    return {
      status: 500,
      body: {
        error: isDev
          ? `Network error: ${error.message}`
          : "Server error. Try again later.",
      },
    };
  }
}
