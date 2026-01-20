// Vercel Serverless Function - Get Conversation Detail
// GET /api/conversations/[id]

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, xi-api-key');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = req.headers['xi-api-key'];
    if (!apiKey) {
        return res.status(401).json({ error: 'Missing xi-api-key header' });
    }

    const { id } = req.query;
    const url = `https://api.elevenlabs.io/v1/convai/conversations/${id}`;

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
