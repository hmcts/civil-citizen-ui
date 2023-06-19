import {Claim} from 'common/models/claim';
import {EvidenceType} from 'common/models/evidence/evidenceType';
import {CCDEvidence} from 'common/models/ccdResponse/ccdEvidence';
import {toCCDEvidence} from 'services/translation/response/convertToCCDEvidence';
import {ClaimDetails} from 'common/form/models/claim/details/claimDetails';
import {Evidence} from 'common/form/models/evidence/evidence';

describe('translate Evidence to CCD model', () => {
  const claim = new Claim();
  claim.claimDetails = new ClaimDetails();
  const evidencesMock = {
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
    ],
  };
  claim.claimDetails.evidence = new Evidence(evidencesMock.comment, evidencesMock.evidenceItem);

  it('should return undefined if Evidence doesnt exist', () => {
    const claimEmpty = new Claim();
    claimEmpty.claimDetails = new ClaimDetails();
    const evidenceResponseCCD = toCCDEvidence(claimEmpty.claimDetails.evidence);
    expect(evidenceResponseCCD).toBe(undefined);
  });

  it('should translate Evidence to CCD', () => {
    const claimAmountCCD: CCDEvidence[] = [
      {
        id: '0',
        value: {
          evidenceType: 'Contracts and agreements',
          contractAndAgreementsEvidence: 'test contract',
        },
      },
      {
        id: '1',
        value: {
          evidenceType: 'Expert witness',
          expertWitnessEvidence: 'test witness',
        },
      },
      {
        id: '2',
        value: {
          evidenceType: 'Letters, emails and other correspondence',
          lettersEmailsAndOtherCorrespondenceEvidence: 'test correspondence',
        },
      },
      {
        id: '3',
        value: {
          evidenceType:  'Photo evidence',
          photoEvidence: 'test photo',
        },
      },
      {
        id: '4',
        value: {
          evidenceType: 'Receipts',
          receiptsEvidence: 'test receipts',
        },
      },
      {
        id: '5',
        value: {
          evidenceType: 'Statements of account',
          statementOfTruthEvidence: 'test statement',
        },
      },
      {
        id: '6',
        value: {
          evidenceType: 'Other',
          otherEvidence: 'test other',
        },
      },
    ];

    const evidenceResponseCCD = toCCDEvidence(claim.claimDetails.evidence);
    expect(evidenceResponseCCD).toMatchObject(claimAmountCCD);
  });
});
