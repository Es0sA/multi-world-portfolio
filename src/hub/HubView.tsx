import React, { useEffect, useRef, useState, useCallback } from 'react';
import { WorldConfig } from '../types/world';
import { HUB_WORLDS } from './hubData';
import { soundEngine } from '../audio/soundEngine';
import { Volume2, VolumeX, Mail } from 'lucide-react';
import styles from './Hub.module.css';

interface HubViewProps {
  onSelectWorld: (world: WorldConfig, portalCoords: { x: number; y: number; color: [number, number, number] }) => void;
  onOpenCommission: (worldName?: string) => void;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  arrivingFromWorldId?: string | null;
  onArriveAnimationComplete?: () => void;
}

interface PortalItem {
  id: string;
  name: string;
  field: string;
  tier: string;
  color: [number, number, number];
  url: string | null;
  world: WorldConfig;
  x: number;
  y: number;
  r: number;
  seed: number;
  glow: number;
  fade: number;
  spin: number;
  rot: number;
}

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
}

const PORTAL_SPECS = [
  { id: 'terminal-office', name: 'Terminal Office', field: 'Developer', tier: 'Regular', color: [93, 255, 138] as [number, number, number], url: null },
  { id: 'cpu-and-monitor', name: 'CPU and Monitor', field: 'Developer', tier: 'Crazy', color: [255, 157, 77] as [number, number, number], url: null },
  { id: 'circuit-city', name: 'Circuit City', field: 'Developer', tier: 'Beyond', color: [77, 166, 255] as [number, number, number], url: null },
  { id: 'gallery-wall', name: 'Gallery Wall', field: 'Designer', tier: 'Regular', color: [240, 240, 240] as [number, number, number], url: 'gallery-wall.html' },
  { id: 'sketchbook', name: 'Sketchbook Explosion', field: 'Designer', tier: 'Crazy', color: [255, 216, 77] as [number, number, number], url: null },
  { id: 'paint-universe', name: 'Paint Universe', field: 'Designer', tier: 'Beyond', color: [255, 111, 216] as [number, number, number], url: null },
  { id: 'comic-page', name: 'Comic Page', field: 'Illustrator', tier: 'Regular', color: [255, 77, 109] as [number, number, number], url: 'comic-page.html' },
  { id: 'pop-up-book', name: 'Pop-Up Book', field: 'Illustrator', tier: 'Crazy', color: [180, 140, 255] as [number, number, number], url: null },
  { id: 'ink-dimension', name: 'Ink Dimension', field: 'Illustrator', tier: 'Beyond', color: [154, 163, 184] as [number, number, number], url: null }
];

const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function runAnim(dur: number, fn: (t: number) => void, done?: () => void) {
  const t0 = performance.now();
  function step(now: number) {
    const t = Math.min(1, (now - t0) / dur);
    fn(t);
    if (t < 1) requestAnimationFrame(step);
    else if (done) done();
  }
  requestAnimationFrame(step);
}

function dmaxAt(x: number, y: number) {
  return 2 * Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 60;
}

export const HubView: React.FC<HubViewProps> = ({
  onSelectWorld,
  onOpenCommission,
  isAudioMuted,
  onToggleAudio,
  arrivingFromWorldId,
  onArriveAnimationComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const discRef = useRef<HTMLDivElement | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [isReturning, setIsReturning] = useState<boolean>(false);
  const [buttonRects, setButtonRects] = useState<{ left: number; top: number; width: number; height: number }[]>([]);

  const hoveredRef = useRef<number>(-1);
  const busyIdxRef = useRef<number>(-1);
  const boostIdxRef = useRef<number>(-1);
  const boostSpinRef = useRef<number>(1);
  const boostGlowRef = useRef<number>(0);
  const othersFadeRef = useRef<number>(1);

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

  const portalsData = React.useMemo(() => {
    return PORTAL_SPECS.map((spec) => {
      const foundWorld =
        HUB_WORLDS.find(
          (w) =>
            w.id === spec.id ||
            (spec.id === 'gallery-wall' && w.id === 'curator-monolith') ||
            (spec.id === 'cpu-and-monitor' && w.id === 'retro-workstation') ||
            (spec.id === 'circuit-city' && w.id === 'silicon-matrix') ||
            (spec.id === 'sketchbook' && w.id === 'torn-atelier') ||
            (spec.id === 'paint-universe' && w.id === 'pigment-nebula') ||
            (spec.id === 'comic-page' && w.id === 'graphic-chronicle') ||
            (spec.id === 'pop-up-book' && w.id === 'origami-vault') ||
            (spec.id === 'ink-dimension' && w.id === 'monochrome-rift')
        ) || HUB_WORLDS[0];
      return {
        ...spec,
        world: foundWorld,
      };
    });
  }, []);

  const setDiscStyle = (x: number, y: number, D: number) => {
    const disc = discRef.current;
    if (!disc) return;
    disc.style.left = `${x}px`;
    disc.style.top = `${y}px`;
    disc.style.width = `${D}px`;
    disc.style.height = `${D}px`;
  };

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2400);
  }, []);

  const closePortal = useCallback((i: number, vx: number, vy: number, fromD: number) => {
    const p = portalsRef.current[i];
    if (!p) return;
    const endD = p.r * 1.0;
    boostSpinRef.current = 1;
    boostGlowRef.current = 0;
    othersFadeRef.current = 1;

    runAnim(1300, (t) => setDiscStyle(vx, vy, lerp(fromD, endD, easeIO(t))), () => {
      const disc = discRef.current;
      if (disc) {
        disc.style.transition = 'opacity 0.35s ease';
        disc.style.opacity = '0';
        setTimeout(() => {
          disc.style.display = 'none';
          disc.style.opacity = '';
          disc.style.transition = '';
          boostIdxRef.current = -1;
          busyIdxRef.current = -1;
          setIsReturning(false);
          if (onArriveAnimationComplete) onArriveAnimationComplete();
        }, 380);
      }
    });
  }, [onArriveAnimationComplete]);

  const handlePortalEnter = useCallback((index: number) => {
    if (busyIdxRef.current >= 0) return;
    const p = portalsRef.current[index] || portalsData[index];
    if (!p) return;

    if (reduceMotion) {
      if (p.url) {
        soundEngine.playPortalWarp();
        onSelectWorld(p.world, { x: p.x / window.innerWidth, y: (p.y - window.scrollY) / window.innerHeight, color: p.color });
      } else {
        showToast(`${p.name} is not built yet`);
      }
      return;
    }

    busyIdxRef.current = index;
    boostIdxRef.current = index;
    boostSpinRef.current = 9;
    boostGlowRef.current = 1.6;
    othersFadeRef.current = 0.18;
    hoveredRef.current = -1;
    setHoveredIndex(-1);

    const disc = discRef.current;
    if (disc) {
      disc.style.setProperty('--pc', p.color.join(','));
      document.documentElement.style.setProperty('--pc', p.color.join(','));
    }

    const vx = p.x;
    const vy = p.y - window.scrollY;
    const d0 = p.r * 1.2;
    const d1 = dmaxAt(vx, vy);

    soundEngine.playPortalWarp();

    setTimeout(() => {
      if (disc) {
        disc.style.display = 'block';
        setDiscStyle(vx, vy, d0);
        runAnim(1000, (t) => setDiscStyle(vx, vy, lerp(d0, d1, easeIO(t))), () => {
          if (p.url) {
            onSelectWorld(p.world, {
              x: vx / window.innerWidth,
              y: vy / window.innerHeight,
              color: p.color,
            });
          } else {
            showToast(`${p.name} is not built yet`);
            setTimeout(() => {
              closePortal(index, vx, vy, d1);
            }, 900);
          }
        });
      }
    }, 450);
  }, [closePortal, onSelectWorld, portalsData, reduceMotion, showToast]);

  const handleHoverChange = useCallback((index: number) => {
    if (busyIdxRef.current >= 0) return;
    hoveredRef.current = index;
    setHoveredIndex(index);
    if (index >= 0) {
      soundEngine.playPortalHover();
    }
  }, []);

  // Check arrive from world animation
  useEffect(() => {
    if (!arrivingFromWorldId || portalsRef.current.length === 0) return;
    const idx = portalsRef.current.findIndex(
      (w) =>
        w.id === arrivingFromWorldId ||
        (w.id === 'gallery-wall' && arrivingFromWorldId === 'curator-monolith') ||
        (w.id === 'comic-page' && arrivingFromWorldId === 'graphic-chronicle')
    );
    if (idx < 0) return;

    const p = portalsRef.current[idx];
    const disc = discRef.current;
    if (!disc) return;

    setIsReturning(true);
    window.scrollTo(0, Math.max(0, p.y - window.innerHeight / 2));
    busyIdxRef.current = idx;
    boostIdxRef.current = idx;
    boostSpinRef.current = 1;
    boostGlowRef.current = 0;
    othersFadeRef.current = 0.18;
    p.spin = 9;
    p.glow = 1.6;
    portalsRef.current.forEach((o, k) => { if (k !== idx) o.fade = 0.18; });

    disc.style.setProperty('--pc', p.color.join(','));
    disc.style.display = 'block';

    const vx = p.x;
    const vy = p.y - window.scrollY;
    const d1 = dmaxAt(vx, vy);
    setDiscStyle(vx, vy, d1);

    const timer = setTimeout(() => {
      closePortal(idx, vx, vy, d1);
    }, 350);

    return () => clearTimeout(timer);
  }, [arrivingFromWorldId, closePortal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastNow = 0;

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

      const old = portalsRef.current;
      const computedPortals: PortalItem[] = portalsData.map((w, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const inRow = Math.min(cols, portalsData.length - row * cols);
        const offset = ((cols - inRow) * cellW) / 2;
        const o = old[i];
        return {
          ...w,
          x: cellW * col + cellW / 2 + offset,
          y: topPad + cellH * row + cellH / 2,
          r: radius,
          seed: (i + 1) * 7.3,
          glow: o ? o.glow : 0,
          fade: o ? o.fade : 1,
          spin: o ? o.spin : 1,
          rot: o ? o.rot : (i + 1) * 7.3,
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
      const blurScale = isTouch ? 0.5 : 1;

      ctx.globalAlpha = Math.max(0, Math.min(1, p.fade));

      // Outer aura
      const aura = ctx.createRadialGradient(p.x, p.y, R * 0.4, p.x, p.y, R * 2.1);
      aura.addColorStop(0, `rgba(${r},${g},${b},${Math.min(1, 0.10 + hover * 0.25)})`);
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
        ctx.rotate(p.rot * (k % 2 ? -1 : 1) * (1 + k * 0.2));
        ctx.beginPath();
        ctx.ellipse(0, 0, ringR, ringR * squash, 0, 0.2, Math.PI * 1.6);
        ctx.strokeStyle = `rgba(${r},${g},${b},${Math.min(1, 0.35 + hover * 0.4 - k * 0.05)})`;
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
      core.addColorStop(0.8, `rgba(${r},${g},${b},${Math.min(1, 0.15 + hover * 0.2)})`);
      core.addColorStop(1, 'rgba(2,3,10,0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(p.x, p.y, R * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Orbiting motes
      if (!reduceMotion) {
        for (let m = 0; m < 6; m++) {
          const a = time * (0.6 + m * 0.07) * (0.6 + p.spin * 0.4) + m * 1.05 + p.seed;
          const d = R * (0.9 + Math.sin(time + m) * 0.1);
          ctx.beginPath();
          ctx.arc(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d * 0.4, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(1, 0.6 + hover * 0.4)})`;
          ctx.fill();
        }
      }

      // Name floating above portal
      const bob = reduceMotion ? 0 : Math.sin(time * 1.3 + p.seed) * 3;
      ctx.textAlign = 'center';
      ctx.font = `500 ${dimensionsRef.current.compact ? 15 : 17}px "Segoe UI", system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = `rgba(245, 248, 255, ${Math.min(1, 0.85 + hover * 0.15)})`;
      ctx.shadowColor = `rgba(${r},${g},${b},0.9)`;
      ctx.shadowBlur = (12 + hover * 10) * blurScale;
      ctx.fillText(p.name, p.x, p.y - R * 1.45 + bob);

      // Tier and field below
      ctx.shadowBlur = 0;
      ctx.font = `${dimensionsRef.current.compact ? 10 : 11}px "Segoe UI", system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = `rgba(${r},${g},${b},0.85)`;
      ctx.fillText(`${p.tier.toUpperCase()} \u00B7 ${p.field.toUpperCase()}`, p.x, p.y + R * 1.65);

      ctx.globalAlpha = 1;
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
      const dt = Math.min(0.05, (now - lastNow) / 1000 || 0.016);
      lastNow = now;
      const { W, H } = dimensionsRef.current;
      const viewTop = window.scrollY - 220;
      const viewBottom = window.scrollY + window.innerHeight + 220;

      ctx.clearRect(0, 0, W, H);
      drawStars(viewTop, viewBottom);
      drawFieldLabels();

      portalsRef.current.forEach((p, i) => {
        const boosted = i === boostIdxRef.current;
        const glowT = boosted ? boostGlowRef.current : (i === hoveredRef.current && boostIdxRef.current < 0 ? 1 : 0);
        p.glow += (glowT - p.glow) * 0.12;
        p.fade += ((boosted ? 1 : othersFadeRef.current) - p.fade) * 0.1;
        p.spin += ((boosted ? boostSpinRef.current : 1) - p.spin) * 0.06;
        if (!reduceMotion) p.rot += dt * 0.4 * p.spin;
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

  const activeIndex = boostIdxRef.current >= 0 ? boostIdxRef.current : hoveredIndex;
  const activePortal = activeIndex >= 0 ? portalsData[activeIndex] : null;

  return (
    <main className={styles.hubContainer}>
      <div ref={discRef} className={styles.disc} aria-hidden="true" />

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
          <div className={`${styles.hint} ${(activePortal || isReturning) ? styles.hintActive : ''}`}>
            {isReturning
              ? 'Returning to the hub'
              : activePortal
              ? `Entering ${activePortal.name}`
              : defaultHint}
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

      <div
        className={`${styles.toast} ${toastVisible ? styles.toastShow : ''}`}
        role="status"
        aria-live="polite"
      >
        {toastMessage}
      </div>
    </main>
  );
};
