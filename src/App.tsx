import React, { useState, useEffect, Suspense, lazy } from 'react';
import { WorldConfig } from './types/world';
import { HUB_WORLDS } from './hub/hubData';
import { HubView } from './hub/HubView';
import { AudioAlert } from './shared/AudioAlert/AudioAlert';
import { TransitionOverlay } from './shared/TransitionOverlay/TransitionOverlay';
import { CommissionModal } from './shared/CommissionModal/CommissionModal';
import { soundEngine } from './audio/soundEngine';

// Lazy loaded worlds for high-performance bundle isolation
const TerminalOfficeWorld = lazy(() =>
  import('./worlds/terminal-office/TerminalOfficeWorld').then((m) => ({ default: m.TerminalOfficeWorld }))
);
const RetroWorkstationWorld = lazy(() =>
  import('./worlds/retro-workstation/CpuMonitorWorld').then((m) => ({ default: m.RetroWorkstationWorld }))
);
const CircuitCityWorld = lazy(() =>
  import('./worlds/silicon-matrix/CircuitCityWorld').then((m) => ({ default: m.CircuitCityWorld }))
);
const GalleryWallWorld = lazy(() =>
  import('./worlds/curator-monolith/GalleryWallWorld').then((m) => ({ default: m.GalleryWallWorld }))
);
const TornAtelierWorld = lazy(() =>
  import('./worlds/torn-atelier/SketchbookWorld').then((m) => ({ default: m.TornAtelierWorld }))
);
const PaintUniverseWorld = lazy(() =>
  import('./worlds/pigment-nebula/PaintUniverseWorld').then((m) => ({ default: m.PaintUniverseWorld }))
);
const ComicPageWorld = lazy(() =>
  import('./worlds/graphic-chronicle/ComicPageWorld').then((m) => ({ default: m.ComicPageWorld }))
);
const PopUpBookWorld = lazy(() =>
  import('./worlds/origami-vault/PopUpBookWorld').then((m) => ({ default: m.PopUpBookWorld }))
);
const InkDimensionWorld = lazy(() =>
  import('./worlds/monochrome-rift/InkDimensionWorld').then((m) => ({ default: m.InkDimensionWorld }))
);

export function App() {
  const [activeWorld, setActiveWorld] = useState<WorldConfig | null>(null);
  const [transitioning, setTransitioning] = useState<boolean>(false);
  const [transitionDirection, setTransitionDirection] = useState<'enter' | 'return'>('enter');
  const [pendingWorld, setPendingWorld] = useState<WorldConfig | null>(null);
  const [portalCoordinates, setPortalCoordinates] = useState<{ x: number; y: number; color: [number, number, number] }>({ x: 0.5, y: 0.5, color: [240, 240, 240] });
  const [arrivingFromWorldId, setArrivingFromWorldId] = useState<string | null>(null);
  const [showAudioAlert, setShowAudioAlert] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);
  const [commissionOpen, setCommissionOpen] = useState<boolean>(false);
  const [commissionWorldTarget, setCommissionWorldTarget] = useState<string>('Custom Creative Showcase');

  // URL Path Synchronization
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const cleanPath = path.replace('/multi-world-portfolio', '');
      if (cleanPath === '/' || cleanPath === '') {
        setActiveWorld(null);
        soundEngine.setAmbientMood('hub');
      } else {
        const slug = cleanPath.replace('/worlds/', '').replace('/', '');
        const found = HUB_WORLDS.find((w) => w.slug === slug);
        if (found) {
          setActiveWorld(found);
          soundEngine.setAmbientMood(found.soundtrackMood);
        }
      }
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Keyboard shortcut: Escape closes commission modal if open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && commissionOpen) {
        setCommissionOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commissionOpen]);

  const handleEnableAudio = () => {
    soundEngine.init();
    soundEngine.setMuted(false);
    setIsAudioMuted(false);
    setShowAudioAlert(false);
    soundEngine.setAmbientMood(activeWorld ? activeWorld.soundtrackMood : 'hub');
  };

  const handleDismissAudio = () => {
    soundEngine.setMuted(true);
    setIsAudioMuted(true);
    setShowAudioAlert(false);
  };

  const handleToggleAudio = () => {
    const muted = soundEngine.toggleMute();
    setIsAudioMuted(muted);
    if (!muted) {
      soundEngine.setAmbientMood(activeWorld ? activeWorld.soundtrackMood : 'hub');
    }
  };

  const handleSelectWorld = (
    world: WorldConfig,
    coords?: { x: number; y: number; color: [number, number, number] }
  ) => {
    if (transitioning) return;
    if (coords) setPortalCoordinates(coords);
    setPendingWorld(world);
    setTransitionDirection('enter');
    setActiveWorld(world);
    const basePath = window.location.pathname.startsWith('/multi-world-portfolio') ? '/multi-world-portfolio' : '';
    window.history.pushState(null, '', `${basePath}/worlds/${world.slug}`);
    soundEngine.setAmbientMood(world.soundtrackMood);
  };

  const handleReturnToHub = () => {
    setActiveWorld(null);
    const basePath = window.location.pathname.startsWith('/multi-world-portfolio') ? '/multi-world-portfolio' : '';
    window.history.pushState(null, '', `${basePath}/`);
    soundEngine.setAmbientMood('hub');
  };

  const handleReturnWithPortal = (
    worldId: string,
    coords: { x: number; y: number; color: [number, number, number] }
  ) => {
    setPortalCoordinates(coords);
    setArrivingFromWorldId(worldId);
    setActiveWorld(null);
    const basePath = window.location.pathname.startsWith('/multi-world-portfolio') ? '/multi-world-portfolio' : '';
    window.history.pushState(null, '', `${basePath}/`);
    soundEngine.setAmbientMood('hub');
  };

  const handleOpenCommission = (worldName?: string) => {
    setCommissionWorldTarget(worldName || (activeWorld ? activeWorld.name : 'Custom Showcase'));
    setCommissionOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#05060c' }}>
      {/* Audio permission alert modal */}
      {showAudioAlert && (
        <AudioAlert 
          onEnable={handleEnableAudio} 
          onDismiss={handleDismissAudio} 
        />
      )}

      {/* Cinematic Warp Transition Overlay */}
      <TransitionOverlay
        isActive={transitioning}
        accentColor={transitionDirection === 'return' ? '#7cf4ff' : (pendingWorld?.accentColor || activeWorld?.accentColor || '#6366f1')}
        worldName={transitionDirection === 'return' ? 'Sanctum Hub' : (pendingWorld?.name || 'Sanctum Hub')}
        subtext={transitionDirection === 'return' ? 'Returning to Sanctum Hub' : 'Entering Universe'}
      />

      {/* Global Commission Modal targeting esosaosaretin@gmail.com */}
      <CommissionModal
        isOpen={commissionOpen}
        onClose={() => setCommissionOpen(false)}
        worldName={commissionWorldTarget}
      />

      {/* Active Route Rendering */}
      {!activeWorld ? (
        <HubView
          onSelectWorld={handleSelectWorld}
          onOpenCommission={handleOpenCommission}
          isAudioMuted={isAudioMuted}
          onToggleAudio={handleToggleAudio}
          arrivingFromWorldId={arrivingFromWorldId}
          onArriveAnimationComplete={() => setArrivingFromWorldId(null)}
        />
      ) : (
        <Suspense
          fallback={
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
              Materializing dimension...
            </div>
          }
        >
          {activeWorld.id === 'terminal-office' && (
            <TerminalOfficeWorld 
              onReturn={handleReturnToHub} 
              onOpenCommission={handleOpenCommission} 
            />
          )}
          {activeWorld.id === 'retro-workstation' && (
            <RetroWorkstationWorld 
              onReturn={handleReturnToHub} 
              onOpenCommission={handleOpenCommission} 
            />
          )}
          {activeWorld.id === 'silicon-matrix' && (
            <CircuitCityWorld 
              onReturn={handleReturnToHub} 
              onOpenCommission={handleOpenCommission} 
            />
          )}
          {activeWorld.id === 'curator-monolith' && (
            <GalleryWallWorld 
              onReturn={handleReturnToHub} 
              onOpenCommission={handleOpenCommission} 
              arrivedFromPortal={true}
              portalCoords={portalCoordinates}
              onReturnWithPortal={(coords) => handleReturnWithPortal('curator-monolith', coords)}
            />
          )}
          {activeWorld.id === 'torn-atelier' && (
            <TornAtelierWorld 
              onReturn={handleReturnToHub} 
              onOpenCommission={handleOpenCommission} 
            />
          )}
          {activeWorld.id === 'pigment-nebula' && (
            <PaintUniverseWorld 
              onReturn={handleReturnToHub} 
              onOpenCommission={handleOpenCommission} 
            />
          )}
          {activeWorld.id === 'graphic-chronicle' && (
            <ComicPageWorld 
              onReturn={handleReturnToHub} 
              onOpenCommission={handleOpenCommission} 
            />
          )}
          {activeWorld.id === 'origami-vault' && (
            <PopUpBookWorld 
              onReturn={handleReturnToHub} 
              onOpenCommission={handleOpenCommission} 
            />
          )}
          {activeWorld.id === 'monochrome-rift' && (
            <InkDimensionWorld 
              onReturn={handleReturnToHub} 
              onOpenCommission={handleOpenCommission} 
            />
          )}
        </Suspense>
      )}
    </div>
  );
}

export default App;
