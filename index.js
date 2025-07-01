const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const visitors = [];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = ['https://johnwaia.github.io', 'http://localhost:3000'];
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());

app.get('/', (req, res) => res.send('OK'));
app.get('/ping', (req, res) => res.send('pong'));

app.post('/visit', (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId is required' });
  if (!visitors.includes(sessionId)) visitors.push(sessionId);
  res.json({
    totalVisitors: visitors.length,
    rank: visitors.indexOf(sessionId) + 1,
    isNewVisitor: true
  });
});

app.listen(PORT, () => {
  console.log(`Serveur backend lancé sur le port ${PORT}`);
});

setInterval(() => {
  console.log('Heartbeat — je suis toujours vivant');
}, 60000);
