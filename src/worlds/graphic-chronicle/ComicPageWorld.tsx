import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soundEngine } from '../../audio/soundEngine';
import { Mail } from 'lucide-react';
import styles from './comic.module.css';

interface ComicPageWorldProps {
  onReturn: () => void;
  onOpenCommission: (worldName?: string) => void;
  arrivedFromPortal?: boolean;
  portalCoords?: { x: number; y: number; color: [number, number, number] };
  onReturnWithPortal?: (coords: { x: number; y: number; color: [number, number, number] }) => void;
}

interface ComicProject {
  title: string;
  year: string;
  category: string;
  span: number;
  h: number;
  tilt: number;
  art: number;
  caption: string;
  bubble: string;
  bpos: string;
  sfx: string;
  sx: number;
  sy: number;
  sr: number;
  role: string;
  client: string;
  tools: string;
  tags: string[];
  link?: string;
  description: string;
  image?: string;
}

const PROJECTS: ComicProject[] = [
  {
    title: 'Night Courier',
    year: '2025',
    category: 'Cover art',
    span: 7,
    h: 34,
    tilt: -0.6,
    art: 0,
    caption: 'Chapter one. Midnight.',
    bubble: "Delivery's on me.",
    bpos: 'br l',
    sfx: 'ZOOM!',
    sx: 50,
    sy: 18,
    sr: -9,
    role: 'Illustrator and letterer',
    client: 'Sample Client',
    tools: 'Ink, digital color',
    tags: ['cover', 'action', 'night'],
    link: '#',
    description: 'A sample cover for a made-up courier story. Replace this text with a short note on the brief, your approach, and how it turned out.'
  },
  {
    title: 'Moth Market',
    year: '2025',
    category: 'Character design',
    span: 5,
    h: 34,
    tilt: 0.7,
    art: 2,
    caption: 'Meanwhile, at the lantern stalls.',
    bubble: 'Stay for the lanterns.',
    bpos: 'tr',
    sfx: 'FLUTTER',
    sx: 8,
    sy: 52,
    sr: -6,
    role: 'Character designer',
    client: 'Sample Studio',
    tools: 'Pencil, vector',
    tags: ['characters', 'world building'],
    link: '#',
    description: 'Sample character sheets for a market full of moth folk. Swap in your own project story here.'
  },
  {
    title: 'Rainy Day Robots',
    year: '2024',
    category: 'Picture book',
    span: 4,
    h: 30,
    tilt: 0.5,
    art: 4,
    caption: 'It would not stop raining.',
    bubble: 'Is it raining inside?',
    bpos: 'br r',
    sfx: 'PLINK',
    sx: 8,
    sy: 44,
    sr: -10,
    role: 'Illustrator',
    client: 'Sample Publisher',
    tools: 'Gouache, scan',
    tags: ['children', 'book'],
    link: '#',
    description: 'Sample spreads from an invented picture book about two robots and one very wet afternoon.'
  },
  {
    title: 'Captain Static',
    year: '2024',
    category: 'Comic series',
    span: 4,
    h: 30,
    tilt: -0.8,
    art: 3,
    caption: 'Issue one. At last.',
    bubble: 'Hold the line!',
    bpos: 'tr',
    sfx: 'KRAKOOM!',
    sx: 6,
    sy: 54,
    sr: 8,
    role: 'Writer and artist',
    client: 'Self published',
    tools: 'Ink, halftone screens',
    tags: ['comics', 'superhero'],
    link: '#',
    description: 'A sample superhero series. Describe the page count, the print run, or where readers can find it.'
  },
  {
    title: 'Sunday Strip',
    year: '2024',
    category: 'Webcomic',
    span: 4,
    h: 30,
    tilt: 0.6,
    art: 1,
    caption: 'Every Sunday since March.',
    bubble: 'Same time next week?',
    bpos: 'br l',
    sfx: 'SNIFF',
    sx: 46,
    sy: 14,
    sr: -5,
    role: 'Cartoonist',
    client: 'Personal project',
    tools: 'Digital ink',
    tags: ['webcomic', 'humor'],
    link: '#',
    description: 'A sample weekly strip about small everyday disasters. Add readership numbers or a favorite episode.'
  },
  {
    title: 'Harbor Kids',
    year: '2023',
    category: 'Editorial illustration',
    span: 5,
    h: 34,
    tilt: -0.5,
    art: 7,
    caption: 'The tide comes in at six.',
    bubble: 'Race you to the pier!',
    bpos: 'tr',
    sfx: 'SPLASH!',
    sx: 40,
    sy: 50,
    sr: -7,
    role: 'Illustrator',
    client: 'Sample Magazine',
    tools: 'Watercolor, digital',
    tags: ['editorial', 'sea'],
    link: '#',
    description: 'A sample magazine spread about a seaside town. Replace with the real story and the publication’s name.'
  },
  {
    title: 'Tin Mountain',
    year: '2023',
    category: 'Poster art',
    span: 7,
    h: 34,
    tilt: 0.5,
    art: 5,
    caption: 'Somewhere above the clouds.',
    bubble: 'Almost at the top.',
    bpos: 'br l',
    sfx: 'RUMBLE',
    sx: 56,
    sy: 14,
    sr: 6,
    role: 'Poster artist',
    client: 'Sample Festival',
    tools: 'Screen print, vector',
    tags: ['poster', 'print'],
    link: '#',
    description: 'A sample festival poster in three colors. Add the print method, size, or event details.'
  },
  {
    title: 'Zigzag Zoo',
    year: '2022',
    category: 'Packaging',
    span: 12,
    h: 24,
    tilt: -0.3,
    art: 6,
    caption: 'Now with extra animals.',
    bubble: 'Open here, please.',
    bpos: 'tr',
    sfx: 'BOING!',
    sx: 44,
    sy: 20,
    sr: -4,
    role: 'Packaging illustrator',
    client: 'Sample Snacks',
    tools: 'Vector, spot color',
    tags: ['packaging', 'pattern'],
    link: '#',
    description: 'Sample packaging art for an invented snack brand. Tell the client’s story here.'
  }
];

const INK = '#0d0f2b';
const PALS = [
  { bg: '#ffd23f', a: '#ff4d6d', b: '#2ec4f1' },
  { bg: '#2ec4f1', a: '#ffd23f', b: '#ff4d6d' },
  { bg: '#ff4d6d', a: '#ffd23f', b: '#fffef9' },
  { bg: '#fffef9', a: '#2ec4f1', b: '#ff4d6d' },
  { bg: '#7b5cff', a: '#ffd23f', b: '#2ec4f1' },
  { bg: '#ffe9a8', a: '#ff4d6d', b: '#7b5cff' },
  { bg: '#3ddc97', a: '#fffef9', b: '#ff4d6d' },
  { bg: '#2ec4f1', a: '#fffef9', b: '#7b5cff' }
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

function star(cx: number, cy: number, n: number, ro: number, ri: number) {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? ri : ro;
    const a = (Math.PI * i) / n - Math.PI / 2;
    pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return pts.join(' ');
}

function generateArtSVG(type: number, idx: number) {
  const P = PALS[idx % PALS.length];
  const R = rng(idx * 97 + 13);
  let s = '';
  const W = 400;
  const H = 300;
  s += `<rect width="${W}" height="${H}" fill="${P.bg}"/>`;

  if (type === 0) {
    /* speed lines */
    for (let i = 0; i < 44; i++) {
      const a = (i / 44) * Math.PI * 2;
      const w = 0.035 + R() * 0.03;
      s += `<polygon fill="${i % 2 ? P.a : P.b}" points="200,150 ${(200 + Math.cos(a - w) * 520).toFixed(1)},${(150 + Math.sin(a - w) * 520).toFixed(1)} ${(200 + Math.cos(a + w) * 520).toFixed(1)},${(150 + Math.sin(a + w) * 520).toFixed(1)}"/>`;
    }
    s += `<circle cx="200" cy="150" r="52" fill="${P.bg}" stroke="${INK}" stroke-width="5"/>`;
    s += `<circle cx="200" cy="150" r="22" fill="${INK}"/>`;
  } else if (type === 1) {
    /* halftone */
    for (let gy = 0; gy < 15; gy++) {
      for (let gx = 0; gx < 20; gx++) {
        const r = 1 + (gx / 19) * 8.5 * (0.65 + 0.35 * Math.sin(gy * 0.8));
        s += `<circle cx="${gx * 20 + 10}" cy="${gy * 20 + 10}" r="${r.toFixed(1)}" fill="${P.a}"/>`;
      }
    }
    s += `<circle cx="270" cy="140" r="74" fill="${P.b}" stroke="${INK}" stroke-width="5"/>`;
    s += `<circle cx="248" cy="124" r="9" fill="${INK}"/><circle cx="292" cy="124" r="9" fill="${INK}"/>`;
    s += `<path d="M240 164 Q270 192 300 164" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  } else if (type === 2) {
    /* city at night */
    s += `<circle cx="300" cy="80" r="46" fill="${P.a}" stroke="${INK}" stroke-width="4"/>`;
    let x = -10;
    while (x < W) {
      const bw = 34 + R() * 34;
      const bh = 90 + R() * 110;
      s += `<rect x="${x.toFixed(0)}" y="${(H - bh).toFixed(0)}" width="${bw.toFixed(0)}" height="${bh.toFixed(0)}" fill="${INK}"/>`;
      for (let wy = H - bh + 12; wy < H - 10; wy += 20) {
        for (let wx = x + 8; wx < x + bw - 10; wx += 14) {
          if (R() > 0.45) {
            s += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="7" height="10" fill="${R() > 0.5 ? '#ffd23f' : P.b}"/>`;
          }
        }
      }
      x += bw + 4;
    }
  } else if (type === 3) {
    /* burst */
    s += `<polygon points="${star(200, 150, 18, 230, 130)}" fill="${P.a}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
    s += `<polygon points="${star(200, 150, 14, 130, 80)}" fill="${P.b}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
    s += `<circle cx="200" cy="150" r="34" fill="${INK}"/>`;
    s += `<path d="M184 150 L200 126 L216 150 L200 174 Z" fill="${P.a}"/>`;
  } else if (type === 4) {
    /* rain and umbrella */
    for (let i = -10; i < 40; i++) {
      s += `<line x1="${i * 16}" y1="-10" x2="${i * 16 - 70}" y2="320" stroke="${INK}" stroke-width="3" opacity=".35"/>`;
    }
    s += `<path d="M105 160 A95 95 0 0 1 295 160 Q272 142 248 160 Q224 142 200 160 Q176 142 152 160 Q128 142 105 160 Z" fill="${P.a}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
    s += `<path d="M200 160 V235 Q200 258 180 258" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`;
    s += `<rect x="168" y="262" width="64" height="30" rx="6" fill="${P.b}" stroke="${INK}" stroke-width="4"/>`;
  } else if (type === 5) {
    /* sunburst mountains */
    for (let i = 0; i < 24; i++) {
      const a2 = Math.PI + (i / 24) * Math.PI;
      const w2 = Math.PI / 48;
      s += `<polygon fill="${i % 2 ? P.a : 'transparent'}" points="200,230 ${(200 + Math.cos(a2 - w2) * 520).toFixed(1)},${(230 + Math.sin(a2 - w2) * 520).toFixed(1)} ${(200 + Math.cos(a2 + w2) * 520).toFixed(1)},${(230 + Math.sin(a2 + w2) * 520).toFixed(1)}"/>`;
    }
    s += `<circle cx="200" cy="170" r="58" fill="${P.b}" stroke="${INK}" stroke-width="5"/>`;
    s += '<polygon points="-10,300 90,150 150,230 230,110 320,240 360,190 410,300" fill="' + INK + '"/>';
    s += '<polygon points="230,110 205,152 222,146 232,166 244,148 258,156" fill="#fffef9"/>';
  } else if (type === 6) {
    /* zigzag */
    for (let zy = -20; zy < H + 40; zy += 38) {
      let pts = '';
      for (let zx = -20; zx <= W + 40; zx += 40) {
        pts += `${zx},${zy + ((zx / 40) % 2 ? 0 : 26)} `;
      }
      s += `<polyline fill="none" stroke="${(zy / 38 | 0) % 2 ? P.a : P.b}" stroke-width="16" points="${pts}"/>`;
    }
    s += `<circle cx="200" cy="150" r="72" fill="${P.bg}" stroke="${INK}" stroke-width="5"/>`;
    s += `<circle cx="176" cy="136" r="9" fill="${INK}"/><circle cx="224" cy="136" r="9" fill="${INK}"/>`;
    s += `<ellipse cx="200" cy="176" rx="22" ry="14" fill="${INK}"/>`;
  } else {
    /* waves */
    const cols = [P.a, P.b, INK, P.a, P.b];
    for (let i = 0; i < 5; i++) {
      const y0 = 110 + i * 38;
      const amp = 10 + i * 3;
      let d = `M-10 ${H} L-10 ${y0}`;
      for (let wx2 = -10; wx2 <= W + 10; wx2 += 10) {
        d += ` L${wx2} ${(y0 + Math.sin(wx2 / 28 + i * 1.7) * amp).toFixed(1)}`;
      }
      d += ` L${W + 10} ${H} Z`;
      s += `<path d="${d}" fill="${cols[i]}" stroke="${INK}" stroke-width="4"/>`;
    }
    s += `<circle cx="90" cy="70" r="34" fill="${P.a}" stroke="${INK}" stroke-width="4"/>`;
  }

  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration">${s}</svg>`;
}

export const ComicPageWorld: React.FC<ComicPageWorldProps> = ({
  onReturn,
  onOpenCommission,
  arrivedFromPortal = true,
  portalCoords = { x: 0.2, y: 0.8, color: [255, 77, 109] },
  onReturnWithPortal
}) => {
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [activeViewerIdx, setActiveViewerIdx] = useState<number | null>(null);
  const [irisVisible, setIrisVisible] = useState<boolean>(arrivedFromPortal);

  const leavingRef = useRef<boolean>(false);
  const worldRef = useRef<HTMLDivElement | null>(null);
  const irisRef = useRef<HTMLDivElement | null>(null);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const reduceMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Soundscape Initialization
  useEffect(() => {
    soundEngine.setAmbientMood('graphic-chronicle');
  }, []);

  const dmax = useCallback((x: number, y: number) => {
    return Math.max(
      Math.hypot(x, y),
      Math.hypot(window.innerWidth - x, y),
      Math.hypot(x, window.innerHeight - y),
      Math.hypot(window.innerWidth - x, window.innerHeight - y)
    ) + 40;
  }, []);

  const setIrisStyle = useCallback((x: number, y: number, r: number) => {
    if (worldRef.current) {
      worldRef.current.style.clipPath = `circle(${r.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`;
    }
    if (irisRef.current) {
      irisRef.current.style.left = `${x}px`;
      irisRef.current.style.top = `${y}px`;
      irisRef.current.style.width = `${(2 * r).toFixed(1)}px`;
      irisRef.current.style.height = `${(2 * r).toFixed(1)}px`;
    }
  }, []);

  // Portal Entrance Transition
  useEffect(() => {
    if (!arrivedFromPortal || reduceMotion) {
      setIrisVisible(false);
      setRevealedIndices(new Set(PROJECTS.map((_, i) => i)));
      return;
    }

    setIrisVisible(true);
    const vx = portalCoords.x * window.innerWidth;
    const vy = portalCoords.y * window.innerHeight;
    const big = dmax(vx, vy);

    setIrisStyle(vx, vy, 0);

    const t0 = performance.now();
    let animId: number;
    const duration = 950;

    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setIrisStyle(vx, vy, big * ease);

      if (t < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setIrisVisible(false);
        if (worldRef.current) worldRef.current.style.clipPath = '';
      }
    };

    animId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animId);
      if (worldRef.current) worldRef.current.style.clipPath = '';
    };
  }, [arrivedFromPortal, portalCoords, dmax, setIrisStyle, reduceMotion]);

  // Reveal on scroll
  useEffect(() => {
    if (reduceMotion) {
      setRevealedIndices(new Set(PROJECTS.map((_, i) => i)));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) {
              setRevealedIndices((prev) => new Set([...prev, index]));
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.15 }
    );

    panelsRef.current.forEach((p) => {
      if (p) observer.observe(p);
    });

    return () => observer.disconnect();
  }, [reduceMotion]);

  // Return to Hub portal transition
  const handleLeavePortal = useCallback(() => {
    if (leavingRef.current) return;
    leavingRef.current = true;

    if (reduceMotion) {
      if (onReturnWithPortal) onReturnWithPortal(portalCoords);
      else onReturn();
      return;
    }

    const vx = portalCoords.x * window.innerWidth;
    const vy = portalCoords.y * window.innerHeight;
    const big = dmax(vx, vy);

    setIrisVisible(true);
    setIrisStyle(vx, vy, big);

    const t0 = performance.now();
    let animId: number;
    const duration = 850;

    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setIrisStyle(vx, vy, big * (1 - ease));

      if (t < 1) {
        animId = requestAnimationFrame(step);
      } else {
        if (onReturnWithPortal) onReturnWithPortal(portalCoords);
        else onReturn();
      }
    };

    animId = requestAnimationFrame(step);
  }, [dmax, onReturn, onReturnWithPortal, portalCoords, reduceMotion, setIrisStyle]);

  // Modal open / close handlers
  const handleOpenViewer = (index: number, e?: React.MouseEvent | React.KeyboardEvent) => {
    lastActiveElementRef.current = (e?.currentTarget as HTMLElement) || (document.activeElement as HTMLElement);
    setActiveViewerIdx(index);
    soundEngine.playComicPop();
  };

  const handleCloseViewer = useCallback(() => {
    setActiveViewerIdx(null);
    if (lastActiveElementRef.current && lastActiveElementRef.current.focus) {
      lastActiveElementRef.current.focus({ preventScroll: true });
    }
  }, []);

  const handleStepViewer = useCallback((step: number) => {
    soundEngine.playComicPop();
    setActiveViewerIdx((prev) => {
      if (prev === null) return null;
      return (prev + step + PROJECTS.length) % PROJECTS.length;
    });
  }, []);

  // Viewer keyboard navigation
  useEffect(() => {
    if (activeViewerIdx === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCloseViewer();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleStepViewer(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleStepViewer(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeViewerIdx, handleCloseViewer, handleStepViewer]);

  const activeProject = activeViewerIdx !== null ? PROJECTS[activeViewerIdx] : null;

  return (
    <div
      style={
        {
          '--pc': portalCoords.color.join(','),
          background: irisVisible ? `rgb(${portalCoords.color.join(',')})` : undefined
        } as React.CSSProperties
      }
    >
      <div id="world" ref={worldRef} className={styles.comicContainer}>
        {/* Top Header Bar */}
        <header className={styles.bar}>
          <button
            type="button"
            className={styles.returnBtn}
            onClick={handleLeavePortal}
            aria-label="Return to Sanctum Hub"
          >
            Return to hub
          </button>
          <div className={styles.topRight}>
            <button
              type="button"
              className={styles.commissionHeaderBtn}
              onClick={() => onOpenCommission('Graphic Chronicle')}
            >
              <Mail size={15} />
              <span>Commission</span>
            </button>
            <div className={styles.who}>
              <b>Esosa</b>
              Illustrator and Comic Artist
            </div>
          </div>
        </header>

        {/* Cover Section */}
        <section className={styles.cover} aria-labelledby="coverTitle">
          <svg className={styles.burst} viewBox="0 0 800 520" aria-hidden="true" focusable="false">
            <polygon fill="#ffd23f" stroke="#0d0f2b" stroke-width="6" points={star(400, 260, 22, 380, 270)} />
            <polygon fill="#2ec4f1" stroke="#0d0f2b" stroke-width="5" points={star(400, 260, 18, 270, 215)} />
          </svg>
          <h1 id="coverTitle" className={styles.coverTitle}>
            <span className={styles.row1}>
              {'COMIC'.split('').map((char, i) => (
                <span
                  key={i}
                  className={styles.ch}
                  style={{ animationDelay: `${(0.05 + i * 0.07).toFixed(2)}s` }}
                >
                  {char}
                </span>
              ))}
            </span>
            <span className={styles.row2}>
              {'PAGE'.split('').map((char, i) => (
                <span
                  key={i}
                  className={styles.ch}
                  style={{ animationDelay: `${(0.45 + i * 0.07).toFixed(2)}s` }}
                >
                  {char}
                </span>
              ))}
            </span>
          </h1>
          <p className={styles.sub}>Selected panels</p>
          <div className={`${styles.bubble} ${styles.cue}`}>Scroll to turn the page.</div>
        </section>

        {/* Wall of Panels */}
        <main className={styles.wall} aria-label="Projects">
          {PROJECTS.map((p, idx) => {
            const isRevealed = revealedIndices.has(idx);
            const bubblePosClass = p.bpos === 'tr'
              ? styles.bubbleTR
              : p.bpos === 'br l'
              ? `${styles.bubbleBR} ${styles.bubbleL}`
              : p.bpos === 'br r'
              ? `${styles.bubbleBR} ${styles.bubbleR}`
              : styles.bubbleBL;

            return (
              <div
                key={p.title}
                ref={(el) => { panelsRef.current[idx] = el; }}
                data-index={idx}
                className={`${styles.panel} ${isRevealed ? styles.panelIn : ''}`}
                role="button"
                tabIndex={0}
                aria-label={`Open ${p.title}, ${p.category}, ${p.year}`}
                style={
                  {
                    '--span': p.span,
                    '--h': p.h,
                    '--tilt': `${p.tilt}deg`,
                    '--sx': `${p.sx}%`,
                    '--sy': `${p.sy}%`,
                    '--sr': `${p.sr}deg`,
                    gridColumn: `span ${p.span}`,
                    height: `max(230px, min(calc(${p.h} * 1vw), calc(${p.h} * 11.2px)))`,
                    transform: `rotate(${p.tilt}deg)`
                  } as React.CSSProperties
                }
                onClick={(e) => handleOpenViewer(idx, e)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenViewer(idx, e);
                  }
                }}
              >
                <div
                  className={styles.art}
                  dangerouslySetInnerHTML={{
                    __html: p.image
                      ? `<img src="${p.image}" alt="${p.title}" />`
                      : generateArtSVG(p.art, idx)
                  }}
                />
                <div className={styles.cap}>{p.caption}</div>
                <div className={`${styles.bubble} ${bubblePosClass}`}>{p.bubble}</div>
                <div
                  className={styles.sfx}
                  aria-hidden="true"
                  style={{
                    left: `${p.sx}%`,
                    top: `${p.sy}%`,
                    transform: isRevealed ? `rotate(${p.sr}deg) scale(1)` : `rotate(${p.sr}deg) scale(0)`
                  }}
                >
                  {p.sfx}
                </div>
                <div className={styles.plate}>
                  <b>{p.title}</b>
                  <span>{p.category} | {p.year}</span>
                </div>
              </div>
            );
          })}
        </main>

        {/* Ending Call to Action */}
        <section className={styles.end}>
          <div className={styles.endpanel}>
            <h2>To be continued</h2>
            <p>Have a story that needs pictures? Send a note and let's plan the next issue.</p>
            <div className={styles.links}>
              <button
                type="button"
                onClick={() => onOpenCommission('Graphic Chronicle')}
              >
                Commission a Story
              </button>
              <button
                type="button"
                onClick={handleLeavePortal}
              >
                Return to hub
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Fullscreen Project Viewer Modal */}
      <div
        id="viewer"
        className={`${styles.viewer} ${activeProject ? styles.viewerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={activeProject ? 'false' : 'true'}
        onTouchStart={(e) => {
          touchStartXRef.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartXRef.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStartXRef.current;
          touchStartXRef.current = null;
          if (Math.abs(dx) > 60) {
            handleStepViewer(dx < 0 ? 1 : -1);
          }
        }}
      >
        {activeProject && (
          <div className={styles.vwrap}>
            <div
              className={styles.vart}
              dangerouslySetInnerHTML={{
                __html: activeProject.image
                  ? `<img src="${activeProject.image}" alt="${activeProject.title}" />`
                  : generateArtSVG(activeProject.art, activeViewerIdx!)
              }}
            />
            <div className={styles.vinfo}>
              <h2>{activeProject.title}</h2>
              <p className={styles.vmeta}>{activeProject.category} | {activeProject.year}</p>
              <p className={styles.vdesc}>{activeProject.description}</p>
              <dl className={styles.vdl}>
                <dt>Role</dt>
                <dd>{activeProject.role}</dd>
                <dt>Client</dt>
                <dd>{activeProject.client}</dd>
                <dt>Tools</dt>
                <dd>{activeProject.tools}</dd>
              </dl>
              <ul className={styles.tags}>
                {activeProject.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <button
                type="button"
                className={styles.vlink}
                onClick={() => onOpenCommission(`Graphic Chronicle: ${activeProject.title}`)}
              >
                Commission Similar Story
              </button>
            </div>
          </div>
        )}
        <button
          className={`${styles.vbtn} ${styles.vclose}`}
          type="button"
          onClick={handleCloseViewer}
          aria-label="Close project modal"
        >
          Close
        </button>
        <button
          className={`${styles.vbtn} ${styles.vprev}`}
          type="button"
          onClick={() => handleStepViewer(-1)}
          aria-label="Previous project"
        >
          &lt;
        </button>
        <button
          className={`${styles.vbtn} ${styles.vnext}`}
          type="button"
          onClick={() => handleStepViewer(1)}
          aria-label="Next project"
        >
          &gt;
        </button>
        <span className={styles.vcount} aria-live="polite">
          {activeViewerIdx !== null ? `${activeViewerIdx + 1} of ${PROJECTS.length}` : ''}
        </span>
      </div>

      {/* Portal Iris Element */}
      <div
        ref={irisRef}
        className={`${styles.iris} ${irisVisible ? styles.irisOn : ''}`}
        aria-hidden="true"
      />
    </div>
  );
};
