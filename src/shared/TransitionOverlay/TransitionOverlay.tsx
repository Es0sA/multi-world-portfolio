import React, { useEffect, useRef } from 'react';
import styles from './TransitionOverlay.module.css';

interface TransitionOverlayProps {
  isActive: boolean;
  accentColor: string;
  worldName: string;
}

export const TransitionOverlay: React.FC<TransitionOverlayProps> = ({ 
  isActive, 
  accentColor, 
  worldName 
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);
    const centerX = width / 2;
    const centerY = height / 2;

    // Generate speed lines and warp rays
    const rays: { angle: number; speed: number; length: number; dist: number }[] = [];
    for (let i = 0; i < 90; i++) {
      rays.push({
        angle: Math.random() * Math.PI * 2,
        speed: 10 + Math.random() * 25,
        length: 20 + Math.random() * 80,
        dist: Math.random() * 150,
      });
    }

    const startTime = performance.now();

    const render = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      ctx.fillStyle = 'rgba(5, 6, 12, 0.22)';
      ctx.fillRect(0, 0, width, height);

      // Draw expanding warp tunnel
      for (const ray of rays) {
        ray.dist += ray.speed;
        if (ray.dist > Math.max(width, height)) {
          ray.dist = 5;
        }

        const x1 = centerX + Math.cos(ray.angle) * ray.dist;
        const y1 = centerY + Math.sin(ray.angle) * ray.dist;
        const x2 = centerX + Math.cos(ray.angle) * (ray.dist + ray.length);
        const y2 = centerY + Math.sin(ray.angle) * (ray.dist + ray.length);

        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Center glowing rift
      const glowGrad = ctx.createRadialGradient(
        centerX, centerY, 5, 
        centerX, centerY, 160 + Math.sin(elapsed * 6) * 30
      );
      glowGrad.addColorStop(0, accentColor);
      glowGrad.addColorStop(0.5, 'rgba(15, 17, 26, 0.4)');
      glowGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 220, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isActive, accentColor]);

  if (!isActive) return null;

  return (
    <div className={styles.container} role="status" aria-live="polite">
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.textWrap}>
        <span className={styles.subtext}>Entering Universe</span>
        <h2 className={styles.title} style={{ color: accentColor }}>{worldName}</h2>
        <div className={styles.loaderBar}>
          <div className={styles.loaderFill} style={{ backgroundColor: accentColor }} />
        </div>
      </div>
    </div>
  );
};
