let weatherData, mic;
let temperature = 0, windSpeed = 0;
let angle = 0, volume = 0;
let sunriseTime, sunsetTime;

// Ville longiture + latitude open-meteo.com
const cities = {
  "Strasbourg": { lat: 48.57, lon: 7.75 },
  "Oberhoffen-sur-Moder": { lat: 48.78, lon: 7.86 },
  "Paris": { lat: 48.85, lon: 2.35 },
  "Tokyo": { lat: 35.67, lon: 139.65 },
  "Reykjavik": { lat: 64.14, lon: -21.89 },
  "Port Louis": { lat: -20.16, lon: 57.50 }, 
  "Los Angeles": { lat: 34.05, lon: -118.25 }
};

let currentCity = "Strasbourg";
let citySelect;
let uiText; 

function preload() {
  fetchWeather(currentCity);
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(DEGREES);
  colorMode(RGB, 255, 255, 255, 1);
  
  mic = new p5.AudioIn();
  mic.start();
  
  // Menu déroulant
  citySelect = createSelect();
  citySelect.position(20, 20);
  citySelect.style('background-color', 'rgba(20, 20, 30, 0.8)');
  citySelect.style('color', '#fff');
  citySelect.style('border', '1px solid #555');
  citySelect.style('padding', '8px');
  citySelect.style('border-radius', '4px');
  citySelect.style('font-family', 'sans-serif');
  
  for (let city in cities) {
    citySelect.option(city);
  }
  citySelect.changed(changeCity);

  uiText = createDiv('');
  uiText.position(20, windowHeight - 40);
  uiText.style('color', 'white');
  uiText.style('font-family', 'sans-serif');
  uiText.style('font-size', '16px');
  uiText.style('text-shadow', '1px 1px 2px black');
}

function changeCity() {
  currentCity = citySelect.value();
  fetchWeather(currentCity);
}

function fetchWeather(cityName) {
  let lat = cities[cityName].lat;
  let lon = cities[cityName].lon;
  let url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=sunrise,sunset&timezone=auto`;
  loadJSON(url, gotWeatherData);
}

function gotWeatherData(data) {
  weatherData = data;
  if (weatherData && weatherData.current_weather) {
    temperature = weatherData.current_weather.temperature;
    windSpeed = weatherData.current_weather.windspeed;
    
    // Extraire l'heure et la minute de la chaîne et les convertir en "minutes depuis minuit" locales de la ville.
    let srStr = weatherData.daily.sunrise[0];
    let ssStr = weatherData.daily.sunset[0];
    sunriseTime = parseInt(srStr.substring(11, 13)) * 60 + parseInt(srStr.substring(14, 16));
    sunsetTime = parseInt(ssStr.substring(11, 13)) * 60 + parseInt(ssStr.substring(14, 16));
  }
}

// Calcule les couleurs du ciel selon l'heure
function getGradientColors() {
  if (!weatherData) return { top: color(10, 15, 30), bottom: color(2, 5, 15) };
  
  // Heure actuelle en UTC + offset de la ville
  let cityTime = new Date(Date.now() + (weatherData.utc_offset_seconds * 1000));
  // Convertie en minutes depuis minuit
  let timeNow = cityTime.getUTCHours() * 60 + cityTime.getUTCMinutes();
  
  let timeSunrise = sunriseTime;
  let timeSunset = sunsetTime;
  
  let c1, c2;
  let night1 = color(10, 15, 30), night2 = color(2, 5, 15);
  let sunrise1 = color(255, 120, 80), sunrise2 = color(50, 40, 80);
  let day1 = color(100, 180, 255), day2 = color(240, 250, 255);
  let sunset1 = color(40, 20, 60), sunset2 = color(255, 80, 50);
  let oneHour = 60; 
  
  if (timeNow < timeSunrise - oneHour || timeNow > timeSunset + oneHour) {
    c1 = night1; c2 = night2;
  } else if (timeNow >= timeSunrise - oneHour && timeNow <= timeSunrise + oneHour) {
    let amt = map(timeNow, timeSunrise - oneHour, timeSunrise + oneHour, 0, 1);
    c1 = lerpColor(night1, sunrise1, amt);
    c2 = lerpColor(night2, sunrise2, amt);
  } else if (timeNow > timeSunrise + oneHour && timeNow < timeSunset - oneHour) {
    let amt = map(timeNow, timeSunrise + oneHour, timeSunrise + oneHour * 3, 0, 1);
    c1 = lerpColor(sunrise1, day1, constrain(amt, 0, 1));
    c2 = lerpColor(sunrise2, day2, constrain(amt, 0, 1));
  } else if (timeNow >= timeSunset - oneHour && timeNow <= timeSunset + oneHour) {
    let amt = map(timeNow, timeSunset - oneHour, timeSunset + oneHour, 0, 1);
    c1 = lerpColor(day1, sunset1, amt);
    c2 = lerpColor(day2, sunset2, amt);
  }
  return { top: c1, bottom: c2 };
}

// Dessine un mur au fond de la scène 3D pour faire le ciel
function draw3DBackground() {
  let colors = getGradientColors();
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

function draw() {
  background(0);
  draw3DBackground();
  
  // son
  let rawVolume = mic.getLevel(); 
  
  volume = lerp(volume, rawVolume, 0.1); 

  // LUMIÈRES
  ambientLight(180);
  directionalLight(255, 255, 255, 0.5, 0.5, -1);
  
  // COULEURS TEMPERATURE
  let warmColor = color(255, 50, 50);
  let coldColor = color(50, 150, 255);
  let tempAmt = constrain(map(temperature, -5, 35, 0, 1), 0, 1);
  let objColor = lerpColor(coldColor, warmColor, tempAmt);
  
  // ANIMATION
  let rotationSpeed = map(windSpeed, 0, 50, 0.2, 3); 
  angle += rotationSpeed;
  
  // TAILLES 
  let baseRadius = map(temperature, -5, 35, 80, 200); 
  // La pulsation réagit maintenant très fort au moindre bruit !
  let audioPulse = map(volume, 0, 0.15, 0, 150); 
  
  // OBJET
  push();
  rotateX(angle * 0.5);
  rotateY(angle);
  
  fill(objColor);

  stroke(255, 255, 255, 0.3); 
  strokeWeight(1);
  
  // FORME :
  let finalSize = baseRadius + audioPulse;
  box(finalSize, finalSize, finalSize); 
  
  pop();

  // Mise à jour du texte UI avec l'heure locale exacte
  let cityTimeStr = "--h--";
  if (weatherData) {
    let cityTimeObj = new Date(Date.now() + (weatherData.utc_offset_seconds * 1000));
    cityTimeStr = cityTimeObj.getUTCHours().toString().padStart(2, '0') + "h" + cityTimeObj.getUTCMinutes().toString().padStart(2, '0');
  }

  uiText.html(`📍 ${currentCity} | Heure locale: ${cityTimeStr} | Temp: ${temperature}°C | Vent: ${windSpeed}km/h | Son: ${mic.getLevel() > 0.01 ? "Actif 🎤" : "Attente"}`);
}

function mousePressed() {
  userStartAudio(); 
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  uiText.position(20, windowHeight - 40); 
}