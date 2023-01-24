export interface CCDEvidence {
  id: string,
  value: CCDEvidenceItem,
}

export interface CCDEvidenceItem {
  evidenceType?: CCDEvidenceType,
  photoEvidence?: string,
  contractAndAgreementsEvidence?: string,
  expertWitnessEvidence?: string,
  lettersEmailsAndOtherCorrespondenceEvidence?: string,
  receiptsEvidence?: string,
  statementOfTruthEvidence?: string,
  otherEvidence?: string,
}

export enum CCDEvidenceType {
  CONTRACTS_AND_AGREEMENTS = 'CONTRACTS_AND_AGREEMENTS',
  EXPERT_WITNESS = 'EXPERT_WITNESS',
  LETTERS_EMAILS_AND_OTHER_CORRESPONDENCE = 'LETTERS_EMAILS_AND_OTHER_CORRESPONDENCE',
  PHOTO_EVIDENCE = 'PHOTO_EVIDENCE',
  RECEIPTS = 'RECEIPTS',
  STATEMENT_OF_ACCOUNT = 'STATEMENT_OF_ACCOUNT',
  OTHER = 'OTHER',
}
