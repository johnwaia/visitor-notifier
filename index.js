// backend/index.js
require('dotenv').config(); // Charge les variables d'environnement

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

// Railway fournit automatiquement un port via process.env.PORT
const PORT = process.env.PORT || 5000;

// Autoriser uniquement ton site GitHub Pages
app.use(cors({
  origin: 'https://johnwaia.github.io'
}));

app.use(express.json());

// Transporteur Nodemailer avec variables d'environnement
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Route POST pour notifier un email
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
      res.status(500).send('Erreur lors de l\'envoi de l\'email');
    } else {
      console.log('Email envoyé :', info.response);
      res.send('Email envoyé');
    }
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur backend lancé sur le port ${PORT}`);
});
