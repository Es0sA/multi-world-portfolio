# Multi-World Portfolio Showcase

An interactive multi-world digital portfolio architecture built for creative freelancer **Esosa Osaretin**. The platform is designed as an architectural Hub connecting visitors to nine self-contained portfolio worlds, spanning Developer, Designer, and Illustrator fields.

The core message of the site is:
> *"I am a custom portfolio architect and interactive experience builder. Every world you explore here is living proof of what I can engineer. If you like what you see in these samples, let's talk and I can craft your own portfolio."*

---

## The Nine Universes

### Developer Field
1. **Terminal Office** (`/worlds/terminal-office`): A clean dark workspace with a working Unix-style command parser (`help`, `ls`, `open <name>`, `cat`, `clear`).
2. **Retro Workstation** (`/worlds/retro-workstation`): A retro computing CRT monitor with draggable/clickable windowing systems and Windows 95 taskbar aesthetics.
3. **Silicon Matrix** (`/worlds/silicon-matrix`): An interactive top-down 3D motherboard with glowing copper traces and raycasted integrated circuit (IC) project chips.

### Designer Field
4. **Curator Monolith** (`/worlds/curator-monolith`): An austere white museum gallery honoring fine typography, framed exhibition prints, and full-screen lightbox inspection.
5. **Torn Atelier** (`/worlds/torn-atelier`): An organic sketchbook spread with metal binder rings, washi tape, torn paper edges, and pencil notes.
6. **Pigment Nebula** (`/worlds/pigment-nebula`): A living fluid universe of 3D swirling brushstrokes, with orbiting celestial painted planets that expand on click.

### Comic & Illustrator Field
7. **Graphic Chronicle** (`/worlds/graphic-chronicle`): Dynamic comic strip layout with speech bubbles, halftone Ben-Day dots, speed lines, and sound effect overlays ("POW!", "KABOOM!").
8. **Origami Vault** (`/worlds/origami-vault`): A 3D pop-up book with mechanical folding pages, die-cut standees, and paper shadowboxes.
9. **Monochrome Rift** (`/worlds/monochrome-rift`): An infinite void of drifting ink wash and Sumi-e pillars with zero comic panel constraints.

---

## Tech Stack & Architecture

* **Framework:** React 19 + TypeScript + Vite
* **3D Graphics & WebGL:** Three.js with hardware-accelerated rendering and custom lighting
* **Audio Synthesis:** Zero-latency Web Audio API sound engine generating custom reactive drones and sound effects (switches, pops, CRT hum, paper rustle, ink drops) without external MP3 dependencies
* **Styling & Scoping:** Scoped CSS Modules per world (`*.module.css`) preventing any cross-world CSS pollution
* **Direct Commissions:** Integrated modal and deep mailto links wired to `esosaosaretin@gmail.com`
* **Accessibility & Fallbacks:** Every world features a dual-mode toggle between interactive 3D/canvas view and an Accessible Project Archive grid (`FallbackGrid.tsx`) with full keyboard navigation.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

### 4. Preview the Production Build
```bash
npm run preview
```

---

## How to Add or Edit Projects

Every world is backed by a single decoupled data file located inside its directory. To modify or add projects, open the relevant file:

* Terminal Office: `src/worlds/terminal-office/terminalData.ts`
* Retro Workstation: `src/worlds/retro-workstation/retroData.ts`
* Silicon Matrix: `src/worlds/silicon-matrix/siliconData.ts`
* Curator Monolith: `src/worlds/curator-monolith/curatorData.ts`
* Torn Atelier: `src/worlds/torn-atelier/tornData.ts`
* Pigment Nebula: `src/worlds/pigment-nebula/pigmentData.ts`
* Graphic Chronicle: `src/worlds/graphic-chronicle/graphicData.ts`
* Origami Vault: `src/worlds/origami-vault/origamiData.ts`
* Monochrome Rift: `src/worlds/monochrome-rift/monochromeData.ts`

Each file exports project objects adhering to the `ProjectItem` schema defined in `src/types/world.ts`:

```typescript
export interface ProjectItem {
  id: string;
  title: string;
  clientType: string;
  category: string;
  year: string;
  summary: string;
  description: string;
  deliverables: string[];
  techOrTools: string[];
  tags: string[];
  metricsOrHighlight?: string;
  liveUrl?: string;
  repoUrl?: string;
}
```

---

## How to Add a New World

1. Add the new world metadata and configuration into `src/hub/hubData.ts` following `WorldConfig`.
2. Create a dedicated folder under `src/worlds/<new-world-name>/`.
3. Create `[NewWorld].tsx`, `[NewWorld].module.css`, and `[NewWorld]Data.ts`.
4. Include the shared `<ReturnControl />` component at the top of the world view.
5. In `src/App.tsx`, lazy-load the world component and add its route condition in the render block.
