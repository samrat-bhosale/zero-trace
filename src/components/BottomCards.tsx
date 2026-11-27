import React, { useState } from 'react';
import {
  Info,
  CheckCircle2,
  Download,
  Copy,
  FileJson,
  Table,
  Check,
  Shield,
  Layers,
} from 'lucide-react';
import type { AuditLogEntry } from '../hooks/useSanitizer';

interface BottomCardsProps {
  riskScore?: number;
  riskLevel?: string;
  riskFactors?: string[];
  auditLogs: AuditLogEntry[];
  onOpenRiskModal?: () => void;
  onDownloadSanitized: () => void;
  onCopyOutput: () => void;
  onExportReport: () => void;
  onDownloadMapping: () => void;
}

export const BottomCards: React.FC<BottomCardsProps> = ({
  riskScore = 78,
  riskLevel = 'High Risk',
  riskFactors = [],
  auditLogs,
  onOpenRiskModal,
  onDownloadSanitized,
  onCopyOutput,
  onExportReport,
  onDownloadMapping,
}) => {
  const [logsCleared, setLogsCleared] = useState(false);
  const [copied, setCopied] = useState(false);
  const riskTone = riskLevel.includes('LOW')
    ? 'bg-[#F5EBE0] border-[#D6CCC2] text-[#746250]'
    : riskLevel.includes('MODERATE')
      ? 'bg-[#FFF5E7] border-[#F4DEBC] text-[#B86B12]'
      : 'bg-[#FFF0F0] border-[#F2CDCD] text-[#B42318]';

  const handleCopy = () => {
    onCopyOutput();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 select-none">
      {/* Card 1: Privacy Risk Score */}
      <div className="bg-white border border-[#D6CCC2] rounded-2xl p-4 shadow-card flex flex-col justify-between relative overflow-hidden min-h-[190px]">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1 text-xs font-bold text-[#3D3732]">
              <span>Privacy Risk Score</span>
              <Info className="w-3.5 h-3.5 text-[#9E9288] cursor-pointer" onClick={onOpenRiskModal} />
            </div>

            <div className={`flex items-center space-x-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${riskTone}`}>
              <span>★</span>
              <span>{riskLevel}</span>
            </div>
          </div>

          {/* Score display */}
          <div className="flex items-baseline space-x-1 my-1">
            <span className="text-2xl font-extrabold text-[#3D3732]">{riskScore}</span>
            <span className="text-xs font-semibold text-[#9E9288]">/ 100</span>
          </div>

          {/* Orange Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-[#EDEDE9] overflow-hidden mb-3">
            <div
              className="h-full bg-[#F59E0B] rounded-full transition-all duration-500"
              style={{ width: `${riskScore}%` }}
            />
          </div>

          {/* Risk Factors */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-[#766C63]">
              Risk Factors:
            </div>
            <ul className="text-[10.5px] text-[#766C63] space-y-0.5 leading-snug">
              {riskFactors.length > 0 ? riskFactors.slice(0, 3).map((factor, index) => (
                <li key={`${index}-${factor}`} className="flex items-start space-x-1.5">
                  <span className="mt-1 w-1.5 h-1.5 shrink-0 rounded-full bg-[#B86B12]" />
                  <span>{factor}</span>
                </li>
              )) : riskScore > 0 ? (
                <li className="text-[#766C63]">Sensitive details were found. Review them above.</li>
              ) : (
                <li className="text-[#766C63]">No recognized sensitive details found.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Right Soft Orange Wave */}
        <svg
          className="absolute bottom-0 right-0 w-24 h-12 pointer-events-none opacity-40"
          viewBox="0 0 100 50"
          fill="none"
        >
          <path
            d="M0 45 C30 20 60 50 100 15 L100 50 L0 50 Z"
            fill="url(#orangeWave)"
          />
          <defs>
            <linearGradient id="orangeWave" x1="0" y1="20" x2="100" y2="50" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F59E0B" />
              <stop offset="1" stopColor="#FDE68A" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Card 2: Processing Log */}
      <div className="bg-white border border-[#D6CCC2] rounded-2xl p-4 shadow-card flex flex-col justify-between min-h-[190px]">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-[#746250]" />
              <h3 className="text-xs font-bold text-[#3D3732]">
                Processing Log
              </h3>
            </div>

            <button
              onClick={() => setLogsCleared(!logsCleared)}
              className="text-[11px] font-semibold text-[#746250] hover:underline"
            >
              {logsCleared ? 'Restore' : 'Clear'}
            </button>
          </div>

          {/* Event entries */}
          {!logsCleared ? (
            auditLogs.length > 0 ? (
              <div className="space-y-2 pt-1 font-mono text-[10px]">
                {auditLogs.slice(0, 4).map((entry) => {
                  const entryTone = entry.type === 'warn'
                    ? 'bg-[#FFF0F0] text-[#B42318]'
                    : entry.type === 'security'
                      ? 'bg-[#FFF5E7] text-[#B86B12]'
                      : 'bg-[#F5EBE0] text-[#746250]';
                  return (
                    <div key={entry.id} className="flex min-w-0 items-center gap-2">
                      <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${entryTone}`}>•</span>
                      <span className="shrink-0 text-[#8D8177]">{entry.timestamp}</span>
                      <span className="min-w-0 truncate font-sans text-[#55483F]">{entry.message}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs italic text-[#9E9288]">No activity yet.</div>
            )
          ) : (
            <div className="text-xs text-[#9E9288] italic py-8 text-center">
              Logs cleared.
            </div>
          )}
        </div>
      </div>

      {/* Card 3: Export Options */}
      <div className="bg-white border border-[#D6CCC2] rounded-2xl p-4 shadow-card flex flex-col justify-between min-h-[190px]">
        <div>
          {/* Header */}
          <div className="flex items-center space-x-1.5 mb-3">
            <Download className="w-3.5 h-3.5 text-[#746250]" />
            <h3 className="text-xs font-bold text-[#3D3732]">
              Export Options
            </h3>
          </div>

          {/* Main Download Button */}
          <button
            onClick={onDownloadSanitized}
            className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-[#746250] text-white text-xs font-bold shadow-button hover:bg-[#5D4C3E] transition-all mb-3"
          >
            <Download className="w-4 h-4" />
            <span>Download Sanitized File</span>
          </button>

          {/* 3 Secondary Action Buttons in a row */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={handleCopy}
              className="py-1.5 px-1 rounded-lg border border-[#D6CCC2] bg-white hover:bg-[#F5EBE0] text-[10px] font-semibold text-[#55483F] transition-all text-center truncate shadow-xs"
            >
              {copied ? 'Copied!' : 'Copy Output'}
            </button>

            <button
              onClick={onExportReport}
              className="py-1.5 px-1 rounded-lg border border-[#D6CCC2] bg-white hover:bg-[#F5EBE0] text-[10px] font-semibold text-[#55483F] transition-all text-center truncate shadow-xs"
            >
              Export Report
            </button>

            <button
              onClick={onDownloadMapping}
              className="py-1.5 px-1 rounded-lg border border-[#D6CCC2] bg-white hover:bg-[#F5EBE0] text-[10px] font-semibold text-[#55483F] transition-all text-center truncate shadow-xs"
            >
              Download Mapping
            </button>
          </div>
        </div>
      </div>

      {/* Card 4: Safe-to-Share Indicator */}
      <div className="bg-[#F5EBE0] border border-[#D6CCC2] rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-card min-h-[190px]">
        {/* Shield with Checkmark Icon */}
        <div className="w-10 h-10 rounded-xl bg-[#746250] flex items-center justify-center text-white mb-2.5 shadow-md shadow-[#746250]/20">
          <Shield className="w-5 h-5 fill-white text-[#746250]" />
        </div>

        {/* Text */}
        <div className="text-sm font-bold text-[#3D3732] leading-snug">
          Your data is now<br />safe to share!
        </div>

        {/* Soft Wave Graphic */}
        <svg
          className="absolute bottom-0 inset-x-0 w-full h-8 pointer-events-none opacity-50"
          viewBox="0 0 100 25"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 15 C30 5 70 25 100 10 L100 25 L0 25 Z"
            fill="#D6CCC2"
          />
        </svg>
      </div>
    </div>
  );
};
