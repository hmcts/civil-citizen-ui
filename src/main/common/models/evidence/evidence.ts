import {EvidenceItem} from './evidenceItem';

export interface DefendantEvidence {
  comment?: string;
  evidenceItem?: EvidenceItem[];
}

export interface ClaimantEvidence {
  comment?: string;
  evidenceItem?: EvidenceItem[];
}
