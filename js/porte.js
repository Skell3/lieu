/*
  porte.js — Le code secret pour frapper à la porte.

  Le bon rythme : clic, clic (rapprochés), pause, clic.
  - Un seul clic, puis rien  → « C'est comme ça que tu frappes ici ? »
  - Trois clics trop rapides → « Trop pressé. »
  - Le bon rythme            → la porte s'ouvre.
*/

/* Les réglages du rythme, en millisecondes */
const ECART_MAX_DOUBLE = 600;   // les 2 premiers coups doivent être rapprochés
const PAUSE_MIN = 700;          // la pause avant le 3e coup doit durer au moins ça
const ATTENTE_UN_COUP = 900;    // après 1 seul coup, on répond au bout de ce délai
const ATTENTE_MAX = 3000;       // au-delà, on oublie les coups déjà frappés

/* Ce dont on se souvient */
let coups = [];        // les heures (en ms) des coups frappés
let minuteur = null;   // le minuteur en cours
let ouverte = false;

const heurtoir = document.getElementById('heurtoir');
const message = document.getElementById('message');
const ronds = document.querySelectorAll('.coup');

/* Allume autant de petits ronds que de coups frappés */
function afficherCoups(nombre) {
  ronds.forEach(function (rond, i) { rond.classList.toggle('frappe', i < nombre); });
}

/* Repart de zéro, avec éventuellement une phrase */
function recommencer(phrase) {
  coups = [];
  afficherCoups(0);
  message.textContent = phrase || '';
}

/* La porte s'ouvre : le heurtoir laisse place au lien "Entrer" */
function ouvrir() {
  ouverte = true;
  afficherCoups(3);
  message.textContent = 'Entre.';
  document.getElementById('porte').classList.add('ouverte');
  heurtoir.hidden = true;
  const lien = document.getElementById('entrer');
  lien.hidden = false;
  lien.focus();
}

/* À chaque clic sur le heurtoir */
heurtoir.addEventListener('click', function () {
  if (ouverte) return;
  const maintenant = Date.now();
  clearTimeout(minuteur);

  // Deuxième coup trop tard après le premier : on considère que ça recommence
  if (coups.length === 1 && maintenant - coups[0] > ECART_MAX_DOUBLE) coups = [];

  coups.push(maintenant);
  afficherCoups(coups.length);

  if (coups.length === 1) {
    message.textContent = '';
    // Si personne ne refrappe vite, on lance la phrase
    minuteur = setTimeout(function () {
      recommencer('C’est comme ça que tu frappes ici ?');
    }, ATTENTE_UN_COUP);
  } else if (coups.length === 2) {
    // On attend le 3e coup… mais pas éternellement
    minuteur = setTimeout(function () { recommencer(''); }, ATTENTE_MAX);
  } else {
    // 3e coup : la pause a-t-elle été respectée ?
    if (maintenant - coups[1] >= PAUSE_MIN) ouvrir();
    else recommencer('Trop pressé.');
  }
});
