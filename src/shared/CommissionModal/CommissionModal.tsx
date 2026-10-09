import React from 'react';
import { Mail, Send, X, ExternalLink, Sparkles, CheckCircle } from 'lucide-react';
import styles from './CommissionModal.module.css';

interface CommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  worldName?: string;
}

export const CommissionModal: React.FC<CommissionModalProps> = ({ isOpen, onClose, worldName }) => {
  const [selectedStyle, setSelectedStyle] = React.useState<string>(worldName || 'Custom Showcase');
  const [clientType, setClientType] = React.useState<string>('Freelancer / Creative');
  const [notes, setNotes] = React.useState<string>('');
  const [copied, setCopied] = React.useState<boolean>(false);

  if (!isOpen) return null;

  const targetEmail = 'esosaosaretin@gmail.com';
  const mailtoSubject = encodeURIComponent(`Portfolio Commission Inquiry: ${selectedStyle}`);
  const mailtoBody = encodeURIComponent(
    `Hello Esosa,\n\n` +
    `I am looking for a custom portfolio experience for my work.\n\n` +
    `Preferred Style / Dimension: ${selectedStyle}\n` +
    `My Field: ${clientType}\n` +
    `Project Details / Goals:\n${notes || 'Looking to discuss ideas and timelines.'}\n\n` +
    `Best regards,`
  );

  const mailtoUrl = `mailto:${targetEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

  const copyEmail = () => {
    navigator.clipboard.writeText(targetEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close dialog">
          <X size={18} />
        </button>

        <div className={styles.header}>
          <div className={styles.badge}>
            <Sparkles size={13} />
            <span>Interactive Portfolio Architecture</span>
          </div>
          <h2 className={styles.title}>Commission Your Custom Dimension</h2>
          <p className={styles.subtitle}>
            Every world in this showcase was engineered from scratch. If you want a bespoke digital sanctum built specifically for your body of work, let's talk.
          </p>
        </div>

        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Aesthetic Theme of Interest</label>
            <input 
              type="text" 
              className={styles.input}
              value={selectedStyle} 
              onChange={(e) => setSelectedStyle(e.target.value)}
              placeholder="e.g. Retro Workstation, Pop-Up Book, Ink Dimension"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Your Creative Field</label>
            <select 
              className={styles.select}
              value={clientType} 
              onChange={(e) => setClientType(e.target.value)}
            >
              <option value="Software Engineer / Systems Developer">Software Engineer / Systems Developer</option>
              <option value="Visual Designer / Art Director">Visual Designer / Art Director</option>
              <option value="Comic Artist / Graphic Novelist">Comic Artist / Graphic Novelist</option>
              <option value="Illustrator / Concept Artist">Illustrator / Concept Artist</option>
              <option value="Creative Studio / Collective">Creative Studio / Collective</option>
              <option value="Other">Other Unique Discipline</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Project Scope / Vision (Optional)</label>
            <textarea 
              className={styles.textarea} 
              rows={3} 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tell me about your work, number of projects, or interactive ideas..."
            />
          </div>

          <div className={styles.actions}>
            <a 
              href={mailtoUrl} 
              className={styles.submitBtn}
              target="_blank" 
              rel="noreferrer"
            >
              <Send size={16} />
              <span>Launch Email to {targetEmail}</span>
              <ExternalLink size={14} className={styles.extIcon} />
            </a>

            <button 
              type="button" 
              className={styles.copyBtn} 
              onClick={copyEmail}
            >
              {copied ? (
                <>
                  <CheckCircle size={15} color="#4ade80" />
                  <span>Email Copied!</span>
                </>
              ) : (
                <>
                  <Mail size={15} />
                  <span>Copy Address</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
