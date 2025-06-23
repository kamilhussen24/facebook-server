export default async function handler(req, res) {
  // OPTIONS method handle for CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Reject non-POST methods
  if (req.method !== 'POST') return res.status(405).end();

  res.setHeader('Access-Control-Allow-Origin', '*'); // CORS allow for POST too

  const pixel_id = '1395230681787715';
  const access_token = 'EAAH9xRN3Y1YBOxpZBePLxCdr7Y5w2T1rV4RoMgIV9vWQujHp4EXQvozZCARAEFESKEKwRFkrh8ANBVX1cziDCMU0lRzla79LUnbGZBRA5aZBoe4CR42rm0qV9yFISZA4sIWToZBLhGZAGEsKhGFr4obKlRg48xZB20vPEZCNIBhgvwZBFMDkdsG11z9Ao9eOgU2RxZCf4ob86bGbX4tYLZCCUxT8QlPnL4K5eXZBwQQZDZD'; // truncated for safety

  const { event_name, event_source_url } = req.body;

  const body = {
    data: [
      {
        event_name,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url,
        user_data: {
          client_user_agent: req.headers['user-agent'],
          ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        }
      }
    ]
  };

  const fbRes = await fetch(
    `https://graph.facebook.com/v19.0/${pixel_id}/events?access_token=${access_token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }
  );

  const fbData = await fbRes.json();
  res.status(200).json(fbData);
}