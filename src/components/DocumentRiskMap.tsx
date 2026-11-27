import React from 'react';
import { DetectedEntity, ENTITY_CONFIGS } from '../modules/detection/entityTypes';

interface DocumentRiskMapProps {
  totalLines: number;
  entities: DetectedEntity[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string) => void;
}

/**
 * Feature G — Document Risk Map
 * Creates an interactive visual strip showing sensitive regions by line.
 */
export const DocumentRiskMap: React.FC<DocumentRiskMapProps> = ({
  totalLines,
  entities,
  selectedEntityId,
  onSelectEntity,
}) => {
  if (totalLines <= 1 || entities.length === 0) return null;

  // Group entities by line
  const lineMap = new Map<number, DetectedEntity[]>();
  entities.forEach((entity) => {
    const line = entity.lineNumber || 1;
    if (!lineMap.has(line)) {
      lineMap.set(line, []);
    }
    lineMap.get(line)!.push(entity);
  });

  return (
    <div className="w-7 border-l border-border bg-surface-2 flex flex-col justify-between shrink-0 select-none py-1 relative">
      <div className="text-[8px] font-mono text-foreground-dim text-center uppercase tracking-tighter mb-1">
        Map
      </div>

      <div className="flex-1 w-full relative">
        {Array.from(lineMap.entries()).map(([line, lineEntities]) => {
          const topPercent = Math.min(100, Math.max(0, (line / totalLines) * 100));
          const primaryEntity = lineEntities[0];
          const config = ENTITY_CONFIGS[primaryEntity.type] || ENTITY_CONFIGS.CUSTOM;
          const isSelected = lineEntities.some((e) => e.id === selectedEntityId);

          return (
            <div
              key={`risk-tick-${line}`}
              onClick={() => onSelectEntity(primaryEntity.id)}
              className={`absolute left-1 right-1 h-1 rounded cursor-pointer transition-transform hover:scale-150 ${
                isSelected ? 'ring-1 ring-white z-10' : ''
              }`}
              style={{
                top: `${topPercent}%`,
                backgroundColor: config.color.text,
              }}
              title={`Line ${line}: ${lineEntities.length} sensitive ${
                lineEntities.length === 1 ? 'entity' : 'entities'
              } (${config.label})`}
            />
          );
        })}
      </div>

      <div className="text-[8px] font-mono text-foreground-dim text-center">
        L{totalLines}
      </div>
    </div>
  );
};
