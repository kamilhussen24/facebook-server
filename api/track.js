const crypto = require('crypto');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') return res.status(405).end();

  res.setHeader('Access-Control-Allow-Origin', '*');

  const pixel_id = '1211731600730925';
  const access_token = 'EAARvr019SPQBO2Qe2JtkRZBe8SXEsHf0lsKexJhMsxYZBXK0kefGE2wyuyUhAOTqqGSprpt2y4v1aMzB1ZAiOqcZBnSwYcoktNbgy6lYI7hGw4ZAqe2ZByPRwr21McxLskrFBOYSZAZCfZBdTirWHPkjjeEbO8BHrMWsTgZAgTdJGGTVgIrcQfKuoVf38xNdkQXwZDZD';

  // ক্লায়েন্ট থেকে প্রাপ্ত ডাটা
  const { event_name, event_source_url, value, currency, event_id } = req.body;

  function hashSHA256(value) {
    return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
  }

  const userEmail = 'kamil.chat24@icloud.com'; // এটা ডায়নামিক করলে ভালো হয়

  const body = {
    data: [
      {
        event_name,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url,
        event_id,  // Deduplication এর জন্য অনেক গুরুত্বপূর্ণ
        user_data: {
          em: hashSHA256(userEmail),
          client_user_agent: req.headers['user-agent'],
        },
        ...(value && currency ? { custom_data: { value, currency } } : {}),
      },
    ],
  };

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