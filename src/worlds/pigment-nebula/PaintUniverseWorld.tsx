import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { pigmentData } from './pigmentData';
import { ReturnControl } from '../../shared/ReturnControl/ReturnControl';
import { FallbackGrid } from '../../shared/FallbackGrid/FallbackGrid';
import { soundEngine } from '../../audio/soundEngine';
import { ProjectItem } from '../../types/world';
import { Palette, Sparkles, Orbit, Droplets, List, X } from 'lucide-react';
import styles from './paint.module.css';

interface PaintUniverseProps {
  onReturn: () => void;
  onOpenCommission: (worldName?: string) => void;
}

export const PaintUniverseWorld: React.FC<PaintUniverseProps> = ({ onReturn, onOpenCommission }) => {
  const [activePlanet, setActivePlanet] = useState<ProjectItem | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | 'archive'>('3d');
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    soundEngine.setAmbientMood('pigment-nebula');
  }, []);

  useEffect(() => {
    if (viewMode !== '3d') return;
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x140612, 0.035);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Dynamic swirling paint particles
    const particleCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const paletteColors = [
      new THREE.Color(0xec4899),
      new THREE.Color(0xa855f7),
      new THREE.Color(0x38bdf8),
      new THREE.Color(0xfacc15),
    ];

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 12;
      positions[i + 1] = (Math.random() - 0.5) * 8;
      positions[i + 2] = (Math.random() - 0.5) * 6;

      const c = paletteColors[Math.floor(Math.random() * paletteColors.length)];
      colors[i] = c.r;
      colors[i + 1] = c.g;
      colors[i + 2] = c.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Orbiting Painted Project Planet Spheres
    const planetGroup = new THREE.Group();
    scene.add(planetGroup);

    const planetMeshes: { mesh: THREE.Mesh; project: ProjectItem; basePos: THREE.Vector3 }[] = [];
    const sphereAngles = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];

    pigmentData.projects.forEach((proj, idx) => {
      const radius = 2.6;
      const angle = sphereAngles[idx];
      const basePos = new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * 1.5, 0);

      const sphereGeo = new THREE.SphereGeometry(0.75, 32, 32);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: paletteColors[idx % paletteColors.length],
        roughness: 0.25,
        metalness: 0.4,
        emissive: paletteColors[idx % paletteColors.length],
        emissiveIntensity: 0.35,
      });

      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.position.copy(basePos);
      sphereMesh.userData = { project: proj };

      // Surrounding Paint Ring
      const ringGeo = new THREE.RingGeometry(0.95, 1.15, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: paletteColors[idx % paletteColors.length],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 3;
      sphereMesh.add(ringMesh);

      planetGroup.add(sphereMesh);
      planetMeshes.push({ mesh: sphereMesh, project: proj, basePos });
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xec4899, 2.5, 15);
    pointLight.position.set(0, 2, 4);
    scene.add(pointLight);

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-100, -100);

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(planetGroup.children, true);
      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData?.project && obj.parent) {
          obj = obj.parent;
        }
        if (obj?.userData?.project) {
          soundEngine.playPortalHover();
          setActivePlanet(obj.userData.project);
        }
      }
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('click', onClick);

    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = (performance.now() - startTime) / 1000;

      // Swirl paint particles
      particles.rotation.y = time * 0.05;
      particles.rotation.z = time * 0.03;

      // Gentle floating animation of project planets
      planetMeshes.forEach(({ mesh, basePos }, i) => {
        mesh.position.y = basePos.y + Math.sin(time * 1.5 + i * 2) * 0.18;
        mesh.position.x = basePos.x + Math.cos(time * 1.2 + i * 2) * 0.12;
        mesh.rotation.y = time * 0.4;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('click', onClick);
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [viewMode]);

  return (
    <div className={styles.paintScope}>
      <ReturnControl 
        onReturn={onReturn} 
        worldName="Pigment Nebula"
        onOpenCommission={() => onOpenCommission('Pigment Nebula')}
      />

      <div className={styles.viewToggle}>
        <button 
          type="button" 
          className={`${styles.toggleBtn} ${viewMode === '3d' ? styles.activeToggle : ''}`}
          onClick={() => setViewMode('3d')}
        >
          <Droplets size={14} /> Fluid Nebula
        </button>
        <button 
          type="button" 
          className={`${styles.toggleBtn} ${viewMode === 'archive' ? styles.activeToggle : ''}`}
          onClick={() => setViewMode('archive')}
        >
          <List size={14} /> Palette Index
        </button>
      </div>

      {viewMode === 'archive' ? (
        <FallbackGrid 
          worldName={pigmentData.name}
          tagline={pigmentData.tagline}
          projects={pigmentData.projects}
          accentColor={pigmentData.accentColor}
          onOpenCommission={() => onOpenCommission('Pigment Nebula')}
        />
      ) : (
        <div className={styles.canvasContainer}>
          <div ref={mountRef} className={styles.webglCanvas} />

          <div className={styles.nebulaPrompt}>
            <Orbit size={16} color="#ec4899" />
            <span>Click any drifting painted planet to inspect project dimensions</span>
          </div>

          {activePlanet && (
            <aside className={styles.planetDrawer}>
              <div className={styles.drawerHeader}>
                <div className={styles.paletteBadge}>
                  <Palette size={14} />
                  <span>{activePlanet.category}</span>
                </div>
                <button 
                  type="button" 
                  className={styles.closeDrawerBtn} 
                  onClick={() => setActivePlanet(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <h3 className={styles.planetTitle}>{activePlanet.title}</h3>
              <p className={styles.clientTag}>Client: {activePlanet.clientType} ({activePlanet.year})</p>
              <p className={styles.planetDesc}>{activePlanet.summary}</p>

              <div className={styles.fluidSection}>
                <h4>Simulated Media & Creative Brief</h4>
                <p>{activePlanet.description}</p>
              </div>

              <div className={styles.delivPills}>
                {activePlanet.deliverables.map((item, idx) => (
                  <div key={idx} className={styles.pillItem}>• {item}</div>
                ))}
              </div>

              <div className={styles.metricGlow}>
                <Sparkles size={14} color="#f472b6" />
                <span>{activePlanet.metricsOrHighlight}</span>
              </div>

              <button 
                type="button" 
                className={styles.commissionPlanetBtn}
                onClick={() => onOpenCommission('Pigment Nebula')}
              >
                <span>Commission Digital Art / Shader Showcase</span>
              </button>
            </aside>
          )}
        </div>
      )}
    </div>
  );
};
