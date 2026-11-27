import React, { useState } from 'react';
import { FileText, Copy, Check } from 'lucide-react';
import { DetectedEntity, ENTITY_CONFIGS } from '../modules/detection/entityTypes';

interface OriginalDocumentPanelProps {
  text: string;
  onChangeText: (text: string) => void;
  entities: DetectedEntity[];
  onSelectEntity?: (id: string) => void;
}

export const OriginalDocumentPanel: React.FC<OriginalDocumentPanelProps> = ({
  text,
  onChangeText,
  entities,
  onSelectEntity,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const lines = text.split('\n');
  const lineCount = lines.length;
  const charCount = text.length;

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Helper to highlight line
  const renderHighlightedLine = (lineStr: string, lineIndex: number) => {
    // Check entities that belong to this line
    const lineEntities = entities.filter((e) => (e.lineNumber || 1) === lineIndex + 1);

    if (lineEntities.length === 0) {
      return <span>{lineStr}</span>;
    }

    // Sort entities in this line
    const sorted = [...lineEntities].sort((a, b) => a.startIndex - b.startIndex);

    // Compute relative start/end within this line
    // Find where the entity substring is located in lineStr
    const elements: React.ReactNode[] = [];
    let curIndex = 0;

    for (const entity of sorted) {
      const matchIdx = lineStr.indexOf(entity.originalValue, curIndex);
      if (matchIdx !== -1) {
        if (matchIdx > curIndex) {
          elements.push(
            <span key={`pre-${entity.id}`}>
              {lineStr.slice(curIndex, matchIdx)}
            </span>
          );
        }

        const config = ENTITY_CONFIGS[entity.type] || ENTITY_CONFIGS.CUSTOM;

        let tokenClass = '';
        if (entity.type === 'EMAIL') tokenClass = 'dark-token-email';
        else if (entity.type === 'PHONE') tokenClass = 'dark-token-phone';
        else if (entity.type === 'INDIAN_PAN') tokenClass = 'dark-token-pan';
        else if (entity.type === 'AADHAAR') tokenClass = 'dark-token-aadhaar';
        else if (entity.type === 'IPV4' || entity.type === 'IPV6') tokenClass = 'dark-token-ip';
        else if (entity.type === 'CREDIT_CARD') tokenClass = 'dark-token-card';

        elements.push(
          <mark
            key={entity.id}
            onClick={() => onSelectEntity?.(entity.id)}
            className={`px-1 py-0.5 rounded cursor-pointer transition-all border font-mono font-medium hover:brightness-105 ${tokenClass}`}
            style={{
              backgroundColor: config.color.bg,
              color: config.color.text,
              borderColor: config.color.border,
            }}
            title={`${config.label} (${entity.confidence} confidence)`}
          >
            {entity.originalValue}
          </mark>
        );

        curIndex = matchIdx + entity.originalValue.length;
      }
    }

    if (curIndex < lineStr.length) {
      elements.push(<span key={`end-${lineIndex}`}>{lineStr.slice(curIndex)}</span>);
    }

    return elements;
  };

  return (
    <div className="flex-1 bg-white border border-[#D6CCC2] rounded-2xl shadow-card flex flex-col justify-between overflow-hidden min-h-[330px]">
      {/* Panel Header */}
      <div className="h-11 border-b border-[#D6CCC2] px-4 flex items-center justify-between select-none">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-[#746250]" />
          <span className="text-xs font-bold text-[#3D3732]">
            Original Document
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {/* Edit Toggle */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-medium text-[#766C63]">Edit</span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`w-8 h-4.5 rounded-full transition-colors relative flex items-center px-0.5 ${
                isEditing ? 'bg-[#746250]' : 'bg-[#C2B5A8]'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transition-transform ${
                  isEditing ? 'translate-x-3.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

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
        </div>
      </div>

      {/* Panel Editor Body */}
      <div className="flex-1 p-4 font-mono text-[13px] leading-6 overflow-y-auto select-text flex">
        {isEditing ? (
          <textarea
            value={text}
            onChange={(e) => onChangeText(e.target.value)}
            className="w-full h-full bg-transparent resize-none focus:outline-none text-[#3D3732]"
            spellCheck={false}
          />
        ) : (
          <div className="flex w-full">
            {/* Line Numbers */}
            <div className="w-6 shrink-0 text-[#9E9288] select-none text-right pr-3 space-y-0.5">
              {lines.map((_, idx) => (
                <div key={idx} className="h-6">
                  {idx + 1}
                </div>
              ))}
            </div>

            {/* Document Lines */}
            <div className="flex-1 text-[#3D3732] space-y-0.5">
              {lines.map((line, idx) => (
                <div key={idx} className="h-6 whitespace-pre-wrap">
                  {renderHighlightedLine(line, idx)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Metadata */}
      <div className="h-8 border-t border-[#EDEDE9] px-4 flex items-center space-x-4 text-[11px] font-mono text-[#8D8177] select-none">
        <span>{lineCount} lines</span>
        <span>{charCount} characters</span>
      </div>
    </div>
  );
};
