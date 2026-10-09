import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { WorldConfig } from '../types/world';

interface HubCanvas3DProps {
  worlds: WorldConfig[];
  onSelectWorld: (world: WorldConfig) => void;
  hoveredWorldId: string | null;
  setHoveredWorldId: (id: string | null) => void;
}

export const HubCanvas3D: React.FC<HubCanvas3DProps> = ({
  worlds,
  onSelectWorld,
  hoveredWorldId,
  setHoveredWorldId,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05060b, 0.035);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Subtle Ambient and Directional Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x6366f1, 2.5, 20);
    pointLight.position.set(0, 3, 2);
    scene.add(pointLight);

    // Portal Monoliths arranged in an architectural crescent arc
    const portalsGroup = new THREE.Group();
    scene.add(portalsGroup);

    const portalMeshes: { mesh: THREE.Mesh; world: WorldConfig; glow: THREE.Mesh }[] = [];
    const radius = 5.2;
    const angleSpan = Math.PI * 0.95; // 170-degree arc
    const startAngle = -angleSpan / 2;

    worlds.forEach((world, index) => {
      const angle = startAngle + (index / (worlds.length - 1)) * angleSpan;
      const x = Math.sin(angle) * radius;
      const z = -Math.cos(angle) * radius + 3.2;

      // Portal Frame Monolith
      const frameGeo = new THREE.BoxGeometry(0.75, 1.55, 0.08);
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x11131c,
        roughness: 0.3,
        metalness: 0.8,
      });
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      frameMesh.position.set(x, 0.2, z);
      frameMesh.lookAt(0, 0.2, 8.5);

      // Portal Inner Emissive Core
      const coreGeo = new THREE.PlaneGeometry(0.65, 1.45);
      const coreMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(world.portalColor),
        transparent: true,
        opacity: 0.85,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.set(0, 0, 0.045);
      frameMesh.add(coreMesh);

      // Portal Ambient Glow Backplate
      const glowGeo = new THREE.PlaneGeometry(1.2, 2.0);
      const glowMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(world.portalColor),
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
      });
      const glowMesh = new THREE.Mesh(glowGeo, glowMat);
      glowMesh.position.set(0, 0, -0.01);
      frameMesh.add(glowMesh);

      frameMesh.userData = { world };
      portalsGroup.add(frameMesh);
      portalMeshes.push({ mesh: frameMesh, world, glow: glowMesh });
    });

    // Cosmic Particle Field
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 280;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 16;
      posArray[i + 1] = (Math.random() - 0.5) * 8 + 1;
      posArray[i + 2] = (Math.random() - 0.5) * 14;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.035,
      color: 0xa5b4fc,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(24, 48, 0x312e81, 0x111322);
    gridHelper.position.y = -0.7;
    scene.add(gridHelper);

    // Raycasting & Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-100, -100);

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(portalsGroup.children, true);
      if (intersects.length > 0) {
        let target: THREE.Object3D | null = intersects[0].object;
        while (target && !target.userData?.world && target.parent) {
          target = target.parent;
        }
        if (target && target.userData?.world) {
          onSelectWorld(target.userData.world);
        }
      }
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('click', onClick);

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // Render Loop
    let animId: number;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = (performance.now() - startTime) / 1000;

      // Slow orbital sway
      particles.rotation.y = time * 0.02;

      // Raycast check for hover state
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(portalsGroup.children, true);
      let hitWorldId: string | null = null;

      if (intersects.length > 0) {
        let target: THREE.Object3D | null = intersects[0].object;
        while (target && !target.userData?.world && target.parent) {
          target = target.parent;
        }
        if (target && target.userData?.world) {
          hitWorldId = target.userData.world.id;
        }
      }

      setHoveredWorldId(hitWorldId);

      // Animate portals
      portalMeshes.forEach(({ mesh, world }) => {
        const isHovered = world.id === hitWorldId;
        const targetScale = isHovered ? 1.08 : 1.0;
        mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        mesh.position.y = 0.2 + (isHovered ? Math.sin(time * 3) * 0.05 : 0);
      });

      // Gentle camera breath
      camera.position.x = Math.sin(time * 0.3) * 0.25;
      camera.position.y = 1.2 + Math.cos(time * 0.4) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('click', onClick);
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [worlds, onSelectWorld, setHoveredWorldId]);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />;
};
