import React, { useState, useEffect } from 'react';
import { curatorData } from './curatorData';
import { ReturnControl } from '../../shared/ReturnControl/ReturnControl';
import { FallbackGrid } from '../../shared/FallbackGrid/FallbackGrid';
import { soundEngine } from '../../audio/soundEngine';
import { ProjectItem } from '../../types/world';
import { Eye, Maximize2, X, Sparkles, Layers, List } from 'lucide-react';
import styles from './gallery.module.css';

interface GalleryWallProps {
  onReturn: () => void;
  onOpenCommission: (worldName?: string) => void;
}

export const GalleryWallWorld: React.FC<GalleryWallProps> = ({ onReturn, onOpenCommission }) => {
  const [selectedPrint, setSelectedPrint] = useState<ProjectItem | null>(null);
  const [viewMode, setViewMode] = useState<'gallery' | 'archive'>('gallery');

  useEffect(() => {
    soundEngine.setAmbientMood('curator-monolith');
  }, []);

  const openLightbox = (proj: ProjectItem) => {
    soundEngine.playPortalHover();
    setSelectedPrint(proj);
  };

  return (
    <div className={styles.galleryScope}>
      <ReturnControl 
        onReturn={onReturn} 
        worldName="Curator Monolith"
        onOpenCommission={() => onOpenCommission('Curator Monolith')}
      />

      <div className={styles.viewToggle}>
        <button 
          type="button" 
          className={`${styles.toggleBtn} ${viewMode === 'gallery' ? styles.activeToggle : ''}`}
          onClick={() => setViewMode('gallery')}
        >
          <Eye size={14} /> Architectural Exhibition
        </button>
        <button 
          type="button" 
          className={`${styles.toggleBtn} ${viewMode === 'archive' ? styles.activeToggle : ''}`}
          onClick={() => setViewMode('archive')}
        >
          <List size={14} /> Monograph Index
        </button>
      </div>

      {viewMode === 'archive' ? (
        <FallbackGrid 
          worldName={curatorData.name}
          tagline={curatorData.tagline}
          projects={curatorData.projects}
          accentColor="#1e293b"
          onOpenCommission={() => onOpenCommission('Curator Monolith')}
        />
      ) : (
        <div className={styles.museumWing}>
          {/* Gallery Header */}
          <header className={styles.curatorHeader}>
            <span className={styles.roomRoman}>ROOM IV</span>
            <h2 className={styles.curatorTitle}>Curator Monolith</h2>
            <p className={styles.curatorSubtitle}>
              Fine visual identities, spatial typography, and editorial monographs crafted for design directors.
            </p>
          </header>

          {/* Exhibition Wall with Framed Prints */}
          <div className={styles.framedWall}>
            {curatorData.projects.map((proj, idx) => (
              <div key={proj.id} className={styles.frameSlot}>
                <div 
                  className={styles.museumFrame} 
                  onClick={() => openLightbox(proj)}
                >
                  <div className={styles.mattePasspartout}>
                    <div className={styles.printCanvas}>
                      <div className={styles.printAbstractGraphic}>
                        <div className={styles.artPlateGraphic}>
                          <span className={styles.artRoman}>{['I', 'II', 'III'][idx]}</span>
                          <span className={styles.artYear}>{proj.year}</span>
                        </div>
                      </div>
                      <div className={styles.printCaptionOverlay}>
                        <span>{proj.title}</span>
                      </div>
                    </div>
                  </div>

                  <button type="button" className={styles.expandIcon} title="Inspect Print">
                    <Maximize2 size={14} />
                  </button>
                </div>

                {/* Museum Plaque Beneath Frame */}
                <div className={styles.museumPlaque}>
                  <div className={styles.plaqueNum}>0{idx + 1}</div>
                  <div className={styles.plaqueMeta}>
                    <h3 className={styles.plaqueTitle}>{proj.title}</h3>
                    <div className={styles.plaqueMedium}>Commissioned for {proj.clientType}</div>
                    <div className={styles.plaqueSub}>{proj.category}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Lightbox Fullscreen Exhibition Modal */}
          {selectedPrint && (
            <div className={styles.lightbox} onClick={() => setSelectedPrint(null)}>
              <div className={styles.lightboxModal} onClick={(e) => e.stopPropagation()}>
                <button 
                  type="button" 
                  className={styles.closeLightbox} 
                  onClick={() => setSelectedPrint(null)}
                >
                  <X size={18} />
                </button>

                <div className={styles.lightboxInner}>
                  <div className={styles.lightboxArtwork}>
                    <div className={styles.giantPrint}>
                      <span className={styles.giantPlate}>{selectedPrint.title}</span>
                      <span className={styles.giantYear}>{selectedPrint.year}</span>
                    </div>
                  </div>

                  <div className={styles.lightboxDetails}>
                    <div className={styles.monographHeader}>
                      <span className={styles.monoCategory}>{selectedPrint.category}</span>
                      <h3 className={styles.monoTitle}>{selectedPrint.title}</h3>
                      <p className={styles.monoClient}>Client: {selectedPrint.clientType}</p>
                    </div>

                    <div className={styles.monoBody}>
                      <p>{selectedPrint.description}</p>
                    </div>

                    <div className={styles.monoDeliverables}>
                      <h4>Exhibition Deliverables:</h4>
                      <ul>
                        {selectedPrint.deliverables.map((item, idx) => (
                          <li key={idx}>— {item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className={styles.monoHighlight}>
                      <strong>Curatorial Note:</strong> {selectedPrint.metricsOrHighlight}
                    </div>

                    <div className={styles.monoTools}>
                      {selectedPrint.techOrTools.map((tool, idx) => (
                        <span key={idx} className={styles.monoToolTag}>{tool}</span>
                      ))}
                    </div>

                    <button 
                      type="button" 
                      className={styles.commissionGalleryBtn}
                      onClick={() => onOpenCommission('Curator Monolith')}
                    >
                      <Sparkles size={14} />
                      <span>Commission a Fine Art Gallery Portfolio</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
