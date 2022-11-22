import {Claim} from '../../../../../main/common/models/claim';
import {EvidenceType} from '../../../../../main/common/models/evidence/evidenceType';
import {CCDEvidence} from '../../../../../main/common/models/ccdResponse/ccdEvidence';
import {toCCDEvidence} from '../../../../../main/services/translation/response/convertToCCDEvidence';

describe('translate Evidence to CCD model', () => {
  const claim = new Claim();
  claim.evidence = {
    comment: 'test',
    evidenceItem: [
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
    ]
  };

  it('should return undefined if Evidence doesnt exist', () => {
    const claimEmpty = new Claim();
    const evidenceResponseCCD = toCCDEvidence(claimEmpty.evidence);
    expect(evidenceResponseCCD).toBe(undefined);
  });

  it('should translate Evidence to CCD', () => {
    const claimAmountCCD: CCDEvidence[] = [
      {
        id: '0',
        value: {
          evidenceType: EvidenceType.CONTRACTS_AND_AGREEMENTS,
          contractAndAgreementsEvidence: 'test contract'
        }
      },
      {
        id: '1',
        value: {
          evidenceType: EvidenceType.EXPERT_WITNESS,
          expertWitnessEvidence: 'test witness'
        }
      },
      {
        id: '2',
        value: {
          evidenceType: EvidenceType.CORRESPONDENCE,
          lettersEmailsAndOtherCorrespondenceEvidence: 'test correspondence'
        }
      },
      {
        id: '3',
        value: {
          evidenceType: EvidenceType.PHOTO,
          photoEvidence: 'test photo'
        }
      },
      {
        id: '4',
        value: {
          evidenceType: EvidenceType.RECEIPTS,
          receiptsEvidence: 'test receipts'
        }
      },
      {
        id: '5',
        value: {
          evidenceType: EvidenceType.STATEMENT_OF_ACCOUNT,
          statementOfTruthEvidence: 'test statement'
        }
      },
      {
        id: '6',
        value: {
          evidenceType: EvidenceType.OTHER,
          otherEvidence: 'test other'
        }
      },
    ];

    const evidenceResponseCCD = toCCDEvidence(claim.evidence);
    expect(evidenceResponseCCD).toMatchObject(claimAmountCCD);
  });
});
