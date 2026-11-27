import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface IntroPageProps {
  onEnter: () => void;
}

export const IntroPage: React.FC<IntroPageProps> = ({ onEnter }) => (
  <main className="page-enter relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#EDEDE9] px-5 text-[#3D3732] dark:bg-[#292521] dark:text-[#F5EBE0]">
    <div className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#746250]/[0.06] blur-3xl dark:bg-[#746250]/[0.12]" />

    <section className="relative w-full max-w-2xl rounded-[28px] border border-[#D6CCC2] bg-white/90 px-7 py-12 text-center shadow-[0_24px_80px_rgba(116,98,80,0.10)] backdrop-blur sm:px-14 sm:py-16 dark:border-[#554A40] dark:bg-[#37312C]/95 dark:shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
      <div className="mb-10 flex items-center justify-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#746250] text-white shadow-md shadow-[#746250]/20">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="text-left">
          <p className="text-sm font-bold tracking-tight">ZERO TRACE</p>
          <p className="text-[9px] font-semibold tracking-[0.18em] text-[#766C63] dark:text-[#BBAE9F]">PRIVACY INTELLIGENCE</p>
        </div>
      </div>

      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D6CCC2] bg-[#F5EBE0] text-[#746250] dark:border-[#5B5046] dark:bg-[#494138] dark:text-[#D5BDAF]">
        <ShieldCheck className="h-8 w-8" strokeWidth={1.7} />
      </div>

      <p className="mb-3 text-[11px] font-bold tracking-[0.16em] text-[#746250] dark:text-[#D5BDAF]">
        DETECT · REDACT · STAY SECURE
      </p>
      <h1 className="mx-auto max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
        Your data. <span className="text-[#746250]">Your privacy.</span>
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#766C63] dark:text-[#C4B7A9] sm:text-base">
        Find sensitive details in your documents and redact them before sharing. Your data stays on this device.
      </p>

      <button
        onClick={onEnter}
        className="mx-auto mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#746250] px-6 text-sm font-semibold text-white shadow-lg shadow-[#746250]/20 transition hover:-translate-y-0.5 hover:bg-[#5D4C3E] focus:outline-none focus:ring-2 focus:ring-[#746250]/40 focus:ring-offset-2"
      >
        Enter workspace
        <ArrowRight className="h-4 w-4" />
      </button>

      <p className="mt-5 text-xs font-medium text-[#746250] dark:text-[#D5BDAF]">
        Private by design · Processed locally
      </p>
    </section>
  </main>
);
