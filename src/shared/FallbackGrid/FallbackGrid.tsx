import React from 'react';
import { ProjectItem } from '../../types/world';
import { ExternalLink, Tag, ArrowUpRight, Sparkles } from 'lucide-react';
import styles from './FallbackGrid.module.css';

interface FallbackGridProps {
  worldName: string;
  tagline: string;
  projects: ProjectItem[];
  accentColor: string;
  onOpenCommission: () => void;
}

export const FallbackGrid: React.FC<FallbackGridProps> = ({
  worldName,
  tagline,
  projects,
  accentColor,
  onOpenCommission,
}) => {
  return (
    <section className={styles.container} aria-label={`${worldName} Project Archive`}>
      <div className={styles.header}>
        <div className={styles.badge} style={{ borderColor: accentColor, color: accentColor }}>
          Accessible Archive View
        </div>
        <h2 className={styles.title}>{worldName} Projects</h2>
        <p className={styles.tagline}>{tagline}</p>
        <p className={styles.explainer}>
          Every project below represents a custom interactive experience crafted for client portfolios. 
          Use the cards below to inspect deliverables, architecture, and technology.
        </p>
      </div>

      <div className={styles.grid}>
        {projects.map((proj) => (
          <article key={proj.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.category}>{proj.category}</span>
              <span className={styles.year}>{proj.year}</span>
            </div>

            <h3 className={styles.cardTitle}>{proj.title}</h3>
            <p className={styles.clientTag}>Target Client: {proj.clientType}</p>
            <p className={styles.summary}>{proj.summary}</p>

            <div className={styles.deliverables}>
              <strong className={styles.subheading}>Key Deliverables:</strong>
              <ul>
                {proj.deliverables.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className={styles.tags}>
              {proj.techOrTools.map((t, idx) => (
                <span key={idx} className={styles.tag}>
                  <Tag size={11} /> {t}
                </span>
              ))}
            </div>

            {proj.metricsOrHighlight && (
              <div className={styles.highlight} style={{ borderLeftColor: accentColor }}>
                {proj.metricsOrHighlight}
              </div>
            )}

            <div className={styles.cardFooter}>
              <button 
                type="button" 
                className={styles.inquireBtn}
                onClick={onOpenCommission}
                style={{ borderColor: accentColor }}
              >
                <span>Request Similar Portfolio</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.footerCta}>
        <Sparkles size={20} color={accentColor} />
        <div>
          <h4>Ready to elevate your own creative portfolio?</h4>
          <p>I build custom interactive platforms tailored to your discipline and creative identity.</p>
        </div>
        <button 
          type="button" 
          className={styles.primaryCta} 
          onClick={onOpenCommission}
          style={{ background: accentColor }}
        >
          Commission Your Experience
        </button>
      </div>
    </section>
  );
};
