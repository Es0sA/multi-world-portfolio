import React, { useState, useEffect } from 'react';
import { graphicData } from './graphicData';
import { ReturnControl } from '../../shared/ReturnControl/ReturnControl';
import { FallbackGrid } from '../../shared/FallbackGrid/FallbackGrid';
import { soundEngine } from '../../audio/soundEngine';
import { Zap, MessageSquare, Volume2, Sparkles, BookOpen, List } from 'lucide-react';
import styles from './comic.module.css';

interface ComicPageProps {
  onReturn: () => void;
  onOpenCommission: (worldName?: string) => void;
}

export const ComicPageWorld: React.FC<ComicPageProps> = ({ onReturn, onOpenCommission }) => {
  const [viewMode, setViewMode] = useState<'comic' | 'archive'>('comic');
  const [activeSoundEffect, setActiveSoundEffect] = useState<string | null>(null);

  useEffect(() => {
    soundEngine.setAmbientMood('graphic-chronicle');
  }, []);

  const triggerSfx = (sfx: string) => {
    soundEngine.playComicPop();
    setActiveSoundEffect(sfx);
    setTimeout(() => setActiveSoundEffect(null), 1200);
  };

  return (
    <div className={styles.comicScope}>
      <ReturnControl 
        onReturn={onReturn} 
        worldName="Graphic Chronicle"
        onOpenCommission={() => onOpenCommission('Graphic Chronicle')}
      />

      <div className={styles.viewToggle}>
        <button 
          type="button" 
          className={`${styles.toggleBtn} ${viewMode === 'comic' ? styles.activeToggle : ''}`}
          onClick={() => setViewMode('comic')}
        >
          <Zap size={14} /> Comic Panels
        </button>
        <button 
          type="button" 
          className={`${styles.toggleBtn} ${viewMode === 'archive' ? styles.activeToggle : ''}`}
          onClick={() => setViewMode('archive')}
        >
          <List size={14} /> Issue Catalog
        </button>
      </div>

      {viewMode === 'archive' ? (
        <FallbackGrid 
          worldName={graphicData.name}
          tagline={graphicData.tagline}
          projects={graphicData.projects}
          accentColor={graphicData.accentColor}
          onOpenCommission={() => onOpenCommission('Graphic Chronicle')}
        />
      ) : (
        <div className={styles.stripContainer}>
          {/* Comic Title Banner */}
          <div className={styles.comicIssueHeader}>
            <div className={styles.issueBadge}>ISSUE #09 • SPECIAL EDITION</div>
            <h2 className={styles.chronicleTitle}>THE GRAPHIC CHRONICLES</h2>
            <p className={styles.chronicleSub}>
              DYNAMIC SEQUENTIAL STORIES • BOLD INKWORK • POP ART VISUALS
            </p>
          </div>

          {/* Interactive Sound FX overlay */}
          {activeSoundEffect && (
            <div className={styles.sfxOverlay}>
              <span className={styles.sfxText}>{activeSoundEffect}</span>
            </div>
          )}

          {/* Multi-Panel Comic Layout */}
          <div className={styles.panelGrid}>
            {graphicData.projects.map((proj, idx) => (
              <article key={proj.id} className={styles.comicPanel}>
                <div className={styles.halftoneBg} />
                
                {/* Speech Bubble */}
                <div className={styles.speechBubble}>
                  <MessageSquare size={13} className={styles.bubbleIcon} />
                  <span>"Presenting our case study for {proj.clientType}!"</span>
                  <div className={styles.bubbleTail} />
                </div>

                {/* Comic Artwork Box */}
                <div className={styles.panelIllustration}>
                  <div className={styles.speedlines} />
                  <div className={styles.panelActionBox}>
                    <span className={styles.panelEpisode}>PANEL {idx + 1}</span>
                    <h3 className={styles.panelHeroTitle}>{proj.title}</h3>
                  </div>

                  <button 
                    type="button" 
                    className={styles.sfxBtn}
                    onClick={() => triggerSfx(['KABOOM!', 'ZAP!', 'SHWACK!'][idx])}
                  >
                    <span>{['POW!', 'WHAM!', 'BOOM!'][idx]}</span>
                  </button>
                </div>

                {/* Panel Narrative Caption Box */}
                <div className={styles.captionBox}>
                  <div className={styles.captionTag}>// NARRATIVE LOG: {proj.category}</div>
                  <p className={styles.captionText}>{proj.description}</p>
                </div>

                {/* Deliverables Box */}
                <div className={styles.lootBox}>
                  <strong>PROJECT HIGHLIGHT:</strong>
                  <p>{proj.metricsOrHighlight}</p>
                </div>

                <div className={styles.tagStrip}>
                  {proj.techOrTools.map((t, i) => (
                    <span key={i} className={styles.inkTag}>#{t}</span>
                  ))}
                </div>

                <div className={styles.panelFooter}>
                  <button 
                    type="button" 
                    className={styles.actionCta}
                    onClick={() => onOpenCommission('Graphic Chronicle')}
                  >
                    <Sparkles size={13} />
                    <span>Commission Comic Portfolio</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
