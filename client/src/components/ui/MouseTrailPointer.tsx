import React, { useEffect, useRef, useState } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  age: number;
}

export const MouseTrailPointer: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const trailPoints = useRef<TrailPoint[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if device supports fine pointer (mouse)
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      mousePos.current = { x: e.clientX, y: e.clientY };

      // Add to trail
      trailPoints.current.push({
        x: e.clientX,
        y: e.clientY,
        age: 0
      });

      // Cap trail length
      if (trailPoints.current.length > 24) {
        trailPoints.current.shift();
      }

      // Check if hovering over interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest('button, a, input, textarea, select, [role="button"], .feature-card-wrapper');
        setIsHovered(!!interactive);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    // Animation Loop for fluid ring and canvas trail
    const animate = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      // Smooth lerp for outer ring
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.22;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.22;

      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Render trailing glowing particles
        const points = trailPoints.current;
        for (let i = 0; i < points.length; i++) {
          const pt = points[i];
          pt.age += 1;

          const progress = i / points.length;
          const alpha = progress * 0.35;
          const radius = (1 - pt.age / 30) * (isHovered ? 6 : 4);

          if (radius > 0) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, Math.max(0.5, radius), 0, Math.PI * 2);

            // Alternating warm terracotta and forest trail
            if (i % 2 === 0) {
              ctx.fillStyle = `rgba(224, 122, 95, ${alpha})`;
            } else {
              ctx.fillStyle = `rgba(1, 71, 46, ${alpha})`;
            }
            ctx.fill();
          }
        }

        // Remove old points
        trailPoints.current = points.filter((p) => p.age < 28);
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isVisible, isHovered]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[99998] overflow-hidden">
      {/* Canvas for trailing particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Outer fluid trailing ring with warm glow */}
      <div
        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-150 ease-out ${
          isHovered
            ? 'w-12 h-12 border-terracotta bg-terracotta/15 scale-110 shadow-[0_0_20px_rgba(224,122,95,0.4)]'
            : isClicking
            ? 'w-6 h-6 border-forest bg-forest/20 scale-90'
            : 'w-8 h-8 border-forest/50 bg-forest/5'
        }`}
        style={{
          left: `${ringPos.current.x}px`,
          top: `${ringPos.current.y}px`
        }}
      />

      {/* Direct inner focal dot */}
      <div
        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-75 ${
          isHovered
            ? 'w-2.5 h-2.5 bg-terracotta'
            : 'w-2 h-2 bg-forest shadow-sm'
        }`}
        style={{
          left: `${mousePos.current.x}px`,
          top: `${mousePos.current.y}px`
        }}
      />
    </div>
  );
};
