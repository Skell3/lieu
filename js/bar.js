/*
  bar.js — Fabrique les tables du bar et gère "s'asseoir / se lever".
  Les personnes déjà assises sont des exemples pour la démo.
*/

const ROMAINS = ['I', 'II', 'III', 'IV', 'V', 'VI'];
const PLACES_PAR_TABLE = 6;
const DEJA_ASSIS = [3, 0, 5, 2, 6, 1];   // exemple : nombre de personnes à chaque table

let tableChoisie = null;   // numéro (0 à 5) de la table sélectionnée
let assis = false;         // est-ce que je suis assis à cette table ?

/* Nombre de personnes à une table, en comptant moi si j'y suis assis */
function nombreA(i) {
  return Math.min(PLACES_PAR_TABLE, DEJA_ASSIS[i] + (assis && tableChoisie === i ? 1 : 0));
}

/* Dessine toutes les tables (ronds + petits sièges) */
function dessinerTables() {
  const zone = document.getElementById('tables');
  zone.innerHTML = '';
  ROMAINS.forEach(function (romain, i) {
    const bloc = document.createElement('div');
    bloc.className = 'place-table';

    const bouton = document.createElement('button');
    bouton.type = 'button';
    bouton.className = 'table' + (tableChoisie === i ? ' choisie' : '');
    bouton.textContent = romain;
    bouton.setAttribute('aria-pressed', tableChoisie === i ? 'true' : 'false');
    bouton.setAttribute('aria-label', 'Table ' + romain + ', ' + nombreA(i) + ' places prises sur ' + PLACES_PAR_TABLE);
    bouton.addEventListener('click', function () {
      tableChoisie = i;
      assis = false;
      toutRedessiner();
    });

    const sieges = document.createElement('div');
    sieges.className = 'sieges';
    sieges.setAttribute('aria-hidden', 'true');
    for (let k = 0; k < PLACES_PAR_TABLE; k++) {
      const s = document.createElement('span');
      s.className = 'siege' + (k < nombreA(i) ? ' pris' : '');
      sieges.appendChild(s);
    }

    const sujet = document.createElement('span');
    sujet.className = 'discret';
    sujet.textContent = nombreA(i) === 0 ? 'Table libre' : '[SUJET]';

    bloc.append(bouton, sieges, sujet);
    zone.appendChild(bloc);
  });
}

/* Remplit le panneau de droite pour la table choisie */
function dessinerPanneau() {
  if (tableChoisie === null) return;
  const i = tableChoisie;
  const panneau = document.getElementById('panneau');
  panneau.innerHTML = '';

  const titre = document.createElement('span');
  titre.className = 'grand';
  titre.textContent = 'Table ' + ROMAINS[i];
  const info = document.createElement('span');
  info.textContent = nombreA(i) + ' / ' + PLACES_PAR_TABLE + ' places';

  // La liste des personnes assises
  const liste = document.createElement('ul');
  liste.className = 'gens';
  for (let k = 0; k < DEJA_ASSIS[i]; k++) ajouterPersonne(liste, '?', '[PSEUDO ' + (k + 1) + ']');
  if (assis) ajouterPersonne(liste, 'T', 'Toi');

  panneau.append(titre, info, liste);

  // Bouton s'asseoir / se lever
  const bouton = document.createElement('button');
  bouton.type = 'button';
  if (assis) {
    const p = document.createElement('p');
    p.className = 'assis';
    p.textContent = 'Tu es assis. Ici, le micro s’ouvrira.';
    panneau.appendChild(p);
    bouton.className = 'bouton';
    bouton.textContent = 'Se lever';
  } else {
    bouton.className = 'bouton-or';
    bouton.textContent = nombreA(i) >= PLACES_PAR_TABLE ? 'Table complète' : 'S’asseoir';
    bouton.disabled = nombreA(i) >= PLACES_PAR_TABLE;
  }
  bouton.addEventListener('click', function () {
    assis = !assis;
    toutRedessiner();
  });
  panneau.appendChild(bouton);
}

/* Ajoute une personne (pastille + nom) à la liste */
function ajouterPersonne(liste, initiale, nom) {
  const li = document.createElement('li');
  const pastille = document.createElement('span');
  pastille.className = 'pastille';
  pastille.textContent = initiale;
  li.append(pastille, document.createTextNode(nom));
  liste.appendChild(li);
}

function toutRedessiner() {
  dessinerTables();
  dessinerPanneau();
}

toutRedessiner();
