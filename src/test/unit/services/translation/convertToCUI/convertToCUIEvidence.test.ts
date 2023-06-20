import {Claim} from 'common/models/claim';
import {EvidenceType} from 'common/models/evidence/evidenceType';
import {CCDEvidence} from 'common/models/ccdResponse/ccdEvidence';
import {ClaimDetails} from 'common/form/models/claim/details/claimDetails';
import {toCUIEvidence} from 'services/translation/convertToCUI/convertToCUIEvidence';
import {EvidenceItem} from 'models/evidence/evidenceItem';

describe('translate Evidence to CUI model', () => {
  const claim = new Claim();
  claim.claimDetails = new ClaimDetails();
  const evidencesCCDMock = {
    comment: 'test',
    ccdEvidence: [
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
          evidenceType:  'Letters, emails and other correspondence',
          lettersEmailsAndOtherCorrespondenceEvidence: 'test correspondence',
        },
      },
      {
        id: '3',
        value: {
          evidenceType: 'Photo evidence',
          photoEvidence: 'test photo',
        },
      },
      {
        id: '4',
        value: {
          evidenceType:  'Receipts',
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
    ],
  };

  const evidenceCUI: EvidenceItem[] = [
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

  it('should return undefined if Evidence doesnt exist', () => {
    //Given
    const ccdEvidenceEmpty: CCDEvidence[] = undefined;
    //When
    const evidenceResponseCUI = toCUIEvidence(ccdEvidenceEmpty);
    //Then
    expect(evidenceResponseCUI).toBe(undefined);
  });

  it('should translate Evidence to CUI', () => {
    //Given - evidencesCCDMock
    //When
    const evidenceResponseCUI = toCUIEvidence(evidencesCCDMock.ccdEvidence);
    //Then
    expect(evidenceResponseCUI.evidenceItem).toMatchObject(evidenceCUI);
  });
});
