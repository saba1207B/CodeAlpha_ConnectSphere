import React from 'react';

export const FloatingVisuals: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Soft Ambient Depth Glows (Zero text, pure atmosphere that never collides with UI elements) */}
      <div 
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-forest-light/10 filter blur-[100px] animate-pulse"
        style={{ animationDuration: '8s' }}
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-terracotta/10 filter blur-[120px] animate-pulse"
        style={{ animationDuration: '10s' }}
      />
      <div 
        className="absolute top-1/2 right-10 w-72 h-72 rounded-full bg-amber/10 filter blur-[90px]"
      />
    </div>
  );
};
