import {Claim} from '../../../../../../main/common/models/claim';
import {
  financialDetailsShared,
  hasContactPersonAndCompanyPhone,
  hasCorrespondenceAndPrimaryAddress,
  hasDateOfBirthIfIndividual,
  isCounterpartyCompany,
  isCounterpartyIndividual,
  isFullDefenceAndNotCounterClaim,
  isNotPayImmediatelyResponse,
  isPaymentOptionMissing,
  isRepaymentPlanMissing,
  isStatementOfMeansComplete,
} from '../../../../../../main/common/utils/taskList/tasks/taskListHelpers';
import {PartyType} from '../../../../../../main/common/models/partyType';
import {Party} from '../../../../../../main/common/models/party';
import {PaymentOptionType} from '../../../../../../main/common/form/models/admission/paymentOption/paymentOptionType';
import {Mediation} from '../../../../../../main/common/models/mediation/mediation';
import {CompanyTelephoneNumber} from '../../../../../../main/common/form/models/mediation/companyTelephoneNumber';
import {ResponseType} from '../../../../../../main/common/form/models/responseType';
import {RejectAllOfClaim} from '../../../../../../main/common/form/models/rejectAllOfClaim';
import {RejectAllOfClaimType} from '../../../../../../main/common/form/models/rejectAllOfClaimType';
import {YesNo} from '../../../../../../main/common/form/models/yesNo';
import {PartyDetails} from '../../../../../../main/common/form/models/partyDetails';
import {CitizenDate} from '../../../../../../main/common/form/models/claim/claimant/citizenDate';
import {Address} from '../../../../../../main/common/form/models/address';

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

    it('should return true if repayment plan is not set', () => {
      caseData.repaymentPlan = undefined;
      expect(isRepaymentPlanMissing(caseData)).toEqual(true);
    });

    it('should return false if repayment plan object is set', () => {
      caseData.repaymentPlan = {};
      expect(isRepaymentPlanMissing(caseData)).toEqual(false);
    });

    it('should return false if repayment plan object is set', () => {
      caseData.repaymentPlan = {
        paymentAmount: 800,
      };
      expect(isRepaymentPlanMissing(caseData)).toEqual(false);
    });
  });

  describe('isNotPayImmediatelyResponse helper', () => {
    it('should return true if there is no payment option', () => {
      expect(isNotPayImmediatelyResponse(caseData)).toEqual(true);
    });

    it('should return true if payment option is undefined', () => {
      caseData.paymentOption = undefined;
      expect(isNotPayImmediatelyResponse(caseData)).toEqual(true);
    });

    it('should return true if payment option is INSTALMENTS', () => {
      caseData.paymentOption = PaymentOptionType.INSTALMENTS;
      expect(isNotPayImmediatelyResponse(caseData)).toEqual(true);
    });

    it('should return true if payment option is BY_SET_DATE', () => {
      caseData.paymentOption = PaymentOptionType.BY_SET_DATE;
      expect(isNotPayImmediatelyResponse(caseData)).toEqual(true);
    });

    it('should return false if payment option is IMMEDIATELY', () => {
      caseData.paymentOption = PaymentOptionType.IMMEDIATELY;
      expect(isNotPayImmediatelyResponse(caseData)).toEqual(false);
    });
  });

  describe('isPaymentOptionMissing helper', () => {
    it('should return true if there is no paymentOption', () => {
      expect(isPaymentOptionMissing(caseData)).toEqual(true);
    });

    it('should return true if paymentOption is undefined', () => {
      caseData.paymentOption = undefined;
      expect(isPaymentOptionMissing(caseData)).toEqual(true);
    });

    it('should return false if paymentOption is set', () => {
      caseData.paymentOption = PaymentOptionType.IMMEDIATELY;
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
