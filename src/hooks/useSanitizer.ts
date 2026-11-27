import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  DetectedEntity,
  DetectionOptions,
  EntityType,
  RedactionMode,
  CustomRule,
  ENTITY_CONFIGS,
} from '../modules/detection/entityTypes';
import { detectEntities } from '../modules/detection/detectEntities';
import { sanitizeText, RedactionResult } from '../modules/redaction/redactionEngine';
import { PseudonymEngine } from '../modules/redaction/pseudonymize';
import { computeDiff, DiffResult } from '../modules/comparison/diffEngine';
import { calculatePrivacyRisk, PrivacyRiskAssessment } from '../modules/risk/riskScore';
import { readFileAsync } from '../modules/files/readFile';
import { parseCSV, serializeCSV } from '../modules/files/parseCSV';
import {
  downloadBlob,
  getSanitizedFilename,
  generateAuditReportJSON,
} from '../modules/files/exportFile';
import { SAMPLE_TEXT_DOCUMENT, SAMPLE_CSV_DOCUMENT } from '../utils/sampleData';
import { formatTime } from '../utils/formatting';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'security';
}

export interface UseSanitizerState {
  originalText: string;
  sanitizedText: string;
  fileName: string | null;
  fileType: 'txt' | 'csv' | 'direct';
  entities: DetectedEntity[];
  selectedEntityId: string | null;
  globalRedactionMode: RedactionMode;
  preset: 'strict' | 'analytics' | 'review' | 'custom';
  enabledTypes: Record<EntityType, boolean>;
  customRules: CustomRule[];
  customReplacements: Partial<Record<EntityType, string>>;
  ignoredEntityIds: Set<string>;
  diffResult: DiffResult;
  riskAssessment: PrivacyRiskAssessment;
  auditLogs: AuditLogEntry[];
  comparisonMode: 'side-by-side' | 'unified' | 'preview-only';
  showOnlyChanges: boolean;
  isProcessing: boolean;
  manualEditEnabled: boolean;
  pseudonymEngine: PseudonymEngine;
  csvColumns?: string[];
  selectedCsvColumns?: Set<string>;
}

export function useSanitizer() {
  const [originalText, setOriginalText] = useState<string>('');
  const [sanitizedOverride, setSanitizedOverride] = useState<string | null>(null);
  const [manualEditEnabled, setManualEditEnabled] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'txt' | 'csv' | 'direct'>('direct');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [globalRedactionMode, setGlobalRedactionMode] = useState<RedactionMode>('PARTIAL');
  const [preset, setPreset] = useState<'strict' | 'analytics' | 'review' | 'custom'>('review');

  const [enabledTypes, setEnabledTypes] = useState<Record<EntityType, boolean>>({
    CUSTOMER_NAME: true,
    EMAIL: true,
    PHONE: true,
    IPV4: true,
    IPV6: true,
    INDIAN_PAN: true,
    AADHAAR: true,
    CREDIT_CARD: true,
    API_KEY: true,
    SECRET_TOKEN: true,
    DATE_OF_BIRTH: true,
    CUSTOM: true,
  });

  const [customRules, setCustomRules] = useState<CustomRule[]>([]);
  const [customReplacements, setCustomReplacements] = useState<Partial<Record<EntityType, string>>>({});
  const [ignoredEntityIds, setIgnoredEntityIds] = useState<Set<string>>(new Set());
  const [entityModeOverrides, setEntityModeOverrides] = useState<Record<string, RedactionMode>>({});

  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'unified' | 'preview-only'>('side-by-side');
  const [showOnlyChanges, setShowOnlyChanges] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-init',
      timestamp: formatTime(),
      message: 'ZERO TRACE Local Privacy Workspace initialized (Zero network activity mode active)',
      type: 'security',
    },
  ]);

  const pseudonymEngine = useMemo(() => new PseudonymEngine(), []);

  // Logging helper
  const addLog = useCallback((message: string, type: AuditLogEntry['type'] = 'info') => {
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: formatTime(),
        message,
        type,
      },
      ...prev.slice(0, 99), // keep last 100 entries
    ]);
  }, []);

  // 1. Detect entities
  const detectionOptions: DetectionOptions = useMemo(
    () => ({
      enabledTypes,
      customRules,
    }),
    [enabledTypes, customRules]
  );

  const rawEntities = useMemo(() => {
    if (!originalText) return [];
    return detectEntities(originalText, detectionOptions);
  }, [originalText, detectionOptions]);

  // Merge individual entity mode overrides
  const entities = useMemo(() => {
    return rawEntities.map((e) => {
      const isIgnored = ignoredEntityIds.has(e.id);
      const modeOverride = entityModeOverrides[e.id];
      return {
        ...e,
        selected: !isIgnored,
        redactionMode: modeOverride || (isIgnored ? 'IGNORE' : globalRedactionMode),
      };
    });
  }, [rawEntities, ignoredEntityIds, entityModeOverrides, globalRedactionMode]);

  // 2. Sanitize text
  const redactionResult: RedactionResult = useMemo(() => {
    return sanitizeText(originalText, entities, {
      globalMode: globalRedactionMode,
      pseudonymEngine,
      customReplacements,
      ignoredEntityIds,
    });
  }, [originalText, entities, globalRedactionMode, pseudonymEngine, customReplacements, ignoredEntityIds]);

  const sanitizedText = useMemo(() => {
    if (manualEditEnabled && sanitizedOverride !== null) {
      return sanitizedOverride;
    }
    return redactionResult.sanitizedText;
  }, [manualEditEnabled, sanitizedOverride, redactionResult.sanitizedText]);

  // 3. Compute diff
  const diffResult: DiffResult = useMemo(() => {
    return computeDiff(originalText, sanitizedText);
  }, [originalText, sanitizedText]);

  // 4. Calculate Risk Score
  const riskAssessment: PrivacyRiskAssessment = useMemo(() => {
    return calculatePrivacyRisk(entities);
  }, [entities]);

  // Log scan completions
  const prevEntityCountRef = useRef<number>(0);
  useEffect(() => {
    if (originalText && entities.length !== prevEntityCountRef.current) {
      prevEntityCountRef.current = entities.length;
      addLog(`Detection scan identified ${entities.length} sensitive entities across the document`, 'info');
    }
  }, [originalText, entities.length, addLog]);

  // Preset switch handler
  const applyPreset = useCallback(
    (newPreset: 'strict' | 'analytics' | 'review' | 'custom') => {
      setPreset(newPreset);
      if (newPreset === 'strict') {
        setGlobalRedactionMode('FULL');
        setEntityModeOverrides({});
        addLog('Applied preset: Strict Privacy (Full redaction on all sensitive entities)', 'security');
      } else if (newPreset === 'analytics') {
        setGlobalRedactionMode('PSEUDONYMIZE');
        setEntityModeOverrides({});
        addLog('Applied preset: Analytics Friendly (Deterministic consistent pseudonymization)', 'security');
      } else if (newPreset === 'review') {
        setGlobalRedactionMode('PARTIAL');
        setEntityModeOverrides({});
        addLog('Applied preset: Human Review (Partial context masking for audit validation)', 'security');
      } else {
        addLog('Switched to Custom redaction rules mode', 'info');
      }
    },
    [addLog]
  );

  // Load sample data
  const loadSample = useCallback(
    (type: 'text' | 'csv' = 'text') => {
      setIsProcessing(true);
      setTimeout(() => {
        if (type === 'csv') {
          setOriginalText(SAMPLE_CSV_DOCUMENT);
          setFileName('sample_customer_data.csv');
          setFileType('csv');
          addLog('Loaded fictional CSV sample document (customer records)', 'info');
        } else {
          setOriginalText(SAMPLE_TEXT_DOCUMENT);
          setFileName('sample_support_export.txt');
          setFileType('txt');
          addLog('Loaded fictional Customer Support Export sample document', 'info');
        }
        setIgnoredEntityIds(new Set());
        setEntityModeOverrides({});
        setSelectedEntityId(null);
        setSanitizedOverride(null);
        setManualEditEnabled(false);
        setIsProcessing(false);
      }, 50);
    },
    [addLog]
  );

  // File upload handler
  const handleFileUpload = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      try {
        const result = await readFileAsync(file);
        setOriginalText(result.content);
        setFileName(result.filename);
        setFileType(result.fileType);
        setIgnoredEntityIds(new Set());
        setEntityModeOverrides({});
        setSelectedEntityId(null);
        setSanitizedOverride(null);
        setManualEditEnabled(false);
        addLog(`Document "${result.filename}" (${result.lineCount} lines) loaded locally into memory`, 'success');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error reading file';
        addLog(msg, 'warn');
        alert(msg);
      } finally {
        setIsProcessing(false);
      }
    },
    [addLog]
  );

  // Clear workspace
  const clearWorkspace = useCallback(() => {
    setOriginalText('');
    setSanitizedOverride(null);
    setManualEditEnabled(false);
    setFileName(null);
    setFileType('direct');
    setSelectedEntityId(null);
    setIgnoredEntityIds(new Set());
    setEntityModeOverrides({});
    pseudonymEngine.reset();
    addLog('Workspace cleared. All in-memory document state and mappings purged.', 'security');
  }, [pseudonymEngine, addLog]);

  // Entity inspection controls
  const selectedEntity = useMemo(() => {
    return entities.find((e) => e.id === selectedEntityId) || null;
  }, [entities, selectedEntityId]);

  const toggleEntityIgnore = useCallback((entityId: string) => {
    setIgnoredEntityIds((prev) => {
      const next = new Set(prev);
      if (next.has(entityId)) {
        next.delete(entityId);
      } else {
        next.add(entityId);
      }
      return next;
    });
  }, []);

  const ignoreAllOfType = useCallback((type: EntityType) => {
    const toIgnore = entities.filter((e) => e.type === type).map((e) => e.id);
    setIgnoredEntityIds((prev) => {
      const next = new Set(prev);
      toIgnore.forEach((id) => next.add(id));
      return next;
    });
  }, [entities]);

  const redactAllOfType = useCallback((type: EntityType) => {
    const toUnignore = entities.filter((e) => e.type === type).map((e) => e.id);
    setIgnoredEntityIds((prev) => {
      const next = new Set(prev);
      toUnignore.forEach((id) => next.delete(id));
      return next;
    });
  }, [entities]);

  const setEntityMode = useCallback((entityId: string, mode: RedactionMode) => {
    setEntityModeOverrides((prev) => ({
      ...prev,
      [entityId]: mode,
    }));
  }, []);

  // Export handlers
  const exportSanitizedFile = useCallback(() => {
    const defaultExt = fileType === 'csv' ? 'csv' : 'txt';
    const outputFilename = getSanitizedFilename(fileName || 'zero_trace_document', defaultExt);
    const mime = fileType === 'csv' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;';

    downloadBlob({
      filename: outputFilename,
      mimeType: mime,
      content: sanitizedText,
    });
    addLog(`Exported sanitized document as "${outputFilename}"`, 'success');
  }, [fileName, fileType, sanitizedText, addLog]);

  const exportAuditReport = useCallback(() => {
    const categoryBreakdown: Record<string, { count: number; uniqueCount: number }> = {};
    for (const [key, config] of Object.entries(ENTITY_CONFIGS)) {
      const matching = entities.filter((e) => e.type === key);
      if (matching.length > 0) {
        const unique = new Set(matching.map((e) => e.normalizedValue)).size;
        categoryBreakdown[config.label] = { count: matching.length, uniqueCount: unique };
      }
    }

    const report = generateAuditReportJSON({
      fileName: fileName || 'direct_input_text',
      processingDate: new Date().toISOString(),
      redactionMode: globalRedactionMode,
      totalEntitiesDetected: entities.length,
      totalRedacted: redactionResult.redactedCount,
      totalIgnored: redactionResult.ignoredCount,
      sanitizationCoverage: `${redactionResult.sanitizationPercentage}%`,
      riskScore: {
        level: riskAssessment.level,
        score: riskAssessment.score,
        reasons: riskAssessment.reasons,
      },
      categoryBreakdown,
      appliedRules: [
        `Global Mode: ${globalRedactionMode}`,
        `Preset: ${preset}`,
        ...customRules.map((r) => `Custom Rule: ${r.name} -> ${r.replacement}`),
      ],
    });

    const reportName = `ZERO_TRACE_audit_report_${Date.now()}.json`;
    downloadBlob({
      filename: reportName,
      mimeType: 'application/json;charset=utf-8;',
      content: report,
    });
    addLog(`Exported certified audit report as "${reportName}"`, 'success');
  }, [fileName, globalRedactionMode, entities, redactionResult, riskAssessment, preset, customRules, addLog]);

  const exportMappingTable = useCallback(() => {
    const mappingJson = pseudonymEngine.exportMappingJSON();
    const mapName = `ZERO_TRACE_pseudonym_mapping_${Date.now()}.json`;
    downloadBlob({
      filename: mapName,
      mimeType: 'application/json;charset=utf-8;',
      content: mappingJson,
    });
    addLog(`Downloaded pseudonym mapping file "${mapName}" (Keep secure)`, 'warn');
  }, [pseudonymEngine, addLog]);

  return {
    originalText,
    setOriginalText,
    sanitizedText,
    sanitizedOverride,
    setSanitizedOverride,
    manualEditEnabled,
    setManualEditEnabled,
    fileName,
    fileType,
    entities,
    selectedEntity,
    selectedEntityId,
    setSelectedEntityId,
    globalRedactionMode,
    setGlobalRedactionMode,
    preset,
    applyPreset,
    enabledTypes,
    setEnabledTypes,
    customRules,
    setCustomRules,
    customReplacements,
    setCustomReplacements,
    ignoredEntityIds,
    toggleEntityIgnore,
    ignoreAllOfType,
    redactAllOfType,
    setEntityMode,
    diffResult,
    riskAssessment,
    auditLogs,
    addLog,
    comparisonMode,
    setComparisonMode,
    showOnlyChanges,
    setShowOnlyChanges,
    isProcessing,
    loadSample,
    handleFileUpload,
    clearWorkspace,
    exportSanitizedFile,
    exportAuditReport,
    exportMappingTable,
    pseudonymEngine,
    redactionResult,
  };
}
