import {Claim} from 'common/models/claim';
import {
  CaseState,
  InterestClaimFromType,
  InterestEndDateType,
  SameRateInterestType,
} from 'common/form/models/claimDetails';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {YesNo} from 'common/form/models/yesNo';
import {Dependants} from 'common/form/models/statementOfMeans/dependants/dependants';
import civilClaimResponseApplicantCompany from '../../../utils/mocks/civilClaimResponseApplicantCompanyMock.json';
import civilClaimResponseApplicantIndividual from '../../../utils/mocks/civilClaimResponseApplicanIndividualMock.json';
import {ResponseType} from 'common/form/models/responseType';
import {PartyType} from 'common/models/partyType';
import {PartialAdmission} from 'common/models/partialAdmission';
import {Party} from 'common/models/party';
import {HowMuchDoYouOwe} from 'common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {mockClaim} from '../../../utils/mockClaim';
import {DocumentType} from 'common/models/document/documentType';
import {GenericYesNo} from 'common/form/models/genericYesNo';
import {RejectAllOfClaim} from 'common/form/models/rejectAllOfClaim';
import {RejectAllOfClaimType} from 'common/form/models/rejectAllOfClaimType';
import {
  HowMuchHaveYouPaid,
  HowMuchHaveYouPaidParams,
} from 'common/form/models/admission/howMuchHaveYouPaid';
import {WhyDoYouDisagree} from 'common/form/models/admission/partialAdmission/whyDoYouDisagree';
import {Defence} from 'common/form/models/defence';
import {ClaimResponseStatus} from 'common/models/claimResponseStatus';
import {InterestClaimOptionsType} from 'common/form/models/claim/interest/interestClaimOptionsType';
import {DirectionQuestionnaire} from 'common/models/directionsQuestionnaire/directionQuestionnaire';
import {Hearing} from 'common/models/directionsQuestionnaire/hearing/hearing';
import {Address} from 'common/form/models/address';
import {FullAdmission} from 'common/models/fullAdmission';
import {claimType} from 'form/models/claimType';
import {Experts} from 'common/models/directionsQuestionnaire/experts/experts';
import {ExpertDetails} from 'models/directionsQuestionnaire/experts/expertDetails';
import {ExpertDetailsList} from 'common/models/directionsQuestionnaire/experts/expertDetailsList';
import {CaseProgressionHearing, CaseProgressionHearingDocuments} from 'models/caseProgression/caseProgressionHearing';

jest.mock('../../../../main/modules/i18n/languageService', ()=> ({
  getLanguage: jest.fn(),
}));

describe('Claim isInterestEnDateUntilSubmitDate', () => {
  const claim = new Claim();
  it('should return undefined', () => {
    //When
    const result = claim.isInterestEndDateUntilSubmitDate();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true', () => {
    //Given
    claim.interest = {
      interestEndDate: InterestEndDateType.UNTIL_CLAIM_SUBMIT_DATE,
    };
    //When
    const result = claim.isInterestEndDateUntilSubmitDate();
    //Then
    expect(result).toBeTruthy;
  });
  it('should return false', () => {
    //Given
    claim.interest = {
      interestEndDate: InterestEndDateType.UNTIL_SETTLED_OR_JUDGEMENT_MADE,
    };
    //When
    const result = claim.isInterestEndDateUntilSubmitDate();
    //Then
    expect(result).toBeFalsy();
  });
});
describe('Claim isInterestFromClaimSubmitDate', () => {
  const claim = new Claim();
  it('should return undefined', () => {
    //When
    const result = claim.isInterestFromClaimSubmitDate();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true', () => {
    //Given
    claim.interest = {interestClaimFrom: InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE};
    //When
    const result = claim.isInterestFromClaimSubmitDate();
    //Then
    expect(result).toBeTruthy;
  });
  it('should return false', () => {
    //Given
    claim.interest = {interestClaimFrom: InterestClaimFromType.FROM_A_SPECIFIC_DATE};
    //When
    const result = claim.isInterestFromClaimSubmitDate();
    //Then
    expect(result).toBeFalsy();
  });
});

describe('Claim isInterestFromASpecificDate', () => {
  const claim = new Claim();
  it('should return undefined', () => {
    //When
    const result = claim.isInterestFromASpecificDate();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true', () => {
    //Given
    claim.interest = {interestClaimFrom: InterestClaimFromType.FROM_A_SPECIFIC_DATE};
    //When
    const result = claim.isInterestFromASpecificDate();
    //Then
    expect(result).toBeTruthy;
  });
  it('should return false', () => {
    //Given
    claim.interest = {interestClaimFrom: InterestClaimFromType.FROM_CLAIM_SUBMIT_DATE};
    //When
    const result = claim.isInterestFromASpecificDate();
    //Then
    expect(result).toBeFalsy();
  });
});

describe('Claim isInterestClaimOptionsSameRateInterest', () => {
  const claim = new Claim();
  it('should return undefined', () => {
    //When
    const result = claim.isInterestClaimOptionsSameRateInterest();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true', () => {
    //Given
    claim.interest = {interestClaimOptions: InterestClaimOptionsType.SAME_RATE_INTEREST};
    //When
    const result = claim.isInterestClaimOptionsSameRateInterest();
    //Then
    expect(result).toBeTruthy;
  });
  it('should return false', () => {
    //Given
    claim.interest = {interestClaimOptions: InterestClaimOptionsType.BREAK_DOWN_INTEREST};
    //When
    const result = claim.isInterestClaimOptionsSameRateInterest();
    //Then
    expect(result).toBeFalsy();
  });
});

describe('Claim isSameRateTypeEightPercent', () => {
  const claim = new Claim();
  it('should return undefined', () => {
    //When
    const result = claim.isSameRateTypeEightPercent();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true', () => {
    //Given
    claim.interest = {sameRateInterestSelection: {sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_8_PC}};
    //When
    const result = claim.isSameRateTypeEightPercent();
    //Then
    expect(result).toBeTruthy;
  });
  it('should return false', () => {
    //Given
    claim.interest = {sameRateInterestSelection: {sameRateInterestType: SameRateInterestType.SAME_RATE_INTEREST_DIFFERENT_RATE}};
    //When
    const result = claim.isSameRateTypeEightPercent();
    //Then
    expect(result).toBeFalsy();
  });
});

describe('Claim isDefendantDisabled', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isDefendantDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty statementOfMeans', () => {
    //Given
    claim.statementOfMeans = new StatementOfMeans();
    //When
    const result = claim.isDefendantDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty disability', () => {
    //Given
    claim.statementOfMeans.disability = new GenericYesNo();
    //When
    const result = claim.isDefendantDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with "no" option', () => {
    //Given
    claim.statementOfMeans.disability.option = YesNo.NO;
    //When
    const result = claim.isDefendantDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true with "yes" option', () => {
    //Given
    claim.statementOfMeans.disability.option = YesNo.YES;
    //When
    const result = claim.isDefendantDisabled();
    //Then
    expect(result).toBeTruthy;
  });
});

describe('Claim isDefendantSeverlyDisabled', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isDefendantSeverelyDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty statementOfMeans', () => {
    //Given
    claim.statementOfMeans = new StatementOfMeans();
    //When
    const result = claim.isDefendantSeverelyDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty severe disability', () => {
    //Given
    claim.statementOfMeans.severeDisability = new GenericYesNo();
    //When
    const result = claim.isDefendantSeverelyDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with "no" option', () => {
    //Given
    claim.statementOfMeans.severeDisability.option = YesNo.NO;
    //When
    const result = claim.isDefendantSeverelyDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true with "yes" option', () => {
    //Given
    claim.statementOfMeans.severeDisability.option = YesNo.YES;
    //When
    const result = claim.isDefendantSeverelyDisabled();
    //Then
    expect(result).toBeTruthy();
  });
});

describe('Claim isPartnerDisabled', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isPartnerDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty statementOfMeans', () => {
    //Given
    claim.statementOfMeans = new StatementOfMeans();
    //When
    const result = claim.isPartnerDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty partrner disability', () => {
    //Given
    claim.statementOfMeans.partnerDisability = new GenericYesNo();
    //When
    const result = claim.isPartnerDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with "no" option', () => {
    //Given
    claim.statementOfMeans.partnerDisability.option = YesNo.NO;
    //When
    const result = claim.isPartnerDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty cohabiting ', () => {
    //Given
    claim.statementOfMeans.cohabiting = new GenericYesNo();
    //When
    const result = claim.isPartnerDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with no partner ', () => {
    //Given
    claim.statementOfMeans.cohabiting.option = YesNo.NO;
    //When
    const result = claim.isPartnerDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with not disabled partner', () => {
    //Given
    claim.statementOfMeans.partnerDisability.option = YesNo.NO;
    claim.statementOfMeans.cohabiting.option = YesNo.YES;
    //When
    const result = claim.isPartnerDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true with "yes" option', () => {
    //Given
    claim.statementOfMeans.partnerDisability.option = YesNo.YES;
    claim.statementOfMeans.cohabiting.option = YesNo.YES;
    //When
    const result = claim.isPartnerDisabled();
    //Then
    expect(result).toBeTruthy();
  });
});

describe('Claim isChildrenDisabled', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty statementOfMeans', () => {
    //Given
    claim.statementOfMeans = new StatementOfMeans();
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty partrner disability', () => {
    //Given
    claim.statementOfMeans.childrenDisability = new GenericYesNo();
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with undefined option', () => {
    //Given
    claim.statementOfMeans.childrenDisability.option = undefined;
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with "no" option', () => {
    //Given
    claim.statementOfMeans.childrenDisability.option = YesNo.NO;
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with empty Dependants', () => {
    //Given
    claim.statementOfMeans.dependants = new Dependants();
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with declared is undefined ', () => {
    //Given
    claim.statementOfMeans.dependants.declared = undefined;
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with no children ', () => {
    //Given
    claim.statementOfMeans.dependants.declared = false;
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return false with not disabled children ', () => {
    //Given
    claim.statementOfMeans.dependants.declared = true;
    claim.statementOfMeans.childrenDisability.option = YesNo.NO;
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeFalsy();
  });
  it('should return true with "yes" option', () => {
    //Given
    claim.statementOfMeans.childrenDisability.option = YesNo.YES;
    claim.statementOfMeans.dependants.declared = true;
    //When
    const result = claim.isChildrenDisabled();
    //Then
    expect(result).toBeTruthy();
  });
});

describe('Claim get claimant and defendant names by type', () => {
  const claimCompany = Object.assign(new Claim(), JSON.parse(JSON.stringify(civilClaimResponseApplicantCompany)).case_data);
  const claimIndividual = Object.assign(new Claim(), JSON.parse(JSON.stringify(civilClaimResponseApplicantIndividual)).case_data);
  it('should return claimantName for INDIVIDUAL', () => {
    //When
    const result = claimIndividual.getClaimantFullName();
    //Then
    expect(result).toBe('Mr. Jan Clark');
  });
  it('should return claimantName for COMPANY', () => {
    //When
    const result = claimCompany.getClaimantFullName();
    //Then
    expect(result).toBe('Version 1');
  });
  it('should return defendantName for INDIVIDUAL', () => {
    //When
    const result = claimIndividual.getDefendantFullName();
    //Then
    expect(result).toBe('Mr. Joe Doe');
  });
  it('should return defendantName for COMPANY', () => {
    //When
    const result = claimCompany.getDefendantFullName();
    //Then
    expect(result).toBe('Google');
  });
});

describe('Claim isFullAdmission', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isFullAdmission();
    //Then
    expect(result).toBe(false);
  });
  it('should return false without respondent details', () => {
    //Given
    claim.respondent1 = new Party();
    //When
    const result = claim.isFullAdmission();
    //Then
    expect(result).toBe(false);
  });
  it('should return false with partial admission', () => {
    //Given
    claim.respondent1 = {
      responseType: ResponseType.PART_ADMISSION,
      partyDetails: {primaryAddress: new Address()},
      type: PartyType.INDIVIDUAL,
    };
    //When
    const result = claim.isFullAdmission();
    //Then
    expect(result).toBe(false);
  });
  it('should return false with full rejection', () => {
    //Given
    claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
    //When
    const result = claim.isFullAdmission();
    //Then
    expect(result).toBe(false);
  });
  it('should return true with full admission', () => {
    //Given
    claim.respondent1.responseType = ResponseType.FULL_ADMISSION;
    //When
    const result = claim.isFullAdmission();
    //Then
    expect(result).toBe(true);
  });
});

describe('Claim isPartialAdmission', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isPartialAdmission();
    //Then
    expect(result).toBe(false);
  });
  it('should return false without respondent details', () => {
    //Given
    claim.respondent1 = new Party();
    //When
    const result = claim.isPartialAdmission();
    //Then
    expect(result).toBe(false);
  });
  it('should return false with full admission', () => {
    //Given
    claim.respondent1 = {
      responseType: ResponseType.FULL_ADMISSION,
      partyDetails: {primaryAddress: new Address()},
      type: PartyType.INDIVIDUAL,
    };
    //When
    const result = claim.isPartialAdmission();
    //Then
    expect(result).toBe(false);
  });
  it('should return false with full rejection', () => {
    //Given
    claim.respondent1.responseType = ResponseType.FULL_DEFENCE;
    //When
    const result = claim.isPartialAdmission();
    //Then
    expect(result).toBe(false);
  });
  it('should return true with part admission', () => {
    //Given
    claim.respondent1.responseType = ResponseType.PART_ADMISSION;
    //When
    const result = claim.isPartialAdmission();
    //Then
    expect(result).toBe(true);
  });
});

describe('Claim isFullAdmissionPaymentOptionExists', () => {
  const claim = new Claim();
  claim.fullAdmission = new FullAdmission();
  claim.fullAdmission.paymentIntention = new PaymentIntention();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isFullAdmissionPaymentOptionExists();
    //Then
    expect(result).toBe(false);
  });
  it('should return false with empty payment option', () => {
    //Given
    claim.fullAdmission.paymentIntention.paymentOption = undefined;
    //When
    const result = claim.isFullAdmissionPaymentOptionExists();
    //Then
    expect(result).toBe(false);
  });
  it('should return true with payment option', () => {
    //Given
    claim.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
    //When
    const result = claim.isFullAdmissionPaymentOptionExists();
    //Then
    expect(result).toBe(true);
  });
});

describe('Claim isPAPaymentOptionPayImmediately', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isPAPaymentOptionPayImmediately();
    //Then
    expect(result).toBe(false);
  });
  it('should return false with empty partial admission', () => {
    //Given
    claim.partialAdmission = new PartialAdmission();
    //When
    const result = claim.isPAPaymentOptionPayImmediately();
    //Then
    expect(result).toBe(false);
  });
  it('should return false with empty payment intention', () => {
    //Given
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    //When
    const result = claim.isPAPaymentOptionPayImmediately();
    //Then
    expect(result).toBe(false);
  });
  it('should return false with part admit empty payment option', () => {
    //Given
    claim.partialAdmission.paymentIntention.paymentOption = undefined;
    //When
    const result = claim.isPAPaymentOptionPayImmediately();
    //Then
    expect(result).toBe(false);
  });
  it('should return true with payment option', () => {
    //Given
    claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
    //When
    const result = claim.isPAPaymentOptionPayImmediately();
    //Then
    expect(result).toBe(true);
  });
});

describe('Claim isPAPaymentOptionInstallments', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isPAPaymentOptionInstallments();
    //Then
    expect(result).toBe(false);
  });
  it('should return false with empty partial admission', () => {
    //Given
    claim.partialAdmission = new PartialAdmission();
    //When
    const result = claim.isPAPaymentOptionInstallments();
    //Then
    expect(result).toBe(false);
  });
  it('should return false with empty payment intention', () => {
    //Given
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    //When
    const result = claim.isPAPaymentOptionInstallments();
    //Then
    expect(result).toBe(false);
  });
  it('should return false with part admit empty payment option', () => {
    //Given
    claim.partialAdmission.paymentIntention.paymentOption = undefined;
    //When
    const result = claim.isPAPaymentOptionInstallments();
    //Then
    expect(result).toBe(false);
  });
  it('should return true with payment option', () => {
    //Given
    claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
    //When
    const result = claim.isPAPaymentOptionInstallments();
    //Then
    expect(result).toBe(true);
  });
});

describe('Claim isPAPaymentOptionByDate', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isPAPaymentOptionByDate();
    //Then
    expect(result).toBe(false);
  });
  it('should return false with empty partial admission', () => {
    //Given
    claim.partialAdmission = new PartialAdmission();
    //When
    const result = claim.isPAPaymentOptionByDate();
    //Then
    expect(result).toBe(false);
  });
  it('should return false with empty payment intention', () => {
    //Given
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    //When
    const result = claim.isPAPaymentOptionByDate();
    //Then
    expect(result).toBe(false);
  });
  it('should return false with part admit empty payment option', () => {
    //Given
    claim.partialAdmission.paymentIntention.paymentOption = undefined;
    //When
    const result = claim.isPAPaymentOptionByDate();
    //Then
    expect(result).toBe(false);
  });
  it('should return true with payment option', () => {
    //Given
    claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
    //When
    const result = claim.isPAPaymentOptionByDate();
    //Then
    expect(result).toBe(true);
  });
});

describe('Claim isPartialAdmissionPaymentOptionExists', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isPartialAdmissionPaymentOptionExists();
    //Then
    expect(result).toBe(false);
  });
  it('should return false with empty partial admission', () => {
    //Given
    claim.partialAdmission = new PartialAdmission();
    //When
    const result = claim.isPartialAdmissionPaymentOptionExists();
    //Then
    expect(result).toBe(false);
  });
  it('should return false with empty payment intention', () => {
    //Given
    claim.partialAdmission.paymentIntention = new PaymentIntention();
    //When
    const result = claim.isPartialAdmissionPaymentOptionExists();
    //Then
    expect(result).toBe(false);
  });
  it('should return false with part admit empty payment option', () => {
    //Given
    claim.partialAdmission.paymentIntention.paymentOption = undefined;
    //When
    const result = claim.isPartialAdmissionPaymentOptionExists();
    //Then
    expect(result).toBe(false);
  });
  it('should return true with payment option', () => {
    //Given
    claim.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
    //When
    const result = claim.isPartialAdmissionPaymentOptionExists();
    //Then
    expect(result).toBe(true);
  });
});

describe('Claim partialAdmissionPaymentAmount', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.partialAdmissionPaymentAmount();
    //Then
    expect(result).toBeUndefined();
  });
  it('should return false with empty partial admission', () => {
    //Given
    claim.partialAdmission = new PartialAdmission();
    //When
    const result = claim.partialAdmissionPaymentAmount();
    //Then
    expect(result).toBeUndefined();
  });
  it('should return false with part admit empty HowMuchDoYouOwe', () => {
    //Given
    claim.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe();
    //When
    const result = claim.partialAdmissionPaymentAmount();
    //Then
    expect(result).toBeUndefined();
  });
  it('should return existing amount', () => {
    //Given
    claim.partialAdmission.howMuchDoYouOwe.amount = 55;
    //When
    const result = claim.partialAdmissionPaymentAmount();
    //Then
    expect(result).toEqual(55);
  });

  it('should return false with part admit empty HowMuchHaveYouPaid', () => {
    //Given
    claim.partialAdmission.howMuchHaveYouPaid = new HowMuchHaveYouPaid({});
    //When
    const result = claim.partialAdmissionPaidAmount();
    //Then
    expect(result).toBeUndefined();
  });
  it('should return existing amount paid', () => {
    //Given
    const howMuchHaveYouPaid = new HowMuchHaveYouPaid(
      {
        amount: 150,
        totalClaimAmount: 1000,
        year: '2022',
        month: '2',
        day: '10',
        text: 'Some text',
      },
    );
    claim.partialAdmission.howMuchHaveYouPaid = howMuchHaveYouPaid;
    //When
    const result = claim.partialAdmissionPaidAmount();
    //Then
    expect(result).toEqual(150);
  });
});

describe('Claim Reject - Dispute', () => {
  const claim = new Claim();
  it('should be undefined with empty claim', () => {
    //When
    const result = claim.isRejectAllOfClaimDispute();
    //Then
    expect(result).toBeUndefined;
  });
  it('should return false with empty RejectAllOfClaim', () => {
    //Given
    claim.rejectAllOfClaim = new RejectAllOfClaim();
    //When
    const result = claim.isRejectAllOfClaimDispute();
    //Then
    expect(result).toBe(false);
  });

  it('should return true when RejectAllOfClaim is Dispute', () => {
    //Given
    claim.rejectAllOfClaim = new RejectAllOfClaim(
      RejectAllOfClaimType.DISPUTE,
      new HowMuchHaveYouPaid(),
      new WhyDoYouDisagree(''),
      new Defence(),
    );
    //When
    const result = claim.isRejectAllOfClaimDispute();
    //Then
    expect(result).toBe(true);
  });
});

describe('Claim Reject All', () => {
  const claim = new Claim();
  it('should return false with empty claim', () => {
    //When
    const result = claim.isRejectAllOfClaimAlreadyPaid();
    //Then
    expect(result).toBeUndefined();
  });
  it('should return false with part admit empty RejectAllOfClaim', () => {
    //Given
    claim.rejectAllOfClaim = new RejectAllOfClaim();
    //When
    const result = claim.isRejectAllOfClaimAlreadyPaid();
    //Then
    expect(result).toBeUndefined();
  });
  it('should return existing amount when paying less', () => {
    //Given
    const howMuchHaveYouPaidParams: HowMuchHaveYouPaidParams = {
      amount: 120,
      totalClaimAmount: 1000,
      year: '2022',
      month: '2',
      day: '14',
      text: 'Some text here...',
    };
    claim.rejectAllOfClaim = new RejectAllOfClaim(
      RejectAllOfClaimType.ALREADY_PAID,
      new HowMuchHaveYouPaid(howMuchHaveYouPaidParams),
      new WhyDoYouDisagree(''),
      new Defence(),
    );
    //When
    const result = claim.isRejectAllOfClaimAlreadyPaid();
    //Then
    expect(result).toEqual(120);
    expect(ClaimResponseStatus.RC_PAID_LESS).toBe('REJECT_CLAIM_PAID_LESS_CLAIM');
  });
  it('should return existing amount when paying equal', () => {
    //Given
    const howMuchHaveYouPaidParams: HowMuchHaveYouPaidParams = {
      amount: 1000,
      totalClaimAmount: 1000,
      year: '2022',
      month: '2',
      day: '14',
      text: 'Some text here...',
    };
    claim.rejectAllOfClaim = new RejectAllOfClaim(
      RejectAllOfClaimType.ALREADY_PAID,
      new HowMuchHaveYouPaid(howMuchHaveYouPaidParams),
      new WhyDoYouDisagree(''),
      new Defence(),
    );
    //When
    const result = claim.isRejectAllOfClaimAlreadyPaid();
    //Then
    expect(result).toEqual(1000);
    expect(ClaimResponseStatus.RC_PAID_FULL).toBe('REJECT_CLAIM_PAID_FULL_CLAIM');
  });
});

describe('Documents', () => {
  const emptyDocumentDetails = {
    document_url: '',
    document_binary_url: '',
    document_filename: '',
  };
  // const emptyDocumentDetails = {
  //   timelineEventUpload: [
  //     <TimeLineDocument>{
  //       id: '6f5daf35-e492-4f89-891c-bbd948263653',
  //       value: {},
  //     },
  //   ],
  // };
  const documentDetails = {
    document_url: 'http://dm-store:8080/documents/74bf213e-72dd-4908-9e08-72fefaed9c5c',
    document_filename: 'timeline-event-summary.pdf',
    document_binary_url: 'http://dm-store:8080/documents/74bf213e-72dd-4908-9e08-72fefaed9c5c/binary',
  };
  // const documentDetails = {
  //   timelineEventUpload: [
  //     <TimeLineDocument>{
  //       id: '6f5daf35-e492-4f89-891c-bbd948263653',
  //       value: <DocumentWithCategory>{
  //         category_id: 'detailsOfClaim',
  //         document_url: 'http://dm-store-demo.service.core-compute-demo.internal/documents/74bf213e-72dd-4908-9e08-72fefaed9c5c',
  //         document_filename: 'timeline-event-summary.pdf',
  //         document_binary_url: 'http://dm-store-demo.service.core-compute-demo.internal/documents/74bf213e-72dd-4908-9e08-72fefaed9c5c/binary'
  //       },
  //     },
  //   ],
  // };

  describe('extractDocumentId', () => {
    const claim = new Claim();
    it('should return undefined with empty claim', () => {
      //When
      const result = claim.extractDocumentId();
      //Then
      expect(result).toBeUndefined;
    });
    it('should return undefined with empty document details', () => {
      //Given
      claim.specClaimTemplateDocumentFiles = emptyDocumentDetails;
      // claim.servedDocumentFiles = emptyDocumentDetails;
      //When
      const result = claim.extractDocumentId();
      //Then
      expect(result).toBeUndefined;
    });
    it('should return document id with existing document details  ', () => {
      //Given
      claim.specClaimTemplateDocumentFiles = documentDetails;
      // claim.servedDocumentFiles = documentDetails;
      //When
      const result = claim.extractDocumentId();
      //Then
      expect(result).toBe('74bf213e-72dd-4908-9e08-72fefaed9c5c');
    });
  });

  describe('generatePdfFileName', () => {
    const claim = new Claim();
    it('should return only case reference number with empty document details', () => {
      // Given
      claim.legacyCaseReference = '000MC009';
      claim.specClaimTemplateDocumentFiles = emptyDocumentDetails;
      // claim.servedDocumentFiles = emptyDocumentDetails;
      //When
      const result = claim.generatePdfFileName();
      //Then
      expect(result).toContain('000MC009');
    });
    it('should return file name with case number and declared file name', () => {
      // Given
      claim.specClaimTemplateDocumentFiles = documentDetails;
      // claim.servedDocumentFiles = documentDetails;
      //When
      const result = claim.generatePdfFileName();
      //Then
      expect(result).toBe('000MC009-timeline-event-summary.pdf');
    });
  });

  describe('isSystemGeneratedCaseDocumentsAvailable', () => {

    it('should return false with empty claim', () => {
      //Given
      const claim = new Claim();
      //When
      const result = claim.isSystemGeneratedCaseDocumentsAvailable();
      //Then
      expect(result).toBeFalsy();
    });
    it('should return true with proper document details', () => {
      //Given
      const claim = mockClaim;
      //When
      const result = claim.isSystemGeneratedCaseDocumentsAvailable();
      //Then
      expect(result).toBeTruthy();
    });
  });

  describe('getDocumentDetails', () => {
    it('should return undefined with empty claim', () => {
      //Given
      const claim = new Claim();
      //When
      const result = claim.getDocumentDetails(DocumentType.SEALED_CLAIM);
      //Then
      expect(result).toBeUndefined;
    });
    it('should return document details  ', () => {
      //Given
      const claim = mockClaim;
      //When
      const result = claim.getDocumentDetails(DocumentType.SEALED_CLAIM);
      //Then
      expect(result).toBe(mockClaim.systemGeneratedCaseDocuments[0].value);
    });
  });

  describe('isDefendantNotResponded', () => {
    const claim = new Claim();
    it('should return false with empty claim', () => {
      //When
      const result = claim.isDefendantNotResponded();
      //Then
      expect(result).toBe(false);
    });
    it('should return false with other case states', () => {
      //Given
      claim.ccdState = CaseState.PENDING_CASE_ISSUED;
      //When
      const result = claim.isDefendantNotResponded();
      //Then
      expect(result).toBe(false);
    });
    it('should return true with case state AWAITING_RESPONDENT_ACKNOWLEDGEMENT', () => {
      //Given
      claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
      //When
      const result = claim.isDefendantNotResponded();
      //Then
      expect(result).toBe(true);
    });
  });

  describe('isBusiness', () => {
    const claim = new Claim();
    it('should return false with empty claim', () => {
      //When
      const result = claim.isBusiness();
      //Then
      expect(result).toBe(false);
    });
    it('should return false with individual type', () => {
      //Given
      claim.respondent1 = new Party();
      claim.respondent1.type = PartyType.INDIVIDUAL;
      //When
      const result = claim.isBusiness();
      //Then
      expect(result).toBe(false);
    });
    it('should return true with sole trader', () => {
      //Given
      claim.respondent1 = new Party();
      claim.respondent1.type = PartyType.SOLE_TRADER;
      //When
      const result = claim.isBusiness();
      //Then
      expect(result).toBe(false);
    });
    it('should return true with company type', () => {
      //Given
      claim.respondent1 = new Party();
      claim.respondent1.type = PartyType.COMPANY;
      //When
      const result = claim.isBusiness();
      //Then
      expect(result).toBe(true);
    });
    it('should return true with organisation trader', () => {
      //Given
      claim.respondent1 = new Party();
      claim.respondent1.type = PartyType.ORGANISATION;
      //When
      const result = claim.isBusiness();
      //Then
      expect(result).toBe(true);
    });
  });

  describe('Claim formattedTotalClaimAmount', () => {
    const claim = new Claim();
    it('should return empty string', () => {
      //When
      const result = claim.formattedTotalClaimAmount();
      //Then
      expect(result).toBe('');
    });
    it('should return formatted amount', () => {
      //Given
      claim.totalClaimAmount = 1000;
      //When
      const result = claim.formattedTotalClaimAmount();
      //Then
      expect(result).toBe('£1,000.00');
    });
  });

  describe('hasSupportRequiredList', () => {
    const claim = new Claim();
    it('should return false with empty claim', () => {
      //When
      const result = claim.hasSupportRequiredList;
      //Then
      expect(result).toBe(false);
    });
    it('should return false with empty directionQuestionnaire', () => {
      //Given
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      //When
      const result = claim.hasSupportRequiredList;
      //Then
      expect(result).toBe(false);
    });
    it('should return false with empty hearing', () => {
      //Given
      claim.directionQuestionnaire.hearing = new Hearing();
      //When
      const result = claim.hasSupportRequiredList;
      //Then
      expect(result).toBe(false);
    });
    it('should return true with details', () => {
      //Given
      claim.directionQuestionnaire.hearing.supportRequiredList = {option: YesNo.YES};
      //When
      const result = claim.hasSupportRequiredList;
      //Then
      expect(result).toBe(true);
    });
  });

  describe('isSupportRequiredYes', () => {
    const claim = new Claim();
    it('should return false with empty claim', () => {
      //When
      const result = claim.isSupportRequiredYes;
      //Then
      expect(result).toBe(false);
    });
    it('should return false with empty directionQuestionnaire', () => {
      //Given
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      //When
      const result = claim.isSupportRequiredYes;
      //Then
      expect(result).toBe(false);
    });
    it('should return false with empty hearing', () => {
      //Given
      claim.directionQuestionnaire.hearing = new Hearing();
      //When
      const result = claim.isSupportRequiredYes;
      //Then
      expect(result).toBe(false);
    });
    it('should return false with "no" option', () => {
      //Given
      claim.directionQuestionnaire.hearing.supportRequiredList = {option: YesNo.NO};
      //When
      const result = claim.isSupportRequiredYes;
      //Then
      expect(result).toBe(false);
    });
    it('should return true with "yes" option', () => {
      //Given
      claim.directionQuestionnaire.hearing.supportRequiredList = {option: YesNo.YES};
      //When
      const result = claim.isSupportRequiredYes;
      //Then
      expect(result).toBe(true);
    });
  });

  describe('isSupportRequiredDetailsAvailable', () => {
    const claim = new Claim();
    it('should return false with empty claim', () => {
      //When
      const result = claim.isSupportRequiredDetailsAvailable;
      //Then
      expect(result).toBe(false);
    });
    it('should return false with empty directionQuestionnaire', () => {
      //Given
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      //When
      const result = claim.isSupportRequiredDetailsAvailable;
      //Then
      expect(result).toBe(false);
    });
    it('should return false with empty hearing', () => {
      //Given
      claim.directionQuestionnaire.hearing = new Hearing();
      //When
      const result = claim.isSupportRequiredDetailsAvailable;
      //Then
      expect(result).toBe(false);
    });
    it('should return false with empty items', () => {
      //Given
      claim.directionQuestionnaire.hearing.supportRequiredList = {
        option: YesNo.YES,
        items: [],
      };
      //When
      const result = claim.isSupportRequiredDetailsAvailable;
      //Then
      expect(result).toBe(false);
    });
    it('should return true with item details', () => {
      //Given
      claim.directionQuestionnaire.hearing.supportRequiredList = {
        option: YesNo.YES,
        items: [{
          fullName: 'John Doe',
        }],
      };
      //When
      const result = claim.isSupportRequiredDetailsAvailable;
      //Then
      expect(result).toBe(true);
    });
  });
  describe('Identify if its a SMALL or FAST_TRACK claim', () => {
    const claim = new Claim();
    it('Its a small claim', () => {
      //Given
      claim.totalClaimAmount = 10000;
      //when Then
      expect(claim.claimType).toEqual(claimType.SMALL_CLAIM);
      expect(claim.isFastTrackClaim).toBe(false);
    });
    it('Its a fast track claim', () => {
      //Given
      claim.totalClaimAmount = 11000;
      //when Then
      expect(claim.claimType).toEqual(claimType.FAST_TRACK_CLAIM);
      expect(claim.isFastTrackClaim).toBe(true);
    });
  });
  describe('hasExpertDetails', () => {
    let claim: Claim;
    beforeEach(() => {
      claim = new Claim;
      claim.directionQuestionnaire = new DirectionQuestionnaire();
      claim.directionQuestionnaire.experts = new Experts();

    });
    it('should return true when expert evidence is yes and expert detail list is not empty', () => {
      //Given
      claim.directionQuestionnaire.experts.expertEvidence = new GenericYesNo(YesNo.YES);
      claim.directionQuestionnaire.experts.expertDetailsList = new ExpertDetailsList([new ExpertDetails('John', 'Smith')]);
      //Then
      expect(claim.hasExpertDetails()).toBeTruthy();
    });
    it('should return false when expert evidence is yes but expert details list is empty', () => {
      //Given
      claim.directionQuestionnaire.experts.expertEvidence = new GenericYesNo(YesNo.YES);
      //Then
      expect(claim.hasExpertDetails()).toBeFalsy();
    });
    it('should return false when expert evidence is no', () => {
      //Given
      claim.directionQuestionnaire.experts.expertEvidence = new GenericYesNo(YesNo.NO);
      //Then
      expect(claim.hasExpertDetails()).toBeFalsy();
    });
    it('should return false when claim is empty', () => {
      //Given
      claim = new Claim();
      //Then
      expect(claim.hasExpertDetails()).toBeFalsy();
    });
  });

  describe('test of method hasCaseProgressionHearingDocuments', () => {
    it('should return true when have hasCaseProgressionHearingDocuments', () => {
      //Given
      const caseProgressionHearing = new CaseProgressionHearing([getCaseProgressionDocuments()], null, null, null);
      const claim = new Claim();
      claim.caseProgressionHearing = caseProgressionHearing;
      //Then
      expect(claim.hasCaseProgressionHearingDocuments()).toBeTruthy();
    });
    it('should return false when have hasCaseProgressionHearingDocuments', () => {
      //Given
      const claim = new Claim();
      //Then
      expect(claim.hasCaseProgressionHearingDocuments()).toBeFalsy();
    });
    it('should return formatted date 3 weeks prior from 22', () => {
      //Given
      const caseProgressionHearing = new CaseProgressionHearing([getCaseProgressionDocuments()], null, new Date(2023, 0 ,22), null);
      const claim = new Claim();
      claim.caseProgressionHearing = caseProgressionHearing;
      //Then
      expect('1 January 2023').toEqual(claim.bundleStitchingDeadline);
    });
  });
  function getCaseProgressionDocuments() {
    const caseProgressionHearingDocuments = new CaseProgressionHearingDocuments();
    caseProgressionHearingDocuments.id = '1221';
    caseProgressionHearingDocuments.value = {
      'createdBy': 'Civil',
      'documentLink': {
        'document_url': 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6',
        'document_filename': 'hearing_small_claim_000MC110.pdf',
        'document_binary_url': 'http://dm-store:8080/documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6/binary',
      },
      'documentName': 'hearing_small_claim_000MC110.pdf',
      'documentSize': 56461,
      documentType: DocumentType.HEARING_FORM,
      createdDatetime: new Date('2022-06-21T14:15:19'),
    };
    return caseProgressionHearingDocuments;
  }
});
