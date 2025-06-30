require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;
const VISITOR_FILE = './visitors.json';

// 🎯 CORS sécurisé avec plusieurs origines autorisées
const allowedOrigins = ['https://johnwaia.github.io', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// ✅ Fix de l'erreur path-to-regexp (ne pas utiliser "*", mais "/*")
app.options('/*', cors());

app.use(express.json());

// 📁 Init fichier visiteurs si non présent
if (!fs.existsSync(VISITOR_FILE)) {
  fs.writeFileSync(VISITOR_FILE, JSON.stringify([]));
}

// 📩 Config Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 📌 Route pour enregistrer une visite
app.post('/visit', (req, res) => {
  const { sessionId } = req.body;
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

// 📧 Route d'envoi de notification par email
app.post('/notify', (req, res) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: 'Nouveau visiteur sur le site',
    text: `Un utilisateur a consulté votre site à ${new Date().toLocaleString()}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erreur Nodemailer:', error);
      return res.status(500).send('Erreur lors de l\'envoi');
    }
    res.send('Email envoyé');
  });
});

// 🚀 Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Serveur backend lancé sur le port ${PORT}`);
});
