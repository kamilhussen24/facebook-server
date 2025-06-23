// /api/facebook.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const pixel_id = '1395230681787715';
  const access_token = 'EAAH9xRN3Y1YBOxpZBePLxCdr7Y5w2T1rV4RoMgIV9vWQujHp4EXQvozZCARAEFESKEKwRFkrh8ANBVX1cziDCMU0lRzla79LUnbGZBRA5aZBoe4CR42rm0qV9yFISZA4sIWToZBLhGZAGEsKhGFr4obKlRg48xZB20vPEZCNIBhgvwZBFMDkdsG11z9Ao9eOgU2RxZCf4ob86bGbX4tYLZCCUxT8QlPnL4K5eXZBwQQZDZD';

  const { event_name, event_source_url } = req.body;

  const body = {
    data: [
      {
        event_name: event_name,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: event_source_url,
        user_data: {
          client_user_agent: req.headers['user-agent'],
          ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        }
      }
    ]
  };

  const fbResponse = await fetch(`https://graph.facebook.com/v19.0/${pixel_id}/events?access_token=${access_token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const fbData = await fbResponse.json();
  res.status(200).json(fbData);
}