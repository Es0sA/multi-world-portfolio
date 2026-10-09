# Architecture & Implementation Notes

## Libraries & Technical Stack

1. **React 19 & Vite**
   - Core framework powering modular reactive components.
   - Dynamic `React.lazy()` and `Suspense` chunking guarantees that visitors only download the bundle for the specific world they enter, keeping the Hub initial load under 230kB gzip.

2. **Three.js**
   - Used for the Hub 3D portal crescent, Silicon Matrix PCB motherboard, Pigment Nebula fluid orbit, and Monochrome Rift ink pillars.
   - Uses strict context disposal (`scene.clear()`, geometry/material cleanup) on unmount to prevent GPU memory leaks.

3. **Web Audio API (Procedural Synthesis Engine)**
   - Implemented in `src/audio/soundEngine.ts`.
   - Avoids external audio file downloads or bandwidth latency by synthesizing real-time oscillators, filters, noise buffers, and envelopes directly on the client.
   - Provides subtle world-specific drones (sub-bass, CRT hum, ambient chime) and interaction sound effects (keyboard clack, comic pop, paper rustle, ink drop).

4. **Lucide React**
   - Clean, lightweight icon primitives used across UI controls and badges.

5. **CSS Modules**
   - Every world has its own isolated stylesheet (`[world].module.css`) scoping class names, preventing style leakage between universes.

---

## Design Choices & Distinctive Implementations

- **Hub Entrance:** Instead of a simple 2D list, the Hub renders a 3D WebGL crescent of nine glowing monolith doorways in a dark void. Visitors can hover or click directly in 3D or use the accessible doorway deck below.
- **Audio Permission Flow:** An audio banner notifies visitors on entry with `[Enable Audio]` or `[Continue Muted]`, adhering to browser autoplay policies while respecting user preference.
- **Uniform Return Experience:** Every world includes the floating glassmorphic `<ReturnControl />` bar in the header with a 1-click exit to the Hub and a direct inquiry shortcut. Pressing the `Escape` key also triggers an immediate cinematic return to the Hub.
- **Decoupled Content:** Every single world contains its own standalone `*Data.ts` file. All text, deliverables, tools, and links can be modified without altering layout or rendering code.
- **Dual View Modes:** Every world offers a quick toggle between the bespoke interactive visual dimension and an accessible `FallbackGrid` mode for visitors requiring reduced motion or simple reading.

---

## Direct Inquiries & Commissions

- All calls to action and inquiry buttons route to `esosaosaretin@gmail.com`.
- The global `<CommissionModal />` allows visitors to pre-fill their discipline and vision, opening their email client with structured project parameters.
