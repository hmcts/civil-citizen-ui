import {EvidenceItem} from 'models/evidence/evidenceItem';
import {CCDEvidence, CCDEvidenceType} from 'models/ccdResponse/ccdEvidence';
import {Evidence} from 'form/models/evidence/evidence';
import {convertToEvidenceType} from 'models/evidence/evidenceType';

export const toCUIEvidence = (ccdEvidence: CCDEvidence[]): Evidence => {
  if (!ccdEvidence) return undefined;
  const cuiEvidenceItems: EvidenceItem[] = [];
  ccdEvidence.forEach((row) => {
    const evidenceItem: EvidenceItem = createCUIEvidence(row);
    cuiEvidenceItems.push(evidenceItem);
  });
  return new Evidence('', cuiEvidenceItems);
};

const createCUIEvidence = (ccdEvidence: CCDEvidence) : EvidenceItem => {
  return {
    type: convertToEvidenceType(ccdEvidence.value.evidenceType),
    description: calculateCUIEvidenceValue(ccdEvidence),
  };
};

const calculateCUIEvidenceValue = (row: CCDEvidence) => {
  switch (row.value.evidenceType) {
    case CCDEvidenceType.CONTRACTS_AND_AGREEMENTS:
      return row.value.contractAndAgreementsEvidence;
    case CCDEvidenceType.EXPERT_WITNESS:
      return row.value.expertWitnessEvidence;
    case CCDEvidenceType.LETTERS_EMAILS_AND_OTHER_CORRESPONDENCE:
      return row.value.lettersEmailsAndOtherCorrespondenceEvidence;
    case CCDEvidenceType.PHOTO_EVIDENCE:
      return row.value.photoEvidence;
    case CCDEvidenceType.RECEIPTS:
      return row.value.receiptsEvidence;
    case CCDEvidenceType.STATEMENT_OF_ACCOUNT:
      return row.value.statementOfTruthEvidence;
    case CCDEvidenceType.OTHER:
      return row.value.otherEvidence;
  }
};
