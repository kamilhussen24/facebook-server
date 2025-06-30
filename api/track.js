// server.js
require('dotenv').config();

module.exports = async function handler(req, res) {
  const ALLOWED_ORIGINS = ['https://your-frontend-domain.com']; // Add client domain
  const origin = req.headers.origin;

  if (req.method === 'OPTIONS') {
    if (ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    return res.status(403).json({ error: 'Forbidden: Invalid origin' });
  }

  const pixel_id = '1211731600730925';
  const access_token = process.env.FB_ACCESS_TOKEN;

  if (!access_token) {
    console.error('FB_ACCESS_TOKEN is not set in environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const {
    event_name,
    event_source_url,
    value,
    currency,
    event_id,
    event_time,
    user_data = {}
  } = req.body;

  if (!event_name || !event_source_url || !event_id || !event_time) {
    console.error('Missing required fields:', { event_name, event_source_url, event_id, event_time });
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;

  const body = {
    data: [
      {
        event_name,
        event_time: parseInt(event_time, 10),
        action_source: 'website',
        event_source_url,
        event_id,
        user_data: {
          client_ip_address: clientIp,
          client_user_agent: req.headers['user-agent'] || '',
          ...(user_data.fbp ? { fbp: user_data.fbp } : {}),
          ...(user_data.fbc ? { fbc: user_data.fbc } : {})
        },
        ...(value && currency ? { custom_data: { value, currency } } : {}),
      },
    ],
  };

  console.log('✅ Sent to Facebook:', JSON.stringify(body, null, 2));

  try {
    const fbRes = await fetch(
      `https://graph.facebook.com/v19.0/${pixel_id}/events?access_token=${access_token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    const fbData = await fbRes.json();

    if (!fbRes.ok) {
      console.error('Facebook API Error:', fbData);
      return res.status(500).json({ error: 'Facebook API error', details: fbData });
    }

    console.log('Facebook API Success:', fbData);
    return res.status(200).json(fbData);
  } catch (error) {
    console.error('Fetch error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};