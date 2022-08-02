import {Respondent} from '../../main/common/models/respondent';
import {Claim} from '../../main/common/models/claim';
import {CounterpartyType} from '../../main/common/models/counterpartyType';
import {DocumentType} from '../../main/common/models/document/documentType';
import {PrimaryAddress} from '../../main/common/models/primaryAddress';
import {CorrespondenceAddress} from '../../main/common/models/correspondenceAddress';
import {YesNo} from '../../main/common/form/models/yesNo';
import {
  InterestClaimFromType,
  InterestClaimOptions,
  InterestClaimUntilType,
  SameRateInterestType,
  CaseState,
} from '../../main/common/form/models/claimDetails';

export const buildPrimaryAddress = (): PrimaryAddress => {
  return {
    AddressLine1: 'primaryAddressLine1',
    AddressLine2: 'primaryAddressLine2',
    AddressLine3: 'primaryAddressLine3',
    PostTown: 'primaryCity',
    PostCode: 'primaryPostCode',
  };
};

export const buildCorrespondenceAddress = (): CorrespondenceAddress => {
  return {
    AddressLine1: 'correspondenceAddressLine1',
    AddressLine2: 'correspondenceAddressLine2',
    AddressLine3: 'correspondenceAddressLine3',
    PostTown: 'correspondenceCity',
    PostCode: 'correspondencePostCode',
  };
};

export const buildRespondent1 = (): Respondent => {
  const respondent = new Respondent();
  respondent.individualTitle = 'Mrs.';
  respondent.individualLastName = 'Mary';
  respondent.individualFirstName = 'Richards';
  respondent.partyName = 'Mrs Richards Mary';
  respondent.telephoneNumber = '0208339922';
  respondent.dateOfBirth = new Date('2022-01-24T15:59:59');
  respondent.responseType = '';
  respondent.type = CounterpartyType.INDIVIDUAL;
  respondent.primaryAddress = buildPrimaryAddress();
  respondent.correspondenceAddress = buildCorrespondenceAddress();
  return respondent;
};

export const mockClaim = buildMockClaim();

function buildMockClaim(): Claim {
  const _mockClaim: Claim = new Claim();

  _mockClaim.legacyCaseReference = '497MC585';
  _mockClaim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
  _mockClaim.applicant1 = {
    individualTitle: 'Mrs',
    individualLastName: 'Clark',
    individualFirstName: 'Jane',
    type: CounterpartyType.INDIVIDUAL,
    partyName: 'Mrs Jane Clark',
  };
  _mockClaim.statementOfMeans = {
    childrenDisability: {
      option: 'yes',
    },
  };
  _mockClaim.partialAdmission = {
    paymentIntention: {
      paymentDate: new Date('2022-06-01T00:00:00'),
    },
    howMuchHaveYouPaid: {
      amount: 20,
      totalClaimAmount: 110,
      day: 1,
      month: 1,
      year: 2040,
      text: 'text',
    },
  };
  _mockClaim.rejectAllOfClaim = {
    howMuchHaveYouPaid: {
      amount: 20,
      totalClaimAmount: 110,
      day: 1,
      month: 1,
      year: 2040,
      text: 'text',
    },
    option: 'test',
  };
  _mockClaim.totalClaimAmount = 110;
  _mockClaim.respondent1ResponseDeadline = new Date('2022-01-24T15:59:59');
  _mockClaim.detailsOfClaim = 'the reason i have given';
  _mockClaim.respondent1 = buildRespondent1();
  _mockClaim.timelineOfEvents = [
    {
      id: 'a08e42f4-6d7a-4f5c-b33d-85e4ef42ad9e',
      value: {
        timelineDate: '2022-01-01',
        timelineDescription: 'I noticed a leak on the landing and told Mr Smith about this.',
      },
    },
  ];
  _mockClaim.claimFee = {
    calculatedAmountInPence: '11500',
  };
  _mockClaim.claimInterest = YesNo.YES;
  _mockClaim.interestClaimFrom = InterestClaimFromType.FROM_A_SPECIFIC_DATE;
  _mockClaim.claimAmountBreakup = [
    {
      value: {
        claimAmount: '2000',
        claimReason: 'House repair',
      },
    },
  ];
  _mockClaim.interestClaimUntil = InterestClaimUntilType.UNTIL_CLAIM_SUBMIT_DATE;
  _mockClaim.interestFromSpecificDate = new Date('2022-05-20');
  _mockClaim.interestClaimOptions = InterestClaimOptions.SAME_RATE_INTEREST;
  _mockClaim.sameRateInterestSelection = {
    sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_8_PC,
  };
  _mockClaim.breakDownInterestTotal = 500;
  _mockClaim.submittedDate = new Date('2022-05-23T17:02:02.38407');
  _mockClaim.totalInterest = 15;
  _mockClaim.paymentDate = new Date('2022-06-01T00:00:00');
  _mockClaim.systemGeneratedCaseDocuments = [
    {
      id: '1234556',
      value: {
        createdBy: 'Civil',
        documentLink: {
          document_url: 'http://dm-store:8080/documents/71582e35-300e-4294-a604-35d8cabc33de',
          document_filename: 'sealed_claim_form_000MC001.pdf',
          document_binary_url: 'http://dm-store:8080/documents/71582e35-300e-4294-a604-35d8cabc33de/binary',
        },
        documentName: 'sealed_claim_form_000MC001.pdf',
        documentSize: 45794,
        documentType: DocumentType.SEALED_CLAIM,
        createdDatetime: new Date('2022-06-21T14:15:19'),
      },
    },
  ];

  _mockClaim.isPaymentOptionPayImmediately = (): boolean => false;
  _mockClaim.isPaymentOptionBySetDate = (): boolean => false;

  return _mockClaim;
}
