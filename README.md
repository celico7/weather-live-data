## Version Française

Digital Ecosystem est une application web 3D interactive et procédurale qui fusionne des données météorologiques en temps réel, une visualisation audio et des statistiques de dépôts GitHub dans une expérience unique et cohérente.

### Fonctionnalités

*   **Environnement 3D Procédural** : Génère une forêt 3D où chaque arbre représente un dépôt GitHub. La taille, la complexité et la couleur des arbres sont déterminées par la taille du dépôt et son langage de programmation principal.
*   **Intégration Météo en Temps Réel** : Se connecte à l'API Open-Meteo pour récupérer les données météorologiques en temps réel pour les villes sélectionnées. Le dégradé d'arrière-plan et les effets de particules (pluie, neige) s'adaptent dynamiquement aux conditions météorologiques actuelles et à l'heure locale de la ville sélectionnée.
*   **Réactivité Audio** : Utilise le microphone de l'appareil pour analyser l'entrée audio (basses et aiguës) en temps réel. L'objet 3D central palpite au rythme des basses, tandis que les branches des arbres réagissent aux fréquences aiguës. Un analyseur spectral est également affiché dans l'interface utilisateur.
*   **Gestion des Villes** : Les utilisateurs peuvent rechercher et ajouter de nouvelles villes du monde entier, et supprimer celles existantes. L'application affiche l'heure locale, la température, la description de la météo et le nom du pays.
*   **Personnalisation** : Les utilisateurs peuvent téléverser un avatar personnalisé et choisir une couleur de thème qui met à jour les éléments de l'interface (bordures, texte, dégradés).
*   **Persistance des Données Locales** : Les préférences de l'utilisateur, y compris le thème sélectionné, l'avatar et les villes gérées, sont automatiquement sauvegardées dans le stockage local du navigateur.

### Technologies Utilisées

*   **React** : Pour la construction de l'interface utilisateur et la gestion de l'état de l'application.
*   **p5.js** : Pour le rendu du canevas 3D WebGL, la génération procédurale et l'analyse audio.
*   **Tailwind CSS** : Pour le style de l'interface utilisateur avec des classes utilitaires.
*   **Lucide React** : Pour les icônes vectorielles.
*   **API Open-Meteo** : Pour la récupération des données de géocodage et de prévisions météorologiques.
*   **API GitHub** : Pour la récupération des données des dépôts utilisateurs.

### Configuration et Installation

1.  Clonez le dépôt.
2.  Installez les dépendances en utilisant `npm install`.
3.  Démarrez le serveur de développement en utilisant `npm run dev`.
4.  Ouvrez l'application dans votre navigateur. Remarque : L'accès au microphone doit être autorisé pour que les fonctionnalités de réactivité audio fonctionnent.

---

# Digital Ecosystem

## English Version

Digital Ecosystem is an interactive, procedural 3D web application that merges real-time weather data, audio visualization, and GitHub repository statistics into a single, cohesive experience.

### Features

*   **Procedural 3D Environment**: Generates a 3D forest where each tree represents a GitHub repository. The size, complexity, and color of the trees are determined by the repository's size and primary programming language.
*   **Real-Time Weather Integration**: Connects to the Open-Meteo API to fetch real-time weather data for selected cities. The background gradient and particle effects (rain, snow) dynamically adapt to the current weather conditions and local time of the selected city.
*   **Audio Reactivity**: Uses the device's microphone to analyze audio input (bass and treble) in real-time. The central 3D object pulses to the bass, while the tree branches react to treble frequencies. A spectral analyzer is also displayed in the UI.
*   **City Management**: Users can search for and add new cities worldwide, and remove existing ones. The application displays the local time, temperature, weather description, and country name.
*   **Personalization**: Users can upload a custom avatar and choose a theme color that updates the UI elements (borders, text, gradients).
*   **Local Storage Persistence**: User preferences, including the selected theme, avatar, and managed cities, are automatically saved in the browser's local storage.

### Technologies Used

*   **React**: For building the user interface and managing application state.
*   **p5.js**: For rendering the 3D WebGL canvas, procedural generation, and audio analysis.
*   **Tailwind CSS**: For styling the user interface with utility classes.
*   **Lucide React**: For scalable vector icons.
*   **Open-Meteo API**: For fetching geocoding and weather forecast data.
*   **GitHub API**: For fetching user repository data.

### Setup and Installation

1.  Clone the repository.
2.  Install dependencies using `npm install`.
3.  Start the development server using `npm run dev`.
4.  Open the application in your browser. Note: Microphone access must be granted for the audio reactivity features to work.
