export interface CCDEvidence {
  id: string,
  value: CCDEvidenceItem,
}

export interface CCDEvidenceItem {
  evidenceType?: string,
  photoEvidence?: string,
  contractAndAgreementsEvidence?: string,
  expertWitnessEvidence?: string,
  lettersEmailsAndOtherCorrespondenceEvidence?: string,
  receiptsEvidence?: string,
  statementOfTruthEvidence?: string,
  otherEvidence?: string,
}
