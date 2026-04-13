module.exports = async function handler(req, res) {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

if (req.method === 'OPTIONS') {
return res.status(200).end();
}

if (req.method !== 'POST') {
return res.status(405).json({ error: 'Method not allowed' });
}

try {
const response = await fetch('https://api.anthropic.com/v1/messages', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'x-api-key': process.env.ANTHROPIC_API_KEY,
'anthropic-version': '2023-06-01',
},
body: JSON.stringify(req.body),
});

const text = await response.text();
console.log('Anthropic raw response:', text);

try {
const data = JSON.parse(text);
return res.status(200).json(data);
} catch(parseError) {
console.error('Parse error:', parseError);
return res.status(500).json({ error: 'Invalid response from AI', raw: text });
}
} catch (error) {
console.error('Handler error:', error);
return res.status(500).json({ error: error.message });
}
};
