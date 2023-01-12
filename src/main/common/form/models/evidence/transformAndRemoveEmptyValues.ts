import { Evidence } from './evidence';
import { EvidenceItem } from './evidenceItem';

const transformToEvidences = (evidence: Evidence): EvidenceItem[] => {
  return evidence.evidenceItem.map((item: EvidenceItem) => {
    return new EvidenceItem(item.type, item.description);
  });
};

const removeEmptyValueToEvidences = (evidence: Evidence): EvidenceItem[] => {
  return evidence.evidenceItem
    .filter((item: EvidenceItem) => item.type)
    .map((item: EvidenceItem) => {
      return new EvidenceItem(item.type, item.description);
    });
};

export {
  transformToEvidences,
  removeEmptyValueToEvidences,
};
