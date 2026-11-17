# Le lieu — site de démonstration

## But
Version de démo du site, à montrer en ligne :
porte secrète → épreuve en 5 étapes → accueil → bibliothèque, salle de conférence (visio Jitsi intégrée) et bar.

Pas d'inscription pour l'instant : l'épreuve mène directement à l'accueil.

## Pages
| Fichier | Rôle |
|---|---|
| `index.html` + `js/porte.js` | La porte : frapper clic-clic, pause, clic |
| `escape.html` + `js/escape.js` | L'épreuve : 5 énigmes, de bas en haut (étoile cachée = raccourci) |
| `accueil.html` | Agenda, annonce, les 3 portes |
| `bibliotheque.html` | Conférences passées (emplacements vides) |
| `conference.html` + `js/conference.js` | La visio Jitsi + nos règles |
| `bar.html` + `js/bar.js` | Tables cliquables (pas encore reliées à la visio) |
| `css/commun.css` | Couleurs et styles partagés |
| `serveur.js` | Petit serveur pour tester en local (inutile en ligne) |

## Tester en local
Il faut Node.js. Depuis le dossier `siteJean` :
```bash
node site/serveur.js
```
Puis ouvrir http://localhost:8081

## Mettre en ligne sur Codeberg Pages
1. Sur codeberg.org, crée un dépôt vide (sans README), par exemple `lieu`.
2. Dans le dossier `site`, relie-le et envoie la branche `pages` :
   ```bash
   git remote add origin https://codeberg.org/TON-PSEUDO/lieu.git
   ```
   ```bash
   git push -u origin pages
   ```
3. Après une minute, le site est sur : `https://TON-PSEUDO.codeberg.page/lieu/`

Pour une mise à jour : modifier, puis `git add -A`, `git commit -m "…"`, `git push`.

## Avant la démo : le test indispensable
Faire un appel de **10 minutes à 3 personnes** via le site en ligne.
- Si la visio coupe vers 5 minutes : on utilise notre canal habituel pour la visio, et le site sert seulement pour la visite.
- Le premier arrivé devient modérateur. meet.jit.si peut lui demander de se connecter (Google, GitHub…).

## Modifier les textes
- Les énigmes : tableau `ENIGMES` en haut de `js/escape.js`.
- Le nom de la salle visio : `NOM_SALLE` dans `js/conference.js`.
- Les textes entre crochets `[…]` sont à remplacer directement dans les pages.

## Erreurs fréquentes
| Problème | Solution |
|---|---|
| Caméra/micro refusés | Cadenas de la barre d'adresse → autoriser. Le site doit être en `https://` ou `localhost`. |
| La visio ne s'affiche pas | Lien « Ouvrir la visio dans un nouvel onglet » sous la visio. |
| Le site en ligne n'a pas changé | Attendre 1 à 2 minutes, puis recharger avec Ctrl+F5. |
| `git push` demande un mot de passe | Utilise un jeton d'accès Codeberg (Paramètres → Applications), pas ton mot de passe. |
