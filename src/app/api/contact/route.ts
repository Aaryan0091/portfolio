/**
 * Receives the "Got an Idea?" form and emails it to Aaryan via Resend
 * (https://resend.com), server-side — the visitor's own mail app is never
 * opened.
 *
 * Setup (see .env.example):
 *   RESEND_API_KEY   — an API key from resend.com (free tier is plenty).
 *   CONTACT_TO_EMAIL — where messages go (defaults to Aaryan's Gmail).
 *   CONTACT_FROM_EMAIL — sender address. Until you verify your own domain in
 *     Resend, it must be "onboarding@resend.dev", and Resend will only
 *     deliver to the email address you signed up to Resend with.
 *
 * The visitor's address is set as Reply-To, so hitting "Reply" in Gmail
 * answers them directly.
 */

const TO = process.env.CONTACT_TO_EMAIL || "aaryangupta2005@gmail.com";
const FROM =
  process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>";

const MAX = { name: 100, email: 200, description: 5000 };

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        error:
          "Sending isn't available right now — please email aaryangupta2005@gmail.com instead.",
      },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim().slice(0, MAX.name);
  const email = String(body.email ?? "").trim().slice(0, MAX.email);
  const description = String(body.description ?? "")
    .trim()
    .slice(0, MAX.description);
  // Honeypot: a hidden field real visitors never fill in. Bots do.
  const website = String(body.website ?? "");

  if (website) return Response.json({ ok: true });

  if (!name || !description || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json(
      { error: "Please fill in your name, a valid email and your idea." },
      { status: 400 }
    );
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      reply_to: email,
      subject: `New project idea from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${description}`,
      html: `<p><strong>Name:</strong> ${escapeHtml(name)}<br><strong>Email:</strong> ${escapeHtml(email)}</p><p style="white-space:pre-wrap">${escapeHtml(description)}</p>`,
    }),
    signal: AbortSignal.timeout(15_000),
  }).catch(() => null);

  if (!response?.ok) {
    return Response.json(
      { error: "Couldn't send right now. Please try again in a moment." },
      { status: 502 }
    );
  }

  return Response.json({ ok: true });
}
