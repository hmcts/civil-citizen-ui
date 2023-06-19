
export enum EvidenceType {
  CONTRACTS_AND_AGREEMENTS = 'Contracts and agreements',
  EXPERT_WITNESS = 'Expert witness',
  CORRESPONDENCE = 'Letters, emails and other correspondence',
  PHOTO = 'Photo evidence',
  RECEIPTS = 'Receipts',
  STATEMENT_OF_ACCOUNT = 'Statements of account',
  OTHER = 'Other'

}

export function convertToEvidenceType(type: string): EvidenceType {
  return Object.values(EvidenceType).find((value: string)=> value === type);
}

