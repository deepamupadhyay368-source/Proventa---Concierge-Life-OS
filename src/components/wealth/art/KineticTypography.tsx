'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { Compass, Cpu, TrendingUp, ShieldCheck } from 'lucide-react';

interface KineticHeroTitleProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  className?: string;
}

export function KineticHeroTitle({
  title = 'INDUSTRIAL PROCUREMENT',
  subtitle = 'Comprehensive procurement intelligence platform for enterprise and industrial operations.',
  badge = 'SYS.VER // 2.4.0 — EXPERIMENTAL DIGITAL ART',
  className = '',
}: KineticHeroTitleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const words = title.split(' ');

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: 0, y: 0 });
      }}
      className={`relative select-none py-6 overflow-hidden ${className}`}
    >
      {/* Top Architectural Coordinate Banner */}
      <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.25em] text-[#B9C1CC]/60 pb-4 border-b border-[#B9C1CC]/15">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2457E8] animate-ping" />
          <span className="text-[#F4F2ED] font-semibold">{badge}</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span>COORDINATE: 28.6139° N / 77.2090° E</span>
          <span className="text-[#D5A85D]">ENTROPY: 0.0014</span>
          <span>FPS: 60.0</span>
        </div>
      </div>

      {/* Main Kinetic Typography Headline */}
      <div className="pt-6 pb-4">
        <h1 className="font-heading font-black tracking-[-0.04em] text-[2.75rem] sm:text-[4rem] md:text-[5.5rem] lg:text-[6.5rem] leading-[0.92] uppercase text-[#F4F2ED]">
          {words.map((word, wordIndex) => {
            const isAccent = word.includes('LIVING') || word.includes('SYSTEM');
            return (
              <span key={wordIndex} className="inline-block whitespace-nowrap mr-3 sm:mr-5">
                {word.split('').map((char, charIndex) => {
                  const charOffset = (wordIndex * 6 + charIndex) * 0.04;
                  const offsetX = mousePos.x * (charIndex % 2 === 0 ? 14 : -10);
                  const offsetY = mousePos.y * (charIndex % 3 === 0 ? 12 : -8);

                  return (
                    <motion.span
                      key={charIndex}
                      className={`inline-block transition-colors duration-200 ${
                        isAccent
                          ? 'text-transparent bg-clip-text bg-gradient-to-b from-[#A9D8F5] via-[#2457E8] to-[#2457E8]'
                          : 'text-[#F4F2ED] hover:text-[#A9D8F5]'
                      }`}
                      animate={{
                        x: isHovered ? offsetX : 0,
                        y: isHovered ? offsetY : 0,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 20,
                        delay: charOffset,
                      }}
                    >
                      {char}
                    </motion.span>
                  );
                })}
              </span>
            );
          })}
        </h1>
      </div>

      {/* Subtitle with precision monospace telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 items-end">
        <div className="md:col-span-8">
          <p className="text-base sm:text-lg md:text-xl text-[#B9C1CC] leading-relaxed max-w-2xl font-sans font-normal">
            {subtitle}
          </p>
        </div>

        <div className="md:col-span-4 flex flex-col justify-end items-start md:items-end font-mono text-[11px] text-[#B9C1CC]/70 space-y-1">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-[#2457E8]" />
            <span>ALGORITHM: MULTI-TIER LATTICE</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D5A85D]" />
            <span>DPDP ACT 2023 // AIR-GAPPED VAULT</span>
          </div>
        </div>
      </div>

      {/* Subtle bottom decorative measurement rule */}
      <div className="relative mt-8 h-px bg-gradient-to-r from-transparent via-[#B9C1CC]/30 to-transparent">
        <div className="absolute top-0 left-1/4 -translate-y-1/2 w-2 h-2 rounded-full border border-[#2457E8] bg-[#080A0F]" />
        <div className="absolute top-0 left-3/4 -translate-y-1/2 w-2 h-2 rounded-full border border-[#D5A85D] bg-[#080A0F]" />
      </div>
    </div>
  );
}

export function KineticStatementStream({
  items = [
    'ZERO FLOATING-POINT DRIFT // INTEGER PAISE LEDGER',
    'AUTONOMOUS SCENARIO SIMULATION // 30-YEAR HORIZONS',
    'AES-GCM-256 AIR-GAPPED DOCUMENT VAULT',
    'FAMILY CONSTITUTION // SUCCESSION TRANCHES',
    'CROSS-BORDER TRUST TOPOLOGY // AUTOMATED REBALANCING',
  ],
  speed = 30,
}: {
  items?: string[];
  speed?: number;
}) {
  return (
    <div className="relative overflow-hidden py-3 bg-[#171B23]/80 border-y border-[#B9C1CC]/15 select-none backdrop-blur-md">
      <div className="flex w-max animate-pulse-slow">
        <div className="flex space-x-8 items-center font-mono text-[11px] tracking-[0.25em] text-[#B9C1CC] uppercase">
          {items.concat(items).map((text, idx) => (
            <React.Fragment key={idx}>
              <span className="hover:text-[#F4F2ED] transition-colors cursor-default whitespace-nowrap">
                {text}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#2457E8] inline-block" />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

export function KineticStatCard({
  label,
  value,
  subvalue,
  code,
  trend,
  className = '',
}: {
  label: string;
  value: string;
  subvalue?: string;
  code: string;
  trend?: string;
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative p-5 rounded-sm bg-[#171B23] border border-[#B9C1CC]/20 hover:border-[#2457E8] transition-all duration-300 group overflow-hidden ${className}`}
    >
      {/* Background kinetic grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#2457E8_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-[#B9C1CC]/70 mb-3">
        <span>[{code}]</span>
        {trend && (
          <span className="text-[#A9D8F5] flex items-center gap-1 font-bold">
            <TrendingUp className="w-3 h-3 text-[#2457E8]" />
            {trend}
          </span>
        )}
      </div>

      {/* Label */}
      <div className="text-xs uppercase font-sans tracking-wider text-[#B9C1CC] mb-1 font-medium">
        {label}
      </div>

      {/* Massive Value with Kinetic Accent */}
      <div className="relative">
        <div className="font-heading font-black text-2xl sm:text-3xl text-[#F4F2ED] tracking-tight group-hover:text-[#A9D8F5] transition-colors">
          {value}
        </div>
        {subvalue && (
          <div className="font-mono text-[11px] text-[#B9C1CC]/60 mt-1">
            {subvalue}
          </div>
        )}
      </div>

      {/* Corner Precision Crosshairs */}
      <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-[#B9C1CC]/40" />
      <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-[#B9C1CC]/40" />
    </div>
  );
}
