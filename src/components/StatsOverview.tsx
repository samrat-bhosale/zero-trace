import React from 'react';
import {
  Mail,
  Phone,
  CreditCard,
  Globe,
  FileCheck2,
  ShieldAlert,
  Percent,
} from 'lucide-react';
import { DetectedEntity } from '../modules/detection/entityTypes';

interface StatsOverviewProps {
  entities: DetectedEntity[];
  redactedCount: number;
  ignoredCount: number;
  coveragePercentage: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  entities,
  redactedCount,
  ignoredCount,
  coveragePercentage,
}) => {
  const emailCount = entities.filter((e) => e.type === 'EMAIL').length;
  const phoneCount = entities.filter((e) => e.type === 'PHONE').length;
  const govCount = entities.filter((e) => e.type === 'INDIAN_PAN' || e.type === 'AADHAAR').length;
  const cardCount = entities.filter((e) => e.type === 'CREDIT_CARD').length;
  const ipCount = entities.filter((e) => e.type === 'IPV4' || e.type === 'IPV6').length;

  const uniqueCount = new Set(entities.map((e) => `${e.type}:${e.normalizedValue}`)).size;

  return (
    <div className="h-10 border-b border-border bg-surface-2 px-4 flex items-center justify-between text-xs overflow-x-auto shrink-0 select-none no-scrollbar">
      <div className="flex items-center space-x-4">
        {/* Total Entities */}
        <div className="flex items-center space-x-1.5 font-mono">
          <span className="text-foreground-muted">Total Entities:</span>
          <span className="font-semibold text-foreground bg-surface-3 px-1.5 py-0.5 rounded border border-border">
            {entities.length}
          </span>
          {entities.length > 0 && (
            <span className="text-[10px] text-foreground-dim">
              ({uniqueCount} unique)
            </span>
          )}
        </div>

        <div className="h-3 w-px bg-border" />

        {/* Category Breakdown */}
        <div className="flex items-center space-x-3 text-[11px] font-mono">
          <div
            className={`flex items-center space-x-1 ${
              emailCount > 0 ? 'text-[#79B8FF]' : 'text-foreground-dim'
            }`}
            title="Email addresses"
          >
            <Mail className="w-3 h-3" />
            <span>Emails:</span>
            <span className="font-semibold">{emailCount}</span>
          </div>

          <div
            className={`flex items-center space-x-1 ${
              phoneCount > 0 ? 'text-[#77E3AE]' : 'text-foreground-dim'
            }`}
            title="Phone numbers"
          >
            <Phone className="w-3 h-3" />
            <span>Phones:</span>
            <span className="font-semibold">{phoneCount}</span>
          </div>

          <div
            className={`flex items-center space-x-1 ${
              govCount > 0 ? 'text-[#F2BD67]' : 'text-foreground-dim'
            }`}
            title="Government IDs (PAN & Aadhaar)"
          >
            <FileCheck2 className="w-3 h-3" />
            <span>Gov IDs:</span>
            <span className="font-semibold">{govCount}</span>
          </div>

          <div
            className={`flex items-center space-x-1 ${
              cardCount > 0 ? 'text-[#FF646E]' : 'text-foreground-dim'
            }`}
            title="Payment cards"
          >
            <CreditCard className="w-3 h-3" />
            <span>Cards:</span>
            <span className="font-semibold">{cardCount}</span>
          </div>

          <div
            className={`flex items-center space-x-1 ${
              ipCount > 0 ? 'text-[#56D4DD]' : 'text-foreground-dim'
            }`}
            title="IP addresses"
          >
            <Globe className="w-3 h-3" />
            <span>IPs:</span>
            <span className="font-semibold">{ipCount}</span>
          </div>
        </div>
      </div>

      {/* Sanitization Coverage Metric */}
      {entities.length > 0 && (
        <div className="flex items-center space-x-3 text-[11px] font-mono">
          <div className="flex items-center space-x-1.5 text-foreground-muted">
            <span>Redacted:</span>
            <span className="text-accent font-semibold">{redactedCount}</span>
            {ignoredCount > 0 && (
              <>
                <span className="text-foreground-dim">/ Ignored:</span>
                <span className="text-foreground-dim font-medium">{ignoredCount}</span>
              </>
            )}
          </div>

          <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-accent-dim text-accent border border-accent-border font-semibold">
            <Percent className="w-3 h-3" />
            <span>{coveragePercentage}% Coverage</span>
          </div>
        </div>
      )}
    </div>
  );
};
