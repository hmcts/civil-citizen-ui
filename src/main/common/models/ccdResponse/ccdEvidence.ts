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

export function getEvidenceDetails(ccdEvidenceItem: CCDEvidenceItem): string {
  type CCDEvidenceDescription = Omit<CCDEvidenceItem, 'evidenceType'>;
  const convertedEvidenceItem = <CCDEvidenceDescription> ccdEvidenceItem;
  return Object.values(convertedEvidenceItem).find(value => value !== undefined || value !== null || value !== '');
}
