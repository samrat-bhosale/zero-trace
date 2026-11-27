import React, { useRef, useEffect } from 'react';
import { DiffResult, DiffLine } from '../modules/comparison/diffEngine';

interface DiffViewerProps {
  diffResult: DiffResult;
  comparisonMode: 'side-by-side' | 'unified' | 'preview-only';
  showOnlyChanges: boolean;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  diffResult,
  comparisonMode,
  showOnlyChanges,
}) => {
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const isSyncingLeft = useRef(false);
  const isSyncingRight = useRef(false);

  // Synchronized scrolling
  const handleLeftScroll = () => {
    if (!isSyncingLeft.current && leftColRef.current && rightColRef.current) {
      isSyncingRight.current = true;
      rightColRef.current.scrollTop = leftColRef.current.scrollTop;
      setTimeout(() => {
        isSyncingRight.current = false;
      }, 50);
    }
  };

  const handleRightScroll = () => {
    if (!isSyncingRight.current && leftColRef.current && rightColRef.current) {
      isSyncingLeft.current = true;
      leftColRef.current.scrollTop = rightColRef.current.scrollTop;
      setTimeout(() => {
        isSyncingLeft.current = false;
      }, 50);
    }
  };

  const displayedLines = showOnlyChanges
    ? diffResult.lines.filter((l) => l.hasChanges)
    : diffResult.lines;

  if (comparisonMode === 'unified') {
    return (
      <div className="h-full overflow-y-auto font-mono text-xs select-text">
        {displayedLines.map((line) => (
          <div
            key={`diff-unified-${line.lineNumber}`}
            className={`flex border-b border-border/40 py-1 px-3 ${
              line.hasChanges ? 'bg-surface-2' : ''
            }`}
          >
            <span className="w-10 shrink-0 text-foreground-dim select-none">
              {line.lineNumber}
            </span>
            <div className="flex-1 space-y-0.5">
              {line.hasChanges ? (
                <>
                  <div className="text-danger flex items-start space-x-1">
                    <span className="w-3 select-none text-danger/70">-</span>
                    <span className="whitespace-pre-wrap break-all">
                      {line.originalSegments.map((seg, idx) => (
                        <span
                          key={idx}
                          className={seg.type === 'removed' ? 'bg-danger-dim text-danger px-0.5 rounded' : ''}
                        >
                          {seg.value}
                        </span>
                      ))}
                    </span>
                  </div>
                  <div className="text-accent flex items-start space-x-1">
                    <span className="w-3 select-none text-accent/70">+</span>
                    <span className="whitespace-pre-wrap break-all">
                      {line.sanitizedSegments.map((seg, idx) => (
                        <span
                          key={idx}
                          className={seg.type === 'added' ? 'bg-accent-dim text-accent px-0.5 rounded font-semibold' : ''}
                        >
                          {seg.value}
                        </span>
                      ))}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-foreground-muted whitespace-pre-wrap break-all">
                  <span className="w-3 inline-block select-none text-foreground-dim"> </span>
                  {line.originalText}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Side-by-side view (default)
  return (
    <div className="h-full flex divide-x divide-border overflow-hidden select-text">
      {/* Left Column: Original */}
      <div
        ref={leftColRef}
        onScroll={handleLeftScroll}
        className="flex-1 h-full overflow-y-auto font-mono text-xs"
      >
        {displayedLines.map((line) => (
          <div
            key={`orig-${line.lineNumber}`}
            className={`flex items-start py-0.5 px-3 border-b border-border/20 ${
              line.hasChanges ? 'bg-danger-dim/30' : ''
            }`}
          >
            <span className="w-8 shrink-0 text-[10px] text-foreground-dim select-none pt-0.5">
              {line.lineNumber}
            </span>
            <div className="flex-1 whitespace-pre-wrap break-all text-foreground">
              {line.originalSegments.map((seg, idx) => (
                <span
                  key={idx}
                  className={seg.type === 'removed' ? 'bg-danger-dim text-danger font-medium px-0.5 rounded' : ''}
                >
                  {seg.value}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Right Column: Sanitized */}
      <div
        ref={rightColRef}
        onScroll={handleRightScroll}
        className="flex-1 h-full overflow-y-auto font-mono text-xs"
      >
        {displayedLines.map((line) => (
          <div
            key={`sanit-${line.lineNumber}`}
            className={`flex items-start py-0.5 px-3 border-b border-border/20 ${
              line.hasChanges ? 'bg-accent-dim/30' : ''
            }`}
          >
            <span className="w-8 shrink-0 text-[10px] text-foreground-dim select-none pt-0.5">
              {line.lineNumber}
            </span>
            <div className="flex-1 whitespace-pre-wrap break-all text-foreground">
              {line.sanitizedSegments.map((seg, idx) => (
                <span
                  key={idx}
                  className={seg.type === 'added' ? 'bg-accent-dim text-accent font-semibold px-0.5 rounded' : ''}
                >
                  {seg.value}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
