import React from 'react';
import {
  Settings,
  Mail,
  Phone,
  Globe,
  FileCheck2,
  Fingerprint,
  CreditCard,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { EntityType, RedactionMode } from '../modules/detection/entityTypes';

interface RedactionSettingsCardProps {
  globalMode: RedactionMode;
  setGlobalMode: (mode: RedactionMode) => void;
  enabledTypes: Record<EntityType, boolean>;
  onToggleType: (type: EntityType) => void;
  preset: string;
  onChangePreset: (preset: any) => void;
  onApplyRules: () => void;
}

export const RedactionSettingsCard: React.FC<RedactionSettingsCardProps> = ({
  globalMode,
  setGlobalMode,
  enabledTypes,
  onToggleType,
  preset,
  onChangePreset,
  onApplyRules,
}) => {
  return (
    <div className="w-full bg-white border border-[#D6CCC2] rounded-2xl shadow-card p-4 md:p-5 flex flex-col justify-between select-none">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr_2fr] gap-5 items-start">
        {/* Header */}
        <div className="flex items-center space-x-2 mb-3">
          <Settings className="w-4 h-4 text-[#766C63]" />
          <h3 className="text-xs font-bold text-[#3D3732]">
            Redaction Settings
          </h3>
        </div>

        {/* Redaction Mode Switcher */}
        <div className="space-y-1.5 mb-3">
          <label className="text-[10px] font-semibold text-[#766C63]">
            Redaction Mode
          </label>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setGlobalMode('FULL')}
              className={`py-1 px-1 rounded-lg text-[10px] font-semibold transition-all border ${
                globalMode === 'FULL'
                  ? 'bg-[#746250] text-white border-[#746250] shadow-xs'
                  : 'bg-white border-[#D6CCC2] text-[#766C63] hover:bg-[#F5EBE0]'
              }`}
            >
              Full Mask
            </button>

            <button
              onClick={() => setGlobalMode('PARTIAL')}
              className={`py-1 px-1 rounded-lg text-[10px] font-semibold transition-all border ${
                globalMode === 'PARTIAL'
                  ? 'bg-[#746250] text-white border-[#746250] shadow-xs'
                  : 'bg-white border-[#D6CCC2] text-[#766C63] hover:bg-[#F5EBE0]'
              }`}
            >
              Partial Mask
            </button>

            <button
              onClick={() => setGlobalMode('PSEUDONYMIZE')}
              className={`py-1 px-1 rounded-lg text-[10px] font-semibold transition-all border ${
                globalMode === 'PSEUDONYMIZE'
                  ? 'bg-[#746250] text-white border-[#746250] shadow-xs'
                  : 'bg-white border-[#D6CCC2] text-[#766C63] hover:bg-[#F5EBE0]'
              }`}
            >
              Pseudonymize
            </button>
          </div>
        </div>

        {/* Mask Preset Dropdown */}
        <div className="space-y-1 mb-3">
          <label className="text-[10px] font-semibold text-[#766C63]">
            Mask Preset
          </label>
          <div className="relative">
            <select
              value={preset}
              onChange={(e) => onChangePreset(e.target.value)}
              className="w-full appearance-none bg-white border border-[#D6CCC2] rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#3D3732] focus:outline-none focus:border-[#746250] cursor-pointer"
            >
              <option value="balanced">Balanced</option>
              <option value="conservative">Conservative</option>
              <option value="minimal">Minimal Exposure</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#766C63] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Entities to Redact with Toggles */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-[#766C63]">
            Entities to Redact
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
            {/* Emails */}
            <div className="flex items-center justify-between py-0.5">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-[#EDEDE9] flex items-center justify-center text-[#746250]">
                  <Mail className="w-2.5 h-2.5" />
                </div>
                <span className="text-[11px] font-medium text-[#55483F]">Emails</span>
              </div>
              <button
                onClick={() => onToggleType('EMAIL')}
                className={`w-7 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${
                  enabledTypes.EMAIL ? 'bg-[#746250]' : 'bg-[#C2B5A8]'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform ${
                    enabledTypes.EMAIL ? 'translate-x-3' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Phone Numbers */}
            <div className="flex items-center justify-between py-0.5">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-[#E3D5CA] flex items-center justify-center text-[#746250]">
                  <Phone className="w-2.5 h-2.5" />
                </div>
                <span className="text-[11px] font-medium text-[#55483F]">Phone Numbers</span>
              </div>
              <button
                onClick={() => onToggleType('PHONE')}
                className={`w-7 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${
                  enabledTypes.PHONE ? 'bg-[#746250]' : 'bg-[#C2B5A8]'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform ${
                    enabledTypes.PHONE ? 'translate-x-3' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* IP Addresses */}
            <div className="flex items-center justify-between py-0.5">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-[#CCFBF1] flex items-center justify-center text-[#746250]">
                  <Globe className="w-2.5 h-2.5" />
                </div>
                <span className="text-[11px] font-medium text-[#55483F]">IP Addresses</span>
              </div>
              <button
                onClick={() => onToggleType('IPV4')}
                className={`w-7 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${
                  enabledTypes.IPV4 ? 'bg-[#746250]' : 'bg-[#C2B5A8]'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform ${
                    enabledTypes.IPV4 ? 'translate-x-3' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* PAN */}
            <div className="flex items-center justify-between py-0.5">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-[#EDEDE9] flex items-center justify-center text-[#746250]">
                  <FileCheck2 className="w-2.5 h-2.5" />
                </div>
                <span className="text-[11px] font-medium text-[#55483F]">PAN</span>
              </div>
              <button
                onClick={() => onToggleType('INDIAN_PAN')}
                className={`w-7 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${
                  enabledTypes.INDIAN_PAN ? 'bg-[#746250]' : 'bg-[#C2B5A8]'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform ${
                    enabledTypes.INDIAN_PAN ? 'translate-x-3' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Aadhaar */}
            <div className="flex items-center justify-between py-0.5">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-[#FFE4E6] flex items-center justify-center text-[#EF4444]">
                  <Fingerprint className="w-2.5 h-2.5" />
                </div>
                <span className="text-[11px] font-medium text-[#55483F]">Aadhaar</span>
              </div>
              <button
                onClick={() => onToggleType('AADHAAR')}
                className={`w-7 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${
                  enabledTypes.AADHAAR ? 'bg-[#746250]' : 'bg-[#C2B5A8]'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform ${
                    enabledTypes.AADHAAR ? 'translate-x-3' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Credit Cards */}
            <div className="flex items-center justify-between py-0.5">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-[#F3E8FF] flex items-center justify-center text-[#9333EA]">
                  <CreditCard className="w-2.5 h-2.5" />
                </div>
                <span className="text-[11px] font-medium text-[#55483F]">Credit Cards</span>
              </div>
              <button
                onClick={() => onToggleType('CREDIT_CARD')}
                className={`w-7 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${
                  enabledTypes.CREDIT_CARD ? 'bg-[#746250]' : 'bg-[#C2B5A8]'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform ${
                    enabledTypes.CREDIT_CARD ? 'translate-x-3' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Link: Apply Rules */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={onApplyRules}
          className="text-[11px] font-semibold text-[#746250] hover:text-[#5D4C3E] flex items-center space-x-1"
        >
          <span>Apply Rules</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
