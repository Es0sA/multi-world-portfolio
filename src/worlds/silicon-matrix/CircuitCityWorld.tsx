import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { siliconData } from './siliconData';
import { ReturnControl } from '../../shared/ReturnControl/ReturnControl';
import { FallbackGrid } from '../../shared/FallbackGrid/FallbackGrid';
import { soundEngine } from '../../audio/soundEngine';
import { ProjectItem } from '../../types/world';
import { Cpu, Zap, Activity, Radio, Sparkles, Layers, List } from 'lucide-react';
import styles from './circuit.module.css';

interface CircuitCityProps {
  onReturn: () => void;
  onOpenCommission: (worldName?: string) => void;
}

export const CircuitCityWorld: React.FC<CircuitCityProps> = ({ onReturn, onOpenCommission }) => {
  const [selectedChip, setSelectedChip] = useState<ProjectItem | null>(siliconData.projects[0]);
  const [viewMode, setViewMode] = useState<'3d' | 'archive'>('3d');
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    soundEngine.setAmbientMood('silicon-matrix');
  }, []);

  useEffect(() => {
    if (viewMode !== '3d') return;
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0904, 0.04);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 5.5, 4.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Green/Amber PCB Board Base
    const pcbGeo = new THREE.PlaneGeometry(12, 12);
    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x071e11,
      roughness: 0.4,
      metalness: 0.6,
    });
    const pcbMesh = new THREE.Mesh(pcbGeo, pcbMat);
    pcbMesh.rotation.x = -Math.PI / 2;
    scene.add(pcbMesh);

    // Glowing Copper Traces (Lines)
    const traceMaterial = new THREE.LineBasicMaterial({
      color: 0xf59e0b,
      linewidth: 2,
    });

    const tracesGroup = new THREE.Group();
    scene.add(tracesGroup);

    for (let i = 0; i < 35; i++) {
      const points: THREE.Vector3[] = [];
      let curX = (Math.random() - 0.5) * 8;
      let curZ = (Math.random() - 0.5) * 8;
      points.push(new THREE.Vector3(curX, 0.02, curZ));

      for (let s = 0; s < 4; s++) {
        if (Math.random() > 0.5) {
          curX += (Math.random() - 0.5) * 2;
        } else {
          curZ += (Math.random() - 0.5) * 2;
        }
        points.push(new THREE.Vector3(curX, 0.02, curZ));
      }

      const traceGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(traceGeo, traceMaterial);
      tracesGroup.add(line);
    }

    // 3 IC Project Microchips
    const chipMeshes: { mesh: THREE.Mesh; project: ProjectItem }[] = [];
    const positions = [
      new THREE.Vector3(-2.6, 0.15, -0.5),
      new THREE.Vector3(0, 0.15, 0.8),
      new THREE.Vector3(2.6, 0.15, -0.5),
    ];

    siliconData.projects.forEach((proj, idx) => {
      const chipGeo = new THREE.BoxGeometry(1.6, 0.25, 1.6);
      const chipMat = new THREE.MeshStandardMaterial({
        color: 0x1f2937,
        roughness: 0.2,
        metalness: 0.9,
      });
      const chipMesh = new THREE.Mesh(chipGeo, chipMat);
      chipMesh.position.copy(positions[idx] || new THREE.Vector3(0, 0.15, 0));

      // Gold IC Pins
      const pinMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.95 });
      for (let p = -0.6; p <= 0.6; p += 0.3) {
        const pin1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.2), pinMat);
        pin1.position.set(p, -0.08, 0.88);
        chipMesh.add(pin1);

        const pin2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.2), pinMat);
        pin2.position.set(p, -0.08, -0.88);
        chipMesh.add(pin2);
      }

      // Emissive Core Indicator
      const coreLight = new THREE.PointLight(0xf59e0b, 1.5, 3);
      coreLight.position.set(0, 0.2, 0);
      chipMesh.add(coreLight);

      chipMesh.userData = { project: proj };
      scene.add(chipMesh);
      chipMeshes.push({ mesh: chipMesh, project: proj });
    });

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xfbbf24, 1.2);
    dirLight.position.set(4, 8, 4);
    scene.add(dirLight);

    // Mouse Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-100, -100);

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && !obj.userData?.project && obj.parent) {
          obj = obj.parent;
        }
        if (obj?.userData?.project) {
          soundEngine.playTerminalKey();
          setSelectedChip(obj.userData.project);
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

      chipMeshes.forEach(({ mesh, project }) => {
        const isSelected = selectedChip?.id === project.id;
        if (isSelected) {
          mesh.position.y = 0.25 + Math.sin(t * 3) * 0.05;
        } else {
          mesh.position.y = 0.15;
        }
      });

      // Subtle board oscillation
      camera.position.x = Math.sin(t * 0.2) * 0.5;

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
  }, [viewMode, selectedChip]);

  return (
    <div className={styles.siliconScope}>
      <ReturnControl 
        onReturn={onReturn} 
        worldName="Silicon Matrix"
        onOpenCommission={() => onOpenCommission('Silicon Matrix')}
      />

      <div className={styles.viewToggle}>
        <button 
          type="button" 
          className={`${styles.toggleBtn} ${viewMode === '3d' ? styles.activeToggle : ''}`}
          onClick={() => setViewMode('3d')}
        >
          <Cpu size={14} /> Motherboard Matrix
        </button>
        <button 
          type="button" 
          className={`${styles.toggleBtn} ${viewMode === 'archive' ? styles.activeToggle : ''}`}
          onClick={() => setViewMode('archive')}
        >
          <List size={14} /> Spec Archive
        </button>
      </div>

      {viewMode === 'archive' ? (
        <FallbackGrid 
          worldName={siliconData.name}
          tagline={siliconData.tagline}
          projects={siliconData.projects}
          accentColor={siliconData.accentColor}
          onOpenCommission={() => onOpenCommission('Silicon Matrix')}
        />
      ) : (
        <div className={styles.matrixContainer}>
          <div ref={mountRef} className={styles.webglCanvas} />

          {/* Telemetry HUD Panel */}
          {selectedChip && (
            <div className={styles.telemetryOverlay}>
              <div className={styles.hudCard}>
                <div className={styles.hudHeader}>
                  <div className={styles.chipIdentity}>
                    <Cpu size={18} color="#fbbf24" />
                    <span>IC-PACKAGE // {selectedChip.id.toUpperCase()}</span>
                  </div>
                  <div className={styles.pulseLed}>
                    <Activity size={13} color="#22c55e" />
                    <span>ONLINE</span>
                  </div>
                </div>

                <h3 className={styles.hudTitle}>{selectedChip.title}</h3>
                <div className={styles.hudClient}>
                  Target Enterprise: <strong>{selectedChip.clientType}</strong>
                </div>
                <p className={styles.hudSummary}>{selectedChip.summary}</p>

                <div className={styles.specBreakdown}>
                  <h4>Firmware & Silicon Details:</h4>
                  <p>{selectedChip.description}</p>
                </div>

                <div className={styles.metricsBox}>
                  <Zap size={14} color="#fbbf24" />
                  <span>{selectedChip.metricsOrHighlight}</span>
                </div>

                <div className={styles.pinArray}>
                  {selectedChip.techOrTools.map((tool, idx) => (
                    <span key={idx} className={styles.pinTag}>{tool}</span>
                  ))}
                </div>

                <button 
                  type="button" 
                  className={styles.commissionChipBtn}
                  onClick={() => onOpenCommission('Silicon Matrix')}
                >
                  <Sparkles size={14} />
                  <span>Commission Hardware / Embedded Portfolio</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
