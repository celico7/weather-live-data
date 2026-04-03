import React, { useEffect, useRef, useState } from 'react';
import { Settings, Plus, Upload, User, X, Search, Home, Github } from 'lucide-react';

// --- CONFIG & CITIES_DATA ---
const CITIES_DATA: Record<string, { lat: number, lon: number, timezone: string, country: string }> = {
  "Strasbourg": { lat: 48.57, lon: 7.75, timezone: "Europe/Paris", country: "France" },
  "Oberhoffen-sur-Moder": { lat: 48.78, lon: 7.86, timezone: "Europe/Paris", country: "France" },
  "Paris": { lat: 48.85, lon: 2.35, timezone: "Europe/Paris", country: "France" },
  "Tokyo": { lat: 35.67, lon: 139.65, timezone: "Asia/Tokyo", country: "Japon" },
  "Reykjavik": { lat: 64.14, lon: -21.89, timezone: "Atlantic/Reykjavik", country: "Islande" },
  "Port-Louis": { lat: -20.16, lon: 57.50, timezone: "Indian/Mauritius", country: "Île Maurice" },
  "Los Angeles": { lat: 34.05, lon: -118.25, timezone: "America/Los_Angeles", country: "États-Unis" },
};

const CITIES = Object.entries(CITIES_DATA).map(([name, coords]) => ({ name, ...coords }));

const LANG_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Rust: '#dea584',
  Go: '#00ADD8',
  default: '#ffffff'
};

const FOREST_RADIUS = 500;

let globalMic: any = null;
let globalFft: any = null;

export const DigitalEcosystem: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cities, setCities] = useState(() => {
    const saved = localStorage.getItem('ecosystem_cities');
    return saved ? JSON.parse(saved) : CITIES;
  });
  const [cityIndex, setCityIndex] = useState(0);
  const [weatherDisplay, setWeatherDisplay] = useState({ temp: "--", desc: "Chargement...", time: "--:--" });
  const [isStarted, setIsStarted] = useState(false);
  const [spectrum, setSpectrum] = useState<number[]>(new Array(12).fill(0));
  const [hoveredRepoData, setHoveredRepoData] = useState<any>(null);
  const [bgGradient, setBgGradient] = useState('from-[#1A1A1A] via-black to-theme-primary/20');
  
  // Personalization State
  const [themeColor, setThemeColor] = useState(() => {
    return localStorage.getItem('ecosystem_theme') || '#A4133C';
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
    return localStorage.getItem('ecosystem_avatar');
  });

  useEffect(() => {
    localStorage.setItem('ecosystem_cities', JSON.stringify(cities));
  }, [cities]);

  useEffect(() => {
    localStorage.setItem('ecosystem_theme', themeColor);
  }, [themeColor]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddCityOpen, setIsAddCityOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const stateRef = useRef({
    weather: { temp: 15, wind: 5, code: 0, isDay: true, desc: "Clair", hour: 12 },
    audio: { bass: 0, treble: 0, level: 0, smoothedBass: 0 },
    repos: [] as any[],
    hoveredRepo: -1,
    particles: [] as any[],
    rotation: { x: 0, y: 0 },
    clickStartTime: 0
  });

  const getWeatherDescription = (code: number) => {
    if (code === 0) return "Ciel dégagé";
    if (code < 4) return "Nuageux";
    if (code < 50) return "Brumeux";
    if (code < 60) return "Bruine";
    if (code < 70) return "Pluie";
    if (code < 80) return "Neige";
    return "Orage";
  };

  useEffect(() => {
    if (!isStarted) return;
    
    const fetchWeather = async (city: any) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code,wind_speed_10m,is_day&timezone=${encodeURIComponent(city.timezone)}`);
        const data = await res.json();
        const desc = getWeatherDescription(data.current?.weather_code ?? 0);
        
        const now = new Date();
        // Get local hour for the specific city's timezone
        const hourFormatter = new Intl.DateTimeFormat('en-US', { timeZone: city.timezone, hour: 'numeric', hour12: false });
        const hour = parseInt(hourFormatter.format(now), 10) % 24;

        if (hour >= 6 && hour < 9) setBgGradient('from-orange-400/60 via-theme-primary/30 to-[#1A1A1A]');
        else if (hour >= 9 && hour < 17) setBgGradient('from-sky-400/60 via-blue-900/30 to-[#1A1A1A]');
        else if (hour >= 17 && hour < 20) setBgGradient('from-theme-primary/60 via-purple-900/30 to-[#1A1A1A]');
        else setBgGradient('from-[#1A1A1A] via-black to-black');

        stateRef.current.weather = {
          temp: data.current?.temperature_2m ?? 15,
          wind: data.current?.wind_speed_10m ?? 5,
          code: data.current?.weather_code ?? 0,
          isDay: data.current?.is_day === 1,
          desc: desc,
          hour: hour
        };
        
        const timeStr = now.toLocaleTimeString('fr-FR', { timeZone: city.timezone, hour: '2-digit', minute: '2-digit' });
        setWeatherDisplay({ 
          temp: `${stateRef.current.weather.temp}°C`, 
          desc: desc, 
          time: timeStr 
        });
      } catch (e) {
        console.error("Weather error", e);
      }
    };

    if (cities[cityIndex]) {
      fetchWeather(cities[cityIndex]);
    }
  }, [cityIndex, isStarted, cities]);

  const handleStart = async () => {
    try {
      const getAudioContext = (window as any).getAudioContext || ((window as any).p5 && (window as any).p5.prototype.getAudioContext);
      if (getAudioContext) {
        const ctx = getAudioContext();
        if (ctx && ctx.state === 'suspended') {
          await ctx.resume();
        }
      }
    } catch (e) {
      console.warn("Audio initialization failed", e);
    }
    setIsStarted(true);
  };

  const searchCities = async (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=fr&format=json`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const addCity = (cityData: any) => {
    const newCity = {
      name: cityData.name,
      lat: cityData.latitude,
      lon: cityData.longitude,
      timezone: cityData.timezone || "UTC",
      country: cityData.country || "Unknown"
    };
    setCities(prev => [...prev, newCity]);
    setCityIndex(cities.length); // Select the new city
    setIsAddCityOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeCity = (indexToRemove: number) => {
    if (cities.length <= 1) return;
    setCities(prev => prev.filter((_, i) => i !== indexToRemove));
    if (cityIndex >= indexToRemove && cityIndex > 0) {
      setCityIndex(prev => prev - 1);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarUrl(base64String);
        localStorage.setItem('ecosystem_avatar', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!containerRef.current || !isStarted) return;

    const state = stateRef.current;

    let myP5: any;

    const sketch = (p: any) => {
      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL).parent(containerRef.current!);
        
        // Initialize global audio inside the p5 sketch to ensure AudioWorklet scope is valid
        try {
          if (!globalMic) {
            // Wait a tiny bit for the AudioContext to be fully active before creating worklets
            setTimeout(() => {
              try {
                if (!globalMic) {
                  globalMic = new (window as any).p5.AudioIn();
                  globalMic.start(
                    () => console.log("Microphone access granted & started"),
                    (err: any) => console.error("Microphone access denied:", err)
                  );
                  globalFft = new (window as any).p5.FFT(0.8, 64);
                  globalFft.setInput(globalMic);
                }
              } catch(e) {
                console.error("Audio init delayed error", e);
              }
            }, 100);
          }
        } catch (err) {
          console.error("Audio init error", err);
        }

        for (let i = 0; i < 300; i++) {
          if (state.particles.length < 300) {
            state.particles.push({
              x: p.random(-1500, 1500),
              y: p.random(-1500, 1500),
              z: p.random(-1500, 1500),
              speed: p.random(2, 12)
            });
          }
        }

        if (state.repos.length === 0) {
          fetchGitHub('celico7');
        }
      };

      const fetchGitHub = async (user: string) => {
        try {
          const res = await fetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=10`);
          if (res.status === 403) throw new Error("Rate limit");
          const data = await res.json();
          if (!Array.isArray(data)) throw new Error("Not an array");
          state.repos = data.map((r: any, i: number) => ({
            name: r.name || 'Unknown',
            size: r.size || 1000,
            lang: r.language || 'default',
            url: r.html_url || '#',
            angle: (i / data.length) * p.TWO_PI,
            scale: 1.0,
            targetScale: 1.0
          }));
        } catch (e) {
          state.repos = Array.from({ length: 10 }, (_, i) => ({
            name: `Project ${i}`,
            size: p.random(500, 8000),
            lang: Object.keys(LANG_COLORS)[p.floor(p.random(Object.keys(LANG_COLORS).length))],
            angle: (i / 10) * p.TWO_PI,
            scale: 1.0,
            targetScale: 1.0,
            url: "#"
          }));
        }
      };

      p.draw = () => {
        p.clear(); // Transparent canvas to show CSS gradient background
        p.orbitControl(2, 2, 0.5); // Enable smooth zoom and pan

        try {
          if (globalFft && globalMic) {
            const spectrumData = globalFft.analyze();
            const b = globalFft.getEnergy("bass");
            const t = globalFft.getEnergy("treble");
            const l = globalMic.getLevel();

            // Reduce sensitivity by applying a small threshold and scaling
            let rawBass = (typeof b === 'number' && !isNaN(b) ? b : 0) / 255;
            rawBass = Math.max(0, rawBass - 0.2) * 1.25; 
            
            state.audio.bass = rawBass;
            state.audio.treble = (typeof t === 'number' && !isNaN(t) ? t : 0) / 255;
            state.audio.level = (typeof l === 'number' && !isNaN(l) ? l : 0);
            
            // Smooth the bass for fluid pulsing (lower lerp factor = more fluid)
            state.audio.smoothedBass = p.lerp(state.audio.smoothedBass, state.audio.bass, 0.05);

            // Update UI spectrum every 5 frames for performance
            if (p.frameCount % 5 === 0) {
              const simplified = [];
              for(let i=0; i<12; i++) {
                const val = spectrumData[i*2];
                simplified.push((typeof val === 'number' && !isNaN(val) ? val : 0) / 255);
              }
              setSpectrum(simplified);
            }
          }
        } catch (err) {
          // Ignore audio errors to prevent black screen
        }

        drawWeatherParticles(p);
        drawCentralObject(p);
        
        let hoveredIndex = -1;
        let minD = 150; // Increased max distance to trigger hover for easier selection
        state.repos.forEach((repo, i) => {
          const x = p.cos(repo.angle) * FOREST_RADIUS;
          const z = p.sin(repo.angle) * FOREST_RADIUS;
          const trunkHeight = p.map(repo.size, 0, 10000, 40, 180, true);
          const y = -trunkHeight / 2; // Project the center of the tree instead of the base
          
          const pos2D = project(p, x, y, z);
          const d = p.dist(p.mouseX, p.mouseY, pos2D.x + p.width/2, pos2D.y + p.height/2);
          if (d < minD) {
            minD = d;
            hoveredIndex = i;
          }
        });
        
        if (state.hoveredRepo !== hoveredIndex) {
          state.hoveredRepo = hoveredIndex;
          if (hoveredIndex !== -1) {
            setHoveredRepoData(state.repos[hoveredIndex]);
          } else {
            setHoveredRepoData(null);
          }
        }

        drawGitHubForest(p, hoveredIndex);
      };

      const drawWeatherParticles = (p: any) => {
        // Only draw if weather code indicates precipitation
        // 51-67: Rain/Drizzle, 71-86: Snow
        const isRaining = state.weather.code >= 51 && state.weather.code <= 67;
        const isSnowing = state.weather.code >= 71 && state.weather.code <= 86;
        
        if (!isRaining && !isSnowing && state.weather.code < 90) return;

        p.push();
        if (isSnowing) p.stroke(220, 230, 255); 
        else p.stroke(150, 180, 255, 180); 

        p.strokeWeight(isSnowing ? 4 : 1.5);
        
        state.particles.forEach(pt => {
          pt.y += pt.speed + state.weather.wind * 0.2; 
          if (pt.y > 1000) pt.y = -1000;
          p.point(pt.x, pt.y, pt.z);
        });
        p.pop();
      };

      const drawCentralObject = (p: any) => {
        p.push();
        const cold = p.color(100, 200, 255);
        const hot = p.color(255, 100, 50);
        const tempCol = p.lerpColor(cold, hot, p.map(state.weather.temp, 0, 35, 0, 1));
        
        p.fill(tempCol);
        p.stroke(255, 150);
        p.strokeWeight(1);
        
        p.rotateX(p.frameCount * 0.01);
        p.rotateY(p.frameCount * 0.015);
        
        // PULSE fluide avec le son
        const pulse = 1.0 + state.audio.smoothedBass * 0.35; // Reduced multiplier for less extreme pulsing
        p.scale(pulse);
        
        p.box(100);
        p.fill(255, 50);
        p.sphere(70 + state.audio.treble * 60);
        p.pop();
      };

      const drawGitHubForest = (p: any, hoveredIndex: number) => {
        state.repos.forEach((repo, i) => {
          const x = p.cos(repo.angle) * FOREST_RADIUS;
          const z = p.sin(repo.angle) * FOREST_RADIUS;
          const y = 0;

          if (i === hoveredIndex) {
            repo.targetScale = 2.5;
          } else {
            repo.targetScale = hoveredIndex !== -1 ? 0.4 : 1.0;
          }

          repo.scale = p.lerp(repo.scale, repo.targetScale, 0.1);

          p.push();
          p.translate(x, y, z);
          
          const col = p.color(LANG_COLORS[repo.lang] || LANG_COLORS.default);
          let currentStrokeCol = col;
          
          if (i === hoveredIndex) {
            p.emissiveMaterial(col);
            p.fill(col);
          } else {
            const dimCol = p.lerpColor(col, p.color(0), hoveredIndex !== -1 ? 0.7 : 0);
            p.ambientMaterial(dimCol);
            p.fill(dimCol);
            currentStrokeCol = dimCol;
          }

          p.scale(repo.scale);
          
          const trunkHeight = p.map(repo.size, 0, 10000, 40, 180, true);
          const complexity = p.floor(p.map(repo.size, 0, 10000, 2, 5, true));
          
          p.stroke(currentStrokeCol); // Ensure lines are visible
          recursiveBranch(p, trunkHeight, 0, complexity);
          p.noStroke(); // Reset stroke
          
          p.pop();
        });
      };

      const recursiveBranch = (p: any, len: number, depth: number, maxDepth: number) => {
        // Audio reactivity for the trees
        const audioPulse = 1.0 + state.audio.bass * 0.3;
        const dynamicLen = depth === 0 ? len * audioPulse : len;

        p.strokeWeight(p.map(depth, 0, maxDepth, 4, 0.5));
        p.line(0, 0, 0, 0, -dynamicLen, 0);
        p.translate(0, -dynamicLen, 0);

        if (depth < maxDepth) {
          const n = 2;
          for (let i = 0; i < n; i++) {
            p.push();
            const windEff = p.sin(p.frameCount * 0.03 + depth) * (state.weather.wind * 0.01);
            // Branches react to treble
            const audioEff = state.audio.treble * 0.3 * (i === 0 ? 1 : -1);
            
            p.rotateZ(0.4 * (i === 0 ? 1 : -1) + windEff + audioEff);
            p.rotateY(p.frameCount * 0.01 + state.audio.level * 0.5);
            recursiveBranch(p, len * 0.75, depth + 1, maxDepth);
            p.pop();
          }
        }
      };

      const project = (p: any, x: number, y: number, z: number) => {
        const renderer = p._renderer;
        const mvMatrix = renderer.uMVMatrix;
        const pMatrix = renderer.uPMatrix;

        let cx = x * mvMatrix.mat4[0] + y * mvMatrix.mat4[4] + z * mvMatrix.mat4[8] + mvMatrix.mat4[12];
        let cy = x * mvMatrix.mat4[1] + y * mvMatrix.mat4[5] + z * mvMatrix.mat4[9] + mvMatrix.mat4[13];
        let cz = x * mvMatrix.mat4[2] + y * mvMatrix.mat4[6] + z * mvMatrix.mat4[10] + mvMatrix.mat4[14];
        let cw = x * mvMatrix.mat4[3] + y * mvMatrix.mat4[7] + z * mvMatrix.mat4[11] + mvMatrix.mat4[15];

        let clipX = cx * pMatrix.mat4[0] + cy * pMatrix.mat4[4] + cz * pMatrix.mat4[8] + cw * pMatrix.mat4[12];
        let clipY = cx * pMatrix.mat4[1] + cy * pMatrix.mat4[5] + cz * pMatrix.mat4[9] + cw * pMatrix.mat4[13];
        let clipW = cx * pMatrix.mat4[3] + cy * pMatrix.mat4[7] + cz * pMatrix.mat4[11] + cw * pMatrix.mat4[15];

        if (clipW === 0) return { x: 0, y: 0 };
        return {
          x: (clipX / clipW) * (p.width / 2),
          y: (clipY / clipW) * (p.height / 2)
        };
      };

      p.mousePressed = (e?: any) => {
        if (e && e.target && (e.target as HTMLElement).tagName !== 'CANVAS') return;
        state.clickStartTime = p.millis();
        
        try {
          const getAudioContext = (window as any).getAudioContext || ((window as any).p5 && (window as any).p5.prototype.getAudioContext);
          if (getAudioContext) {
            const ctx = getAudioContext();
            if (ctx && ctx.state === 'suspended') {
              ctx.resume();
            }
          }
        } catch(err) {
          // ignore
        }
      };

      p.mouseReleased = (e?: any) => {
        if (e && e.target && (e.target as HTMLElement).tagName !== 'CANVAS') return;
        if (p.millis() - state.clickStartTime < 250) {
          if (state.hoveredRepo !== -1) {
            const url = state.repos[state.hoveredRepo].url;
            if (url && url !== "#") window.open(url, '_blank');
          }
        }
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };
    };

    myP5 = new (window as any).p5(sketch);

    return () => {
      myP5.remove();
    };
  }, [isStarted]); // Removed cityIndex from dependencies

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isStarted) {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 30;
      const y = (clientY / window.innerHeight - 0.5) * 30;
      setMousePos({ x, y });
    }
  };

  return (
    <div 
      className={`relative w-full h-screen overflow-hidden font-sans selection:bg-theme-primary selection:text-white bg-gradient-to-br ${bgGradient} transition-colors duration-1000`}
      style={{ '--theme-primary': themeColor } as React.CSSProperties}
      onMouseMove={handleMouseMove}
    >
      {!isStarted && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#1A1A1A]/90 backdrop-blur-md text-white text-center p-8 overflow-hidden">
          {/* Animated background gradient */}
          <div 
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-theme-primary/20 via-[#1A1A1A] to-black pointer-events-none opacity-80 transition-transform duration-100 ease-out"
            style={{ transform: `translate(${mousePos.x * -2}px, ${mousePos.y * -2}px) scale(1.1)` }}
          />
          
          <div 
            className="relative z-10 mb-16 space-y-6 transition-transform duration-100 ease-out"
            style={{ transform: `perspective(1000px) rotateX(${-mousePos.y}deg) rotateY(${mousePos.x}deg) translateZ(20px)` }}
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-[0.3em] uppercase animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Digital <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-theme-primary to-red-500">Ecosystem</span>
            </h1>
            <p className="text-[10px] md:text-xs font-bold tracking-[0.8em] uppercase text-theme-primary/70 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
              Weather • Audio • GitHub • Procedural
            </p>
            <ul className="text-left text-xs md:text-sm text-white/70 tracking-wider space-y-3 max-w-lg mx-auto !mt-12 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-[400ms]">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-theme-primary shadow-[0_0_8px_var(--theme-primary)]" />
                Un écosystème 3D interactif qui réagit au son detecté.
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-theme-primary shadow-[0_0_8px_var(--theme-primary)]" />
                Synchronisé en temps réel avec la météo de la ville choisie (heure, pluie...).
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-theme-primary shadow-[0_0_8px_var(--theme-primary)]" />
                Explorez n'importe quel profil GitHub sous forme de forêt procédurale (par défaut : celico7).
              </li>
            </ul>
          </div>
          
          <button
            onClick={handleStart}
            className="group relative px-12 py-5 overflow-hidden rounded-full border border-theme-primary/30 bg-[#1A1A1A] hover:bg-theme-primary/20 hover:border-theme-primary transition-all duration-500 animate-in fade-in zoom-in-95 duration-1000 delay-500"
            style={{ transform: `perspective(1000px) rotateX(${-mousePos.y * 0.5}deg) rotateY(${mousePos.x * 0.5}deg) translateZ(10px)` }}
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-theme-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10 text-xs tracking-[0.4em] uppercase font-bold text-white/90 group-hover:text-white">
              Initialiser l'écosystème
            </span>
          </button>

          {/* Credits */}
          <a
            href="https://github.com/celico7"
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-8 right-8 z-20 flex items-center gap-2 text-white/50 hover:text-theme-primary transition-colors duration-300 text-xs uppercase tracking-widest font-bold group animate-in fade-in duration-1000 delay-700"
          >
            <Github size={16} className="group-hover:scale-110 transition-transform" />
            <span>© 2026 celico7</span>
          </a>
        </div>
      )}

      <div ref={containerRef} className="w-full h-full cursor-crosshair" />
      
      {/* UI Overlay */}
      <div className="absolute top-12 left-12 z-10 pointer-events-none">
        <div className="bg-gradient-to-br from-[#1A1A1A]/90 to-[#1A1A1A]/40 backdrop-blur-md border border-theme-primary/30 p-6 rounded-2xl shadow-2xl">
          <div className="flex items-baseline gap-4 mb-2">
            <h2 className="text-5xl font-bold tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">{weatherDisplay.temp}</h2>
            <span className="text-xs font-bold tracking-[0.2em] text-theme-primary uppercase">{weatherDisplay.desc}</span>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <span className="text-xs font-mono font-bold tracking-widest">{weatherDisplay.time}</span>
            <div className="h-[1px] w-12 bg-gradient-to-r from-theme-primary/50 to-transparent" />
            <span className="text-[10px] tracking-[0.3em] uppercase opacity-60 font-normal">{cities[cityIndex]?.country}</span>
          </div>
        </div>
      </div>

      {/* Repo Details Panel */}
      <div className={`absolute top-12 right-12 z-10 w-80 transition-all duration-500 transform ${hoveredRepoData ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0 pointer-events-none'}`}>
        {hoveredRepoData && (
          <div className="bg-gradient-to-bl from-[#1A1A1A]/90 to-[#1A1A1A]/60 backdrop-blur-md border border-theme-primary/30 p-6 rounded-2xl shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: LANG_COLORS[hoveredRepoData.lang] || LANG_COLORS.default, color: LANG_COLORS[hoveredRepoData.lang] || LANG_COLORS.default }} />
              <h3 className="text-lg font-bold tracking-wider text-white truncate">{hoveredRepoData.name}</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/50 uppercase tracking-widest font-bold">Language</span>
                <span className="text-white/90 font-mono font-bold">{hoveredRepoData.lang}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/50 uppercase tracking-widest font-bold">Size</span>
                <span className="text-white/90 font-mono font-bold">{hoveredRepoData.size} KB</span>
              </div>
              <a href={hoveredRepoData.url} target="_blank" rel="noreferrer" className="mt-4 block w-full py-2 text-center text-[10px] uppercase tracking-[0.2em] text-white/80 font-bold bg-[#1A1A1A] hover:bg-theme-primary/40 rounded transition-colors border border-theme-primary/30 pointer-events-auto">
                View Repository
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Left Controls: Cities & Settings */}
      <div className="absolute bottom-12 left-12 z-10 flex flex-col gap-4">
        {/* Settings, Avatar & Home Button */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsStarted(false)}
            className="w-12 h-12 rounded-full bg-[#1A1A1A]/80 backdrop-blur-md border border-theme-primary/30 flex items-center justify-center text-white/80 hover:text-theme-primary hover:border-theme-primary transition-all duration-300 shadow-lg group"
            title="Retour à l'accueil"
          >
            <Home size={20} className="group-hover:scale-110 transition-transform" />
          </button>

          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-12 h-12 rounded-full bg-[#1A1A1A]/80 backdrop-blur-md border border-theme-primary/30 flex items-center justify-center text-white/80 hover:text-theme-primary hover:border-theme-primary transition-all duration-300 shadow-lg overflow-hidden"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={20} />
            )}
          </button>
        </div>

        {/* Cities List */}
        <div className="flex flex-wrap max-w-xl gap-2 items-center">
          {cities.map((city, idx) => (
            <div key={`${city.name}-${idx}`} className="relative group">
              <button
                onClick={() => setCityIndex(idx)}
                className={`px-4 py-2 text-[9px] uppercase tracking-[0.3em] rounded-full backdrop-blur-sm transition-all duration-300 font-normal transform active:scale-90 ${cities.length > 1 ? 'pr-8' : ''} ${
                  idx === cityIndex 
                    ? 'bg-theme-primary text-white border border-theme-primary shadow-[0_0_15px_var(--theme-primary)] scale-105' 
                    : 'bg-[#1A1A1A]/60 text-white/60 border border-white/10 hover:border-theme-primary/50 hover:text-white hover:bg-[#1A1A1A] hover:scale-105'
                }`}
              >
                {city.name}
              </button>
              {cities.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCity(idx);
                  }}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    idx === cityIndex ? 'text-white hover:bg-white/20' : 'text-white/40 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <X size={10} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => setIsAddCityOpen(true)}
            className="w-8 h-8 rounded-full bg-[#1A1A1A]/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-theme-primary/50 hover:bg-[#1A1A1A] transition-all duration-300"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="absolute bottom-12 right-12 z-10 text-right pointer-events-none">
        <div className="bg-gradient-to-tl from-[#1A1A1A]/90 to-[#1A1A1A]/40 backdrop-blur-md border border-theme-primary/30 p-4 rounded-xl">
          <div className="mb-3 text-theme-primary text-[9px] uppercase tracking-[0.4em] font-bold">Analyse Spectrale</div>
          <div className="flex justify-end gap-[3px] h-8 items-end">
            {spectrum.map((val, i) => (
              <div 
                key={i} 
                className="w-[3px] rounded-t-sm bg-gradient-to-t from-theme-primary to-white/50 transition-all duration-75" 
                style={{ height: `${Math.max(10, val * 100)}%`, opacity: 0.5 + val * 0.5 }} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div 
            className="bg-[#1A1A1A] border border-theme-primary/30 rounded-2xl p-8 w-full max-w-md shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setIsSettingsOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6 tracking-wider uppercase">Personnalisation</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold tracking-widest text-white/50 uppercase mb-3">Avatar</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-black border border-theme-primary/30 flex items-center justify-center overflow-hidden">
                    {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <User size={24} className="text-white/30" />}
                  </div>
                  <label className="cursor-pointer px-4 py-2 bg-theme-primary/20 text-theme-primary border border-theme-primary/50 rounded hover:bg-theme-primary hover:text-white transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <Upload size={14} />
                    Upload
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-white/50 uppercase mb-3">Thème Couleur</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { name: 'Crimson', color: '#A4133C' },
                    { name: 'Neon', color: '#00F0FF' },
                    { name: 'Emerald', color: '#10B981' },
                    { name: 'Amethyst', color: '#9D4EDD' },
                    { name: 'Amber', color: '#FFB703' }
                  ].map(theme => (
                    <button
                      key={theme.name}
                      onClick={() => setThemeColor(theme.color)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${themeColor === theme.color ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: theme.color }}
                      title={theme.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add City Modal */}
      {isAddCityOpen && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => { setIsAddCityOpen(false); setSearchQuery(''); setSearchResults([]); }}
        >
          <div 
            className="bg-[#1A1A1A] border border-theme-primary/30 rounded-2xl p-8 w-full max-w-md shadow-2xl relative flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => { setIsAddCityOpen(false); setSearchQuery(''); setSearchResults([]); }} className="absolute top-4 right-4 text-white/50 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6 tracking-wider uppercase">Ajouter une ville</h2>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input 
                type="text" 
                placeholder="Rechercher une ville..." 
                value={searchQuery}
                onChange={(e) => searchCities(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-theme-primary transition-colors"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {isSearching && <div className="text-center text-white/50 text-xs py-4">Recherche en cours...</div>}
              {!isSearching && searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => addCity(result)}
                  className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-theme-primary/20 border border-transparent hover:border-theme-primary/30 transition-colors flex flex-col gap-1"
                >
                  <span className="text-white font-bold">{result.name}</span>
                  <span className="text-white/50 text-xs">{result.admin1 ? `${result.admin1}, ` : ''}{result.country}</span>
                </button>
              ))}
              {!isSearching && searchQuery && searchResults.length === 0 && (
                <div className="text-center text-white/50 text-xs py-4">Aucune ville trouvée.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalEcosystem;
