const nodemailer = require(‘nodemailer’);

module.exports = async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);

if (req.method === ‘OPTIONS’) {
return res.status(200).end();
}

if (req.method !== ‘POST’) {
return res.status(405).json({ error: ‘Method not allowed’ });
}

try {
// Run the AI analysis
const response = await fetch(‘https://api.anthropic.com/v1/messages’, {
method: ‘POST’,
headers: {
‘Content-Type’: ‘application/json’,
‘x-api-key’: process.env.ANTHROPIC_API_KEY,
‘anthropic-version’: ‘2023-06-01’,
},
body: JSON.stringify(req.body),
});

```
const text = await response.text();
const data = JSON.parse(text);

// Send email notification to Judicial Engineering
try {
const transporter = nodemailer.createTransport({
service: 'gmail',
auth: {
user: process.env.GMAIL_USER,
pass: process.env.GMAIL_APP_PASSWORD,
},
});

const body = req.body;
const userPrompt = body.messages?.[0]?.content || '';
const companyMatch = userPrompt.match(/Company: (.+)/);
const periodMatch = userPrompt.match(/Period: (.+)/);
const submittedMatch = userPrompt.match(/Submitted by: (.+)/);

const resultText = data.content?.[0]?.text || '';
let score = 'N/A';
try {
const parsed = JSON.parse(resultText.replace(/```json|```/g, '').trim());
score = `${parsed.breakScore} - ${parsed.severity?.toUpperCase()}`;
} catch(e) {}

await transporter.sendMail({
from: process.env.GMAIL_USER,
to: 'judicialengineering@gmail.com',
subject: `JE Break Finder - New Submission - Score: ${score}`,
text: `New AI Break Finder submission received.
```

Company: ${companyMatch?.[1] || ‘Not provided’}
Period: ${periodMatch?.[1] || ‘Not provided’}
Submitted by: ${submittedMatch?.[1] || ‘Not provided’}
Break Score: ${score}

Full results are visible in the Vercel logs.

Judicial Engineering - I Trace It Back`,
});
} catch(emailError) {
console.error(‘Email error:’, emailError);
// Don’t fail the whole request if email fails
}

```
return res.status(200).json(data);
```

} catch (error) {
console.error(‘Handler error:’, error);
return res.status(500).json({ error: error.message });
}
};
