import React from 'react';
import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onStartNow: () => void;
  onLearnMore: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartNow, onLearnMore }) => (
  <section className="relative overflow-hidden rounded-2xl border border-[#D6CCC2] bg-gradient-to-r from-white via-[#F5EBE0] to-[#E3D5CA] px-5 py-4 shadow-card dark:border-[#554A40] dark:from-[#37312C] dark:via-[#413A34] dark:to-[#494138] sm:px-6 sm:py-5">
    <div className="pointer-events-none absolute -right-12 -top-20 h-48 w-48 rounded-full bg-[#746250]/10 blur-3xl" />
    <div className="relative flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#D6CCC2] bg-white/80 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-[#746250] dark:border-[#5B5046] dark:bg-[#413A34] dark:text-[#D5BDAF]">
          <LockKeyhole className="h-3 w-3" />
          <span>PRIVATE BY DESIGN · PROCESSED ON THIS DEVICE</span>
        </div>
        <h1 className="text-lg font-bold tracking-tight text-[#3D3732] dark:text-white sm:text-2xl">
          Make every document safe to share.
        </h1>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#766C63] dark:text-[#C4B7A9] sm:text-sm">
          Find sensitive details, review what was detected, and redact them in a few clicks.
        </p>
      </div>
      <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto">
        <button onClick={onLearnMore} className="rounded-lg px-3 py-2 text-xs font-semibold text-[#766C63] transition hover:bg-white/80 hover:text-[#3D3732] dark:text-[#D6CCC2] dark:hover:bg-[#494138] dark:hover:text-white">
          How it works
        </button>
        <button onClick={onStartNow} className="inline-flex items-center gap-2 rounded-lg bg-[#746250] px-4 py-2.5 text-xs font-semibold text-white shadow-button transition hover:bg-[#5D4C3E] focus:outline-none focus:ring-2 focus:ring-[#746250]/40 focus:ring-offset-2">
          <Sparkles className="h-3.5 w-3.5" />
          Open workspace
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  </section>
);
