import React from 'react';
import { Columns, Split, Eye } from 'lucide-react';

interface ComparisonToolbarProps {
  activeView: 'side-by-side' | 'diff' | 'preview';
  setActiveView: (view: 'side-by-side' | 'diff' | 'preview') => void;
}

export const ComparisonToolbar: React.FC<ComparisonToolbarProps> = ({
  activeView,
  setActiveView,
}) => {
  return (
    <div className="bg-white border border-[#D6CCC2] rounded-xl px-2.5 py-1.5 shadow-card flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setActiveView('side-by-side')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeView === 'side-by-side'
              ? 'bg-[#746250] text-white shadow-button'
              : 'text-[#766C63] hover:text-[#3D3732] hover:bg-[#EDEDE9]'
          }`}
        >
          <Columns className="w-3.5 h-3.5" />
          <span>Side-by-Side</span>
        </button>

        <button
          onClick={() => setActiveView('diff')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeView === 'diff'
              ? 'bg-[#746250] text-white shadow-button'
              : 'text-[#766C63] hover:text-[#3D3732] hover:bg-[#EDEDE9]'
          }`}
        >
          <Split className="w-3.5 h-3.5" />
          <span>Diff View</span>
        </button>

        <button
          onClick={() => setActiveView('preview')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeView === 'preview'
              ? 'bg-[#746250] text-white shadow-button'
              : 'text-[#766C63] hover:text-[#3D3732] hover:bg-[#EDEDE9]'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Preview Only</span>
        </button>
      </div>
    </div>
  );
};
