import {Claim} from 'common/models/claim';
import {EvidenceType} from 'common/models/evidence/evidenceType';
import {CCDEvidenceType} from 'common/models/ccdResponse/ccdEvidence';
import {ClaimDetails} from 'common/form/models/claim/details/claimDetails';
import {toCUIEvidence} from "services/translation/convertToCUI/convertToCUIEvidence";
import {EvidenceItem} from "models/evidence/evidenceItem";

describe('translate Evidence to CUI model', () => {
  const claim = new Claim();
  claim.claimDetails = new ClaimDetails();
  const evidencesMock = {
    comment: 'test',
    ccdEvidence: [
      {
        id: '0',
        value: {
          evidenceType: CCDEvidenceType.CONTRACTS_AND_AGREEMENTS,
          contractAndAgreementsEvidence: 'test contract',
        }
      },
      {
        id: '1',
        value: {
          evidenceType: CCDEvidenceType.EXPERT_WITNESS,
          expertWitnessEvidence: 'test witness',
        }
      },
      {
        id: '2',
        value: {
          evidenceType: CCDEvidenceType.LETTERS_EMAILS_AND_OTHER_CORRESPONDENCE,
          lettersEmailsAndOtherCorrespondenceEvidence: 'test correspondence',
        }
      },
      {
        id: '3',
        value: {
          evidenceType: CCDEvidenceType.PHOTO_EVIDENCE,
          photoEvidence: 'test photo',
        }
      },
      {
        id: '4',
        value: {
          evidenceType: CCDEvidenceType.RECEIPTS,
          receiptsEvidence: 'test receipts',
        }
      },
      {
        id: '5',
        value: {
          evidenceType: CCDEvidenceType.STATEMENT_OF_ACCOUNT,
          statementOfTruthEvidence: 'test statement',
        }
      },
      {
        id: '6',
        value: {
          evidenceType: CCDEvidenceType.OTHER,
          otherEvidence: 'test other',
        }
      },
    ],
  };

  it('should return undefined if Evidence doesnt exist', () => {
    const ccdEvidenceEmpty = undefined;
    const evidenceResponseCUI = toCUIEvidence(ccdEvidenceEmpty);
    expect(evidenceResponseCUI).toBe(undefined);
  });

  it('should translate Evidence to CUI', () => {
    const claimAmountCUI: EvidenceItem[] = [
      {
        type: EvidenceType.CONTRACTS_AND_AGREEMENTS,
        description: 'test contract',
      },
      {
        type: EvidenceType.EXPERT_WITNESS,
        description: 'test witness',
      },
      {
        type: EvidenceType.CORRESPONDENCE,
        description: 'test correspondence',
      },
      {
        type: EvidenceType.PHOTO,
        description: 'test photo',
      },
      {
        type: EvidenceType.RECEIPTS,
        description: 'test receipts',
      },
      {
        type: EvidenceType.STATEMENT_OF_ACCOUNT,
        description: 'test statement',
      },
      {
        type: EvidenceType.OTHER,
        description: 'test other',
      },
    ];

    const evidenceResponseCUI = toCUIEvidence(evidencesMock.ccdEvidence);
    expect(evidenceResponseCUI.evidenceItem).toMatchObject(claimAmountCUI);
  });
});
