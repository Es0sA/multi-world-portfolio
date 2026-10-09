import React, { useEffect, useRef, useState, useCallback } from 'react';
import { WorldConfig } from '../types/world';
import { HUB_WORLDS } from './hubData';
import { soundEngine } from '../audio/soundEngine';
import { Volume2, VolumeX, Mail } from 'lucide-react';
import styles from './Hub.module.css';

interface HubViewProps {
  onSelectWorld: (world: WorldConfig) => void;
  onOpenCommission: (worldName?: string) => void;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
}

interface PortalItem {
  id: string;
  name: string;
  field: string;
  tier: string;
  color: [number, number, number];
  world: WorldConfig;
  x: number;
  y: number;
  r: number;
  seed: number;
  glow: number;
}

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
}

const PORTAL_SPECS = [
  { id: 'terminal-office', name: 'Terminal Office', field: 'Developer', tier: 'Regular', color: [93, 255, 138] as [number, number, number] },
  { id: 'retro-workstation', name: 'CPU and Monitor', field: 'Developer', tier: 'Crazy', color: [255, 157, 77] as [number, number, number] },
  { id: 'silicon-matrix', name: 'Circuit City', field: 'Developer', tier: 'Beyond', color: [77, 166, 255] as [number, number, number] },
  { id: 'curator-monolith', name: 'Gallery Wall', field: 'Designer', tier: 'Regular', color: [240, 240, 240] as [number, number, number] },
  { id: 'torn-atelier', name: 'Sketchbook Explosion', field: 'Designer', tier: 'Crazy', color: [255, 216, 77] as [number, number, number] },
  { id: 'pigment-nebula', name: 'Paint Universe', field: 'Designer', tier: 'Beyond', color: [255, 111, 216] as [number, number, number] },
  { id: 'graphic-chronicle', name: 'Comic Page', field: 'Illustrator', tier: 'Regular', color: [255, 77, 109] as [number, number, number] },
  { id: 'origami-vault', name: 'Pop-Up Book', field: 'Illustrator', tier: 'Crazy', color: [180, 140, 255] as [number, number, number] },
  { id: 'monochrome-rift', name: 'Ink Dimension', field: 'Illustrator', tier: 'Beyond', color: [154, 163, 184] as [number, number, number] }
];

export const HubView: React.FC<HubViewProps> = ({
  onSelectWorld,
  onOpenCommission,
  isAudioMuted,
  onToggleAudio,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);
  const [buttonRects, setButtonRects] = useState<{ left: number; top: number; width: number; height: number }[]>([]);
  const hoveredRef = useRef<number>(-1);
  const flashIdxRef = useRef<number>(-1);
  const flashUntilRef = useRef<number>(0);

  const portalsRef = useRef<PortalItem[]>([]);
  const starsRef = useRef<Star[]>([]);
  const dimensionsRef = useRef<{ W: number; H: number; dpr: number; compact: boolean }>({
    W: 0,
    H: 0,
    dpr: 1,
    compact: false,
  });

  const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const defaultHint = isTouch ? 'Tap a portal to enter.' : 'Move toward a portal to wake it. Click to enter.';

  // Build portal objects paired with WorldConfig
  const portalsData = React.useMemo(() => {
    return PORTAL_SPECS.map((spec) => {
      const foundWorld = HUB_WORLDS.find((w) => w.id === spec.id) || HUB_WORLDS[0];
      return {
        ...spec,
        world: foundWorld,
      };
    });
  }, []);

  const handlePortalEnter = useCallback((index: number) => {
    const p = portalsRef.current[index] || portalsData[index];
    if (!p) return;
    flashIdxRef.current = index;
    flashUntilRef.current = performance.now() + 1500;
    soundEngine.playPortalWarp();
    onSelectWorld(p.world);
  }, [onSelectWorld, portalsData]);

  const handleHoverChange = useCallback((index: number) => {
    hoveredRef.current = index;
    setHoveredIndex(index);
    if (index >= 0) {
      soundEngine.playPortalHover();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = window.innerWidth;
      const compact = W < 720;

      const cols = compact ? 2 : 3;
      const rows = Math.ceil(portalsData.length / cols);
      const topPad = compact ? 200 : 210;
      const cellW = W / cols;
      const cellH = compact ? 210 : Math.max(190, (window.innerHeight - topPad - 30) / rows);
      const radius = Math.max(32, Math.min(cellW * 0.22, cellH * 0.22, 72));

      const H = Math.max(window.innerHeight, topPad + cellH * rows + 50);

      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.height = `${H}px`;
      stage.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      dimensionsRef.current = { W, H, dpr, compact };

      const computedPortals: PortalItem[] = portalsData.map((w, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const inRow = Math.min(cols, portalsData.length - row * cols);
        const offset = ((cols - inRow) * cellW) / 2;
        const prevGlow = portalsRef.current[i]?.glow || 0;
        return {
          ...w,
          x: cellW * col + cellW / 2 + offset,
          y: topPad + cellH * row + cellH / 2,
          r: radius,
          seed: (i + 1) * 7.3,
          glow: prevGlow,
        };
      });

      portalsRef.current = computedPortals;

      const rects = computedPortals.map((p) => ({
        left: p.x - p.r * 1.5,
        top: p.y - p.r * 1.9,
        width: p.r * 3,
        height: p.r * 3.9,
      }));
      setButtonRects(rects);

      starsRef.current = Array.from({ length: Math.floor((W * H) / 9000) }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.3 + 0.2,
        a: Math.random() * Math.PI * 2,
      }));
    };

    const drawStars = (viewTop: number, viewBottom: number) => {
      for (const s of starsRef.current) {
        if (!reduceMotion) s.a += 0.012;
        if (s.y < viewTop || s.y > viewBottom) continue;
        const alpha = 0.2 + (Math.sin(s.a) * 0.5 + 0.5) * 0.6;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
        ctx.fill();
      }
    };

    const drawPortal = (p: PortalItem, time: number) => {
      const [r, g, b] = p.color;
      const hover = p.glow;
      const R = p.r * (1 + hover * 0.08);
      const rot = reduceMotion ? 0 : time * 0.4 + p.seed;
      const blurScale = isTouch ? 0.5 : 1;

      // Outer aura
      const aura = ctx.createRadialGradient(p.x, p.y, R * 0.4, p.x, p.y, R * 2.1);
      aura.addColorStop(0, `rgba(${r},${g},${b},${0.10 + hover * 0.25})`);
      aura.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(p.x, p.y, R * 2.1, 0, Math.PI * 2);
      ctx.fill();

      // Swirling vortex: counter-rotating elliptical rings
      for (let k = 0; k < 4; k++) {
        const ringR = R * (0.55 + k * 0.18);
        const squash = 0.35 + k * 0.05;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(rot * (k % 2 ? -1 : 1) * (1 + k * 0.2));
        ctx.beginPath();
        ctx.ellipse(0, 0, ringR, ringR * squash, 0, 0.2, Math.PI * 1.6);
        ctx.strokeStyle = `rgba(${r},${g},${b},${0.35 + hover * 0.4 - k * 0.05})`;
        ctx.lineWidth = Math.max(1, 2 + hover * 1.5 - k * 0.3);
        ctx.shadowColor = `rgb(${r},${g},${b})`;
        ctx.shadowBlur = (10 + hover * 14) * blurScale;
        ctx.stroke();
        ctx.restore();
      }

      // Dark core: doorway
      ctx.shadowBlur = 0;
      const core = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R * 0.6);
      core.addColorStop(0, 'rgba(2,3,10,1)');
      core.addColorStop(0.8, `rgba(${r},${g},${b},${0.15 + hover * 0.2})`);
      core.addColorStop(1, 'rgba(2,3,10,0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(p.x, p.y, R * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Orbiting motes
      if (!reduceMotion) {
        for (let m = 0; m < 6; m++) {
          const a = time * (0.6 + m * 0.07) + m * 1.05 + p.seed;
          const d = R * (0.9 + Math.sin(time + m) * 0.1);
          ctx.beginPath();
          ctx.arc(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d * 0.4, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${0.6 + hover * 0.4})`;
          ctx.fill();
        }
      }

      // Name floating above portal
      const bob = reduceMotion ? 0 : Math.sin(time * 1.3 + p.seed) * 3;
      ctx.textAlign = 'center';
      ctx.font = `500 ${dimensionsRef.current.compact ? 15 : 17}px "Segoe UI", system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = `rgba(245, 248, 255, ${0.85 + hover * 0.15})`;
      ctx.shadowColor = `rgba(${r},${g},${b},0.9)`;
      ctx.shadowBlur = (12 + hover * 10) * blurScale;
      ctx.fillText(p.name, p.x, p.y - R * 1.45 + bob);

      // Tier and field below
      ctx.shadowBlur = 0;
      ctx.font = `${dimensionsRef.current.compact ? 10 : 11}px "Segoe UI", system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = `rgba(${r},${g},${b},0.85)`;
      ctx.fillText(`${p.tier.toUpperCase()} \u00B7 ${p.field.toUpperCase()}`, p.x, p.y + R * 1.65);
    };

    const drawFieldLabels = () => {
      if (dimensionsRef.current.compact || portalsRef.current.length < 9) return;
      const labels = ['Developer', 'Designer', 'Illustrator and Comic Artist'];
      ctx.textAlign = 'center';
      ctx.font = '11px "Segoe UI", system-ui, -apple-system, sans-serif';
      ctx.fillStyle = 'rgba(122, 132, 166, 0.7)';
      labels.forEach((label, i) => {
        const portal = portalsRef.current[i * 3];
        if (portal) {
          const rowY = portal.y - portal.r * 2.3;
          ctx.fillText(label.toUpperCase(), dimensionsRef.current.W / 2, rowY);
        }
      });
    };

    const render = (now: number) => {
      const { W, H } = dimensionsRef.current;
      const viewTop = window.scrollY - 220;
      const viewBottom = window.scrollY + window.innerHeight + 220;

      ctx.clearRect(0, 0, W, H);
      drawStars(viewTop, viewBottom);
      drawFieldLabels();

      const active = hoveredRef.current >= 0 ? hoveredRef.current : (now < flashUntilRef.current ? flashIdxRef.current : -1);

      portalsRef.current.forEach((p, i) => {
        p.glow += ((i === active ? 1 : 0) - p.glow) * 0.12;
        if (p.y < viewTop || p.y > viewBottom) return;
        drawPortal(p, now / 1000);
      });

      animId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', layout);
    layout();
    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', layout);
      cancelAnimationFrame(animId);
    };
  }, [portalsData, isTouch, reduceMotion]);

  const activePortal = hoveredIndex >= 0 ? portalsData[hoveredIndex] : null;

  return (
    <main className={styles.hubContainer}>
      <header className={styles.topBar}>
        <div className={styles.topBarActions}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={onToggleAudio}
            aria-label={isAudioMuted ? 'Unmute Soundscape' : 'Mute Soundscape'}
            title={isAudioMuted ? 'Soundscape Muted' : 'Soundscape Active'}
          >
            {isAudioMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            <span>{isAudioMuted ? 'Muted' : 'Sound On'}</span>
          </button>
          <button
            type="button"
            className={styles.commissionBtn}
            onClick={() => onOpenCommission()}
          >
            <Mail size={14} />
            <span>Commission</span>
          </button>
        </div>
      </header>

      <div id="stage" ref={stageRef} className={styles.stage}>
        <canvas id="scene" ref={canvasRef} className={styles.sceneCanvas} aria-hidden="true" />

        <div className={styles.overlay}>
          <div className={styles.mark}>Esosa Portfolio Sanctum</div>
          <h1 className={styles.title}>Choose a world</h1>
          <div className={`${styles.hint} ${activePortal ? styles.hintActive : ''}`}>
            {activePortal ? `Enter ${activePortal.name}` : defaultHint}
          </div>
        </div>

        {/* Accessible interactive buttons overlaid on each portal */}
        {portalsData.map((p, i) => {
          const rect = buttonRects[i];
          if (!rect) return null;
          return (
            <button
              key={p.id}
              type="button"
              className={styles.hit}
              style={{
                left: `${rect.left}px`,
                top: `${rect.top}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
              }}
              aria-label={`${p.name}, ${p.tier} ${p.field} world`}
              onPointerEnter={(e) => {
                if (e.pointerType === 'mouse') handleHoverChange(i);
              }}
              onPointerLeave={() => {
                if (hoveredRef.current === i) handleHoverChange(-1);
              }}
              onFocus={(e) => {
                if (e.currentTarget.matches(':focus-visible')) handleHoverChange(i);
              }}
              onBlur={() => {
                if (hoveredRef.current === i) handleHoverChange(-1);
              }}
              onClick={() => handlePortalEnter(i)}
            />
          );
        })}
      </div>
    </main>
  );
};
