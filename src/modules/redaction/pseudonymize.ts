import { EntityType } from '../detection/entityTypes';

export interface PseudonymMapping {
  originalValue: string;
  normalizedValue: string;
  pseudonym: string;
  type: EntityType;
  occurrenceCount: number;
  firstSeenIndex: number;
}

export class PseudonymEngine {
  private categoryCounters: Record<string, number> = {
    USER: 0,
    EMAIL: 0,
    PHONE: 0,
    PAN: 0,
    AADHAAR: 0,
    CARD: 0,
    IP: 0,
    SECRET: 0,
    DOB: 0,
    ENTITY: 0,
  };

  private mappings: Map<string, PseudonymMapping> = new Map();

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.categoryCounters = {
      USER: 0,
      EMAIL: 0,
      PHONE: 0,
      PAN: 0,
      AADHAAR: 0,
      CARD: 0,
      IP: 0,
      SECRET: 0,
      DOB: 0,
      ENTITY: 0,
    };
    this.mappings.clear();
  }

  /**
   * Deterministically returns the pseudonym for a given entity.
   * If the entity has already been seen (normalized), returns the existing pseudonym.
   */
  public getPseudonym(type: EntityType, originalValue: string, normalizedValue: string, startIndex: number): string {
    const key = `${type}:${normalizedValue}`;

    if (this.mappings.has(key)) {
      const existing = this.mappings.get(key)!;
      existing.occurrenceCount += 1;
      return existing.pseudonym;
    }

    const prefix = this.getPrefixForType(type);
    this.categoryCounters[prefix] = (this.categoryCounters[prefix] || 0) + 1;
    const num = String(this.categoryCounters[prefix]).padStart(2, '0');
    const pseudonym = `${prefix}_${num}`;

    this.mappings.set(key, {
      originalValue,
      normalizedValue,
      pseudonym,
      type,
      occurrenceCount: 1,
      firstSeenIndex: startIndex,
    });

    return pseudonym;
  }

  private getPrefixForType(type: EntityType): string {
    switch (type) {
      case 'CUSTOMER_NAME':
      case 'EMAIL':
        return 'USER'; // As specified in spec: aarav.mehta@example.com -> USER_01, Aarav Mehta -> USER_01
      case 'PHONE':
        return 'PHONE';
      case 'INDIAN_PAN':
        return 'PAN';
      case 'AADHAAR':
        return 'AADHAAR';
      case 'CREDIT_CARD':
        return 'CARD';
      case 'IPV4':
      case 'IPV6':
        return 'IP';
      case 'API_KEY':
      case 'SECRET_TOKEN':
        return 'SECRET';
      case 'DATE_OF_BIRTH':
        return 'DOB';
      default:
        return 'ENTITY';
    }
  }

  /**
   * Returns all mappings for export or inspection.
   */
  public getAllMappings(): PseudonymMapping[] {
    return Array.from(this.mappings.values());
  }

  /**
   * Generates a secure JSON mapping file structure.
   */
  public exportMappingJSON(): string {
    const list = this.getAllMappings().map((m) => ({
      pseudonym: m.pseudonym,
      type: m.type,
      normalizedValue: m.normalizedValue,
      originalSample: m.originalValue,
      occurrences: m.occurrenceCount,
    }));

    return JSON.stringify(
      {
        notice: 'CONFIDENTIAL: This pseudonym mapping table can be used to re-identify sanitized data. Store securely.',
        generatedAt: new Date().toISOString(),
        totalEntitiesMapped: list.length,
        mappings: list,
      },
      null,
      2
    );
  }
}
