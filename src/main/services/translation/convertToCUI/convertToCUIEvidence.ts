import {EvidenceItem} from 'models/evidence/evidenceItem';
import {CCDEvidence, getEvidenceDetails} from 'models/ccdResponse/ccdEvidence';
import {Evidence} from 'form/models/evidence/evidence';
import {convertToEvidenceType} from 'models/evidence/evidenceType';

export const toCUIEvidence = (ccdEvidence: CCDEvidence[], evidenceComment?: string): Evidence => {
  if (!ccdEvidence) return undefined;
  const cuiEvidenceItems: EvidenceItem[] = [];
  ccdEvidence.forEach((row) => {
    const evidenceItem: EvidenceItem = createCUIEvidence(row);
    cuiEvidenceItems.push(evidenceItem);
  });
  return new Evidence(evidenceComment, cuiEvidenceItems);
};

const createCUIEvidence = (ccdEvidence: CCDEvidence) : EvidenceItem => {
  return {
    type: convertToEvidenceType(ccdEvidence.value.evidenceType),
    description: calculateCUIEvidenceValue(ccdEvidence),
  };
};

const calculateCUIEvidenceValue = (row: CCDEvidence): string => {
  return getEvidenceDetails(row.value);
};
