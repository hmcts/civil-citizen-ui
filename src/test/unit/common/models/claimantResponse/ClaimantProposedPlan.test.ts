import {
  toCCDClaimantProposedPlan,
  toCCDClaimantRepaymentPlan,
} from 'models/claimantResponse/ClaimantProposedPlan';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {CCDPaymentOption} from 'models/ccdResponse/ccdPaymentOption';
import {CCDRepaymentPlanFrequency} from 'models/ccdResponse/ccdRepaymentPlan';

jest.mock('@hmcts/nodejs-logging', () => {
  const logger = {warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn()};
  return {Logger: {getLogger: () => logger}};
});
const mockLogger = require('@hmcts/nodejs-logging').Logger.getLogger();

describe('ClaimantProposedPlan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('toCCDClaimantRepaymentPlan', () => {
    it('should return formatted firstRepaymentDate and not log warning when firstRepaymentDate is present', () => {
      //When
      const result = toCCDClaimantRepaymentPlan({
        paymentAmount: 50,
        repaymentFrequency: 'MONTH',
        firstRepaymentDate: new Date(2025, 0, 15),
      });
      //Then
      expect(result).toEqual({
        paymentAmount: 5000,
        repaymentFrequency: CCDRepaymentPlanFrequency.ONCE_ONE_MONTH,
        firstRepaymentDate: '2025-01-15',
      });
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('should return undefined firstRepaymentDate and log warning when firstRepaymentDate is missing', () => {
      //When
      const result = toCCDClaimantRepaymentPlan({
        paymentAmount: 50,
        repaymentFrequency: 'MONTH',
      });
      //Then
      expect(result).toEqual({
        paymentAmount: 5000,
        repaymentFrequency: CCDRepaymentPlanFrequency.ONCE_ONE_MONTH,
        firstRepaymentDate: undefined,
      });
      expect(mockLogger.warn).toHaveBeenCalledWith('[toCCDClaimantRepaymentPlan] repaymentPlan.firstRepaymentDate missing, returning undefined');
    });
  });

  describe('toCCDClaimantProposedPlan', () => {
    it('should return all fields undefined and not log warning when suggestedPaymentIntention is undefined', () => {
      //When
      const result = toCCDClaimantProposedPlan(undefined);
      //Then
      expect(result).toEqual({
        repaymentPlanLRspec: undefined,
        proposedRepaymentType: undefined,
        repaymentByDate: undefined,
      });
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('should translate INSTALMENTS repayment plan with undefined repaymentByDate and not log warning', () => {
      //Given
      const suggestedPaymentIntention = new PaymentIntention();
      suggestedPaymentIntention.paymentOption = PaymentOptionType.INSTALMENTS;
      suggestedPaymentIntention.repaymentPlan = {
        paymentAmount: 50,
        repaymentFrequency: 'WEEK',
        firstRepaymentDate: new Date(2025, 0, 15),
      };
      //When
      const result = toCCDClaimantProposedPlan(suggestedPaymentIntention);
      //Then
      expect(result).toEqual({
        repaymentPlanLRspec: {
          paymentAmount: 5000,
          repaymentFrequency: CCDRepaymentPlanFrequency.ONCE_ONE_WEEK,
          firstRepaymentDate: '2025-01-15',
        },
        proposedRepaymentType: CCDPaymentOption.REPAYMENT_PLAN,
        repaymentByDate: undefined,
      });
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('should return formatted repaymentByDate and not log warning when BY_SET_DATE payment date is present', () => {
      //Given
      const suggestedPaymentIntention = new PaymentIntention();
      suggestedPaymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      suggestedPaymentIntention.paymentDate = {date: new Date(2025, 0, 15)} as unknown as Date;
      //When
      const result = toCCDClaimantProposedPlan(suggestedPaymentIntention);
      //Then
      expect(result).toEqual({
        repaymentPlanLRspec: undefined,
        proposedRepaymentType: CCDPaymentOption.BY_SET_DATE,
        repaymentByDate: '2025-01-15',
      });
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('should return undefined repaymentByDate and log warning when BY_SET_DATE payment date is missing', () => {
      //Given
      const suggestedPaymentIntention = new PaymentIntention();
      suggestedPaymentIntention.paymentOption = PaymentOptionType.BY_SET_DATE;
      suggestedPaymentIntention.paymentDate = {date: undefined} as unknown as Date;
      //When
      const result = toCCDClaimantProposedPlan(suggestedPaymentIntention);
      //Then
      expect(result).toEqual({
        repaymentPlanLRspec: undefined,
        proposedRepaymentType: CCDPaymentOption.BY_SET_DATE,
        repaymentByDate: undefined,
      });
      expect(mockLogger.warn).toHaveBeenCalledWith('[toCCDRepaymentDate] suggestedPaymentIntention.paymentDate.date missing, returning undefined');
    });
  });
});
