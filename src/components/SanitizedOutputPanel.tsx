import React, { useState } from 'react';
import { Shield, Copy, Check, Download } from 'lucide-react';
import { RedactionResult } from '../modules/redaction/redactionEngine';
import { ENTITY_CONFIGS } from '../modules/detection/entityTypes';

interface SanitizedOutputPanelProps {
  sanitizedText: string;
  redactionResult: RedactionResult;
  onDownload: () => void;
}

export const SanitizedOutputPanel: React.FC<SanitizedOutputPanelProps> = ({
  sanitizedText,
  redactionResult,
  onDownload,
}) => {
  const [copied, setCopied] = useState(false);

  const lines = sanitizedText.split('\n');
  const lineCount = lines.length;
  const charCount = sanitizedText.length;

  const handleCopy = () => {
    navigator.clipboard.writeText(sanitizedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Helper to render sanitized line with pastel placeholders
  const renderSanitizedLine = (lineStr: string) => {
    // Check if line contains any replacement tokens like USER_01, PHONE_01, PAN_01, etc.
    const tokenRegex = /(USER_\d+|PHONE_\d+|PAN_\d+|AADHAAR_\d+|CARD_\d+|IP_\d+|\[[A-Z\s_]+\]|[a-zA-Z0-9.*]+@[a-zA-Z0-9.*]+|XXXX[0-9\sX]+|AB\*\*\*[0-9A-Z]+)/g;

    const parts: React.ReactNode[] = [];
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(lineStr)) !== null) {
      if (match.index > lastIdx) {
        parts.push(lineStr.slice(lastIdx, match.index));
      }

      const token = match[0];
      // Determine badge color
      let bg = '#FEF3C7';
      let text = '#92400E';
      let border = '#FDE68A';
      let tokenClass = 'dark-token-pan';

      if (token.startsWith('USER_') || token.includes('EMAIL')) {
        bg = '#DDE9FF';
        text = '#1E40AF';
        border = '#BFDBFE';
        tokenClass = 'dark-token-email';
      } else if (token.startsWith('PHONE_') || token.includes('PHONE') || token.includes('XXXXXX')) {
        bg = '#E3D5CA';
        text = '#065F46';
        border = '#A7F3D0';
        tokenClass = 'dark-token-phone';
      } else if (token.startsWith('PAN_') || token.includes('PAN')) {
        bg = '#FEF3C7';
        text = '#92400E';
        border = '#FDE68A';
        tokenClass = 'dark-token-pan';
      } else if (token.startsWith('AADHAAR_') || token.includes('AADHAAR')) {
        bg = '#FED7AA';
        text = '#9A3412';
        border = '#FDBA74';
        tokenClass = 'dark-token-aadhaar';
      } else if (token.startsWith('IP_') || token.includes('IP')) {
        bg = '#CCFBF1';
        text = '#115E59';
        border = '#99F6E4';
        tokenClass = 'dark-token-ip';
      } else if (token.startsWith('CARD_') || token.includes('CARD')) {
        bg = '#FFE4E6';
        text = '#9F1239';
        border = '#FECDD3';
        tokenClass = 'dark-token-card';
      }

      parts.push(
        <mark
          key={`sanit-${match.index}`}
          className={`px-1 py-0.5 rounded border font-mono font-medium ${tokenClass}`}
          style={{ backgroundColor: bg, color: text, borderColor: border }}
        >
          {token}
        </mark>
      );

      lastIdx = match.index + token.length;
    }

    if (lastIdx < lineStr.length) {
      parts.push(lineStr.slice(lastIdx));
    }

    return parts.length > 0 ? parts : lineStr;
  };

  return (
    <div className="flex-1 bg-white border border-[#D6CCC2] rounded-2xl shadow-card flex flex-col justify-between overflow-hidden min-h-[330px]">
      {/* Panel Header */}
      <div className="h-11 border-b border-[#D6CCC2] px-4 flex items-center justify-between select-none">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 fill-[#746250] text-[#746250]" />
          <span className="text-xs font-bold text-[#3D3732]">
            Sanitized Output
          </span>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 text-[11px] font-medium text-[#766C63] hover:text-[#3D3732] px-2 py-1 rounded-md hover:bg-[#EDEDE9] transition-all"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[#746250]" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#766C63]" />
            )}
            <span>Copy</span>
          </button>

          {/* Download Button */}
          <button
            onClick={onDownload}
            className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-[11px] font-semibold transition-all shadow-xs"
          >
            <Download className="w-3 h-3" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Panel Editor Body */}
      <div className="flex-1 p-4 font-mono text-[13px] leading-6 overflow-y-auto select-text flex">
        <div className="flex w-full">
          {/* Line Numbers */}
          <div className="w-6 shrink-0 text-[#9E9288] select-none text-right pr-3 space-y-0.5">
            {lines.map((_, idx) => (
              <div key={idx} className="h-6">
                {idx + 1}
              </div>
            ))}
          </div>

          {/* Sanitized Document Lines */}
          <div className="flex-1 text-[#3D3732] space-y-0.5">
            {lines.map((line, idx) => (
              <div key={idx} className="h-6 whitespace-pre-wrap">
                {renderSanitizedLine(line)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Metadata */}
      <div className="h-8 border-t border-[#EDEDE9] px-4 flex items-center space-x-4 text-[11px] font-mono text-[#8D8177] select-none">
        <span>{lineCount} lines</span>
        <span>{charCount} characters</span>
      </div>
    </div>
  );
};
