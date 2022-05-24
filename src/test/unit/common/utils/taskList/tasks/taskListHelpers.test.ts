import {Claim} from '../../../../../../main/common/models/claim';
import {
  financialDetailsShared,
  isCounterpartyCompany,
  isCounterpartyIndividual,
  isNotPayImmediatelyResponse,
  isPaymentOptionMissing,
  isRepaymentPlanMissing,
  isStatementOfMeansComplete,
} from '../../../../../../main/common/utils/taskList/tasks/taskListHelpers';
import {CounterpartyType} from '../../../../../../main/common/models/counterpartyType';
import {Respondent} from '../../../../../../main/common/models/respondent';

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

    it('should return true if payment option is blank', () => {
      caseData.paymentOption = '';
      expect(isNotPayImmediatelyResponse(caseData)).toEqual(true);
    });

    it('should return true if payment option is invalid', () => {
      caseData.paymentOption = 'foo';
      expect(isNotPayImmediatelyResponse(caseData)).toEqual(true);
    });

    it('should return true if payment option is INSTALMENTS', () => {
      caseData.paymentOption = 'INSTALMENTS';
      expect(isNotPayImmediatelyResponse(caseData)).toEqual(true);
    });

    it('should return true if payment option is BY_SET_DATE', () => {
      caseData.paymentOption = 'BY_SET_DATE';
      expect(isNotPayImmediatelyResponse(caseData)).toEqual(true);
    });

    it('should return false if payment option is IMMEDIATELY', () => {
      caseData.paymentOption = 'IMMEDIATELY';
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

    it('should return true if paymentOption is blank', () => {
      caseData.paymentOption = '';
      expect(isPaymentOptionMissing(caseData)).toEqual(true);
    });

    it('should return false if paymentOption is set', () => {
      caseData.paymentOption = 'validPaymentOption';
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
});
