import {DefendantEvidence} from "../../../common/models/evidence/evidence";
import {EvidenceItem} from "../../../common/models/evidence/evidenceItem";
import {EvidenceType} from "../../../common/models/evidence/evidenceType";
import {CCDEvidence} from "../../../common/models/ccdResponse/ccdEvidence";

export const toCCDEvidence = (evidence: DefendantEvidence): CCDEvidence[] => {
  const ccdEvidences: CCDEvidence[] = [];
  evidence.evidenceItem.forEach((row, index) => {
    const ccdEvidence: CCDEvidence = {
      id: index.toString(),
      value: {
        evidenceType: row.type,
        ...calculateCCDEvidenceValue(row)
      },
    };
    ccdEvidences.push(ccdEvidence);
  });
  return ccdEvidences;
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
    default:
      return {};
  }
}
