require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

let visitors = []; // Stocké en mémoire

app.use(cors()); // CORS ouvert
app.use(express.json());

// Route POST pour enregistrer un visiteur
app.post('/visit', (req, res) => {
  const { sessionId } = req.body || {};

  // Fallback si frontend n’envoie pas de sessionId
  const sid = sessionId || `anonymous-${Date.now()}`;

  let isNew = false;

  if (!visitors.includes(sid)) {
    visitors.push(sid);
    isNew = true;
  }

  res.json({
    totalVisitors: visitors.length,
    rank: visitors.indexOf(sid) + 1,
    isNewVisitor: isNew
  });
});

// (Optionnel) route email
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
    text: `Un utilisateur a visité le site à ${new Date().toLocaleString()}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erreur Nodemailer:', error);
      return res.status(500).send('Erreur lors de l\'envoi');
    }
    res.send('Email envoyé');
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Serveur backend lancé sur le port ${PORT}`);
});
