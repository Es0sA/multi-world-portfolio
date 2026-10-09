import React, { useState } from 'react';
import { WorldConfig } from '../types/world';
import { HUB_WORLDS } from './hubData';
import { HubCanvas3D } from './HubCanvas3D';
import { soundEngine } from '../audio/soundEngine';
import { 
  Sparkles, 
  Terminal, 
  Monitor, 
  Cpu, 
  Eye, 
  BookOpen, 
  Palette, 
  Zap, 
  Layers, 
  Compass, 
  Volume2, 
  VolumeX, 
  ArrowRight,
  Mail
} from 'lucide-react';
import styles from './Hub.module.css';

interface HubViewProps {
  onSelectWorld: (world: WorldConfig) => void;
  onOpenCommission: (worldName?: string) => void;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
}

export const HubView: React.FC<HubViewProps> = ({
  onSelectWorld,
  onOpenCommission,
  isAudioMuted,
  onToggleAudio,
}) => {
  const [hoveredWorldId, setHoveredWorldId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'developer' | 'designer' | 'illustrator'>('all');

  const filteredWorlds = HUB_WORLDS.filter(
    (w) => activeFilter === 'all' || w.field === activeFilter
  );

  const hoveredWorld = HUB_WORLDS.find((w) => w.id === hoveredWorldId);

  const getFieldIcon = (id: string) => {
    switch (id) {
      case 'terminal-office': return <Terminal size={18} />;
      case 'retro-workstation': return <Monitor size={18} />;
      case 'silicon-matrix': return <Cpu size={18} />;
      case 'curator-monolith': return <Eye size={18} />;
      case 'torn-atelier': return <BookOpen size={18} />;
      case 'pigment-nebula': return <Palette size={18} />;
      case 'graphic-chronicle': return <Zap size={18} />;
      case 'origami-vault': return <Layers size={18} />;
      case 'monochrome-rift': return <Compass size={18} />;
      default: return <Sparkles size={18} />;
    }
  };

  const handlePortalHover = (id: string) => {
    setHoveredWorldId(id);
    soundEngine.playPortalHover();
  };

  const handleWorldClick = (world: WorldConfig) => {
    soundEngine.playPortalWarp();
    onSelectWorld(world);
  };

  return (
    <main className={styles.hubContainer}>
      {/* 3D WebGL Doorway Arc Background */}
      <div className={styles.threeLayer}>
        <HubCanvas3D 
          worlds={filteredWorlds} 
          onSelectWorld={handleWorldClick}
          hoveredWorldId={hoveredWorldId}
          setHoveredWorldId={setHoveredWorldId}
        />
      </div>

      {/* Brand Header */}
      <header className={styles.brandBar}>
        <div className={styles.signature}>
          <div className={styles.sigGlyph}>
            <span>EO</span>
          </div>
          <div>
            <h1 className={styles.sigName}>Esosa Osaretin</h1>
            <span className={styles.sigRole}>Portfolio Architect & Creative Technologist</span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <button 
            type="button" 
            className={styles.audioBtn} 
            onClick={onToggleAudio}
            aria-label={isAudioMuted ? 'Unmute Soundscape' : 'Mute Soundscape'}
            title={isAudioMuted ? 'Soundscape Muted' : 'Soundscape Active'}
          >
            {isAudioMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            <span className={styles.audioLabel}>{isAudioMuted ? 'Muted' : 'Sound On'}</span>
          </button>

          <button 
            type="button" 
            className={styles.commissionHeaderBtn}
            onClick={() => onOpenCommission()}
          >
            <Mail size={15} />
            <span>Commission a Portfolio</span>
          </button>
        </div>
      </header>

      {/* Center Portal HUD Info overlay */}
      <div className={styles.centerHud}>
        <div className={styles.conceptBadge}>
          <Sparkles size={13} />
          <span>9 Portals. 9 Creative Identities. One Architect.</span>
        </div>
        <h2 className={styles.heroHeading}>
          Explore Bespoke Portfolio Universes
        </h2>
        <p className={styles.heroSub}>
          Click any glowing portal or doorway card to cross the threshold into a live, custom-engineered digital showcase.
        </p>

        {/* Filter Pills */}
        <div className={styles.filterPills} role="tablist">
          <button 
            type="button" 
            role="tab"
            aria-selected={activeFilter === 'all'}
            className={`${styles.filterBtn} ${activeFilter === 'all' ? styles.filterActive : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All 9 Universes
          </button>
          <button 
            type="button" 
            role="tab"
            aria-selected={activeFilter === 'developer'}
            className={`${styles.filterBtn} ${activeFilter === 'developer' ? styles.filterActive : ''}`}
            onClick={() => setActiveFilter('developer')}
          >
            Developer Fields
          </button>
          <button 
            type="button" 
            role="tab"
            aria-selected={activeFilter === 'designer'}
            className={`${styles.filterBtn} ${activeFilter === 'designer' ? styles.filterActive : ''}`}
            onClick={() => setActiveFilter('designer')}
          >
            Designer Fields
          </button>
          <button 
            type="button" 
            role="tab"
            aria-selected={activeFilter === 'illustrator'}
            className={`${styles.filterBtn} ${activeFilter === 'illustrator' ? styles.filterActive : ''}`}
            onClick={() => setActiveFilter('illustrator')}
          >
            Comic & Illustrator Fields
          </button>
        </div>
      </div>

      {/* Doorways Navigation Grid (Accessible + visual list) */}
      <div className={styles.portalsDeck}>
        <div className={styles.cardsRow}>
          {filteredWorlds.map((world) => {
            const isHovered = hoveredWorldId === world.id;
            return (
              <button
                key={world.id}
                type="button"
                className={`${styles.portalCard} ${isHovered ? styles.portalCardHovered : ''}`}
                onMouseEnter={() => handlePortalHover(world.id)}
                onMouseLeave={() => setHoveredWorldId(null)}
                onClick={() => handleWorldClick(world)}
                aria-label={`Enter ${world.name}: ${world.tagline}`}
              >
                <div 
                  className={styles.portalLight} 
                  style={{ backgroundColor: world.portalColor, boxShadow: `0 0 24px ${world.portalColor}` }} 
                />
                <div className={styles.cardHeader}>
                  <div className={styles.glyphBox} style={{ color: world.accentColor }}>
                    {getFieldIcon(world.id)}
                  </div>
                  <span className={styles.tierTag}>{world.styleTier}</span>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{world.name}</h3>
                  <span className={styles.cardArchetype}>{world.archetype}</span>
                  <p className={styles.cardTagline}>{world.tagline}</p>
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.enterCta} style={{ color: world.accentColor }}>
                    Cross Portal <ArrowRight size={13} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hover Inspect Drawer */}
      {hoveredWorld && (
        <aside className={styles.inspectBar} aria-live="polite">
          <div className={styles.inspectLeft}>
            <span className={styles.inspectField}>{hoveredWorld.field.toUpperCase()} FIELD</span>
            <span className={styles.inspectName}>{hoveredWorld.name}</span>
          </div>
          <p className={styles.inspectDesc}>{hoveredWorld.description}</p>
          <button 
            type="button" 
            className={styles.inspectAction}
            onClick={() => handleWorldClick(hoveredWorld)}
            style={{ borderColor: hoveredWorld.accentColor, color: hoveredWorld.accentColor }}
          >
            Enter Realm Now
          </button>
        </aside>
      )}
    </main>
  );
};
