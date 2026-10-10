import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { soundEngine } from '../../audio/soundEngine';
import styles from './gallery.module.css';

interface GalleryWallWorldProps {
  onReturn: () => void;
  onOpenCommission: (worldName?: string) => void;
  arrivedFromPortal?: boolean;
  portalCoords?: { x: number; y: number; color: [number, number, number] };
  onReturnWithPortal?: (coords: { x: number; y: number; color: [number, number, number] }) => void;
}

interface GalleryProject {
  title: string;
  year: string;
  category: string;
  ar: number;
  col: [number, number];
  frame: 'black' | 'oak' | 'white' | 'gold' | 'float';
  depth: number;
  role: string;
  client: string;
  tools: string;
  tags: string[];
  link?: string;
  description: string;
  image?: string;
}

const PROJECTS: GalleryProject[] = [
  {
    title: 'Meridian Identity',
    year: '2025',
    category: 'Brand identity',
    ar: 0.8,
    col: [2, 4],
    frame: 'black',
    depth: -50,
    role: 'Lead designer',
    client: 'Client name (sample)',
    tools: 'Illustrator, Figma',
    tags: ['Logo', 'Guidelines', 'Stationery'],
    link: '#',
    description: 'Sample description. Replace this with the real story of the project: the problem, the approach, and what changed because of the work.'
  },
  {
    title: 'Field Notes',
    year: '2024',
    category: 'Editorial design',
    ar: 1.5,
    col: [6, 7],
    frame: 'oak',
    depth: 40,
    role: 'Art direction and layout',
    client: 'Client name (sample)',
    tools: 'InDesign, Photoshop',
    tags: ['Magazine', 'Layout', 'Typography'],
    link: '#',
    description: 'Sample description. A short paragraph about the brief, the decisions you made, and the result. Two or three sentences is plenty.'
  },
  {
    title: 'Low Tide Series',
    year: '2024',
    category: 'Poster design',
    ar: 1,
    col: [3, 5],
    frame: 'float',
    depth: -30,
    role: 'Designer and illustrator',
    client: 'Personal project (sample)',
    tools: 'Procreate, Risograph',
    tags: ['Poster', 'Print', 'Series'],
    link: '#',
    description: 'Sample description. Use this space to explain the idea behind the work and anything you learned while making it.'
  },
  {
    title: 'Arcadia Packaging',
    year: '2023',
    category: 'Packaging',
    ar: 0.72,
    col: [8, 4],
    frame: 'white',
    depth: 70,
    role: 'Packaging designer',
    client: 'Client name (sample)',
    tools: 'Illustrator, Dimension',
    tags: ['Packaging', 'Label', 'Print'],
    link: '#',
    description: 'Sample description. Explain the product, the audience, and how the packaging helped it stand out on the shelf.'
  },
  {
    title: 'Halcyon Interface',
    year: '2023',
    category: 'UI design',
    ar: 1.33,
    col: [2, 7],
    frame: 'black',
    depth: -60,
    role: 'Product designer',
    client: 'Client name (sample)',
    tools: 'Figma, Protopie',
    tags: ['App', 'Interface', 'Prototype'],
    link: '#',
    description: 'Sample description. Describe the product, who used it, and the design decisions that made it easier to use.'
  },
  {
    title: 'Common Ground',
    year: '2022',
    category: 'Campaign',
    ar: 1,
    col: [7, 4],
    frame: 'gold',
    depth: 30,
    role: 'Creative lead',
    client: 'Client name (sample)',
    tools: 'After Effects, Photoshop',
    tags: ['Campaign', 'Social', 'Motion'],
    link: '#',
    description: 'Sample description. Share the goal of the campaign and the way the visual idea carried across every channel.'
  },
  {
    title: 'Quiet Type Specimen',
    year: '2022',
    category: 'Typography',
    ar: 0.67,
    col: [4, 4],
    frame: 'oak',
    depth: -40,
    role: 'Type designer',
    client: 'Personal project (sample)',
    tools: 'Glyphs, InDesign',
    tags: ['Typeface', 'Specimen', 'Lettering'],
    link: '#',
    description: 'Sample description. Talk about the typeface, what inspired its shapes, and where it works best.'
  },
  {
    title: 'Northbound Wayfinding',
    year: '2021',
    category: 'Environmental design',
    ar: 1.6,
    col: [3, 8],
    frame: 'float',
    depth: 50,
    role: 'Environmental designer',
    client: 'Client name (sample)',
    tools: 'Illustrator, SketchUp',
    tags: ['Signage', 'Wayfinding', 'Spatial'],
    link: '#',
    description: 'Sample description. Describe the space, the visitors, and how the signage helped people find their way.'
  }
];

const PALETTES = [
  ['#e9e1d3', '#c9573a', '#2f3e46', '#e7b04a', '#f6f1e7'],
  ['#1f2a44', '#e9d8c4', '#d96c4a', '#7a9e9f', '#f4efe6'],
  ['#efe9dd', '#27413b', '#b3563b', '#d8b765', '#8aa39b'],
  ['#f2ece4', '#3b3a52', '#e0715a', '#9db4c0', '#c7a27c'],
  ['#e8e4dc', '#101820', '#f2a900', '#6b8f71', '#d1495b'],
  ['#f3ede2', '#4a5d4f', '#c97b63', '#e6c9a8', '#2b2d42'],
  ['#ebe6dc', '#32436b', '#cf6a4c', '#e9c46a', '#5a8f87'],
  ['#efeae0', '#1b1b1b', '#8c6f50', '#c9b79c', '#e4e0d6']
];

function rng(seed: number) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function bgRect(p: string[], W: number, H: number) {
  return `<rect width="${W}" height="${H}" fill="${p[0]}"/>`;
}

function g0(R: () => number, p: string[], W: number, H: number) {
  let s = bgRect(p, W, H);
  const cx = W * (0.35 + R() * 0.3);
  const cy = H * (0.4 + R() * 0.2);
  const n = 14;
  for (let i = n; i > 0; i--) {
    const r = i * (Math.max(W, H) / n) * 0.9;
    s += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${p[(i % 4) + 1]}" opacity="${(0.12 + ((n - i) / n) * 0.5).toFixed(2)}"/>`;
  }
  s += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${W * 0.05}" fill="${p[1]}"/>`;
  return s;
}

function g1(R: () => number, p: string[], W: number, H: number, uid: string) {
  const f = 'f' + uid;
  const a = H * (0.1 + R() * 0.05);
  const b = H * (0.5 + R() * 0.05);
  let s = `<defs><filter id="${f}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${W * 0.012}"/></filter></defs>` + bgRect(p, W, H);
  s += `<rect x="${W * 0.1}" y="${a}" width="${W * 0.8}" height="${b - a - H * 0.04}" rx="6" fill="${p[1]}" filter="url(#${f})"/>`;
  s += `<rect x="${W * 0.1}" y="${b + H * 0.02}" width="${W * 0.8}" height="${H * 0.88 - b}" rx="6" fill="${p[2]}" filter="url(#${f})"/>`;
  s += `<rect x="${W * 0.1}" y="${b - H * 0.03}" width="${W * 0.8}" height="${H * 0.05}" fill="${p[3]}" opacity="0.55" filter="url(#${f})"/>`;
  return s;
}

function g2(R: () => number, p: string[], W: number, H: number) {
  const n = 6;
  const c = W / n;
  const rows = Math.ceil(H / c);
  let s = bgRect(p, W, H);
  for (let r = 0; r < rows; r++) {
    for (let cc = 0; cc < n; cc++) {
      const x = cc * c;
      const y = r * c;
      const k = Math.floor(R() * 5);
      const col = p[1 + Math.floor(R() * 4)];
      if (k === 0) s += `<rect x="${x}" y="${y}" width="${c}" height="${c}" fill="${col}"/>`;
      else if (k === 1) s += `<circle cx="${x + c / 2}" cy="${y + c / 2}" r="${c * 0.42}" fill="${col}"/>`;
      else if (k === 2) s += `<path d="M${x} ${y + c}A${c} ${c} 0 0 1 ${x + c} ${y}L${x + c} ${y + c}Z" fill="${col}"/>`;
      else if (k === 3) s += `<rect x="${x}" y="${y + c / 2}" width="${c}" height="${c / 2}" fill="${col}"/>`;
    }
  }
  return s;
}

function g3(R: () => number, p: string[], W: number, H: number) {
  let s = bgRect(p, W, H);
  const lines = 28;
  const f = 0.004 + R() * 0.004;
  const ph = R() * 6;
  s += `<circle cx="${W * 0.7}" cy="${H * 0.3}" r="${W * 0.09}" fill="${p[4]}"/>`;
  for (let i = 0; i < lines; i++) {
    const y0 = H * (0.06 + (0.88 * i) / (lines - 1));
    const A = H * (0.015 + 0.05 * Math.sin((i / lines) * Math.PI));
    let d = '';
    for (let x = 0; x <= W; x += 20) {
      const y = y0 + A * Math.sin(x * f * 5.6 + ph + i * 0.28);
      d += (x ? 'L' : 'M') + x + ' ' + y.toFixed(1);
    }
    s += `<path d="${d}" fill="none" stroke="${p[1 + (i % 3)]}" stroke-width="3.2" stroke-linecap="round" opacity="0.85"/>`;
  }
  return s;
}

function g4(R: () => number, p: string[], W: number, H: number) {
  const n = 4;
  const c = W / n;
  const rows = Math.ceil(H / c);
  let s = bgRect(p, W, H);
  for (let r = 0; r < rows; r++) {
    for (let cc = 0; cc < n; cc++) {
      const x = cc * c;
      const y = r * c;
      const col = p[1 + Math.floor(R() * 4)];
      const rot = Math.floor(R() * 4) * 90;
      const k = Math.floor(R() * 3);
      let shape = '';
      if (k === 0) shape = `<path d="M${x} ${y + c}V${y + c / 2}A${c / 2} ${c / 2} 0 0 1 ${x + c} ${y + c / 2}V${y + c}Z" fill="${col}"/>`;
      else if (k === 1) shape = `<circle cx="${x + c / 2}" cy="${y + c / 2}" r="${c * 0.34}" fill="${col}"/>`;
      else shape = `<path d="M${x} ${y}H${x + c}A${c} ${c} 0 0 1 ${x} ${y + c}Z" fill="${col}"/>`;
      s += `<g transform="rotate(${rot} ${x + c / 2} ${y + c / 2})">${shape}</g>`;
    }
  }
  return s;
}

function g5(R: () => number, p: string[], W: number, H: number) {
  let s = bgRect(p, W, H);
  const st = 34;
  const ang = R() * 6.28;
  s += `<circle cx="${(W * (0.3 + R() * 0.4)).toFixed(1)}" cy="${(H * (0.3 + R() * 0.3)).toFixed(1)}" r="${W * 0.3}" fill="${p[2]}" opacity="0.9"/>`;
  for (let y = st / 2; y < H; y += st) {
    for (let x = st / 2; x < W; x += st) {
      let t = (Math.cos(ang) * (x / W) + Math.sin(ang) * (y / H) + 1) / 2;
      t = Math.max(0, Math.min(1, t));
      const r = st * 0.5 * Math.pow(t, 1.2);
      if (r > 1) s += `<circle cx="${x}" cy="${y}" r="${r.toFixed(1)}" fill="${p[1]}"/>`;
    }
  }
  return s;
}

function g6(R: () => number, p: string[], W: number, H: number) {
  let s = bgRect(p, W, H);
  for (let i = 0; i < 7; i++) {
    const r = W * (0.2 + R() * 0.18);
    s += `<circle cx="${(W * (0.15 + R() * 0.7)).toFixed(1)}" cy="${(H * (0.15 + R() * 0.7)).toFixed(1)}" r="${r.toFixed(1)}" fill="${p[1 + (i % 4)]}" opacity="0.6" style="mix-blend-mode:multiply"/>`;
  }
  return s;
}

function g7(R: () => number, p: string[], W: number, H: number) {
  let s = bgRect(p, W, H);
  const cx = W * (0.3 + R() * 0.4);
  const cy = H * (0.3 + R() * 0.4);
  const ph = [R() * 6.28, R() * 6.28, R() * 6.28];
  const max = Math.max(W, H) * 0.85;
  for (let k = 18; k >= 1; k--) {
    const base = (max * k) / 18;
    let d = '';
    for (let a = 0; a <= 72; a++) {
      const t = (a / 72) * Math.PI * 2;
      const n = 1 + 0.12 * Math.sin(2 * t + ph[0]) + 0.08 * Math.sin(3 * t + ph[1]) + 0.05 * Math.sin(5 * t + ph[2]);
      d += (a ? 'L' : 'M') + (cx + Math.cos(t) * base * n).toFixed(1) + ' ' + (cy + Math.sin(t) * base * n).toFixed(1);
    }
    s += `<path d="${d}Z" fill="${k % 5 === 0 ? p[2] : 'none'}" fill-opacity="0.18" stroke="${p[1]}" stroke-width="${k % 5 === 0 ? 3 : 1.6}" stroke-opacity="0.8"/>`;
  }
  return s;
}

const GENERATORS = [g0, g1, g2, g3, g4, g5, g6, g7];

function makeArt(i: number, ar: number, uid: string) {
  const W = 1000;
  const H = Math.round(1000 / ar);
  const R = rng(i * 977 + 13);
  const inner = GENERATORS[i % GENERATORS.length](R, PALETTES[i % PALETTES.length], W, H, uid);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Artwork">${inner}</svg>`;
}

export const GalleryWallWorld: React.FC<GalleryWallWorldProps> = ({ 
  onReturn, 
  onOpenCommission,
  arrivedFromPortal = true,
  portalCoords = { x: 0.5, y: 0.5, color: [240, 240, 240] },
  onReturnWithPortal
}) => {
  const [introLeave, setIntroLeave] = useState<boolean>(false);
  const [introRemoved, setIntroRemoved] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [progressVisible, setProgressVisible] = useState<boolean>(false);
  const [currentProgressIndex, setCurrentProgressIndex] = useState<number>(0);
  const [visibleItems, setVisibleItems] = useState<Record<number, boolean>>({});
  const [irisVisible, setIrisVisible] = useState<boolean>(false);

  const wallRef = useRef<HTMLDivElement | null>(null);
  const spotRef = useRef<HTMLDivElement | null>(null);
  const lbArtRef = useRef<HTMLDivElement | null>(null);
  const lbInfoRef = useRef<HTMLElement | null>(null);
  const irisRef = useRef<HTMLDivElement | null>(null);
  const worksRef = useRef<(HTMLElement | null)[]>([]);
  const leavingRef = useRef<boolean>(false);

  const pad = (n: number) => String(n).padStart(2, '0');

  useEffect(() => {
    soundEngine.setAmbientMood('curator-monolith');
  }, []);

  const dmax = (x: number, y: number) =>
    2 * Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight + 160 - y)) + 60;

  const setIrisStyle = (x: number, y: number, D: number) => {
    const iris = irisRef.current;
    if (!iris) return;
    iris.style.left = `${x}px`;
    iris.style.top = `${y}px`;
    iris.style.width = `${D}px`;
    iris.style.height = `${D}px`;
  };

  const handleDismissIntro = useCallback(() => {
    if (introLeave) return;
    setIntroLeave(true);
    setTimeout(() => {
      setIsReady(true);
    }, 650);
    setTimeout(() => {
      setIntroRemoved(true);
    }, 1900);
  }, [introLeave]);

  // Arriving through portal: opening circular hole
  useEffect(() => {
    const pc = portalCoords.color;
    const lum = 0.299 * pc[0] + 0.587 * pc[1] + 0.114 * pc[2];
    document.documentElement.style.setProperty('--pc', pc.join(','));
    document.documentElement.style.setProperty('--ring', lum > 150 ? '28,26,23' : '255,255,255');

    if (!arrivedFromPortal) {
      const timer = setTimeout(() => {
        handleDismissIntro();
      }, 3000);
      return () => clearTimeout(timer);
    }

    // Portal entry
    setIntroRemoved(true);
    setIrisVisible(true);
    const vx = portalCoords.x * window.innerWidth;
    const vy = portalCoords.y * window.innerHeight;
    const big = dmax(vx, vy);

    setIrisStyle(vx, vy, 0);
    setTimeout(() => {
      setIsReady(true);
    }, 650);

    const t0 = performance.now();
    let animId: number;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / 1600);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setIrisStyle(vx, vy, big * ease);
      if (t < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setIrisVisible(false);
      }
    };

    const delayTimer = setTimeout(() => {
      animId = requestAnimationFrame(step);
    }, 250);

    return () => {
      clearTimeout(delayTimer);
      cancelAnimationFrame(animId);
    };
  }, [arrivedFromPortal, portalCoords, handleDismissIntro]);

  const handleLeavePortal = useCallback(() => {
    if (leavingRef.current) return;
    leavingRef.current = true;

    const vx = portalCoords.x * window.innerWidth;
    const vy = portalCoords.y * window.innerHeight;
    const big = dmax(vx, vy);

    setIrisVisible(true);
    setIrisStyle(vx, vy, big);

    const t0 = performance.now();
    let animId: number;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / 1250);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setIrisStyle(vx, vy, big * (1 - ease));
      if (t < 1) {
        animId = requestAnimationFrame(step);
      } else {
        if (onReturnWithPortal) {
          onReturnWithPortal(portalCoords);
        } else {
          onReturn();
        }
      }
    };
    animId = requestAnimationFrame(step);
  }, [onReturn, onReturnWithPortal, portalCoords]);

  // Mouse spotlight
  useEffect(() => {
    const spot = spotRef.current;
    if (!spot) return;
    let sx = window.innerWidth / 2;
    let sy = window.innerHeight / 2;
    let mx = sx;
    let my = sy;
    let animId: number;

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      mx = e.clientX;
      my = e.clientY;
      spot.classList.add(styles.spotOn);
    };

    const loop = () => {
      const ox = mx - sx;
      const oy = my - sy;
      if (Math.abs(ox) > 0.1 || Math.abs(oy) > 0.1) {
        sx += ox * 0.12;
        sy += oy * 0.12;
        spot.style.setProperty('--mx', `${sx.toFixed(1)}px`);
        spot.style.setProperty('--my', `${sy.toFixed(1)}px`);
      }
      animId = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  // IntersectionObserver for reveal on scroll
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idxStr = entry.target.getAttribute('data-index');
            if (idxStr !== null) {
              const idx = parseInt(idxStr, 10);
              setVisibleItems((prev) => ({ ...prev, [idx]: true }));
              obs.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );

    worksRef.current.forEach((el) => {
      if (el) obs.observe(el);
    });

    return () => obs.disconnect();
  }, []);

  // Parallax on scroll
  useEffect(() => {
    let animId: number | null = null;
    const wall = wallRef.current;
    if (!wall) return;

    const handleScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      const center = y + vh / 2;

      const wr = wall.getBoundingClientRect();
      const wallTop = wr.top + y;
      const wallBottom = wallTop + wall.offsetHeight;

      let bestIdx = 0;
      let minDistance = 1e9;

      const k = window.innerWidth < 900 ? 0.5 : 1;

      worksRef.current.forEach((fig, i) => {
        if (!fig) return;
        const figMid = wallTop + fig.offsetTop + fig.offsetHeight / 2;
        const d = (figMid - center) / vh;
        const absD = Math.abs(d);

        if (absD < minDistance) {
          minDistance = absD;
          bestIdx = i;
        }

        if (absD < 1.6) {
          const depthVal = (PROJECTS[i].depth || 0) * k;
          fig.style.transform = `translate3d(0, ${(-d * depthVal).toFixed(1)}px, 0)`;
        }
      });

      const inWall = center > wallTop - vh * 0.2 && center < wallBottom;
      setProgressVisible(inWall);
      setCurrentProgressIndex(bestIdx);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (animId !== null) cancelAnimationFrame(animId);
    };
  }, []);

  // Lightbox keyboard controls
  useEffect(() => {
    if (!lightboxOpen || selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateLightbox(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateLightbox(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, selectedIndex]);

  const openLightbox = (index: number) => {
    soundEngine.playPortalHover();
    setSelectedIndex(index);
    setLightboxOpen(true);
    document.documentElement.classList.add(styles.introLock);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.documentElement.classList.remove(styles.introLock);
    setTimeout(() => {
      setSelectedIndex(null);
    }, 450);
  };

  const navigateLightbox = (direction: number) => {
    if (selectedIndex === null) return;
    const nextIdx = (selectedIndex + direction + PROJECTS.length) % PROJECTS.length;
    setSelectedIndex(nextIdx);
  };

  const activeProject = selectedIndex !== null ? PROJECTS[selectedIndex] : null;

  return (
    <div className={styles.galleryScope}>
      {/* Portal Iris transition element */}
      <div
        ref={irisRef}
        className={`${styles.iris} ${irisVisible ? styles.irisVisible : ''}`}
        aria-hidden="true"
      />

      {/* Intro Curtain */}
      {!introRemoved && (
        <div
          className={`${styles.intro} ${introLeave ? styles.introLeave : ''}`}
          onClick={handleDismissIntro}
          aria-hidden="true"
        >
          <div>
            <span className={styles.introKicker}>A quiet room of work</span>
            <h1 className={styles.introTitle}>
              {'Gallery Wall'.split(' ').map((word, wi) => (
                <span key={wi} className={styles.word}>
                  {word.split('').map((ch, ci) => (
                    <span key={ci} className={styles.introCh} style={{ ['--i' as any]: wi * 8 + ci }}>
                      {ch}
                    </span>
                  ))}
                  {' '}
                </span>
              ))}
            </h1>
            <div className={styles.introLine} />
            <span className={styles.introSkip}>Click to enter</span>
          </div>
        </div>
      )}

      {/* Return to hub control */}
      <button
        type="button"
        className={styles.returnBtn}
        onClick={handleLeavePortal}
        title="Return to the hub"
        aria-label="Return to the hub"
      >
        <i className={styles.returnOrb} aria-hidden="true" />
        Return to hub
      </button>

      <div className={styles.who}>
        Esosa Osaretin
        <span>Visual Designer</span>
      </div>

      <div ref={spotRef} className={styles.spot} aria-hidden="true" />

      {/* Hero */}
      <section className={styles.hero}>
        <div>
          <p className={`${styles.eyebrow} ${isReady ? styles.readyElement : ''}`}>
            Sample portfolio &nbsp;·&nbsp; Visual design
          </p>
          <h2 className={styles.heroTitle}>
            {'Selected Works'.split(' ').map((word, wi) => (
              <span key={wi} className={styles.word}>
                {word.split('').map((ch, ci) => (
                  <span
                    key={ci}
                    className={`${styles.ch} ${isReady ? styles.readyHeroCh : ''}`}
                    style={{ ['--i' as any]: wi * 8 + ci }}
                  >
                    {ch}
                  </span>
                ))}
                {' '}
              </span>
            ))}
          </h2>
          <p className={`${styles.heroSub} ${isReady ? styles.readyElement : ''}`}>
            Eight pieces, hung slowly. Walk the wall by scrolling, and step closer by selecting any frame.
          </p>
          <div className={`${styles.cue} ${isReady ? styles.readyElement : ''}`} aria-hidden="true" />
        </div>
      </section>

      {/* The Wall */}
      <main ref={wallRef} className={styles.wall} aria-label="Selected works">
        {PROJECTS.map((p, i) => {
          const isVisible = visibleItems[i];
          const frameClass =
            p.frame === 'black'
              ? styles.frameBlack
              : p.frame === 'oak'
              ? styles.frameOak
              : p.frame === 'white'
              ? styles.frameWhite
              : p.frame === 'gold'
              ? styles.frameGold
              : styles.frameFloat;

          const tilt = ((i % 2 ? 1 : -1) * (0.6 + (i % 3) * 0.3)).toFixed(2) + 'deg';

          return (
            <figure
              key={p.title}
              ref={(el) => { worksRef.current[i] = el; }}
              className={`${styles.work} ${isVisible ? styles.workIn : ''}`}
              data-index={i}
              style={{
                ['--ar' as any]: p.ar,
                ['--c' as any]: `${p.col[0]} / span ${p.col[1]}`,
                ['--tilt' as any]: tilt,
              }}
            >
              <div className={styles.hang}>
                <button
                  type="button"
                  className={`${styles.frame} ${frameClass}`}
                  onClick={() => openLightbox(i)}
                  aria-label={`View ${p.title}`}
                >
                  <span className={styles.mat}>
                    <span
                      className={styles.art}
                      dangerouslySetInnerHTML={{ __html: makeArt(i, p.ar, `${i}w`) }}
                    />
                  </span>
                  <span className={styles.viewHint} aria-hidden="true">
                    View work
                  </span>
                </button>
                <figcaption className={styles.placard}>
                  <span className={styles.no}>{pad(i + 1)}</span>
                  <span className={styles.ttl}>{p.title}</span>
                  <span className={styles.meta}>{p.year} &nbsp;·&nbsp; {p.category}</span>
                </figcaption>
              </div>
            </figure>
          );
        })}
      </main>

      {/* Outro */}
      <section className={styles.outro}>
        <h3>Thank you for walking the wall.</h3>
        <p>For commissions or a conversation, get in touch.</p>
        <div className={styles.outroBtns}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSolid}`}
            onClick={() => onOpenCommission('Gallery Wall')}
          >
            Commission Portfolio
          </button>
          <button type="button" className={styles.btn} onClick={handleLeavePortal}>
            Return to hub
          </button>
        </div>
      </section>

      {/* Scroll Progress */}
      <div className={`${styles.progress} ${progressVisible ? styles.progressShow : ''}`}>
        <span>{pad(currentProgressIndex + 1)}</span>
        <i className={styles.progressTrack}>
          <b
            className={styles.progressFill}
            style={{ width: `${((currentProgressIndex + 1) / PROJECTS.length) * 100}%` }}
          />
        </i>
        <span>{pad(PROJECTS.length)}</span>
      </div>

      {/* Fullscreen Lightbox */}
      {activeProject && (
        <div
          className={`${styles.lb} ${lightboxOpen ? styles.lbOpen : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label="Artwork viewer"
        >
          <div className={styles.lbBackdrop} onClick={closeLightbox} />
          <button
            type="button"
            className={styles.lbClose}
            onClick={closeLightbox}
          >
            Close <small>Esc</small>
          </button>
          <div className={styles.lbStage}>
            <div className={styles.lbArtWrap} onClick={(e) => { if (e.target === e.currentTarget) closeLightbox(); }}>
              <div
                ref={lbArtRef}
                className={styles.lbArt}
                style={{ ['--ar' as any]: activeProject.ar }}
                dangerouslySetInnerHTML={{
                  __html: makeArt(selectedIndex!, activeProject.ar, `${selectedIndex}l`),
                }}
              />
            </div>
            <aside ref={lbInfoRef} className={styles.lbInfo}>
              <div className={styles.lbNo}>
                {pad(selectedIndex! + 1)} / {pad(PROJECTS.length)}
              </div>
              <h2 className={styles.lbTitle}>{activeProject.title}</h2>
              <p className={styles.lbMeta}>
                {activeProject.year} &nbsp;·&nbsp; {activeProject.category}
              </p>
              <p className={styles.lbDesc}>{activeProject.description}</p>
              <dl className={styles.lbFacts}>
                <div>
                  <dt>Role</dt>
                  <dd>{activeProject.role}</dd>
                </div>
                <div>
                  <dt>Client</dt>
                  <dd>{activeProject.client}</dd>
                </div>
                <div>
                  <dt>Tools</dt>
                  <dd>{activeProject.tools}</dd>
                </div>
              </dl>
              <ul className={styles.lbTags}>
                {activeProject.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              <button
                type="button"
                className={`${styles.btn} ${styles.lbLink}`}
                onClick={() => onOpenCommission(`Gallery Wall: ${activeProject.title}`)}
              >
                Inquire about this piece &rarr;
              </button>
            </aside>
          </div>
          <div className={styles.lbNav}>
            <button
              type="button"
              onClick={() => navigateLightbox(-1)}
              aria-label="Previous work"
            >
              &larr;
            </button>
            <span>
              {pad(selectedIndex! + 1)} / {pad(PROJECTS.length)}
            </span>
            <button
              type="button"
              onClick={() => navigateLightbox(1)}
              aria-label="Next work"
            >
              &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
