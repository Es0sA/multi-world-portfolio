import React from 'react';
import { ArrowLeft, Home, Sparkles } from 'lucide-react';
import { soundEngine } from '../../audio/soundEngine';
import styles from './ReturnControl.module.css';

interface ReturnControlProps {
  onReturn: () => void;
  worldName?: string;
  onOpenCommission?: () => void;
}

export const ReturnControl: React.FC<ReturnControlProps> = ({ 
  onReturn, 
  worldName,
  onOpenCommission 
}) => {
  const handleReturn = () => {
    soundEngine.playReturnClick();
    onReturn();
  };

  const handleCommission = () => {
    soundEngine.playReturnClick();
    if (onOpenCommission) {
      onOpenCommission();
    } else {
      const subject = encodeURIComponent(`Commission Inquiry: Portfolio Like ${worldName || 'Showcase'}`);
      const body = encodeURIComponent(`Hi Esosa,\n\nI explored your portfolio showcase (particularly the ${worldName || 'experience'}) and would love to discuss creating a custom interactive portfolio for my work.\n\nBest,`);
      window.location.href = `mailto:esosaosaretin@gmail.com?subject=${subject}&body=${body}`;
    }
  };

  return (
    <header className={styles.bar} aria-label="World Navigation">
      <button 
        type="button" 
        className={styles.returnBtn} 
        onClick={handleReturn}
        title="Return to Hub (Esc)"
        aria-label="Return to Sanctum Hub"
      >
        <ArrowLeft size={16} className={styles.arrowIcon} />
        <span className={styles.returnText}>Return to Sanctum</span>
        <Home size={14} className={styles.homeIcon} />
      </button>

      {worldName && (
        <div className={styles.worldTag}>
          <span className={styles.dot} />
          <span className={styles.tagText}>{worldName}</span>
        </div>
      )}

      <button 
        type="button" 
        className={styles.commissionBtn}
        onClick={handleCommission}
        title="Commission a custom portfolio like this"
      >
        <Sparkles size={14} />
        <span>Commission This Style</span>
      </button>
    </header>
  );
};
