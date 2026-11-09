import {
  toCCDClaimantProposedPlan,
  toCCDClaimantRepaymentPlan,
} from 'models/claimantResponse/ClaimantProposedPlan';
import {PaymentIntention} from 'form/models/admission/paymentIntention';
import {PaymentOptionType} from 'form/models/admission/paymentOption/paymentOptionType';
import {CCDPaymentOption} from 'models/ccdResponse/ccdPaymentOption';
import {CCDRepaymentPlanFrequency} from 'models/ccdResponse/ccdRepaymentPlan';

describe('toCCDClaimantRepaymentPlan', () => {
  it('should return undefined when the repayment plan is undefined', () => {
    expect(toCCDClaimantRepaymentPlan(undefined)).toBeUndefined();
  });

  it('should translate the repayment plan to CCD', () => {
    const result = toCCDClaimantRepaymentPlan({
      paymentAmount: 50,
      repaymentFrequency: 'WEEK',
      firstRepaymentDate: new Date('2026-12-01'),
    });

    expect(result).toEqual({
      paymentAmount: 5000,
      repaymentFrequency: CCDRepaymentPlanFrequency.ONCE_ONE_WEEK,
      firstRepaymentDate: '2026-12-01',
    });
  });

  it('should translate the repayment plan without first repayment date to CCD with undefined firstRepaymentDate', () => {
    const result = toCCDClaimantRepaymentPlan({
      paymentAmount: 50,
      repaymentFrequency: 'WEEK',
    });

    expect(result?.firstRepaymentDate).toBeUndefined();
  });

  it('should translate an empty repayment plan to CCD with all fields undefined', () => {
    const result = toCCDClaimantRepaymentPlan({});

    expect(result).toEqual({
      paymentAmount: undefined,
      repaymentFrequency: undefined,
      firstRepaymentDate: undefined,
    });
  });
});

describe('toCCDClaimantProposedPlan', () => {
  it('should translate pay by set date payment intention to CCD', () => {
    const paymentIntention = {
      paymentOption: PaymentOptionType.BY_SET_DATE,
      paymentDate: {date: new Date('2026-12-01')},
    } as unknown as PaymentIntention;

    const result = toCCDClaimantProposedPlan(paymentIntention);

    expect(result).toEqual({
      repaymentPlanLRspec: undefined,
      proposedRepaymentType: CCDPaymentOption.BY_SET_DATE,
      repaymentByDate: '2026-12-01',
    });
  });

  it('should translate pay by set date payment intention without date to CCD with undefined repaymentByDate', () => {
    const paymentIntention = {
      paymentOption: PaymentOptionType.BY_SET_DATE,
      paymentDate: {},
    } as unknown as PaymentIntention;

    const result = toCCDClaimantProposedPlan(paymentIntention);

    expect(result.repaymentByDate).toBeUndefined();
  });

  it('should translate instalments payment intention to CCD with undefined repaymentByDate', () => {
    const paymentIntention = {
      paymentOption: PaymentOptionType.INSTALMENTS,
      repaymentPlan: {
        paymentAmount: 50,
        repaymentFrequency: 'MONTH',
        firstRepaymentDate: new Date('2026-12-01'),
      },
    } as PaymentIntention;

    const result = toCCDClaimantProposedPlan(paymentIntention);

    expect(result).toEqual({
      repaymentPlanLRspec: {
        paymentAmount: 5000,
        repaymentFrequency: CCDRepaymentPlanFrequency.ONCE_ONE_MONTH,
        firstRepaymentDate: '2026-12-01',
      },
      proposedRepaymentType: CCDPaymentOption.REPAYMENT_PLAN,
      repaymentByDate: undefined,
    });
  });

  it('should translate payment intention without payment option to CCD with all fields undefined', () => {
    const result = toCCDClaimantProposedPlan({} as PaymentIntention);

    expect(result).toEqual({
      repaymentPlanLRspec: undefined,
      proposedRepaymentType: undefined,
      repaymentByDate: undefined,
    });
  });

  it('should translate undefined payment intention to CCD with all fields undefined', () => {
    const result = toCCDClaimantProposedPlan(undefined as unknown as PaymentIntention);

    expect(result).toEqual({
      repaymentPlanLRspec: undefined,
      proposedRepaymentType: undefined,
      repaymentByDate: undefined,
    });
  });
});
