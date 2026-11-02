'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export const springConfig = {
  type: 'spring',
  damping: 24,
  stiffness: 260,
  mass: 0.8,
};

export const gentleSpring = {
  type: 'spring',
  damping: 30,
  stiffness: 180,
};

// 1. Fluid Fade & Rise
export function LivingFade({
  children,
  delay = 0,
  className = '',
  ...props
}: HTMLMotionProps<'div'> & { delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ ...springConfig, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// 2. Universe Card with Dynamic Depth & Ambient Lighting
export function UniverseCard({
  children,
  className = '',
  hoverEffect = true,
  ...props
}: HTMLMotionProps<'div'> & { hoverEffect?: boolean; className?: string }) {
  return (
    <motion.div
      whileHover={
        hoverEffect
          ? {
              y: -3,
              boxShadow:
                '0 16px 36px -8px rgba(37, 99, 235, 0.12), 0 4px 12px 0 rgba(30, 27, 75, 0.04)',
              borderColor: '#BFDBFE',
              transition: { duration: 0.2 },
            }
          : undefined
      }
      className={`bg-white border border-[#E2E8F0] rounded-xl shadow-[0_4px_20px_-2px_rgba(30,27,75,0.04),0_1px_3px_0_rgba(30,27,75,0.03)] transition-colors ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// 3. Stagger Container for Records & Lists
export function StaggerContainer({
  children,
  className = '',
  staggerDelay = 0.06,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: springConfig },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// 4. Subtle Orbital Breathing Float
export function OrbitalFloat({
  children,
  duration = 6,
  distance = 8,
  className = '',
}: {
  children: React.ReactNode;
  duration?: number;
  distance?: number;
  className?: string;
}) {
  return (
    <motion.div
      animate={{
        y: [0, -distance, 0],
        rotate: [0, 0.5, -0.5, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// 5. Cursor Reactive Tilt for Hero Preview Elements
export function CursorTiltContainer({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [coords, setCoords] = React.useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setCoords({ x: x * 12, y: y * -12 });
  };

  const handleMouseLeave = () => {
    setCoords({ x: 0, y: 0 });
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateY: coords.x,
        rotateX: coords.y,
      }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      style={{ perspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
