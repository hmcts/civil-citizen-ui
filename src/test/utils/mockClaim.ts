import {Party} from '../../main/common/models/party';
import {Claim} from '../../main/common/models/claim';
import {PartyType} from '../../main/common/models/partyType';
import {DocumentType} from '../../main/common/models/document/documentType';
import {YesNo} from '../../main/common/form/models/yesNo';
import {
  CaseState,
  InterestClaimFromType,
  InterestEndDateType,
  SameRateInterestType,
} from '../../main/common/form/models/claimDetails';
import {ResponseOptions} from '../../main/common/form/models/responseDeadline';
import {AdditionalTimeOptions} from '../../main/common/form/models/additionalTime';
import {InterestClaimOptionsType} from '../../main/common/form/models/claim/interest/interestClaimOptionsType';
import {ClaimDetails} from '../../main/common/form/models/claim/details/claimDetails';
import {Reason} from '../../main/common/form/models/claim/details/reason';
import {DefendantTimeline} from '../../main/common/form/models/timeLineOfEvents/defendantTimeline';
import {TimelineRow} from '../../main/common/form/models/timeLineOfEvents/timelineRow';
import {EvidenceItem} from '../../main/common/form/models/evidence/evidenceItem';
import {EvidenceType} from '../../main/common/models/evidence/evidenceType';
import {Address} from '../../main/common/form/models/address';
import {PartyDetails} from '../../main/common/form/models/partyDetails';
import {PartyPhone} from '../../main/common/models/PartyPhone';
import {CitizenDate} from '../../main/common/form/models/claim/claimant/citizenDate';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {ClaimantResponse} from 'common/models/claimantResponse';

export const buildAddress = (): Address => {
  return new Address('addressLine1', 'addressLine2', 'addressLine3', 'city', 'postCode');
};

export const buildRespondent1 = (): Party => {
  const respondent = new Party();
  respondent.partyDetails = new PartyDetails({});
  respondent.partyDetails.individualTitle = 'Mrs.';
  respondent.partyDetails.individualLastName = 'Mary';
  respondent.partyDetails.individualFirstName = 'Richards';
  respondent.partyDetails.partyName = 'Mrs Richards Mary';
  respondent.partyDetails.contactPerson = 'Mrs Richards Mary';
  respondent.partyPhone = new PartyPhone('0208339922');
  respondent.dateOfBirth = new CitizenDate('2022-01-24T15:59:59');
  respondent.responseType = '';
  respondent.type = PartyType.INDIVIDUAL;
  respondent.partyDetails.primaryAddress = buildAddress();
  respondent.partyDetails.correspondenceAddress = buildAddress();
  return respondent;
};

export const mockClaim = buildMockClaim();

function buildMockClaim(): Claim {
  const _mockClaim: Claim = new Claim();

  _mockClaim.legacyCaseReference = '497MC585';
  _mockClaim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
  _mockClaim.applicant1 = {
    dateOfBirth: {
      day: null,
      month: null,
      year: null,
    },
    partyDetails: {
      individualTitle: 'Mrs',
      individualLastName: 'Clark',
      individualFirstName: 'Jane',
      partyName: 'Mrs Jane Clark',
      primaryAddress: new Address(),
      contactPerson: 'Mrs Jane Clark',
    },
    type: PartyType.INDIVIDUAL,
  };
  _mockClaim.claimantResponse =<ClaimantResponse>{
    ccjRequest: {
      paidAmount: {
        option: YesNo.YES,
        amount: 10,
        totalAmount: 110,
      },
      ccjPaymentOption: {
        type: PaymentOptionType.BY_SET_DATE,
        isCcjPaymentOptionBySetDate() {
          return this.type === PaymentOptionType.BY_SET_DATE;
        },

        isCcjPaymentOptionInstalments() {
          return this.type === PaymentOptionType.INSTALMENTS;
        },
      },
    },
    get isClaimantSuggestedPayByDate(): boolean {
      return this.suggestedPaymentIntention?.paymentOption === PaymentOptionType.IMMEDIATELY;
    }, get isClaimantSuggestedPayByInstalments(): boolean {
      return this.suggestedPaymentIntention?.paymentOption === PaymentOptionType.BY_SET_DATE;
    }, get isClaimantSuggestedPayImmediately(): boolean {
      return this.suggestedPaymentIntention?.paymentOption === PaymentOptionType.INSTALMENTS;
    },
  };
  _mockClaim.evidence = {
    'comment': 'evidence comments',
    'evidenceItem': [new EvidenceItem(EvidenceType.CONTRACTS_AND_AGREEMENTS, 'I have a signed contract showing that you broke the contract agreement.')],
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
    timeline: DefendantTimeline.buildPopulatedForm([new TimelineRow(1, 4, 2022, 'I contacted Mary Richards to discuss building works on our roof.')], 'timeline comments'),
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
  _mockClaim.claimDetails = new ClaimDetails(new Reason('the reason i have given'));
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
    calculatedAmountInPence: 11500,
  };
  _mockClaim.claimInterest = YesNo.YES;
  _mockClaim.claimAmountBreakup = [
    {
      value: {
        claimAmount: '2000',
        claimReason: 'House repair',
      },
    },
  ];

  _mockClaim.interest = {
    interestStartDate: {
      date: new Date('2022-08-21T00:00:00.000Z'),
      year: 2022,
      month: 8,
      day: 21,
      reason: 'test 1',
    },
    interestEndDate: InterestEndDateType.UNTIL_CLAIM_SUBMIT_DATE,
    interestClaimFrom: InterestClaimFromType.FROM_A_SPECIFIC_DATE,
    interestClaimOptions: InterestClaimOptionsType.SAME_RATE_INTEREST,
    sameRateInterestSelection: {
      sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_8_PC,
    },
    breakDownInterestTotal: 500,
  };
  _mockClaim.submittedDate = new Date('2022-05-23T17:02:02.38407');
  _mockClaim.totalInterest = 15;
  _mockClaim.fullAdmission = {
    paymentIntention: {
      paymentDate: new Date('2022-06-01T00:00:00'),
    },
  };
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
    {
      id: '98765432',
      value: {
        createdBy: 'Civil',
        documentLink: {
          document_url: 'http://dm-store:8080/documents/7f092465-658e-4ec1-af30-b5551b5260b4',
          document_filename: 'response_claim_form_000MC001.pdf',
          document_binary_url: 'http://dm-store:8080/documents/7f092465-658e-4ec1-af30-b5551b5260b4/binary',
        },
        documentName: 'response_claim_form_000MC001.pdf',
        documentSize: 33331,
        documentType: DocumentType.DEFENDANT_DEFENCE,
        createdDatetime: new Date('2022-06-22T14:15:19'),
      },
    },
    {
      id: '1234567',
      value: {
        createdBy: 'Civil',
        documentLink: {
          document_url: 'http://dm-store:8080/documents/71582e35-300e-4294-a604-35d8cabc33de',
          document_filename: 'hearing_form_000MC001.pdf',
          document_binary_url: 'http://dm-store:8080/documents/71582e35-300e-4294-a604-35d8cabc33de/binary',
        },
        documentName: 'hearing_form_000MC001.pdf',
        documentSize: 345683,
        documentType: DocumentType.HEARING_FORM,
        createdDatetime: new Date('2022-06-21T14:15:19'),
      },
    },
  ];
  _mockClaim.respondent1ResponseDeadline = new Date('2022-08-20T00:00:00');
  _mockClaim.responseDeadline = {
    option: ResponseOptions.YES,
    additionalTime: AdditionalTimeOptions.MORE_THAN_28_DAYS,
  };

  _mockClaim.isFAPaymentOptionPayImmediately = (): boolean => false;
  _mockClaim.isFAPaymentOptionBySetDate = (): boolean => false;

  return _mockClaim;
}
