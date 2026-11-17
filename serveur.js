/*
  serveur.js — Petit serveur web local pour tester le site, sans dépendance.
  (En ligne, c'est Codeberg Pages qui sert les fichiers : ce fichier ne sert qu'en local.)
  Le navigateur n'autorise caméra et micro que sur https://… ou http://localhost.

  Lancer : node site/serveur.js   puis ouvrir http://localhost:8081
*/
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8081;
const DOSSIER = __dirname;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8'
};

http.createServer(function (requete, reponse) {
  let chemin = decodeURIComponent(requete.url.split('?')[0]);
  if (chemin === '/') chemin = '/index.html';
  const fichier = path.join(DOSSIER, path.normalize(chemin));

  // Sécurité : on refuse tout fichier en dehors du dossier
  if (!fichier.startsWith(DOSSIER)) { reponse.writeHead(403); reponse.end(); return; }

  fs.readFile(fichier, function (erreur, contenu) {
    if (erreur) { reponse.writeHead(404); reponse.end('Introuvable'); return; }
    reponse.writeHead(200, { 'Content-Type': TYPES[path.extname(fichier)] || 'application/octet-stream' });
    reponse.end(contenu);
  });
}).listen(PORT, function () {
  console.log('Site prêt : http://localhost:' + PORT);
});
