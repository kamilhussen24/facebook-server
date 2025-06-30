module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') return res.status(405).end();

  res.setHeader('Access-Control-Allow-Origin', '*');

  const pixel_id = 'YOUR PIXEL ID HARE';
  const access_token = process.env.FB_ACCESS_TOKEN;

  const {
    event_name,
    event_source_url,
    value,
    currency,
    event_id,
    user_data = {}
  } = req.body;

  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

  const body = {
    data: [
      {
        event_name,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url,
        event_id,
        user_data: {
          client_ip_address: clientIp,
          client_user_agent: req.headers['user-agent'],
          ...(user_data.fbp ? { fbp: user_data.fbp } : {}),
          ...(user_data.fbc ? { fbc: user_data.fbc } : {})
        },
        ...(value && currency
          ? { custom_data: { value, currency } }
          : {}),
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

    if (!fbRes.ok) {
      const errorData = await fbRes.json();
      console.error('FB API Error:', errorData);
      return res.status(500).json({ error: 'Facebook API error', details: errorData });
    }

    const fbData = await fbRes.json();
    return res.status(200).json(fbData);
  } catch (error) {
    console.error('Fetch error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};