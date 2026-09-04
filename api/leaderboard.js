// Vercel serverless proxy for the Kochi Hackathon Google Apps Script backend.
// The browser talks to this same-origin endpoint, so Apps Script CORS does not
// affect the frontend.

export default async function handler(req, res) {
  const target = process.env.GOOGLE_SHEETS_WEB_APP_URL;

  if (!target) {
    return res.status(500).json({
      error: 'GOOGLE_SHEETS_WEB_APP_URL is not configured on Vercel.'
    });
  }

  try {
    const url = new URL(target);
    if (req.method === 'GET') {
      url.searchParams.set('_', Date.now().toString());
    }

    const headers = {};
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      headers['Content-Type'] = 'text/plain;charset=utf-8';
    }

    // Forward the body verbatim. Vercel gives req.body as an object for
    // application/json and as a raw string for text/plain — stringifying a
    // string would double-encode it, so Apps Script would JSON.parse it back
    // into a string and drop `payload.entry`. Only stringify actual objects.
    const outgoingBody =
      req.method === 'GET' || req.method === 'HEAD'
        ? undefined
        : typeof req.body === 'string'
          ? req.body
          : JSON.stringify(req.body ?? {});

    const upstream = await fetch(url.toString(), {
      method: req.method,
      headers,
      body: outgoingBody,
      redirect: 'follow'
    });

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: 'Google Apps Script returned a non-JSON response.', raw: text.slice(0, 1000) };
    }

    return res.status(upstream.ok ? 200 : upstream.status).json(data);
  } catch (error) {
    console.error('Leaderboard proxy failed:', error);
    return res.status(502).json({
      error: 'Could not reach Google Apps Script.',
      detail: error instanceof Error ? error.message : String(error)
    });
  }
}
