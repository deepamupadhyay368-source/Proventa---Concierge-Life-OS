'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronRight, ShieldCheck, Building2, Layers } from 'lucide-react';

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 800], [0, 100]);

  // Subtle mouse-based parallax for desktop
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (shouldReduceMotion) return;
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 16;
      const y = (e.clientY / innerHeight - 0.5) * 16;
      setMousePosition({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [shouldReduceMotion]);

  return (
    <section className="relative w-full min-h-[90vh] lg:min-h-[96vh] flex items-center overflow-hidden bg-[#FFFFFF]">
      {/* FULL-SCREEN ARCHITECTURAL 3D BACKGROUND */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ y: shouldReduceMotion ? 0 : bgY }}
      >
        <motion.div
          className="relative w-full h-full scale-[1.02]"
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  x: mousePosition.x * -1,
                  y: mousePosition.y * -1,
                  scale: [1.02, 1.05, 1.02],
                }
          }
          transition={{
            scale: { duration: 24, repeat: Infinity, ease: 'easeInOut' },
            x: { type: 'spring', damping: 40, stiffness: 80 },
            y: { type: 'spring', damping: 40, stiffness: 80 },
          }}
        >
          <Image
            src="/images/proventa-architecture-bg.png"
            alt="PROVENTA Architectural 3D Infrastructure & Industrial Geometry"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>

        {/* Subtle architectural white translucent gradient: Ensures structure stays clearly visible while typography is 100% legible */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/35 sm:to-white/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/40" />
        <div className="absolute inset-0 bg-[#315F91]/[0.02]" />

        {/* Fine Architectural Grid & Measurement Datum Lines */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none bg-[radial-gradient(#315F91_1px,transparent_1px)] [background-size:24px_24px]" />
      </motion.div>

      {/* HERO CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24 lg:py-32 w-full">
        <div className="max-w-3xl space-y-8">
          {/* Descriptor Tag */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-white/90 backdrop-blur-sm border border-[#E2E8EF] text-[#243447] text-xs font-mono uppercase tracking-widest shadow-xs"
          >
            <span className="w-1.5 h-1.5 bg-[#315F91]" />
            <span className="font-semibold text-[#315F91]">PROVENTA</span>
            <span className="text-[#AEBBC6]">•</span>
            <span className="text-[#6B7785] font-medium">INDUSTRIAL PROCUREMENT PLATFORM</span>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#243447] tracking-tight leading-[1.05]">
              Where Industry Connects.
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-[#6B7785] max-w-2xl leading-relaxed font-normal">
              Discover suppliers. Compare quotations. Manage procurement. One connected platform for industrial businesses.
            </p>
          </motion.div>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2"
          >
            <Link
              href="/rfq/new"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#315F91] hover:bg-[#264B74] text-[#FFFFFF] font-semibold text-xs uppercase tracking-wider transition-all duration-150 shadow-xs group"
            >
              <span>Start Procuring</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/supplier/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/95 hover:bg-[#F4F7FA] border border-[#E2E8EF] hover:border-[#AEBBC6] text-[#243447] font-semibold text-xs uppercase tracking-wider transition-all duration-150 shadow-xs"
            >
              <span>Become a Supplier</span>
              <ChevronRight className="w-4 h-4 text-[#6B7785]" />
            </Link>

            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-transparent text-[#6B7785] hover:text-[#243447] font-semibold text-xs uppercase tracking-wider transition-colors"
            >
              <span>How It Works</span>
            </a>
          </motion.div>

          {/* Key Value Points Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="pt-8 border-t border-[#E2E8EF]/90 grid grid-cols-3 gap-6 text-xs text-[#6B7785]"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#315F91] shrink-0" />
              <span className="font-medium text-[#243447]">Verified Suppliers</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#315F91] shrink-0" />
              <span className="font-medium text-[#243447]">Landed Cost Comparison</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#315F91] shrink-0" />
              <span className="font-medium text-[#243447]">Audit-Ready Records</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
