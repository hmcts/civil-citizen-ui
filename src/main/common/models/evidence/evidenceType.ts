import {CCDEvidenceType} from 'models/ccdResponse/ccdEvidence';

export enum EvidenceType {
  CONTRACTS_AND_AGREEMENTS = 'Contracts and agreements',
  EXPERT_WITNESS = 'Expert witness',
  CORRESPONDENCE = 'Letters, emails and other correspondence',
  PHOTO = 'Photo evidence',
  RECEIPTS = 'Receipts',
  STATEMENT_OF_ACCOUNT = 'Statements of account',
  OTHER = 'Other'

}

export function convertToEvidenceType(type: CCDEvidenceType): EvidenceType {
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
}

