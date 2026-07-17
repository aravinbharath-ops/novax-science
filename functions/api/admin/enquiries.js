
const json = (data, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

function authorized(context) {
  const token = context.request.headers.get("Authorization") || "";
  return Boolean(
    context.env.ADMIN_TOKEN &&
    token === `Bearer ${context.env.ADMIN_TOKEN}`
  );
}

export async function onRequestGet(context) {
  if (!authorized(context)) return json({ ok: false, message: "Unauthorized" }, 401);

  const url = new URL(context.request.url);
  const status = url.searchParams.get("status") || "";
  const search = (url.searchParams.get("search") || "").trim();
  const limit = Math.min(Number(url.searchParams.get("limit") || 100), 250);

  let sql = `
    SELECT id, name, email, enquiry_type, message, status, created_at, updated_at
    FROM enquiries
    WHERE 1 = 1
  `;
  const bindings = [];

  if (status) {
    sql += " AND status = ?";
    bindings.push(status);
  }

  if (search) {
    sql += " AND (name LIKE ? OR email LIKE ? OR enquiry_type LIKE ? OR message LIKE ?)";
    const q = `%${search}%`;
    bindings.push(q, q, q, q);
  }

  sql += " ORDER BY created_at DESC LIMIT ?";
  bindings.push(limit);

  const result = await context.env.DB.prepare(sql).bind(...bindings).all();
  return json({ ok: true, enquiries: result.results || [] });
}

export async function onRequestPatch(context) {
  if (!authorized(context)) return json({ ok: false, message: "Unauthorized" }, 401);

  const body = await context.request.json();
  const id = Number(body.id);
  const status = String(body.status || "");

  if (!Number.isInteger(id) || !["new", "replied", "archived"].includes(status)) {
    return json({ ok: false, message: "Invalid request" }, 400);
  }

  await context.env.DB.prepare(`
    UPDATE enquiries
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(status, id).run();

  return json({ ok: true });
}

export async function onRequestDelete(context) {
  if (!authorized(context)) return json({ ok: false, message: "Unauthorized" }, 401);

  const body = await context.request.json();
  const id = Number(body.id);

  if (!Number.isInteger(id)) {
    return json({ ok: false, message: "Invalid enquiry ID" }, 400);
  }

  await context.env.DB.prepare("DELETE FROM enquiries WHERE id = ?").bind(id).run();
  return json({ ok: true });
}
