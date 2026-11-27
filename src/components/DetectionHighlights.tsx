import React from 'react';
import { DetectedEntity, ENTITY_CONFIGS } from '../modules/detection/entityTypes';

interface DetectionHighlightsProps {
  text: string;
  entities: DetectedEntity[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string) => void;
}

export const DetectionHighlights: React.FC<DetectionHighlightsProps> = ({
  text,
  entities,
  selectedEntityId,
  onSelectEntity,
}) => {
  if (!text) return null;
  if (entities.length === 0) {
    return (
      <div className="p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap select-text text-foreground-muted">
        {text}
      </div>
    );
  }

  // Slice text into segments: normal text and entity spans
  const sortedEntities = [...entities].sort((a, b) => a.startIndex - b.startIndex);
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  sortedEntities.forEach((entity, idx) => {
    // Normal text before entity
    if (entity.startIndex > lastIndex) {
      elements.push(
        <span key={`text-${idx}-${lastIndex}`}>
          {text.slice(lastIndex, entity.startIndex)}
        </span>
      );
    }

    const config = ENTITY_CONFIGS[entity.type] || ENTITY_CONFIGS.CUSTOM;
    const isSelected = selectedEntityId === entity.id;
    const isIgnored = !entity.selected || entity.redactionMode === 'IGNORE';

    elements.push(
      <mark
        key={entity.id}
        onClick={() => onSelectEntity(entity.id)}
        className={`inline-block px-1 py-0.5 rounded cursor-pointer transition-all border font-mono font-medium ${
          isIgnored
            ? 'line-through opacity-50 bg-surface-3 text-foreground-dim border-border'
            : isSelected
            ? 'ring-2 ring-white/50 shadow-sm scale-[1.02]'
            : 'hover:brightness-125'
        }`}
        style={{
          backgroundColor: isIgnored ? undefined : config.color.bg,
          color: isIgnored ? undefined : config.color.text,
          borderColor: isIgnored ? undefined : config.color.border,
        }}
        title={`${config.label} (${entity.confidence} confidence) - Click to inspect`}
      >
        {entity.originalValue}
      </mark>
    );

    lastIndex = entity.endIndex;
  });

  // Trailing text
  if (lastIndex < text.length) {
    elements.push(
      <span key={`text-end-${lastIndex}`}>{text.slice(lastIndex)}</span>
    );
  }

  return (
    <div className="p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap select-text">
      {elements}
    </div>
  );
};
