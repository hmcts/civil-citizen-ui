import {Evidence} from 'form/models/evidence/evidence';
import {EvidenceItem} from 'form/models/evidence/evidenceItem';
import {
  removeEmptyValueToEvidences,
  transformToEvidences,
} from 'form/models/evidence/transformAndRemoveEmptyValues';
import {EvidenceType} from 'models/evidence/evidenceType';

describe('transformAndRemoveEmptyValues', () => {
  describe('transformToEvidences', () => {
    it('should map evidence items to new EvidenceItem instances', () => {
      const evidence = new Evidence('comment', [
        new EvidenceItem(EvidenceType.PHOTO, 'photo desc'),
        new EvidenceItem(null, ''),
      ]);

      const result = transformToEvidences(evidence);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(new EvidenceItem(EvidenceType.PHOTO, 'photo desc'));
      expect(result[1]).toEqual(new EvidenceItem(null, ''));
      expect(result[0]).not.toBe(evidence.evidenceItem[0]);
    });
  });

  describe('removeEmptyValueToEvidences', () => {
    it('should keep only items with a type', () => {
      const evidence = new Evidence('comment', [
        new EvidenceItem(EvidenceType.RECEIPTS, 'receipt'),
        new EvidenceItem(null, 'ignored'),
        new EvidenceItem(EvidenceType.OTHER, 'other'),
        new EvidenceItem(undefined, ''),
      ]);

      const result = removeEmptyValueToEvidences(evidence);

      expect(result).toEqual([
        new EvidenceItem(EvidenceType.RECEIPTS, 'receipt'),
        new EvidenceItem(EvidenceType.OTHER, 'other'),
      ]);
    });

    it('should return empty array when no typed items exist', () => {
      const evidence = new Evidence('comment', [
        new EvidenceItem(null, ''),
        new EvidenceItem(undefined, 'x'),
      ]);

      expect(removeEmptyValueToEvidences(evidence)).toEqual([]);
    });
  });
});
