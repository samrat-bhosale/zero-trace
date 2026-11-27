export type EntityType =
  | 'CUSTOMER_NAME'
  | 'EMAIL'
  | 'PHONE'
  | 'IPV4'
  | 'IPV6'
  | 'INDIAN_PAN'
  | 'AADHAAR'
  | 'CREDIT_CARD'
  | 'API_KEY'
  | 'SECRET_TOKEN'
  | 'DATE_OF_BIRTH'
  | 'CUSTOM';

export type ValidationStatus = 'VALID' | 'INVALID' | 'SUSPECT' | 'UNVALIDATED';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type RedactionMode = 'FULL' | 'PARTIAL' | 'PSEUDONYMIZE' | 'IGNORE';

export interface DetectedEntity {
  id: string;
  type: EntityType;
  label: string;
  originalValue: string;
  normalizedValue: string;
  startIndex: number;
  endIndex: number;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  validationStatus: ValidationStatus;
  validationDetails?: string;
  selected: boolean;
  redactionMode?: RedactionMode;
  customReplacement?: string;
  lineNumber?: number;
  columnNumber?: number;
}

export interface CustomRule {
  id: string;
  name: string;
  pattern: string;
  flags?: string;
  replacement: string;
  type: 'CUSTOM';
  enabled: boolean;
  description?: string;
}

export interface DetectionOptions {
  enabledTypes: Record<EntityType, boolean>;
  customRules?: CustomRule[];
  minConfidence?: ConfidenceLevel;
}

export interface EntityTypeConfig {
  type: EntityType;
  label: string;
  category: 'personal' | 'financial' | 'government' | 'network' | 'secret' | 'custom';
  color: {
    text: string;
    bg: string;
    border: string;
    badge: string;
  };
  severity: 1 | 2 | 3 | 4 | 5;
  defaultRedactionMode: RedactionMode;
  defaultFullMask: string;
  pseudonymPrefix: string;
}

export const ENTITY_CONFIGS: Record<EntityType, EntityTypeConfig> = {
  CUSTOMER_NAME: {
    type: 'CUSTOMER_NAME',
    label: 'Customer Name',
    category: 'personal',
    color: {
      text: '#92400E',
      bg: '#FEF3C7',
      border: '#FDE68A',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    severity: 2,
    defaultRedactionMode: 'PSEUDONYMIZE',
    defaultFullMask: '[NAME REDACTED]',
    pseudonymPrefix: 'USER',
  },
  EMAIL: {
    type: 'EMAIL',
    label: 'Emails',
    category: 'personal',
    color: {
      text: '#1E40AF',
      bg: '#DDE9FF',
      border: '#BFDBFE',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    severity: 3,
    defaultRedactionMode: 'PSEUDONYMIZE',
    defaultFullMask: '[EMAIL REDACTED]',
    pseudonymPrefix: 'USER',
  },
  PHONE: {
    type: 'PHONE',
    label: 'Phone Numbers',
    category: 'personal',
    color: {
      text: '#065F46',
      bg: '#D5F5E3',
      border: '#A7F3D0',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    severity: 3,
    defaultRedactionMode: 'PSEUDONYMIZE',
    defaultFullMask: '[PHONE REDACTED]',
    pseudonymPrefix: 'PHONE',
  },
  IPV4: {
    type: 'IPV4',
    label: 'IP Addresses',
    category: 'network',
    color: {
      text: '#115E59',
      bg: '#CCFBF1',
      border: '#99F6E4',
      badge: 'bg-teal-100 text-teal-800 border-teal-200',
    },
    severity: 2,
    defaultRedactionMode: 'PSEUDONYMIZE',
    defaultFullMask: '[IP REDACTED]',
    pseudonymPrefix: 'IP',
  },
  IPV6: {
    type: 'IPV6',
    label: 'IP Addresses (v6)',
    category: 'network',
    color: {
      text: '#115E59',
      bg: '#CCFBF1',
      border: '#99F6E4',
      badge: 'bg-teal-100 text-teal-800 border-teal-200',
    },
    severity: 2,
    defaultRedactionMode: 'PSEUDONYMIZE',
    defaultFullMask: '[IPV6 REDACTED]',
    pseudonymPrefix: 'IP',
  },
  INDIAN_PAN: {
    type: 'INDIAN_PAN',
    label: 'PAN',
    category: 'government',
    color: {
      text: '#92400E',
      bg: '#FEF3C7',
      border: '#FDE68A',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    severity: 4,
    defaultRedactionMode: 'PSEUDONYMIZE',
    defaultFullMask: '[PAN REDACTED]',
    pseudonymPrefix: 'PAN',
  },
  AADHAAR: {
    type: 'AADHAAR',
    label: 'Aadhaar',
    category: 'government',
    color: {
      text: '#9A3412',
      bg: '#FED7AA',
      border: '#FDBA74',
      badge: 'bg-orange-100 text-orange-800 border-orange-200',
    },
    severity: 5,
    defaultRedactionMode: 'PSEUDONYMIZE',
    defaultFullMask: '[AADHAAR REDACTED]',
    pseudonymPrefix: 'AADHAAR',
  },
  CREDIT_CARD: {
    type: 'CREDIT_CARD',
    label: 'Credit Cards',
    category: 'financial',
    color: {
      text: '#9F1239',
      bg: '#FFE4E6',
      border: '#FECDD3',
      badge: 'bg-rose-100 text-rose-800 border-rose-200',
    },
    severity: 5,
    defaultRedactionMode: 'PSEUDONYMIZE',
    defaultFullMask: '[CARD REDACTED]',
    pseudonymPrefix: 'CARD',
  },
  API_KEY: {
    type: 'API_KEY',
    label: 'API Keys',
    category: 'secret',
    color: {
      text: '#6B21A8',
      bg: '#F3E8FF',
      border: '#E9D5FF',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    severity: 5,
    defaultRedactionMode: 'FULL',
    defaultFullMask: '[SECRET REDACTED]',
    pseudonymPrefix: 'SECRET',
  },
  SECRET_TOKEN: {
    type: 'SECRET_TOKEN',
    label: 'Tokens',
    category: 'secret',
    color: {
      text: '#6B21A8',
      bg: '#F3E8FF',
      border: '#E9D5FF',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    severity: 5,
    defaultRedactionMode: 'FULL',
    defaultFullMask: '[TOKEN REDACTED]',
    pseudonymPrefix: 'TOKEN',
  },
  DATE_OF_BIRTH: {
    type: 'DATE_OF_BIRTH',
    label: 'DOB',
    category: 'personal',
    color: {
      text: '#475569',
      bg: '#F1F5F9',
      border: '#E2E8F0',
      badge: 'bg-slate-100 text-slate-800 border-slate-200',
    },
    severity: 2,
    defaultRedactionMode: 'PARTIAL',
    defaultFullMask: '[DOB REDACTED]',
    pseudonymPrefix: 'DOB',
  },
  CUSTOM: {
    type: 'CUSTOM',
    label: 'Custom Rule',
    category: 'custom',
    color: {
      text: '#1E40AF',
      bg: '#DBEAFE',
      border: '#BFDBFE',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    severity: 3,
    defaultRedactionMode: 'FULL',
    defaultFullMask: '[CUSTOM REDACTED]',
    pseudonymPrefix: 'CUSTOM',
  },
};
