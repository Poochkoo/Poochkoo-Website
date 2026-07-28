// Server-side relay for the Poochkoo enquiry form.
// Keeps the Google Chat webhook key/token and Google Form entry IDs out of client-side JS.
// Set these in Vercel Project Settings → Environment Variables:
//   GCHAT_WEBHOOK_URL = https://chat.googleapis.com/v1/spaces/AAAAi8y7A2A/messages?key=...&token=...
//   GFORM_URL          = https://docs.google.com/forms/d/e/1FAIpQLSf.../formResponse

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const GCHAT_WEBHOOK_URL = process.env.GCHAT_WEBHOOK_URL;
  const GFORM_URL = process.env.GFORM_URL;
  const GFORM_ENTRIES = {
    name: 'entry.1261291780',
    phone: 'entry.206604723',
    petName: 'entry.351771611',
    service: 'entry.1226167323',
    centre: 'entry.1937026452',
    message: 'entry.287525320',
  };

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const f = {
    name: String(body.name || '').trim().slice(0, 200),
    phone: String(body.phone || '').trim().slice(0, 30),
    petName: String(body.petName || '').trim().slice(0, 100),
    service: String(body.service || '').trim().slice(0, 100),
    centre: String(body.centre || '').trim().slice(0, 100),
    message: String(body.message || '').trim().slice(0, 2000),
  };

  console.log('enquiry env check', { hasGChat: !!GCHAT_WEBHOOK_URL, hasGForm: !!GFORM_URL });

  const tasks = [];

  if (GCHAT_WEBHOOK_URL) {
    const text = `🐾 New Poochkoo Enquiry\nName: ${f.name || '-'}\nPhone: ${f.phone || '-'}\nPet: ${f.petName || '-'}\nService: ${f.service || '-'}\nCentre: ${f.centre || '-'}\nMessage: ${f.message || '-'}`;
    tasks.push(
      fetch(GCHAT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ text }),
      }).then(async (r) => {
        const body = await r.text().catch(() => '');
        console.log('gchat response', r.status, body.slice(0, 300));
      }).catch((err) => console.log('gchat error', err.message))
    );
  } else {
    console.log('GCHAT_WEBHOOK_URL not set, skipping Chat notification');
  }

  if (GFORM_URL) {
    const params = new URLSearchParams();
    params.append(GFORM_ENTRIES.name, f.name);
    params.append(GFORM_ENTRIES.phone, f.phone);
    params.append(GFORM_ENTRIES.petName, f.petName);
    params.append(GFORM_ENTRIES.service, f.service);
    params.append(GFORM_ENTRIES.centre, f.centre);
    params.append(GFORM_ENTRIES.message, f.message);
    tasks.push(
      fetch(GFORM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      }).then((r) => console.log('gform response', r.status))
        .catch((err) => console.log('gform error', err.message))
    );
  } else {
    console.log('GFORM_URL not set, skipping Google Form submission');
  }

  await Promise.all(tasks);
  res.status(200).json({ ok: true });
};
