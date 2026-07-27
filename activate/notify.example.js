// ============================================================
//  EVT Activate — Twilio SMS paging (Netlify Function, v2)
//  To activate:
//   1. Move this file to  netlify/functions/notify.js  in the repo root.
//   2. In Netlify → Site configuration → Environment variables, set:
//        TWILIO_ACCOUNT_SID   (starts with AC…)
//        TWILIO_AUTH_TOKEN
//        TWILIO_FROM          (your Twilio number, e.g. +15551234567)
//   3. In activate/index.html set:  NOTIFY_ENDPOINT = '/.netlify/functions/notify'
//  Zero npm dependencies — uses the built-in fetch (Netlify Node 18+).
// ============================================================

export default async (req) => {
  if (req.method !== 'POST') return new Response('POST only', { status: 405 });

  let payload;
  try { payload = await req.json(); } catch { return new Response('bad json', { status: 400 }); }
  const { numbers, message } = payload || {};
  if (!Array.isArray(numbers) || numbers.length === 0 || !message)
    return new Response('numbers[] and message required', { status: 400 });

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const tok = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (!sid || !tok || !from) return new Response('Twilio env vars not set', { status: 500 });

  const auth = 'Basic ' + Buffer.from(sid + ':' + tok).toString('base64');
  const results = [];
  for (const to of numbers) {
    const body = new URLSearchParams({ To: to, From: from, Body: message });
    try {
      const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: 'POST',
        headers: { Authorization: auth, 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      results.push({ to, ok: r.ok, status: r.status });
    } catch (e) {
      results.push({ to, ok: false, error: String(e) });
    }
  }
  return new Response(JSON.stringify({ results }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};
