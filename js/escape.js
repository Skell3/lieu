/*
  escape.js — Fabrique les 5 étapes de l'épreuve et gère la montée.

  Pour la démo : n'importe quelle réponse non vide fait monter.
  Plus tard, on vérifiera les vraies réponses (côté serveur, pour éviter la triche).
*/

const ROMAINS = ['I', 'II', 'III', 'IV', 'V'];

/* Les énigmes, à écrire. Une par étape, de I à V. */
const ENIGMES = [
  '[ÉNIGME I : texte à écrire]',
  '[ÉNIGME II : texte à écrire]',
  '[ÉNIGME III : texte à écrire]',
  '[ÉNIGME IV : texte à écrire]',
  '[ÉNIGME V : texte à écrire]'
];

let niveau = 1;   // l'étape en cours (1 = tout en bas). 6 = tout est résolu.

/* Petit raccourci pour créer un élément avec une classe et du texte */
function creer(balise, classe, texte) {
  const el = document.createElement(balise);
  if (classe) el.className = classe;
  if (texte) el.textContent = texte;
  return el;
}

/* Fabrique une étape (numéro n, de 1 à 5) */
function fabriquerEtape(n) {
  const section = creer('section', 'etape');
  section.id = 'etape-' + n;
  section.appendChild(creer('span', 'chiffre', ROMAINS[n - 1]));

  // Bloc affiché quand l'étape est encore verrouillée
  const verrou = creer('div', 'bloc-verrou');
  verrou.innerHTML =
    '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(216,195,165,0.6)" stroke-width="1.5" role="img" aria-label="Étape verrouillée">' +
    '<rect x="5" y="11" width="14" height="10"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg>';
  verrou.appendChild(creer('p', 'discret', 'Résous l’étape d’en dessous pour monter.'));
  section.appendChild(verrou);

  // Bloc affiché quand c'est l'étape en cours : l'énigme et le champ réponse
  const enigme = creer('div', 'bloc-enigme');
  enigme.appendChild(creer('p', 'enigme-texte', ENIGMES[n - 1]));
  const formulaire = creer('form', 'reponse');
  const etiquette = creer('label', 'invisible', 'Ta réponse');
  etiquette.htmlFor = 'reponse-' + n;
  const champ = creer('input');
  champ.type = 'text';
  champ.id = 'reponse-' + n;
  champ.placeholder = 'Ta réponse';
  champ.autocomplete = 'off';
  const bouton = creer('button', 'bouton-or', 'Valider');
  bouton.type = 'submit';
  const erreur = creer('p', 'erreur');
  erreur.setAttribute('aria-live', 'polite');
  formulaire.append(etiquette, champ, bouton);
  enigme.append(formulaire, erreur);
  section.appendChild(enigme);

  // Quand on valide : réponse vide = message, sinon on monte
  formulaire.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!champ.value.trim()) {
      erreur.textContent = 'Écris une réponse d’abord.';
      return;
    }
    erreur.textContent = '';
    monter();
  });
  champ.addEventListener('input', function () { erreur.textContent = ''; });

  // Bloc affiché une fois l'étape résolue
  section.appendChild(creer('p', 'bloc-ok', 'Déverrouillée'));

  // L'étoile cachée, seulement dans l'étape I : accès direct pour les habitués
  if (n === 1) {
    const etoile = creer('a', 'etoile');
    etoile.href = 'accueil.html';
    etoile.setAttribute('aria-label', 'Accès direct des membres');
    etoile.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="1.5" aria-hidden="true">' +
      '<path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"></path></svg>';
    section.appendChild(etoile);
  }
  return section;
}

/* Met chaque étape dans le bon état selon le niveau atteint */
function afficher() {
  for (let n = 1; n <= 5; n++) {
    const section = document.getElementById('etape-' + n);
    section.classList.toggle('verrouillee', n > niveau);
    section.classList.toggle('courante', n === niveau);
    section.classList.toggle('resolue', n < niveau);
  }
  document.getElementById('porte-finale').classList.toggle('ouverte', niveau > 5);
}

/* On passe à l'étape du dessus et on fait défiler l'écran jusqu'à elle */
function monter() {
  niveau++;
  afficher();
  const cible = niveau > 5 ? document.getElementById('porte-finale') : document.getElementById('etape-' + niveau);
  cible.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const champ = cible.querySelector('input');
  if (champ) setTimeout(function () { champ.focus({ preventScroll: true }); }, 600);
}

/* Démarrage : on fabrique les étapes de V (en haut) à I (en bas), avec une "corde" entre chaque */
function demarrer() {
  const conteneur = document.getElementById('etapes');
  for (let n = 5; n >= 1; n--) {
    conteneur.appendChild(creer('div', 'corde'));
    conteneur.appendChild(fabriquerEtape(n));
  }
  afficher();
  // On commence tout en bas de la page
  window.scrollTo(0, document.body.scrollHeight);
}

demarrer();
