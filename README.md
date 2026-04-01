# 🌦️ Weather & GitHub Live Data - 3D Generative Ecosystem

A highly interactive 3D web experiment built with **p5.js (WebGL)**. This project creates a generative digital entity that reacts in real-time to global weather data (via the Open-Meteo API), local audio input (microphone via FFT analysis), and your live GitHub repositories!

## ✨ Features (New & Upgraded)

* **Interactive 3D Camera**: Use your mouse to rotate (drag) and zoom (scroll) around the 3D space.
* **Audio-Reactive Core**: The central 3D geometry pulses based on live environmental audio. Uses p5.FFT to isolate bass (drives the rotation and tree dancing) and treble (drives the glowing tree leaves).
* **Live Weather Environment**:
  * Temperature influences the structural color palette combined with a shiny 3D material.
  * Real-time weather codes trigger 3D particle systems (Snow ❄️, Rain 🌧️) and display human-readable conditions.
  * Wind speed dictates the base rotational speed of the core object.
* **Procedural GitHub Forest 🌳**: 
  * Your recent GitHub repositories are rendered as procedural 3D fractal trees orbiting the core.
  * **Tree Anatomy**: Trunk size and fractal branch complexity are mapped to the repository's size! Branch color reflects the programming language.
  * **Cinematic Focus System**: Hovering over a tree automatically scales it up and illuminates it, while dynamically dimming and shrinking the rest of the forest to focus your attention.
  * **Clickable Repos**: Click on any focused tree to instantly open its GitHub repository in a new tab.
  * **Rate-Limit Safe**: Intelligently calculates repo complexity locally to prevent GitHub API rate limits (HTTP 403).
* **Timezone-Aware Skies**: The 3D background smoothly transitions through dawn, day, dusk, and night gradients based on the exact local time and sunset/sunrise of the selected city.

## 🔒 Privacy & Data Promise

**No personal data is recorded, stored, or transmitted.** 
* The microphone input is processed purely locally in real-time within your browser (FFT analysis) to animate the 3D shapes. No audio is recorded.
* The data is fetched directly from public APIs to your local machine. Nothing is tracked on any database.

---

# 🌦️ Écosystème Numérique - Art Génératif & Data Live (Version Française)

Une expérience web interactive en 3D construite avec **p5.js (WebGL)**. Ce projet génère un écosystème numérique qui réagit en temps réel à la météo mondiale (Open-Meteo API), au son environnant (microphone avec analyse FFT), et à vos dépôts GitHub !

## ✨ Fonctionnalités (Nouvelles & Améliorées)

* **Caméra 3D Interactive** : Cliquez et glissez pour tourner autour de la scène, scrollez pour zoomer.
* **Noyau Audio-Réactif** : La géométrie 3D centrale pulse en temps réel avec le son. L'analyse p5.FFT isole les basses (qui font danser les arbres et tourner le cube) et les aigus (qui font briller le bout des feuilles).
* **Environnement Météo en Direct** :
  * La température modifie la palette de couleurs du cube central (des bleus froids aux rouges chauds).
  * Le code météo déclenche des particules 3D (Pluie 🌧️, Neige ❄️) qui tombent sur la scène, et affiche un texte lisible (ex: "Nuageux", "Orage").
  * Le vent influence la vitesse de rotation de l'objet.
* **Forêt GitHub Procédurale 🌳** : 
  * Vos dépôts GitHub récents orbitent autour du centre sous forme d'arbres fractals 3D.
  * **Anatomie des arbres** : La hauteur du tronc et la complexité des branches (fractales) dépendent de la taille du dépôt ! La couleur dépend du langage de programmation.
  * **Focus Cinématique** : Au survol, l'arbre ciblé grossit et s'illumine, tandis que le reste de la forêt rapetisse et s'assombrit pour un effet de focus ultra-satisfaisant.
  * **Dépôts Cliquables** : Un clic rapide sur un arbre ouvre directement le dépôt GitHub associé dans un nouvel onglet.
  * **Anti-Rate Limit** : Le système empêche les erreurs 403 de l'API GitHub en limitant le nombre de requêtes et en calculant la complexité localement.
* **Ciels Adaptatifs (Fuseaux Horaires)** : Le fond 3D évolue (aube, jour, crépuscule, nuit) selon l'heure locale exacte de la ville choisie.

## 🔒 Confidentialité & Traitement des Données

**Aucune donnée n'est enregistrée, conservée ou transmise.**
* Le flux audio de votre microphone est analysé localement et en temps réel (FFT) uniquement par votre navigateur pour animer la 3D. Aucun son n'est enregistré.
* Les données (météo et GitHub) sont récupérées depuis des API publiques directement sur votre machine sans aucun traçage.

## 🚀 Installation & Utilisation

Ce projet doit être exécuté depuis un serveur web local pour autoriser l'accès au micro et les requêtes API (sécurité standard des navigateurs).

1. **Cloner le dépôt** :
   \\\ash
   git clone <votre-url-de-depot>
   cd <votre-dossier-de-depot>
   \\\

2. **Lancer un serveur local** :
   Utilisez "Live Server" (VS Code) ou Python :
   \\\ash
   python -m http.server 8000
   \\\

3. **Ouvrir dans le navigateur** : \http://localhost:8000\
4. **Interagir** : 
   * Cliquez pour initialiser l'audio et autorisez le micro.
   * Promenez-vous avec la souris dans la forêt 3D !
