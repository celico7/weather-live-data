# Digital Ecosystem / Ecosystème Numérique

Digital Ecosystem is an interactive, procedural 3D web application that merges real-time weather data, audio visualization, and GitHub repository statistics into a single, cohesive experience. / Digital Ecosystem est une application web 3D interactive et procédurale qui fusionne des données météorologiques en temps réel, une visualisation audio et des statistiques de dépôts GitHub dans une expérience unique et cohérente.

---

## English Version

### Features

* **Procedural 3D Environment**: Generates a 3D forest using L-System algorithms where each tree represents a GitHub repository. The size, complexity, and color of the branches are determined by the repository's size and programming language. Includes a GitHub user search feature to dynamically regenerate the forest.
* **Audio-Reactive Procedural Terrain**: Features a 3D wireframe terrain generated with Perlin noise that morphs and moves in real-time, reacting to the bass frequencies picked up by your microphone.
* **Real-Time Weather Integration**: Connects to the Open-Meteo API to fetch real-time weather data. Particle effects (rain, snow) and wind speed dynamically affect the 3D environment. The central object changes color based on the local temperature.
* **Dynamic 3D Lighting**: Utilizes WebGL directional and point lighting. The position and color of the sun dynamically adapt to the current time and weather conditions of the selected city.
* **Audio Reactivity**: Uses the device's microphone to analyze audio input (bass, treble, and spectrum). The central 3D object pulses to the bass, trees react to treble, and the UI displays a live spectral analyzer.
* **City & Language Management**: Search and add cities worldwide. The application displays local time, temperature, and weather descriptions. Full bilingual support (English/French).
* **Personalization & Persistence**: Upload a custom avatar and choose a custom theme color. All preferences are automatically saved in the browser's local storage.

### Technologies Used

* **React & TypeScript**: Front-end framework and strict typing for the user interface, API calls, and state management.
* **Vite**: Fast build tool and development server.
* **p5.js & p5.sound**: Handles the WebGL 3D canvas rendering, procedural generation algorithms, and Fast Fourier Transform (FFT) for audio analysis.
* **Tailwind CSS**: Utility-first styling for the modern glassmorphism UI overlay.
* **Open-Meteo API**: For geocoding and live weather metadata.
* **GitHub API**: For fetching user repository data dynamically.

### Setup and Installation

1. Clone the repository.
2. Install dependencies using 'npm install'.
3. Start the development server using 'npm run dev'.
4. Open the application in your browser and allow microphone access for the audio-reactive features.

---

## Version Française

### Fonctionnalités

* **Environnement 3D Procédural** : Génère une forêt 3D via des algorithmes récursifs (L-System) où chaque arbre représente un dépôt GitHub. La taille, la complexité et la couleur dépendent du langage principal et de la taille du dépôt. Intègre une barre de recherche pour générer la forêt de n'importe quel utilisateur GitHub.
* **Terrain Procédural Audio-Réactif** : Affiche un terrain 3D filaire généré par bruit de Perlin qui ondule et réagit en temps réel aux fréquences basses captées par votre microphone.
* **Intégration Météo en Temps Réel** : Récupère les données via l'API Open-Meteo. Des effets de particules (pluie, neige) et la force du vent affectent l'environnement 3D. L'objet central change de couleur selon la température locale.
* **Éclairage 3D Dynamique** : Utilise des lumières directionnelles et ponctuelles WebGL. La position et la couleur du soleil s'adaptent dynamiquement à l'heure locale et aux conditions météorologiques de la ville sélectionnée.
* **Réactivité Audio** : Le microphone analyse les fréquences (basses, aiguës, spectre complet). L'objet central palpite sur les basses, les arbres s'animent sur les aiguës, et l'interface affiche un analyseur spectral en direct.
* **Gestion des Villes & Langues** : Recherchez et ajoutez des villes du monde entier. L'application gère le multilinguisme (Français/Anglais) et affiche l'heure, la température et la description météo exactes.
* **Personnalisation & Sauvegarde** : Téléversez un avatar et choisissez une couleur de thème. Toutes vos préférences sont sauvegardées dans le stockage local du navigateur.

### Technologies Utilisées

* **React & TypeScript** : Framework front-end et typage strict pour l'interface utilisateur, les appels API et la gestion d'état.
* **Vite** : Outil de compilation et serveur de développement ultra-rapide.
* **p5.js & p5.sound** : Gère le canevas 3D WebGL, les algorithmes de génération procédurale et la transformée de Fourier rapide (FFT) pour l'audio.
* **Tailwind CSS** : Framework CSS utilitaire pour l'interface moderne.
* **Open-Meteo API** : Pour le géocodage et les données météorologiques en direct.
* **GitHub API** : Pour récupérer dynamiquement les dépôts d'un utilisateur.

### Configuration et Installation

1. Clonez le dépôt.
2. Installez les dépendances en utilisant 'npm install'.
3. Démarrez le serveur de développement en utilisant 'npm run dev'.
4. Ouvrez l'application dans votre navigateur. Autorisez l'accès au microphone pour l'expérience audio-réactive.
