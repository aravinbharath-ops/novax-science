
const json = (data, status = 200) =>
  Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });

function clean(value, max = 5000) {
  return String(value || "").trim().slice(0, max);
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    const name = clean(body.name, 120);
    const email = clean(body.email, 180).toLowerCase();
    const enquiryType = clean(body.enquiryType, 100);
    const message = clean(body.message, 4000);

    if (!name || !validEmail(email) || !enquiryType || !message) {
      return json(
        { ok: false, message: "Please complete all fields using a valid email address." },
        400
      );
    }

    const inserted = await context.env.DB.prepare(`
      INSERT INTO enquiries (name, email, enquiry_type, message, status)
      VALUES (?, ?, ?, ?, 'new')
      RETURNING id, created_at
    `)
      .bind(name, email, enquiryType, message)
      .first();

    let emailSent = false;

    if (context.env.RESEND_API_KEY && context.env.CONTACT_TO_EMAIL) {
      const fromAddress =
        context.env.RESEND_FROM_EMAIL || "Novax Science <onboarding@resend.dev>";

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [context.env.CONTACT_TO_EMAIL],
          reply_to: email,
          subject: `New Novax Science enquiry — ${enquiryType}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#071315">
              <h2 style="margin-bottom:20px">New website enquiry</h2>
              <table style="width:100%;border-collapse:collapse">
                <tr><td style="padding:10px;border-bottom:1px solid #ddd"><strong>Name</strong></td><td style="padding:10px;border-bottom:1px solid #ddd">${escapeHtml(name)}</td></tr>
                <tr><td style="padding:10px;border-bottom:1px solid #ddd"><strong>Email</strong></td><td style="padding:10px;border-bottom:1px solid #ddd">${escapeHtml(email)}</td></tr>
                <tr><td style="padding:10px;border-bottom:1px solid #ddd"><strong>Enquiry</strong></td><td style="padding:10px;border-bottom:1px solid #ddd">${escapeHtml(enquiryType)}</td></tr>
              </table>
              <div style="margin-top:22px;padding:18px;background:#f3f8f7;border-radius:12px;white-space:pre-wrap">${escapeHtml(message)}</div>
              <p style="margin-top:22px;color:#607174;font-size:12px">Enquiry ID: ${inserted?.id ?? "N/A"}</p>
            </div>
          `
        })
      });

      emailSent = resendResponse.ok;

      if (!resendResponse.ok) {
        console.error("Resend error:", await resendResponse.text());
      }
    }

    return json({
      ok: true,
      enquiryId: inserted?.id,
      emailSent,
      message: "Thank you. Your enquiry has been received."
    });
  } catch (error) {
    console.error("Contact submission failed:", error);
    return json(
      { ok: false, message: "We could not submit your enquiry. Please try again." },
      500
    );
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
