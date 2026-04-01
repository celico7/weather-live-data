# Digital Ecosystem - Generative Art

A 3D interactive web experiment built with p5.js. This project creates a generative digital entity that reacts in real-time to both global weather data (via the Open-Meteo API) and local audio input (microphone).

## Features

*   **Real-time Weather Integration**: 
    *   Temperature influences the color palette (from cold blues to warm reds) and the base size of the structure.
    *   Wind speed dictates the rotational speed of the 3D object.
*   **Timezone-Aware Backgrounds**: The 3D scene background dynamically transitions through dawn, day, dusk, and night gradients. It calculates the exact local time and compares it to the sunrise and sunset times of the selected city.
*   **Audio Reactivity**: The central 3D geometry pulses and expands in real-time based on live environmental audio captured via the microphone.
*   **City Selector**: Seamlessly jump between different global locations (e.g., Strasbourg, Tokyo, Los Angeles) to watch the ecosystem instantly adapt to new local weather conditions and timezones.

## Technologies Used

*   HTML5 / CSS3
*   JavaScript (ES6+)
*   [p5.js](https://p5js.org/) (for WebGL 3D rendering)
*   [p5.sound](https://p5js.org/reference/#/libraries/p5.sound) (for audio analysis)
*   [Open-Meteo API](https://open-meteo.com/) (for fetching live weather and geolocation data without API keys)

## Installation & Usage

Due to browser security restrictions regarding microphone access and cross-origin API requests, this project must be run through a local web server.

1.  **Clone the repository**:
    ```bash
    git clone <your-repository-url>
    cd <your-repository-directory>
    ```

2.  **Run a local server**:
    You can use tools like VS Code "Live Server" extension, or a simple command line server such as Python's HTTP module:
    ```bash
    python -m http.server 8000
    ```

3.  **Open in your browser**:
    Navigate to `http://localhost:8000`.

4.  **Interact**:
    *   Click anywhere on the screen to initialize the Audio Context (required by modern browsers).
    *   Allow microphone access when prompted.
    *   Use the drop-down menu in the top left corner to switch between different cities.

## File Structure

*   `index.html`: The main entry point, imports the p5.js libraries and sets up the canvas container.
*   `sketch.js`: The core logic handling the WebGL rendering, API fetching, timezone math, and audio processing.

---

# Écosystème Numérique - Art Génératif (Version Française)

Une expérience web interactive en 3D construite avec p5.js. Ce projet crée une entité numérique générative qui réagit en temps réel aux données météorologiques mondiales (via l'API Open-Meteo) et au son environnemental local (microphone).

## Fonctionnalités

*   **Intégration Météo en Temps Réel** : 
    *   La température influence la palette de couleurs (des bleus froids aux rouges chauds) et la taille de base de la structure.
    *   La vitesse du vent dicte la vitesse de rotation de l'objet 3D.
*   **Fonds d'écran Adaptatifs (Fuseaux Horaires)** : L'arrière-plan de la scène 3D transite dynamiquement entre l'aube, le jour, le crépuscule et la nuit. Il calcule l'heure locale exacte et la compare aux heures de lever et de coucher du soleil de la ville sélectionnée.
*   **Réactivité Audio** : La géométrie 3D centrale pulse et s'agrandit en temps réel en fonction du son capté via le microphone.
*   **Sélecteur de Villes** : Basculez facilement entre différentes villes du monde (ex: Strasbourg, Tokyo, Los Angeles) pour voir l'écosystème s'adapter instantanément à la météo et à l'heure locale.

## Technologies Utilisées

*   HTML5 / CSS3
*   JavaScript (ES6+)
*   [p5.js](https://p5js.org/) (pour le rendu 3D WebGL)
*   [p5.sound](https://p5js.org/reference/#/libraries/p5.sound) (pour l'analyse audio)
*   [Open-Meteo API](https://open-meteo.com/) (pour les données météo mondiales gratuites sans clé API)

## Installation & Utilisation

En raison des restrictions de sécurité des navigateurs (accès au microphone et requêtes API), ce projet doit être exécuté depuis un serveur web local.

1.  **Cloner le dépôt** :
    ```bash
    git clone <votre-url-de-depot>
    cd <votre-dossier-de-depot>
    ```

2.  **Lancer un serveur local** :
    Vous pouvez utiliser des extensions comme "Live Server" sur VS Code, ou une simple commande Python :
    ```bash
    python -m http.server 8000
    ```

3.  **Ouvrir dans le navigateur** :
    Allez sur `http://localhost:8000`.

4.  **Interagir** :
    *   Cliquez n'importe où sur l'écran pour initialiser le contexte audio (requis par les navigateurs modernes).
    *   Autorisez l'accès au microphone lorsque le navigateur vous le demande.
    *   Utilisez le menu déroulant en haut à gauche pour changer de ville.

## Structure des Fichiers

*   `index.html` : Le point d'entrée principal, importe les bibliothèques p5.js et configure le canvas.
*   `sketch.js` : La logique principale gérant le rendu WebGL, les appels API, le calcul des fuseaux horaires et le traitement audio.
