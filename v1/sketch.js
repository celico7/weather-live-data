// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  GITHUB_USERNAME: "celico7", // pseudo github
  BASE_RADIUS_MIN: 80,
  BASE_RADIUS_MAX: 200,
  AUDIO_PULSE_MAX: 150,
  ROTATION_SPEED_MIN: 0.2,
  ROTATION_SPEED_MAX: 3.0,
  FOREST_RADIUS: 300,
  MAX_BRANCHES: 15,
};

const CITIES_DATA = {
  "Strasbourg": { lat: 48.57, lon: 7.75 },
  "Oberhoffen-sur-Moder": { lat: 48.78, lon: 7.86 },
  "Paris": { lat: 48.85, lon: 2.35 },
  "Tokyo": { lat: 35.67, lon: 139.65 },
  "Reykjavik": { lat: 64.14, lon: -21.89 },
  "Port Louis": { lat: -20.16, lon: 57.50 },
  "Los Angeles": { lat: 34.05, lon: -118.25 },
};

const LANG_COLORS = {
  "JavaScript": [241, 224, 90],
  "TypeScript": [49, 120, 198],
  "Python": [53, 114, 165],
  "HTML": [227, 76, 38],
  "CSS": [86, 61, 124],
  "Java": [176, 114, 25],
  "default": [150, 255, 150]
};

// ============================================================================
// VARIABLES D'ÉTAT GLOBALES
// ============================================================================

let state = {
  weatherData: null,
  temperature: 15,
  windSpeed: 5,
  weatherCode: 0,
  sunriseTime: 360,
  sunsetTime: 1200,
  githubRepos: [],
  currentCity: "Strasbourg",
  hoveredRepo: null,
  angle: 0,
  volume: 0,
  particles: []
};

let domElements = {
  citySelect: null,
  uiText: null,
  tooltipDiv: null,
};

let mic;
let fft;

// ============================================================================
// 1. CYCLE DE VIE P5.JS
// ============================================================================

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(DEGREES);
  colorMode(RGB, 255, 255, 255, 1);

  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT();
  fft.setInput(mic);

  setupUI();

  fetchWeather(state.currentCity);
  fetchGitHub();
  
  // Générer des particules pour la météo
  for(let i=0; i<300; i++) {
    state.particles.push({
      x: random(-width, width),
      y: random(-height, height),
      z: random(-800, 800),
      speedY: random(5, 15),
      speedX: random(-2, 2)
    });
  }
}

function draw() {
  background(0);
  
  // Contrôle de caméra (click droit / gauche / molette)
  orbitControl();
  
  draw3DBackground();
  updateAudioAndAngle();
  setupLighting();
  
  drawWeatherParticles();
  drawGitHubForest();
  drawCentralObject();
  
  updateUI();
}

// ============================================================================
// 2. RÉCUPÉRATION DES DONNÉES (API) avec FETCH
// ============================================================================

function fetchWeather(cityName) {
  const coords = CITIES_DATA[cityName];
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&daily=sunrise,sunset&timezone=auto`;
  
  fetch(url)
    .then(response => response.json())
    .then(data => {
      state.weatherData = data;
      if (data.current_weather) {
        state.temperature = data.current_weather.temperature;
        state.windSpeed = data.current_weather.windspeed;
        state.weatherCode = data.current_weather.weathercode;
      }
      if (data.daily && data.daily.sunrise && data.daily.sunset) {
        const srStr = data.daily.sunrise[0];
        const ssStr = data.daily.sunset[0];
        state.sunriseTime = parseInt(srStr.substring(11, 13)) * 60 + parseInt(srStr.substring(14, 16));
        state.sunsetTime = parseInt(ssStr.substring(11, 13)) * 60 + parseInt(ssStr.substring(14, 16));
      }
    })
    .catch(err => console.error("Erreur Météo:", err));
}

function fetchGitHub() {
  const url = `https://api.github.com/users/${CONFIG.GITHUB_USERNAME}/repos?sort=updated&per_page=10`;
  
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (Array.isArray(data)) {
        state.githubRepos = data;
        // Pour éviter de dépasser la limite d'API GitHub (Rate Limit de 60 requêtes par heure),
        // on ne fait plus de requête pour chercher le compte exact de chaque commit.
        // On calcule plutôt une complexité (qui servira de commitCount pour l'arbre)
        // basée sur la "size" du dépôt, qui est toujours disponible dans cette première requête !
        state.githubRepos.forEach((repo) => {
          // Un petit repo aura 1 à 2 branches. Un gros de 10 à 50 branches.
          repo.commitCount = map(repo.size, 0, 5000, 1, 50, true);
        });
      } else {
        console.error("Erreur GitHub (Rate Limit probable) :", data);
        // Si l'API est bloquée (Rate Limit dépassé), on met des fausses données pour ne pas casser le site
        state.githubRepos = [
          { name: "Projet_Simulé_1", size: 1000, pushed_at: new Date().toISOString(), language: "JavaScript", commitCount: 30, description: "Données locales temporaires", html_url: "https://github.com" },
          { name: "Projet_Simulé_2", size: 250, pushed_at: new Date().toISOString(), language: "Python", commitCount: 15, description: "Limite d'API GitHub atteinte", html_url: "https://github.com" },
          { name: "Projet_Simulé_3", size: 50, pushed_at: new Date().toISOString(), language: "HTML", commitCount: 4, description: "Revenez dans une heure", html_url: "https://github.com" }
        ];
      }
    })
    .catch(err => {
      console.error("Erreur réseau GitHub:", err);
    });
}

// Ancienne fonction fetchRepoCommits supprimée pour préserver le Rate Limit de l'API GitHub

function changeCity() {
  state.currentCity = domElements.citySelect.value();
  fetchWeather(state.currentCity);
}

// ============================================================================
// 3. CONFIGURATION ET MISE À JOUR DE L'UI
// ============================================================================

function setupUI() {
  domElements.citySelect = createSelect();
  domElements.citySelect.position(20, 20);
  domElements.citySelect.style('background-color', 'rgba(20, 20, 30, 0.8)');
  domElements.citySelect.style('color', '#fff');
  domElements.citySelect.style('border', '1px solid #555');
  domElements.citySelect.style('padding', '8px');
  domElements.citySelect.style('border-radius', '4px');
  domElements.citySelect.style('font-family', 'sans-serif');

  for (let city in CITIES_DATA) {
    domElements.citySelect.option(city);
  }
  domElements.citySelect.changed(changeCity);

  domElements.uiText = createDiv('');
  domElements.uiText.position(20, windowHeight - 40);
  domElements.uiText.style('color', 'white');
  domElements.uiText.style('font-family', 'sans-serif');
  domElements.uiText.style('font-size', '16px');
  domElements.uiText.style('text-shadow', '1px 1px 2px black');
  domElements.uiText.style('background', 'rgba(0, 0, 0, 0.23)');

  domElements.tooltipDiv = createDiv('');
  domElements.tooltipDiv.style('position', 'absolute');
  domElements.tooltipDiv.style('background', 'rgba(0, 0, 0, 0.8)');
  domElements.tooltipDiv.style('color', 'white');
  domElements.tooltipDiv.style('padding', '10px');
  domElements.tooltipDiv.style('border-radius', '5px');
  domElements.tooltipDiv.style('font-family', 'sans-serif');
  domElements.tooltipDiv.style('font-size', '14px');
  domElements.tooltipDiv.style('pointer-events', 'none'); 
  domElements.tooltipDiv.style('display', 'none');
  domElements.tooltipDiv.style('z-index', '100');
}

function getWeatherDescription(code) {
  if (code === 0) return "Ciel dégagé ☀️";
  if (code >= 1 && code <= 3) return "Nuageux ☁️";
  if (code >= 45 && code <= 48) return "Brouillard 🌫️";
  if (code >= 51 && code <= 67) return "Pluie 🌧️";
  if (code >= 71 && code <= 86) return "Neige ❄️";
  if (code >= 95) return "Orage ⛈️";
  return "Variable";
}

function updateUI() {
  let cityTimeStr = "--h--";
  if (state.weatherData && state.weatherData.utc_offset_seconds !== undefined) {
    let cityTimeObj = new Date(Date.now() + (state.weatherData.utc_offset_seconds * 1000));
    cityTimeStr = cityTimeObj.getUTCHours().toString().padStart(2, '0') + "h" + cityTimeObj.getUTCMinutes().toString().padStart(2, '0');
  }

  const act = mic.getLevel() > 0.01 ? "Actif" : "en attente";
  const weatherDesc = getWeatherDescription(state.weatherCode);
  
  domElements.uiText.html(`📍 ${state.currentCity} | Heure: ${cityTimeStr} | Temp: ${state.temperature}°C | Vent: ${state.windSpeed}km/h | Météo: ${weatherDesc} | Son: ${act}`);

  if (state.hoveredRepo) {
    domElements.tooltipDiv.html(`
      <strong>${state.hoveredRepo.name}</strong><br>
      <em>${state.hoveredRepo.desc}</em><br>
      Langage: ${state.hoveredRepo.language || 'Mixte'}<br>
      Commits: ${state.hoveredRepo.commitCount || '...'} branches<br>
      ${state.hoveredRepo.isRecent ? "🟢 Récent (< 2j)" : "⚪ Ancien (> 2j)"}<br>
      <em>(Clic-gauche pour ouvrir sur GitHub)</em>
    `);
    domElements.tooltipDiv.position(mouseX + 15, mouseY + 15); 
    domElements.tooltipDiv.style('display', 'block');
  } else {
    domElements.tooltipDiv.style('display', 'none');
  }
}

// ============================================================================
// 4. MOTEUR 3D
// ============================================================================

function drawWeatherParticles() {
  if (!state.weatherData) return;
  // Neiger: code > 70. Pluie: code entre 50 et 70. 
  let isRain = state.weatherCode >= 50 && state.weatherCode <= 69;
  let isSnow = state.weatherCode >= 70 && state.weatherCode <= 86;
  
  if (!isRain && !isSnow) return; // Beau temps

  push();
  noStroke();
  fill(255, 255, 255, isSnow ? 0.8 : 0.4);
  
  for (let p of state.particles) {
    p.y += p.speedY + (state.windSpeed / 10);
    p.x += state.windSpeed; 

    // Box pour pluie (étiré), sphere pour neige
    push();
    translate(p.x, p.y, p.z);
    if(isRain) box(1, 15, 1);
    else sphere(3);
    pop();

    // Reset particules
    if (p.y > height) {
      p.y = -height;
      p.x = random(-width, width);
    }
    if (p.x > width) {
      p.x = -width;
    }
  }
  pop();
}

function updateAudioAndAngle() {
  let spectrum = fft.analyze(); // Analyse spectrale (0-255 sur 1024 fréquences)
  let bass = fft.getEnergy("bass"); // 0 à 255
  let treble = fft.getEnergy("treble");

  const rawVolume = mic.getLevel();
  state.volume = lerp(state.volume, rawVolume, 0.1); 
  state.bassForce = lerp(state.bassForce || 0, bass, 0.1);
  state.trebleForce = lerp(state.trebleForce || 0, treble, 0.1);

  const rotationSpeed = map(state.windSpeed, 0, 50, CONFIG.ROTATION_SPEED_MIN, CONFIG.ROTATION_SPEED_MAX); 
  state.angle += rotationSpeed;
}

function setupLighting() {
  ambientLight(50);
  directionalLight(255, 255, 255, 0.5, 0.5, -1);
  // Ajoute une lueur magenta
  pointLight(255, 50, 150, 0, 0, 200);
}

function drawCentralObject() {
  const warmColor = color(255, 50, 50);
  const coldColor = color(50, 150, 255);
  
  const tempAmt = constrain(map(state.temperature, -5, 35, 0, 1), 0, 1);
  const objColor = lerpColor(coldColor, warmColor, tempAmt);
  
  const baseRadius = map(state.temperature, -5, 35, CONFIG.BASE_RADIUS_MIN, CONFIG.BASE_RADIUS_MAX); 
  // Pulse sur le BPM (les Basses de la chanson ou voix)
  const audioPulse = map(state.bassForce, 0, 255, 0, CONFIG.AUDIO_PULSE_MAX); 
  const finalSize = baseRadius + audioPulse;

  push();
  rotateX(state.angle * 0.5);
  rotateY(state.angle);
  
  fill(objColor);
  specularMaterial(255); 
  shininess(50); // Rendre brillant (WebGL)

  stroke(255, 255, 255, 0.5); 
  strokeWeight(1);
  box(finalSize); 
  pop();
}

function recursiveBranch(len, depth, maxDepth, langColor, windOffset = 0) {
  // Dégradé : la base est sombre, les extrémités sont lumineuses
  let colorMult = map(depth, 0, maxDepth, 1.2, 0.5);
  ambientMaterial(min(langColor[0]*colorMult, 255), min(langColor[1]*colorMult, 255), min(langColor[2]*colorMult, 255));
  
  // Tronc/Branche qui s'affine vers le haut avec le depth
  let diam = map(depth, 0, maxDepth, 1, 8);
  
  push();
  translate(0, -len/2, 0);
  cylinder(diam, len, 8, 1);
  pop();
  
  translate(0, -len, 0);
  
  if (depth > 0) {
    // Vent doux et organique (basé sur le temps et l'offset unique de l'arbre)
    let wind = sin(frameCount * 0.03 + windOffset + depth) * 8;
    let angleShift = 25 + (state.bassForce * 0.15) + wind; 
    
    // Branche 1
    push();
    rotateZ(angleShift);
    rotateY(frameCount * 0.3 + windOffset);
    recursiveBranch(len * 0.7, depth - 1, maxDepth, langColor, windOffset);
    pop();

    // Branche 2 (Légèrement asymétrique pour un rendu plus naturel)
    push();
    rotateZ(-angleShift * 0.8);
    rotateX(-15 + wind * 0.3);
    rotateY(-frameCount * 0.3 - windOffset);
    recursiveBranch(len * 0.75, depth - 1, maxDepth, langColor, windOffset);
    pop();
  } else {
    // Bout des feuilles élégantes
    noStroke();
    let beatAigu = map(state.trebleForce, 0, 255, 3, 14); 
    // Émission lumineuse sur les feuilles au bout
    emissiveMaterial(langColor[0], langColor[1], langColor[2]);
    push();
    scale(1, 1.5, 1); // Étire la sphère pour lui donner une forme de goutte/feuille
    sphere(beatAigu, 8, 8);
    pop();
  }
}

function drawGitHubForest() {
  if (!state.githubRepos || state.githubRepos.length === 0) return;

  let currentHover = null;
  const forestRotationY = frameCount * 0.2;

  push();
  rotateY(forestRotationY);
  
  for (let i = 0; i < state.githubRepos.length; i++) {
    const repo = state.githubRepos[i];
    const theta = map(i, 0, state.githubRepos.length, 0, 360);
    
    const x = cos(theta) * CONFIG.FOREST_RADIUS;
    const z = sin(theta) * CONFIG.FOREST_RADIUS;
    const h = constrain(map(repo.size, 0, 10000, 50, 250), 50, 300);
    
    push();
    translate(x, 0, z);
    
    // --- Calcul Manuel de la Projection 3D vers 2D pour le survol ---
    // (Remplace 'screenX' qui n'est pas supporté sur toutes les versions de p5.js)
    
    // Application de la rotation de la forêt pour obtenir la position globale X et Z
    const gx = x * cos(forestRotationY) + z * sin(forestRotationY);
    const gz = -x * sin(forestRotationY) + z * cos(forestRotationY);
    
    // Calcul de la perspective WebGL standard (Caméra par défaut)
    const fov = 60 * PI / 180;
    const cameraZ = (height / 2.0) / tan(fov / 2.0);
    const perspective = cameraZ / (cameraZ - gz);

    // Coordonnées projetées sur l'écran en 2D
    const sx = gx * perspective + width / 2; 
    const syFlower = (-h) * perspective + height / 2; // Y de la fleur
    const syTrunk = (-h / 2) * perspective + height / 2; // Y du centre du tronc

    // Hitbox BEAUCOUP plus permissive pour attraper facilement les petits arbres
    let isHover = false;
    // On impose un rayon minimum très large (50px-60px) pour que même un petit arbre lointain soit facile à survoler
    let radiusFeuilles = max(60, 60 * perspective); 
    let radiusTronc = max(60, (h / 2 * perspective) + 40);
    
    // L'arbre doit être devant l'observateur (gz > -cameraZ)
    if (gz > -300) {
      // On teste si la souris est globalement aux alentours de l'arbre
      if (dist(mouseX, mouseY, sx, syFlower) < radiusFeuilles || dist(mouseX, mouseY, sx, syTrunk) < radiusTronc) {
          isHover = true;
      }
    }

    const pushDate = new Date(repo.pushed_at);
    const diffDays = Math.abs(new Date() - pushDate) / (1000 * 60 * 60 * 24);
    const isRecent = diffDays < 2;

    if (isHover) {
      currentHover = {
        name: repo.name,
        size: repo.size,
        isRecent: isRecent,
        desc: repo.description || "Aucune description",
        html_url: repo.html_url
      };
    }
    
    // Le tronc classique est remplacé par une vraie génération procédurale fractale d'arbres 3D
    push();
    
    // Positionne la base de l'arbre
    let baseL = min(repo.size, 150); // Hauteur du tronc
    let cCount = repo.commitCount || 1;
    let bDepth = min(floor(map(cCount, 1, 50, 1, 5)), CONFIG.MAX_BRANCHES);
    let langCol = LANG_COLORS[repo.language] || LANG_COLORS["default"];

    // ===== NOUVEAU SYSTÈME DE FOCUS DYNAMIQUE =====
    let targetScale = 1.0;
    if (state.hoveredRepo) { 
      // Si N'IMPORTE QUEL arbre est survolé
      if (state.hoveredRepo.name === repo.name) {
        // L'arbre actuel est celui survolé : Focus !
        targetScale = 1.5; 
        ambientLight(255); // Le fait briller
        // langCol = [langCol[0]*1.5, langCol[1]*1.5, langCol[2]*1.5]; // Couleurs plus vives
      } else {
        // Les autres arbres disparaissent / s'assombrissent en fond
        targetScale = 0.4; 
        langCol = [langCol[0]*0.2, langCol[1]*0.2, langCol[2]*0.2];
      }
    } else {
      // Aucun arbre survolé : Légère "respiration" organique pour la forêt
      targetScale = 1.0 + sin(frameCount * 0.05 + i) * 0.08; 
    }
    
    // Lerp (interpolation) pour une animation de taille ultra fluide
    repo.currentScale = repo.currentScale || 1.0;
    repo.currentScale = lerp(repo.currentScale, targetScale, 0.1);
    
    push();
    scale(repo.currentScale);
    
    // Génère l'arbre ! (Avec effet de vent unique)
    recursiveBranch(baseL, bDepth, bDepth, langCol, i * 45);

    pop(); // Fin scale focus
    pop(); // Fin translate position arbre
    
    pop(); // Fin de la rotation offset Z / radius
  }
  pop(); 
  
  state.hoveredRepo = currentHover;
}

// ============================================================================
// 5. DÉCORS ET BACKGROUND
// ============================================================================

function getGradientColors() {
  let timeNow = 720; // Midi par défaut
  
  if (state.weatherData && state.weatherData.utc_offset_seconds !== undefined) {
    let cityTime = new Date(Date.now() + (state.weatherData.utc_offset_seconds * 1000));
    timeNow = cityTime.getUTCHours() * 60 + cityTime.getUTCMinutes();
  }
  
  let c1, c2;
  const night1 = color(10, 15, 30), night2 = color(2, 5, 15);
  const sunrise1 = color(255, 120, 80), sunrise2 = color(50, 40, 80);
  const day1 = color(100, 180, 255), day2 = color(240, 250, 255);
  const sunset1 = color(40, 20, 60), sunset2 = color(255, 80, 50);
  
  const oneHour = 60; 
  
  if (timeNow < state.sunriseTime - oneHour || timeNow > state.sunsetTime + oneHour) {
    c1 = night1; c2 = night2;
  } else if (timeNow >= state.sunriseTime - oneHour && timeNow <= state.sunriseTime + oneHour) {
    let amt = map(timeNow, state.sunriseTime - oneHour, state.sunriseTime + oneHour, 0, 1);
    c1 = lerpColor(night1, sunrise1, amt);
    c2 = lerpColor(night2, sunrise2, amt);
  } else if (timeNow > state.sunriseTime + oneHour && timeNow < state.sunsetTime - oneHour) {
    let amt = map(timeNow, state.sunriseTime + oneHour, state.sunriseTime + oneHour * 3, 0, 1);
    c1 = lerpColor(sunrise1, day1, constrain(amt, 0, 1));
    c2 = lerpColor(sunrise2, day2, constrain(amt, 0, 1));
  } else if (timeNow >= state.sunsetTime - oneHour && timeNow <= state.sunsetTime + oneHour) {
    let amt = map(timeNow, state.sunsetTime - oneHour, state.sunsetTime + oneHour, 0, 1);
    c1 = lerpColor(day1, sunset1, amt);
    c2 = lerpColor(day2, sunset2, amt);
  }
  return { top: c1, bottom: c2 };
}

function draw3DBackground() {
  const colors = getGradientColors();
  push();
  translate(0, 0, -800);
  noStroke();
  beginShape();
  fill(colors.top);
  vertex(-width, -height);
  vertex(width, -height);
  fill(colors.bottom);
  vertex(width, height);
  vertex(-width, height);
  endShape(CLOSE);
  pop();
}

// ============================================================================
// 6. GESTION DES ÉVÉNEMENTS NAVIGATEUR
// ============================================================================

let clickStartTime = 0;

function mousePressed() {
  userStartAudio(); 
  clickStartTime = millis(); 
}

function mouseReleased() {
  // Ouvre le lien uniquement si le clic était rapide (différent d'un drag orbitControl)
  if (millis() - clickStartTime < 300) {
    if (state.hoveredRepo && state.hoveredRepo.html_url) {
      window.open(state.hoveredRepo.html_url, '_blank');
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if(domElements.uiText) domElements.uiText.position(20, windowHeight - 40); 
}