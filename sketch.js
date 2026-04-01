// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  GITHUB_USERNAME: "celico7", // pseudo github ici
  BASE_RADIUS_MIN: 80,
  BASE_RADIUS_MAX: 200,
  AUDIO_PULSE_MAX: 150,
  ROTATION_SPEED_MIN: 0.2,
  ROTATION_SPEED_MAX: 3.0,
  FOREST_RADIUS: 300,
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

// ============================================================================
// VARIABLES D'ÉTAT GLOBALES
// ============================================================================

let state = {
  weatherData: null,
  temperature: 15, // Valeur par défaut pour éviter l'écran noir
  windSpeed: 5,
  sunriseTime: 360, // 6h00 par défaut
  sunsetTime: 1200, // 20h00 par défaut
  githubRepos: [],
  currentCity: "Strasbourg",
  hoveredRepo: null,
  angle: 0,
  volume: 0,
};

let domElements = {
  citySelect: null,
  uiText: null,
  tooltipDiv: null,
};

let mic;

// ============================================================================
// 1. CYCLE DE VIE P5.JS
// ============================================================================

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(DEGREES);
  colorMode(RGB, 255, 255, 255, 1);

  mic = new p5.AudioIn();
  mic.start();

  setupUI();

  fetchWeather(state.currentCity);
  fetchGitHub();
}

function draw() {
  background(0);
  
  draw3DBackground();
  updateAudioAndAngle();
  setupLighting();
  
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
  const url = `https://api.github.com/users/${CONFIG.GITHUB_USERNAME}/repos?sort=updated&per_page=8`;
  
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (Array.isArray(data)) {
        state.githubRepos = data;
      } else {
        console.error("Erreur GitHub (Pseudo introuvable ?) :", data);
      }
    })
    .catch(err => console.error("Erreur réseau GitHub:", err));
}

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

function updateUI() {
  let cityTimeStr = "--h--";
  if (state.weatherData && state.weatherData.utc_offset_seconds !== undefined) {
    let cityTimeObj = new Date(Date.now() + (state.weatherData.utc_offset_seconds * 1000));
    cityTimeStr = cityTimeObj.getUTCHours().toString().padStart(2, '0') + "h" + cityTimeObj.getUTCMinutes().toString().padStart(2, '0');
  }

  const act = mic.getLevel() > 0.01 ? "Actif" : "Attente";
  domElements.uiText.html(`📍 ${state.currentCity} | Heure: ${cityTimeStr} | Temp: ${state.temperature}°C | Vent: ${state.windSpeed}km/h | Son: ${act}`);

  if (state.hoveredRepo) {
    domElements.tooltipDiv.html(`
      <strong>${state.hoveredRepo.name}</strong><br>
      <em>${state.hoveredRepo.desc}</em><br>
      Taille: ${state.hoveredRepo.size} KB<br>
      ${state.hoveredRepo.isRecent ? "🟢 Récent (< 2j)" : "⚪ Ancien (> 2j)"}
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

function updateAudioAndAngle() {
  const rawVolume = mic.getLevel();
  state.volume = lerp(state.volume, rawVolume, 0.1); 
  const rotationSpeed = map(state.windSpeed, 0, 50, CONFIG.ROTATION_SPEED_MIN, CONFIG.ROTATION_SPEED_MAX); 
  state.angle += rotationSpeed;
}

function setupLighting() {
  ambientLight(180);
  directionalLight(255, 255, 255, 0.5, 0.5, -1);
}

function drawCentralObject() {
  const warmColor = color(255, 50, 50);
  const coldColor = color(50, 150, 255);
  
  const tempAmt = constrain(map(state.temperature, -5, 35, 0, 1), 0, 1);
  const objColor = lerpColor(coldColor, warmColor, tempAmt);
  
  const baseRadius = map(state.temperature, -5, 35, CONFIG.BASE_RADIUS_MIN, CONFIG.BASE_RADIUS_MAX); 
  const audioPulse = map(state.volume, 0, 0.15, 0, CONFIG.AUDIO_PULSE_MAX); 
  const finalSize = baseRadius + audioPulse;

  push();
  rotateX(state.angle * 0.5);
  rotateY(state.angle);
  
  fill(objColor);
  stroke(255, 255, 255, 0.3); 
  strokeWeight(1);
  box(finalSize); 
  pop();
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

    // L'arbre est-il le plus proche et face à nous ? (gz > 0 signifie qu'il est "devant")
    // On calcule la distance en 2D classique
    let isHover = false;
    if (dist(mouseX, mouseY, sx, syFlower) < 40 * perspective || dist(mouseX, mouseY, sx, syTrunk) < (h / 2 * perspective + 20)) {
        isHover = true;
    }

    const pushDate = new Date(repo.pushed_at);
    const diffDays = Math.abs(new Date() - pushDate) / (1000 * 60 * 60 * 24);
    const isRecent = diffDays < 2;

    if (isHover) {
      currentHover = {
        name: repo.name,
        size: repo.size,
        isRecent: isRecent,
        desc: repo.description || "Aucune description"
      };
    }
    
    // Dessin Tronc
    push();
    translate(0, -h / 2, 0);
    if (isHover) {
      fill(150, 255, 150, 0.9);
      strokeWeight(2);
    } else {
      fill(100, 255, 100, 0.5);
      strokeWeight(1);
    }
    stroke(255);
    box(20, h, 20);
    pop();
    
    // Dessin Fleur
    push();
    translate(0, -h, 0);
    noStroke();
    
    if (isRecent) {
      fill(255, 20, 147);
      sphere(isHover ? 30 : 15);
    } else {
      fill(0, 150, 0);
      sphere(isHover ? 15 : 5);
    }
    pop(); 
    pop(); 
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

function mousePressed() {
  userStartAudio(); 
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if(domElements.uiText) domElements.uiText.position(20, windowHeight - 40); 
}