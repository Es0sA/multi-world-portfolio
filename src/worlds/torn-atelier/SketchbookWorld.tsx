import React, { useState, useEffect } from 'react';
import { tornData } from './tornData';
import { ReturnControl } from '../../shared/ReturnControl/ReturnControl';
import { FallbackGrid } from '../../shared/FallbackGrid/FallbackGrid';
import { soundEngine } from '../../audio/soundEngine';
import { BookOpen, Scissors, StickyNote, Sparkles, Pin, List } from 'lucide-react';
import styles from './sketchbook.module.css';

interface TornAtelierProps {
  onReturn: () => void;
  onOpenCommission: (worldName?: string) => void;
}

export const TornAtelierWorld: React.FC<TornAtelierProps> = ({ onReturn, onOpenCommission }) => {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'sketchbook' | 'archive'>('sketchbook');

  useEffect(() => {
    soundEngine.setAmbientMood('torn-atelier');
  }, []);

  const handlePageTurn = (newIndex: number) => {
    soundEngine.playPaperRustle();
    setActivePageIndex(newIndex);
  };

  const currentProject = tornData.projects[activePageIndex];

  return (
    <div className={styles.atelierScope}>
      <ReturnControl 
        onReturn={onReturn} 
        worldName="Torn Atelier"
        onOpenCommission={() => onOpenCommission('Torn Atelier')}
      />

      <div className={styles.viewToggle}>
        <button 
          type="button" 
          className={`${styles.toggleBtn} ${viewMode === 'sketchbook' ? styles.activeToggle : ''}`}
          onClick={() => setViewMode('sketchbook')}
        >
          <BookOpen size={14} /> Scattered Notebook
        </button>
        <button 
          type="button" 
          className={`${styles.toggleBtn} ${viewMode === 'archive' ? styles.activeToggle : ''}`}
          onClick={() => setViewMode('archive')}
        >
          <List size={14} /> Archive Index
        </button>
      </div>

      {viewMode === 'archive' ? (
        <FallbackGrid 
          worldName={tornData.name}
          tagline={tornData.tagline}
          projects={tornData.projects}
          accentColor={tornData.accentColor}
          onOpenCommission={() => onOpenCommission('Torn Atelier')}
        />
      ) : (
        <div className={styles.draftingTable}>
          {/* Sketchbook Binder Spine */}
          <div className={styles.binderRingSystem}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={styles.metalRing} />
            ))}
          </div>

          {/* Interactive Torn Paper Canvas Spread */}
          <div className={styles.openSpread}>
            {/* Left Page: Hand-Drawn Diagrams & Post-its */}
            <div className={styles.leftPage}>
              <div className={styles.tornTopEdge} />
              <div className={styles.paperTexture} />

              <div className={styles.washiTape} />
              
              <div className={styles.pageMeta}>
                <span className={styles.handwrittenDate}>OCTOBER // ENTRY #{activePageIndex + 1}</span>
                <span className={styles.sketchbookSubject}>PROJECT FIELD STUDY</span>
              </div>

              <div className={styles.handDrawnHero}>
                <div className={styles.roughBox}>
                  <div className={styles.pencilSketch}>
                    <div className={styles.sketchLines} />
                    <span className={styles.sketchTitle}>{currentProject.title}</span>
                  </div>
                </div>
              </div>

              {/* Hand-written Sticky Note */}
              <div className={styles.stickyNote}>
                <Pin size={14} className={styles.pushPin} />
                <span className={styles.noteTitle}>// Curatorial Insight:</span>
                <p className={styles.noteBody}>{currentProject.metricsOrHighlight}</p>
              </div>

              <div className={styles.pageTurnTabs}>
                {tornData.projects.map((proj, idx) => (
                  <button
                    key={proj.id}
                    type="button"
                    className={`${styles.tabBtn} ${activePageIndex === idx ? styles.activeTab : ''}`}
                    onClick={() => handlePageTurn(idx)}
                  >
                    Page {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Page: Case Study Breakdown with Torn Sections */}
            <div className={styles.rightPage}>
              <div className={styles.tornTopEdge} />
              <div className={styles.paperTexture} />

              <div className={styles.tapeAngle} />

              <div className={styles.rightHeader}>
                <span className={styles.fieldTag}>FIELD: {currentProject.category}</span>
                <h3 className={styles.editorialTitle}>{currentProject.title}</h3>
                <span className={styles.clientSubtitle}>For {currentProject.clientType} ({currentProject.year})</span>
              </div>

              <div className={styles.tornCardSection}>
                <h4 className={styles.sectionHeader}>// ATELIER BRIEF</h4>
                <p className={styles.bodyManuscript}>{currentProject.description}</p>
              </div>

              <div className={styles.tornCardSection}>
                <h4 className={styles.sectionHeader}>// HANDCRAFTED DELIVERABLES</h4>
                <ul className={styles.scribbleList}>
                  {currentProject.deliverables.map((item, idx) => (
                    <li key={idx}>✓ {item}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.stampTags}>
                {currentProject.techOrTools.map((t, idx) => (
                  <span key={idx} className={styles.rubberStamp}>{t}</span>
                ))}
              </div>

              <div className={styles.pageFooterAction}>
                <button 
                  type="button" 
                  className={styles.commissionTornBtn}
                  onClick={() => onOpenCommission('Torn Atelier')}
                >
                  <Sparkles size={14} />
                  <span>Commission an Atelier / Editorial Portfolio</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
