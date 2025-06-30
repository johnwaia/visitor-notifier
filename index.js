require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors'); // toujours utile pour tests locaux
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT;

const VISITOR_DIR = path.join(__dirname, 'data');
const VISITOR_FILE = path.join(VISITOR_DIR, 'visitors.json');

// ✅ Liste des domaines autorisés pour les requêtes CORS
const allowedOrigins = ['https://johnwaia.github.io', 'http://localhost:3000'];

// ✅ Middleware personnalisé pour gérer CORS + OPTIONS
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

// ✅ Crée le dossier `data` si inexistant
if (!fs.existsSync(VISITOR_DIR)) {
  fs.mkdirSync(VISITOR_DIR, { recursive: true });
}

// ✅ Crée le fichier `visitors.json` si inexistant
if (!fs.existsSync(VISITOR_FILE)) {
  fs.writeFileSync(VISITOR_FILE, JSON.stringify([]));
}

// ✅ Route POST /visit
app.post('/visit', (req, res) => {
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
});

// ✅ Route pour envoyer un email (facultatif)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

app.post('/notify', (req, res) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: 'Nouveau visiteur sur le site',
    text: `Un utilisateur a visité votre site à ${new Date().toLocaleString()}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erreur Nodemailer:', error);
      return res.status(500).send('Erreur lors de l\'envoi');
    }
    res.send('Email envoyé');
  });
});

// ✅ Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur backend lancé sur le port ${PORT}`);
});
