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
  const access_token = 'EAAapKZA8BXh8BO8L1JIsKswivPz4ZB0E61HZCMVGeRHeFuFZBc9ZCwEzVjXLMZBsOSfHcTKuujRYFNAz6HM0jCp0TXr0sbaGSQXLsXuqFCvy5NEUJg2I6IZBwc9JkFujHZBaXgV30d71N5m8SsO4qMBeVZARHcoVis7K1ZBGBE0qkWe2pnXY9aLnx0ZCNh1r6QUcgZDZD'; // truncated for safety

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