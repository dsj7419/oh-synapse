"use client";

import React from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';

interface AnimatedGridProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedGrid: React.FC<AnimatedGridProps> = ({ children, className = '' }) => {
  const [parent] = useAutoAnimate();

  return (
    <div ref={parent} className={`grid gap-6 ${className}`}>
      {children}
    </div>
  );
};
