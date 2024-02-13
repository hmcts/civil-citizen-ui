import {Claim} from 'common/models/claim';
import {
  financialDetailsShared,
  hasContactPersonAndCompanyPhone,
  hasClaimantResponseContactPersonAndCompanyPhone,
  hasCorrespondenceAndPrimaryAddress,
  hasDateOfBirthIfIndividual,
  isCounterpartyCompany,
  isCounterpartyIndividual,
  isFullAdmissionRepaymentPlanMissing,
  isFullDefenceAndNotCounterClaim,
  isNotPayImmediatelyResponse,
  isPaymentOptionMissing,
  isRepaymentPlanMissing,
  isStatementOfMeansComplete,
  isPaymentOptionExisting, hasAllCarmRequiredFields,
} from 'common/utils/taskList/tasks/taskListHelpers';
import {PartyType} from 'common/models/partyType';
import {Party} from 'common/models/party';
import {PaymentOptionType} from 'common/form/models/admission/paymentOption/paymentOptionType';
import {Mediation} from 'common/models/mediation/mediation';
import {CompanyTelephoneNumber} from 'common/form/models/mediation/companyTelephoneNumber';
import {ResponseType} from 'common/form/models/responseType';
import {RejectAllOfClaim} from 'common/form/models/rejectAllOfClaim';
import {RejectAllOfClaimType} from 'common/form/models/rejectAllOfClaimType';
import {YesNo} from 'common/form/models/yesNo';
import {PartyDetails} from 'common/form/models/partyDetails';
import {CitizenDate} from 'common/form/models/claim/claimant/citizenDate';
import {Address} from 'common/form/models/address';
import {FullAdmission} from 'common/models/fullAdmission';
import {PaymentIntention} from 'common/form/models/admission/paymentIntention';
import {PartialAdmission} from 'common/models/partialAdmission';
import {HowMuchDoYouOwe} from 'common/form/models/admission/partialAdmission/howMuchDoYouOwe';
import {ClaimantResponse} from 'common/models/claimantResponse';

const mockClaim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
const mockRespondent: Party = {
  dateOfBirth: {date: new Date('2000-12-12'), year: 1985, month: 2, day: 2},
  responseType: '',
  partyPhone: {phone: ''},
  partyDetails: {
    individualLastName: '',
    individualFirstName: '',
    individualTitle: '',
    primaryAddress: new Address('', '', '', '', ''),
    correspondenceAddress: new Address(),
  },
  type: PartyType.ORGANISATION,
};

describe('Task List Helpers', () => {
  let caseData: Claim;

  beforeEach(() => {
    caseData = new Claim();
  });

  describe('hasAllCarmRequiredFields Method', () => {
    it('should return false if respondent is organisation without contact Person', () => {
      mockRespondent.type = PartyType.ORGANISATION;
      expect(hasAllCarmRequiredFields(mockRespondent)).toEqual(false);
    });
    it('should return true if respondent is organisation without contact Person', () => {
      mockRespondent.type = PartyType.ORGANISATION;
      mockRespondent.partyDetails.contactPerson = 'test';
      expect(hasAllCarmRequiredFields(mockRespondent)).toEqual(true);
    });
    it('should return true if respondent is different of organisation', () => {
      mockRespondent.type = PartyType.INDIVIDUAL;
      expect(hasAllCarmRequiredFields(mockRespondent)).toEqual(true);
    });
  });

  describe('isCounterpartyCompany helper', () => {
    it('should return true if counterparty is organisation', () => {
      mockRespondent.type = PartyType.ORGANISATION;
      expect(isCounterpartyCompany(mockRespondent)).toEqual(true);
    });

    it('should return true if counterparty is company', () => {
      mockRespondent.type = PartyType.COMPANY;
      expect(isCounterpartyCompany(mockRespondent)).toEqual(true);
    });

    it('should return false if counterparty is individual', () => {
      mockRespondent.type = PartyType.INDIVIDUAL;
      expect(isCounterpartyCompany(mockRespondent)).toEqual(false);
    });

    it('should return false if counterparty is sole trader', () => {
      mockRespondent.type = PartyType.SOLE_TRADER;
      expect(isCounterpartyCompany(mockRespondent)).toEqual(false);
    });
  });

  describe('isCounterpartyIndividual helper', () => {
    it('should return false if counterparty is organisation', () => {
      mockRespondent.type = PartyType.ORGANISATION;
      expect(isCounterpartyIndividual(mockRespondent)).toEqual(false);
    });

    it('should return false if counterparty is company', () => {
      mockRespondent.type = PartyType.COMPANY;
      expect(isCounterpartyIndividual(mockRespondent)).toEqual(false);
    });

    it('should return true if counterparty is individual', () => {
      mockRespondent.type = PartyType.INDIVIDUAL;
      expect(isCounterpartyIndividual(mockRespondent)).toEqual(true);
    });

    it('should return true if counterparty is sole trader', () => {
      mockRespondent.type = PartyType.SOLE_TRADER;
      expect(isCounterpartyIndividual(mockRespondent)).toEqual(true);
    });
  });

  describe('isStatementOfMeansComplete helper', () => {
    it('should return true if statement of means is set', () => {
      caseData = {...mockClaim.case_data};
      expect(isStatementOfMeansComplete(caseData)).toEqual(true);
    });

    it('should return true if statement of means has more than one property set', () => {
      caseData.statementOfMeans = {
        numberOfChildrenLivingWithYou: 0,
        employment: {
          declared: false,
          employmentType: [],
        },
      };
      expect(isStatementOfMeansComplete(caseData)).toEqual(true);
    });

    it('should return false if statement of means is not set', () => {
      expect(isStatementOfMeansComplete(caseData)).toEqual(false);
    });

    it('should return false if statement of means has only one property set', () => {
      caseData.statementOfMeans = {
        explanation: {
          text: 'explanation',
        },
      };
      expect(isStatementOfMeansComplete(caseData)).toEqual(false);
    });
  });

  describe('isRepaymentPlanMissing helper', () => {
    it('should return true if there is no repayment plan', () => {
      expect(isRepaymentPlanMissing(caseData)).toEqual(true);
    });

    it('should return true if there is no repayment plan for full admit', () => {
      expect(isFullAdmissionRepaymentPlanMissing(caseData)).toEqual(true);
    });

    it('should return true if repayment plan is not set for part admit journey', () => {
      caseData.partialAdmission = new PartialAdmission();
      caseData.partialAdmission.paymentIntention = new PaymentIntention();
      caseData.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe();
      caseData.partialAdmission.paymentIntention.repaymentPlan = undefined;
      expect(isRepaymentPlanMissing(caseData)).toEqual(true);
    });

    it('should return true if repayment plan is not set for full admit journey', () => {
      caseData.fullAdmission = new FullAdmission();
      caseData.fullAdmission.paymentIntention = new PaymentIntention();
      caseData.fullAdmission.paymentIntention.repaymentPlan = undefined;
      expect(isFullAdmissionRepaymentPlanMissing(caseData)).toEqual(true);
    });

    it('should return false if repayment plan object is set for part admit', () => {
      mockRespondent.responseType = ResponseType.PART_ADMISSION;
      caseData.partialAdmission = new PartialAdmission();
      caseData.partialAdmission.paymentIntention = new PaymentIntention();
      caseData.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe();
      caseData.partialAdmission.paymentIntention.repaymentPlan = {};
      expect(isRepaymentPlanMissing(caseData)).toEqual(false);
    });

    it('should return false if repayment plan object is set for full admit', () => {
      mockRespondent.responseType = ResponseType.FULL_ADMISSION;
      caseData.fullAdmission = new FullAdmission();
      caseData.fullAdmission.paymentIntention = new PaymentIntention();
      caseData.fullAdmission.paymentIntention.repaymentPlan = {};
      expect(isFullAdmissionRepaymentPlanMissing(caseData)).toEqual(false);
    });

    it('should return false if repayment plan object is set', () => {
      mockRespondent.responseType = ResponseType.PART_ADMISSION;
      caseData.partialAdmission = new PartialAdmission();
      caseData.partialAdmission.paymentIntention = new PaymentIntention();
      caseData.partialAdmission.howMuchDoYouOwe = new HowMuchDoYouOwe();
      caseData.partialAdmission.paymentIntention.repaymentPlan = {
        paymentAmount: 800,
      };
      expect(isRepaymentPlanMissing(caseData)).toEqual(false);
    });

    it('should return false if repayment plan object is set for full admit', () => {
      mockRespondent.responseType = ResponseType.FULL_ADMISSION;
      caseData.fullAdmission = new FullAdmission();
      caseData.fullAdmission.paymentIntention = new PaymentIntention();
      caseData.fullAdmission.paymentIntention.repaymentPlan = {
        paymentAmount: 800,
      };
      expect(isFullAdmissionRepaymentPlanMissing(caseData)).toEqual(false);
    });
  });

  describe('isNotPayImmediatelyResponse helper', () => {
    it('should return true if there is no payment option', () => {
      expect(isNotPayImmediatelyResponse(caseData)).toEqual(true);
    });

    it('should return true if payment option is undefined - FULL_ADMISSION', () => {
      caseData.respondent1 = <Party>{responseType: ResponseType.FULL_ADMISSION};
      caseData.fullAdmission = new FullAdmission();
      expect(isNotPayImmediatelyResponse(caseData)).toEqual(true);
    });

    it('should return true if payment option is INSTALMENTS - FULL_ADMISSION', () => {
      caseData.respondent1 = <Party>{responseType: ResponseType.FULL_ADMISSION};
      caseData.fullAdmission = new FullAdmission();
      caseData.fullAdmission.paymentIntention = new PaymentIntention();
      caseData.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
      expect(isNotPayImmediatelyResponse(caseData)).toEqual(true);
    });

    it('should return false if payment option is IMMEDIATELY - FULL_ADMISSION', () => {
      caseData.respondent1 = <Party>{responseType: ResponseType.FULL_ADMISSION};
      caseData.fullAdmission = new FullAdmission();
      caseData.fullAdmission.paymentIntention = new PaymentIntention();
      caseData.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
      expect(isNotPayImmediatelyResponse(caseData)).toEqual(false);
    });

    it('should return true if payment option is undefined - PART_ADMISSION', () => {
      caseData.respondent1 = <Party>{responseType: ResponseType.PART_ADMISSION};
      caseData.partialAdmission = new PartialAdmission();
      expect(isNotPayImmediatelyResponse(caseData)).toEqual(true);
    });

    it('should return true if payment option is INSTALMENTS - PART_ADMISSION', () => {
      caseData.respondent1 = <Party>{responseType: ResponseType.PART_ADMISSION};
      caseData.partialAdmission = new FullAdmission();
      caseData.partialAdmission.paymentIntention = new PaymentIntention();
      caseData.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
      expect(isNotPayImmediatelyResponse(caseData)).toEqual(true);
    });

    it('should return false if payment option is IMMEDIATELY - PART_ADMISSION', () => {
      caseData.respondent1 = <Party>{responseType: ResponseType.PART_ADMISSION};
      caseData.partialAdmission = new PartialAdmission();
      caseData.partialAdmission.paymentIntention = new PaymentIntention();
      caseData.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
      expect(isNotPayImmediatelyResponse(caseData)).toEqual(false);
    });
  });

  describe('isPaymentOptionExisting helper', () => {
    it('should return false if there is no payment option', () => {
      expect(isPaymentOptionExisting(caseData)).toEqual(false);
    });

    it('should return false if payment option is undefined - FULL_ADMISSION', () => {
      caseData.respondent1 = <Party>{responseType: ResponseType.FULL_ADMISSION};
      caseData.fullAdmission = new FullAdmission();
      caseData.fullAdmission.paymentIntention = new PaymentIntention();
      expect(isPaymentOptionExisting(caseData)).toEqual(false);
    });

    it('should return true if payment option is existing - FULL_ADMISSION', () => {
      caseData.respondent1 = <Party>{responseType: ResponseType.FULL_ADMISSION};
      caseData.fullAdmission = new FullAdmission();
      caseData.fullAdmission.paymentIntention = new PaymentIntention();
      caseData.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
      expect(isPaymentOptionExisting(caseData)).toEqual(true);
    });

    it('should return false if payment option is undefined - PART_ADMISSION', () => {
      caseData.respondent1 = <Party>{responseType: ResponseType.PART_ADMISSION};
      caseData.partialAdmission = new PartialAdmission();
      caseData.partialAdmission.paymentIntention = new PaymentIntention();
      expect(isPaymentOptionExisting(caseData)).toEqual(false);
    });

    it('should return true if payment option is IMMEDIATELY- PART_ADMISSION', () => {
      caseData.respondent1 = <Party>{responseType: ResponseType.PART_ADMISSION};
      caseData.partialAdmission = new PartialAdmission();
      caseData.partialAdmission.paymentIntention = new PaymentIntention();
      caseData.partialAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
      expect(isPaymentOptionExisting(caseData)).toEqual(true);
    });
  });

  describe('isPaymentOptionMissing helper', () => {
    it('should return true if there is no paymentOption', () => {
      expect(isPaymentOptionMissing(caseData)).toEqual(true);
    });

    it('should return true if paymentOption is undefined', () => {
      caseData.fullAdmission = new FullAdmission();
      caseData.fullAdmission.paymentIntention = new PaymentIntention();
      caseData.fullAdmission.paymentIntention .paymentOption = undefined;
      expect(isPaymentOptionMissing(caseData)).toEqual(true);
    });

    it('should return false if paymentOption is set', () => {
      caseData.fullAdmission = new FullAdmission();
      caseData.fullAdmission.paymentIntention = new PaymentIntention();
      caseData.fullAdmission.paymentIntention.paymentOption = PaymentOptionType.IMMEDIATELY;
      expect(isPaymentOptionMissing(caseData)).toEqual(false);
    });
  });

  describe('financialDetailsShared helper', () => {
    it('should return false if financial details are not set', () => {
      expect(financialDetailsShared(caseData)).toEqual(false);
    });

    it('should return false if financial details are undefined', () => {
      caseData.taskSharedFinancialDetails = undefined;
      expect(financialDetailsShared(caseData)).toEqual(false);
    });

    it('should return false if financial details are set to false', () => {
      caseData.taskSharedFinancialDetails = false;
      expect(financialDetailsShared(caseData)).toEqual(false);
    });

    it('should return true if financial details are set to true', () => {
      caseData.taskSharedFinancialDetails = true;
      expect(financialDetailsShared(caseData)).toEqual(true);
    });
  });

  describe('hasContactPersonAndCompanyPhone helper', () => {
    it('should return false if companyTelephoneNumber are not set', () => {
      expect(hasContactPersonAndCompanyPhone(caseData)).toEqual(false);
    });

    it('should return false if contact person are not set', () => {
      caseData.mediation = new Mediation();
      caseData.mediation.companyTelephoneNumber = new CompanyTelephoneNumber();
      caseData.mediation.companyTelephoneNumber.mediationPhoneNumber = '123';
      expect(hasContactPersonAndCompanyPhone(caseData)).toEqual(false);
    });

    it('should return false if mediation phone are not set', () => {
      caseData.mediation = new Mediation();
      caseData.mediation.companyTelephoneNumber = new CompanyTelephoneNumber();
      caseData.mediation.companyTelephoneNumber.mediationContactPerson = 'test';
      expect(hasContactPersonAndCompanyPhone(caseData)).toEqual(false);
    });

    it('should return true if contact person and mediation phone are set', () => {
      caseData.mediation = new Mediation();
      caseData.mediation.companyTelephoneNumber = new CompanyTelephoneNumber();
      caseData.mediation.companyTelephoneNumber.mediationContactPerson = 'test';
      caseData.mediation.companyTelephoneNumber.mediationPhoneNumber = '123';
      expect(hasContactPersonAndCompanyPhone(caseData)).toEqual(true);
    });
  });

  describe('hasClaimantResponseContactPersonAndCompanyPhone helper', () => {
    it('should return false if companyTelephoneNumber are not set', () => {
      caseData.claimantResponse = new ClaimantResponse();
      expect(hasClaimantResponseContactPersonAndCompanyPhone(caseData)).toEqual(false);
    });
    it('should return true if contact person and mediation phone are set', () => {
      caseData.claimantResponse = new ClaimantResponse();
      caseData.claimantResponse.mediation = new Mediation();
      caseData.claimantResponse.mediation.companyTelephoneNumber = new CompanyTelephoneNumber();
      caseData.claimantResponse.mediation.companyTelephoneNumber.mediationContactPerson = 'test';
      caseData.claimantResponse.mediation.companyTelephoneNumber.mediationPhoneNumber = '123';
      expect(hasClaimantResponseContactPersonAndCompanyPhone(caseData)).toEqual(true);
    });
  });

  describe('isFullDefenceAndNotCounterClaim helper', () => {
    it('should return false if is not fullDefence', () => {
      caseData.respondent1 = new Party();
      caseData.respondent1.responseType = ResponseType.FULL_ADMISSION;
      expect(isFullDefenceAndNotCounterClaim(caseData)).toEqual(false);
    });

    it('should return false if rejectAllOfClaim is a counter claim', () => {
      caseData.rejectAllOfClaim = new RejectAllOfClaim();
      caseData.rejectAllOfClaim.option = RejectAllOfClaimType.COUNTER_CLAIM;
      expect(isFullDefenceAndNotCounterClaim(caseData)).toEqual(false);
    });

    it('should return true if is FullDefence And Not a CounterClaim', () => {
      caseData.respondent1 = new Party();
      caseData.respondent1.responseType = ResponseType.FULL_DEFENCE;
      caseData.rejectAllOfClaim = new RejectAllOfClaim();
      caseData.rejectAllOfClaim.option = RejectAllOfClaimType.ALREADY_PAID;
      expect(isFullDefenceAndNotCounterClaim(caseData)).toEqual(true);
    });
  });

  describe('hasDateOfBirthIfIndividual helper', () => {
    it('should return false if individual', () => {
      caseData.respondent1 = new Party();
      caseData.respondent1.type = PartyType.INDIVIDUAL;
      expect(hasDateOfBirthIfIndividual(caseData.respondent1)).toEqual(false);
    });

    it('should return true if individual and has dateOfBirth', () => {
      caseData.respondent1 = new Party();
      caseData.respondent1.type = PartyType.INDIVIDUAL;
      caseData.respondent1.dateOfBirth = new CitizenDate('1', '1', '2000');
      expect(hasDateOfBirthIfIndividual(caseData.respondent1)).toEqual(true);
    });

    it('should return true if is not individual', () => {
      caseData.respondent1 = new Party();
      caseData.respondent1.type = PartyType.ORGANISATION;
      expect(hasDateOfBirthIfIndividual(caseData.respondent1)).toEqual(true);
    });
  });

  describe('hasCorrespondenceAndPrimaryAddress helper', () => {
    const address = new Address('test', 'test', 'test', 'test', 'test');

    it('should return false if only has primaryAdress', () => {
      caseData.respondent1 = new Party();
      caseData.respondent1.partyDetails = new PartyDetails({});
      caseData.respondent1.partyDetails.primaryAddress = address;
      expect(hasCorrespondenceAndPrimaryAddress(caseData.respondent1)).toEqual(false);
    });

    it('should return false if has primaryAdress, YES and doesnt has correspondenceAdress', () => {
      caseData.respondent1 = new Party();
      caseData.respondent1.partyDetails = new PartyDetails({});
      caseData.respondent1.partyDetails.primaryAddress = address;
      caseData.respondent1.partyDetails.postToThisAddress = YesNo.YES;
      expect(hasCorrespondenceAndPrimaryAddress(caseData.respondent1)).toEqual(false);
    });

    it('should return true if has primaryAdress and NO', () => {
      caseData.respondent1 = new Party();
      caseData.respondent1.partyDetails = new PartyDetails({});
      caseData.respondent1.partyDetails.primaryAddress = new Address('test', 'test', 'test', 'test', 'test');
      caseData.respondent1.partyDetails.postToThisAddress = YesNo.NO;
      expect(hasCorrespondenceAndPrimaryAddress(caseData.respondent1)).toEqual(true);
    });

    it('should return true if has primaryAdress, YES and has correspondenceAdress', () => {
      caseData.respondent1 = new Party();
      caseData.respondent1.partyDetails = new PartyDetails({});
      caseData.respondent1.partyDetails.primaryAddress = address;
      caseData.respondent1.partyDetails.correspondenceAddress = address;
      caseData.respondent1.partyDetails.postToThisAddress = YesNo.YES;
      expect(hasCorrespondenceAndPrimaryAddress(caseData.respondent1)).toEqual(true);
    });
  });
});
