import {EvidenceItem} from 'models/evidence/evidenceItem';
import {EvidenceType} from 'models/evidence/evidenceType';
import {CCDEvidence, CCDEvidenceType} from 'models/ccdResponse/ccdEvidence';
import {Evidence} from 'form/models/evidence/evidence';

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
    type: convertToCUIEvidenceType(ccdEvidence.value.evidenceType),
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

const convertToCUIEvidenceType = (type: CCDEvidenceType) => {
  switch (type) {
    case CCDEvidenceType.CONTRACTS_AND_AGREEMENTS:
      return EvidenceType.CONTRACTS_AND_AGREEMENTS;
    case CCDEvidenceType.EXPERT_WITNESS:
      return EvidenceType.EXPERT_WITNESS;
    case CCDEvidenceType.LETTERS_EMAILS_AND_OTHER_CORRESPONDENCE:
      return EvidenceType.CORRESPONDENCE;
    case CCDEvidenceType.PHOTO_EVIDENCE:
      return EvidenceType.PHOTO;
    case CCDEvidenceType.RECEIPTS:
      return EvidenceType.RECEIPTS;
    case CCDEvidenceType.STATEMENT_OF_ACCOUNT:
      return EvidenceType.STATEMENT_OF_ACCOUNT;
    case CCDEvidenceType.OTHER:
      return EvidenceType.OTHER;
  }
};
