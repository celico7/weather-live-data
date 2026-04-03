export type Language = 'fr' | 'en';

export const TRANSLATIONS = {
  fr: {
    subtitle: "Météo • Audio • GitHub • Procédural",
    point1: "Un écosystème 3D interactif qui réagit au son detecté.",
    point2: "Synchronisé en temps réel avec la météo de la ville choisie (heure, pluie...).",
    point3: "Explorez n'importe quel profil GitHub sous forme de forêt (par défaut : celico7).",
    initBtn: "Initialiser l'écosystème",
    repoLanguage: "Langage",
    repoSize: "Taille",
    viewRepo: "Voir le dépôt",
    backHome: "Retour à l'accueil",
    loading: "Chargement...",
    weather: { clear: "Ciel dégagé", cloudy: "Nuageux", fog: "Brumeux", drizzle: "Bruine", rain: "Pluie", snow: "Neige", storm: "Orage" },
    countries: { "France": "France", "Japon": "Japon", "Islande": "Islande", "Île Maurice": "Île Maurice", "États-Unis": "États-Unis" },
    spectrumTitle: "Analyse Spectrale",
    settings: {
      title: "Personnalisation",
      avatar: "Avatar",
      upload: "Upload",
      theme: "Thème Couleur"
    },
    addCity: {
      title: "Ajouter une ville",
      search: "Rechercher une ville...",
      searching: "Recherche en cours...",
      notFound: "Aucune ville trouvée."
    }
  },
  en: {
    subtitle: "Weather • Audio • GitHub • Procedural",
    point1: "An interactive 3D ecosystem that reacts to detected audio.",
    point2: "Synchronized in real-time with the chosen city's weather (time, rain...).",
    point3: "Explore any GitHub profile as a forest (default: celico7).",
    initBtn: "Initialize Ecosystem",
    repoLanguage: "Language",
    repoSize: "Size",
    viewRepo: "View Repository",
    backHome: "Back to home",
    loading: "Loading...",
    weather: { clear: "Clear sky", cloudy: "Cloudy", fog: "Foggy", drizzle: "Drizzle", rain: "Rain", snow: "Snow", storm: "Thunderstorm" },
    countries: { "France": "France", "Japon": "Japan", "Islande": "Iceland", "Île Maurice": "Mauritius", "États-Unis": "United States" },
    spectrumTitle: "Audio Spectrum",
    settings: {
      title: "Configuration",
      avatar: "Avatar",
      upload: "Upload",
      theme: "Theme Color"
    },
    addCity: {
      title: "Add a city",
      search: "Search for a city...",
      searching: "Searching...",
      notFound: "No city found."
    }
  }
};

export const CITIES_DATA: Record<string, { lat: number, lon: number, timezone: string, country: string }> = {
  "Strasbourg": { lat: 48.57, lon: 7.75, timezone: "Europe/Paris", country: "France" },
  "Oberhoffen-sur-Moder": { lat: 48.78, lon: 7.86, timezone: "Europe/Paris", country: "France" },
  "Paris": { lat: 48.85, lon: 2.35, timezone: "Europe/Paris", country: "France" },
  "Tokyo": { lat: 35.67, lon: 139.65, timezone: "Asia/Tokyo", country: "Japon" },
  "Reykjavik": { lat: 64.14, lon: -21.89, timezone: "Atlantic/Reykjavik", country: "Islande" },
  "Port-Louis": { lat: -20.16, lon: 57.50, timezone: "Indian/Mauritius", country: "Île Maurice" },
  "Los Angeles": { lat: 34.05, lon: -118.25, timezone: "America/Los_Angeles", country: "États-Unis" },
};

export const CITIES = Object.entries(CITIES_DATA).map(([name, coords]) => ({ name, ...coords }));

export const LANG_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Rust: '#dea584',
  Go: '#00ADD8',
  default: '#ffffff'
};

export const FOREST_RADIUS = 500;
