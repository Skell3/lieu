/*
  conference.js — Le "cerveau" de la salle de conférence.

  1. Charge la visio Jitsi dans la page (grâce à son "API iframe" :
     une boîte à outils fournie par Jitsi pour piloter la visio depuis notre code).
  2. Ajoute NOS règles : modes de parole, main levée, temps de parole limité.
*/

/* ---------------------------------------------------------------
   RÉGLAGES
   - JITSI_DOMAINE : plus tard, notre propre serveur chez Infomaniak.
   - NOM_SALLE : le même pour tout le monde, pour se retrouver.
     Difficile à deviner, pour ne pas croiser d'inconnus sur meet.jit.si.
---------------------------------------------------------------- */
const JITSI_DOMAINE = 'meet.jit.si';
const NOM_SALLE = 'lieu-demo-k7q3m9xz2';

/* ---------------------------------------------------------------
   ÉTAT DE LA PAGE
---------------------------------------------------------------- */
let api = null;              // l'objet qui pilote la visio Jitsi
let pseudo = '';
let estModerateur = false;   // Jitsi nous dit si on a les droits de modérateur
let modeActuel = 'conference';
const noms = {};             // identifiant Jitsi → pseudo
let minuteurParole = null;   // minuteur de la règle "temps de parole"

function $(id) { return document.getElementById(id); }

/* Mémoire du navigateur (pour ne pas retaper son pseudo).
   try/catch : certains navigateurs la bloquent (navigation privée). */
function lireMemoire(cle) {
  try { return localStorage.getItem(cle) || ''; } catch (e) { return ''; }
}
function ecrireMemoire(cle, valeur) {
  try { localStorage.setItem(cle, valeur); } catch (e) { /* pas grave */ }
}

/* Ajoute une ligne au journal "Dans la salle" */
function noter(texte) {
  const ligne = document.createElement('li');
  const heure = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  ligne.textContent = heure + ' · ' + texte;
  $('journal').prepend(ligne);
}

/* ---------------------------------------------------------------
   CHARGER LE SCRIPT DE JITSI (une seule fois)
---------------------------------------------------------------- */
function chargerJitsi() {
  return new Promise(function (resolve, reject) {
    if (window.JitsiMeetExternalAPI) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://' + JITSI_DOMAINE + '/external_api.js';
    script.onload = resolve;
    script.onerror = function () { reject(new Error('Impossible de charger la visio.')); };
    document.head.appendChild(script);
  });
}

/* ---------------------------------------------------------------
   OUVRIR LA VISIO dans le cadre #visio
---------------------------------------------------------------- */
function ouvrirVisio() {
  $('statut').textContent = 'Connexion…';
  api = new JitsiMeetExternalAPI(JITSI_DOMAINE, {
    roomName: NOM_SALLE,
    parentNode: $('visio'),
    width: '100%',
    height: '100%',
    userInfo: { displayName: pseudo },
    configOverwrite: {
      prejoinPageEnabled: false,     // on a déjà notre propre écran d'entrée
      startWithAudioMuted: true,     // on entre micro coupé (politesse de conférence)
      startWithVideoMuted: false
    },
    interfaceConfigOverwrite: { SHOW_JITSI_WATERMARK: false }
  });
  brancherEvenements();
}

/* ---------------------------------------------------------------
   ÉCOUTER LA VISIO : Jitsi nous prévient de ce qui se passe
---------------------------------------------------------------- */
function brancherEvenements() {
  api.addListener('videoConferenceJoined', function (e) {
    noms[e.id] = e.displayName || pseudo;
    $('statut').textContent = 'Connecté · ' + pseudo;
    noter('Tu es entré.');
  });

  // Le premier arrivé devient en général modérateur
  api.addListener('participantRoleChanged', function (e) {
    if (e.role === 'moderator') {
      estModerateur = true;
      noter('Tu es modérateur : tes règles s’appliquent à tous.');
      appliquerMode();
    }
  });

  api.addListener('participantJoined', function (e) {
    noms[e.id] = e.displayName || 'Invité';
    noter(noms[e.id] + ' est entré.');
    // En conférence, on recoupe les micros à chaque arrivée
    if (modeActuel === 'conference' && estModerateur) api.executeCommand('muteEveryone', 'audio');
  });

  api.addListener('participantLeft', function (e) {
    noter((noms[e.id] || 'Quelqu’un') + ' est parti.');
  });

  api.addListener('raiseHandUpdated', function (e) {
    if (e.handRaised) noter((noms[e.id] || 'Quelqu’un') + ' demande la parole.');
  });

  api.addListener('dominantSpeakerChanged', function (e) {
    surveillerTempsDeParole(e.id);
  });

  api.addListener('readyToClose', quitter);
}

/* ---------------------------------------------------------------
   RÈGLE : LES MODES DE PAROLE
---------------------------------------------------------------- */
function appliquerMode() {
  if (!api) return;
  if (modeActuel === 'conference') {
    if (estModerateur) api.executeCommand('muteEveryone', 'audio');
    noter('Mode Conférence : micros coupés.');
  } else if (modeActuel === 'debat') {
    if (estModerateur) api.executeCommand('muteEveryone', 'audio');
    noter('Mode Débat : lève la main pour parler.');
  } else {
    noter('Mode Cercle libre : chacun parle quand il veut.');
  }
  if (!estModerateur && modeActuel !== 'libre') {
    noter('(Tu n’es pas modérateur : la règle ne s’applique qu’à toi.)');
  }
}

/* ---------------------------------------------------------------
   RÈGLE : TEMPS DE PAROLE LIMITÉ
   Un seul minuteur, relancé à chaque changement d'orateur.
---------------------------------------------------------------- */
function surveillerTempsDeParole(idParleur) {
  clearTimeout(minuteurParole);
  $('alerte-temps').textContent = '';
  const minutes = Number($('champ-temps').value);
  if (!minutes || modeActuel === 'libre') return;
  minuteurParole = setTimeout(function () {
    const nom = noms[idParleur] || 'L’intervenant';
    $('alerte-temps').textContent = nom + ' parle depuis plus de ' + minutes + ' min.';
    noter('Temps de parole dépassé : ' + nom + '.');
  }, minutes * 60 * 1000);
}

/* ---------------------------------------------------------------
   QUITTER : on ferme la visio et on revient à l'accueil
---------------------------------------------------------------- */
function quitter() {
  if (api) { api.dispose(); api = null; }
  clearTimeout(minuteurParole);
  window.location.href = 'accueil.html';
}

/* ---------------------------------------------------------------
   DÉMARRAGE
---------------------------------------------------------------- */
function demarrer() {
  $('champ-pseudo').value = lireMemoire('pseudo');
  $('lien-direct').href = 'https://' + JITSI_DOMAINE + '/' + NOM_SALLE;

  // Entrée : on vérifie le pseudo, on charge Jitsi, on ouvre la visio
  $('form-entree').addEventListener('submit', async function (e) {
    e.preventDefault();
    pseudo = $('champ-pseudo').value.trim();
    if (!pseudo) {
      $('erreur-entree').textContent = 'Écris ton pseudo d’abord.';
      return;
    }
    $('erreur-entree').textContent = '';
    ecrireMemoire('pseudo', pseudo);
    try {
      await chargerJitsi();
    } catch (err) {
      $('erreur-entree').textContent = err.message + ' Vérifie ta connexion internet.';
      return;
    }
    $('ecran-entree').hidden = true;
    $('ecran-salle').hidden = false;
    ouvrirVisio();
  });
  $('champ-pseudo').addEventListener('input', function () { $('erreur-entree').textContent = ''; });

  // Changement de mode de parole
  document.querySelectorAll('input[name="mode"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      modeActuel = radio.value;
      appliquerMode();
    });
  });

  // Lever / baisser la main
  $('btn-main').addEventListener('click', function () {
    if (!api) return;
    api.executeCommand('toggleRaiseHand');
    $('btn-main').classList.toggle('actif');
  });

  $('btn-quitter').addEventListener('click', quitter);
  $('champ-temps').addEventListener('change', function () { $('alerte-temps').textContent = ''; });
}

demarrer();
