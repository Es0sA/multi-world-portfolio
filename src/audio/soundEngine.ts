// Procedural Web Audio Engine with ambient synthesizer and sound effects
// Does not depend on external MP3 downloads, works immediately offline with 0 latency

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private activeMood: string = 'silent';

  constructor() {
    // Lazy initialized on first user gesture
  }

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getContextState(): string {
    return this.ctx ? this.ctx.state : 'uninitialized';
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.ambientGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : 0.08;
      this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, this.ctx.currentTime);
      this.ambientGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, targetGain), this.ctx.currentTime + 0.3);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : 0.08;
      this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, this.ctx.currentTime);
      this.ambientGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, targetGain), this.ctx.currentTime + 0.3);
    }
  }

  // Set continuous procedural ambient drone according to world mood
  public setAmbientMood(mood: string) {
    this.init();
    if (!this.ctx) return;
    this.activeMood = mood;

    // Fade out previous ambient if running
    if (this.ambientGain) {
      try {
        this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, this.ctx.currentTime);
        this.ambientGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
        setTimeout(() => {
          if (this.ambientOsc1) {
            this.ambientOsc1.stop();
            this.ambientOsc1.disconnect();
            this.ambientOsc1 = null;
          }
          if (this.ambientOsc2) {
            this.ambientOsc2.stop();
            this.ambientOsc2.disconnect();
            this.ambientOsc2 = null;
          }
          if (this.activeMood === mood) {
            this.startNewAmbient(mood);
          }
        }, 520);
      } catch {
        this.startNewAmbient(mood);
      }
    } else {
      this.startNewAmbient(mood);
    }
  }

  private startNewAmbient(mood: string) {
    if (!this.ctx || mood === 'silent') return;

    try {
      const master = this.ctx.createGain();
      const initialVol = this.isMuted ? 0.0001 : 0.07;
      master.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(initialVol, this.ctx.currentTime + 1.2);
      master.connect(this.ctx.destination);
      this.ambientGain = master;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();

      // Configure frequencies based on world signature
      switch (mood) {
        case 'hub':
          // Deep cosmic sub-drone
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(110, this.ctx.currentTime); // A2
          break;
        case 'terminal':
          // Subtle CRT phosphor hum
          osc1.type = 'sawtooth';
          osc1.frequency.setValueAtTime(60, this.ctx.currentTime);
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(120, this.ctx.currentTime);
          break;
        case 'retro-workstation':
          // Low-fi retro console tone
          osc1.type = 'square';
          osc1.frequency.setValueAtTime(65.41, this.ctx.currentTime); // C2
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(130.81, this.ctx.currentTime);
          break;
        case 'silicon-matrix':
          // High-frequency data pulse vibe
          osc1.type = 'triangle';
          osc1.frequency.setValueAtTime(146.83, this.ctx.currentTime); // D3
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(220, this.ctx.currentTime); // A3
          break;
        case 'curator-monolith':
          // Serene museum hall resonant acoustic drone
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(82.41, this.ctx.currentTime); // E2
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(164.81, this.ctx.currentTime);
          break;
        case 'torn-atelier':
          // Organic warm acoustic hum
          osc1.type = 'triangle';
          osc1.frequency.setValueAtTime(98, this.ctx.currentTime); // G2
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(196, this.ctx.currentTime);
          break;
        case 'pigment-nebula':
          // Ethereal fluid shimmer
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(174.61, this.ctx.currentTime); // F3
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(261.63, this.ctx.currentTime); // C4
          break;
        case 'graphic-chronicle':
          // Punchy comic atmosphere
          osc1.type = 'triangle';
          osc1.frequency.setValueAtTime(130.81, this.ctx.currentTime);
          osc2.type = 'sawtooth';
          osc2.frequency.setValueAtTime(65.41, this.ctx.currentTime);
          break;
        case 'origami-vault':
          // Crisp acoustic resonance
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(110, this.ctx.currentTime);
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(220, this.ctx.currentTime);
          break;
        case 'monochrome-rift':
          // Deep mysterious cavern tone
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(43.65, this.ctx.currentTime); // F1
          osc2.type = 'sawtooth';
          osc2.frequency.setValueAtTime(87.31, this.ctx.currentTime);
          break;
        default:
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(55, this.ctx.currentTime);
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(110, this.ctx.currentTime);
      }

      // Add soft lowpass filter for gentle listening
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(master);

      osc1.start();
      osc2.start();
      this.ambientOsc1 = osc1;
      this.ambientOsc2 = osc2;
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Interactive Sound FX
  public playPortalHover() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    } catch {}
  }

  public playPortalWarp() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.6);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(3000, this.ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.7);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.75);
    } catch {}
  }

  public playReturnClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.26);
    } catch {}
  }

  public playTerminalKey() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      // Slight pitch variation for realistic tactile feel
      const freq = 600 + Math.random() * 200;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.045);
    } catch {}
  }

  public playComicPop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.11);
    } catch {}
  }

  public playPaperRustle() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      // Noise burst for paper sound
      const bufferSize = this.ctx.sampleRate * 0.1;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
      filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.09);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch {}
  }

  public playInkDrop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(250, this.ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch {}
  }
}

export const soundEngine = new SoundEngine();
