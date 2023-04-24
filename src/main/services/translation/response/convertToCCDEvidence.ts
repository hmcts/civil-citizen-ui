import {EvidenceItem} from 'models/evidence/evidenceItem';
import {EvidenceType} from 'models/evidence/evidenceType';
import {CCDEvidence, CCDEvidenceType} from 'models/ccdResponse/ccdEvidence';
import {Evidence} from 'form/models/evidence/evidence';
import {DefendantEvidence} from 'models/evidence/evidence';

export const toCCDEvidence = (evidence: Evidence | DefendantEvidence): CCDEvidence[] => {
  if (!evidence?.evidenceItem) return undefined;
  const ccdEvidences: CCDEvidence[] = [];
  evidence.evidenceItem.forEach((row, index) => {
    const ccdEvidence: CCDEvidence = createCCDEvidence(row, index);
    ccdEvidences.push(ccdEvidence);
  });
  return ccdEvidences;
};

const createCCDEvidence = (evidenceItem: EvidenceItem, index: number) : CCDEvidence => {
  return {
    id: index.toString(),
    value: {
      evidenceType: convertToCCDEvidenceType(evidenceItem.type),
      ...calculateCCDEvidenceValue(evidenceItem),
    },
  };
};

const calculateCCDEvidenceValue = (row: EvidenceItem) => {
  switch (row.type) {
    case EvidenceType.CONTRACTS_AND_AGREEMENTS:
      return { contractAndAgreementsEvidence: row.description };
    case EvidenceType.EXPERT_WITNESS:
      return { expertWitnessEvidence: row.description };
    case EvidenceType.CORRESPONDENCE:
      return { lettersEmailsAndOtherCorrespondenceEvidence: row.description };
    case EvidenceType.PHOTO:
      return { photoEvidence: row.description };
    case EvidenceType.RECEIPTS:
      return { receiptsEvidence: row.description };
    case EvidenceType.STATEMENT_OF_ACCOUNT:
      return { statementOfTruthEvidence: row.description };
    case EvidenceType.OTHER:
      return { otherEvidence: row.description };
  }
};

const convertToCCDEvidenceType = (type: EvidenceType) => {
  switch (type) {
    case EvidenceType.CONTRACTS_AND_AGREEMENTS:
      return CCDEvidenceType.CONTRACTS_AND_AGREEMENTS;
    case EvidenceType.EXPERT_WITNESS:
      return CCDEvidenceType.EXPERT_WITNESS;
    case EvidenceType.CORRESPONDENCE:
      return CCDEvidenceType.LETTERS_EMAILS_AND_OTHER_CORRESPONDENCE;
    case EvidenceType.PHOTO:
      return CCDEvidenceType.PHOTO_EVIDENCE;
    case EvidenceType.RECEIPTS:
      return CCDEvidenceType.RECEIPTS;
    case EvidenceType.STATEMENT_OF_ACCOUNT:
      return CCDEvidenceType.STATEMENT_OF_ACCOUNT;
    case EvidenceType.OTHER:
      return CCDEvidenceType.OTHER;
  }
};
