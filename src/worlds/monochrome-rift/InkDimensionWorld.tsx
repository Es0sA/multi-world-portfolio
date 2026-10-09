import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { monochromeData } from './monochromeData';
import { ReturnControl } from '../../shared/ReturnControl/ReturnControl';
import { FallbackGrid } from '../../shared/FallbackGrid/FallbackGrid';
import { soundEngine } from '../../audio/soundEngine';
import { ProjectItem } from '../../types/world';
import { Compass, Sparkles, Feather, CircleDot, List, X } from 'lucide-react';
import styles from './ink.module.css';

interface InkDimensionProps {
  onReturn: () => void;
  onOpenCommission: (worldName?: string) => void;
}

export const InkDimensionWorld: React.FC<InkDimensionProps> = ({ onReturn, onOpenCommission }) => {
  const [selectedScene, setSelectedScene] = useState<ProjectItem | null>(monochromeData.projects[0]);
  const [viewMode, setViewMode] = useState<'3d' | 'archive'>('3d');
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    soundEngine.setAmbientMood('monochrome-rift');
  }, []);

  useEffect(() => {
    if (viewMode !== '3d') return;
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.04);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Dynamic High-Contrast Falling Ink Droplets and Splatters
    const dropCount = 500;
    const dropGeo = new THREE.BufferGeometry();
    const dropPos = new Float32Array(dropCount * 3);

    for (let i = 0; i < dropCount * 3; i += 3) {
      dropPos[i] = (Math.random() - 0.5) * 14;
      dropPos[i + 1] = (Math.random() - 0.5) * 14;
      dropPos[i + 2] = (Math.random() - 0.5) * 10;
    }

    dropGeo.setAttribute('position', new THREE.BufferAttribute(dropPos, 3));
    const dropMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.04,
      transparent: true,
      opacity: 0.75,
    });
    const inkDrops = new THREE.Points(dropGeo, dropMat);
    scene.add(inkDrops);

    // 3 Ink Monolith Sculptures (Zero panel borders, purely organic form)
    const sculpturesGroup = new THREE.Group();
    scene.add(sculpturesGroup);

    const sculptureMeshes: { mesh: THREE.Mesh; project: ProjectItem; origY: number }[] = [];
    const sculpturePositions = [-2.8, 0, 2.8];

    monochromeData.projects.forEach((proj, idx) => {
      // Abstract sumi-e vertical ink wash pillar
      const geo = new THREE.CylinderGeometry(0.5, 0.7, 3.2, 16);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.1,
        metalness: 0.9,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(sculpturePositions[idx], 0, 0);

      // White ink contour rings
      const haloGeo = new THREE.TorusGeometry(0.8, 0.02, 16, 64);
      const haloMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = Math.PI / 2;
      mesh.add(halo);

      mesh.userData = { project: proj };
      sculpturesGroup.add(mesh);
      sculptureMeshes.push({ mesh, project: proj, origY: 0 });
    });

    // High contrast stark lighting
    const light = new THREE.DirectionalLight(0xffffff, 2.0);
    light.position.set(5, 10, 5);
    scene.add(light);

    const backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(-5, -5, -5);
    scene.add(backLight);

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
      const intersects = raycaster.intersectObjects(sculpturesGroup.children, true);
      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData?.project && obj.parent) {
          obj = obj.parent;
        }
        if (obj?.userData?.project) {
          soundEngine.playInkDrop();
          setSelectedScene(obj.userData.project);
        }
      }
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('click', onClick);

    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = (performance.now() - startTime) / 1000;

      // Slow downward ink drift
      const positions = dropGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= 0.02;
        if (positions[i] < -7) positions[i] = 7;
      }
      dropGeo.attributes.position.needsUpdate = true;

      // Animate ink monoliths
      sculptureMeshes.forEach(({ mesh, project }) => {
        mesh.rotation.y = t * 0.3;
        const isSel = selectedScene?.id === project.id;
        mesh.position.y = isSel ? Math.sin(t * 2) * 0.15 : 0;
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
  }, [viewMode, selectedScene]);

  return (
    <div className={styles.inkScope}>
      <ReturnControl 
        onReturn={onReturn} 
        worldName="Monochrome Rift"
        onOpenCommission={() => onOpenCommission('Monochrome Rift')}
      />

      <div className={styles.viewToggle}>
        <button 
          type="button" 
          className={`${styles.toggleBtn} ${viewMode === '3d' ? styles.activeToggle : ''}`}
          onClick={() => setViewMode('3d')}
        >
          <Feather size={14} /> Fluid Ink Void
        </button>
        <button 
          type="button" 
          className={`${styles.toggleBtn} ${viewMode === 'archive' ? styles.activeToggle : ''}`}
          onClick={() => setViewMode('archive')}
        >
          <List size={14} /> Ink Monograph Index
        </button>
      </div>

      {viewMode === 'archive' ? (
        <FallbackGrid 
          worldName={monochromeData.name}
          tagline={monochromeData.tagline}
          projects={monochromeData.projects}
          accentColor={monochromeData.accentColor}
          onOpenCommission={() => onOpenCommission('Monochrome Rift')}
        />
      ) : (
        <div className={styles.riftContainer}>
          <div ref={mountRef} className={styles.webglCanvas} />

          <div className={styles.riftPrompt}>
            <CircleDot size={14} />
            <span>Select any living ink pillar to dissolve into the case study</span>
          </div>

          {selectedScene && (
            <div className={styles.sceneModal}>
              <div className={styles.modalBackdrop}>
                <div className={styles.modalHeader}>
                  <div className={styles.inkTag}>
                    <Feather size={13} />
                    <span>SUMI-E // {selectedScene.category}</span>
                  </div>
                  <button 
                    type="button" 
                    className={styles.closeBtn} 
                    onClick={() => setSelectedScene(null)}
                  >
                    <X size={18} />
                  </button>
                </div>

                <h3 className={styles.sceneTitle}>{selectedScene.title}</h3>
                <p className={styles.sceneClient}>Client: {selectedScene.clientType} ({selectedScene.year})</p>
                
                <p className={styles.sceneSummary}>{selectedScene.summary}</p>

                <div className={styles.inkTechnique}>
                  <h4>Technique & Medium:</h4>
                  <p>{selectedScene.description}</p>
                </div>

                <div className={styles.delivRows}>
                  {selectedScene.deliverables.map((item, idx) => (
                    <div key={idx} className={styles.delivRow}>• {item}</div>
                  ))}
                </div>

                <div className={styles.inkDossier}>
                  <strong>Curatorial Milestone:</strong>
                  <span>{selectedScene.metricsOrHighlight}</span>
                </div>

                <button 
                  type="button" 
                  className={styles.commissionInkBtn}
                  onClick={() => onOpenCommission('Monochrome Rift')}
                >
                  <Sparkles size={14} />
                  <span>Commission Dark Ink / Avant-Garde Portfolio</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
