// Vercel Serverless Function - List Conversations
// GET /api/conversations?agent_id=xxx
//
// Required Vercel Environment Variables:
//   ELEVENLABS_API_KEY - Your ElevenLabs API key
//   ELEVENLABS_AGENT_ID - Default agent ID (optional, can override via query param)

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // API key from environment variable (secure, never exposed to browser)
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Server misconfigured: Missing ELEVENLABS_API_KEY env var' });
    }

    // Agent ID from query param or environment variable
    const agent_id = req.query.agent_id || process.env.ELEVENLABS_AGENT_ID;
    const url = `https://api.elevenlabs.io/v1/convai/conversations${agent_id ? `?agent_id=${agent_id}` : ''}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'xi-api-key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
