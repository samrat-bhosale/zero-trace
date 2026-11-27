import React from 'react';
import {
  AlertTriangle,
  Mail,
  Phone,
  Globe,
  FileCheck2,
  CreditCard,
  CheckCircle2,
  Fingerprint,
} from 'lucide-react';
import { DetectedEntity } from '../modules/detection/entityTypes';

interface DetectionOverviewProps {
  entities: DetectedEntity[];
  riskLevel?: string;
  onOpenRiskModal?: () => void;
}

export const DetectionOverview: React.FC<DetectionOverviewProps> = ({
  entities,
  riskLevel = 'HIGH',
  onOpenRiskModal,
}) => {
  const totalCount = entities.length;
  const emailCount = entities.filter((e) => e.type === 'EMAIL').length;
  const phoneCount = entities.filter((e) => e.type === 'PHONE').length;
  const ipCount = entities.filter((e) => e.type === 'IPV4' || e.type === 'IPV6').length;
  const panCount = entities.filter((e) => e.type === 'INDIAN_PAN').length;
  const aadhaarCount = entities.filter((e) => e.type === 'AADHAAR').length;
  const cardCount = entities.filter((e) => e.type === 'CREDIT_CARD').length;
  const riskTone = riskLevel.includes('LOW')
    ? 'bg-[#F5EBE0] border-[#D6CCC2] text-[#746250]'
    : riskLevel.includes('MODERATE')
      ? 'bg-[#FFF5E7] border-[#F4DEBC] text-[#B86B12]'
      : 'bg-[#FFF0F0] border-[#F2CDCD] text-[#B42318]';

  // Circular ring calculation
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (totalCount > 0 ? 0.8 * circumference : 0);

  return (
    <div className="w-full bg-white dark:bg-[#37312C] border border-[#D6CCC2] dark:border-[#1F293D] rounded-2xl p-4 shadow-card flex flex-col justify-between min-h-[140px]">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#3D3732] dark:text-white">Detection Overview</h3>
            <span className="text-[10px] font-medium text-[#766C63] sm:hidden">{totalCount} found</span>
          </div>

          <button
            onClick={onOpenRiskModal}
            title="Open the factors behind this risk rating"
            aria-label={`Risk level ${riskLevel}. Open risk explanation`}
            className={`flex items-center space-x-1 rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-tight transition-all hover:brightness-105 ${riskTone}`}
          >
            <AlertTriangle className="h-3 w-3" />
            <span>{riskLevel}</span>
            <span className="ml-0.5 font-semibold underline underline-offset-2">Why?</span>
          </button>
        </div>

        {/* Circular Stat & Entity Grid */}
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:space-x-4 sm:gap-0">
          {/* Circular Donut Ring */}
          <div className="relative hidden h-[72px] w-[72px] shrink-0 items-center justify-center sm:flex">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
              <circle
                cx="36"
                cy="36"
                r={radius}
                fill="none"
                stroke="#E3D5CA"
                strokeWidth="6"
              />
              <circle
                cx="36"
                cy="36"
                r={radius}
                fill="none"
                stroke="#746250"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-base font-extrabold text-[#3D3732] leading-none">
                {totalCount}
              </span>
              <span className="text-[8px] font-semibold text-[#8D8177] leading-tight mt-0.5">
                Total<br />Entities
              </span>
            </div>
          </div>

          {/* 2-Column Entity Breakdown */}
          <div className="grid flex-1 grid-cols-2 gap-x-3 gap-y-2 text-xs sm:grid-cols-3 xl:grid-cols-6">
            {/* Emails */}
            <div className="flex items-center justify-between text-[#55483F]">
              <div className="flex items-center space-x-1.5">
                <div className="w-4 h-4 rounded bg-[#EDEDE9] flex items-center justify-center text-[#746250]">
                  <Mail className="w-2.5 h-2.5" />
                </div>
                <span className="text-[11px] font-medium text-[#766C63]">Emails</span>
              </div>
              <span className="text-[11px] font-bold text-[#3D3732]">{emailCount}</span>
            </div>

            {/* PAN */}
            <div className="flex items-center justify-between text-[#55483F]">
              <div className="flex items-center space-x-1.5">
                <div className="w-4 h-4 rounded bg-[#EDEDE9] flex items-center justify-center text-[#746250]">
                  <FileCheck2 className="w-2.5 h-2.5" />
                </div>
                <span className="text-[11px] font-medium text-[#766C63]">PAN</span>
              </div>
              <span className="text-[11px] font-bold text-[#3D3732]">{panCount}</span>
            </div>

            {/* Phone Numbers */}
            <div className="flex items-center justify-between text-[#55483F]">
              <div className="flex items-center space-x-1.5">
                <div className="w-4 h-4 rounded bg-[#E3D5CA] flex items-center justify-center text-[#746250]">
                  <Phone className="w-2.5 h-2.5" />
                </div>
                <span className="text-[11px] font-medium text-[#766C63]">Phone Numbers</span>
              </div>
              <span className="text-[11px] font-bold text-[#3D3732]">{phoneCount}</span>
            </div>

            {/* Aadhaar */}
            <div className="flex items-center justify-between text-[#55483F]">
              <div className="flex items-center space-x-1.5">
                <div className="w-4 h-4 rounded bg-[#FFE4E6] flex items-center justify-center text-[#EF4444]">
                  <Fingerprint className="w-2.5 h-2.5" />
                </div>
                <span className="text-[11px] font-medium text-[#766C63]">Aadhaar</span>
              </div>
              <span className="text-[11px] font-bold text-[#3D3732]">{aadhaarCount}</span>
            </div>

            {/* IP Addresses */}
            <div className="flex items-center justify-between text-[#55483F]">
              <div className="flex items-center space-x-1.5">
                <div className="w-4 h-4 rounded bg-[#CCFBF1] flex items-center justify-center text-[#746250]">
                  <Globe className="w-2.5 h-2.5" />
                </div>
                <span className="text-[11px] font-medium text-[#766C63]">IP Addresses</span>
              </div>
              <span className="text-[11px] font-bold text-[#3D3732]">{ipCount}</span>
            </div>

            {/* Credit Cards */}
            <div className="flex items-center justify-between text-[#55483F]">
              <div className="flex items-center space-x-1.5">
                <div className="w-4 h-4 rounded bg-[#F3E8FF] flex items-center justify-center text-[#9333EA]">
                  <CreditCard className="w-2.5 h-2.5" />
                </div>
                <span className="text-[11px] font-medium text-[#766C63]">Credit Cards</span>
              </div>
              <span className="text-[11px] font-bold text-[#3D3732]">{cardCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sanitization Guarantee */}
      <div className="pt-3 border-t border-[#EDEDE9] flex items-center space-x-1.5 text-center justify-center">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#746250]" />
        <span className="text-[11px] font-semibold text-[#55483F] dark:text-[#D6CCC2]">
          Scan results update as your document changes
        </span>
      </div>
    </div>
  );
};
