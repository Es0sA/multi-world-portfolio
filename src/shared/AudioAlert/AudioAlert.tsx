import React from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import styles from './AudioAlert.module.css';

interface AudioAlertProps {
  onEnable: () => void;
  onDismiss: () => void;
}

export const AudioAlert: React.FC<AudioAlertProps> = ({ onEnable, onDismiss }) => {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="audio-dialog-title">
      <div className={styles.banner}>
        <div className={styles.iconGlow}>
          <Volume2 size={24} className={styles.icon} />
        </div>
        <div className={styles.content}>
          <div className={styles.tag}>
            <Sparkles size={13} className={styles.sparkle} />
            <span>Interactive Sonic Dimension</span>
          </div>
          <h2 id="audio-dialog-title" className={styles.title}>
            Best experienced with sound enabled
          </h2>
          <p className={styles.desc}>
            Each portfolio world features custom synthesized reactive audio, atmospheric drone layers, and tactile sound design.
          </p>
        </div>
        <div className={styles.actions}>
          <button 
            type="button" 
            className={styles.enableBtn} 
            onClick={onEnable}
            autoFocus
          >
            <Volume2 size={16} />
            <span>Enable Audio</span>
          </button>
          <button 
            type="button" 
            className={styles.muteBtn} 
            onClick={onDismiss}
          >
            <VolumeX size={15} />
            <span>Continue Muted</span>
          </button>
        </div>
      </div>
    </div>
  );
};
