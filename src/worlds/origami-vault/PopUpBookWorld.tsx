import React, { useState, useEffect } from 'react';
import { origamiData } from './origamiData';
import { ReturnControl } from '../../shared/ReturnControl/ReturnControl';
import { FallbackGrid } from '../../shared/FallbackGrid/FallbackGrid';
import { soundEngine } from '../../audio/soundEngine';
import { Layers, ChevronRight, ChevronLeft, Sparkles, BookOpen, List } from 'lucide-react';
import styles from './popup.module.css';

interface PopUpBookProps {
  onReturn: () => void;
  onOpenCommission: (worldName?: string) => void;
}

export const PopUpBookWorld: React.FC<PopUpBookProps> = ({ onReturn, onOpenCommission }) => {
  const [currentSpread, setCurrentSpread] = useState(0);
  const [viewMode, setViewMode] = useState<'popup' | 'archive'>('popup');
  const [isUnfolding, setIsUnfolding] = useState(false);

  useEffect(() => {
    soundEngine.setAmbientMood('origami-vault');
  }, []);

  const changeSpread = (newIdx: number) => {
    if (newIdx < 0 || newIdx >= origamiData.projects.length) return;
    soundEngine.playPaperRustle();
    setIsUnfolding(true);
    setCurrentSpread(newIdx);
    setTimeout(() => setIsUnfolding(false), 450);
  };

  const project = origamiData.projects[currentSpread];

  return (
    <div className={styles.popupScope}>
      <ReturnControl 
        onReturn={onReturn} 
        worldName="Origami Vault"
        onOpenCommission={() => onOpenCommission('Origami Vault')}
      />

      <div className={styles.viewToggle}>
        <button 
          type="button" 
          className={`${styles.toggleBtn} ${viewMode === 'popup' ? styles.activeToggle : ''}`}
          onClick={() => setViewMode('popup')}
        >
          <Layers size={14} /> 3D Paper Pop-Up
        </button>
        <button 
          type="button" 
          className={`${styles.toggleBtn} ${viewMode === 'archive' ? styles.activeToggle : ''}`}
          onClick={() => setViewMode('archive')}
        >
          <List size={14} /> Model Catalog
        </button>
      </div>

      {viewMode === 'archive' ? (
        <FallbackGrid 
          worldName={origamiData.name}
          tagline={origamiData.tagline}
          projects={origamiData.projects}
          accentColor={origamiData.accentColor}
          onOpenCommission={() => onOpenCommission('Origami Vault')}
        />
      ) : (
        <div className={styles.stageContainer}>
          <div className={styles.stagePerspective}>
            {/* 3D Pop Up Book */}
            <div className={`${styles.bookBook} ${isUnfolding ? styles.bookUnfolding : ''}`}>
              {/* Left Page (Base) */}
              <div className={styles.pageLeft}>
                <div className={styles.paperGrain} />
                <div className={styles.spreadLabel}>SPREAD #{currentSpread + 1} OF 3</div>
                
                <h3 className={styles.origamiTitle}>{project.title}</h3>
                <span className={styles.origamiClient}>For {project.clientType} ({project.year})</span>
                
                <p className={styles.origamiDesc}>{project.summary}</p>

                <div className={styles.paperAccordion}>
                  <h4>Fold Mechanics & Construction:</h4>
                  <p>{project.description}</p>
                </div>

                <div className={styles.navControls}>
                  <button 
                    type="button" 
                    className={styles.pageTurnBtn} 
                    onClick={() => changeSpread(currentSpread - 1)}
                    disabled={currentSpread === 0}
                  >
                    <ChevronLeft size={16} /> Turn Back
                  </button>
                  <button 
                    type="button" 
                    className={styles.pageTurnBtn} 
                    onClick={() => changeSpread(currentSpread + 1)}
                    disabled={currentSpread === origamiData.projects.length - 1}
                  >
                    Turn Forward <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* 3D Pop-Up Paper Silhouette Standee in the Center */}
              <div className={styles.popStandee}>
                <div className={styles.cutoutLayer1}>
                  <div className={styles.paperShadow} />
                  <div className={styles.cutoutGraphic}>
                    <Layers size={48} color="#a855f7" />
                    <span>3D POP-UP FORM</span>
                  </div>
                </div>

                <div className={styles.cutoutLayer2}>
                  <span className={styles.layerPlaque}>{project.category}</span>
                </div>
              </div>

              {/* Right Page (Spec & Callout) */}
              <div className={styles.pageRight}>
                <div className={styles.paperGrain} />
                
                <div className={styles.dieCutBox}>
                  <h4>Die-Cut Specifications:</h4>
                  <ul>
                    {project.deliverables.map((item, idx) => (
                      <li key={idx}>✂ {item}</li>
                    ))}
                  </ul>
                </div>

                <div className={styles.paperAward}>
                  <strong>Papercraft Accolade:</strong>
                  <p>{project.metricsOrHighlight}</p>
                </div>

                <div className={styles.origamiTools}>
                  {project.techOrTools.map((t, idx) => (
                    <span key={idx} className={styles.toolPaperTag}>{t}</span>
                  ))}
                </div>

                <button 
                  type="button" 
                  className={styles.commissionOrigamiBtn}
                  onClick={() => onOpenCommission('Origami Vault')}
                >
                  <Sparkles size={14} />
                  <span>Commission a 3D Pop-Up Experience</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
