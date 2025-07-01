require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const VISITOR_DIR = path.join(__dirname, 'data');
const VISITOR_FILE = path.join(VISITOR_DIR, 'visitors.json');

// Middleware global CORS + gestion OPTIONS très rapide
app.use((req, res, next) => {
  console.log(`Requête ${req.method} reçue sur ${req.path}`);

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

// Création des dossiers/fichiers au démarrage
try {
  if (!fs.existsSync(VISITOR_DIR)) {
    fs.mkdirSync(VISITOR_DIR, { recursive: true });
  }
  fs.writeFileSync(path.join(VISITOR_DIR, 'test.txt'), 'test');
  console.log('Écriture test OK');

  if (!fs.existsSync(VISITOR_FILE)) {
    fs.writeFileSync(VISITOR_FILE, JSON.stringify([]));
  }
} catch (err) {
  console.error('Erreur d\'initialisation fichiers:', err);
}

// 🔁 Endpoint racine requis pour Railway
app.get('/', (req, res) => {
  res.send('OK');
});

// Endpoint test
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

// Démarrage
app.listen(PORT, () => {
  console.log(`Serveur backend lancé sur le port ${PORT}`);
});
