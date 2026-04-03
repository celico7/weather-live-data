import { LANG_COLORS, FOREST_RADIUS } from '../config';
import React from 'react';
import type p5 from 'p5';

let globalMic: any = null;
let globalFft: any = null;

export const createEcosystemSketch = (
  stateRef: React.MutableRefObject<any>,
  setSpectrum: (s: number[]) => void,
  setHoveredRepoData: (data: any) => void
) => {
  return (p: p5) => {
    const state = stateRef.current;

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
      
      try {
        if (!globalMic) {
          setTimeout(() => {
            try {
              if (!globalMic) {
                globalMic = new (window as any).p5.AudioIn();
                globalMic.start();
                globalFft = new (window as any).p5.FFT(0.8, 64);
                globalFft.setInput(globalMic);
              }
            } catch(e) {}
          }, 100);
        }
      } catch (err) {}

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
    };

    p.draw = () => {
      // Fetch GitHub repos if needed
      if (state.repos.length === 0 && !state.isFetchingRepos) {
        state.isFetchingRepos = true;
        fetchGitHub(state.targetGithubUser || 'celico7');
      }

      p.clear(); 

      p.orbitControl(2, 2, 0.5);
      updateAudio(p);
      setupDynamicLighting(p);
      drawTerrain(p);
      drawWeatherParticles(p);
      drawCentralObject(p);
      
      let hoveredIndex = -1;
      let minD = 150; 
      state.repos.forEach((repo: any, i: number) => {
        const x = p.cos(repo.angle) * FOREST_RADIUS;
        const z = p.sin(repo.angle) * FOREST_RADIUS;
        const trunkHeight = p.map(repo.size, 0, 10000, 40, 180, true);
        const y = -trunkHeight / 2; 
        
        const pos2D = project(p, x, y, z);
        const d = p.dist(p.mouseX, p.mouseY, pos2D.x + p.width/2, pos2D.y + p.height/2);
        if (d < minD) { minD = d; hoveredIndex = i; }
      });
      
      if (state.hoveredRepo !== hoveredIndex) {
        state.hoveredRepo = hoveredIndex;
        setHoveredRepoData(hoveredIndex !== -1 ? state.repos[hoveredIndex] : null);
      }

      drawGitHubForest(p, hoveredIndex);
    };

    const fetchGitHub = async (user: string) => {
      try {
        const res = await fetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=10`);
        if (res.status === 403) throw new Error("Rate limit");
        const data = await res.json();
        
        if (Array.isArray(data)) {
          state.repos = data.map((repo: any, index: number) => ({
            name: repo.name,
            lang: repo.language || 'default',
            size: repo.size,
            url: repo.html_url,
            stars: repo.stargazers_count,
            angle: (p.TWO_PI / Math.min(data.length, 10)) * index,
            scale: 0.4,
            targetScale: 1.0
          }));
        } else {
          state.repos = [];
        }
      } catch (err) {
        state.repos = [];
      }
    };

    const updateAudio = (p: p5) => {
      try {
        if (globalFft && globalMic) {
          const spectrumData = globalFft.analyze();
          const b = globalFft.getEnergy("bass");
          const t = globalFft.getEnergy("treble");
          const l = globalMic.getLevel();

          let rawBass = (typeof b === 'number' && !isNaN(b) ? b : 0) / 255;
          rawBass = Math.max(0, rawBass - 0.2) * 1.25; 
          
          state.audio.bass = rawBass;
          state.audio.treble = (typeof t === 'number' && !isNaN(t) ? t : 0) / 255;
          state.audio.level = (typeof l === 'number' && !isNaN(l) ? l : 0);
          
          state.audio.smoothedBass = p.lerp(state.audio.smoothedBass, state.audio.bass, 0.05);

          if (p.frameCount % 5 === 0) {
            const simplified = [];
            for(let i=0; i<12; i++) {
              const val = spectrumData[i*2];
              simplified.push((typeof val === 'number' && !isNaN(val) ? val : 0) / 255);
            }
            setSpectrum(simplified);
          }
        }
      } catch (err) {}
    }

    const setupDynamicLighting = (p: p5) => {
      p.ambientLight(40, 40, 40);
      
      const hour = state.weather.hour;
      const sunAngle = p.map(hour, 6, 18, 0, p.PI, true);
      const sunDirX = p.cos(sunAngle);
      const sunDirY = -p.sin(sunAngle); 
      const sunDirZ = -0.5;
      
      let lightColor = p.color(255, 255, 255);
      if (hour >= 17 || hour <= 7) lightColor = p.color(255, 120, 50);
      if (state.weather.code >= 95) lightColor = p.color(100, 150, 255);

      p.directionalLight(lightColor, sunDirX, sunDirY, sunDirZ);
      
      p.pointLight(state.audio.bass * 255, state.audio.bass * 100, state.audio.bass * 255, 0, 0, 0);
    }

    const drawTerrain = (p: p5) => {
      p.push();
      p.translate(0, 200, 0);
      p.rotateX(p.PI / 2);
      p.noFill();
      p.stroke(0, 255, 200, 30 + state.audio.bass * 70);
      p.strokeWeight(1);
      
      const cols = 25;
      const rows = 25;
      const scl = 150;
      const w = cols * scl;
      const h = rows * scl;
      
      p.translate(-w/2, -h/2);
      
      const flying = p.frameCount * (0.01 + state.weather.wind * 0.001);
      
      for (let y = 0; y < rows - 1; y++) {
        p.beginShape(p.TRIANGLE_STRIP);
        for (let x = 0; x < cols; x++) {
          const z1 = p.map(p.noise(x * 0.1, (y - flying) * 0.1), 0, 1, -50, 150) + (Math.sin(x*0.5 + p.frameCount*0.1) * state.audio.bass * 50);
          p.vertex(x * scl, y * scl, z1);
          
          const z2 = p.map(p.noise(x * 0.1, (y + 1 - flying) * 0.1), 0, 1, -50, 150) + (Math.sin(x*0.5 + p.frameCount*0.1) * state.audio.bass * 50);
          p.vertex(x * scl, (y + 1) * scl, z2);
        }
        p.endShape();
      }
      p.pop();
    };

    const drawWeatherParticles = (p: p5) => {
      const isRaining = state.weather.code >= 51 && state.weather.code <= 67;
      const isSnowing = state.weather.code >= 71 && state.weather.code <= 86;
      if (!isRaining && !isSnowing && state.weather.code < 90) return;

      p.push();
      if (isSnowing) p.stroke(220, 230, 255); else p.stroke(150, 180, 255, 180); 
      p.strokeWeight(isSnowing ? 4 : 1.5);
      
      state.particles.forEach((pt: any) => {
        pt.y += pt.speed + state.weather.wind * 0.2; 
        if (pt.y > 1000) pt.y = -1000;
        p.point(pt.x, pt.y, pt.z);
      });
      p.pop();
    };

    const drawCentralObject = (p: p5) => {
      p.push();
      const cold = p.color(100, 200, 255);
      const hot = p.color(255, 100, 50);
      const tempCol = p.lerpColor(cold, hot, p.map(state.weather.temp, 0, 35, 0, 1));
      
      p.ambientMaterial(tempCol);
      p.stroke(255, 150);
      p.strokeWeight(0.5);
      
      p.rotateX(p.frameCount * 0.01);
      p.rotateY(p.frameCount * 0.015);
      
      const pulse = 1.0 + state.audio.smoothedBass * 0.35; 
      p.scale(pulse);
      
      // Ensure the box gets the temperature color with ambient mapping
      p.ambientMaterial(tempCol);
      p.box(100);

      // Wireframe globe as requested (like in the image)
      p.noFill();
      p.stroke(255, 150);
      p.strokeWeight(0.5);
      p.sphere(70 + state.audio.treble * 60);
      p.pop();
    };

    const drawGitHubForest = (p: p5, hoveredIndex: number) => {
      state.repos.forEach((repo: any, i: number) => {
        const x = p.cos(repo.angle) * FOREST_RADIUS;
        const z = p.sin(repo.angle) * FOREST_RADIUS;
        const y = 0;

        if (i === hoveredIndex) repo.targetScale = 2.5;
        else repo.targetScale = hoveredIndex !== -1 ? 0.4 : 1.0;
        repo.scale = p.lerp(repo.scale, repo.targetScale, 0.1);

        p.push();
        p.translate(x, y, z);
        
        const col = p.color(LANG_COLORS[repo.lang] || LANG_COLORS.default);
        let activeCol = col;
        
        if (i === hoveredIndex) {
          p.emissiveMaterial(col);
        } else {
          activeCol = p.lerpColor(col, p.color(0), hoveredIndex !== -1 ? 0.7 : 0) as unknown as p5.Color;
          p.ambientMaterial(activeCol);
        }

        p.scale(repo.scale);
        
        const trunkHeight = p.map(repo.size, 0, 10000, 40, 180, true);
        const complexity = p.floor(p.map(repo.size, 0, 10000, 2, 5, true));
        
        p.stroke(activeCol);
        recursiveBranch(p, trunkHeight, 0, complexity, activeCol);
        p.noStroke();
        
        p.pop();
      });
    };

    const recursiveBranch = (p: p5, len: number, depth: number, maxDepth: number, leafColor: p5.Color) => {
      const audioPulse = 1.0 + state.audio.bass * 0.3;
      const dynamicLen = depth === 0 ? len * audioPulse : len;

      p.strokeWeight(p.map(depth, 0, maxDepth, 4, 0.5));
      p.line(0, 0, 0, 0, -dynamicLen, 0);
      p.translate(0, -dynamicLen, 0);

      if (depth === maxDepth) {
        p.push();
        p.noStroke();
        p.fill(leafColor);
        p.scale(1 + state.audio.treble * 2);
        p.rotateX(p.frameCount * 0.05);
        p.box(10);
        p.pop();
      }

      if (depth < maxDepth) {
        for (let i = 0; i < 2; i++) {
          p.push();
          const windEff = p.sin(p.frameCount * 0.03 + depth) * (state.weather.wind * 0.01);
          const audioEff = state.audio.treble * 0.3 * (i === 0 ? 1 : -1);
          
          p.rotateZ(0.4 * (i === 0 ? 1 : -1) + windEff + audioEff);
          p.rotateY(p.frameCount * 0.01 + state.audio.level * 0.5);
          recursiveBranch(p, len * 0.75, depth + 1, maxDepth, leafColor);
          p.pop();
        }
      }
    };

    const project = (p: any, x: number, y: number, z: number) => {
      const r = p._renderer, m = r.uMVMatrix.mat4, pm = r.uPMatrix.mat4;
      let cx = x*m[0] + y*m[4] + z*m[8] + m[12];
      let cy = x*m[1] + y*m[5] + z*m[9] + m[13];
      let cz = x*m[2] + y*m[6] + z*m[10] + m[14];
      let cw = x*m[3] + y*m[7] + z*m[11] + m[15];

      let clipX = cx*pm[0] + cy*pm[4] + cz*pm[8] + cw*pm[12];
      let clipY = cx*pm[1] + cy*pm[5] + cz*pm[9] + cw*pm[13];
      let clipW = cx*pm[3] + cy*pm[7] + cz*pm[11] + cw*pm[15];

      if (clipW === 0) return { x: 0, y: 0 };
      return { x: (clipX / clipW) * (p.width / 2), y: (clipY / clipW) * (p.height / 2) };
    };

    p.mousePressed = (e?: any) => {
      if (e && e.target && (e.target as HTMLElement).tagName !== 'CANVAS') return;
      state.clickStartTime = p.millis();
      try {
        const getAudioContext = (window as any).getAudioContext || ((window as any).p5 && (window as any).p5.prototype.getAudioContext);
        if (getAudioContext) {
          const ctx = getAudioContext();
          if (ctx && ctx.state === 'suspended') ctx.resume();
        }
      } catch(err) {}
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

    p.windowResized = () => p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
};
