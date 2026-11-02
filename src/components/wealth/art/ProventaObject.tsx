'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Activity, ShieldCheck, RefreshCw } from 'lucide-react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

export function ProventaObject({
  size = 420,
  interactive = true,
  healthScore = 98,
  className = '',
}: {
  size?: number;
  interactive?: boolean;
  healthScore?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotation, setRotation] = useState({ x: 0.3, y: 0.4 });
  const [isHovered, setIsHovered] = useState(false);
  const [activeFace, setActiveFace] = useState<string>('01 // CORE TRUST');

  // Mathematical 3D Vertices for the Proventa Object (Dual Octahedral-Icosahedral Lattice)
  const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
  const scale = size * 0.28;

  // 12 Vertices of the 3D Geometric Form
  const rawVertices: Point3D[] = [
    { x: -1, y: phi, z: 0 },
    { x: 1, y: phi, z: 0 },
    { x: -1, y: -phi, z: 0 },
    { x: 1, y: -phi, z: 0 },
    { x: 0, y: -1, z: phi },
    { x: 0, y: 1, z: phi },
    { x: 0, y: -1, z: -phi },
    { x: 0, y: 1, z: -phi },
    { x: phi, y: 0, z: -1 },
    { x: phi, y: 0, z: 1 },
    { x: -phi, y: 0, z: -1 },
    { x: -phi, y: 0, z: 1 },
  ].map((v) => ({
    x: v.x * scale,
    y: v.y * scale,
    z: v.z * scale,
  }));

  // Edge connectivity list
  const edges: [number, number][] = [
    [0, 1], [0, 5], [0, 7], [0, 10], [0, 11],
    [1, 5], [1, 7], [1, 8], [1, 9],
    [2, 3], [2, 4], [2, 6], [2, 10], [2, 11],
    [3, 4], [3, 6], [3, 8], [3, 9],
    [4, 5], [4, 9], [4, 11],
    [5, 9], [5, 11],
    [6, 7], [6, 8], [6, 10],
    [7, 8], [7, 10],
    [8, 9],
    [10, 11],
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angleX = rotation.x;
    let angleY = rotation.y;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Natural kinetic continuous rotation
      if (!isHovered) {
        angleX += 0.22 * dt;
        angleY += 0.35 * dt;
      } else {
        angleX += 0.08 * dt;
        angleY += 0.12 * dt;
      }

      ctx.clearRect(0, 0, size, size);

      // Center offset
      const cx = size / 2;
      const cy = size / 2;

      // 3D Rotation Matrix Calculation
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      // Project vertices to 2D
      const projected = rawVertices.map((v) => {
        // Rotate Y
        const x1 = v.x * cosY + v.z * sinY;
        const y1 = v.y;
        const z1 = -v.x * sinY + v.z * cosY;

        // Rotate X
        const x2 = x1;
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;

        // Perspective projection factor
        const fov = size * 1.5;
        const perspective = fov / (fov + z2 + size * 0.4);

        return {
          x: cx + x2 * perspective,
          y: cy + y2 * perspective,
          z: z2,
          scale: perspective,
        };
      });

      // 1. Draw atmospheric radial aura in background
      const auraGradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, size * 0.48);
      auraGradient.addColorStop(0, 'rgba(36, 87, 232, 0.14)');
      auraGradient.addColorStop(0.5, 'rgba(169, 216, 245, 0.03)');
      auraGradient.addColorStop(1, 'rgba(8, 10, 15, 0)');
      ctx.fillStyle = auraGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.48, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw Edges with Depth and Specular Sheen
      edges.forEach(([i, j]) => {
        const p1 = projected[i];
        const p2 = projected[j];
        const avgZ = (p1.z + p2.z) / 2;

        // Depth-based opacity and color
        const depthFactor = (avgZ + scale * 1.2) / (scale * 2.4);
        const alpha = Math.max(0.15, Math.min(0.95, depthFactor));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        // Titanium Chrome gradient for edge
        const edgeGrad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        if (avgZ > 0) {
          edgeGrad.addColorStop(0, `rgba(185, 193, 204, ${alpha})`);
          edgeGrad.addColorStop(0.5, `rgba(36, 87, 232, ${alpha * 1.2})`);
          edgeGrad.addColorStop(1, `rgba(213, 168, 93, ${alpha * 0.9})`);
          ctx.lineWidth = 1.8 * p1.scale;
        } else {
          edgeGrad.addColorStop(0, `rgba(42, 51, 66, ${alpha * 0.6})`);
          edgeGrad.addColorStop(1, `rgba(56, 67, 86, ${alpha * 0.6})`);
          ctx.lineWidth = 1.0 * p1.scale;
        }

        ctx.strokeStyle = edgeGrad;
        ctx.stroke();
      });

      // 3. Draw Vertex Nodes (Polished Chrome & Signal Nodes)
      projected.forEach((p, idx) => {
        const isNear = p.z > 0;
        const radius = (isNear ? 4.5 : 2.5) * p.scale;

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);

        if (idx === 0 || idx === 1) {
          // Signal Gold Vertex
          ctx.fillStyle = isNear ? '#D5A85D' : '#8C6C38';
          ctx.shadowColor = '#D5A85D';
          ctx.shadowBlur = isNear ? 12 : 2;
        } else if (idx % 3 === 0) {
          // Electric Cobalt Vertex
          ctx.fillStyle = isNear ? '#2457E8' : '#173693';
          ctx.shadowColor = '#2457E8';
          ctx.shadowBlur = isNear ? 14 : 3;
        } else {
          // Brushed Titanium Chrome Vertex
          ctx.fillStyle = isNear ? '#F4F2ED' : '#B9C1CC';
          ctx.shadowColor = '#B9C1CC';
          ctx.shadowBlur = isNear ? 8 : 0;
        }

        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      // 4. Subtle Central Volumetric Energy Core
      const corePulse = Math.sin(time * 0.003) * 4;
      ctx.beginPath();
      ctx.arc(cx, cy, 6 + corePulse, 0, Math.PI * 2);
      ctx.fillStyle = '#2457E8';
      ctx.shadowColor = '#2457E8';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [size, isHovered, rawVertices, edges, scale, rotation]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotation({ x: y * 1.5, y: x * 1.5 });
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Canvas Projection */}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="cursor-grab active:cursor-grabbing max-w-full h-auto drop-shadow-[0_20px_50px_rgba(8,10,15,0.8)]"
      />

      {/* Floating Monolithic Telemetry Stamp */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-2 flex flex-col items-center gap-1.5"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#171B23]/90 backdrop-blur-md border border-[#2A3342] text-[#F4F2ED] rounded-[2px] font-mono text-[10px] uppercase tracking-[0.16em] shadow-xl">
          <span className="w-1.5 h-1.5 bg-[#2457E8] rounded-full animate-ping" />
          <span>SIGNATURE ASSET // THE PROVENTA OBJECT</span>
          <span className="text-[#384356]">|</span>
          <span className="text-[#D5A85D] font-bold">12-VERTEX LATTICE</span>
        </div>
        <div className="font-mono text-[9px] text-[#848E9D] tracking-wider uppercase">
          Dynamic Spatial Refraction • Integer-Paise Health Score {healthScore}%
        </div>
      </motion.div>
    </div>
  );
}
