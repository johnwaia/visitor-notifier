require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const VISITOR_DIR = path.join(__dirname, 'data');
const VISITOR_FILE = path.join(VISITOR_DIR, 'visitors.json');

// Test écriture fichier au démarrage
try {
  if (!fs.existsSync(VISITOR_DIR)) {
    fs.mkdirSync(VISITOR_DIR, { recursive: true });
  }
  fs.writeFileSync(path.join(VISITOR_DIR, 'test.txt'), 'test');
  console.log('Écriture test OK');
} catch (err) {
  console.error('Erreur écriture:', err);
}

// Middleware CORS global pour gérer les preflight OPTIONS
app.use((req, res, next) => {
  console.log(`Requête ${req.method} reçue sur ${req.path}`); // log méthode + path

  const origin = req.headers.origin;
  const allowedOrigins = ['https://johnwaia.github.io', 'http://localhost:3000'];

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('Réponse rapide OPTIONS 204');
    return res.sendStatus(204);
  }

  next();
});

// Support JSON
app.use(express.json());

// Création du fichier visiteurs si inexistant
if (!fs.existsSync(VISITOR_FILE)) {
  fs.writeFileSync(VISITOR_FILE, JSON.stringify([]));
}

// Endpoint test /ping
app.get('/ping', (req, res) => {
  console.log('GET /ping reçu');
  res.send('pong');
});

// Route POST /visit
app.post('/visit', (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    let visitors = JSON.parse(fs.readFileSync(VISITOR_FILE, 'utf-8'));

    let isNew = false;
    if (!visitors.includes(sessionId)) {
      visitors.push(sessionId);
      fs.writeFileSync(VISITOR_FILE, JSON.stringify(visitors, null, 2));
      isNew = true;
    }

    res.json({
      totalVisitors: visitors.length,
      rank: visitors.indexOf(sessionId) + 1,
      isNewVisitor: isNew
    });
  } catch (err) {
    console.error('Error /visit:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur backend lancé sur le port ${PORT}`);
});
