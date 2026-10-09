import React, { useState, useEffect } from 'react';
import { retroData } from './retroData';
import { ReturnControl } from '../../shared/ReturnControl/ReturnControl';
import { FallbackGrid } from '../../shared/FallbackGrid/FallbackGrid';
import { soundEngine } from '../../audio/soundEngine';
import { ProjectItem } from '../../types/world';
import { 
  Monitor, 
  HardDrive, 
  Folder, 
  FileCode, 
  ExternalLink, 
  Sparkles, 
  Terminal, 
  Layers, 
  X, 
  Minus, 
  Square,
  List
} from 'lucide-react';
import styles from './cpu.module.css';

interface RetroWorkstationProps {
  onReturn: () => void;
  onOpenCommission: (worldName?: string) => void;
}

export const RetroWorkstationWorld: React.FC<RetroWorkstationProps> = ({ 
  onReturn, 
  onOpenCommission 
}) => {
  const [activeWindow, setActiveWindow] = useState<ProjectItem | null>(retroData.projects[0]);
  const [zoomedIn, setZoomedIn] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'archive'>('desktop');
  const [currentTime, setCurrentTime] = useState('11:42 AM');

  useEffect(() => {
    soundEngine.setAmbientMood('retro-workstation');
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleIconClick = (proj: ProjectItem) => {
    soundEngine.playTerminalKey();
    setActiveWindow(proj);
    setZoomedIn(true);
  };

  return (
    <div className={styles.retroScope}>
      <ReturnControl 
        onReturn={onReturn} 
        worldName="Retro Workstation"
        onOpenCommission={() => onOpenCommission('Retro Workstation')}
      />

      <div className={styles.viewToggle}>
        <button 
          type="button" 
          className={`${styles.toggleBtn} ${viewMode === 'desktop' ? styles.activeToggle : ''}`}
          onClick={() => setViewMode('desktop')}
        >
          <Monitor size={14} /> 3D CRT Desktop
        </button>
        <button 
          type="button" 
          className={`${styles.toggleBtn} ${viewMode === 'archive' ? styles.activeToggle : ''}`}
          onClick={() => setViewMode('archive')}
        >
          <List size={14} /> Portfolio Archive
        </button>
      </div>

      {viewMode === 'archive' ? (
        <FallbackGrid 
          worldName={retroData.name}
          tagline={retroData.tagline}
          projects={retroData.projects}
          accentColor={retroData.accentColor}
          onOpenCommission={() => onOpenCommission('Retro Workstation')}
        />
      ) : (
        <div className={styles.deskStage}>
          {/* Physical CRT Monitor Bezel */}
          <div className={`${styles.monitorCabinet} ${zoomedIn ? styles.cabinetZoomed : ''}`}>
            <div className={styles.crtBezel}>
              <div className={styles.brandBadge}>HYPER-OS 1994 • WORKSTATION 486DX</div>

              {/* CRT Glass Screen */}
              <div className={styles.glassScreen}>
                <div className={styles.screenCurvature} />
                <div className={styles.scanlines} />

                {/* Virtual Desktop UI */}
                <div className={styles.desktopEnvironment}>
                  {/* Desktop Icons */}
                  <div className={styles.iconTray}>
                    {retroData.projects.map((proj) => (
                      <button
                        key={proj.id}
                        type="button"
                        className={`${styles.desktopIcon} ${activeWindow?.id === proj.id ? styles.iconActive : ''}`}
                        onClick={() => handleIconClick(proj)}
                      >
                        <div className={styles.iconGraphic}>
                          <FileCode size={26} color="#60a5fa" />
                        </div>
                        <span className={styles.iconLabel}>{proj.title.split(' ')[0]}.exe</span>
                      </button>
                    ))}

                    <button
                      type="button"
                      className={styles.desktopIcon}
                      onClick={() => onOpenCommission('Retro Workstation')}
                    >
                      <div className={styles.iconGraphic}>
                        <Sparkles size={26} color="#fbbf24" />
                      </div>
                      <span className={styles.iconLabel}>Hire_Esosa.bat</span>
                    </button>
                  </div>

                  {/* Active Window */}
                  {activeWindow && (
                    <div className={styles.windowFrame}>
                      <div className={styles.windowHeader}>
                        <div className={styles.windowTitle}>
                          <HardDrive size={13} />
                          <span>{activeWindow.title} - Project Specification</span>
                        </div>
                        <div className={styles.windowButtons}>
                          <button type="button" className={styles.winBtn}><Minus size={10} /></button>
                          <button type="button" className={styles.winBtn}><Square size={10} /></button>
                          <button 
                            type="button" 
                            className={`${styles.winBtn} ${styles.winClose}`} 
                            onClick={() => setActiveWindow(null)}
                          >
                            <X size={11} />
                          </button>
                        </div>
                      </div>

                      <div className={styles.windowBody}>
                        <div className={styles.clientBar}>
                          <span>Target Client: <strong>{activeWindow.clientType}</strong></span>
                          <span>Category: <strong>{activeWindow.category}</strong></span>
                          <span>Year: <strong>{activeWindow.year}</strong></span>
                        </div>

                        <h3 className={styles.projTitle}>{activeWindow.title}</h3>
                        <p className={styles.projSummary}>{activeWindow.summary}</p>

                        <div className={styles.specBox}>
                          <h4>Engine Architecture & Deliverables</h4>
                          <p>{activeWindow.description}</p>
                          <ul className={styles.delivList}>
                            {activeWindow.deliverables.map((item, idx) => (
                              <li key={idx}>▸ {item}</li>
                            ))}
                          </ul>
                        </div>

                        <div className={styles.metricCard}>
                          <span>Benchmark Highlight:</span>
                          <strong>{activeWindow.metricsOrHighlight}</strong>
                        </div>

                        <div className={styles.toolsRow}>
                          {activeWindow.techOrTools.map((tool, idx) => (
                            <span key={idx} className={styles.toolBadge}>{tool}</span>
                          ))}
                        </div>

                        <div className={styles.windowFooter}>
                          <button 
                            type="button" 
                            className={styles.primaryAction}
                            onClick={() => onOpenCommission('Retro Workstation')}
                          >
                            <Sparkles size={14} />
                            <span>Build Similar Retro Experience</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Windows 95 Style Taskbar */}
                  <div className={styles.taskbar}>
                    <button 
                      type="button" 
                      className={styles.startBtn}
                      onClick={() => onOpenCommission('Retro Workstation')}
                    >
                      <Sparkles size={14} />
                      <strong>START</strong>
                    </button>
                    <div className={styles.taskbarDivider} />
                    <div className={styles.taskItems}>
                      {activeWindow && (
                        <div className={styles.taskActiveTab}>
                          <FileCode size={12} />
                          <span>{activeWindow.title.slice(0, 24)}...</span>
                        </div>
                      )}
                    </div>
                    <div className={styles.clockTray}>
                      <span>{currentTime}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Physical Monitor Buttons */}
              <div className={styles.monitorControls}>
                <div className={styles.monitorBrand}>RETRO-TRONIC 486</div>
                <div className={styles.ctrlButtons}>
                  <button 
                    type="button" 
                    className={styles.zoomToggleBtn}
                    onClick={() => setZoomedIn(!zoomedIn)}
                  >
                    {zoomedIn ? 'Zoom Out' : 'Zoom In'}
                  </button>
                  <span className={styles.powerLed} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
