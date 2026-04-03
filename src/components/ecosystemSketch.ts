import { LANG_COLORS, FOREST_RADIUS } from '../config';
import React from 'react';

let globalMic: any = null;
let globalFft: any = null;

export const createEcosystemSketch = (
  stateRef: React.MutableRefObject<any>,
  setSpectrum: (s: number[]) => void,
  setHoveredRepoData: (data: any) => void
) => {
  return (p: any) => {
    const state = stateRef.current;

    p.setup = () => {
      p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
      
      // Initialize global audio inside the p5 sketch to ensure AudioWorklet scope is valid
      try {
        if (!globalMic) {
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
      } catch (err) {
        // Ignore audio errors to prevent black screen
      }

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
      const isRaining = state.weather.code >= 51 && state.weather.code <= 67;
      const isSnowing = state.weather.code >= 71 && state.weather.code <= 86;
      
      if (!isRaining && !isSnowing && state.weather.code < 90) return;

      p.push();
      if (isSnowing) p.stroke(220, 230, 255); 
      else p.stroke(150, 180, 255, 180); 

      p.strokeWeight(isSnowing ? 4 : 1.5);
      
      state.particles.forEach((pt: any) => {
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
      
      const pulse = 1.0 + state.audio.smoothedBass * 0.35; 
      p.scale(pulse);
      
      p.box(100);
      p.fill(255, 50);
      p.sphere(70 + state.audio.treble * 60);
      p.pop();
    };

    const drawGitHubForest = (p: any, hoveredIndex: number) => {
      state.repos.forEach((repo: any, i: number) => {
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
        
        p.stroke(currentStrokeCol);
        recursiveBranch(p, trunkHeight, 0, complexity);
        p.noStroke();
        
        p.pop();
      });
    };

    const recursiveBranch = (p: any, len: number, depth: number, maxDepth: number) => {
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

    p.windowResized = () => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
  };
};