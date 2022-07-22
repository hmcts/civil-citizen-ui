import {Claim} from '../../../../../../main/common/models/claim';
import {
  financialDetailsShared,
  hasContactPersonAndCompanyPhone,
  isCounterpartyCompany,
  isCounterpartyIndividual,
  isFullDefenceAndNotCounterClaim,
  isNotPayImmediatelyResponse,
  isPaymentOptionMissing,
  isRepaymentPlanMissing,
  isStatementOfMeansComplete,
} from '../../../../../../main/common/utils/taskList/tasks/taskListHelpers';
import {CounterpartyType} from '../../../../../../main/common/models/counterpartyType';
import {Respondent} from '../../../../../../main/common/models/respondent';
import PaymentOptionType from '../../../../../../main/common/form/models/admission/paymentOption/paymentOptionType';
import {Mediation} from '../../../../../../main/common/models/mediation/mediation';
import {CompanyTelephoneNumber} from '../../../../../../main/common/form/models/mediation/companyTelephoneNumber';
import {ResponseType} from '../../../../../../main/common/form/models/responseType';
import {RejectAllOfClaim} from '../../../../../../main/common/form/models/rejectAllOfClaim';
import RejectAllOfClaimType from '../../../../../../main/common/form/models/rejectAllOfClaimType';

const mockClaim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
const mockRespondent: Respondent = {
  dateOfBirth: new Date(),
  responseType: '',
  telephoneNumber: '',
  individualLastName: '',
  individualFirstName: '',
  individualTitle: '',
  primaryAddress: {
    PostCode: '',
    PostTown: '',
    AddressLine1: '',
    AddressLine2: '',
    AddressLine3: '',
  },
  correspondenceAddress: {},
  type: CounterpartyType.ORGANISATION,
};

describe('Task List Helpers', () => {
  let caseData: Claim;

  beforeEach(() => {
    caseData = new Claim();
  });

  describe('isCounterpartyCompany helper', () => {
    it('should return true if counterparty is organisation', () => {
      mockRespondent.type = CounterpartyType.ORGANISATION;
      expect(isCounterpartyCompany(mockRespondent)).toEqual(true);
    });

    it('should return true if counterparty is company', () => {
      mockRespondent.type = CounterpartyType.COMPANY;
      expect(isCounterpartyCompany(mockRespondent)).toEqual(true);
    });

    it('should return false if counterparty is individual', () => {
      mockRespondent.type = CounterpartyType.INDIVIDUAL;
      expect(isCounterpartyCompany(mockRespondent)).toEqual(false);
    });

    it('should return false if counterparty is sole trader', () => {
      mockRespondent.type = CounterpartyType.SOLE_TRADER;
      expect(isCounterpartyCompany(mockRespondent)).toEqual(false);
    });
  });

  describe('isCounterpartyIndividual helper', () => {
    it('should return false if counterparty is organisation', () => {
      mockRespondent.type = CounterpartyType.ORGANISATION;
      expect(isCounterpartyIndividual(mockRespondent)).toEqual(false);
    });

    it('should return false if counterparty is company', () => {
      mockRespondent.type = CounterpartyType.COMPANY;
      expect(isCounterpartyIndividual(mockRespondent)).toEqual(false);
    });

    it('should return true if counterparty is individual', () => {
      mockRespondent.type = CounterpartyType.INDIVIDUAL;
      expect(isCounterpartyIndividual(mockRespondent)).toEqual(true);
    });

    it('should return true if counterparty is sole trader', () => {
      mockRespondent.type = CounterpartyType.SOLE_TRADER;
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
      caseData.respondent1 = new Respondent();
      caseData.respondent1.responseType = ResponseType.FULL_ADMISSION;
      expect(isFullDefenceAndNotCounterClaim(caseData)).toEqual(false);
    });

    it('should return false if rejectAllOfClaim is a counter claim', () => {
      caseData.rejectAllOfClaim = new RejectAllOfClaim();
      caseData.rejectAllOfClaim.option = RejectAllOfClaimType.COUNTER_CLAIM;
      expect(isFullDefenceAndNotCounterClaim(caseData)).toEqual(false);
    });
    
    it('should return true if is FullDefence And Not a CounterClaim', () => {
      caseData.respondent1 = new Respondent();
      caseData.respondent1.responseType = ResponseType.FULL_DEFENCE;
      caseData.rejectAllOfClaim = new RejectAllOfClaim();
      caseData.rejectAllOfClaim.option = RejectAllOfClaimType.ALREADY_PAID;
      expect(isFullDefenceAndNotCounterClaim(caseData)).toEqual(true);
    });
  });
});
