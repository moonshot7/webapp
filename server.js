// Importation des modules nécessaires
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

// Initialisation de l'application Express
const app = express();
const PORT = 3000;

// Middleware pour traiter les fichiers statiques
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

// Fonction pour charger les utilisateurs depuis le fichier JSON
function getUsers() {
  const data = fs.readFileSync('users.json');
  return JSON.parse(data);
}

// Middleware pour protéger la page d'accueil
function requireLogin(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login.html');
  }
}

// Route pour la page d'accueil (protégée)
app.get('/home.html', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Route pour afficher la page d'inscription
app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Route pour gérer l'enregistrement
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();

  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    res.send(`
      <h3>Le nom d'utilisateur existe déjà. <a href="/login.html">Se connecter</a></h3>
    `);
  } else {
    // Nouvel utilisateur, enregistrement
    const newUser = { username, password };
    users.push(newUser);
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
    res.send(`
      <h3>Compte créé avec succès ! <a href="/login.html">Se connecter</a></h3>
    `);
  }
});

// Route pour gérer la connexion
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();

  const existingUser = users.find(u => u.username === username);

  if (existingUser && existingUser.password === password) {
    // Utilisateur trouvé, connexion
    req.session.user = existingUser;
    res.redirect('/home.html');
  } else {
    // Mauvais identifiants
    res.send(`
      <h3>Identifiants incorrects. <a href="/login.html">Réessayer</a></h3>
    `);
  }
});

// Route pour la déconnexion
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

// Route pour la page de login
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
